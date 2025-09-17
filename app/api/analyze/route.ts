import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { YoutubeTranscript } from 'youtube-transcript';
import { ValidationError, OpenAIAPIError } from '@/lib/errors';
import { extractYouTubeVideoId } from '@/lib/youtube-url-parser';

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
 * This requires extracting audio from the YouTube video
 */
async function transcribeWithWhisper(_youtubeId: string): Promise<string> {
  // For now, we'll use a placeholder that simulates Whisper
  // In production, you would:
  // 1. Extract audio from YouTube video (using ytdl-core or similar)
  // 2. Send audio to OpenAI Whisper API
  // 3. Return the transcription
  
  // Placeholder implementation - in reality this would be more complex
  throw new Error('Whisper transcription not yet implemented - requires audio extraction');
  
  // Real implementation would look like:
  /*
  const ytdl = require('ytdl-core');
  const fs = require('fs');
  const path = require('path');
  
  // Extract audio
  const audioPath = path.join('/tmp', `${youtubeId}.mp3`);
  const audioStream = ytdl(youtubeId, { filter: 'audioonly' });
  const writeStream = fs.createWriteStream(audioPath);
  audioStream.pipe(writeStream);
  
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
  
  // Transcribe with Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
  });
  
  // Clean up
  fs.unlinkSync(audioPath);
  
  return transcription.text;
  */
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
    const transcriptSource = 'youtube'; // Will be used for future metadata tracking
    
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(youtubeId);
      transcript = transcriptData.map((item: { text: string }) => item.text).join(' ');
      console.log('Transcript fetched from YouTube captions');
    } catch (transcriptError) {
      console.error('Failed to fetch YouTube transcript:', transcriptError);
      
      // Fallback to Whisper API for videos without captions
      try {
        console.log('Attempting Whisper fallback for video:', youtubeId);
        transcript = await transcribeWithWhisper(youtubeId);
        // transcriptSource = 'whisper'; // Future enhancement
        console.log('Transcript generated using Whisper API');
      } catch (whisperError) {
        console.error('Whisper fallback also failed:', whisperError);
        return NextResponse.json(
          { error: 'Could not fetch video transcript. The video may not have captions available and Whisper transcription failed.' },
          { status: 404 }
        );
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