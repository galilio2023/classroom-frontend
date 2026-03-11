import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  
  // Wait for the login form to be visible
  await expect(page.getByText(/Welcome Back/i)).toBeVisible({ timeout: 30000 });
  
  await page.fill('input[type="email"]', 'admin@school.com');
  await page.fill('input[type="password"]', 'password123');
  
  // Click the submit button
  await page.click('button[type="submit"]');

  // Wait for the dashboard to load
  // We check for multiple possible indicators of a successful login
  // 1. The "Quick Actions" text
  // 2. The "Welcome" text (WelcomeHeader component)
  // 3. The URL change to root
  
  const quickActions = page.getByText(/Quick Actions/i);
  const welcome = page.getByText(/Welcome/i);
  
  await expect(quickActions.or(welcome).first()).toBeVisible({ timeout: 90000 });

  // Verify we are on the dashboard
  await expect(page).toHaveURL(/\/$/, { timeout: 30000 });

  await page.context().storageState({ path: authFile });
});
