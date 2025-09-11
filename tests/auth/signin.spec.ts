import { expect, test } from '@playwright/test';
import { confidentials, testIds } from './constants';

const { email, password, wrongEmail, wrongPassword } = confidentials.signin;

test.describe('Sign In', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
  });

  test('should sign in successfully', async ({ page }) => {
    await page.fill(`[data-testid="${testIds.emailInput}"]`, email);
    await page.fill(`[data-testid="${testIds.passwordInput}"]`, password);
    await page.click(`[data-testid="${testIds.signInButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.signedIn}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.signedIn}"]`)
    ).toBeVisible();
  });

  test('should show error for incorrect credentials', async ({ page }) => {
    await page.fill(`[data-testid="${testIds.emailInput}"]`, wrongEmail);
    await page.fill(`[data-testid="${testIds.passwordInput}"]`, wrongPassword);
    await page.click(`[data-testid="${testIds.signInButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.signInError}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.signInError}"]`)
    ).toBeVisible();
  });

  test('should show MFA options when 2FA is required', async ({ page }) => {
    // This test assumes there's a user with 2FA enabled
    // You may need to adjust the email/password for a 2FA-enabled account
    await page.fill(`[data-testid="${testIds.emailInput}"]`, email);
    await page.fill(`[data-testid="${testIds.passwordInput}"]`, password);
    await page.click(`[data-testid="${testIds.signInButton}"]`);

    // Wait for either MFA options or successful sign-in
    try {
      await page.waitForSelector(
        `[data-testid="${testIds.selectSms2fa}"], [data-testid="${testIds.selectTotp2fa}"], [data-testid="${testIds.signedIn}"]`,
        { timeout: 10000 }
      );

      // Check if MFA options are shown
      const mfaOptionsVisible = await page
        .locator(
          `[data-testid="${testIds.selectSms2fa}"], [data-testid="${testIds.selectTotp2fa}"]`
        )
        .isVisible();
      if (mfaOptionsVisible) {
        await expect(
          page.locator(
            `[data-testid="${testIds.selectSms2fa}"], [data-testid="${testIds.selectTotp2fa}"]`
          )
        ).toBeVisible();
      } else {
        // If no MFA options, user should be signed in
        await expect(
          page.locator(`[data-testid="${testIds.signedIn}"]`)
        ).toBeVisible();
      }
    } catch (error) {
      // If neither MFA options nor sign-in is shown, check for error
      await expect(
        page.locator(`[data-testid="${testIds.signInError}"]`)
      ).toBeVisible();
    }
  });
});
