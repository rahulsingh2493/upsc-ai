import { postRaw } from './client';
import type { ChatRequest } from '../types';

/** Calls POST /chat. Supports a streamed text body or a JSON {reply} body. */
export async function streamChat(
  body: ChatRequest,
  onChunk: (text: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await postRaw('/chat', body, signal);
  const type = res.headers.get('content-type') ?? '';

  if (type.includes('json') || !res.body) {
    const data = await res.json();
    onChunk(typeof data?.reply === 'string' ? data.reply : '');
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
