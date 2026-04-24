import { test, expect } from '@playwright/test';

test.describe('Authentication Journey', () => {
  test('should allow a teacher to login', async ({ page }) => {
    // Go to the login page
    await page.goto('/login');

    // Check if we are on the login page
    await expect(page).toHaveTitle(/Login/i);

    // Fill in credentials using data-testid for resilience
    const email = process.env.TEST_TEACHER_EMAIL;
    const password = process.env.TEST_TEACHER_PASSWORD;
    
    if (!email || !password) {
      throw new Error('Missing TEST_TEACHER_EMAIL or TEST_TEACHER_PASSWORD environment variables');
    }

    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);

    // Click the submit button
    await page.click('[data-testid="login-submit"]');

    // Check for successful login (redirect to dashboard)
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show an error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');

    await page.click('[data-testid="login-submit"]');

    // 🛡️ Assert that the standard 'handleError' notification appeared
    // sonner toasts usually have role="status"
    await expect(page.getByRole('status')).toBeVisible();
    
    // Ensure we are still on the login page
    await expect(page).not.toHaveURL(/dashboard/);
  });
});
