/**
 * OWNER: P1 (Frontend)
 * "/student/lectures/:code" — live Q&A (transcript is teacher-only).
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { QuestionChat } from '@/components/student/QuestionChat';
import { LectureStatusBadge } from '@/components/lecture/LectureStatusBadge';
import { api } from '@/lib/api';
import { getOrCreateStudentId } from '@/lib/studentId';
import type { Lecture } from '@shared/types';

export function StudentLectureLive() {
  const { code } = useParams();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [studentSessionId, setStudentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    void (async () => {
      try {
        const res = await api.getLectureByCode(code);
        setLecture(res.lecture);
        if (res.lecture.status === 'draft') return;
        const name = window.localStorage.getItem('kursu:studentName') ?? 'Öğrenci';
        const join = await api.studentJoin(res.lecture.id, {
          studentName: name,
          studentId: getOrCreateStudentId(),
        });
        setStudentSessionId(join.studentSessionId);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [code]);

  if (error) {
    return (
      <div className="rounded-md border border-destructive p-4 text-sm">
        Ders bulunamadı: {error}
      </div>
    );
  }
  if (!lecture || (lecture.status !== 'draft' && !studentSessionId)) {
    return <Skeleton className="h-[60vh]" />;
  }

  const waitingForSession = lecture.status === 'draft' || !studentSessionId;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium">{lecture.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{lecture.subject}</p>
        </div>
        <LectureStatusBadge status={lecture.status} />
      </div>

      <div className="max-w-2xl mx-auto w-full">
        {waitingForSession ? (
          <div className="kursu-chat-panel min-h-[min(72vh,calc(100dvh-12rem))] flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Ders henüz başlatılmadı. Öğretmen canlı oturumu başlatınca soru sorabilirsiniz.
          </div>
        ) : (
          <QuestionChat lectureId={lecture.id} studentSessionId={studentSessionId} />
        )}
      </div>
    </div>
  );
}
