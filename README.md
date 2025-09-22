# 🌟 홍수혁의 개인 사이트

Next.js 15와 React 19를 활용한 현대적인 개인 포트폴리오 사이트

## ✨ 주요 기능

- **📝 방명록**: 방문자들이 메시지를 남길 수 있는 공간
- **💼 포트폴리오**: Google Docs와 연동된 포트폴리오 및 자기소개
- **📸 인스타그램**: 개인 인스타그램 포스트 표시
- **🎨 반응형 디자인**: 모바일과 데스크톱 모두 최적화

## 🛠️ 기술 스택

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **Language**: TypeScript
- **Architecture**: Feature-Sliced Design (FSD)

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx          # 홈페이지
│   ├── globals.css       # 글로벌 스타일
│   └── favicon.ico       # 파비콘
├── pages/                 # 페이지 컴포넌트
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
├── shared/                # 공유 리소스
│   ├── lib/              # 유틸리티 함수
│   ├── types/            # 타입 정의
│   ├── constants/        # 상수
│   └── ui/               # UI 컴포넌트
└── components/           # shadcn/ui 컴포넌트
    └── ui/               # 기본 UI 컴포넌트
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.17 이상
- npm 또는 yarn 또는 pnpm

### 설치 및 실행

1. **레포지토리 클론**

```bash
git clone <repository-url>
cd hongsoohyuk
```

2. **의존성 설치**

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

3. **개발 서버 실행**

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

4. **브라우저에서 접속**

```
http://localhost:3000
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 빌드 분석 (선택사항)
npm run analyze
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: Tailwind CSS 기본 색상
- **Background**: 어두운 테마 지원
- **Accent**: 강조를 위한 색상

### 타이포그래피

- **본문**: Geist Sans
- **코드**: Geist Mono
- **크기**: Tailwind CSS 기본 스케일

### 컴포넌트

shadcn/ui 컴포넌트를 기반으로 한 일관된 디자인 시스템:

- Button, Card, Input, Textarea
- Table, Accordion, Badge
- 반응형 및 접근성 지원

## 📚 학습 자료

프로젝트 진행 중 학습한 내용을 정리한 문서들:

- [**🏗️ 아키텍처 가이드**](./docs/ARCHITECTURE.md) - FSD 구조 및 설계 원칙
- [**📚 Next.js 학습 노트**](./docs/NEXTJS_LEARNING.md) - Next.js 15 주요 개념
- [**⚛️ React 학습 노트**](./docs/REACT_LEARNING.md) - React 19 패턴 및 훅
- [**📝 프로젝트 학습 기록**](./docs/PROJECT_LEARNING.md) - 구현 과정 및 학습 포인트

## 🔧 개발 환경 설정

### VS Code 확장 프로그램 (권장)

- **Tailwind CSS IntelliSense**: 클래스 자동 완성
- **TypeScript Importer**: 자동 import
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅

### 환경 변수

```bash
# .env.local 파일 생성
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_INSTAGRAM_USERNAME=your_instagram_username
NEXT_PUBLIC_GOOGLE_DOCS_ID=your_google_docs_id
```

## 📱 기능 구현 계획

### Phase 1: 기본 구조 ✅

- [x] 프로젝트 설정
- [x] FSD 아키텍처 구축
- [x] shadcn/ui 컴포넌트 설치
- [x] 기본 타입 및 유틸리티 정의

### Phase 2: 핵심 기능 (진행 중)

- [ ] 메인 레이아웃 및 네비게이션
- [ ] 방명록 기능 (CRUD)
- [ ] 포트폴리오 기능 (Google Docs 연동)
- [ ] 인스타그램 기능 (API 연동)

### Phase 3: 고급 기능

- [ ] 사용자 인증
- [ ] 관리자 패널
- [ ] SEO 최적화
- [ ] 성능 모니터링

## 🧪 테스팅

```bash
# 단위 테스트 실행
npm run test

# E2E 테스트 실행
npm run test:e2e

# 테스트 커버리지 확인
npm run test:coverage
```

## 🚀 배포

### Vercel (권장)

1. [Vercel](https://vercel.com)에서 프로젝트 연결
2. 자동 배포 설정
3. 환경 변수 설정

### 기타 플랫폼

- **Netlify**: `npm run build` 후 dist 폴더 배포
- **Railway**: Docker 지원
- **AWS Amplify**: 풀스택 배포

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🙋‍♂️ 문의사항

프로젝트에 대한 질문이나 제안사항이 있으시면 언제든지 연락주세요!

- **Email**: your-email@example.com
- **LinkedIn**: [프로필 링크]
- **GitHub**: [프로필 링크]

## 📊 프로젝트 상태

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC)

---

**⭐ 이 프로젝트가 마음에 드셨다면 별을 눌러주세요!**
