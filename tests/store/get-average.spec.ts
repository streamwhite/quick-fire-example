import { expect, test } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('FirestoreFunctionsPage', () => {
  test('should display the average result after clicking "Get Average for Query"', async ({
    page,
  }) => {
    // Navigate to the page
    await page.goto(BASE_URL);

    // Ensure the "Get Average for Query" button exists
    const getAverageButton = page.getByTestId('get-average');
    await expect(getAverageButton).toBeVisible();

    // Click the "Get Average for Query" button
    await getAverageButton.click();

    // Ensure the average result element exists
    const averageResult = page.getByTestId('average-result');
    await expect(averageResult).toBeVisible();

    // Verify the average result is a number
    const averageText = await averageResult.textContent();
    expect(Number.isFinite(parseFloat(averageText || '0'))).toBeTruthy();
  });
});
