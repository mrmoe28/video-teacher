import { test, expect } from '@playwright/test';

test.describe('YouTube Video Processing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/upload');
  });

  test('should process a valid YouTube URL', async ({ page }) => {
    // Test with a known working YouTube video
    const youtubeUrl = 'https://www.youtube.com/watch?v=KRWQTF0iAdM';
    
    // Fill in the YouTube URL
    await page.fill('input[placeholder*="youtube.com"]', youtubeUrl);
    
    // Click the Analyze button
    await page.click('button:has-text("Analyze")');
    
    // Wait for processing to start
    await expect(page.locator('text=Processing queue average time')).toBeVisible();
    
    // Check for any error messages
    const errorMessage = page.locator('[data-testid="error-message"], .text-red-400, .text-red-500');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log('Error found:', errorText);
    }
    
    // Wait a bit for processing
    await page.waitForTimeout(5000);
    
    // Check if we get redirected to video page or see success message
    const currentUrl = page.url();
    console.log('Current URL after processing:', currentUrl);
    
    // Check for success indicators
    const successIndicators = [
      page.locator('text=Analysis Complete!'),
      page.locator('text=ready'),
      page.locator('[href*="/video/"]')
    ];
    
    let foundSuccess = false;
    for (const indicator of successIndicators) {
      if (await indicator.isVisible()) {
        foundSuccess = true;
        break;
      }
    }
    
    if (!foundSuccess) {
      // Log the current state for debugging
      const statusText = await page.locator('text=Processing queue average time').textContent();
      console.log('Status text:', statusText);
      
      // Check for any error messages
      const allText = await page.textContent('body');
      console.log('Page content:', allText);
    }
  });

  test('should handle invalid video ID gracefully', async ({ page }) => {
    // Test with invalid video ID in URL
    await page.goto('http://localhost:3000/upload?videoId=invalid-id');
    
    // Should show error or handle gracefully
    await page.waitForTimeout(2000);
    
    // Check if error is displayed
    const errorMessage = page.locator('[data-testid="error-message"], .text-red-400, .text-red-500');
    const hasError = await errorMessage.isVisible();
    
    if (hasError) {
      const errorText = await errorMessage.textContent();
      console.log('Error with invalid ID:', errorText);
    }
  });

  test('should validate YouTube URL format', async ({ page }) => {
    // Test with invalid URL
    await page.fill('input[placeholder*="youtube.com"]', 'not-a-youtube-url');
    await page.click('button:has-text("Analyze")');
    
    // Should show validation error
    await expect(page.locator('text=Please enter a YouTube URL')).toBeVisible();
  });

  test('should check API endpoints are working', async ({ page }) => {
    // Test API endpoints directly
    const response = await page.request.get('http://localhost:3000/api/progress?videoId=KRWQTF0iAdM');
    console.log('Progress API status:', response.status());
    console.log('Progress API response:', await response.text());
    
    const analyzeResponse = await page.request.post('http://localhost:3000/api/analyze', {
      data: { videoId: 'KRWQTF0iAdM' }
    });
    console.log('Analyze API status:', analyzeResponse.status());
    console.log('Analyze API response:', await analyzeResponse.text());
  });
});
