import { test, expect } from '@playwright/test';

test.describe('Authentication Journey', () => {
  // 🛡️ Fail fast with actionable guidance if environment is not configured correctly
  const email = process.env.TEST_TEACHER_EMAIL;
  const password = process.env.TEST_TEACHER_PASSWORD;

  test.beforeEach(({}, testInfo) => {
    if (!email || !password) {
      console.warn(
        `🚨 Skipping test "${testInfo.title}": TEST_TEACHER_EMAIL or TEST_TEACHER_PASSWORD is not set.`
      );
      test.skip();
    }
  });

  test('should allow a teacher to login', async ({ page }) => {
    // Go to the login page
    await page.goto('/login');

    // Check if we are on the login page
    await expect(page).toHaveTitle(/Login/i);

    // Fill in credentials using data-testid for resilience
    await page.fill('[data-testid="email-input"]', email!);
    await page.fill('[data-testid="password-input"]', password!);

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

    // 🛡️ Assert that the standard 'handleError' notification appeared with specific text
    const toast = page.getByRole('status');
    await expect(toast).toContainText(/Session expired or unauthorized/i);
    
    // 🚀 RULE 8: Verify Traceability (Trace ID/Correlation ID should be present)
    await expect(toast).toContainText(/Trace/i);
    
    // Ensure we are still on the login page
    await expect(page).not.toHaveURL(/dashboard/);
  });
});
