-- OWNER: P2 (Backend)
-- Initial Netlify Database migration. Keep in sync with db/migrations/0000_initial.sql.

DO $$ BEGIN
  CREATE TYPE lecture_status AS ENUM ('draft', 'live', 'ended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE note_upload_method AS ENUM ('pdf', 'paste');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE question_status AS ENUM (
    'pending', 'answered_by_ai', 'flagged_for_teacher', 'answered_by_teacher'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id text NOT NULL,
  title text NOT NULL,
  subject text NOT NULL,
  description text,
  status lecture_status NOT NULL DEFAULT 'draft',
  session_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS lectures_session_code_uidx ON lectures(session_code);
CREATE INDEX IF NOT EXISTS lectures_teacher_idx ON lectures(teacher_id);

CREATE TABLE IF NOT EXISTS lecture_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  filename text,
  raw_text text NOT NULL,
  upload_method note_upload_method NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lecture_notes_lecture_idx ON lecture_notes(lecture_id);

CREATE TABLE IF NOT EXISTS note_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  source_note_id uuid NOT NULL REFERENCES lecture_notes(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding jsonb NOT NULL,
  page_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS note_chunks_lecture_idx ON note_chunks(lecture_id);
CREATE UNIQUE INDEX IF NOT EXISTS note_chunks_note_chunk_uidx
  ON note_chunks(source_note_id, chunk_index);

CREATE TABLE IF NOT EXISTS transcript_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  segment_index integer NOT NULL,
  content text NOT NULL,
  start_time_seconds integer NOT NULL,
  end_time_seconds integer NOT NULL,
  embedding jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transcript_segments_lecture_idx ON transcript_segments(lecture_id);
CREATE UNIQUE INDEX IF NOT EXISTS transcript_segments_lecture_segment_uidx
  ON transcript_segments(lecture_id, segment_index);

CREATE TABLE IF NOT EXISTS student_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_id text NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS student_sessions_lecture_idx ON student_sessions(lecture_id);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  student_session_id uuid NOT NULL REFERENCES student_sessions(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  asked_at timestamptz NOT NULL DEFAULT now(),
  status question_status NOT NULL DEFAULT 'pending',
  router_decision jsonb,
  ai_answer text,
  ai_answer_confidence real,
  ai_answer_citations jsonb,
  teacher_response text,
  flagged_reason text
);
CREATE INDEX IF NOT EXISTS questions_lecture_idx ON questions(lecture_id);
CREATE INDEX IF NOT EXISTS questions_status_idx ON questions(lecture_id, status);

CREATE TABLE IF NOT EXISTS feedback_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  overall_clarity_score integer NOT NULL,
  overall_pacing_score integer NOT NULL,
  overall_engagement_score integer NOT NULL,
  rushed_concepts jsonb NOT NULL,
  unanswered_threads jsonb NOT NULL,
  missing_examples jsonb NOT NULL,
  pacing_analysis jsonb NOT NULL,
  suggested_improvements jsonb NOT NULL,
  top_confusion_points jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  generation_duration_ms integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS feedback_reports_lecture_uidx
  ON feedback_reports(lecture_id);
