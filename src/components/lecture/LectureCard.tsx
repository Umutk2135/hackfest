/**
 * OWNER: P1 (Frontend)
 * Card displayed on the teacher dashboard.
 */
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LectureStatusBadge } from './LectureStatusBadge';
import { relativeDate } from '@/lib/format';
import type { Lecture } from '@shared/types';

export function LectureCard({ lecture }: { lecture: Lecture }) {
  return (
    <Link to={`/teacher/lectures/${lecture.id}`}>
      <Card className="kursu-feature-card hover:border-[hsl(var(--seminar))]/40 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{lecture.title}</CardTitle>
            <LectureStatusBadge status={lecture.status} />
          </div>
          <CardDescription>{lecture.subject}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {relativeDate(lecture.createdAt)} · {lecture.sessionCode}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
