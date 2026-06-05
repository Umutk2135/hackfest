/**
 * OWNER: P3 (AI)
 * Smoke test: confirms ANTHROPIC + VOYAGE keys work and the two SDK wrappers
 * return well-formed output. Run with:
 *
 *   npm run smoke:agents
 *
 * Exits non-zero on any failure so it's CI-safe.
 */
import { routeQuestion } from '../agents/router';
import { embedTexts, embedQuery } from '../agents/embedding';
import { EMBEDDING_DIM } from '../shared/types';

const ROUTES = ['rag', 'live_transcript', 'teacher', 'out_of_scope'] as const;
const DEMO_Q = 'Lambda büyürse modele ne olur?';

const results: Array<{ name: string; ok: boolean; detail: string }> = [];

function check(name: string, cond: boolean, detail: string) {
  results.push({ name, ok: cond, detail });
  const tag = cond ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name} — ${detail}`);
}

function requireEnv(key: string) {
  if (!process.env[key]) {
    console.error(`\nMissing env var: ${key}`);
    console.error('Run with: npm run smoke:agents  (loads .env.local automatically)');
    process.exit(1);
  }
}

async function main() {
  requireEnv('ANTHROPIC_API_KEY');
  requireEnv('VOYAGE_API_KEY');

  console.log('\n── Router (Sonnet 4.6) ─────────────────────────────');
  const t0 = Date.now();
  const decision = await routeQuestion(DEMO_Q);
  const dt = Date.now() - t0;
  console.log(JSON.stringify(decision, null, 2));
  check('router.route is valid', ROUTES.includes(decision.route as typeof ROUTES[number]), `route=${decision.route}`);
  check('router.confidence is number 0..1', typeof decision.confidence === 'number' && decision.confidence >= 0 && decision.confidence <= 1, `confidence=${decision.confidence}`);
  check('router.reasoning is non-empty string', typeof decision.reasoning === 'string' && decision.reasoning.length > 0, `len=${decision.reasoning?.length ?? 0}`);
  check('router latency reasonable (<5s)', dt < 5000, `${dt}ms`);

  console.log('\n── Voyage (voyage-3-large) ─────────────────────────');
  const t1 = Date.now();
  const docVecs = await embedTexts(['Ridge regresyon nedir?', 'Overfitting örnegi.'], 'document');
  const dt1 = Date.now() - t1;
  check('embedTexts returns one vec per input', docVecs.length === 2, `got ${docVecs.length}`);
  check(`doc vec dim === ${EMBEDDING_DIM}`, docVecs[0]?.length === EMBEDDING_DIM, `dim=${docVecs[0]?.length}`);
  check('doc vec values are finite numbers', docVecs[0]?.every((x) => Number.isFinite(x)) ?? false, `first=${docVecs[0]?.[0]?.toFixed(4)}`);
  check('voyage doc batch latency reasonable (<5s)', dt1 < 5000, `${dt1}ms`);

  const t2 = Date.now();
  const qVec = await embedQuery(DEMO_Q);
  const dt2 = Date.now() - t2;
  check(`query vec dim === ${EMBEDDING_DIM}`, qVec.length === EMBEDDING_DIM, `dim=${qVec.length}`);
  check('voyage query latency reasonable (<5s)', dt2 < 5000, `${dt2}ms`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n── Summary ──────────────────────────────────────────`);
  console.log(`${results.length - failed.length} / ${results.length} passed`);
  if (failed.length > 0) {
    console.error('\nFailures:');
    for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log('\nAll smoke checks green. AI lane keys + SDK wrappers are healthy.\n');
}

main().catch((err) => {
  console.error('\nSmoke script crashed:');
  console.error(err);
  process.exit(1);
});
