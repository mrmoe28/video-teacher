import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractYouTubeVideoId } from '@/lib/youtube-url-parser';
import { YoutubeTranscript } from 'youtube-transcript';
import { db } from '@/lib/db';
import { videos } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

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

    // Extract YouTube video ID using comprehensive parser
    const youtubeId = extractYouTubeVideoId(validatedInput.url);
    if (!youtubeId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format. Supports all YouTube URL formats including youtu.be, mobile, shorts, embed, and more.' },
        { status: 400 }
      );
    }

    // Check if video already exists in database
    try {
      const existingVideo = await db
        .select()
        .from(videos)
        .where(eq(videos.youtubeId, youtubeId))
        .limit(1);
      
      if (existingVideo.length > 0) {
        console.log('Video already exists in database:', youtubeId);
        // Return existing video data
        const response: CrawlResponse = {
          videoId: existingVideo[0].id,
          title: existingVideo[0].title,
          channel: existingVideo[0].channel,
          duration: existingVideo[0].durationSeconds,
          thumbnailUrl: existingVideo[0].thumbnailUrl || undefined,
          hasCaption: true, // We'll check this separately
          transcriptPreview: undefined
        };
        return NextResponse.json(response);
      }
    } catch (dbError) {
      console.warn('Database check failed, proceeding with API fetch:', dbError);
    }

    // Fetch video metadata using YouTube Data API v3
    const apiKey = process.env.YOUTUBE_API_KEY || "AIzaSyAKTV_JHkK1lKhbpmZoNKi98geg_X0lFSQ";
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured. Please set YOUTUBE_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    let videoInfo;
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${youtubeId}&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }
      
      videoInfo = data.items[0];
    } catch (apiError) {
      console.error('YouTube API error:', apiError);
      return NextResponse.json(
        { error: 'Could not fetch video metadata. Video may be private, unavailable, or the API key may be invalid.' },
        { status: 404 }
      );
    }

    const title = videoInfo.snippet.title;
    const channel = videoInfo.snippet.channelTitle;
    const durationISO = videoInfo.contentDetails.duration;
    const durationSeconds = parseDuration(durationISO);
    const thumbnailUrl = videoInfo.snippet.thumbnails?.default?.url;

    // Try to fetch captions
    let hasCaption = false;
    let transcriptPreview: string | undefined;

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(youtubeId);
      hasCaption = true;

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
    let savedVideo;
    try {
      savedVideo = await db
        .insert(videos)
        .values({
          youtubeId,
          url: `https://www.youtube.com/watch?v=${youtubeId}`,
          title,
          channel,
          durationSeconds,
          thumbnailUrl
        })
        .returning()
        .then(rows => rows[0]);
      
      console.log('Video saved to database:', savedVideo.id);
    } catch (dbError) {
      console.warn('Database save failed, using YouTube ID as fallback:', dbError);
      // Use YouTube ID as fallback if database save fails
      savedVideo = { id: youtubeId };
    }
    
    const response: CrawlResponse = {
      videoId: savedVideo.id,
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