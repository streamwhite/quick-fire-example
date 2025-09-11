import { expect, test } from '@playwright/test';
import { confidentials, testIds } from './auth/constants';

const { email, password } = confidentials.signin;

test.describe('Navigation Sign Out', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in first
    await page.goto('/signin');
    await page.fill(`[data-testid="${testIds.emailInput}"]`, email);
    await page.fill(`[data-testid="${testIds.passwordInput}"]`, password);
    await page.click(`[data-testid="${testIds.signInButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.signedIn}"]`);
  });

  test('should show sign out button in navigation when signed in', async ({
    page,
  }) => {
    await expect(page.locator('nav [data-testid="sign-out"]')).toBeVisible();
  });

  test('should show user email in navigation when signed in', async ({
    page,
  }) => {
    await expect(page.locator('nav')).toContainText(email);
  });

  test('should sign out from navigation and show sign in/sign up links', async ({
    page,
  }) => {
    // Click sign out button in navigation
    await page.click('nav [data-testid="sign-out"]');

    // Wait for sign out to complete
    await page.waitForSelector(`[data-testid="${testIds.signedIn}"]`, {
      state: 'hidden',
    });

    // Check that sign in and sign up links are visible
    await expect(page.locator('nav a[href="/signin"]')).toBeVisible();
    await expect(page.locator('nav a[href="/signup"]')).toBeVisible();
  });

  test('should show sign out button on different pages when signed in', async ({
    page,
  }) => {
    // Test on home page
    await page.goto('/');
    await expect(page.locator('nav [data-testid="sign-out"]')).toBeVisible();

    // Test on mfa page
    await page.goto('/mfa');
    await expect(page.locator('nav [data-testid="sign-out"]')).toBeVisible();

    // Test on store-functions page
    await page.goto('/store-functions');
    await expect(page.locator('nav [data-testid="sign-out"]')).toBeVisible();
  });
});
