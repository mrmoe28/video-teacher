import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Input validation schemas
const createProgressSchema = z.object({
  videoId: z.string().uuid(),
  userId: z.string().uuid().optional(), // For future auth integration
  percent: z.number().min(0).max(100),
  lastPosition: z.number().min(0).optional() // Video position in seconds
});

const getProgressSchema = z.object({
  videoId: z.string().min(1), // Allow any string, not just UUID
  userId: z.string().optional()
});

// Response schemas

export type ProgressResponse = {
  videoId: string;
  userId?: string;
  percent: number;
  lastPosition?: number;
  updatedAt: string;
};

export type VideoProgressResponse = {
  video: {
    id: string;
    title: string;
    channel: string;
    duration: number;
    thumbnailUrl?: string;
    url: string;
  };
  hasTranscript: boolean;
  hasDeck: boolean;
  progress?: ProgressResponse;
};

// In-memory progress store (replace with proper database table in production)
const progressStore = new Map<string, {
  videoId: string;
  userId?: string;
  percent: number;
  lastPosition?: number;
  updatedAt: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = createProgressSchema.parse(body);

    // TODO: Fix database connection issue
    // For now, skip database verification for development
    console.log('Skipping database verification due to connection issues');

    // Create progress key (using videoId + userId for future multi-user support)
    const progressKey = `${validatedInput.videoId}-${validatedInput.userId || 'anonymous'}`;

    // Store progress
    const progressData = {
      videoId: validatedInput.videoId,
      userId: validatedInput.userId,
      percent: validatedInput.percent,
      lastPosition: validatedInput.lastPosition,
      updatedAt: new Date()
    };

    progressStore.set(progressKey, progressData);

    const response: ProgressResponse = {
      videoId: progressData.videoId,
      userId: progressData.userId,
      percent: progressData.percent,
      lastPosition: progressData.lastPosition,
      updatedAt: progressData.updatedAt.toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Create progress error:', error);

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const userId = searchParams.get('userId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId parameter is required' },
        { status: 400 }
      );
    }

    // Validate input
    const validatedInput = getProgressSchema.parse({ 
      videoId, 
      userId: userId || undefined 
    });

    // TODO: Fix database connection issue
    // For now, return mock data for development
    console.log('Skipping database query due to connection issues');
    
    // Check if this is a mock video ID or extract YouTube ID from mock ID
    let youtubeId = validatedInput.videoId;
    let isMockVideo = false;
    
    if (validatedInput.videoId.startsWith('mock-')) {
      isMockVideo = true;
      // Extract YouTube ID from mock ID format: mock-{youtubeId}-{timestamp}
      const mockParts = validatedInput.videoId.split('-');
      if (mockParts.length >= 2) {
        youtubeId = mockParts[1];
      }
    }

    // Try to fetch video metadata from YouTube API
    let videoData = null;
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (apiKey) {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${youtubeId}&key=${apiKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const videoInfo = data.items[0];
            videoData = {
              id: validatedInput.videoId,
              title: videoInfo.snippet.title,
              channel: videoInfo.snippet.channelTitle,
              duration: parseDuration(videoInfo.contentDetails.duration),
              thumbnailUrl: videoInfo.snippet.thumbnails?.default?.url,
              url: `https://www.youtube.com/watch?v=${youtubeId}`
            };
          }
        }
      }
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);
    }

    // If we couldn't fetch real data, use mock data
    if (!videoData) {
      videoData = {
        id: validatedInput.videoId,
        title: isMockVideo ? 'Sample Video Title' : 'Video Not Found',
        channel: isMockVideo ? 'Sample Channel' : 'Unknown',
        duration: isMockVideo ? 213 : 0,
        thumbnailUrl: isMockVideo ? 'https://via.placeholder.com/120x90' : undefined,
        url: `https://www.youtube.com/watch?v=${youtubeId}`
      };
    }

    // Get progress from store
    const progressKey = `${validatedInput.videoId}-${validatedInput.userId || 'anonymous'}`;
    const progressData = progressStore.get(progressKey);

    let progress: ProgressResponse | undefined;
    if (progressData) {
      progress = {
        videoId: progressData.videoId,
        userId: progressData.userId,
        percent: progressData.percent,
        lastPosition: progressData.lastPosition,
        updatedAt: progressData.updatedAt.toISOString()
      };
    }

    // Return the video data with progress
    const response: VideoProgressResponse = {
      video: videoData,
      hasTranscript: isMockVideo, // Mock videos have transcripts, real videos need to be checked
      hasDeck: false,
      progress
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get progress error:', error);

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

// DELETE route to reset progress
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const userId = searchParams.get('userId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId parameter is required' },
        { status: 400 }
      );
    }

    const progressKey = `${videoId}-${userId || 'anonymous'}`;
    const deleted = progressStore.delete(progressKey);

    if (!deleted) {
      return NextResponse.json(
        { error: 'No progress found to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Progress reset successfully' });

  } catch (error) {
    console.error('Delete progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}