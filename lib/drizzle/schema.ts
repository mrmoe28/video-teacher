import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, primaryKey } from 'drizzle-orm/pg-core';
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

// ============== Auth.js Tables ==============
// Users table for authentication
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Accounts table for OAuth providers
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state')
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] })
}));

// Sessions table for user sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: text('session_token').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull()
});

// Verification tokens for email verification
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull()
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
}));

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