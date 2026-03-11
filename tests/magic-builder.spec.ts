import { test, expect } from '@playwright/test';

test.describe('AI Magic Builder', () => {
  
  test('should open Magic Builder and trigger generation', async ({ page }) => {
    // 1. Go to a specific class page (assuming ID 1 exists)
    await page.goto('/classes/show/1');
    
    // Wait for the class page to load by checking for the "Classroom Hub" heading
    await expect(page.getByText(/Classroom Hub/i)).toBeVisible({ timeout: 60000 });
    
    // 2. Click the Curriculum tab
    // The tab is named "Curriculum"
    await page.getByRole('tab', { name: /Curriculum/i }).click();
    
    // 3. Click the Magic Builder button
    const magicBtn = page.getByRole('button', { name: 'Magic Builder', exact: true });
    await expect(magicBtn).toBeVisible({ timeout: 30000 });
    await magicBtn.click();
    
    // 4. Verify the Dialog is open
    await expect(page.getByRole('heading', { name: 'AI Magic Builder' })).toBeVisible({ timeout: 30000 });
    
    // 5. Fill in the topic
    await page.getByPlaceholder(/e.g. Photosynthesis/i).fill('Quantum Computing for Beginners');
    
    // 6. Select "Lesson Notes" (it's faster than "Full Package")
    // We find the Select trigger for Content Type
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Lesson Notes' }).click();
    
    // 7. Click Generate
    const generateBtn = page.getByRole('button', { name: 'Generate', exact: true });
    await generateBtn.click();
    
    // 8. Verify it shows "Generating..."
    await expect(page.getByText(/Generating/i)).toBeVisible({ timeout: 30000 });
    
    // 9. Wait for success (the dialog should close)
    // We use a generous timeout for AI generation
    await expect(page.getByRole('heading', { name: 'AI Magic Builder' })).not.toBeVisible({ timeout: 240000 });
  });
});
