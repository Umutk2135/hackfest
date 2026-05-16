/**
 * OWNER: P1 (Frontend) — but shape mirrors shared/types.ts (P2/P3 also read it).
 * Typed fetch wrapper. All endpoints documented in plan Section 6.
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
  ApiError,
} from '@shared/types';

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  const parsed = text ? (JSON.parse(text) as T | ApiError) : (null as unknown as T);
  if (!res.ok) {
    const err = parsed as ApiError;
    throw new Error(err?.error?.message ?? `${res.status} ${res.statusText}`);
  }
  return parsed as T;
}

export const api = {
  // Lectures
  listLectures: () => call<ListLecturesResponse>('/api/lectures'),
  createLecture: (body: CreateLectureRequest) =>
    call<CreateLectureResponse>('/api/lectures', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getLecture: (id: string) => call<GetLectureResponse>(`/api/lectures/${id}`),
  getLectureByCode: (code: string) => call<LectureByCodeResponse>(`/api/lectures/by-code/${code}`),
  uploadNotesPaste: (id: string, rawText: string) =>
    call<UploadNotesResponse>(`/api/lectures/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ rawText }),
    }),
  uploadNotesPdf: async (id: string, file: File): Promise<UploadNotesResponse> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/lectures/${id}/notes`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`upload failed: ${res.status}`);
    return res.json() as Promise<UploadNotesResponse>;
  },
  startSession: (id: string) =>
    call<StartSessionResponse>(`/api/lectures/${id}/start`, { method: 'POST' }),
  endSession: (id: string) =>
    call<EndSessionResponse>(`/api/lectures/${id}/end`, { method: 'POST' }),

  // Transcript
  appendTranscript: (id: string, body: TranscriptAppendRequest) =>
    call<TranscriptAppendResponse>(`/api/lectures/${id}/transcript/append`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getTranscript: (id: string, since?: number) =>
    call<TranscriptGetResponse>(
      `/api/lectures/${id}/transcript${since !== undefined ? `?since=${since}` : ''}`,
    ),

  // Student + questions
  studentJoin: (id: string, body: StudentJoinRequest) =>
    call<StudentJoinResponse>(`/api/lectures/${id}/student-join`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listQuestions: (id: string, status?: QuestionStatus) =>
    call<ListQuestionsResponse>(
      `/api/lectures/${id}/questions${status ? `?status=${status}` : ''}`,
    ),
  teacherRespond: (questionId: string, body: TeacherRespondRequest) =>
    call<TeacherRespondResponse>(`/api/questions/${questionId}/teacher-response`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Feedback
  getFeedback: (id: string) => call<GetFeedbackResponse>(`/api/lectures/${id}/feedback`),
};

/** Path for the SSE endpoint — opened via fetch+ReadableStream (EventSource doesn't allow POST). */
export const askQuestionPath = (lectureId: string) => `/api/lectures/${lectureId}/questions`;
