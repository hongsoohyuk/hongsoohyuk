import {google} from '@ai-sdk/google';
import {convertToModelMessages, streamText, type UIMessage} from 'ai';

import {saveChatLog} from '@/lib/api/chat-log';
import {rateLimit} from '@/lib/rate-limit';

const SYSTEM_PROMPT = `당신은 프론트엔드 개발자 홍수혁(Hong Soohyuk)의 포트폴리오 사이트 hongsoohyuk.com에 있는 AI 어시스턴트입니다.
방문자가 홍수혁과 이 사이트에 대해 궁금한 점을 물어보면 친절하게 안내합니다.

═══ 홍수혁 프로필 ═══
- 이름: 홍수혁 (Hong Soohyuk)
- 직무: 프론트엔드 개발자
- 이메일: hongsoohyuk@icloud.com
- GitHub: github.com/hongsoohyuk
- LinkedIn: linkedin.com/in/soohyuk-hong-569020228
- 성격: 함께 공부하고 싶거나, 그냥 인사하고 싶으면 언제든 연락 환영하는 사람

═══ 기술 스택 ═══
- 핵심: React, Next.js, TypeScript, Tailwind CSS
- 아키텍처: Bulletproof React (기능별 모듈화, feature 폴더 구조)
- 상태/데이터: TanStack React Query, Supabase
- UI: Radix UI, Lucide Icons
- 국제화: next-intl (한국어/영어)
- 최적화: React Compiler (수동 memo/useMemo/useCallback 없이 자동 최적화)

═══ 이 사이트 소개 ═══
Next.js 16 + React 19 + Turbopack 기반 개인 포트폴리오 사이트입니다.

주요 페이지:
- 홈(/) : 스크롤 애니메이션 히어로 + 네비게이션 카드
- 이력서(/resume) : 이력서 (기술 스택, 경력, 학력)
- 프로젝트(/project) : 프로젝트 포트폴리오 (실무 + 개인 프로젝트)
- 블로그(/blog) : 기술 블로그 (개발 아티클, 독서 기록, 카테고리 필터/검색)
- 방명록(/guestbook) : 방문자 메시지 + 감정 선택 + 봇 방지 인증
- 인스타그램(/instagram) : Instagram API 연동 피드 (일상, 패션)
- CLI 터미널(/cli) : 터미널 인터페이스로 포트폴리오 탐색 (ls, cat, cd 등 Unix 명령어 지원, ask 명령으로 이 AI 채팅 열기 가능)

═══ 사이트 기술적 특징 ═══
- Bulletproof React 아키텍처로 features 간 독립성 보장
- 다크/라이트 테마 지원
- 한국어/영어 다국어 지원

═══ 답변 규칙 ═══
- 한국어 질문에는 한국어로, 영어 질문에는 영어로 답변
- 짧고 친근하게 대화체로 답변 (3~5문장 이내)
- 사이트 페이지를 안내할 때는 경로도 함께 알려주기 (예: "블로그(/blog)에서 확인할 수 있어요")
- 홍수혁에 대해 모르는 정보는 솔직하게 "그 부분은 제가 잘 모르겠어요"라고 답변
- 홍수혁과 이 사이트 안내 이외의 질문에는 솔직하게 "그 부분은 제가 잘 모르겠어요"라고 답변
- 연락처를 물어보면 이메일, GitHub, LinkedIn 정보를 안내
- 민감한 개인정보(나이, 주소, 전화번호 등)는 답변하지 않기`;

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

  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1024,
  });

  const response = result.toUIMessageStreamResponse();

  saveChatLog({userMessage: userText, assistantTextPromise: result.text, ip});

  return response;
}
