# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Video Teacher - A YouTube educational content analyzer that extracts transcripts, generates teaching materials, and creates structured learning decks from YouTube videos. Built with Next.js 15, TypeScript, Drizzle ORM, and PostgreSQL.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Test commands (Vitest configured but no scripts in package.json yet)
npx vitest          # Run tests in watch mode
npx vitest run      # Run tests once
npx vitest --ui     # Run with UI
```

Note: This project uses Turbopack for faster builds in both development and production.

## Database & Schema Management

The project uses Drizzle ORM with PostgreSQL (Neon serverless). Database configuration is in `drizzle.config.ts`.

```bash
# Generate migrations after schema changes
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate

# Open Drizzle Studio for database inspection
npx drizzle-kit studio

# Check migration status
npx drizzle-kit check

# Drop all tables (development only)
npx drizzle-kit drop
```

**Critical**: Database schema is defined in `lib/drizzle/schema.ts`. All schema changes require migration generation before deployment.

## Architecture Overview

### Database Schema Hierarchy
The application uses a hierarchical content structure with strict referential integrity:

1. **Videos** (root entity)
   - YouTube metadata: `youtubeId`, `title`, `channel`, `durationSeconds`
   - Unique constraint on `youtubeId`

2. **Transcripts** → Videos (cascade delete)
   - Source types: `captions` (YouTube auto-captions) or `whisper` (AI-generated)
   - JSON structure: `Array<{start: number, end: number, text: string}>`

3. **Decks** → Videos (cascade delete)
   - Teaching presentations with AI-generated analysis
   - Complex JSON analysis: `keyInsights`, `pitfalls`, `glossary`, `faqs`

4. **Slides** → Decks (cascade delete)
   - Individual slides with `idx` ordering and timing (`startSeconds`, `endSeconds`)
   - Bullet points stored as JSON array

5. **Steps** → Slides (cascade delete)
   - Interactive checklist items with `timestampSeconds` for video synchronization

6. **Quizzes** → Slides (cascade delete)
   - Multiple choice questions with `answerIndex` and explanations

7. **Jobs** (processing pipeline)
   - Status tracking: `queued` → `crawling` → `transcribing` → `analyzing` → `ready` | `error`
   - Progress tracking with `progressInt` and error handling

### Key Technologies
- **Next.js 15**: App Router with TypeScript and Turbopack
- **Drizzle ORM**: Type-safe database queries with automatic Zod schema generation
- **PostgreSQL**: Database (Neon serverless for production, connection pooling)
- **OpenAI**: AI analysis and content generation
- **YouTube APIs**: `youtube-transcript` + `ytdl-core` for metadata and captions
- **Tailwind CSS 4**: Latest version with PostCSS

### Processing Pipeline Dependencies
- `youtube-transcript`: Extract YouTube captions (primary source)
- `ytdl-core`: YouTube video metadata extraction
- `openai`: AI analysis for deck/slide generation
- `p-limit`: Concurrency control for API calls
- `nanoid`: Unique ID generation

## Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Home page
│   ├── globals.css        # Tailwind CSS imports
│   └── api/               # API routes (referenced in vercel.json)
├── lib/
│   ├── drizzle/
│   │   ├── schema.ts      # Complete database schema with Zod validation
│   │   └── migrations/    # Auto-generated SQL migrations
│   └── db.ts              # Database connection with Neon pool
├── vercel.json            # Function configurations (1024MB memory, 60s timeout)
└── drizzle.config.ts      # Schema and migration configuration
```

## Database Connection Architecture

- **Connection**: Neon serverless PostgreSQL via connection pooling
- **ORM**: Drizzle with schema import for type safety
- **Validation**: Automatic Zod schemas generated from Drizzle schema
- **Types**: Full TypeScript types exported for all tables

```typescript
// Database usage pattern
import { db } from '@/lib/db';
import { videos, type Video } from '@/lib/drizzle/schema';

// Type-safe queries with automatic validation
const video = await db.select().from(videos).where(eq(videos.youtubeId, id));
```

## Development Workflow

1. **Schema Changes**:
   - Edit `lib/drizzle/schema.ts`
   - Run `npx drizzle-kit generate` to create migration
   - Run `npx drizzle-kit migrate` to apply to database

2. **API Development**:
   - Create routes in `app/api/` following Next.js 15 App Router conventions
   - Update `vercel.json` for function configuration if needed

3. **Type Safety**:
   - All database operations use Drizzle's generated types
   - Zod schemas automatically generated for validation
   - Import types: `import type { Video, Deck } from '@/lib/drizzle/schema'`

## Environment Variables

Required for database and external services:
- `DATABASE_URL`: PostgreSQL connection string (Neon format)
- `OPENAI_API_KEY`: For content analysis and generation
- Additional YouTube API keys as needed

## Deployment Configuration

Vercel optimizations in `vercel.json`:
- API routes: 60-second timeout, 1024MB memory
- Node.js 20.x runtime
- Specific function configurations for heavy processing routes

## Key Files for Understanding Codebase

- `lib/drizzle/schema.ts`: Complete data model with relationships and constraints
- `lib/db.ts`: Database connection and Drizzle configuration
- `drizzle.config.ts`: Migration generation configuration
- `vercel.json`: Deployment and function timeout configurations
- `package.json`: Dependencies and available scripts