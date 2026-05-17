/**
 * OWNER: P2 (Backend)
 * POST /api/lectures   — create lecture
 * GET  /api/lectures   — list teacher's lectures
 */
import type { Config } from '@netlify/functions';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client';
import { lectures } from '../../db/schema';
import { json, error, readJson, handleOptions, methodNotAllowed } from './_lib/response';
import { currentTeacherId } from './_lib/auth';
import type {
  CreateLectureRequest,
  CreateLectureResponse,
  Lecture,
  ListLecturesResponse,
} from '../../shared/types';
import { SESSION_CODE_PREFIX } from '../../shared/types';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method === 'GET') return list();
  if (req.method === 'POST') return create(req);
  return methodNotAllowed();
}

async function list(): Promise<Response> {
  const rows = await db()
    .select()
    .from(lectures)
    .where(eq(lectures.teacherId, currentTeacherId()))
    .orderBy(desc(lectures.createdAt));
  const body: ListLecturesResponse = { lectures: rows.map(rowToLecture) };
  return json(body);
}

async function create(req: Request): Promise<Response> {
  const body = await readJson<CreateLectureRequest>(req);
  if (!body.title || !body.subject) return error('bad_request', 'title and subject required', 400);
  const sessionCode = await generateUniqueSessionCode();
  const [row] = await db()
    .insert(lectures)
    .values({
      teacherId: currentTeacherId(),
      title: body.title,
      subject: body.subject,
      description: body.description ?? null,
      sessionCode,
    })
    .returning();
  if (!row) return error('internal', 'insert returned no row', 500);
  const resp: CreateLectureResponse = {
    id: row.id,
    sessionCode: row.sessionCode,
    status: row.status,
  };
  return json(resp, 201);
}

async function generateUniqueSessionCode(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const candidate = generateSessionCode();
    const [existing] = await db()
      .select({ id: lectures.id })
      .from(lectures)
      .where(eq(lectures.sessionCode, candidate))
      .limit(1);
    if (!existing) return candidate;
  }
  throw new Error('failed to allocate unique session code');
}

function generateSessionCode(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${SESSION_CODE_PREFIX}-${n}`;
}

function rowToLecture(r: typeof lectures.$inferSelect): Lecture {
  return {
    id: r.id,
    teacherId: r.teacherId,
    title: r.title,
    subject: r.subject,
    description: r.description,
    status: r.status,
    sessionCode: r.sessionCode,
    createdAt: r.createdAt.toISOString(),
    startedAt: r.startedAt?.toISOString() ?? null,
    endedAt: r.endedAt?.toISOString() ?? null,
  };
}

export const config: Config = { path: '/.netlify/functions/lectures' };
