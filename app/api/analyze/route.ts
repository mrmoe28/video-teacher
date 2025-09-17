import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { YoutubeTranscript } from 'youtube-transcript';
import { ValidationError, OpenAIAPIError } from '@/lib/errors';
import { extractYouTubeVideoId } from '@/lib/youtube-url-parser';
import ytdl from 'ytdl-core';
import { createWriteStream, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Input validation schema
const analyzeSchema = z.object({
  url: z.string().url().optional(),
  videoId: z.string().optional(),
}).refine(data => data.url || data.videoId, {
  message: "Either url or videoId must be provided"
});

// Response schema
const analyzeResponseSchema = z.object({
  summary: z.string(),
  topics: z.array(z.string()),
  keyMoments: z.array(z.object({
    timestamp: z.string(),
    description: z.string(),
    importance: z.enum(['high', 'medium', 'low'])
  }))
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe video using OpenAI Whisper API as fallback
 * Extracts audio from YouTube video and sends it to Whisper for transcription
 */
async function transcribeWithWhisper(youtubeId: string): Promise<string> {
  const audioPath = join(tmpdir(), `${youtubeId}_${Date.now()}.mp4`);
  
  try {
    console.log('Extracting audio from YouTube video:', youtubeId);
    
    // Check if video is available and get info
    const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    const info = await ytdl.getInfo(videoUrl);
    
    if (!info) {
      throw new Error('Could not fetch video information');
    }
    
    console.log(`Video found: "${info.videoDetails.title}" - Duration: ${info.videoDetails.lengthSeconds}s`);
    
    // Check video duration (Whisper has limits)
    const durationSeconds = parseInt(info.videoDetails.lengthSeconds || '0');
    if (durationSeconds > 1800) { // 30 minutes limit for efficiency
      throw new Error('Video too long for Whisper transcription (max 30 minutes)');
    }
    
    // Extract audio stream (best quality audio-only)
    const audioStream = ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });
    
    const writeStream = createWriteStream(audioPath);
    audioStream.pipe(writeStream);
    
    // Wait for audio extraction to complete
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log('Audio extraction completed:', audioPath);
        resolve();
      });
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });
    
    console.log('Sending audio to OpenAI Whisper API...');
    
    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: "whisper-1",
      response_format: "text",
      language: "en", // Can be auto-detected by omitting this
    });
    
    console.log('Whisper transcription completed');
    
    if (!transcription || transcription.trim().length === 0) {
      throw new Error('Whisper returned empty transcription');
    }
    
    return transcription.trim();
    
  } catch (error) {
    console.error('Whisper transcription failed:', error);
    throw error;
  } finally {
    // Clean up temporary audio file
    try {
      unlinkSync(audioPath);
      console.log('Temporary audio file cleaned up:', audioPath);
    } catch (cleanupError) {
      console.warn('Failed to clean up audio file:', cleanupError);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = analyzeSchema.safeParse(body);
    if (!validatedInput.success) {
      throw new ValidationError('Invalid input parameters', validatedInput.error.errors);
    }

    const input = validatedInput.data;

    // Extract YouTube video ID from URL if provided
    let youtubeId = input.videoId;
    if (input.url && !youtubeId) {
      const extractedId = extractYouTubeVideoId(input.url);
      if (!extractedId) {
        throw new ValidationError('Invalid YouTube URL format. Supports all YouTube URL formats including youtu.be, mobile, shorts, embed, and more.');
      }
      youtubeId = extractedId;
    }

    if (!youtubeId) {
      throw new ValidationError('Could not extract video ID');
    }

    // Fetch the actual transcript from YouTube (with Whisper fallback)
    let transcript = '';
    let transcriptSource = 'youtube';
    
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(youtubeId);
      transcript = transcriptData.map((item: { text: string }) => item.text).join(' ');
      console.log(`✅ Transcript fetched from YouTube captions (${transcript.length} characters)`);
    } catch (transcriptError) {
      console.error('❌ Failed to fetch YouTube transcript:', transcriptError);
      
      // Fallback to Whisper API for videos without captions
      try {
        console.log('🔄 Attempting Whisper fallback for video:', youtubeId);
        transcript = await transcribeWithWhisper(youtubeId);
        transcriptSource = 'whisper';
        console.log(`✅ Transcript generated using Whisper API (${transcript.length} characters)`);
      } catch (whisperError) {
        console.error('❌ Whisper fallback also failed:', whisperError);
        
        // Provide more specific error messages
        const errorMessage = whisperError instanceof Error ? whisperError.message : 'Unknown error';
        if (errorMessage.includes('too long')) {
          return NextResponse.json(
            { error: 'Video is too long for transcription (maximum 30 minutes supported).' },
            { status: 400 }
          );
        } else if (errorMessage.includes('private') || errorMessage.includes('unavailable')) {
          return NextResponse.json(
            { error: 'Video is private or unavailable for transcription.' },
            { status: 403 }
          );
        } else {
          return NextResponse.json(
            { error: 'Could not transcribe video. The video may not have captions and automatic transcription failed.' },
            { status: 404 }
          );
        }
      }
    }

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'No transcript content available for analysis.' },
        { status: 404 }
      );
    }

    // Analyze the actual transcript content
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an educational content analyzer. Analyze the provided video transcript and create a structured educational analysis that includes:
          1. A comprehensive summary suitable for teachers and students
          2. Key educational topics and concepts covered
          3. Important moments with timestamps and descriptions

          Respond in valid JSON format matching this structure:
          {
            "summary": "string",
            "topics": ["string"],
            "keyMoments": [{"timestamp": "MM:SS", "description": "string", "importance": "high|medium|low"}]
          }

          Make sure the analysis is based on the actual content provided, not generic templates.`
        },
        {
          role: "user",
          content: `Analyze this video transcript and provide educational insights:

          Video ID: ${youtubeId}
          
          Transcript:
          ${transcript.substring(0, 8000)}${transcript.length > 8000 ? '...' : ''}

          Please provide a detailed educational analysis based on the actual content.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    console.log(`📊 Analysis completed using ${transcriptSource} transcript source`);
    
    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new OpenAIAPIError('No analysis generated');
    }

    // Parse and validate the OpenAI response
    let analysisData;
    try {
      analysisData = JSON.parse(result);
    } catch {
      throw new OpenAIAPIError('Invalid response format from AI');
    }

    // Validate the response structure
    const validatedResponse = analyzeResponseSchema.safeParse(analysisData);
    if (!validatedResponse.success) {
      throw new OpenAIAPIError('AI response does not match expected format');
    }

    return NextResponse.json(validatedResponse.data);

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Provide more helpful error messages based on error type
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error instanceof OpenAIAPIError) {
      return NextResponse.json(
        { error: 'AI analysis failed. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Generic error fallback with helpful message
    return NextResponse.json(
      { error: 'Video analysis failed. Please check if the video is accessible and try again.' },
      { status: 500 }
    );
  }
}