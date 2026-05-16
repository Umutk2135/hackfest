/**
 * OWNER: P1 (Frontend)
 * One section of the feedback report.
 */
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FeedbackReportCard({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Bu bölümde öne çıkan bir bulgu yok.</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
