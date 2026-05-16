/**
 * OWNER: P2 (Backend) + P4 (DevOps owns canonical demo content)
 * Seeds one demo teacher + one ended lecture with notes/transcript/feedback for backup demo.
 * Run with: `npm run db:seed`
 */
import { db } from './client';
import { lectures } from './schema';
import { DEMO_TEACHER_ID } from '../shared/types';

async function main() {
  // TODO(P2/P4): insert the canonical "Ridge Regresyon Nedir?" demo lecture with seeded notes,
  // transcript, questions, and a pre-generated feedback report so the backup demo works offline.
  const conn = db();
  const existing = await conn.select().from(lectures).limit(1);
  console.log(`Seed start. existing lectures: ${existing.length}`);

  // Minimal seed so the dashboard is not empty on first boot.
  await conn
    .insert(lectures)
    .values({
      teacherId: DEMO_TEACHER_ID,
      title: 'Ridge Regresyon Nedir?',
      subject: 'Makine Öğrenmesi',
      description: 'Demo amaçlı örnek ders.',
      status: 'draft',
      sessionCode: 'KRSU-DEMO',
    })
    .onConflictDoNothing({ target: lectures.sessionCode });

  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
