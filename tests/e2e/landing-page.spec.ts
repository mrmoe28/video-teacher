import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/VideoTeacher/);
    
    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: /Transform Any Video Into/ })).toBeVisible();
    
    // Check if the navigation is present
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check if the brand logo is present
    await expect(page.getByText('VideoTeacher')).toBeVisible();
  });

  test('should display all feature cards', async ({ page }) => {
    await page.goto('/');
    
    // Check if all 6 feature cards are visible
    const featureCards = page.locator('[data-testid="feature-card"]');
    await expect(featureCards).toHaveCount(6);
    
    // Check specific features
    await expect(page.getByText('AI Analysis')).toBeVisible();
    await expect(page.getByText('Smart Transcripts')).toBeVisible();
    await expect(page.getByText('Study Groups')).toBeVisible();
    await expect(page.getByText('Progress Tracking')).toBeVisible();
    await expect(page.getByText('Flashcards')).toBeVisible();
    await expect(page.getByText('Quizzes & Tests')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page.locator('#features')).toBeInViewport();
    
    // Test CTA buttons
    await expect(page.getByRole('button', { name: /Start Learning Now/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Watch Demo/ })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile navigation works
    await expect(page.getByText('VideoTeacher')).toBeVisible();
    
    // Check if content is properly stacked on mobile
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check if buttons have proper labels
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });
});
