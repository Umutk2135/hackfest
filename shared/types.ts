/**
 * Kürsü — API contract.
 *
 * THIS FILE IS LAW. Frontend (P1), Backend (P2), and Agents (P3) all read from here.
 * Edits must be agreed in the team channel before merge.
 *
 * Conventions:
 * - All ids are uuid strings.
 * - All timestamps are ISO 8601 strings on the wire (Date objects internally).
 * - All errors use { error: { code, message } }.
 * - SSE events use the protocol documented in netlify/functions/question-ask.ts.
 */

// =====================================================================
// Enums
// =====================================================================

export type LectureStatus = 'draft' | 'live' | 'ended';
export type NoteUploadMethod = 'pdf' | 'paste';
export type QuestionStatus =
  | 'pending'
  | 'answered_by_ai'
  | 'flagged_for_teacher'
  | 'answered_by_teacher';
export type RouteDecision = 'rag' | 'live_transcript' | 'teacher' | 'out_of_scope';
export type CitationSourceType = 'note' | 'transcript';
export type AgentName = 'router' | 'retrieval' | 'answer' | 'flagger' | 'feedback';
export type AgentState = 'running' | 'done' | 'error';

// =====================================================================
// Core entities (wire shape)
// =====================================================================

export interface Lecture {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  description: string | null;
  status: LectureStatus;
  sessionCode: string;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

export interface Teacher {
  id: string;
  name: string;
  createdAt: string;
  lastSeenAt: string;
}

export interface LectureNote {
  id: string;
  lectureId: string;
  filename: string | null;
  uploadMethod: NoteUploadMethod;
  rawTextPreview: string; // first 500 chars only on list views
  chunkCount: number;
  createdAt: string;
}

export interface TranscriptSegment {
  id: string;
  lectureId: string;
  segmentIndex: number;
  content: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  createdAt: string;
}

export interface StudentSession {
  id: string;
  lectureId: string;
  studentName: string;
  studentId: string;
  joinedAt: string;
}

export interface Citation {
  source_type: CitationSourceType;
  reference: string; // "sayfa 2" or "03:42"
  snippet: string; // ≤200 chars
  chunk_id: string;
}

export interface RouterDecision {
  route: RouteDecision;
  confidence: number;
  reasoning: string;
}

export interface Question {
  id: string;
  lectureId: string;
  studentSessionId: string;
  questionText: string;
  askedAt: string;
  status: QuestionStatus;
  routerDecision: RouterDecision | null;
  aiAnswer: string | null;
  aiAnswerConfidence: number | null;
  aiAnswerCitations: Citation[] | null;
  teacherResponse: string | null;
  flaggedReason: string | null;
}

export interface FeedbackReport {
  id: string;
  lectureId: string;
  overallClarityScore: number;
  overallPacingScore: number;
  overallEngagementScore: number;
  rushedConcepts: Array<{ concept: string; timestamp: string; reason: string }>;
  unansweredThreads: Array<{
    question: string;
    asked_at_seconds: number;
    why_unanswered: string;
  }>;
  missingExamples: Array<{ concept: string; suggested_example: string }>;
  pacingAnalysis: Array<{ topic: string; seconds_spent: number; suggested_seconds: number }>;
  suggestedImprovements: string[];
  topConfusionPoints: Array<{ theme: string; question_count: number; sample_quote: string }>;
  generatedAt: string;
  generationDurationMs: number;
}

// =====================================================================
// Request / response DTOs (grouped by endpoint)
// =====================================================================

export interface ApiError {
  error: { code: string; message: string };
}

// --- Teachers ---
export interface RegisterTeacherRequest {
  id?: string;
  name: string;
}
export interface RegisterTeacherResponse {
  teacher: Teacher;
  resolvedExisting: boolean;
}

// --- Lectures ---
export interface CreateLectureRequest {
  title: string;
  subject: string;
  description?: string;
}
export interface CreateLectureResponse {
  id: string;
  sessionCode: string;
  status: LectureStatus;
}

export interface ListLecturesResponse {
  lectures: Lecture[];
}

export interface GetLectureResponse {
  lecture: Lecture;
  notes: LectureNote[];
  transcriptCount: number;
  questionCount: number;
}

export interface LectureByCodeResponse {
  lecture: Lecture;
  isLive: boolean;
}

// --- Notes ---
export interface UploadNotesPasteRequest {
  rawText: string;
}
export interface UploadNotesResponse {
  noteId: string;
  chunkingJobId: string;
}

// --- Live session ---
export interface StartSessionResponse {
  sessionCode: string;
  startedAt: string;
  status: 'live';
}
export interface EndSessionResponse {
  endedAt: string;
  status: 'ended';
  feedbackJobId: string;
}

// --- Transcript ---
export interface TranscriptAppendRequest {
  segmentIndex: number;
  content: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
}
export interface TranscriptAppendResponse {
  ok: true;
  segmentId: string;
}
export interface TranscriptGetResponse {
  segments: TranscriptSegment[];
  latestIndex: number;
}

// --- Student ---
export interface StudentJoinRequest {
  studentName: string;
  studentId: string;
}
export interface StudentJoinResponse {
  studentSessionId: string;
}

// --- Questions ---
export interface AskQuestionRequest {
  studentSessionId: string;
  questionText: string;
}
// AskQuestion response is SSE — see SseQuestionEvent below.

export interface ListQuestionsResponse {
  questions: Question[];
}

export interface TeacherRespondRequest {
  teacherResponse: string;
}
export interface TeacherRespondResponse {
  questionId: string;
  status: 'answered_by_teacher';
}

// --- Feedback ---
export type GetFeedbackResponse =
  | { status: 'generating' } // 202
  | { status: 'ready'; report: FeedbackReport }; // 200

// =====================================================================
// SSE protocol for POST /api/lectures/:id/questions
// =====================================================================

export type SseQuestionEvent =
  | { event: 'status'; data: { agent: AgentName; state: AgentState; [k: string]: unknown } }
  | { event: 'token'; data: { text: string } }
  | { event: 'citation'; data: Citation }
  | {
      event: 'done';
      data: { questionId: string; status: QuestionStatus; confidence?: number };
    }
  | { event: 'error'; data: { code: string; message: string } };

// =====================================================================
// Constants
// =====================================================================

export const DEMO_TEACHER_ID = 'teacher_demo_001';
export const SESSION_CODE_PREFIX = 'KRSU';
export const EMBEDDING_DIM = 1024;
export const MAX_NOTES_PAGES = 25; // hackathon-scale cap
export const MAX_TRANSCRIPT_CHARS = 100_000;
export const ANSWER_CONFIDENCE_FLAG_THRESHOLD = 0.7;
export const TRANSCRIPT_EMBED_DEBOUNCE_MS = 60_000;
