import { test, expect } from '@playwright/test';

test.describe('Video Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for video page
    await page.route('**/api/progress*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          video: {
            id: 'test-video-123',
            title: 'Test Video Title',
            channel: 'Test Channel',
            duration: 300,
            thumbnailUrl: 'https://example.com/thumb.jpg',
            url: 'https://youtube.com/watch?v=test123'
          },
          hasTranscript: true,
          hasDeck: false,
          progress: {
            videoId: 'test-video-123',
            percent: 45,
            lastPosition: 135,
            updatedAt: new Date().toISOString()
          }
        })
      });
    });

    await page.route('**/api/analyze', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: 'This is a test video about AI and machine learning concepts.',
          topics: ['Artificial Intelligence', 'Machine Learning', 'Data Science'],
          keyMoments: [
            { timestamp: '00:30', description: 'Introduction to AI', importance: 'high' },
            { timestamp: '02:15', description: 'Machine Learning basics', importance: 'medium' },
            { timestamp: '04:45', description: 'Real-world applications', importance: 'high' }
          ]
        })
      });
    });
  });

  test('should load video page with data', async ({ page }) => {
    await page.goto('/video/test-video-123');

    // Check loading state
    await expect(page.locator('text=Loading video data...')).toBeVisible();

    // Wait for content to load
    await expect(page.locator('h2:has-text("Video Overview")')).toBeVisible();
    await expect(page.locator('text=Test Video Title')).toBeVisible();
    await expect(page.locator('text=Test Channel')).toBeVisible();
  });

  test('should display AI insights section', async ({ page }) => {
    await page.goto('/video/test-video-123');
    
    await expect(page.locator('h3:has-text("AI Insights")')).toBeVisible();
    await expect(page.locator('text=This is a test video about AI')).toBeVisible();
    
    // Check topics
    await expect(page.locator('text=Artificial Intelligence')).toBeVisible();
    await expect(page.locator('text=Machine Learning')).toBeVisible();
    await expect(page.locator('text=Data Science')).toBeVisible();
    
    // Check key moments
    await expect(page.locator('text=00:30')).toBeVisible();
    await expect(page.locator('text=Introduction to AI')).toBeVisible();
  });

  test('should display transcript section', async ({ page }) => {
    await page.goto('/video/test-video-123');
    
    await expect(page.locator('h3:has-text("Transcript")')).toBeVisible();
    await expect(page.locator('text=Transcript available')).toBeVisible();
  });

  test('should display study materials section', async ({ page }) => {
    await page.goto('/video/test-video-123');
    
    await expect(page.locator('h3:has-text("Study Materials")')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Deck")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Quiz")')).toBeVisible();
  });

  test('should handle video not found error', async ({ page }) => {
    await page.route('**/api/progress*', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Video not found' })
      });
    });

    await page.goto('/video/nonexistent-video');
    
    await expect(page.locator('h2:has-text("Error Loading Video")')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/video/test-video-123');
    
    await expect(page.locator('h2:has-text("Video Overview")')).toBeVisible();
    await expect(page.locator('h3:has-text("AI Insights")')).toBeVisible();
  });
});