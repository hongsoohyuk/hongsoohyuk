# Notion 프로젝트 목록 + 상세 페이지 구현

## 프로젝트 기술 스택
- Next.js 16.1 + React 19 + Turbopack
- Tailwind CSS 4 + Radix UI
- TanStack React Query
- @notionhq/client (Notion API)
- Feature-Sliced Design (FSD) 아키텍처
- next-intl 국제화

## FSD 구조
```
src/
├── app/          # 프로바이더, 전역 설정
├── pages/        # 페이지 컴포넌트 (app 라우터에서 import)
├── widgets/      # 독립적인 UI 블록
├── features/     # 사용자 상호작용 기능
├── entities/     # 비즈니스 엔티티
└── shared/       # 공용 유틸, UI 컴포넌트
```

## 현재 브랜치
`feat/notion-pages`

## 작업 요구사항
Notion 데이터베이스 기반 프로젝트 목록 페이지 (페이지네이션, 필터링) + 상세 페이지 구현

### 현재 구조
- `src/entities/project/api/` - Notion API 호출
  - `pages/get-notion-page.ts` - 페이지 조회
  - `blocks/get-block-children.ts` - 블록 조회
- `src/entities/project/ui/notion/` - Notion 블록 렌더링
  - `NotionBlocks.tsx` - 블록 타입별 렌더링
  - `NotionRichText.tsx` - 리치 텍스트 렌더링
- `src/pages/project/page.tsx` - 목록 페이지 (기본 구현 있음)
- `src/pages/project/[slug]/page.tsx` - 상세 페이지 (기본 구현 있음)
- `app/[locale]/project/` - 라우트

### 구현 포인트
1. 목록 페이지
   - 페이지네이션 (cursor 기반 또는 offset 기반)
   - 필터링 (카테고리, 태그 등 Notion 속성 활용)
   - 카드 UI로 프로젝트 표시
2. 상세 페이지
   - Notion 블록 렌더링 개선
   - 이미지, 코드 블록 등 지원
   - 메타 정보 (날짜, 태그 등) 표시

## Notion API 참고
- Database Query: `notion.databases.query()`
- Page Retrieve: `notion.pages.retrieve()`
- Block Children: `notion.blocks.children.list()`

## 코드 컨벤션
- 직접 경로 import (barrel file 사용 X)
- ESLint FSD import order 적용
- Prettier 포맷팅

## 개발 서버
```bash
pnpm dev --port 3003
```
