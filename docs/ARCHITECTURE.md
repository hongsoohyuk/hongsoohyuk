# 🏗️ 프로젝트 아키텍처 및 설계 패턴

## Next.js 공식 구조 기반 아키텍처

이 프로젝트는 **Next.js 공식 권장 구조**를 기반으로 구성되었습니다. 기존 Feature-Sliced Design에서 Next.js 표준 구조로 리팩토링하여 더 직관적이고 유지보수하기 쉬운 코드베이스를 구축했습니다.

### 📁 현재 디렉토리 구조

```
src/
├── app/                    # Next.js App Router (페이지, 레이아웃, API 라우트)
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   ├── globals.css        # 전역 스타일
│   ├── api/               # API 라우트
│   │   └── instagram/
│   │       ├── posts/route.ts
│   │       └── me/route.ts
│   ├── guestbook/
│   │   └── page.tsx
│   ├── instagram/
│   │   ├── page.tsx
│   │   └── sections/
│   │       └── InstagramFeedClient.tsx
│   ├── portfolio/
│   │   └── page.tsx
│   └── providers/
│       └── QueryProvider.tsx
├── components/            # 재사용 가능한 UI 컴포넌트 (진행 중)
│   └── ui/               # 기본 UI 컴포넌트 (shadcn/ui)
├── lib/                  # 유틸리티, API, 타입, 상수
│   ├── api/
│   │   ├── instagram.ts  # Instagram API 함수
│   │   └── portfolio.ts  # Portfolio API 함수
│   ├── hooks/
│   │   └── instagram.ts  # Instagram 관련 훅
│   ├── constants/
│   │   └── instagram.ts  # Instagram 상수
│   ├── types/
│   │   ├── index.ts      # 전역 타입
│   │   └── instagram.ts  # Instagram 타입
│   ├── http.ts           # HTTP 클라이언트
│   └── utils.ts          # 유틸리티 함수
└── shared/               # 레거시 구조 (정리 중)
    ├── config/
    ├── constants/
    ├── lib/
    ├── types/
    └── ui/
```

### 🔄 리팩토링 히스토리

#### Phase 1: Feature-Sliced Design → Next.js 공식 구조

- **기존**: FSD의 복잡한 레이어 구조 (app/pages/widgets/features/entities/shared)
- **현재**: Next.js 권장 구조 (app/components/lib)
- **장점**: 더 직관적이고 Next.js 생태계와 일치

#### Phase 2: API 통합 및 HTTP 모듈 도입

- **Instagram API 통합**: 중복된 서버/클라이언트 로직을 API Route 중심으로 통합
- **HTTP 모듈 도입**: 타임아웃, 재시도, 타입 안전성을 제공하는 HTTP 클라이언트
- **데이터 페칭 일관성**: 모든 API 호출이 동일한 HTTP 모듈 사용

#### Phase 3: 구조 정리 및 파일 이동

- **API 함수**: `lib/api/` 디렉토리로 도메인별 정리
- **훅**: `lib/hooks/` 디렉토리로 이동
- **타입**: `lib/types/` 디렉토리로 통합
- **상수**: `lib/constants/` 디렉토리로 정리

### 🎯 각 디렉토리의 역할

#### 1. **src/app/** - Next.js App Router

- **페이지**: 각 라우트별 page.tsx
- **레이아웃**: layout.tsx 파일들
- **API 라우트**: api/ 디렉토리 하위
- **전역 설정**: globals.css, providers

#### 2. **src/components/** - 컴포넌트

- **ui/**: shadcn/ui 기본 컴포넌트
- **layout/**: Header, Footer 등 레이아웃 컴포넌트 (예정)
- **도메인별/**: instagram/, portfolio/ 등 도메인 컴포넌트 (예정)

#### 3. **src/lib/** - 비즈니스 로직 & 유틸리티

- **api/**: 도메인별 API 함수
- **hooks/**: 커스텀 훅
- **types/**: TypeScript 타입 정의
- **constants/**: 상수 정의
- **utils.ts**: 유틸리티 함수
- **http.ts**: HTTP 클라이언트

### 🚀 HTTP 클라이언트 아키텍처

프로젝트에서 사용하는 HTTP 클라이언트는 다음 기능을 제공합니다:

```typescript
// src/lib/http.ts
export class HttpClient {
  // 타임아웃 설정
  // 재시도 로직 (지수 백오프)
  // 에러 핸들링
  // TypeScript 타입 지원
}

// 사용 예시
const data = await http.get<InstagramListResponse>('/api/instagram/posts', {
  query: {after, limit},
  timeoutMs: 10000,
  retry: {retries: 3},
});
```

### 📊 API 구조

#### Instagram API 패턴

```
클라이언트 → http.get('/api/instagram/posts') → API Route → Instagram Graph API
서버 사이드 → http.get('http://localhost:3000/api/instagram/posts') → API Route → Instagram Graph API
```

#### 장점

- **일관된 데이터 페칭**: 모든 Instagram 데이터가 API Route를 통해 처리
- **보안**: 액세스 토큰이 클라이언트에 노출되지 않음
- **캐싱**: Next.js의 캐싱 전략 활용
- **에러 핸들링**: 통합된 에러 처리

### 🎨 기술 스택

#### 핵심 기술

- **Next.js 15**: React 프레임워크 (App Router)
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 시스템
- **Tailwind CSS v4**: 스타일링

#### 라이브러리

- **shadcn/ui**: 컴포넌트 라이브러리
- **@tanstack/react-query**: 서버 상태 관리
- **class-variance-authority**: 스타일 variant 관리
- **clsx + tailwind-merge**: 클래스 이름 유틸리티

#### 개발 도구

- **ESLint**: 코드 품질
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 체크

### 🔧 개발 패턴 및 컨벤션

#### 1. **파일 네이밍**

- **컴포넌트**: PascalCase (예: `InstagramFeedClient.tsx`)
- **API 함수**: camelCase (예: `getInstagramMedia`)
- **타입**: PascalCase (예: `InstagramMedia`)
- **상수**: UPPER_SNAKE_CASE (예: `IG_FEED_STYLES`)

#### 2. **Import 패턴**

```typescript
// 절대 경로 사용
import {Button} from '@/components/ui';
import {getInstagramMedia} from '@/lib/api/instagram';
import {InstagramMedia} from '@/lib/types';
```

#### 3. **API 함수 패턴**

```typescript
// 클라이언트용
export async function getInstagramMedia(params) {
  return http.get('/api/instagram/posts', {query: params});
}

// 서버용
export async function getInstagramMediaServer(params) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return http.get(`${baseUrl}/api/instagram/posts`, {query: params});
}
```

#### 4. **컴포넌트 구조**

```typescript
// Server Component (기본)
export default async function InstagramPage() {
  const data = await getInstagramMediaServer();
  return <InstagramFeedClient initialData={data} />;
}

// Client Component
'use client';
export default function InstagramFeedClient({initialData}) {
  const {data} = useInstagramFeed({initialData});
  return <div>{/* UI */}</div>;
}
```

### 🚧 진행 중인 리팩토링

#### 완료된 작업 ✅

- [x] Instagram API 통합 및 HTTP 모듈 도입
- [x] API 구조 정리 (lib/api/)
- [x] 훅 이동 (lib/hooks/)
- [x] 타입 정리 (lib/types/)

#### 진행 중인 작업 🚧

- [ ] 컴포넌트 이동 (components/)
- [ ] 레거시 shared/ 디렉토리 정리
- [ ] 유틸리티 함수 통합
- [ ] 상수 파일 정리

#### 예정된 작업 📋

- [ ] tsconfig.json path mapping 업데이트
- [ ] 빈 디렉토리 정리
- [ ] 문서 업데이트 완료

### 📈 성능 최적화

#### 1. **데이터 페칭**

- **SSR**: 초기 데이터를 서버에서 미리 로드
- **무한 스크롤**: 클라이언트에서 점진적 로딩
- **캐싱**: Next.js 내장 캐싱 + React Query

#### 2. **번들 최적화**

- **Code Splitting**: 페이지별 자동 분할
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Dynamic Import**: 필요시 로딩

#### 3. **이미지 최적화**

- **Next.js Image**: 자동 최적화 및 lazy loading
- **반응형 이미지**: sizes 속성 활용

### 🔒 보안 고려사항

#### 1. **API 보안**

- **환경 변수**: 민감한 정보는 서버 환경에서만 접근
- **API Route**: 클라이언트에서 직접 외부 API 호출 방지
- **CORS**: 필요시 적절한 CORS 설정

#### 2. **타입 안전성**

- **TypeScript**: 컴파일 타임 타입 체크
- **API 응답**: 런타임 타입 검증 (필요시)

### 📚 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React Query 문서](https://tanstack.com/query)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com)

---

_이 문서는 프로젝트 구조 변경에 따라 지속적으로 업데이트됩니다._
