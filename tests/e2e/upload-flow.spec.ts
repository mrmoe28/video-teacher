import { test, expect } from '@playwright/test';

test.describe('Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('should display upload page correctly', async ({ page }) => {
    await expect(page.locator('h1:has-text("Upload or Paste YouTube URL")')).toBeVisible();
    await expect(page.locator('input[placeholder*="youtube.com"]')).toBeVisible();
    await expect(page.locator('button:has-text("Analyze")')).toBeVisible();
  });

  test('should show error for empty URL', async ({ page }) => {
    await page.click('button:has-text("Analyze")');
    await expect(page.locator('text=Please enter a YouTube URL')).toBeVisible();
  });

  test('should show error for invalid URL', async ({ page }) => {
    await page.fill('input[placeholder*="youtube.com"]', 'invalid-url');
    await page.click('button:has-text("Analyze")');
    
    // Should show loading state first
    await expect(page.locator('text=Fetching video metadata...')).toBeVisible();
    
    // Then show error
    await expect(page.locator('text=Failed to crawl video')).toBeVisible({ timeout: 10000 });
  });

  test('should handle valid YouTube URL', async ({ page }) => {
    // Mock the API responses
    await page.route('**/api/crawl', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          videoId: 'test-video-123',
          title: 'Test Video',
          channel: 'Test Channel',
          duration: 300
        })
      });
    });

    await page.route('**/api/transcribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: 'job-123',
          status: 'queued'
        })
      });
    });

    await page.route('**/api/analyze', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: 'Test video summary',
          topics: ['AI', 'Learning', 'Technology'],
          keyMoments: [
            { timestamp: '00:30', description: 'Introduction', importance: 'high' }
          ]
        })
      });
    });

    await page.fill('input[placeholder*="youtube.com"]', 'https://www.youtube.com/watch?v=test123');
    await page.click('button:has-text("Analyze")');

    // Check loading states
    await expect(page.locator('text=Fetching video metadata...')).toBeVisible();
    await expect(page.locator('text=Transcribing video content...')).toBeVisible();
    await expect(page.locator('text=Analyzing with AI...')).toBeVisible();

    // Check success state
    await expect(page.locator('text=Analysis Complete!')).toBeVisible();
    await expect(page.locator('text=Test video summary')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1:has-text("Upload or Paste YouTube URL")')).toBeVisible();
    await expect(page.locator('input[placeholder*="youtube.com"]')).toBeVisible();
    await expect(page.locator('button:has-text("Analyze")')).toBeVisible();
  });
});