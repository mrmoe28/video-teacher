import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { jobs, videos, transcripts } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { extractYouTubeVideoId } from '@/lib/youtube-url-parser';

// Input validation schema
const transcribeSchema = z.object({
  url: z.string().url().optional(),
  videoId: z.string().uuid().optional(),
  uploadStub: z.string().optional() // For future file upload support
}).refine(data => data.url || data.videoId || data.uploadStub, {
  message: "Either url, videoId, or uploadStub must be provided"
});

export type TranscribeResponse = {
  jobId: string;
  status: 'queued' | 'crawling' | 'transcribing' | 'analyzing' | 'ready' | 'error';
  videoId?: string;
  message: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = transcribeSchema.parse(body);

    let videoId = validatedInput.videoId;

    // If URL is provided, we need to crawl first or find existing video
    if (validatedInput.url && !videoId) {
      // Extract YouTube video ID using comprehensive parser
      const youtubeId = extractYouTubeVideoId(validatedInput.url);
      if (!youtubeId) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL format. Supports all YouTube URL formats including youtu.be, mobile, shorts, embed, and more.' },
          { status: 400 }
        );
      }

      // Check if video already exists
      const existingVideo = await db
        .select()
        .from(videos)
        .where(eq(videos.youtubeId, youtubeId))
        .limit(1);

      if (existingVideo.length > 0) {
        videoId = existingVideo[0].id;

        // Check if transcript already exists
        const existingTranscript = await db
          .select()
          .from(transcripts)
          .where(eq(transcripts.videoId, videoId))
          .limit(1);

        if (existingTranscript.length > 0) {
          return NextResponse.json({
            jobId: 'existing',
            status: 'ready' as const,
            videoId,
            message: 'Transcript already exists for this video'
          });
        }
      }
    }

    // Create a new job
    const jobId = nanoid();
    const newJob = await db
      .insert(jobs)
      .values({
        id: jobId,
        videoId: videoId || null,
        status: videoId ? 'transcribing' : 'crawling',
        progressInt: 0
      })
      .returning()
      .then(rows => rows[0]);

    // TODO: In a real implementation, you would:
    // 1. Add the job to a queue (Redis, Bull, etc.)
    // 2. Process jobs in background workers
    // 3. Update job status as processing proceeds

    // For now, we'll simulate the job creation
    const response: TranscribeResponse = {
      jobId: newJob.id,
      status: newJob.status as TranscribeResponse['status'],
      videoId,
      message: videoId
        ? 'Transcription job queued for existing video'
        : 'Job queued - will crawl video metadata then transcribe'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Transcribe error:', error);

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

// GET route for polling job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter is required' },
        { status: 400 }
      );
    }

    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const jobData = job[0];

    const response = {
      jobId: jobData.id,
      status: jobData.status,
      progress: jobData.progressInt,
      videoId: jobData.videoId,
      error: jobData.errorText,
      createdAt: jobData.createdAt,
      updatedAt: jobData.updatedAt
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Job status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}