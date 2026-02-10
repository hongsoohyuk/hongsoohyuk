import {anthropic} from '@ai-sdk/anthropic';
import {convertToModelMessages, streamText} from 'ai';

const SYSTEM_PROMPT = `당신은 프론트엔드 개발자 홍수혁의 포트폴리오 사이트에 있는 AI 어시스턴트입니다.
방문자의 질문에 친절하게 답변합니다.

[홍수혁 정보]
- 프론트엔드 개발자
- 기술스택: React, Next.js, TypeScript, Tailwind CSS
- 이 사이트: Next.js 16.1 + React 19 + Bulletproof React 아키텍처
- 주요 기능: 블로그(Notion API), 프로젝트, 방명록, 인스타그램 피드, CLI 터미널

답변 규칙:
- 한국어로 답변 (영어 질문엔 영어로)
- 간결하고 친근하게
- 포트폴리오/개발 관련 질문에 집중
- 모르는 것은 솔직하게 모른다고`;

export async function POST(req: Request) {
  const {messages} = await req.json();

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse();
}
