/**
 * OWNER: P1 (Frontend)
 * "/student/lectures/:code" — live transcript + chat.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveTranscriptStream } from '@/components/live/LiveTranscriptStream';
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
  if (!lecture || !studentSessionId) {
    return <Skeleton className="h-[60vh]" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium">{lecture.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{lecture.subject}</p>
        </div>
        <LectureStatusBadge status={lecture.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <LiveTranscriptStream lectureId={lecture.id} source="server" />
        </div>
        <div className="lg:col-span-2">
          <QuestionChat lectureId={lecture.id} studentSessionId={studentSessionId} />
        </div>
      </div>
    </div>
  );
}
