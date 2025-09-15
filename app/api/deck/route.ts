import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { db } from '@/lib/db';
import { decks, slides, videos, transcripts } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

// Input validation schema
const deckSchema = z.object({
  videoId: z.string().uuid(),
  title: z.string().optional()
});

// Flashcard schema
const flashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
  tags: z.array(z.string())
});

// Response schema
const deckResponseSchema = z.object({
  deckId: z.string(),
  title: z.string(),
  summary: z.string(),
  flashcards: z.array(flashcardSchema),
  keyInsights: z.array(z.string()),
  pitfalls: z.array(z.string()),
  glossary: z.array(z.object({
    term: z.string(),
    definition: z.string()
  })),
  faqs: z.array(z.object({
    q: z.string(),
    a: z.string()
  }))
});

export type DeckResponse = z.infer<typeof deckResponseSchema>;
export type Flashcard = z.infer<typeof flashcardSchema>;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = deckSchema.parse(body);

    // Get video details
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

    const videoData = video[0];

    // Get transcript
    const transcript = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.videoId, validatedInput.videoId))
      .limit(1);

    if (transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript available for this video' },
        { status: 400 }
      );
    }

    const transcriptData = transcript[0];

    // Extract text from transcript JSON
    const transcriptText = (transcriptData.text as any[])
      .map(item => item.text)
      .join(' ');

    // Generate deck content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an educational content creator that generates comprehensive learning materials from video transcripts.

          Create a learning deck that includes:
          1. A summary of the main content
          2. 8-12 flashcards covering key concepts
          3. Key insights (3-5 important takeaways)
          4. Common pitfalls or misconceptions (2-4 items)
          5. Glossary of important terms (5-8 terms)
          6. Frequently asked questions (3-5 Q&As)

          Format your response as valid JSON matching this exact structure:
          {
            "title": "string",
            "summary": "string",
            "flashcards": [{"front": "string", "back": "string", "tags": ["string"]}],
            "keyInsights": ["string"],
            "pitfalls": ["string"],
            "glossary": [{"term": "string", "definition": "string"}],
            "faqs": [{"q": "string", "a": "string"}]
          }

          Make flashcards educational and engaging. Use active recall principles.`
        },
        {
          role: "user",
          content: `Create a learning deck for this video:

          Title: ${videoData.title}
          Channel: ${videoData.channel}
          Duration: ${Math.floor((videoData.durationSeconds || 0) / 60)} minutes

          Transcript:
          ${transcriptText.substring(0, 8000)}${transcriptText.length > 8000 ? '...' : ''}`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      return NextResponse.json(
        { error: 'No deck content generated' },
        { status: 500 }
      );
    }

    // Parse AI response
    let deckContent;
    try {
      deckContent = JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse AI response:', result);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Validate response structure
    const validatedDeck = deckResponseSchema.omit({ deckId: true }).parse(deckContent);

    // Create deck in database
    const deckTitle = validatedInput.title || validatedDeck.title || `${videoData.title} - Study Deck`;

    const newDeck = await db
      .insert(decks)
      .values({
        videoId: validatedInput.videoId,
        title: deckTitle,
        summary: validatedDeck.summary,
        analysis: {
          keyInsights: validatedDeck.keyInsights,
          pitfalls: validatedDeck.pitfalls,
          glossary: validatedDeck.glossary,
          faqs: validatedDeck.faqs
        }
      })
      .returning()
      .then(rows => rows[0]);

    // Create slides for flashcards
    for (let i = 0; i < validatedDeck.flashcards.length; i++) {
      const flashcard = validatedDeck.flashcards[i];
      await db
        .insert(slides)
        .values({
          deckId: newDeck.id,
          idx: i,
          title: flashcard.front,
          bullets: [flashcard.back, ...flashcard.tags.map(tag => `#${tag}`)]
        });
    }

    const response: DeckResponse = {
      deckId: newDeck.id,
      title: deckTitle,
      summary: validatedDeck.summary,
      flashcards: validatedDeck.flashcards,
      keyInsights: validatedDeck.keyInsights,
      pitfalls: validatedDeck.pitfalls,
      glossary: validatedDeck.glossary,
      faqs: validatedDeck.faqs
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Deck generation error:', error);

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

// GET route to retrieve existing deck
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get('deckId');
    const videoId = searchParams.get('videoId');

    if (!deckId && !videoId) {
      return NextResponse.json(
        { error: 'Either deckId or videoId parameter is required' },
        { status: 400 }
      );
    }

    let deck;
    if (deckId) {
      const deckResult = await db
        .select()
        .from(decks)
        .where(eq(decks.id, deckId))
        .limit(1);

      if (deckResult.length === 0) {
        return NextResponse.json(
          { error: 'Deck not found' },
          { status: 404 }
        );
      }
      deck = deckResult[0];
    } else if (videoId) {
      const deckResult = await db
        .select()
        .from(decks)
        .where(eq(decks.videoId, videoId))
        .limit(1);

      if (deckResult.length === 0) {
        return NextResponse.json(
          { error: 'No deck found for this video' },
          { status: 404 }
        );
      }
      deck = deckResult[0];
    }

    // Get slides/flashcards
    const slideResults = await db
      .select()
      .from(slides)
      .where(eq(slides.deckId, deck!.id))
      .orderBy(slides.idx);

    const flashcards = slideResults.map(slide => ({
      front: slide.title,
      back: slide.bullets[0] || '',
      tags: slide.bullets.slice(1).map(tag => tag.replace('#', ''))
    }));

    const analysis = deck!.analysis as any;

    const response: DeckResponse = {
      deckId: deck!.id,
      title: deck!.title,
      summary: deck!.summary || '',
      flashcards,
      keyInsights: analysis?.keyInsights || [],
      pitfalls: analysis?.pitfalls || [],
      glossary: analysis?.glossary || [],
      faqs: analysis?.faqs || []
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Deck retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}