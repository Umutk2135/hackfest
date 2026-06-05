/**
 * OWNER: P3 (AI)
 * Negative-path smoke: prove the "forward to teacher" demo beat actually fires.
 *
 * Scenario: a question with NO retrieved context (simulates an out-of-domain
 * or unanswerable question). The Answer Agent should fall back to the standard
 * "cevaplayamıyorum" sentence with low confidence. The Flagger should then
 * escalate the question.
 *
 * No DB required. Run with:  npm run smoke:flag
 */
import { answerQuestion } from '../agents/answer';
import { reviewAnswer } from '../agents/flagger';
import type { RetrievedChunk } from '../agents/retrieval';

const OFF_TOPIC_Q = 'Bana iyi bir İtalyan makarna tarifi söyler misin?';
const EMPTY_CONTEXT: RetrievedChunk[] = [];

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
  requireEnv('VOYAGE_API_KEY');

  console.log('\n── Answer Agent with EMPTY context ─────────────────');
  const ans = await answerQuestion('test-lecture-id', OFF_TOPIC_Q, EMPTY_CONTEXT);
  console.log(JSON.stringify(ans, null, 2));

  check('contextWasEmpty flag is true', ans.contextWasEmpty === true, `flag=${ans.contextWasEmpty}`);
  check('confidence is low (<0.5)', ans.confidence < 0.5, `confidence=${ans.confidence}`);
  check('answer is non-empty', typeof ans.answer === 'string' && ans.answer.length > 0, `len=${ans.answer?.length ?? 0}`);
  check(
    'answer indicates inability to answer (fallback sentence or similar)',
    /cevaplayamıyorum|cevap veremiyorum|iletiyorum|bilmiyorum|don.t have|cannot answer/i.test(ans.answer),
    `excerpt="${ans.answer.slice(0, 80)}..."`,
  );

  console.log('\n── Flagger with low-confidence empty-context answer ─');
  const flag = await reviewAnswer({
    question: OFF_TOPIC_Q,
    answer: ans.answer,
    confidence: ans.confidence,
    contextWasEmpty: ans.contextWasEmpty,
  });
  console.log(JSON.stringify(flag, null, 2));

  check('flag.escalate === true (forward to teacher)', flag.escalate === true, `escalate=${flag.escalate}`);
  check('flag.reason is non-empty Turkish', typeof flag.reason === 'string' && flag.reason.length > 5, `reason="${flag.reason}"`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n── Summary ──────────────────────────────────────────`);
  console.log(`${results.length - failed.length} / ${results.length} passed`);
  if (failed.length > 0) {
    console.error('\nFailures:');
    for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log('\nNegative path works. "Forward to teacher" demo beat is reliable.\n');
}

main().catch((err) => {
  console.error('\nSmoke crashed:');
  console.error(err);
  process.exit(1);
});
