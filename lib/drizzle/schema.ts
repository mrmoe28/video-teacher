import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

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
}, (table) => ({
  urlIdx: index('videos_url_idx').on(table.url),
  channelIdx: index('videos_channel_idx').on(table.channel),
  createdAtIdx: index('videos_created_at_idx').on(table.createdAt)
}));

// Transcripts table
export const transcripts = pgTable('transcripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  videoId: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  source: text('source', { enum: ['captions', 'whisper'] }).notNull(),
  language: text('language').default('en'),
  text: jsonb('text').notNull().$type<Array<{start: number, end: number, text: string}>>(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  videoIdIdx: index('transcripts_video_id_idx').on(table.videoId),
  sourceIdx: index('transcripts_source_idx').on(table.source)
}));

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
}, (table) => ({
  videoIdIdx: index('decks_video_id_idx').on(table.videoId)
}));

// Slides table
export const slides = pgTable('slides', {
  id: uuid('id').primaryKey().defaultRandom(),
  deckId: uuid('deck_id').notNull().references(() => decks.id, { onDelete: 'cascade' }),
  idx: integer('idx').notNull(),
  title: text('title').notNull(),
  bullets: jsonb('bullets').notNull().$type<string[]>(),
  startSeconds: integer('start_s'),
  endSeconds: integer('end_s')
}, (table) => ({
  deckIdIdx: index('slides_deck_id_idx').on(table.deckId),
  idxOrderIdx: index('slides_idx_order_idx').on(table.deckId, table.idx)
}));

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
}, (table) => ({
  statusIdx: index('jobs_status_idx').on(table.status),
  videoIdIdx: index('jobs_video_id_idx').on(table.videoId),
  createdAtIdx: index('jobs_created_at_idx').on(table.createdAt)
}));

// Quizzes table (additional for quiz storage)
export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  slideId: uuid('slide_id').notNull().references(() => slides.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  choices: jsonb('choices').notNull().$type<string[]>(),
  answerIndex: integer('answer_index').notNull(),
  explanation: text('explanation')
});

// Note: Clerk handles user authentication and manages its own user tables

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

// Type exports from table selection
export type Video = typeof videos.$inferSelect;
export type Transcript = typeof transcripts.$inferSelect;
export type Deck = typeof decks.$inferSelect;
export type Slide = typeof slides.$inferSelect;
export type Step = typeof steps.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;

// Insert types
export type NewVideo = typeof videos.$inferInsert;
export type NewTranscript = typeof transcripts.$inferInsert;
export type NewDeck = typeof decks.$inferInsert;
export type NewSlide = typeof slides.$inferInsert;
export type NewStep = typeof steps.$inferInsert;
export type NewJob = typeof jobs.$inferInsert;
export type NewQuiz = typeof quizzes.$inferInsert;