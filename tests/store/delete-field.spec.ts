import { expect, test } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('FirestoreFunctionsPage', () => {
  test('should handle field deletion operation', async ({ page }) => {
    await page.goto(BASE_URL);

    // Ensure the "Delete Field" button exists
    const deleteFieldButton = page.getByTestId('delete-field');
    await expect(deleteFieldButton).toBeVisible();

    // Click the "Delete Field" button
    await deleteFieldButton.click();

    // Wait for any error or success message
    const resultMessage = page.locator('[data-testid="delete-field-result"]');
    await expect(resultMessage).toBeVisible();
  });
});
