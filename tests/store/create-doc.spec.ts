import { expect, test } from '@playwright/test';
import { BASE_URL, TEST_DOC_ID, generateTestId } from './constants';

test.describe('FirestoreFunctionsPage', () => {
  test('should create a document with auto-generated ID and display success message', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    const createDocButton = page.getByTestId('create-doc');
    await expect(createDocButton).toBeVisible();

    await createDocButton.click();

    const successMessage = page.getByTestId('create-doc-success');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText('Document successfully created!');
  });

  test('should display an error message if document creation fails', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    const createDocButton = page.getByTestId('create-doc-fail');
    await expect(createDocButton).toBeVisible();

    await createDocButton.click();

    const errorMessage = page.getByTestId('create-doc-fail-result');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Failed to create document');
  });

  test('should create a document with custom ID', async ({ page }) => {
    await page.goto(BASE_URL);

    const createDocButton = page.getByTestId('create-doc-with-id');
    await expect(createDocButton).toBeVisible();

    const customId = generateTestId();
    // Mock the prompt
    page.on('dialog', async (dialog) => {
      await dialog.accept(customId);
    });

    await createDocButton.click();

    const successMessage = page.getByTestId('create-doc-success');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveText('Document successfully created!');
  });

  test('should show error when creating document with existing ID', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    const checkExistsButton = page.getByTestId('check-doc-exists');
    await expect(checkExistsButton).toBeVisible();

    // Mock the prompt with a known existing ID from constants
    page.on('dialog', async (dialog) => {
      await dialog.accept(TEST_DOC_ID);
    });

    await checkExistsButton.click();

    const errorMessage = page.getByTestId('create-doc-existed-result');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(
      'Document with this ID already exists!'
    );
  });

  test('should create test document for getDocData testing', async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    const createTestDocButton = page.getByTestId('create-test-doc');
    await expect(createTestDocButton).toBeVisible();

    await createTestDocButton.click();

    // Wait for success message in error display (since we use setError for success)
    const successMessage = page
      .locator('.bg-red-100, .bg-green-100')
      .filter({ hasText: 'Test document created successfully!' });
    await expect(successMessage).toBeVisible();
  });
});
