import { test, expect } from '@playwright/test';

test.describe('Modules Management', () => {
  
  test('should list modules and show empty state if none exist', async ({ page }) => {
    await page.goto('/modules');
    
    // Wait for the main heading text
    // The page uses "Curriculum Modules"
    await expect(page.getByText(/Curriculum Modules/i)).toBeVisible({ timeout: 60000 });
    
    // Check if we see either the list or the empty state
    // We use a more flexible selector for the empty state or list items
    const emptyState = page.getByText(/No modules found/i);
    const moduleItems = page.getByText(/View Module/i); 
    
    await expect(emptyState.or(moduleItems).first()).toBeVisible({ timeout: 30000 });
  });

  test('should have the Create Module button', async ({ page }) => {
    await page.goto('/modules');
    
    // Wait for the page to load
    await expect(page.getByText(/Curriculum Modules/i)).toBeVisible({ timeout: 60000 });
    
    // Verify the "Create Module" button is present and enabled
    const createBtn = page.getByRole('button', { name: /Create Module/i });
    await expect(createBtn).toBeVisible({ timeout: 30000 });
    await expect(createBtn).toBeEnabled();
  });
});
