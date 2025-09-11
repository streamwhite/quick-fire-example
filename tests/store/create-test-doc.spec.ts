import { expect, test } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('Create Test Document for Update Operations', () => {
  test('should create test document for update operations', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // Find the create document button
    const createDocButton = page.getByTestId('create-document');
    await expect(createDocButton).toBeVisible();
    await expect(createDocButton).toHaveText('Create Test Document');

    // Click the create document button
    await createDocButton.click();

    // Verify success message appears
    const successMessage = page.getByTestId('create-document-result');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText('Document successfully created!');
    await expect(successMessage).toHaveClass(/text-green-500/);
  });

  test('should be able to update document after creating it', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // First create the document
    const createDocButton = page.getByTestId('create-document');
    await createDocButton.click();

    // Wait for success message
    const successMessage = page.getByTestId('create-document-result');
    await expect(successMessage).toBeVisible();

    // Now try to update the document
    const updateDocButton = page.getByTestId('update-doc');
    await expect(updateDocButton).toBeVisible();
    await updateDocButton.click();

    // Verify the update was successful
    const updateResult = page.getByTestId('update-doc-result');
    await expect(updateResult).toBeVisible();
    await expect(updateResult).toHaveText(
      'Document field successfully updated with primitive value!'
    );

    // Verify the watch verification results
    const verificationResults = page.getByTestId('update-verification-results');
    await expect(verificationResults).toBeVisible();

    const verificationStatus = page.getByTestId('verification-status');
    await expect(verificationStatus).toBeVisible();
    await expect(verificationStatus).toHaveText('✓ Verified');
  });
});
