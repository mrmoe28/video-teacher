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
```

**Important**: Database schema is defined in `lib/drizzle/schema.ts`. All schema changes require migration generation.

## Architecture Overview

### Database Schema
The application centers around a hierarchical content structure:
- **Videos**: YouTube video metadata and basic info
- **Transcripts**: Extracted captions or Whisper-generated transcripts
- **Decks**: Generated teaching presentations from video content
- **Slides**: Individual slides within a deck with timing information
- **Steps**: Interactive checklist items within slides
- **Jobs**: Processing status tracking for video analysis pipeline
- **Quizzes**: Quiz questions associated with slides

### Key Technologies
- **Next.js 15**: App Router with TypeScript
- **Drizzle ORM**: Type-safe database queries with Zod validation
- **PostgreSQL**: Database (Neon serverless for production)
- **OpenAI**: AI analysis and content generation
- **YouTube APIs**: Video metadata and transcript extraction
- **Tailwind CSS 4**: Styling with PostCSS

### Core Dependencies
- `youtube-transcript`: Extract YouTube captions
- `ytdl-core`: YouTube video metadata
- `openai`: AI content analysis
- `drizzle-orm` + `drizzle-zod`: Database ORM with validation
- `@neondatabase/serverless`: PostgreSQL connection

## Project Structure

```
├── app/                    # Next.js App Router pages
├── lib/
│   ├── drizzle/
│   │   ├── schema.ts      # Database schema definitions
│   │   └── migrations/    # Generated migration files
│   └── db.ts              # Database connection setup
├── components/            # Reusable React components (empty)
├── api/                   # Standalone API directory (empty)
├── tests/
│   ├── unit/             # Unit tests (empty)
│   └── e2e/              # End-to-end tests (empty)
└── vercel.json           # Vercel deployment configuration
```

## Deployment Configuration

The project is configured for Vercel deployment with specific function configurations:
- API routes have 60-second timeout and 1024MB memory
- Supports both Next.js API routes and standalone Express API
- Environment variables must include `DATABASE_URL` for PostgreSQL connection

## Development Workflow

1. **Database Changes**: Always update `lib/drizzle/schema.ts` first, then generate migrations
2. **API Development**: Create API routes in `app/api/` directory following Next.js 15 conventions
3. **Type Safety**: All database operations use Drizzle's type-safe queries with Zod validation
4. **Testing**: Structure tests in `tests/unit/` and `tests/e2e/` directories (Vitest configured)

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (Neon serverless format)
- Additional API keys as needed for OpenAI and YouTube services

## Key Files to Understand

- `lib/drizzle/schema.ts`: Complete database schema with relationships and types
- `lib/db.ts`: Database connection and Drizzle setup
- `drizzle.config.ts`: Migration and schema generation configuration
- `vercel.json`: Deployment configuration for API functions