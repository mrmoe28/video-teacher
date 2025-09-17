#!/usr/bin/env tsx

/**
 * Test script for Whisper audio extraction and transcription
 * This script tests the ytdl-core audio extraction functionality
 */

import 'dotenv/config';
import ytdl from 'ytdl-core';
import { createWriteStream, unlinkSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

function log(message: string, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function success(message: string) {
  log(`✅ ${message}`, COLORS.GREEN);
}

function error(message: string) {
  log(`❌ ${message}`, COLORS.RED);
}

function warning(message: string) {
  log(`⚠️  ${message}`, COLORS.YELLOW);
}

function info(message: string) {
  log(`ℹ️  ${message}`, COLORS.BLUE);
}

async function testAudioExtraction(youtubeId: string): Promise<boolean> {
  const audioPath = join(tmpdir(), `${youtubeId}_test_${Date.now()}.mp4`);
  
  try {
    info(`Testing audio extraction for video: ${youtubeId}`);
    
    // Check if video is available and get info
    const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    info('Fetching video information...');
    
    const info_data = await ytdl.getInfo(videoUrl);
    
    if (!info_data) {
      error('Could not fetch video information');
      return false;
    }
    
    success(`Video found: "${info_data.videoDetails.title}"`);
    info(`Duration: ${info_data.videoDetails.lengthSeconds}s`);
    info(`Author: ${info_data.videoDetails.author.name}`);
    
    const durationSeconds = parseInt(info_data.videoDetails.lengthSeconds || '0');
    if (durationSeconds > 300) { // 5 minutes limit for testing
      warning('Video is longer than 5 minutes, this might take a while...');
    }
    
    // Check available audio formats
    const audioFormats = ytdl.filterFormats(info_data.formats, 'audioonly');
    info(`Found ${audioFormats.length} audio-only formats`);
    
    if (audioFormats.length === 0) {
      error('No audio-only formats available');
      return false;
    }
    
    // Show best audio format
    const bestAudio = audioFormats[0];
    info(`Best audio format: ${bestAudio.container} - ${bestAudio.audioBitrate}kbps`);
    
    info('Starting audio extraction...');
    
    // Extract audio stream
    const audioStream = ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });
    
    const writeStream = createWriteStream(audioPath);
    audioStream.pipe(writeStream);
    
    // Track progress
    let totalBytes = 0;
    audioStream.on('data', (chunk) => {
      totalBytes += chunk.length;
    });
    
    // Wait for extraction to complete
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => {
        success(`Audio extraction completed: ${audioPath}`);
        resolve();
      });
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });
    
    // Check file size
    if (existsSync(audioPath)) {
      const stats = statSync(audioPath);
      success(`Audio file created: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      
      // Clean up
      unlinkSync(audioPath);
      success('Temporary file cleaned up');
      
      return true;
    } else {
      error('Audio file was not created');
      return false;
    }
    
  } catch (err) {
    error(`Audio extraction failed: ${err instanceof Error ? err.message : String(err)}`);
    
    // Clean up on error
    try {
      if (existsSync(audioPath)) {
        unlinkSync(audioPath);
      }
    } catch {
      // Ignore cleanup errors
    }
    
    return false;
  }
}

async function main() {
  log(`${COLORS.BOLD}🎵 YouTube Audio Extraction Test${COLORS.RESET}\n`);
  
  // Test with different video types
  const testVideos = [
    {
      id: 'dQw4w9WgXcQ',
      name: 'Rick Astley - Never Gonna Give You Up (Popular music video)'
    },
    {
      id: 'pyc2SieEZXc',
      name: 'User provided video ID'
    }
  ];
  
  let passedTests = 0;
  const totalTests = testVideos.length;
  
  for (const video of testVideos) {
    log(`\n${COLORS.BOLD}Testing: ${video.name}${COLORS.RESET}`);
    log(`Video ID: ${video.id}\n`);
    
    const success = await testAudioExtraction(video.id);
    if (success) {
      passedTests++;
    }
    
    // Add delay between tests
    if (video !== testVideos[testVideos.length - 1]) {
      info('Waiting 2 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  log(`\n${COLORS.BOLD}📋 Test Results:${COLORS.RESET}`);
  log(`${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    success('🎉 All audio extraction tests passed! Whisper fallback is ready to use.');
  } else {
    warning(`⚠️  ${totalTests - passedTests} test(s) failed. Check the errors above.`);
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  main().catch((err) => {
    error(`Test script failed: ${err.message}`);
    process.exit(1);
  });
}

export { testAudioExtraction };
