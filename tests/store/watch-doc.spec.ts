import { expect, test } from '@playwright/test';
import { BASE_URL, DOC_WATCH_TIMEOUT } from './constants';

test.describe('FirestoreFunctionsPage', () => {
  test('should verify watched value matches updated value', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // Click the watch document button to start watching
    const watchDocButton = page.getByTestId('watch-doc');
    await expect(watchDocButton).toBeVisible();
    await watchDocButton.click({ force: true });

    // Wait for comparison data to be available and valid
    await expect(async () => {
      const comparisonDataElement = page.getByTestId(
        'watch-doc-comparison-data'
      );
      await expect(comparisonDataElement).toBeVisible();

      const comparisonText = await comparisonDataElement.textContent();
      const comparisonData = JSON.parse(comparisonText || '{}');

      expect(comparisonData).toHaveProperty('updatedTo');
      expect(comparisonData).toHaveProperty('receivedInWatch');
      expect(comparisonData).toHaveProperty('valuesMatch');
      expect(comparisonData.valuesMatch).toBe(true);
      expect(comparisonData.updatedTo).toBeDefined();
      expect(comparisonData.receivedInWatch).toBeDefined();
      expect(comparisonData.updatedTo).toEqual(comparisonData.receivedInWatch);
    }).toPass({
      timeout: DOC_WATCH_TIMEOUT,
    });

    // Final verification of the data
    const comparisonDataElement = page.getByTestId('watch-doc-comparison-data');
    const comparisonText = await comparisonDataElement.textContent();
    const comparisonData = JSON.parse(comparisonText || '{}');

    // Log the comparison data for debugging
    console.log('Final comparison data:', comparisonData);

    // Verify the final state
    expect(comparisonData.valuesMatch).toBe(true);
    expect(comparisonData.updatedTo).toEqual(comparisonData.receivedInWatch);

    // Verify the type of the values based on the possible types
    const value = comparisonData.updatedTo;
    expect(typeof value === 'string' || typeof value === 'number').toBe(true);
  });
});
