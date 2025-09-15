import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Videos table
export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  youtubeId: text('youtube_id').notNull().unique(),
  title: text('title'),
  channel: text('channel'),
  durationSeconds: integer('duration_s'),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Transcripts table
export const transcripts = pgTable('transcripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  source: text('source', { enum: ['captions', 'whisper'] }).notNull(),
  language: text('language').default('en'),
  text: jsonb('text').notNull().$type<Array<{start: number, end: number, text: string}>>(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Decks table
export const decks = pgTable('decks', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  summary: text('summary'),
  analysis: jsonb('analysis').$type<{
    keyInsights: string[],
    pitfalls: string[],
    glossary: Array<{term: string, definition: string}>,
    faqs: Array<{q: string, a: string}>
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Slides table
export const slides = pgTable('slides', {
  id: uuid('id').primaryKey().defaultRandom(),
  deckId: uuid('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  idx: integer('idx').notNull(),
  title: text('title').notNull(),
  bullets: jsonb('bullets').notNull().$type<string[]>(),
  startSeconds: integer('start_s'),
  endSeconds: integer('end_s')
});

// Steps table
export const steps = pgTable('steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  slideId: uuid('slide_id').notNull().references(() => slides.id, { onDelete: 'cascade' }),
  idx: integer('idx').notNull(),
  text: text('text').notNull(),
  doneDefault: boolean('done_default').default(false),
  timestampSeconds: integer('timestamp_s')
});

// Jobs table
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('video_id').references(() => videos.id, { onDelete: 'set null' }),
  status: text('status', {
    enum: ['queued', 'crawling', 'transcribing', 'analyzing', 'ready', 'error']
  }).notNull().default('queued'),
  progressInt: integer('progress_int').default(0),
  errorText: text('error_text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Quizzes table (additional for quiz storage)
export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  slideId: uuid('slide_id').notNull().references(() => slides.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  choices: jsonb('choices').notNull().$type<string[]>(),
  answerIndex: integer('answer_index').notNull(),
  explanation: text('explanation')
});

// Create Zod schemas for validation
export const insertVideoSchema = createInsertSchema(videos);
export const selectVideoSchema = createSelectSchema(videos);
export const insertTranscriptSchema = createInsertSchema(transcripts);
export const selectTranscriptSchema = createSelectSchema(transcripts);
export const insertDeckSchema = createInsertSchema(decks);
export const selectDeckSchema = createSelectSchema(decks);
export const insertSlideSchema = createInsertSchema(slides);
export const selectSlideSchema = createSelectSchema(slides);
export const insertStepSchema = createInsertSchema(steps);
export const selectStepSchema = createSelectSchema(steps);
export const insertJobSchema = createInsertSchema(jobs);
export const selectJobSchema = createSelectSchema(jobs);
export const insertQuizSchema = createInsertSchema(quizzes);
export const selectQuizSchema = createSelectSchema(quizzes);

// Type exports
export type Video = z.infer<typeof selectVideoSchema>;
export type Transcript = z.infer<typeof selectTranscriptSchema>;
export type Deck = z.infer<typeof selectDeckSchema>;
export type Slide = z.infer<typeof selectSlideSchema>;
export type Step = z.infer<typeof selectStepSchema>;
export type Job = z.infer<typeof selectJobSchema>;
export type Quiz = z.infer<typeof selectQuizSchema>;