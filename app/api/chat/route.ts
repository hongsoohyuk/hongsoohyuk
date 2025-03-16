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

const ALLOWED_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'] as const;
type AllowedModel = (typeof ALLOWED_MODELS)[number];

function isAllowedModel(model: unknown): model is AllowedModel {
  return typeof model === 'string' && ALLOWED_MODELS.includes(model as AllowedModel);
}

function jsonResponse(body: {error: string; code?: string}, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json', ...headers},
  });
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();
  const {success} = rateLimit(`chat:${ip}`, {limit: RATE_LIMIT, windowMs: RATE_WINDOW_MS});

  if (!success) {
    return jsonResponse({error: 'Too many requests', code: 'RATE_LIMIT'}, 429, {'Retry-After': '60'});
  }

  let messages: UIMessage[];
  const headerModel = req.headers.get('x-model');
  const modelId: AllowedModel = isAllowedModel(headerModel) ? headerModel : 'gemini-2.5-flash';

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

  for (const m of messages) {
    const text = m.parts?.find((p): p is {type: 'text'; text: string} => p.type === 'text')?.text ?? '';
    if (text.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`}, 400);
    }
  }

  const lastUserMessage = messages.findLast((m) => m.role === 'user');
  const userText =
    lastUserMessage?.parts?.find((p): p is {type: 'text'; text: string} => p.type === 'text')?.text ?? '';

  const context = await fetchDynamicContext();
  const system = await buildSystemPrompt(context);

  try {
    const result = streamText({
      model: google(modelId),
      system,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 2048,
    });

    const response = result.toUIMessageStreamResponse();

    saveChatLog({userMessage: userText, assistantTextPromise: result.text, ip});

    return response;
  } catch (err: unknown) {
    const status = (err as {status?: number})?.status;
    const message = (err as {message?: string})?.message ?? 'Unknown error';

    if (status === 429) {
      return jsonResponse(
        {error: `${modelId} 모델의 요청 한도에 도달했습니다. 다른 모델을 선택해주세요.`, code: 'MODEL_RATE_LIMIT'},
        429,
      );
    }

    return jsonResponse({error: `AI 응답 오류: ${message}`, code: 'AI_ERROR'}, 500);
  }
}
