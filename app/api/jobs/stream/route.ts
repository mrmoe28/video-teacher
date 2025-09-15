import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jobs } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return new Response('Missing jobId parameter', { status: 400 });
  }

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let isActive = true;
      let lastStatus = '';
      let lastProgress = -1;

      const sendUpdate = (data: { type: string; message?: string; jobId?: string; status?: string; progress?: number; videoId?: string | null; error?: string | null; updatedAt?: Date }) => {
        if (!isActive) return;

        const sseData = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(sseData));
      };

      const checkJobStatus = async () => {
        try {
          if (!isActive) return;

          const jobResult = await db
            .select()
            .from(jobs)
            .where(eq(jobs.id, jobId))
            .limit(1);

          if (jobResult.length === 0) {
            sendUpdate({
              type: 'error',
              message: 'Job not found',
              jobId
            });
            cleanup();
            return;
          }

          const job = jobResult[0];
          const statusChanged = job.status !== lastStatus;
          const progressChanged = job.progressInt !== lastProgress;

          if (statusChanged || progressChanged) {
            lastStatus = job.status;
            lastProgress = job.progressInt || 0;

            sendUpdate({
              type: 'update',
              jobId: job.id,
              status: job.status,
              progress: job.progressInt ?? 0,
              videoId: job.videoId,
              error: job.errorText,
              updatedAt: job.updatedAt
            });

            // If job is complete or errored, send final message and close
            if (job.status === 'ready' || job.status === 'error') {
              setTimeout(() => {
                sendUpdate({
                  type: job.status === 'ready' ? 'complete' : 'error',
                  jobId: job.id,
                  status: job.status,
                  message: job.status === 'ready'
                    ? 'Job completed successfully'
                    : job.errorText || 'Job failed with unknown error'
                });
                cleanup();
              }, 1000);
            }
          }
        } catch (error) {
          console.error('Error checking job status:', error);
          sendUpdate({
            type: 'error',
            message: 'Error checking job status',
            jobId
          });
          cleanup();
        }
      };

      const cleanup = () => {
        isActive = false;
        if (interval) {
          clearInterval(interval);
        }
        controller.close();
      };

      // Send initial connection confirmation
      sendUpdate({
        type: 'connected',
        message: 'Connected to job stream',
        jobId
      });

      // Check job status immediately
      checkJobStatus();

      // Set up polling interval (every 2 seconds)
      const interval = setInterval(checkJobStatus, 2000);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', cleanup);

      // Set a maximum connection time (5 minutes)
      setTimeout(cleanup, 5 * 60 * 1000);
    }
  });

  return new Response(stream, { headers });
}