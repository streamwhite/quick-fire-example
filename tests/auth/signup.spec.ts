import { expect, test } from '@playwright/test';
import { confidentials, testIds } from './constants';
const { email, password } = confidentials.signup;

test.describe('Signup Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display signup form', async ({ page }) => {
    await expect(
      page.locator(`[data-testid="${testIds.signUpButton}"]`)
    ).toBeVisible();
  });

  test('should sign up a new user', async ({ page }) => {
    await page.fill(`[data-testid="${testIds.emailInput}"]`, email);
    await page.fill(`[data-testid="${testIds.passwordInput}"]`, password);
    await page.click(`[data-testid="${testIds.signUpButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.signedIn}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.signedIn}"]`)
    ).toBeVisible();
  });

  test('should show error for existing user', async ({ page }) => {
    await page.fill(`[data-testid="${testIds.emailInput}"]`, email);
    await page.fill(`[data-testid="${testIds.passwordInput}"]`, password);
    await page.click(`[data-testid="${testIds.signUpButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.existedUser}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.existedUser}"]`)
    ).toBeVisible();
  });
});
