import { expect, test } from '@playwright/test';
import { confidentials, testIds } from './constants';

const { email, password } = confidentials.signin;
const { newpassword, newemail } = confidentials.manage;

const manageUserPath = '/manage-user';
test.describe('Reset Password and Verify Email', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
    await page.fill(`[data-testid="${testIds.emailInput}"]`, email);
    await page.fill(`[data-testid="${testIds.passwordInput}"]`, password);
    await page.click(`[data-testid="${testIds.signInButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.signedIn}"]`);
  });

  test('should send password reset email', async ({ page }) => {
    await page.goto(manageUserPath);
    await page.click(`[data-testid="${testIds.sendEmailButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.emailSentMessage}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.emailSentMessage}"]`)
    ).toBeVisible();
  });

  test('should send verification email', async ({ page }) => {
    await page.goto(manageUserPath);
    await page.click(`[data-testid="${testIds.sendVerificationEmailButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.emailSentMessage}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.emailSentMessage}"]`)
    ).toBeVisible();
  });

  test('should has new email verification sent', async ({ page }) => {
    // it will change email directly
    await page.goto(manageUserPath);

    // fill new email
    await page.fill(`[data-testid="${testIds.updateEmailInput}"]`, newemail);

    await page.click(`[data-testid="${testIds.verifyNewEmailButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.updateEmailButton}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.updateEmailButton}"]`)
    ).toBeVisible();
  });

  test('should has new password', async ({ page }) => {
    await page.goto(manageUserPath);
    await page.fill(
      `[data-testid="${testIds.updatePasswordInput}"]`,
      newpassword
    );
    await page.click(`[data-testid="${testIds.updatePasswordButton}"]`);
    await page.waitForSelector(
      `[data-testid="${testIds.passwordUpdatedMessage}"]`
    );
    await expect(
      page.locator(`[data-testid="${testIds.passwordUpdatedMessage}"]`)
    ).toBeVisible();
  });

  test('should this user no more', async ({ page }) => {
    // note: this is a indirect result.it should sign in user again to test it, but it is fine
    await page.goto(manageUserPath);
    await page.click(`[data-testid="${testIds.deleteUserButton}"]`);
    await page.waitForSelector(`[data-testid="${testIds.userExistsMessage}"]`);
    await expect(
      page.locator(`[data-testid="${testIds.userExistsMessage}"]`)
    ).not.toBeVisible();
  });
});
