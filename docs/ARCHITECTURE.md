# 🏗️ 프로젝트 아키텍처 및 설계 패턴

## Feature-Sliced Design (FSD) 아키텍처

이 프로젝트는 **Feature-Sliced Design** 아키텍처를 사용하여 구성되었습니다. FSD는 비즈니스 로직을 중심으로 코드를 조직화하는 방법론입니다.

### 📁 디렉토리 구조

```
src/
├── app/                    # 애플리케이션 초기화 및 설정
│   ├── layouts/           # 레이아웃 컴포넌트
│   └── providers/         # Context Providers
├── pages/                 # 페이지 컴포넌트 및 라우팅
├── widgets/               # 복합 UI 컴포넌트
│   ├── header/           # 헤더 위젯
│   ├── footer/           # 푸터 위젯
│   └── navigation/       # 네비게이션 위젯
├── features/              # 비즈니스 기능
│   ├── guestbook/        # 방명록 기능
│   ├── portfolio/        # 포트폴리오 기능
│   └── instagram/        # 인스타그램 기능
├── entities/              # 비즈니스 엔티티
│   ├── user/             # 사용자 엔티티
│   └── post/             # 게시물 엔티티
└── shared/                # 재사용 가능한 코드
    ├── lib/              # 유틸리티 함수
    ├── types/            # 타입 정의
    ├── constants/        # 상수
    └── ui/               # UI 컴포넌트
```

### 🎯 각 레이어의 역할

#### 1. **app/** - 애플리케이션 레벨

- 전역 설정 및 초기화
- 레이아웃 및 프로바이더 설정
- 애플리케이션의 진입점

#### 2. **pages/** - 페이지 레벨

- Next.js 라우팅 페이지
- 페이지 컴포넌트 및 메타데이터
- SEO 및 페이지별 설정

#### 3. **widgets/** - 위젯 레벨

- 복합 UI 컴포넌트
- 여러 피처를 조합한 컴포넌트
- 레이아웃의 주요 부분

#### 4. **features/** - 피처 레벨

- 독립적인 비즈니스 기능
- 각 기능의 UI, 로직, API 호출
- 다른 피처와의 의존성을 최소화

#### 5. **entities/** - 엔티티 레벨

- 비즈니스 엔티티의 정의
- 데이터 모델 및 관련 로직
- 여러 피처에서 공유되는 엔티티

#### 6. **shared/** - 공유 레벨

- 애플리케이션 전반에서 사용되는 코드
- 유틸리티 함수, 타입, 상수
- 재사용 가능한 UI 컴포넌트

### 🔄 의존성 규칙

FSD의 핵심 원칙 중 하나는 **단방향 의존성**입니다:

```
shared ← entities ← features ← widgets ← pages ← app
```

- 상위 레이어는 하위 레이어를 참조할 수 있음
- 하위 레이어는 상위 레이어를 참조할 수 없음
- 동일 레벨 간에는 상대적으로 자유로운 참조 가능

### 📝 파일 네이밍 컨벤션

```
feature/
├── ui/           # UI 컴포넌트
├── model/        # 데이터 모델 및 타입
├── api/          # API 호출 및 데이터 fetching
├── lib/          # 피처 내 유틸리티
└── index.ts      # 공개 인터페이스
```

### 🎨 디자인 시스템

- **shadcn/ui**: 컴포넌트 라이브러리
- **Tailwind CSS**: 스타일링
- **TypeScript**: 타입 안전성

### 🚀 기술 스택

- **Next.js 15**: React 프레임워크
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 시스템
- **Tailwind CSS v4**: 스타일링
- **shadcn/ui**: 컴포넌트 시스템
