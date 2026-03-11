import { test, expect } from '@playwright/test';

test.describe('Tablawy OS Smoke Tests', () => {
  
  test('should load the dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the dashboard content to be visible
    // The dashboard has a "Quick Actions" heading
    await expect(page.getByText(/Quick Actions/i)).toBeVisible({ timeout: 60000 });
  });

  test('should load the classes list', async ({ page }) => {
    await page.goto('/classes');
    
    // Wait for the page heading
    // The page uses "Discover Classes" for students or "My Classrooms" for staff
    await expect(page.getByText(/Discover Classes/i).or(page.getByText(/My Classrooms/i))).toBeVisible({ timeout: 60000 });
  });

  test('should open the AI Study Lab', async ({ page }) => {
    await page.goto('/ai-study-lab');
    
    // Check for AI tools by their card titles
    await expect(page.getByText(/Concept Explainer/i)).toBeVisible({ timeout: 60000 });
    await expect(page.getByText(/Smart Summarizer/i)).toBeVisible();
  });
});
