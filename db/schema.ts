/**
 * OWNER: P2 (Backend)
 * Drizzle ORM schema + pgvector custom type for embeddings.
 * The HNSW indexes are created in migrations/0000_initial.sql (Drizzle does not yet emit HNSW).
 */
import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  real,
  pgEnum,
  uniqueIndex,
  index,
  customType,
} from 'drizzle-orm/pg-core';
import type {
  RouterDecision,
  Citation,
  FeedbackReport as FeedbackReportPayload,
} from '../shared/types';

// 1024-dimensional vector (voyage-3-large).
export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1024)';
  },
  toDriver(value) {
    return `[${value.join(',')}]`;
  },
  fromDriver(value) {
    return (value as string).replace(/^\[|\]$/g, '').split(',').map(Number);
  },
});

// ---- enums ----
export const lectureStatus = pgEnum('lecture_status', ['draft', 'live', 'ended']);
export const noteUploadMethod = pgEnum('note_upload_method', ['pdf', 'paste']);
export const questionStatus = pgEnum('question_status', [
  'pending',
  'answered_by_ai',
  'flagged_for_teacher',
  'answered_by_teacher',
]);

// ---- tables ----
export const lectures = pgTable(
  'lectures',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: text('teacher_id').notNull(),
    title: text('title').notNull(),
    subject: text('subject').notNull(),
    description: text('description'),
    status: lectureStatus('status').notNull().default('draft'),
    sessionCode: text('session_code').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    endedAt: timestamp('ended_at', { withTimezone: true }),
  },
  (t) => ({
    sessionCodeIdx: uniqueIndex('lectures_session_code_uidx').on(t.sessionCode),
    teacherIdx: index('lectures_teacher_idx').on(t.teacherId),
  }),
);

export const lectureNotes = pgTable(
  'lecture_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lectureId: uuid('lecture_id')
      .notNull()
      .references(() => lectures.id, { onDelete: 'cascade' }),
    filename: text('filename'),
    rawText: text('raw_text').notNull(),
    uploadMethod: noteUploadMethod('upload_method').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    lectureIdx: index('lecture_notes_lecture_idx').on(t.lectureId),
  }),
);

export const noteChunks = pgTable(
  'note_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lectureId: uuid('lecture_id')
      .notNull()
      .references(() => lectures.id, { onDelete: 'cascade' }),
    sourceNoteId: uuid('source_note_id')
      .notNull()
      .references(() => lectureNotes.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding').notNull(),
    pageReference: text('page_reference'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    lectureIdx: index('note_chunks_lecture_idx').on(t.lectureId),
  }),
);

export const transcriptSegments = pgTable(
  'transcript_segments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lectureId: uuid('lecture_id')
      .notNull()
      .references(() => lectures.id, { onDelete: 'cascade' }),
    segmentIndex: integer('segment_index').notNull(),
    content: text('content').notNull(),
    startTimeSeconds: integer('start_time_seconds').notNull(),
    endTimeSeconds: integer('end_time_seconds').notNull(),
    embedding: vector('embedding'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    lectureIdx: index('transcript_segments_lecture_idx').on(t.lectureId),
    lectureSegmentUidx: uniqueIndex('transcript_segments_lecture_segment_uidx').on(
      t.lectureId,
      t.segmentIndex,
    ),
  }),
);

export const studentSessions = pgTable(
  'student_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lectureId: uuid('lecture_id')
      .notNull()
      .references(() => lectures.id, { onDelete: 'cascade' }),
    studentName: text('student_name').notNull(),
    studentId: text('student_id').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    lectureIdx: index('student_sessions_lecture_idx').on(t.lectureId),
  }),
);

export const questions = pgTable(
  'questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lectureId: uuid('lecture_id')
      .notNull()
      .references(() => lectures.id, { onDelete: 'cascade' }),
    studentSessionId: uuid('student_session_id')
      .notNull()
      .references(() => studentSessions.id, { onDelete: 'cascade' }),
    questionText: text('question_text').notNull(),
    askedAt: timestamp('asked_at', { withTimezone: true }).notNull().defaultNow(),
    status: questionStatus('status').notNull().default('pending'),
    routerDecision: jsonb('router_decision').$type<RouterDecision>(),
    aiAnswer: text('ai_answer'),
    aiAnswerConfidence: real('ai_answer_confidence'),
    aiAnswerCitations: jsonb('ai_answer_citations').$type<Citation[]>(),
    teacherResponse: text('teacher_response'),
    flaggedReason: text('flagged_reason'),
  },
  (t) => ({
    lectureIdx: index('questions_lecture_idx').on(t.lectureId),
    statusIdx: index('questions_status_idx').on(t.lectureId, t.status),
  }),
);

export const feedbackReports = pgTable(
  'feedback_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lectureId: uuid('lecture_id')
      .notNull()
      .references(() => lectures.id, { onDelete: 'cascade' }),
    overallClarityScore: integer('overall_clarity_score').notNull(),
    overallPacingScore: integer('overall_pacing_score').notNull(),
    overallEngagementScore: integer('overall_engagement_score').notNull(),
    rushedConcepts: jsonb('rushed_concepts').notNull().$type<FeedbackReportPayload['rushedConcepts']>(),
    unansweredThreads: jsonb('unanswered_threads')
      .notNull()
      .$type<FeedbackReportPayload['unansweredThreads']>(),
    missingExamples: jsonb('missing_examples')
      .notNull()
      .$type<FeedbackReportPayload['missingExamples']>(),
    pacingAnalysis: jsonb('pacing_analysis')
      .notNull()
      .$type<FeedbackReportPayload['pacingAnalysis']>(),
    suggestedImprovements: jsonb('suggested_improvements').notNull().$type<string[]>(),
    topConfusionPoints: jsonb('top_confusion_points')
      .notNull()
      .$type<FeedbackReportPayload['topConfusionPoints']>(),
    generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
    generationDurationMs: integer('generation_duration_ms').notNull(),
  },
  (t) => ({
    lectureUidx: uniqueIndex('feedback_reports_lecture_uidx').on(t.lectureId),
  }),
);

// ---- inferred row types (handy for P2/P3) ----
export type LectureRow = typeof lectures.$inferSelect;
export type LectureInsert = typeof lectures.$inferInsert;
export type NoteRow = typeof lectureNotes.$inferSelect;
export type NoteChunkRow = typeof noteChunks.$inferSelect;
export type TranscriptRow = typeof transcriptSegments.$inferSelect;
export type StudentSessionRow = typeof studentSessions.$inferSelect;
export type QuestionRow = typeof questions.$inferSelect;
export type FeedbackRow = typeof feedbackReports.$inferSelect;
