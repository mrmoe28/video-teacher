import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { YoutubeTranscript } from 'youtube-transcript';

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

    // Extract YouTube video ID from URL
    const urlMatch = validatedInput.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (!urlMatch) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      );
    }

    const youtubeId = urlMatch[1];

    // TODO: Fix database connection issue
    // For now, skip database check and always create new video
    console.log('Skipping database check due to connection issues');

    // Fetch video metadata using YouTube Data API v3
    let videoInfo;
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        // Fallback: create mock data for development
        console.log('No YouTube API key found, using mock data');
        videoInfo = {
          snippet: {
            title: 'Sample Video Title',
            channelTitle: 'Sample Channel',
            thumbnails: {
              default: { url: 'https://via.placeholder.com/120x90' }
            }
          },
          contentDetails: {
            duration: 'PT3M33S' // 3 minutes 33 seconds
          }
        };
      } else {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${youtubeId}&key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
          throw new Error('Video not found');
        }
        
        videoInfo = data.items[0];
      }
    } catch (apiError) {
      console.error('YouTube API error:', apiError);
      return NextResponse.json(
        { error: 'Could not fetch video metadata. Video may be private or unavailable.' },
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

    // TODO: Fix database connection issue
    // For now, skip database save and return mock video ID
    console.log('Skipping database save due to connection issues');
    
    const mockVideoId = `mock-${youtubeId}-${Date.now()}`;

    const response: CrawlResponse = {
      videoId: mockVideoId,
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