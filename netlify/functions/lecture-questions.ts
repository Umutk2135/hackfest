/**
 * OWNER: P2 (Backend)
 * Dispatcher for /api/lectures/:id/questions.
 * Netlify method-conditional redirects can be brittle; route both methods here.
 */
import questionAsk from './question-ask';
import questionsList from './questions-list';
import { handleOptions, methodNotAllowed } from './_lib/response';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method === 'POST') return questionAsk(req);
  if (req.method === 'GET') return questionsList(req);
  return methodNotAllowed();
}

export const config = { path: '/.netlify/functions/lecture-questions' };
