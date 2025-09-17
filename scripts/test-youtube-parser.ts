#!/usr/bin/env tsx

/**
 * Test script for YouTube URL Parser
 * This script demonstrates the comprehensive YouTube URL parsing capabilities
 */

import { parseYouTubeUrl, extractYouTubeVideoId, isValidYouTubeUrl } from '../lib/youtube-url-parser';

// Test URLs covering all possible YouTube URL formats
const testUrls = [
  // Standard YouTube URLs
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'www.youtube.com/watch?v=dQw4w9WgXcQ',
  'youtube.com/watch?v=dQw4w9WgXcQ',
  
  // Short URLs (youtu.be)
  'https://youtu.be/dQw4w9WgXcQ',
  'http://youtu.be/dQw4w9WgXcQ',
  'youtu.be/dQw4w9WgXcQ',
  
  // Mobile URLs
  'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
  'http://m.youtube.com/watch?v=dQw4w9WgXcQ',
  'm.youtube.com/watch?v=dQw4w9WgXcQ',
  
  // Embed URLs
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'http://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube.com/embed/dQw4w9WgXcQ',
  
  // YouTube Shorts
  'https://www.youtube.com/shorts/dQw4w9WgXcQ',
  'https://youtube.com/shorts/dQw4w9WgXcQ',
  'youtube.com/shorts/dQw4w9WgXcQ',
  
  // YouTube Music
  'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
  'music.youtube.com/watch?v=dQw4w9WgXcQ',
  
  // YouTube Gaming (legacy)
  'https://www.youtube.com/gaming/watch?v=dQw4w9WgXcQ',
  
  // YouTube TV
  'https://www.youtube.com/tv/watch/dQw4w9WgXcQ',
  
  // Live URLs
  'https://www.youtube.com/live/dQw4w9WgXcQ',
  
  // URLs with timestamps
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1h2m30s',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90',
  'https://youtu.be/dQw4w9WgXcQ?t=90s',
  'https://youtu.be/dQw4w9WgXcQ?t=1m30s',
  
  // URLs with playlists
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmRdnEQy6nuLMt9xrTwCu0AxjLw9h',
  'https://www.youtube.com/watch?list=PLrAXtmRdnEQy6nuLMt9xrTwCu0AxjLw9h&v=dQw4w9WgXcQ',
  
  // URLs with additional parameters
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=abcd1234',
  
  // Attribution URLs (from YouTube Studio/Analytics)
  'https://www.youtube.com/attribution_link?a=abcd1234&u=%2Fwatch%3Fv%3DdQw4w9WgXcQ',
  
  // URLs copied from address bar with additional tracking
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUJcmljayByb2xs',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=abc123&t=30s',
  
  // Mixed case and unusual formatting
  'HTTPS://WWW.YOUTUBE.COM/WATCH?V=dQw4w9WgXcQ',
  'https://YouTube.com/watch?v=dQw4w9WgXcQ',
  
  // Just video ID
  'dQw4w9WgXcQ',
  
  // URLs that should fail
  'https://vimeo.com/123456789',
  'https://www.dailymotion.com/video/x123456',
  'not-a-url-at-all',
  'https://www.youtube.com/watch?v=invalid',
  'https://www.youtube.com/watch?v=toolongvideoid123',
  'https://www.youtube.com/watch?v=short',
  '',
  'https://www.youtube.com/watch',
  'https://www.youtube.com/',
];

function runTests() {
  console.log('🧪 YouTube URL Parser Test Suite\n');
  console.log('Testing comprehensive YouTube URL parsing capabilities...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  testUrls.forEach((url, index) => {
    totalTests++;
    const parsed = parseYouTubeUrl(url);
    const videoId = extractYouTubeVideoId(url);
    const isValid = isValidYouTubeUrl(url);
    
    const status = parsed.isValid ? '✅' : '❌';
    const expectedValid = !url.includes('vimeo') && 
                         !url.includes('dailymotion') && 
                         url !== 'not-a-url-at-all' && 
                         url !== 'https://www.youtube.com/watch?v=invalid' && 
                         url !== 'https://www.youtube.com/watch?v=toolongvideoid123' && 
                         url !== 'https://www.youtube.com/watch?v=short' && 
                         url !== '' && 
                         url !== 'https://www.youtube.com/watch' && 
                         url !== 'https://www.youtube.com/';
    
    if (parsed.isValid === expectedValid) {
      passedTests++;
    }
    
    console.log(`${status} Test ${index + 1}: ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`);
    if (parsed.isValid) {
      console.log(`   → Video ID: ${parsed.videoId}`);
      if (parsed.startTime) {
        console.log(`   → Start Time: ${parsed.startTime}s`);
      }
      if (parsed.playlistId) {
        console.log(`   → Playlist: ${parsed.playlistId}`);
      }
      console.log(`   → Normalized: ${parsed.normalizedUrl}`);
    } else {
      console.log(`   → Invalid URL`);
    }
    console.log('');
  });
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! YouTube URL parser is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }
}

function demonstrateFeatures() {
  console.log('\n🚀 YouTube URL Parser Features Demo\n');
  
  const demoUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s&list=PLtest',
    'https://youtu.be/dQw4w9WgXcQ?t=90',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'dQw4w9WgXcQ'
  ];
  
  demoUrls.forEach(url => {
    console.log(`📺 Input: ${url}`);
    const parsed = parseYouTubeUrl(url);
    console.log(`   ✓ Valid: ${parsed.isValid}`);
    console.log(`   ✓ Video ID: ${parsed.videoId}`);
    console.log(`   ✓ Start Time: ${parsed.startTime || 'None'}`);
    console.log(`   ✓ Playlist: ${parsed.playlistId || 'None'}`);
    console.log(`   ✓ Normalized URL: ${parsed.normalizedUrl}`);
    console.log('');
  });
}

// Run the tests
if (require.main === module) {
  runTests();
  demonstrateFeatures();
}

export { runTests, demonstrateFeatures };
