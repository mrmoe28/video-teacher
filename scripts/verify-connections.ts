#!/usr/bin/env tsx

/**
 * Connection verification script for Video Teacher
 *
 * Verifies connectivity to:
 * 1. Neon PostgreSQL database
 * 2. OpenAI API
 * 3. YouTube API (transcript fetching)
 * 4. YouTube metadata (ytdl-core)
 */

import 'dotenv/config';
import { db } from '../lib/db';
import { videos } from '../lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from 'ytdl-core';

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

async function verifyDatabase(): Promise<boolean> {
  try {
    info('Testing database connection...');

    // Test basic connection
    const result = await db.select().from(videos).limit(1);
    success('Database connection successful');

    // Test schema exists
    info('Verifying schema integrity...');

    // Try to insert and delete a test record
    const testVideo = await db
      .insert(videos)
      .values({
        url: 'https://youtube.com/watch?v=test-connection',
        youtubeId: 'test-connection',
        title: 'Connection Test Video',
        channel: 'Test Channel',
        durationSeconds: 60
      })
      .returning()
      .then(rows => rows[0]);

    // Clean up test record
    await db.delete(videos).where(eq(videos.id, testVideo.id));

    success('Database schema verification successful');
    return true;

  } catch (err) {
    error(`Database connection failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function verifyOpenAI(): Promise<boolean> {
  try {
    info('Testing OpenAI API connection...');

    if (!process.env.OPENAI_API_KEY) {
      error('OPENAI_API_KEY environment variable not found');
      return false;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Respond with exactly: 'Connection test successful'"
        }
      ],
      max_tokens: 10,
      temperature: 0
    });

    const response = completion.choices[0]?.message?.content;
    if (response?.includes('Connection test successful')) {
      success('OpenAI API connection successful');
      return true;
    } else {
      warning(`OpenAI API responded but with unexpected content: ${response}`);
      return false;
    }

  } catch (err) {
    error(`OpenAI API connection failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function verifyYouTubeTranscript(): Promise<boolean> {
  try {
    info('Testing YouTube transcript fetching...');

    // Test with a known public video (popular educational content)
    const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (has captions)

    const transcript = await YoutubeTranscript.fetchTranscript(testVideoId);

    if (transcript && transcript.length > 0) {
      success(`YouTube transcript fetching successful (${transcript.length} segments)`);
      return true;
    } else {
      warning('YouTube transcript fetching returned empty result');
      return false;
    }

  } catch (err) {
    error(`YouTube transcript fetching failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function verifyYouTubeMetadata(): Promise<boolean> {
  try {
    info('Testing YouTube metadata fetching...');

    // Test with the same video
    const testVideoId = 'dQw4w9WgXcQ';

    const videoInfo = await ytdl.getInfo(testVideoId);

    if (videoInfo && videoInfo.videoDetails) {
      success(`YouTube metadata fetching successful (Title: "${videoInfo.videoDetails.title}")`);
      return true;
    } else {
      warning('YouTube metadata fetching returned empty result');
      return false;
    }

  } catch (err) {
    error(`YouTube metadata fetching failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function main() {
  log(`${COLORS.BOLD}🔍 Video Teacher - Connection Verification${COLORS.RESET}\n`);

  const results = {
    database: false,
    openai: false,
    youtubeTranscript: false,
    youtubeMetadata: false
  };

  // Run all tests
  results.database = await verifyDatabase();
  console.log();

  results.openai = await verifyOpenAI();
  console.log();

  results.youtubeTranscript = await verifyYouTubeTranscript();
  console.log();

  results.youtubeMetadata = await verifyYouTubeMetadata();
  console.log();

  // Summary
  log(`${COLORS.BOLD}📋 Summary:${COLORS.RESET}`);

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;

  for (const [service, passed] of Object.entries(results)) {
    const status = passed ? '✅' : '❌';
    const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
    log(`${status} ${serviceName}`);
  }

  console.log();

  if (passedTests === totalTests) {
    success(`🎉 All ${totalTests} connection tests passed! The application is ready to use.`);
    process.exit(0);
  } else {
    error(`❌ ${totalTests - passedTests} out of ${totalTests} tests failed. Please check your configuration.`);

    // Provide helpful suggestions
    console.log();
    log(`${COLORS.BOLD}💡 Troubleshooting tips:${COLORS.RESET}`);

    if (!results.database) {
      warning('• Check DATABASE_URL in .env file');
      warning('• Verify Neon database is accessible');
      warning('• Run: npm run db:migrate');
    }

    if (!results.openai) {
      warning('• Check OPENAI_API_KEY in .env file');
      warning('• Verify API key has sufficient credits');
      warning('• Check OpenAI service status');
    }

    if (!results.youtubeTranscript || !results.youtubeMetadata) {
      warning('• YouTube services may be temporarily unavailable');
      warning('• Check internet connection');
      warning('• Some videos may have restricted access');
    }

    process.exit(1);
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

// Run the verification
if (require.main === module) {
  main().catch((err) => {
    error(`Verification script failed: ${err.message}`);
    process.exit(1);
  });
}