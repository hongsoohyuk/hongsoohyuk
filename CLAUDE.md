# Instagram Carousel 기능 구현

## 프로젝트 기술 스택
- Next.js 16.1 + React 19 + Turbopack
- Tailwind CSS 4 + Radix UI
- TanStack React Query
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
`feat/instagram-carousel`

## 작업 요구사항
Instagram feed에서 CAROUSEL_ALBUM 타입의 포스트에 대해 여러 사진을 슬라이드로 볼 수 있는 기능 구현

### 현재 구조
- `src/entities/instagram/model/types.ts` - InstagramMedia 타입 정의
- `src/features/instagram/ui/FeedItem.tsx` - 피드 아이템 (Dialog로 상세 보기)
- `src/features/instagram/ui/PostMediaViewer.tsx` - 미디어 뷰어 (현재 단일 이미지/비디오만)
- `src/widgets/instagram/ui/InstagramFeed.tsx` - 피드 그리드
- `public/instagram/feed.json` - 로컬 피드 데이터

### 구현 포인트
1. CAROUSEL_ALBUM 타입 포스트의 children 데이터 활용
2. PostMediaViewer에 carousel 슬라이드 기능 추가
3. 좌우 화살표 또는 스와이프로 이미지 전환
4. 현재 위치 인디케이터 (dots)

## 코드 컨벤션
- 직접 경로 import (barrel file 사용 X)
- ESLint FSD import order 적용
- Prettier 포맷팅

## 개발 서버
```bash
pnpm dev --port 3001
```
