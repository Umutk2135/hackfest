/**
 * OWNER: P2 (Backend)
 * POST /api/teachers/register — lightweight demo teacher registration.
 */
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { teachers } from '../../db/schema';
import { json, badRequest, handleOptions, methodNotAllowed, readJson } from './_lib/response';
import { sanitizeTeacherId } from './_lib/auth';
import type { RegisterTeacherRequest, RegisterTeacherResponse } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') return methodNotAllowed();

  const body = await readJson<RegisterTeacherRequest>(req);
  const id = sanitizeTeacherId(body.id);
  const name = body.name?.trim();
  if (!id) return badRequest('teacher id is invalid');
  if (!name) return badRequest('teacher name is required');
  if (name.length > 80) return badRequest('teacher name is too long');

  const now = new Date();
  const [existing] = await db().select().from(teachers).where(eq(teachers.id, id)).limit(1);
  const [row] = existing
    ? await db()
        .update(teachers)
        .set({ name, lastSeenAt: now })
        .where(eq(teachers.id, id))
        .returning()
    : await db()
        .insert(teachers)
        .values({ id, name, createdAt: now, lastSeenAt: now })
        .returning();

  const resp: RegisterTeacherResponse = {
    teacher: {
      id: row!.id,
      name: row!.name,
      createdAt: row!.createdAt.toISOString(),
      lastSeenAt: row!.lastSeenAt.toISOString(),
    },
  };
  return json(resp, existing ? 200 : 201);
}

export const config = { path: '/.netlify/functions/teachers' };
