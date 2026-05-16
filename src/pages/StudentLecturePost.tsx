/**
 * OWNER: P1 (Frontend)
 * "/student/lectures/:code/post" — post-lecture chat (no live transcript update).
 * The chat itself works identically; the AI retrieves from the stored transcript + notes.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { QuestionChat } from '@/components/student/QuestionChat';
import { api } from '@/lib/api';
import { getOrCreateStudentId } from '@/lib/studentId';
import type { Lecture } from '@shared/types';

export function StudentLecturePost() {
  const { code } = useParams();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [studentSessionId, setStudentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    void (async () => {
      const res = await api.getLectureByCode(code);
      setLecture(res.lecture);
      const name = window.localStorage.getItem('kursu:studentName') ?? 'Öğrenci';
      const join = await api.studentJoin(res.lecture.id, {
        studentName: name,
        studentId: getOrCreateStudentId(),
      });
      setStudentSessionId(join.studentSessionId);
    })();
  }, [code]);

  if (!lecture || !studentSessionId) return <Skeleton className="h-[60vh]" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-medium">{lecture.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ders bitti — yine de soru sorabilirsiniz.
        </p>
      </div>
      <QuestionChat lectureId={lecture.id} studentSessionId={studentSessionId} />
    </div>
  );
}
