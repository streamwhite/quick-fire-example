import { expect, test } from '@playwright/test';
import { BASE_URL } from './constants';

test.describe('FirestoreFunctionsPage', () => {
  test('should update document with primitive value and verify with watch', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // First create the test document
    const createDocButton = page.getByTestId('create-document');
    await expect(createDocButton).toBeVisible();
    await createDocButton.click();

    // Wait for document creation success
    const createSuccessMessage = page.getByTestId('create-document-result');
    await expect(createSuccessMessage).toBeVisible();

    const updateDocButton = page.getByTestId('update-doc');
    await expect(updateDocButton).toBeVisible();
    await updateDocButton.click({ force: true });

    const updateResult = page.getByTestId('update-doc-result');
    await expect(updateResult).toBeVisible();
    await expect(updateResult).toHaveText(
      'Document field successfully updated with primitive value!'
    );

    // Verify the watch verification results
    const verificationResults = page.getByTestId('update-verification-results');
    await expect(verificationResults).toBeVisible();

    // Check that the verification section has the proper styling
    await expect(verificationResults).toHaveClass(/bg-gradient-to-r/);

    const verificationStatus = page.getByTestId('verification-status');
    await expect(verificationStatus).toBeVisible();
    await expect(verificationStatus).toHaveText('✓ Verified');
    await expect(verificationStatus).toHaveClass(/bg-green-100/);

    const updatedValue = page.getByTestId('updated-value');
    const watchedValue = page.getByTestId('watched-value');

    await expect(updatedValue).toBeVisible();
    await expect(watchedValue).toBeVisible();

    // Verify styling
    await expect(updatedValue).toHaveClass(/text-green-700/);
    await expect(watchedValue).toHaveClass(/text-blue-700/);

    const updatedText = await updatedValue.textContent();
    const watchedText = await watchedValue.textContent();

    // Parse the JSON to verify it's a valid number
    const updatedNumber = JSON.parse(updatedText || '0');
    const watchedNumber = JSON.parse(watchedText || '0');
    expect(Number.isFinite(updatedNumber)).toBeTruthy();
    expect(Number.isFinite(watchedNumber)).toBeTruthy();
    expect(updatedNumber).toBeGreaterThan(0);
    expect(updatedNumber).toBeLessThanOrEqual(100);
  });

  test('should update document array with union operation and verify with watch', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // First create the test document
    const createDocButton = page.getByTestId('create-document');
    await expect(createDocButton).toBeVisible();
    await createDocButton.click();

    // Wait for document creation success
    const createSuccessMessage = page.getByTestId('create-document-result');
    await expect(createSuccessMessage).toBeVisible();

    const updateArrayButton = page.getByTestId('update-doc-array');
    await expect(updateArrayButton).toBeVisible();
    await updateArrayButton.click({ force: true });

    const updateResult = page.getByTestId('update-doc-result');
    await expect(updateResult).toBeVisible();
    await expect(updateResult).toHaveText(
      'Array successfully updated with new elements!'
    );

    // Verify the watch verification results
    const verificationResults = page.getByTestId('update-verification-results');
    await expect(verificationResults).toBeVisible();

    const verificationStatus = page.getByTestId('verification-status');
    await expect(verificationStatus).toHaveText('✓ Verified');
    await expect(verificationStatus).toHaveClass(/bg-green-100/);

    const updatedValue = page.getByTestId('updated-value');
    const watchedValue = page.getByTestId('watched-value');

    const updatedText = await updatedValue.textContent();
    const watchedText = await watchedValue.textContent();

    // Parse JSON arrays to verify elements were added
    const updatedArray = JSON.parse(updatedText || '[]');
    const watchedArray = JSON.parse(watchedText || '[]');

    expect(Array.isArray(updatedArray)).toBeTruthy();
    expect(Array.isArray(watchedArray)).toBeTruthy();
    expect(updatedArray.length).toBe(2); // Should have 2 new elements
    expect(
      updatedArray.every(
        (element: string) =>
          element.includes('test_') || element.includes('array_')
      )
    ).toBeTruthy();
    expect(
      updatedArray.every((element: string) => watchedArray.includes(element))
    ).toBeTruthy();
  });

  test('should increment numeric field and verify with watch', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // First create the test document
    const createDocButton = page.getByTestId('create-document');
    await expect(createDocButton).toBeVisible();
    await createDocButton.click();

    // Wait for document creation success
    const createSuccessMessage = page.getByTestId('create-document-result');
    await expect(createSuccessMessage).toBeVisible();

    const incrementButton = page.getByTestId('update-doc-increment');
    await expect(incrementButton).toBeVisible();
    await incrementButton.click({ force: true });

    const updateResult = page.getByTestId('update-doc-result');
    await expect(updateResult).toBeVisible();
    await expect(updateResult).toHaveText('Field successfully incremented!');

    // Verify the watch verification results
    const verificationResults = page.getByTestId('update-verification-results');
    await expect(verificationResults).toBeVisible();

    const verificationStatus = page.getByTestId('verification-status');
    await expect(verificationStatus).toHaveText('✓ Verified');
    await expect(verificationStatus).toHaveClass(/bg-green-100/);

    const updatedValue = page.getByTestId('updated-value');
    const watchedValue = page.getByTestId('watched-value');

    const updatedText = await updatedValue.textContent();
    const watchedText = await watchedValue.textContent();

    // Parse the JSON to verify it's a valid number
    const expectedValue = JSON.parse(updatedText || '0');
    const actualValue = JSON.parse(watchedText || '0');
    expect(Number.isFinite(expectedValue)).toBeTruthy();
    expect(Number.isFinite(actualValue)).toBeTruthy();
    expect(expectedValue).toBeGreaterThan(0);
    expect(actualValue).toBeGreaterThan(0);
  });

  test('should remove elements from array field and verify with watch', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // First create the test document
    const createDocButton = page.getByTestId('create-document');
    await expect(createDocButton).toBeVisible();
    await createDocButton.click();

    // Wait for document creation success
    const createSuccessMessage = page.getByTestId('create-document-result');
    await expect(createSuccessMessage).toBeVisible();

    const removeArrayButton = page.getByTestId('update-doc-remove-array');
    await expect(removeArrayButton).toBeVisible();
    await removeArrayButton.click({ force: true });

    const updateResult = page.getByTestId('update-doc-result');
    await expect(updateResult).toBeVisible();
    await expect(updateResult).toHaveText(
      'Elements successfully removed from array!'
    );

    // Verify the watch verification results
    const verificationResults = page.getByTestId('update-verification-results');
    await expect(verificationResults).toBeVisible();

    const verificationStatus = page.getByTestId('verification-status');
    await expect(verificationStatus).toHaveText('✓ Verified');
    await expect(verificationStatus).toHaveClass(/bg-green-100/);

    const updatedValue = page.getByTestId('updated-value');
    const watchedValue = page.getByTestId('watched-value');

    const updatedText = await updatedValue.textContent();
    const watchedText = await watchedValue.textContent();

    // Parse JSON arrays to verify elements were removed
    const elementsToRemove = JSON.parse(updatedText || '[]');
    const finalArray = JSON.parse(watchedText || '[]');

    expect(Array.isArray(elementsToRemove)).toBeTruthy();
    expect(Array.isArray(finalArray)).toBeTruthy();
    expect(elementsToRemove).toEqual(['test']); // Should be the specific element we're removing
    expect(
      elementsToRemove.every((element: string) => !finalArray.includes(element))
    ).toBeTruthy();
  });

  test('should update multiple fields with object and verify with watch', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // First create the test document
    const createDocButton = page.getByTestId('create-document');
    await expect(createDocButton).toBeVisible();
    await createDocButton.click();

    // Wait for document creation success
    const createSuccessMessage = page.getByTestId('create-document-result');
    await expect(createSuccessMessage).toBeVisible();

    const updateObjectButton = page.getByTestId('update-doc-with-object');
    await expect(updateObjectButton).toBeVisible();
    await updateObjectButton.click({ force: true });

    const updateResult = page.getByTestId('update-doc-result');
    await expect(updateResult).toBeVisible();
    await expect(updateResult).toHaveText(
      'Multiple fields successfully updated!'
    );

    // Verify the watch verification results
    const verificationResults = page.getByTestId('update-verification-results');
    await expect(verificationResults).toBeVisible();

    const verificationStatus = page.getByTestId('verification-status');
    await expect(verificationStatus).toHaveText('✓ Verified');
    await expect(verificationStatus).toHaveClass(/bg-green-100/);

    const updatedValue = page.getByTestId('updated-value');
    const watchedValue = page.getByTestId('watched-value');

    const updatedText = await updatedValue.textContent();
    const watchedText = await watchedValue.textContent();

    // Parse JSON objects to verify fields were updated
    const updatedObject = JSON.parse(updatedText || '{}');
    const watchedObject = JSON.parse(watchedText || '{}');

    expect(updatedObject.title).toBeDefined();
    expect(updatedObject.desc).toBeDefined();
    expect(watchedObject.title).toBeDefined();
    expect(watchedObject.desc).toBeDefined();
    expect(typeof updatedObject.title).toBe('string');
    expect(typeof updatedObject.desc).toBe('string');
    expect(updatedObject.title).toMatch(/^Updated Title \d+$/);
    expect(updatedObject.desc).toMatch(/^Updated description \d+$/);
  });
});
