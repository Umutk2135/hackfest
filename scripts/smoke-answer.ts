/**
 * OWNER: P3 (AI)
 * Smoke test: runs the Answer Agent + Flagger with hand-crafted Ridge regression
 * context (the canonical demo question). Validates:
 *
 *   - Opus 4.7 returns parseable JSON
 *   - Answer is non-empty Turkish text
 *   - At least one citation, all citation chunk_ids are in the supplied context
 *     (i.e. the server-side hallucination guard works)
 *   - Confidence ≥ 0.7 on a question with rich context
 *   - Flagger does NOT escalate when confidence is high + context non-empty
 *
 * No DB required. Run with:  npm run smoke:answer
 */
import { answerQuestion } from '../agents/answer';
import { reviewAnswer } from '../agents/flagger';
import type { RetrievedChunk } from '../agents/retrieval';

const DEMO_Q = 'Lambda büyürse modele ne olur?';

const CANNED_CONTEXT: RetrievedChunk[] = [
  {
    chunk_id: 'n1',
    source_type: 'note',
    reference: 'sayfa 2',
    content:
      'Ridge regresyonunda λ (lambda) hiperparametresi büyüdükçe katsayıların büyüklüğüne uygulanan ceza artar. Bu nedenle katsayılar sıfıra doğru çekilir; model daha basit hale gelir.',
    score: 0.92,
  },
  {
    chunk_id: 't9',
    source_type: 'transcript',
    reference: '03:42',
    content:
      'Yani lambda büyüdükçe model daha basitleşir; bias artar ama variance düşer. Çok büyük lambda underfitting riskini doğurur.',
    score: 0.88,
  },
  {
    chunk_id: 'n2',
    source_type: 'note',
    reference: 'sayfa 3',
    content:
      'Lambda = 0 olduğunda Ridge regresyonu standart en küçük kareler (OLS) regresyonuna indirgenir. Lambda sonsuza giderken tüm katsayılar sıfıra yaklaşır.',
    score: 0.75,
  },
];

const results: Array<{ name: string; ok: boolean; detail: string }> = [];
function check(name: string, cond: boolean, detail: string) {
  results.push({ name, ok: cond, detail });
  console.log(`[${cond ? 'PASS' : 'FAIL'}] ${name} — ${detail}`);
}

function requireEnv(key: string) {
  if (!process.env[key]) {
    console.error(`\nMissing env var: ${key}\nRun: npm run smoke:answer  (auto-loads .env.local)`);
    process.exit(1);
  }
}

async function main() {
  requireEnv('ANTHROPIC_API_KEY');
  requireEnv('VOYAGE_API_KEY'); // tool-use fallback would need it; safer to require

  console.log('\n── Answer Agent (Opus 4.7) ─────────────────────────');
  const t0 = Date.now();
  const ans = await answerQuestion('test-lecture-id', DEMO_Q, CANNED_CONTEXT);
  const dt = Date.now() - t0;
  console.log(JSON.stringify(ans, null, 2));

  const validIds = new Set(CANNED_CONTEXT.map((c) => c.chunk_id));
  check('answer is non-empty string', typeof ans.answer === 'string' && ans.answer.length > 20, `len=${ans.answer?.length ?? 0}`);
  check('confidence in [0,1]', typeof ans.confidence === 'number' && ans.confidence >= 0 && ans.confidence <= 1, `confidence=${ans.confidence}`);
  check('confidence ≥ 0.7 on rich context', ans.confidence >= 0.7, `confidence=${ans.confidence}`);
  check('at least one citation', ans.citations.length >= 1, `count=${ans.citations.length}`);
  check('every citation has valid chunk_id (no hallucinations)', ans.citations.every((c) => validIds.has(c.chunk_id)), `bad=${ans.citations.filter((c) => !validIds.has(c.chunk_id)).map((c) => c.chunk_id).join(',') || 'none'}`);
  check('answer is in Turkish (contains tr-specific chars or lambda/λ)', /[çğıöşüÇĞİÖŞÜ]|λ|lambda/i.test(ans.answer), `excerpt="${ans.answer.slice(0, 60)}..."`);
  check('answer references lambda', /lambda|λ/i.test(ans.answer), 'ok');
  check('answer agent latency (<15s)', dt < 15000, `${dt}ms`);

  console.log('\n── Flagger (Sonnet 4.6) ────────────────────────────');
  const t1 = Date.now();
  const flag = await reviewAnswer({
    question: DEMO_Q,
    answer: ans.answer,
    confidence: ans.confidence,
    contextWasEmpty: ans.contextWasEmpty,
  });
  const dt1 = Date.now() - t1;
  console.log(JSON.stringify(flag, null, 2));
  check('flag has boolean escalate', typeof flag.escalate === 'boolean', `escalate=${flag.escalate}`);
  check('flag has non-empty reason', typeof flag.reason === 'string' && flag.reason.length > 0, `len=${flag.reason?.length ?? 0}`);
  check('high-confidence answer NOT escalated', flag.escalate === false, `escalate=${flag.escalate}`);
  check('flagger latency (<5s)', dt1 < 5000, `${dt1}ms`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n── Summary ──────────────────────────────────────────`);
  console.log(`${results.length - failed.length} / ${results.length} passed`);
  if (failed.length > 0) {
    console.error('\nFailures:');
    for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log('\nAnswer + Flagger pipeline is healthy. Citation guard works.\n');
}

main().catch((err) => {
  console.error('\nSmoke crashed:');
  console.error(err);
  process.exit(1);
});
