import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to features section', async ({ page }) => {
    await page.click('a[href="#features"]');
    await expect(page.locator('#features')).toBeInViewport();
    await expect(page.locator('h2:has-text("Powerful Features")')).toBeVisible();
  });

  test('should navigate to pricing section', async ({ page }) => {
    await page.click('a[href="#pricing"]');
    await expect(page.locator('#pricing')).toBeInViewport();
    await expect(page.locator('h2:has-text("Simple, Transparent")')).toBeVisible();
  });

  test('should navigate to about section', async ({ page }) => {
    await page.click('a[href="#about"]');
    await expect(page.locator('#about')).toBeInViewport();
    await expect(page.locator('h2:has-text("About VideoTeacher")')).toBeVisible();
  });

  test('should navigate to upload page from Get Started button', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL('/upload');
    await expect(page.locator('h1:has-text("Upload or Paste YouTube URL")')).toBeVisible();
  });

  test('should navigate to upload page from hero CTA', async ({ page }) => {
    await page.click('text=Start Learning Now');
    await expect(page).toHaveURL('/upload');
  });

  test('should navigate to upload page from CTA section', async ({ page }) => {
    await page.click('text=Start Free Trial');
    await expect(page).toHaveURL('/upload');
  });

  test('should have working footer links', async ({ page }) => {
    // Test footer navigation links
    await page.click('footer a[href="#features"]');
    await expect(page.locator('#features')).toBeInViewport();
    
    await page.click('footer a[href="#pricing"]');
    await expect(page.locator('#pricing')).toBeInViewport();
    
    await page.click('footer a[href="#about"]');
    await expect(page.locator('#about')).toBeInViewport();
    
    await page.click('footer a[href="/upload"]');
    await expect(page).toHaveURL('/upload');
  });
});