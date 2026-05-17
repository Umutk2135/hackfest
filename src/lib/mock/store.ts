/**
 * OWNER: P1 (Frontend)
 * In-memory state for mock API mode.
 */
import type {
  Lecture,
  LectureNote,
  TranscriptSegment,
  Question,
  FeedbackReport,
  LectureStatus,
  QuestionStatus,
} from '@shared/types';
import { DEMO_TEACHER_ID } from '@shared/types';
import type { Teacher } from '@shared/types';

export const DEMO_LECTURE_ID = '11111111-1111-4111-8111-111111111111';

const DEMO_TRANSCRIPT_LINES = [
  'Ridge regresyon, L2 cezasını ekleyerek katsayıları küçülten bir doğrusal modeldir.',
  'Lambda büyüdükçe katsayılar sıfıra yaklaşır; fazla büyürse underfitting görürsünüz.',
  'Normal denklemde çok değişken varken overfitting riski artar.',
];

export interface MockStore {
  teachers: Map<string, Teacher>;
  lectures: Map<string, Lecture>;
  notes: Map<string, LectureNote[]>;
  transcripts: Map<string, TranscriptSegment[]>;
  questions: Map<string, Question[]>;
  sessions: Map<string, { id: string; lectureId: string; studentName: string; studentId: string }>;
  feedback: Map<string, FeedbackReport | 'generating'>;
  sessionCodes: Map<string, string>;
  nextCode: number;
}

function isoNow() {
  return new Date().toISOString();
}

function uid() {
  return crypto.randomUUID();
}

function makeSessionCode(n: number) {
  return `KRSU-${String(n).padStart(4, '0')}`;
}

export function createInitialStore(): MockStore {
  const now = isoNow();
  const demo: Lecture = {
    id: DEMO_LECTURE_ID,
    teacherId: DEMO_TEACHER_ID,
    title: 'Ridge Regresyon Nedir?',
    subject: 'Makine Öğrenmesi',
    description: 'Demo amaçlı örnek ders (mock).',
    status: 'draft',
    sessionCode: 'KRSU-DEMO',
    createdAt: now,
    startedAt: null,
    endedAt: null,
  };

  const store: MockStore = {
    teachers: new Map([
      [
        DEMO_TEACHER_ID,
        { id: DEMO_TEACHER_ID, name: 'Demo Öğretmen', createdAt: now, lastSeenAt: now },
      ],
    ]),
    lectures: new Map([[demo.id, demo]]),
    notes: new Map(),
    transcripts: new Map(),
    questions: new Map([[demo.id, []]]),
    sessions: new Map(),
    feedback: new Map(),
    sessionCodes: new Map([['KRSU-DEMO', demo.id]]),
    nextCode: 7822,
  };

  return store;
}

let store = createInitialStore();

export function getStore() {
  return store;
}

export function resetMockStore() {
  store = createInitialStore();
}

export function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function findLectureByCode(code: string): Lecture | undefined {
  const id = store.sessionCodes.get(code.toUpperCase());
  return id ? store.lectures.get(id) : undefined;
}

export function seedLiveTranscript(lectureId: string) {
  const existing = store.transcripts.get(lectureId) ?? [];
  if (existing.length > 0) return;
  const now = isoNow();
  const segments: TranscriptSegment[] = DEMO_TRANSCRIPT_LINES.map((content, i) => ({
    id: uid(),
    lectureId,
    segmentIndex: i,
    content,
    startTimeSeconds: i * 15,
    endTimeSeconds: (i + 1) * 15,
    createdAt: now,
  }));
  store.transcripts.set(lectureId, segments);
}

export function setLectureStatus(lectureId: string, status: LectureStatus) {
  const lec = store.lectures.get(lectureId);
  if (!lec) return;
  const now = isoNow();
  if (status === 'live') {
    store.lectures.set(lectureId, { ...lec, status, startedAt: lec.startedAt ?? now });
    seedLiveTranscript(lectureId);
  } else if (status === 'ended') {
    store.lectures.set(lectureId, { ...lec, status, endedAt: now });
    store.feedback.set(lectureId, 'generating');
    void (async () => {
      await delay(1500);
      store.feedback.set(lectureId, buildFeedbackReport(lectureId));
    })();
  } else {
    store.lectures.set(lectureId, { ...lec, status });
  }
}

function buildFeedbackReport(lectureId: string): FeedbackReport {
  return {
    id: uid(),
    lectureId,
    overallClarityScore: 7.8,
    overallPacingScore: 6.9,
    overallEngagementScore: 8.2,
    rushedConcepts: [
      {
        concept: 'Lambda (regularization strength)',
        timestamp: '02:15',
        reason: 'Kavram hızlı geçildi; öğrenci sorusu bunu doğruladı.',
      },
    ],
    unansweredThreads: [],
    missingExamples: [
      {
        concept: 'Ridge vs Lasso',
        suggested_example: 'Sparse feature seçimi gerektiğinde Lasso tercih edilir.',
      },
    ],
    pacingAnalysis: [
      { topic: 'Motivasyon', seconds_spent: 45, suggested_seconds: 60 },
      { topic: 'Ridge formülü', seconds_spent: 90, suggested_seconds: 75 },
    ],
    suggestedImprovements: [
      'Lambda etkisini görsel bir grafikle gösterin.',
      'Overfitting örneğini veri seti üzerinden canlı çözün.',
      'Öğrenci sorusundan sonra 10 sn özet yapın.',
    ],
    topConfusionPoints: [
      {
        theme: 'Lambda ve katsayı küçülmesi',
        question_count: 2,
        sample_quote: 'Lambda büyürse modele ne olur?',
      },
    ],
    generatedAt: isoNow(),
    generationDurationMs: 4200,
  };
}

export function createLectureInStore(input: {
  teacherId: string;
  title: string;
  subject: string;
  description?: string;
}): Lecture {
  const id = uid();
  const code = makeSessionCode(store.nextCode++);
  const now = isoNow();
  const lecture: Lecture = {
    id,
    teacherId: input.teacherId,
    title: input.title,
    subject: input.subject,
    description: input.description ?? null,
    status: 'draft',
    sessionCode: code,
    createdAt: now,
    startedAt: null,
    endedAt: null,
  };
  store.lectures.set(id, lecture);
  store.sessionCodes.set(code, id);
  store.questions.set(id, []);
  store.notes.set(id, []);
  store.transcripts.set(id, []);
  return lecture;
}

export function findTeacherByName(name: string): Teacher | undefined {
  const normalized = name.trim().toLocaleLowerCase('tr-TR');
  return [...store.teachers.values()].find(
    (teacher) => teacher.name.trim().toLocaleLowerCase('tr-TR') === normalized,
  );
}

export function upsertTeacher(input: { id: string; name: string }): Teacher {
  const existing = findTeacherByName(input.name) ?? store.teachers.get(input.id);
  const now = isoNow();
  const teacher: Teacher = existing
    ? { ...existing, name: input.name.trim(), lastSeenAt: now }
    : { id: input.id, name: input.name.trim(), createdAt: now, lastSeenAt: now };
  store.teachers.set(teacher.id, teacher);
  return teacher;
}

export function addNote(
  lectureId: string,
  opts: { rawText: string; filename: string | null; uploadMethod: 'pdf' | 'paste' },
): LectureNote {
  const note: LectureNote = {
    id: uid(),
    lectureId,
    filename: opts.filename,
    uploadMethod: opts.uploadMethod,
    rawTextPreview: opts.rawText.slice(0, 500),
    chunkCount: 12,
    createdAt: isoNow(),
  };
  const list = store.notes.get(lectureId) ?? [];
  list.push(note);
  store.notes.set(lectureId, list);
  return note;
}

export function appendTranscriptSegment(
  lectureId: string,
  input: {
    segmentIndex: number;
    content: string;
    startTimeSeconds: number;
    endTimeSeconds: number;
  },
): TranscriptSegment {
  const seg: TranscriptSegment = {
    id: uid(),
    lectureId,
    segmentIndex: input.segmentIndex,
    content: input.content,
    startTimeSeconds: input.startTimeSeconds,
    endTimeSeconds: input.endTimeSeconds,
    createdAt: isoNow(),
  };
  const list = store.transcripts.get(lectureId) ?? [];
  const without = list.filter((s) => s.segmentIndex !== input.segmentIndex);
  without.push(seg);
  without.sort((a, b) => a.segmentIndex - b.segmentIndex);
  store.transcripts.set(lectureId, without);
  return seg;
}

export function addQuestion(
  lectureId: string,
  studentSessionId: string,
  questionText: string,
  answer: {
    status: QuestionStatus;
    aiAnswer: string;
    citations: Question['aiAnswerCitations'];
    confidence: number;
  },
): Question {
  const q: Question = {
    id: uid(),
    lectureId,
    studentSessionId,
    questionText,
    askedAt: isoNow(),
    status: answer.status,
    routerDecision: { route: 'rag', confidence: answer.confidence, reasoning: 'Mock RAG' },
    aiAnswer: answer.aiAnswer,
    aiAnswerConfidence: answer.confidence,
    aiAnswerCitations: answer.citations,
    teacherResponse: null,
    flaggedReason: null,
  };
  const list = store.questions.get(lectureId) ?? [];
  list.push(q);
  store.questions.set(lectureId, list);
  return q;
}
