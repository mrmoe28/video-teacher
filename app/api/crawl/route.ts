import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import ytdl from 'ytdl-core';
import { YoutubeTranscript } from 'youtube-transcript';
import { db } from '@/lib/db';
import { videos, transcripts } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

// Input validation schema
const crawlSchema = z.object({
  url: z.string().url(),
});

// Response schema
export type CrawlResponse = {
  videoId: string;
  title: string;
  channel: string;
  duration: number;
  thumbnailUrl?: string;
  hasCaption: boolean;
  transcriptPreview?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = crawlSchema.parse(body);

    // Extract YouTube video ID from URL
    const urlMatch = validatedInput.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (!urlMatch) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      );
    }

    const youtubeId = urlMatch[1];

    // Check if video already exists in database
    const existingVideo = await db
      .select()
      .from(videos)
      .where(eq(videos.youtubeId, youtubeId))
      .limit(1);

    if (existingVideo.length > 0) {
      const video = existingVideo[0];
      return NextResponse.json({
        videoId: video.id,
        title: video.title || 'Unknown Title',
        channel: video.channel || 'Unknown Channel',
        duration: video.durationSeconds || 0,
        thumbnailUrl: video.thumbnailUrl,
        hasCaption: true, // Assume true if video exists
        transcriptPreview: undefined
      });
    }

    // Fetch video metadata using ytdl-core
    let videoInfo;
    try {
      videoInfo = await ytdl.getInfo(youtubeId);
    } catch (ytdlError) {
      console.error('ytdl error:', ytdlError);
      return NextResponse.json(
        { error: 'Could not fetch video metadata. Video may be private or unavailable.' },
        { status: 404 }
      );
    }

    const details = videoInfo.videoDetails;
    const title = details.title;
    const channel = details.author.name;
    const durationSeconds = parseInt(details.lengthSeconds);
    const thumbnailUrl = details.thumbnails?.[0]?.url;

    // Try to fetch captions
    let hasCaption = false;
    let transcriptPreview: string | undefined;
    let captionsData: Array<{start: number, end: number, text: string}> = [];

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(youtubeId);
      hasCaption = true;

      // Convert transcript format and create preview
      captionsData = transcript.map((item: { offset: number; duration: number; text: string }) => ({
        start: item.offset / 1000, // Convert ms to seconds
        end: (item.offset + item.duration) / 1000,
        text: item.text
      }));

      // Create a preview (first 200 characters)
      transcriptPreview = transcript
        .slice(0, 5)
        .map((item: { text: string }) => item.text)
        .join(' ')
        .substring(0, 200) + '...';

    } catch {
      console.log('No captions available for video:', youtubeId);
      hasCaption = false;
    }

    // Save video to database
    const newVideo = await db
      .insert(videos)
      .values({
        url: validatedInput.url,
        youtubeId,
        title,
        channel,
        durationSeconds,
        thumbnailUrl
      })
      .returning()
      .then(rows => rows[0]);

    // Save transcript if available
    if (hasCaption && captionsData.length > 0) {
      await db
        .insert(transcripts)
        .values({
          videoId: newVideo.id,
          source: 'captions',
          language: 'en',
          text: captionsData
        });
    }

    const response: CrawlResponse = {
      videoId: newVideo.id,
      title,
      channel,
      duration: durationSeconds,
      thumbnailUrl,
      hasCaption,
      transcriptPreview
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Crawl error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}