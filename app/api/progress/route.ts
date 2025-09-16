import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { videos, transcripts, decks } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

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

    // Verify video exists
    const video = await db
      .select()
      .from(videos)
      .where(eq(videos.id, validatedInput.videoId))
      .limit(1);

    if (video.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

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
    
    // Check if this is a mock video ID
    if (validatedInput.videoId.startsWith('mock-')) {
      const mockVideoData = {
        id: validatedInput.videoId,
        title: 'Sample Video Title',
        channel: 'Sample Channel',
        durationSeconds: 213,
        thumbnailUrl: 'https://via.placeholder.com/120x90',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      };

      const response: VideoProgressResponse = {
        video: {
          id: mockVideoData.id,
          title: mockVideoData.title,
          channel: mockVideoData.channel,
          duration: mockVideoData.durationSeconds,
          thumbnailUrl: mockVideoData.thumbnailUrl,
          url: mockVideoData.url
        },
        hasTranscript: true, // Mock as having transcript
        hasDeck: false,
        progress: undefined
      };

      return NextResponse.json(response);
    }

    // For non-mock IDs, return error
    return NextResponse.json(
      { error: 'Video not found' },
      { status: 404 }
    );

    // Get progress
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

    const response: VideoProgressResponse = {
      video: {
        id: videoData.id,
        title: videoData.title || 'Unknown Title',
        channel: videoData.channel || 'Unknown Channel',
        duration: videoData.durationSeconds || 0,
        thumbnailUrl: videoData.thumbnailUrl || undefined,
        url: videoData.url
      },
      hasTranscript: transcript.length > 0,
      hasDeck: deck.length > 0,
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