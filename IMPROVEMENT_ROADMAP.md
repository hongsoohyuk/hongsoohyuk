# 프로젝트 고도화 로드맵 (2026-02-24 작성)

## Phase 1 — 보안 (완료)
- [x] AI Chat: IP 기반 rate limiting (10req/min, in-memory)
- [x] AI Chat: 입력 검증 (메시지 수 20개, 길이 500자, 빈 메시지 거부)
- [x] Guestbook: Turnstile 서버사이드 검증 (`src/lib/turnstile/lib/verify.ts`)
- [x] `.gitignore`에 `playwright-report` 추가

## Phase 2 — SEO 고도화
- [ ] JSON-LD 구조화 데이터 추가
  - 블로그: `BlogPosting` schema
  - 프로젝트: `CreativeWork` schema
  - 메인: `Person` + `WebSite` schema
- [ ] Breadcrumb schema (블로그/프로젝트 상세)
- [ ] Notion 이미지 alt text 개선 (현재 fallback 텍스트 사용)

## Phase 3 — 테스트 강화
- [ ] Playwright E2E 테스트 작성 (설정은 있으나 실제 테스트 미비)
  - Preview 환경에서 Turnstile 테스트 키 사용하도록 Vercel 환경변수 분리
- [ ] 주요 컴포넌트 React Testing Library 테스트 (GuestbookFormDialog, ChatFloater 등)
- [ ] jest-axe 접근성 테스트 도입
- [ ] AI Chat 스트리밍/에러 핸들링 테스트

## Phase 4 — 접근성 개선
- [ ] Skip to content 링크 추가
- [ ] `role="button"` 사용 중인 `<div>` → `<button>` 태그로 교체
- [ ] 아이콘 전용 버튼에 시각적 텍스트 대안 보강
- [ ] 터미널(CLI) 스크린 리더 지원 (`aria-live` 등)
- [ ] 다크/라이트 모드 색상 대비 검증

## Phase 5 — 성능 최적화
- [ ] Notion 이미지 최적화 (현재 `<img>` 태그, URL 만료 이슈 → 이미지 프록시/CDN 캐시)
- [ ] Notion 블록 N+1 쿼리 개선 (깊은 중첩 재귀 호출)
- [ ] AI Chat 번들 분리 (`dynamic(() => import(...), { ssr: false })`)
- [ ] Rate Limiting을 Upstash Redis로 교체 (현재 in-memory, cold start 시 리셋)

## Phase 6 — 아키텍처 리팩토링
- [ ] `notion-blocks.tsx` (330줄 switch문) → 블록 타입별 컴포넌트 맵 분리
- [ ] CLI 기능 모듈화 (~1400줄 로직 → 별도 패키지 추출)
- [ ] Blog/Project/Guestbook 공유 카드 레이아웃 패턴 통합

## 잔여 보안 TODO
- [ ] Google Gemini API 키 월 예산 상한 설정 (Google Cloud 콘솔)
- [ ] Vercel Firewall 또는 Cloudflare DDoS 방어 검토
- [ ] CSP 헤더 추가 (Next.js middleware 또는 next.config.ts)
