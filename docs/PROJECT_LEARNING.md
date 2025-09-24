# 📝 프로젝트 구현 학습 노트

## 프로젝트 개요

- **프로젝트명**: 홍수혁의 개인 사이트
- **기술 스택**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **아키텍처**: Next.js 공식 구조 (FSD에서 리팩토링)
- **HTTP 클라이언트**: 커스텀 HTTP 모듈 (타임아웃, 재시도, 타입 지원)

## 🔄 주요 리팩토링 과정

### Phase 1: Feature-Sliced Design → Next.js 공식 구조

#### 변경 이유

- FSD의 복잡한 레이어 구조가 소규모 프로젝트에는 과도함
- Next.js 생태계와의 일관성 부족
- 학습 곡선이 높고 유지보수가 복잡함

#### 변경 사항

```diff
- src/
-   ├── app/
-   ├── pages/
-   ├── widgets/
-   ├── features/
-   ├── entities/
-   └── shared/

+ src/
+   ├── app/          # Next.js App Router
+   ├── components/   # 재사용 가능한 컴포넌트
+   └── lib/          # 비즈니스 로직, API, 유틸리티
```

### Phase 2: Instagram API 통합 및 HTTP 모듈 도입

#### 문제점

- 중복된 API 로직 (server.ts vs client.ts)
- 일관성 없는 에러 핸들링
- 타임아웃 및 재시도 로직 부재

#### 해결 방안

```typescript
// 이전: 중복된 로직
// features/instagram/api/server.ts - 서버 직접 호출
// features/instagram/api/client.ts - API Route 호출

// 현재: 통합된 구조
// lib/api/instagram.ts
export async function getInstagramMedia() {
  return http.get('/api/instagram/posts');
}

export async function getInstagramMediaServer() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return http.get(`${baseUrl}/api/instagram/posts`);
}
```

#### HTTP 모듈 특징

- **타임아웃**: 요청별 타임아웃 설정
- **재시도**: 지수 백오프 재시도 로직
- **타입 안전성**: TypeScript 제네릭 지원
- **에러 핸들링**: 통합된 에러 처리

### Phase 3: 파일 구조 정리

#### API 함수 정리

```
src/lib/api/
├── instagram.ts    # Instagram 관련 API
└── portfolio.ts    # Portfolio 관련 API
```

#### 훅 정리

```
src/lib/hooks/
└── instagram.ts    # useInstagramFeed
```

#### 타입 정리

```
src/lib/types/
├── index.ts        # 전역 타입
└── instagram.ts    # Instagram 타입
```

## 구현된 기능

### ✅ 완료된 작업

#### 1. **프로젝트 설정 및 아키텍처**

- [x] Next.js 15 + TypeScript 설정
- [x] Tailwind CSS v4 설정
- [x] shadcn/ui 컴포넌트 라이브러리 설치
- [x] Next.js 공식 구조로 리팩토링
- [x] HTTP 클라이언트 모듈 구현

#### 2. **Instagram 기능 완성**

- [x] Instagram API 통합 (Graph API)
- [x] 무한 스크롤 피드 구현
- [x] 프로필 정보 표시
- [x] 반응형 그리드 레이아웃
- [x] 로딩 및 에러 상태 처리

#### 3. **설치된 shadcn/ui 컴포넌트**

- [x] Button 컴포넌트
- [x] Card 컴포넌트
- [x] Input 컴포넌트
- [x] Textarea 컴포넌트
- [x] Badge 컴포넌트
- [x] Skeleton 컴포넌트
- [x] Table 컴포넌트
- [x] Accordion 컴포넌트

#### 4. **API Routes 구현**

- [x] `/api/instagram/posts` - Instagram 미디어 조회
- [x] `/api/instagram/me` - Instagram 프로필 조회
- [x] `/api/portfolio` - 포트폴리오 데이터 (기본 구조)

### 🚧 진행 중인 작업

#### 1. **구조 리팩토링 완료**

- [x] Instagram API 통합
- [x] HTTP 모듈 도입
- [x] 파일 구조 정리
- [ ] 컴포넌트 이동 (components/)
- [ ] 레거시 코드 정리 (shared/)

#### 2. **포트폴리오 기능**

- [ ] Google Docs API 연동
- [ ] 포트폴리오 표시 컴포넌트
- [ ] 콘텐츠 파싱 및 렌더링

#### 3. **방명록 기능**

- [ ] 방명록 엔티티 정의
- [ ] CRUD 기능 구현
- [ ] 데이터베이스 연동

## 학습 포인트 및 주요 개념

### 1. **Next.js 15 App Router 심화**

#### 학습한 개념:

- **Server Components vs Client Components**: 'use client' 지시어 활용
- **API Routes**: route.ts 파일로 API 엔드포인트 구성
- **Data Fetching**: fetch API와 캐싱 전략
- **Parallel Routes**: 동시 데이터 페칭

#### 실제 적용 사례:

```typescript
// 서버 컴포넌트에서 병렬 데이터 페칭
export default async function InstagramPage() {
  const [initial, profile] = await Promise.all([
    getInstagramMediaServer({limit: 12}),
    getInstagramProfileServer(),
  ]);

  return <InstagramFeedClient initialItems={posts} />;
}
```

### 2. **HTTP 클라이언트 설계**

#### 학습한 패턴:

- **클래스 기반 설계**: 설정과 메서드 분리
- **제네릭 활용**: 타입 안전한 API 응답
- **에러 처리**: 커스텀 HttpError 클래스
- **재시도 로직**: 지수 백오프 구현

#### 실제 구현:

```typescript
export class HttpClient {
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);

      promise.then(resolve, reject).finally(() => clearTimeout(timeout));
    });
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    // 재시도 로직과 함께 구현
  }
}
```

### 3. **React Query 통합**

#### 학습한 개념:

- **useInfiniteQuery**: 무한 스크롤 구현
- **Initial Data**: SSR 데이터와 클라이언트 상태 동기화
- **Stale Time**: 캐시 무효화 전략
- **Background Refetch**: 백그라운드 업데이트 제어

#### 실제 적용:

```typescript
export function useInstagramFeed(options) {
  const query = useInfiniteQuery({
    queryKey: ['instagram', pageSize],
    queryFn: ({pageParam}) => getInstagramMedia({after: pageParam}),
    initialData: initialItems.length
      ? {
          pageParams: [undefined],
          pages: [{data: initialItems, paging: {cursors: {after: initialAfter}}}],
        }
      : undefined,
    getNextPageParam: (lastPage) => lastPage.paging?.cursors?.after,
    refetchOnMount: false, // SSR 데이터 보존
  });
}
```

### 4. **TypeScript 고급 패턴**

#### 학습한 기법:

- **유틸리티 타입**: Omit, Pick, Partial 활용
- **제네릭 제약**: API 응답 타입 제한
- **모듈 선언**: 외부 라이브러리 타입 확장
- **타입 가드**: 런타임 타입 검증

#### 실제 사용:

```typescript
export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  query?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
```

### 5. **성능 최적화 기법**

#### 학습한 전략:

- **SSR + Hydration**: 초기 로딩 성능 최적화
- **Intersection Observer**: 무한 스크롤 최적화
- **Image Optimization**: Next.js Image 컴포넌트 활용
- **Bundle Analysis**: 번들 크기 모니터링

## 문제 해결 및 트러블슈팅

### 1. **API Route 통합 과정**

**문제**: 서버와 클라이언트에서 중복된 Instagram API 호출 로직
**해결**:

1. API Route를 단일 진실의 원천으로 설정
2. 서버 사이드에서도 API Route 호출하도록 변경
3. HTTP 모듈로 일관된 에러 처리

**학습**:

- API Route의 역할과 중요성
- 서버-클라이언트 간 데이터 흐름 설계
- 중복 제거의 가치

### 2. **HTTP 모듈 설계**

**문제**: fetch API의 기본 기능 부족 (타임아웃, 재시도 등)
**해결**:

1. 클래스 기반 HTTP 클라이언트 구현
2. 타임아웃, 재시도, 에러 처리 로직 추가
3. TypeScript 제네릭으로 타입 안전성 확보

**학습**:

- 추상화의 중요성
- 에러 처리 패턴
- TypeScript 고급 기능 활용

### 3. **무한 스크롤 구현**

**문제**: SSR 데이터와 클라이언트 상태 동기화
**해결**:

1. initialData를 통한 초기 상태 설정
2. refetchOnMount: false로 불필요한 재요청 방지
3. Intersection Observer로 성능 최적화

**학습**:

- React Query의 고급 기능
- SSR과 클라이언트 상태 관리
- 성능 최적화 기법

### 4. **구조 리팩토링**

**문제**: FSD에서 Next.js 구조로의 전환
**해결**:

1. 점진적 마이그레이션 전략
2. 의존성 그래프 분석
3. 테스트를 통한 기능 보장

**학습**:

- 대규모 리팩토링 전략
- 의존성 관리
- 구조 설계의 중요성

## 현재 프로젝트 상태

### 📊 통계

- **총 파일 수**: ~50개
- **코드 라인 수**: ~2000줄
- **API 엔드포인트**: 3개
- **완성된 페이지**: 4개 (홈, 인스타그램, 포트폴리오, 방명록)
- **리팩토링 진행률**: 70%

### 🎯 현재 마일스톤

- [x] **Phase 1**: 프로젝트 설정 및 기본 구조 (완료)
- [x] **Phase 2**: Instagram 기능 완성 (완료)
- [x] **Phase 3**: API 통합 및 HTTP 모듈 (완료)
- [ ] **Phase 4**: 구조 리팩토링 완료 (진행 중 70%)
- [ ] **Phase 5**: 포트폴리오 & 방명록 기능 (대기 중)

## 다음 단계 계획

### 단기 목표 (1주)

1. [ ] 컴포넌트 구조 정리 완료
2. [ ] 레거시 코드 제거
3. [ ] 문서 업데이트 완료
4. [ ] tsconfig.json path mapping 정리

### 중기 목표 (1개월)

1. [ ] 포트폴리오 기능 구현 (Google Docs API)
2. [ ] 방명록 기능 구현 (데이터베이스 연동)
3. [ ] 성능 최적화 및 모니터링
4. [ ] 테스트 코드 작성

### 장기 목표 (2-3개월)

1. [ ] 배포 및 CI/CD 파이프라인
2. [ ] SEO 최적화
3. [ ] 사용자 피드백 수집
4. [ ] 추가 기능 개발

## 핵심 학습 성과

### 기술적 성장

1. **Next.js 심화**: App Router, API Routes, SSR/CSR 하이브리드
2. **TypeScript 고급**: 제네릭, 유틸리티 타입, 타입 가드
3. **HTTP 클라이언트**: 재시도, 타임아웃, 에러 처리 로직
4. **상태 관리**: React Query를 활용한 서버 상태 관리
5. **성능 최적화**: 무한 스크롤, 이미지 최적화, 번들 분석

### 설계 및 아키텍처

1. **구조 설계**: FSD에서 Next.js 구조로의 전환 경험
2. **API 설계**: RESTful API 패턴과 타입 안전성
3. **컴포넌트 설계**: Server/Client 컴포넌트 분리
4. **에러 처리**: 계층별 에러 처리 전략
5. **코드 조직화**: 도메인별 파일 구조 설계

### 개발 프로세스

1. **점진적 리팩토링**: 기능을 유지하면서 구조 개선
2. **문서화**: 학습 과정과 의사결정 기록
3. **테스트**: 빌드 테스트를 통한 안정성 확보
4. **성능 모니터링**: 번들 크기 및 로딩 성능 추적

## 회고 및 개선점

### 잘한 점

- 체계적인 리팩토링 과정
- HTTP 모듈 설계 및 구현
- TypeScript 타입 안전성 확보
- 성능 최적화 고려
- 문서화 및 학습 기록

### 개선할 점

- 테스트 코드 부족
- 에러 바운더리 미구현
- 접근성 고려 부족
- CI/CD 파이프라인 부재

### 다음 프로젝트에서 적용할 것

- TDD 접근법
- 더 체계적인 테스트 전략
- 접근성 우선 설계
- 성능 모니터링 도구 도입

---

_이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다._
