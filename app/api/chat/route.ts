import {google} from '@ai-sdk/google';
import {convertToModelMessages, streamText, type UIMessage} from 'ai';

import {buildSystemPrompt} from '@/features/ai-chat/api/build-prompt';
import {fetchDynamicContext} from '@/features/ai-chat/api/fetch-context';
import {saveChatLog} from '@/lib/api/chat-log';
import {rateLimit} from '@/lib/rate-limit';

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function jsonResponse(body: {error: string}, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json', ...headers},
  });
}

export async function POST(req: Request) {
  // Rate limit by IP
  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();
  const {success} = rateLimit(`chat:${ip}`, {limit: RATE_LIMIT, windowMs: RATE_WINDOW_MS});

  if (!success) {
    return jsonResponse({error: 'Too many requests'}, 429, {'Retry-After': '60'});
  }

  // Parse & validate request body
  let messages: UIMessage[];

  try {
    const body = await req.json();
    messages = body.messages;
  } catch {
    return jsonResponse({error: 'Invalid request body'}, 400);
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({error: 'Messages are required'}, 400);
  }

  if (messages.length > MAX_MESSAGES) {
    return jsonResponse({error: `Too many messages (max ${MAX_MESSAGES})`}, 400);
  }

  // Validate message content length
  for (const m of messages) {
    const text = m.parts?.find((p): p is {type: 'text'; text: string} => p.type === 'text')?.text ?? '';
    if (text.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`}, 400);
    }
  }

  const lastUserMessage = messages.findLast(m => m.role === 'user');
  const userText =
    (lastUserMessage?.parts?.find((p): p is {type: 'text'; text: string} => p.type === 'text'))?.text ?? '';

  // Build system prompt with dynamic context (projects, blog posts)
  const context = await fetchDynamicContext();
  const system = await buildSystemPrompt(context);

  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    system,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1024,
  });

  const response = result.toUIMessageStreamResponse();

  saveChatLog({userMessage: userText, assistantTextPromise: result.text, ip});

  return response;
}
