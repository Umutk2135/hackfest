/**
 * OWNER: P1 (Frontend)
 * Browser SSE parser for POST-based SSE endpoints (EventSource only supports GET).
 * Usage:
 *   for await (const evt of streamSse(res.body)) { ... }
 */
export interface SseEvent {
  event: string;
  data: string;
}

export async function* streamSse(body: ReadableStream<Uint8Array> | null): AsyncGenerator<SseEvent> {
  if (!body) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    for (const block of events) {
      const evt = parseEvent(block);
      if (evt) yield evt;
    }
  }
}

function parseEvent(block: string): SseEvent | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join('\n') };
}
