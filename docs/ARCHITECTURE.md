# 🏗️ 프로젝트 아키텍처 및 설계 패턴

## Next.js App Router + Feature-Sliced Design

Next.js App Router를 루트 `app/`에서 운용하고, 도메인 레이어는 FSD(`src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared`)에 배치했습니다.
Next에서 사용하는 `pages/` 폴더는 비워 두고(`pages/README.md`), FSD용 `src/pages`는 라우팅과 무관한 뷰 모델/페이지 조합용으로만 사용합니다.

### 📁 현재 디렉토리 구조

```
app/                       # Next.js App Router (i18n 레이아웃 + API 라우트)
├── [locale]/...           # 지역화 레이아웃 & 페이지
├── api/...                # API Routes
├── globals.css            # 전역 스타일
└── favicon.ico
pages/
└── README.md              # Pages Router 비활성용 placeholder
src/
├── app/                   # FSD app layer (프로바이더, api-routes 어댑터)
│   └── api-routes/
├── pages/                 # FSD page layer (Next 라우트 아님)
│   └── guestbook/index.tsx
├── widgets/
├── features/
├── entities/
├── shared/                # 공용 인프라/리소스 (ui, lib, api, i18n, config)
└── middleware.ts
```

### 🔄 리팩토링 히스토리

#### Phase 1: Next.js App Router 기반 정리

- App Router를 루트 `app/`로 이동하고, Locale 세그먼트와 API 라우트를 여기서 관리.
- Legacy Pages Router는 비워진 `pages/README.md`로만 유지.

#### Phase 2: FSD 레이어 재구성

- 도메인/페이지 조합 코드는 `src/pages`로 모으고, 위젯/피처/엔티티/공용 레이어를 분리.
- 상위 인프라/어댑터는 `src/app` 레이어로 이동(필요 시).

#### Phase 3: 공용 모듈 통합

- API 함수/타입/상수: `src/shared`(인프라)와 `src/entities`(도메인)로 정리.
- i18n: `src/shared/i18n`에서 next-intl 라우팅/메시지 관리.

### 🎯 각 디렉토리의 역할

#### 1. **app/** - Next.js App Router

- **페이지**: 각 라우트별 page.tsx
- **레이아웃**: layout.tsx 파일들
- **API 라우트**: api/ 디렉토리 하위
- **전역 설정**: globals.css, providers

#### 2. **src/pages/** - FSD Page layer

- Next.js 라우팅과 분리된 페이지 조립 레이어
- App Router 파일에서 `export {Page as default}` 형태로 재사용

#### 3. **src/app/** - FSD App layer

- 프로바이더, API 라우트 어댑터, 루트 서비스 집합

#### 4. **src/shared/** - 공용 리소스

- **ui/**: shadcn 기반 공용 UI + 레이아웃 조각
- **i18n/**: next-intl 라우팅/설정
- **config/**: 사이트 상수, 엔드포인트
- **api/**: 공용 인프라(HttpClient, supabase 등)
- **lib/**: 포맷터/헬퍼/훅

#### 5. **src/widgets/features/entities/** - FSD 도메인 레이어

- **widgets**: 페이지 단위 UI 블록
- **features**: 사용 시나리오 단위
- **entities**: 핵심 도메인 모델

### 🚀 HTTP 클라이언트 아키텍처

프로젝트에서 사용하는 HTTP 클라이언트는 다음 기능을 제공합니다:

```typescript
// src/shared/api/http.ts
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
import {Button} from '@/shared/ui';
import {getInstagramMedia} from '@/entities/instagram';
import {InstagramMedia} from '@/entities/instagram';
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
