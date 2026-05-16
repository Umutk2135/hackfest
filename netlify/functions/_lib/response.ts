/**
 * OWNER: P2 (Backend)
 * Response helpers: JSON, error, SSE.
 */
import type { ApiError } from '../../../shared/types';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
  'access-control-allow-headers': 'content-type, authorization',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS_HEADERS },
  });
}

export function error(code: string, message: string, status = 400): Response {
  const body: ApiError = { error: { code, message } };
  return json(body, status);
}

export function notFound(message = 'Not found'): Response {
  return error('not_found', message, 404);
}

export function badRequest(message: string): Response {
  return error('bad_request', message, 400);
}

export function methodNotAllowed(): Response {
  return error('method_not_allowed', 'Method not allowed', 405);
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Build an SSE stream from an async iterable of events.
 * Each event is { event: string, data: unknown }.
 */
export function sseStream(events: AsyncIterable<{ event: string; data: unknown }>): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const evt of events) {
          const line = `event: ${evt.event}\ndata: ${JSON.stringify(evt.data)}\n\n`;
          controller.enqueue(encoder.encode(line));
        }
        controller.close();
      } catch (err) {
        const payload = JSON.stringify({
          code: 'internal',
          message: (err as Error).message ?? 'unknown',
        });
        controller.enqueue(encoder.encode(`event: error\ndata: ${payload}\n\n`));
        controller.close();
      }
    },
  });
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
      ...CORS_HEADERS,
    },
  });
}

export async function readJson<T>(req: Request): Promise<T> {
  const text = await req.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export function getQueryParam(req: Request, name: string): string | null {
  return new URL(req.url).searchParams.get(name);
}
