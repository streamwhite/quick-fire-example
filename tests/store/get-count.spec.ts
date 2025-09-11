import { expect, test } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('FirestoreFunctionsPage', () => {
  test('should display the count result as 1 after clicking "Get Count for Query"', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // Ensure the "Get Count for Query" button exists
    const getCountButton = page.getByTestId('get-count');
    await expect(getCountButton).toBeVisible();

    // Click the "Get Count for Query" button
    await getCountButton.click();

    // Ensure the count result element exists
    const countResult = page.getByTestId('count-result');
    await expect(countResult).toBeVisible();
  });
});
