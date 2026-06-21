import type { ChatRequest, BackendEvent } from '../types';

export async function* streamChat(request: ChatRequest, signal?: AbortSignal): AsyncGenerator<BackendEvent> {
  const response = await fetch('/api/v1/agent/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body is not readable');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6).trim();

        if (data === '[DONE]') return;

        try {
          const parsed: BackendEvent = JSON.parse(data);
          yield parsed;
        } catch {
          yield { eventType: 'RAW', eventData: data };
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
