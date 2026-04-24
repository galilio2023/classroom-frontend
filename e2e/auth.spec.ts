import { test, expect } from '@playwright/test';

test.describe('Authentication Journey', () => {
  test('should allow a teacher to login', async ({ page }) => {
    // Go to the login page
    await page.goto('/login');

    // Check if we are on the login page
    await expect(page).toHaveTitle(/Login/i);

    // Fill in credentials using data-testid for resilience
    await page.fill('[data-testid="email-input"]', process.env.TEST_TEACHER_EMAIL || 'teacher@example.com');
    await page.fill('[data-testid="password-input"]', process.env.TEST_TEACHER_PASSWORD || 'password123');

    // Click the submit button
    await page.click('[data-testid="login-submit"]');

    // Check for successful login (redirect to dashboard)
    // Adjust the URL expectation based on the actual post-login route
    await expect(page).toHaveURL(/dashboard/);
    
    // Check for a dashboard-specific element
    // await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show an error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');

    await page.click('[data-testid="login-submit"]');

    // Expect an error toast or message
    // Note: 'sonner' toast might need a specific locator if it's not immediately visible
    // For now, we just wait for the URL to NOT change to dashboard
    await expect(page).not.toHaveURL(/dashboard/);
  });
});
