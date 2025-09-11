import { expect, test } from '@playwright/test';
import { confidentials, testIds } from './constants';

const { email, password } = confidentials.signup;

test.describe('Sign Out', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
    // Sign in first
    await page.fill(`[data-testid="${testIds.emailInput}"]`, email);
    await page.fill(`[data-testid="${testIds.passwordInput}"]`, password);
    await page.click(`[data-testid="${testIds.signInButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.signedIn}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.signedIn}"]`)
    ).toBeVisible();
  });

  test('should sign out successfully', async ({ page }) => {
    // Sign out
    await page.click(`[data-testid="${testIds.signOutButton}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.signedIn}"]`)
    ).not.toBeVisible();
  });
});
