/**
 * OWNER: P1 (Frontend)
 * Mock implementation of src/lib/api.ts — same shapes as @shared/types.
 */
import type {
  CreateLectureRequest,
  CreateLectureResponse,
  ListLecturesResponse,
  GetLectureResponse,
  LectureByCodeResponse,
  UploadNotesResponse,
  StartSessionResponse,
  EndSessionResponse,
  TranscriptAppendRequest,
  TranscriptAppendResponse,
  TranscriptGetResponse,
  StudentJoinRequest,
  StudentJoinResponse,
  ListQuestionsResponse,
  QuestionStatus,
  TeacherRespondRequest,
  TeacherRespondResponse,
  GetFeedbackResponse,
  RegisterTeacherRequest,
  RegisterTeacherResponse,
} from '@shared/types';
import {
  addNote,
  addQuestion,
  appendTranscriptSegment,
  createLectureInStore,
  delay,
  findLectureByCode,
  getStore,
  setLectureStatus,
} from './store';

export const mockApi = {
  registerTeacher: async (body: RegisterTeacherRequest): Promise<RegisterTeacherResponse> => {
    await delay(120);
    const now = new Date().toISOString();
    return { teacher: { id: body.id, name: body.name, createdAt: now, lastSeenAt: now } };
  },

  listLectures: async (): Promise<ListLecturesResponse> => {
    await delay(200);
    const lectures = [...getStore().lectures.values()].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
    return { lectures };
  },

  createLecture: async (body: CreateLectureRequest): Promise<CreateLectureResponse> => {
    await delay(300);
    const lec = createLectureInStore(body);
    return { id: lec.id, sessionCode: lec.sessionCode, status: lec.status };
  },

  getLecture: async (id: string): Promise<GetLectureResponse> => {
    await delay(150);
    const lec = getStore().lectures.get(id);
    if (!lec) throw new Error('Ders bulunamadı');
    const notes = getStore().notes.get(id) ?? [];
    const transcript = getStore().transcripts.get(id) ?? [];
    const questions = getStore().questions.get(id) ?? [];
    return {
      lecture: lec,
      notes,
      transcriptCount: transcript.length,
      questionCount: questions.length,
    };
  },

  getLectureByCode: async (code: string): Promise<LectureByCodeResponse> => {
    await delay(150);
    const lec = findLectureByCode(code);
    if (!lec) throw new Error('Oturum kodu geçersiz');
    return { lecture: lec, isLive: lec.status === 'live' };
  },

  uploadNotesPaste: async (id: string, rawText: string): Promise<UploadNotesResponse> => {
    await delay(600);
    const note = addNote(id, { rawText, filename: null, uploadMethod: 'paste' });
    return { noteId: note.id, chunkingJobId: note.id };
  },

  uploadNotesPdf: async (id: string, file: File): Promise<UploadNotesResponse> => {
    await delay(800);
    const note = addNote(id, {
      rawText: `[PDF mock] ${file.name}`,
      filename: file.name,
      uploadMethod: 'pdf',
    });
    return { noteId: note.id, chunkingJobId: note.id };
  },

  startSession: async (id: string): Promise<StartSessionResponse> => {
    await delay(250);
    setLectureStatus(id, 'live');
    const lec = getStore().lectures.get(id)!;
    return {
      sessionCode: lec.sessionCode,
      startedAt: lec.startedAt!,
      status: 'live',
    };
  },

  endSession: async (id: string): Promise<EndSessionResponse> => {
    await delay(300);
    setLectureStatus(id, 'ended');
    const lec = getStore().lectures.get(id)!;
    return { endedAt: lec.endedAt!, status: 'ended', feedbackJobId: id };
  },

  appendTranscript: async (
    id: string,
    body: TranscriptAppendRequest,
  ): Promise<TranscriptAppendResponse> => {
    await delay(80);
    const seg = appendTranscriptSegment(id, {
      segmentIndex: body.segmentIndex,
      content: body.content,
      startTimeSeconds: body.startTimeSeconds,
      endTimeSeconds: body.endTimeSeconds,
    });
    return { ok: true, segmentId: seg.id };
  },

  getTranscript: async (id: string, since?: number): Promise<TranscriptGetResponse> => {
    await delay(100);
    const all = getStore().transcripts.get(id) ?? [];
    const segments =
      since !== undefined ? all.filter((s) => s.segmentIndex > since) : [...all];
    const latestIndex = all.length ? Math.max(...all.map((s) => s.segmentIndex)) : -1;
    return { segments, latestIndex };
  },

  studentJoin: async (id: string, body: StudentJoinRequest): Promise<StudentJoinResponse> => {
    await delay(200);
    const sessionId = crypto.randomUUID();
    getStore().sessions.set(sessionId, {
      id: sessionId,
      lectureId: id,
      studentName: body.studentName,
      studentId: body.studentId,
    });
    return { studentSessionId: sessionId };
  },

  listQuestions: async (id: string, status?: QuestionStatus): Promise<ListQuestionsResponse> => {
    await delay(120);
    let questions = getStore().questions.get(id) ?? [];
    if (status) questions = questions.filter((q) => q.status === status);
    return { questions };
  },

  teacherRespond: async (
    questionId: string,
    body: TeacherRespondRequest,
  ): Promise<TeacherRespondResponse> => {
    await delay(200);
    for (const [, list] of getStore().questions) {
      const q = list.find((x) => x.id === questionId);
      if (q) {
        q.status = 'answered_by_teacher';
        q.teacherResponse = body.teacherResponse;
        return { questionId, status: 'answered_by_teacher' };
      }
    }
    throw new Error('Soru bulunamadı');
  },

  getFeedback: async (id: string): Promise<GetFeedbackResponse> => {
    await delay(400);
    const fb = getStore().feedback.get(id);
    if (fb === 'generating' || fb === undefined) {
      return { status: 'generating' };
    }
    return { status: 'ready', report: fb };
  },
};
