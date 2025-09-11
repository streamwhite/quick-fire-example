import { expect, test } from '@playwright/test';
import { BASE_URL, DOC_WATCH_TIMEOUT } from './constants';

interface DocumentData {
  id?: string;
  [key: string]: unknown;
}

interface DocumentWithId {
  id: string;
  data: DocumentData;
}

interface DocumentUpdate {
  docId: string;
  property: string;
  updatedTo: string | number;
  watchedValue: string | number;
  valuesMatch: boolean;
}

test.describe('FirestoreFunctionsPage', () => {
  // Set a longer timeout for the entire test since we're dealing with multiple documents
  test.setTimeout(120000);

  test('should watch documents and verify property updates', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // Start watching documents
    const watchDocsButton = page.getByTestId('watch-docs');
    await expect(watchDocsButton).toBeVisible();
    await watchDocsButton.click({ force: true });

    // Wait for initial documents data with increased timeout
    const docsDataElement = page.getByTestId('watch-docs-current-data');
    await expect(docsDataElement).toBeVisible({ timeout: DOC_WATCH_TIMEOUT });
    const initialDocsData = await docsDataElement.textContent();
    const initialDocs = JSON.parse(initialDocsData || '[]') as DocumentWithId[];

    // Calculate total timeout based on number of documents
    const totalTimeout = Math.max(
      30000,
      initialDocs.length * DOC_WATCH_TIMEOUT
    );

    // Wait for updates to be processed and verified
    await expect(async () => {
      const updatesElement = page.getByTestId('watch-docs-updates');
      await expect(updatesElement).toBeVisible({ timeout: DOC_WATCH_TIMEOUT });

      const updatesText = await updatesElement.textContent();
      const updates = JSON.parse(updatesText || '[]') as DocumentUpdate[];

      // Verify we have updates for all documents
      expect(updates.length).toEqual(initialDocs.length);

      // Verify each update
      updates.forEach((update) => {
        expect(update).toHaveProperty('docId');
        expect(update).toHaveProperty('property');
        expect(update).toHaveProperty('updatedTo');
        expect(update).toHaveProperty('watchedValue');
        expect(update).toHaveProperty('valuesMatch');
        expect(update.valuesMatch).toBe(true);
        expect(update.updatedTo).toEqual(update.watchedValue);

        // Verify the property type
        const value = update.updatedTo;
        expect(typeof value === 'string' || typeof value === 'number').toBe(
          true
        );
      });
    }).toPass({
      timeout: totalTimeout,
      intervals: [2000], // Check every 2 seconds
    });

    // Get final documents state
    const finalDocsData = await docsDataElement.textContent();
    const finalDocs = JSON.parse(finalDocsData || '[]') as DocumentWithId[];

    // Verify the updates in the final documents state
    const updatesElement = page.getByTestId('watch-docs-updates');
    const updatesText = await updatesElement.textContent();
    const updates = JSON.parse(updatesText || '[]') as DocumentUpdate[];

    updates.forEach((update) => {
      const updatedDoc = finalDocs.find(
        (doc: DocumentWithId) => doc.id === update.docId
      );
      expect(updatedDoc).toBeDefined();
      expect((updatedDoc as unknown as DocumentData)[update.property]).toEqual(
        update.updatedTo
      );
    });
  });
});
