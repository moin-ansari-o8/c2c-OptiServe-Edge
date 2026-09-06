import { API_BASE_URL, DEFAULT_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '@/lib/constants';
import type { ChatCompletionChunk, StreamCallbacks, StreamOptions } from '@/types/api';

/**
 * Stream chat completions from the FastAPI backend using SSE.
 * Returns an AbortController for cancellation.
 */
export function streamChat(
  prompt: string,
  options: Partial<StreamOptions>,
  callbacks: StreamCallbacks,
): AbortController {
  const controller = new AbortController();

  const body = JSON.stringify({
    model: options.model || DEFAULT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    stream: options.stream !== false,
  });

  (async () => {
    try {
      callbacks.onStart?.();

      const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!options.stream && options.stream !== undefined) {
        // Non-streaming response
        const data = await response.json() as ChatCompletionChunk;
        const content = data.choices?.[0]?.message?.content || '';
        callbacks.onToken(content);
        callbacks.onDone(content);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') {
            callbacks.onDone(fullText);
            return;
          }

          try {
            const chunk = JSON.parse(data) as ChatCompletionChunk;
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              callbacks.onToken(content);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      // Stream ended without [DONE]
      callbacks.onDone(fullText);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        callbacks.onError(error as Error);
      }
    }
  })();

  return controller;
}
