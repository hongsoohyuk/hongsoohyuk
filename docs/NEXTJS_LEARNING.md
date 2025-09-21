# 📚 Next.js 15 학습 노트

## App Router vs Pages Router

### App Router (사용 중 ✅)

- **파일 기반 라우팅**: `app/` 디렉토리 사용
- **React Server Components**: 기본적으로 서버 컴포넌트
- **레이아웃 시스템**: 중첩된 레이아웃 지원
- **병렬 라우팅**: 동시에 여러 페이지 로드

### 주요 개념

#### 1. **Server Components**

```tsx
// 기본적으로 모든 컴포넌트는 Server Component
export default function Page() {
  // 서버에서 실행되는 코드
  const data = await fetchData();

  return <div>{data}</div>;
}
```

#### 2. **Client Components**

```tsx
'use client'; // 클라이언트 컴포넌트 선언

import {useState} from 'react';

export default function ClientComponent() {
  const [state, setState] = useState('');

  return <input value={state} onChange={(e) => setState(e.target.value)} />;
}
```

#### 3. **Layout System**

```tsx
// app/layout.tsx - 루트 레이아웃
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

// app/dashboard/layout.tsx - 중첩 레이아웃
export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      {children}
    </div>
  );
}
```

#### 4. **Loading & Error Boundaries**

```tsx
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}

// app/error.tsx
export default function Error({error, reset}: {error: Error; reset: () => void}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

#### 5. **Route Groups**

```tsx
// app/(auth)/login/page.tsx - 그룹 라우팅
// app/(auth)/register/page.tsx
// app/(dashboard)/profile/page.tsx
// app/(dashboard)/settings/page.tsx
```

#### 6. **Dynamic Routes**

```tsx
// app/posts/[id]/page.tsx
export default function Post({params}: {params: {id: string}}) {
  return <div>Post ID: {params.id}</div>;
}

// app/posts/[...slug]/page.tsx - Catch-all routes
export default function CatchAll({params}: {params: {slug: string[]}}) {
  return <div>Slug: {params.slug.join('/')}</div>;
}
```

#### 7. **Parallel Routes**

```tsx
// app/dashboard/@modal/page.tsx - 모달용 병렬 라우트
// app/dashboard/@sidebar/page.tsx - 사이드바용 병렬 라우트
// app/dashboard/page.tsx - 메인 페이지
```

### App Router vs Pages Router: 차이와 선택 이유

#### 개념적 차이

- **App Router (app/)**: React Server Components 기반. 파일-기반 라우팅 + 레이아웃/스트리밍/캐싱/서버 액션/병렬 라우팅 등 현대적 패턴을 1급으로 지원.
- **Pages Router (pages/)**: 전통적 SSR/CSR 모델. 모든 컴포넌트가 클라이언트 컴포넌트로 취급되고 `getServerSideProps`/`getStaticProps` 등 데이터 패칭 API를 사용.

#### 기술적 차이 핵심

- **데이터 패칭**: App은 서버 컴포넌트에서 직접 `await fetch()` 가능. Pages는 특수 함수(`getServerSideProps`)에 한정.
- **레이아웃**: App은 중첩 레이아웃과 슬롯(Parallel/Intercepted routes)을 공식 지원. Pages는 공통 레이아웃을 `_app.tsx`로 수동 구성.
- **스트리밍/점진적 렌더링**: App은 기본 탑재. Pages는 제한적.
- **캐싱 모델**: App은 요청 캐시/라우트 세그먼트 캐시/ISR를 세밀하게 제어. Pages는 상대적으로 단순.
- **번들 최적화**: App은 서버/클라이언트 경계를 통해 전송 자바스크립트를 줄임. Pages는 전부 클라이언트 번들에 포함되는 경향.

#### 왜 본 프로젝트(인스타그램 피드: SSR 초기 12개 + CSR 무한스크롤)에 App Router가 더 적합한가

- **SSR 초기 로드 최적화(RSC)**: 서버 컴포넌트에서 바로 Instagram API를 호출해 초기 12개를 반환. 클라이언트로 불필요한 데이터/코드 전송을 최소화.
- **CSR 확장성(useInfiniteQuery)**: 클라이언트 섹션만 `"use client"`로 분리해 무한스크롤과 상태 관리(React Query)를 적용. 서버/클라이언트 경계가 명확해 유지보수가 쉽다.
- **캐싱 전략 용이성**: 서버 서비스(`next: { revalidate: 60 }`)로 초기 로드 캐싱, API 라우트는 `cache: 'no-store'`로 CSR 페이지네이션에 최신성 보장.
- **구조적 일관성**: API 라우트(`/app/api/instagram`)와 페이지(`/app/instagram`)가 같은 라우팅 시스템에 공존. 코드 코로케이션으로 탐색성과 변경 용이성 향상.
- **에러/로딩 경계**: App 라우팅의 `loading.tsx`/`error.tsx`를 활용해 사용자 경험 개선 가능.
- **점진적 향상**: 필요 시 스트리밍/병렬 라우팅으로 확장(예: 모달 뷰, 사이드 정보 패널)하기 쉬움.

#### 언제 Pages Router를 고려?

- 레거시 프로젝트 유지보수나 App Router로의 마이그레이션 비용이 큰 경우
- 특정 라이브러리가 Pages Router 전용 패턴에만 맞춰진 경우

#### 본 프로젝트의 설계 포인트 요약(면접 답변용)

- **요구사항**: 최초 접근 시 빠른 LCP를 위해 SSR로 12개 미디어 노출, 이후 스크롤 시 CSR로 추가 로드.
- **선택 근거**: App Router의 서버 컴포넌트 데이터 패칭과 클라이언트 경계 분리를 통해 성능(전송 JS 최소화)과 DX(코드 코로케이션/캐싱 제어) 모두 확보.
- **구현 하이라이트**:
  - 서버: `fetchInstagramMediaServer`로 초기 데이터 + 재검증 설정
  - API: `/api/instagram` 커서 기반 페이지네이션
  - 클라이언트: `useInfiniteQuery` 기반 `useInstagramFeed` 훅과 `IntersectionObserver`로 무한 스크롤
  - 전역 상태: `QueryClientProvider`로 React Query 설정

## 데이터 Fetching 전략

### Server Components에서의 데이터 가져오기

```tsx
// 서버 컴포넌트에서 직접 API 호출
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Client Components에서의 데이터 가져오기

```tsx
'use client';

import {useEffect, useState} from 'react';

export default function PostsClient() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## Server Actions (Next.js 13+)

```tsx
// app/actions.ts
'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // 데이터베이스에 저장
  await db.posts.create({title, content});

  // 캐시 무효화 및 리다이렉트
  revalidatePath('/posts');
  redirect('/posts');
}

// 컴포넌트에서 사용
('use client');

import {createPost} from './actions';

export default function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="제목" />
      <textarea name="content" placeholder="내용" />
      <button type="submit">게시</button>
    </form>
  );
}
```

## 환경 변수

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
```

```tsx
// 클라이언트에서 사용 가능
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// 서버에서만 사용 가능
const dbUrl = process.env.DATABASE_URL;
```

## 미들웨어

```tsx
// middleware.ts
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export function middleware(request: NextRequest) {
  // 인증 체크
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## 최적화 기법

### 1. **Image Optimization**

```tsx
import Image from 'next/image';

export default function OptimizedImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={800}
      height={600}
      priority // LCP 이미지에 사용
      placeholder="blur" // 블러 플레이스홀더
    />
  );
}
```

### 2. **Font Optimization**

```tsx
import {Inter} from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // FOIT 방지
});

export default function Layout() {
  return <div className={inter.className}>{children}</div>;
}
```

### 3. **Bundle Analysis**

```bash
# 번들 크기 분석
npm install --save-dev @next/bundle-analyzer

# package.json에 스크립트 추가
"analyze": "ANALYZE=true next build"
```

## 배포 및 프로덕션 고려사항

### 1. **Build Optimization**

```tsx
// next.config.ts
module.exports = {
  swcMinify: true, // SWC 미니파이어 사용
  experimental: {
    optimizeCss: true, // CSS 최적화
  },
};
```

### 2. **Static Generation vs SSR**

```tsx
// 정적 생성 (빌드 시점)
export async function generateStaticParams() {
  const posts = await fetchPosts();

  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

// 서버 사이드 렌더링
export const dynamic = 'force-dynamic'; // 매 요청마다 SSR
```

### 3. **Caching 전략**

```tsx
// ISR (Incremental Static Regeneration)
export const revalidate = 60; // 60초마다 재생성

// 캐시 제어
export async function generateMetadata({params}) {
  const post = await getPost(params.id);

  return {
    title: post.title,
    openGraph: {
      images: [post.image],
    },
  };
}
```

## 디버깅 및 개발 도구

### 1. **React DevTools**

- 컴포넌트 트리 분석
- Props 및 State 검사
- Performance 프로파일링

### 2. **Next.js DevTools**

```bash
# 개발 서버에서 제공되는 도구들
# /_next/static/chunks/webpack.js 분석
# /_next/static/chunks/pages 분석
```

### 3. **Console Debugging**

```tsx
// 서버 컴포넌트 디버깅
console.log('Server component rendered');

// 클라이언트 컴포넌트 디버깅
useEffect(() => {
  console.log('Client component mounted');
}, []);
```

## 학습 리소스

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [App Router 마이그레이션 가이드](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Vercel 배포 가이드](https://vercel.com/docs/concepts/next.js/overview)
