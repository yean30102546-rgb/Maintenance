import { test, expect } from '@playwright/test';

test('has login page and passcode input', async ({ page }) => {
  await page.goto('/login');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SFC Smart Repair/i);

  // Expect to see passcode input and submit button
  await expect(page.locator('input[name="passcode"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
  await expect(page.locator('text=เข้าสู่ระบบ (Testing)')).toBeVisible();
});
