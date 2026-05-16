/**
 * OWNER: P1 (Frontend)
 * "/teacher/lectures/:id/feedback" — report view.
 */
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { FeedbackReportCard } from '@/components/feedback/FeedbackReportCard';
import { ScoreRing } from '@/components/feedback/ScoreRing';
import { PacingChart } from '@/components/feedback/PacingChart';
import { RushedConceptList } from '@/components/feedback/RushedConceptList';
import { ConfusionPointsCloud } from '@/components/feedback/ConfusionPointsCloud';
import { useFeedback } from '@/hooks/useFeedback';
import { t } from '@/lib/i18n';

export function TeacherLectureFeedback() {
  const { id } = useParams();
  const { report, loading } = useFeedback(id);

  if (loading || !report) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-medium">{t('feedback.generating')}</h1>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-medium">{t('feedback.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(
          [
            [report.overallClarityScore, t('feedback.scores.clarity')],
            [report.overallPacingScore, t('feedback.scores.pacing')],
            [report.overallEngagementScore, t('feedback.scores.engagement')],
          ] as const
        ).map(([score, label]) => (
          <div
            key={label}
            className="kursu-feature-card rounded-lg border border-border bg-card p-6 flex justify-center"
          >
            <ScoreRing score={score} label={label} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <FeedbackReportCard title={t('feedback.rushed')} empty={report.rushedConcepts.length === 0}>
          <RushedConceptList items={report.rushedConcepts} />
        </FeedbackReportCard>

        <FeedbackReportCard
          title={t('feedback.unanswered')}
          empty={report.unansweredThreads.length === 0}
        >
          <ul className="space-y-2 text-sm">
            {report.unansweredThreads.map((u, i) => (
              <li key={i}>
                <p className="font-medium">"{u.question}"</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{u.why_unanswered}</p>
              </li>
            ))}
          </ul>
        </FeedbackReportCard>

        <FeedbackReportCard title={t('feedback.examples')} empty={report.missingExamples.length === 0}>
          <ul className="space-y-2 text-sm">
            {report.missingExamples.map((e, i) => (
              <li key={i}>
                <p className="font-medium">{e.concept}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">→ {e.suggested_example}</p>
              </li>
            ))}
          </ul>
        </FeedbackReportCard>

        <FeedbackReportCard title={t('feedback.pacing')} empty={report.pacingAnalysis.length === 0}>
          <PacingChart data={report.pacingAnalysis} />
        </FeedbackReportCard>

        <FeedbackReportCard
          title={t('feedback.suggestions')}
          empty={report.suggestedImprovements.length === 0}
        >
          <ul className="space-y-1 text-sm list-disc list-inside">
            {report.suggestedImprovements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </FeedbackReportCard>

        <FeedbackReportCard title={t('feedback.confusion')} empty={report.topConfusionPoints.length === 0}>
          <ConfusionPointsCloud items={report.topConfusionPoints} />
        </FeedbackReportCard>
      </div>
    </div>
  );
}
