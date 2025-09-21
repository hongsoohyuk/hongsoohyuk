# 📝 프로젝트 구현 학습 노트

## 프로젝트 개요

- **프로젝트명**: 홍수혁의 개인 사이트
- **기술 스택**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **아키텍처**: Feature-Sliced Design (FSD)

## 구현된 기능

### ✅ 완료된 작업

#### 1. **프로젝트 설정 및 아키텍처**

- [x] Next.js 15 + TypeScript 설정
- [x] Tailwind CSS v4 설정
- [x] shadcn/ui 컴포넌트 라이브러리 설치
- [x] Feature-Sliced Design 구조 구현
- [x] 기본 타입 정의 및 유틸리티 함수 생성

#### 2. **설치된 shadcn/ui 컴포넌트**

- [x] Button 컴포넌트
- [x] Table 컴포넌트
- [x] Accordion 컴포넌트
- [x] Card 컴포넌트
- [x] Input 컴포넌트
- [x] Textarea 컴포넌트
- [x] Badge 컴포넌트

### 🚧 진행 중인 작업

#### 1. **메인 레이아웃 및 네비게이션**

- [ ] 헤더 컴포넌트 생성
- [ ] 푸터 컴포넌트 생성
- [ ] 네비게이션 메뉴 구현
- [ ] 반응형 레이아웃 설정

#### 2. **방명록 기능 (Guestbook)**

- [ ] 방명록 엔티티 정의
- [ ] 방명록 작성 폼 컴포넌트
- [ ] 방명록 목록 표시 컴포넌트
- [ ] API 엔드포인트 생성
- [ ] 데이터베이스 스키마 설계

#### 3. **포트폴리오 기능 (Portfolio)**

- [ ] 포트폴리오 엔티티 정의
- [ ] Google Docs API 연동 계획
- [ ] 포트폴리오 표시 컴포넌트
- [ ] 콘텐츠 파싱 및 렌더링 로직

#### 4. **인스타그램 기능 (Instagram)**

- [ ] 인스타그램 엔티티 정의
- [ ] Instagram API 연동 계획
- [ ] 포스트 표시 컴포넌트
- [ ] 이미지 및 캡션 렌더링

## 학습 포인트 및 주요 개념

### 1. **Next.js 15 App Router**

#### 학습한 개념:

- **Server Components**: 기본적으로 모든 컴포넌트가 서버에서 실행
- **Client Components**: `'use client'` 지시어로 클라이언트 컴포넌트 선언
- **Layout System**: 중첩된 레이아웃 지원
- **Route Groups**: 경로 그룹화 기능
- **Dynamic Routes**: 동적 라우팅 `[id]`, `[...slug]`

#### 실제 적용 사례:

```tsx
// app/layout.tsx - 루트 레이아웃
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

### 2. **Feature-Sliced Design (FSD)**

#### 학습한 개념:

- **app/**: 애플리케이션 초기화 및 설정
- **pages/**: 페이지 컴포넌트 및 라우팅
- **widgets/**: 복합 UI 컴포넌트
- **features/**: 비즈니스 기능 단위
- **entities/**: 비즈니스 엔티티
- **shared/**: 재사용 가능한 코드

#### 실제 적용 사례:

```
src/
├── app/
│   └── layouts/
├── pages/
├── widgets/
│   ├── header/
│   ├── footer/
│   └── navigation/
├── features/
│   ├── guestbook/
│   ├── portfolio/
│   └── instagram/
├── entities/
│   ├── user/
│   └── post/
└── shared/
    ├── lib/
    ├── types/
    ├── constants/
    └── ui/
```

### 3. **TypeScript 통합**

#### 학습한 패턴:

- **인터페이스 정의**: 데이터 구조 명확화
- **유틸리티 타입**: `Partial<T>`, `Pick<T>`, `Omit<T>`
- **제네릭**: 재사용 가능한 컴포넌트 타입화
- **모듈 선언**: 외부 라이브러리 타입 확장

#### 실제 적용 사례:

```tsx
// shared/types/index.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestbookEntry extends BaseEntity {
  author: User;
  content: string;
  isApproved: boolean;
}
```

### 4. **Tailwind CSS v4**

#### 학습한 개념:

- **CSS 변수 활용**: 디자인 토큰 관리
- **반응형 디자인**: `sm:`, `md:`, `lg:` 접두사
- **다크 모드**: `dark:` 접두사
- **컴포넌트 추상화**: 재사용 가능한 클래스 패턴

#### 실제 적용 사례:

```css
/* globals.css */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### 5. **shadcn/ui 컴포넌트 시스템**

#### 학습한 패턴:

- **컴포넌트 합성**: 기본 컴포넌트 조합
- **Variant 시스템**: 다양한 스타일 변형 지원
- **접근성**: ARIA 속성 및 키보드 네비게이션
- **TypeScript 통합**: 완전한 타입 지원

#### 실제 적용 사례:

```tsx
// components/ui/button.tsx
import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, asChild = false, ...props}, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({variant, size, className}))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export {Button, buttonVariants};
```

## 문제 해결 및 트러블슈팅

### 1. **shadcn/ui 설치 이슈**

**문제**: 일부 컴포넌트 (list, transition)가 존재하지 않음
**해결**: 개별 컴포넌트별로 설치 진행
**학습**: shadcn/ui 컴포넌트 카탈로그를 확인하고 필요한 컴포넌트만 선택적으로 설치

### 2. **Tailwind CSS v4 설정**

**문제**: 새로운 v4 버전의 설정 방식에 대한 이해 부족
**해결**: 공식 문서 참고 및 기존 설정 파일 분석
**학습**: CSS 변수와 @theme 지시어 활용법

### 3. **FSD 구조 설계**

**문제**: 각 레이어의 역할과 의존성 규칙에 대한 이해
**해결**: 공식 문서 및 예제 프로젝트 참고
**학습**: 단방향 의존성 원칙과 파일 네이밍 컨벤션

## 다음 단계 계획

### 단기 목표 (1-2주)

1. [ ] 메인 레이아웃 및 네비게이션 완성
2. [ ] 방명록 기능의 기본적인 CRUD 구현
3. [ ] 데이터베이스 설계 및 연결
4. [ ] 환경 변수 및 설정 관리

### 중기 목표 (1개월)

1. [ ] 포트폴리오 기능 구현
2. [ ] Google Docs API 연동
3. [ ] 인스타그램 API 연동
4. [ ] 반응형 디자인 최적화

### 장기 목표 (2-3개월)

1. [ ] 배포 및 CI/CD 파이프라인 구축
2. [ ] SEO 최적화
3. [ ] 성능 모니터링 및 최적화
4. [ ] 사용자 피드백 수집 및 개선

## 참고 자료 및 학습 리소스

### 공식 문서

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### 커뮤니티 및 블로그

- [Vercel Blog](https://vercel.com/blog)
- [Next.js Blog](https://nextjs.org/blog)
- [Tailwind CSS Blog](https://tailwindcss.com/blog)

### 유용한 도구

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Next.js DevTools](https://nextjs.org/docs/advanced-features/devtools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## 회고 및 개선점

### 잘한 점

- 체계적인 프로젝트 구조 설계 (FSD)
- 타입 안전성 확보 (TypeScript)
- 컴포넌트 라이브러리 활용 (shadcn/ui)
- 학습 문서화

### 개선할 점

- 테스트 코드 작성
- 더 자세한 에러 처리
- 성능 최적화 고려
- 접근성 개선

### 다음 프로젝트에서 적용할 것

- 테스트 주도 개발 (TDD)
- CI/CD 파이프라인 구축
- 모노레포 구조 고려
- 디자인 시스템 구축

---

## 📊 프로젝트 통계

- **총 파일 수**: 35개
- **코드 라인 수**: ~1200줄
- **설치된 패키지**: 18개
- **학습한 개념**: 25+개
- **작성된 문서**: 4개
- **완성된 페이지**: 4개 (홈, 방명록, 포트폴리오, 인스타그램)
- **설치된 shadcn/ui 컴포넌트**: 7개

## 🎯 마일스톤

- [x] **Phase 1**: 프로젝트 설정 및 아키텍처 구축 (완료)
- [ ] **Phase 2**: 기본 기능 구현 (진행 중)
- [ ] **Phase 3**: 고급 기능 및 최적화
- [ ] **Phase 4**: 배포 및 운영
