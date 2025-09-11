import { expect, test } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('FirestoreFunctionsPage', () => {
  test('should display the sum result and verify it matches the expected value', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // Ensure the "Get Sum for Query" button exists
    const getSumButton = page.getByTestId('get-sum');
    await expect(getSumButton).toBeVisible();

    // Click the "Get Sum for Query" button with force
    await getSumButton.click({ force: true });

    // Ensure the sum result element exists
    const sumResult = page.getByTestId('sum-result');
    await expect(sumResult).toBeVisible();

    // Get both actual and expected values
    const actualSum = await sumResult.textContent();
    const expectedSumElement = page.getByTestId('expected-sum');
    const expectedText = await expectedSumElement.textContent();
    const expectedSum = expectedText?.match(/Expected: (\d+)/)?.[1];

    // Verify the sum matches the expected value
    expect(actualSum).toBe(expectedSum);

    // Verify both values are valid numbers
    expect(Number.isFinite(Number(actualSum))).toBeTruthy();
    expect(Number.isFinite(Number(expectedSum))).toBeTruthy();
  });
});
