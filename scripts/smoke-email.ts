/**
 * OWNER: P3 (AI)
 * Smoke test: sends a hard-coded test email via Resend using env vars.
 * Run: npm run smoke:email
 */
import { sendFeedbackReportEmail } from '../netlify/functions/_lib/email';

const result = await sendFeedbackReportEmail({
  lectureTitle: 'Smoke Test Dersi',
  lectureSubject: 'Test',
  report: {
    id: 'test',
    lectureId: 'test',
    overallClarityScore: 82,
    overallPacingScore: 74,
    overallEngagementScore: 88,
    rushedConcepts: [{ concept: 'Türev', timestamp: '00:12:30', reason: 'Çok hızlı geçildi' }],
    unansweredThreads: [],
    missingExamples: [],
    pacingAnalysis: [],
    suggestedImprovements: ['Türev konusuna daha fazla zaman ayırın'],
    topConfusionPoints: [
      { theme: 'Zincir kuralı', question_count: 3, sample_quote: 'Hocam bu kısmı anlamadım' },
    ],
    generatedAt: new Date().toISOString(),
    generationDurationMs: 0,
  },
});

console.log('result:', result);
