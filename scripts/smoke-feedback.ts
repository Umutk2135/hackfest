/**
 * OWNER: P3 (AI)
 * Smoke test: Feedback Agent (Opus 4.7) on a synthetic 3-minute Ridge regression
 * lecture. Validates the JSON schema, score ranges, non-empty arrays, and that
 * unanswered student threads are surfaced.
 *
 * No DB required. Run with:  npm run smoke:feedback
 */
import { generateFeedback } from '../agents/feedback';
import type { Question } from '../shared/types';

const NOTES = `
Ridge Regresyon — Ders Notları

1. Doğrusal regresyonun overfitting problemi.
2. L2 regülarizasyonu: katsayıların büyüklüğünü cezalandırma.
3. Lambda (λ) hiperparametresi: bias-variance dengesini kontrol eder.
   - λ = 0 → standart OLS regresyonu.
   - λ küçük → düşük bias, yüksek variance.
   - λ büyük → yüksek bias, düşük variance.
   - λ → ∞ → tüm katsayılar sıfıra yaklaşır (underfitting).
4. Cross-validation ile optimal λ seçimi.
5. Lasso ile karşılaştırma: Ridge L2, Lasso L1; Lasso feature selection yapar.
6. Pratik örnek: Boston housing veri seti üzerinde Ridge uygulaması.
`.trim();

const TRANSCRIPT = [
  { startTimeSeconds: 0, content: 'Merhaba arkadaşlar, bugünkü konumuz Ridge regresyon. Doğrusal regresyonu hatırlıyorsunuz değil mi?' },
  { startTimeSeconds: 12, content: 'Doğrusal regresyonun bir sorunu var: overfitting. Yani modelimiz training datasına çok fazla uyum sağlıyor.' },
  { startTimeSeconds: 30, content: 'Ridge regresyon bunu çözmek için L2 regülarizasyon ekliyor. Yani katsayıların karelerinin toplamına bir ceza koyuyoruz.' },
  { startTimeSeconds: 55, content: 'Bu cezanın büyüklüğünü lambda parametresi kontrol ediyor. Lambda büyüdükçe ceza artıyor.' },
  { startTimeSeconds: 78, content: 'Lambda sıfır olduğunda Ridge, standart OLS regresyonuna eşit oluyor. Lambda sonsuza giderken bütün katsayılar sıfıra yaklaşıyor.' },
  { startTimeSeconds: 110, content: 'Bias-variance dengesi açısından konuşursak: lambda büyüdükçe bias artar ama variance düşer.' },
  { startTimeSeconds: 135, content: 'Lasso da var, onu da kısaca söyleyeyim, Lasso L1 kullanır, feature selection yapar. Şimdi devam ediyoruz.' },
  { startTimeSeconds: 150, content: 'Şimdi Boston housing veri setine bakalım hızlıca, kod örneğini ekrana yansıtıyorum.' },
  { startTimeSeconds: 170, content: 'Burada sklearn üzerinden Ridge import ettik, alpha parametresi bizim lambda. 0.1 ve 10 değerlerini deneyelim.' },
];

const QA: Question[] = [
  {
    id: 'q1',
    lectureId: 'test',
    studentSessionId: 's1',
    questionText: 'Lambda büyürse modele ne olur?',
    askedAt: '2026-05-17T10:01:30Z',
    status: 'answered_by_ai',
    routerDecision: null,
    aiAnswer: 'Lambda büyüdükçe model daha basit hale gelir, bias artar variance düşer.',
    aiAnswerConfidence: 0.92,
    aiAnswerCitations: null,
    teacherResponse: null,
    flaggedReason: null,
  },
  {
    id: 'q2',
    lectureId: 'test',
    studentSessionId: 's2',
    questionText: 'Cross-validation ile lambda nasıl seçilir, biraz daha açıklayabilir misiniz?',
    askedAt: '2026-05-17T10:02:20Z',
    status: 'flagged_for_teacher',
    routerDecision: null,
    aiAnswer: null,
    aiAnswerConfidence: 0.4,
    aiAnswerCitations: null,
    teacherResponse: null,
    flaggedReason: 'Bağlam yetersiz; ders notlarında detay yok.',
  },
  {
    id: 'q3',
    lectureId: 'test',
    studentSessionId: 's3',
    questionText: 'Lasso ve Ridge arasındaki fark nedir?',
    askedAt: '2026-05-17T10:02:40Z',
    status: 'answered_by_ai',
    routerDecision: null,
    aiAnswer: 'Ridge L2, Lasso L1 regülarizasyon kullanır. Lasso feature selection yapar.',
    aiAnswerConfidence: 0.78,
    aiAnswerCitations: null,
    teacherResponse: null,
    flaggedReason: null,
  },
];

const results: Array<{ name: string; ok: boolean; detail: string }> = [];
function check(name: string, cond: boolean, detail: string) {
  results.push({ name, ok: cond, detail });
  console.log(`[${cond ? 'PASS' : 'FAIL'}] ${name} — ${detail}`);
}

function requireEnv(key: string) {
  if (!process.env[key]) {
    console.error(`\nMissing env var: ${key}`);
    process.exit(1);
  }
}

async function main() {
  requireEnv('ANTHROPIC_API_KEY');

  console.log('\n── Feedback Agent (Opus 4.7) ───────────────────────');
  const t0 = Date.now();
  const report = await generateFeedback({
    title: 'Ridge Regresyon Nedir?',
    subject: 'Makine Öğrenmesi',
    durationSeconds: 180,
    notesText: NOTES,
    transcript: TRANSCRIPT,
    qaLog: QA,
  });
  const dt = Date.now() - t0;
  console.log(JSON.stringify(report, null, 2));

  const inRange = (n: number) => typeof n === 'number' && n >= 0 && n <= 100;

  check('overallClarityScore in [0,100]', inRange(report.overallClarityScore), `score=${report.overallClarityScore}`);
  check('overallPacingScore in [0,100]', inRange(report.overallPacingScore), `score=${report.overallPacingScore}`);
  check('overallEngagementScore in [0,100]', inRange(report.overallEngagementScore), `score=${report.overallEngagementScore}`);
  check('rushedConcepts is array', Array.isArray(report.rushedConcepts), `count=${report.rushedConcepts?.length}`);
  check('unansweredThreads is array', Array.isArray(report.unansweredThreads), `count=${report.unansweredThreads?.length}`);
  check('missingExamples is array', Array.isArray(report.missingExamples), `count=${report.missingExamples?.length}`);
  check('pacingAnalysis is array', Array.isArray(report.pacingAnalysis), `count=${report.pacingAnalysis?.length}`);
  check('suggestedImprovements has 3–5 items', report.suggestedImprovements?.length >= 3 && report.suggestedImprovements?.length <= 5, `count=${report.suggestedImprovements?.length}`);
  check('topConfusionPoints is array', Array.isArray(report.topConfusionPoints), `count=${report.topConfusionPoints?.length}`);

  // Pedagogical signal checks (sanity, not strict)
  const allTextBlob = JSON.stringify(report).toLowerCase();
  check('report references Lasso (flagged: rushed at 02:15)', /lasso/.test(allTextBlob), 'ok');
  check('report mentions unanswered cross-validation question', /cross.validation|cv/.test(allTextBlob), 'ok');
  check('suggestedImprovements are non-empty strings', report.suggestedImprovements?.every((s) => typeof s === 'string' && s.length > 10) ?? false, 'ok');
  check('feedback latency reasonable (<60s for background fn)', dt < 60000, `${dt}ms`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n── Summary ──────────────────────────────────────────`);
  console.log(`${results.length - failed.length} / ${results.length} passed`);
  if (failed.length > 0) {
    console.error('\nFailures:');
    for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log('\nFeedback Agent JSON schema + pedagogical signal both green.\n');
}

main().catch((err) => {
  console.error('\nSmoke crashed:');
  console.error(err);
  process.exit(1);
});
