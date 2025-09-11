import { expect, test } from '@playwright/test';
import { testIds } from './constants';

const socialPagePath = '/social-signin';
test.describe('Sign in with Apple or Google', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
    // click user id is visible
    const signOutButton = page.locator(
      `[data-testid="${testIds.signOutButton}"]`
    );

    if (!(await signOutButton.isDisabled())) {
      await signOutButton.click();
    }

    await page.goto(socialPagePath);
  });
  const { appleSignin, googleSignin, socialSignedIn } = testIds;

  test('Sign in with Google', async ({ page }) => {
    await page.click(`[data-testid="${googleSignin}"]`);
    await page.waitForSelector(`[data-testid="${socialSignedIn}"]`);
    expect(page.locator(`[data-testid="${socialSignedIn}"]`)).toBeVisible();
  });

  test('Sign in with Apple', async ({ page }) => {
    await page.click(`[data-testid="${appleSignin}"]`);
    // Assuming the sign-in process is mocked or handled by a test environment
    // Check if the user is signed in by checking the element visibility
    await page.waitForSelector(`[data-testid="${testIds.socialSignedIn}"]`);
    expect(
      page.locator(`[data-testid="${testIds.socialSignedIn}"]`)
    ).toBeVisible();
  });
});
