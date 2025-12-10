# i18n (국제화) 가이드

이 프로젝트는 `next-intl`을 사용하여 다국어를 지원합니다.

## 지원 언어

- 한국어 (ko) - 기본 언어
- 영어 (en)

## URL 구조

모든 페이지는 언어 접두사를 포함합니다:

- 한국어: `http://localhost:3000/ko`
- 영어: `http://localhost:3000/en`

루트 URL (`/`)에 접속하면 자동으로 기본 언어(`/ko`)로 리다이렉트됩니다.

## 폴더 구조

```
src/
app/
├── [locale]/              # 모든 페이지는 [locale] 하위에 위치
│   ├── layout.tsx         # 언어별 레이아웃
│   ├── page.tsx           # 홈 페이지
│   ├── instagram/
│   ├── portfolio/
│   └── ...
├── api/                   # API는 locale 밖에 위치 (다국어 불필요)
└── layout.tsx             # 루트 레이아웃 (리다이렉트용)

src/
├── shared/
│   ├── i18n/              # 언어 설정 (config/request/routing)
│   └── ui/                # 공용 UI (LocaleSwitcher 등)
├── features/              # 도메인별 기능
├── entities/              # 도메인 모델/API
└── pages/                 # FSD 페이지 조립 레이어
│
└── middleware.ts              # 언어 감지 및 리다이렉트

messages/
├── ko.json                    # 한국어 번역
└── en.json                    # 영어 번역
```

## 번역 파일 구조

번역 파일은 네임스페이스 단위로 구성됩니다:

```json
{
  "HomePage": {
    "title": "안녕하세요,",
    "name": "홍수혁",
    "sections": {
      "guestbook": {
        "title": "방명록",
        "description": "방문자들이 남겨주신 소중한 메시지들을 확인할 수 있어요"
      }
    }
  },
  "Header": {
    "nav": {
      "home": "홈",
      "guestbook": "방명록"
    }
  }
}
```

## 사용 방법

### 1. Server Component에서 사용

```typescript
import {getTranslations, setRequestLocale} from 'next-intl/server';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale); // 정적 생성 활성화

  const t = await getTranslations('HomePage');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('sections.guestbook.description')}</p>
    </div>
  );
}
```

### 2. Client Component에서 사용

```typescript
'use client';

import {useTranslations} from 'next-intl';

export function MyComponent() {
  const t = useTranslations('HomePage');

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

### 3. 동적 메타데이터

```typescript
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Instagram'});

  return {
    title: t('title'),
    description: t('description'),
  };
}
```

### 4. 번역된 링크 사용

```typescript
import {Link} from '@/shared/i18n/routing';

export function Navigation() {
  return (
    <nav>
      <Link href="/">홈</Link>
      <Link href="/instagram">인스타그램</Link>
    </nav>
  );
}
```

`@/shared/i18n/routing`의 `Link`를 사용하면 자동으로 현재 언어가 URL에 포함됩니다.

### 5. 프로그래밍 방식 네비게이션

```typescript
'use client';

import {useRouter, usePathname} from '@/shared/i18n/routing';

export function MyComponent() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    router.push('/instagram'); // 자동으로 /ko/instagram 또는 /en/instagram
  };

  return <button onClick={handleClick}>Go to Instagram</button>;
}
```

### 6. 변수 삽입

```typescript
const t = useTranslations('Footer');

// messages/ko.json: "copyright": "© {year} 홍수혁. All rights reserved."
return <p>{t('copyright', {year: 2025})}</p>;
// 출력: © 2025 홍수혁. All rights reserved.
```

### 7. 기본값 제공

```typescript
const t = useTranslations('Instagram.post');

// 번역이 없으면 기본값 사용
return <span>{t('engagement', {default: '상호작용'})}</span>;
```

## 언어 전환기

`LocaleSwitcher` 컴포넌트를 사용하여 언어를 전환할 수 있습니다:

```typescript
import {LocaleSwitcher} from '@/shared/ui/locale-switcher';

export function Header() {
  return (
    <header>
      <LocaleSwitcher />
    </header>
  );
}
```

## 새 언어 추가하기

1. **언어 설정 추가** (`src/i18n/config.ts`):

```typescript
export const locales = ['ko', 'en', 'ja'] as const; // 일본어 추가
export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};
export const localeFlags: Record<Locale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
};
```

2. **라우팅 설정 업데이트** (`src/i18n/routing.ts`):

```typescript
export const routing = defineRouting({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko',
});
```

3. **번역 파일 추가** (`messages/ja.json`):

```json
{
  "HomePage": {
    "title": "こんにちは、",
    ...
  }
}
```

4. **미들웨어 설정 업데이트** (`src/middleware.ts`):

```typescript
export const config = {
  matcher: ['/', '/(ko|en|ja)/:path*'],
};
```

## 새 페이지 만들기

새 페이지를 만들 때는 반드시 `app/[locale]` 하위에 생성하고, locale을 처리해야 합니다:

```typescript
// app/[locale]/new-page/page.tsx
import {setRequestLocale} from 'next-intl/server';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function NewPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <div>New Page</div>;
}
```

## 번역 키 네이밍 컨벤션

- **PascalCase**: 네임스페이스 (예: `HomePage`, `Instagram`)
- **camelCase**: 키 이름 (예: `title`, `description`, `sections`)
- **중첩 구조**: 관련된 번역은 그룹화 (예: `sections.guestbook.title`)

## 주의사항

1. **모든 페이지는 `app/[locale]` 하위에 위치해야 합니다**
   - API 라우트는 예외 (`app/api`)

2. **Server Component에서는 `setRequestLocale` 필수**

   ```typescript
   const {locale} = await params;
   setRequestLocale(locale);
   ```

3. **Link는 `@/i18n/routing`에서 import**

   ```typescript
   import {Link} from '@/i18n/routing'; // ✅
   import Link from 'next/link'; // ❌
   ```

4. **번역 키가 없으면 에러 발생**
   - 개발 중에는 default 값 제공 권장
   - 프로덕션 배포 전 모든 번역 키 확인

5. **Middleware matcher 패턴 유지**
   - 새 언어 추가 시 matcher 업데이트 필수

## 디버깅

### 번역이 표시되지 않는 경우

1. 번역 파일 경로 확인: `messages/{locale}.json`
2. 네임스페이스가 올바른지 확인
3. 개발 서버 재시작

### URL에 locale이 표시되지 않는 경우

1. Middleware가 올바르게 설정되었는지 확인
2. Link를 `@/i18n/routing`에서 import했는지 확인
3. 브라우저 캐시 삭제

### 타입 에러

```typescript
// params는 항상 Promise로 처리
const {locale} = await params; // ✅
const locale = params.locale; // ❌
```

## 참고 자료

- [next-intl 공식 문서](https://next-intl-docs.vercel.app/)
- [Next.js i18n 가이드](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
