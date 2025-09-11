import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test('should show navigation on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
  });

  test('should show navigation on signin page', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a[href="/signin"]')).toBeVisible();
  });

  test('should show navigation on signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a[href="/signup"]')).toBeVisible();
  });

  test('should show navigation on mfa page', async ({ page }) => {
    await page.goto('/mfa');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
  });

  test('should show navigation on store-functions page', async ({ page }) => {
    await page.goto('/store-functions');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
  });

  test('should show sign in and sign up links when not authenticated', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('nav a[href="/signin"]')).toBeVisible();
    await expect(page.locator('nav a[href="/signup"]')).toBeVisible();
  });
});
