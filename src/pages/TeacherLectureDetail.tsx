/**
 * OWNER: P1 (Frontend)
 * "/teacher/lectures/:id" — pre-live page: upload notes, start session.
 */
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteUploader } from '@/components/lecture/NoteUploader';
import { StartSessionButton } from '@/components/lecture/StartSessionButton';
import { LectureStatusBadge } from '@/components/lecture/LectureStatusBadge';
import { useLecture } from '@/hooks/useLecture';

export function TeacherLectureDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data } = useLecture(id);

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  const { lecture, notes } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium">{lecture.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{lecture.subject}</p>
        </div>
        <LectureStatusBadge status={lecture.status} />
      </div>

      <Card className="kursu-feature-card">
        <CardHeader>
          <CardTitle className="font-display text-xl">Notlar ({notes.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NoteUploader lectureId={lecture.id} />
          {notes.length > 0 && (
            <ul className="text-xs space-y-1 text-[hsl(var(--muted-foreground))]">
              {notes.map((n) => (
                <li key={n.id}>
                  {n.filename ?? 'metin'} · {n.chunkCount} chunk
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {lecture.status === 'draft' && (
        <StartSessionButton
          lectureId={lecture.id}
          onStarted={() => nav(`/teacher/lectures/${lecture.id}/live`)}
        />
      )}
      {lecture.status === 'live' && (
        <button
          className="text-sm underline"
          onClick={() => nav(`/teacher/lectures/${lecture.id}/live`)}
        >
          Canlı oturuma geç →
        </button>
      )}
      {lecture.status === 'ended' && (
        <button
          className="text-sm underline"
          onClick={() => nav(`/teacher/lectures/${lecture.id}/feedback`)}
        >
          Ders sonu raporunu gör →
        </button>
      )}
    </div>
  );
}
