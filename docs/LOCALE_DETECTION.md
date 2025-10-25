# 언어 및 테마 자동 감지 가이드

이 프로젝트는 사용자의 브라우저 설정과 시스템 설정을 자동으로 감지하여 최적의 경험을 제공합니다.

## 🌐 언어 자동 감지

### 동작 방식

1. **브라우저 언어 감지**: `Accept-Language` 헤더를 확인
2. **우선순위**:
   - 사용자가 명시적으로 선택한 언어 (쿠키)
   - 브라우저 언어 설정
   - 기본 언어 (한국어)

### 예시

```
브라우저 언어 설정: ko-KR, en-US
→ 자동으로 /ko로 리다이렉트

브라우저 언어 설정: en-US, ko-KR
→ 자동으로 /en으로 리다이렉트

브라우저 언어 설정: ja-JP (지원 안 함)
→ 기본 언어인 /ko로 리다이렉트
```

### 구현 코드

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);
```

```typescript
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'always',
  localeDetection: true, // ✅ 자동 감지 활성화
});
```

### Next-intl 언어 감지 로직

Next-intl middleware는 다음 순서로 언어를 결정합니다:

1. **URL 경로** (`/ko`, `/en`)
2. **쿠키** (`NEXT_LOCALE`)
3. **Accept-Language 헤더** (브라우저 설정)
4. **기본 언어** (`defaultLocale`)

### 쿠키 저장

사용자가 언어를 전환하면 자동으로 쿠키에 저장됩니다:

```
Set-Cookie: NEXT_LOCALE=ko; Path=/; SameSite=lax
```

다음 방문 시 이 쿠키를 우선 확인하여 사용자가 선택한 언어를 유지합니다.

## 🎨 테마 자동 감지

### 동작 방식

1. **시스템 테마 감지**: `prefers-color-scheme` 미디어 쿼리 확인
2. **우선순위**:
   - 사용자가 명시적으로 선택한 테마 (localStorage)
   - 시스템 테마 설정
   - 기본 테마 (light)

### 예시

```
시스템 설정: Dark Mode
→ 자동으로 다크 모드 적용

시스템 설정: Light Mode
→ 자동으로 라이트 모드 적용

시스템 설정 없음
→ 기본값(라이트 모드) 적용
```

### 구현 코드

```typescript
// src/component/common/theme-script.tsx
export function ThemeScript() {
  const themeScript = `
    (function() {
      function getTheme() {
        // 1. localStorage 확인 (사용자 선택)
        const saved = localStorage.getItem('theme');
        if (saved) return saved;

        // 2. 시스템 설정 확인
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }

      const theme = getTheme();
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
    })();
  `;

  return <script dangerouslySetInnerHTML={{__html: themeScript}} />;
}
```

### 특징

1. **플리커 방지**: `<head>`에서 즉시 실행되어 화면 깜빡임 방지
2. **SSR 안전**: 서버에서는 스크립트만 렌더링, 클라이언트에서 실행
3. **실시간 업데이트**: 시스템 테마 변경 시 자동 반영

### 테마 전환

```typescript
// src/component/common/providers/theme-provider.tsx
const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme); // 사용자 선택 저장

  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(newTheme);
  document.documentElement.style.colorScheme = newTheme;
};
```

## 🔧 사용자 설정 우선순위

### 언어

```
1순위: URL 경로 (/ko, /en)
2순위: NEXT_LOCALE 쿠키 (사용자가 선택한 언어)
3순위: Accept-Language (브라우저 언어)
4순위: defaultLocale (ko)
```

### 테마

```
1순위: localStorage (사용자가 선택한 테마)
2순위: prefers-color-scheme (시스템 설정)
3순위: 기본값 (light)
```

## 🧪 테스트 방법

### 브라우저 언어 설정 변경

**Chrome:**

1. Settings → Languages
2. 언어 순서 변경
3. 브라우저 재시작 또는 시크릿 모드

**Firefox:**

1. Settings → Language
2. Choose your preferred language for displaying pages
3. 순서 변경

**Safari:**

1. System Preferences → Language & Region
2. Preferred languages 순서 변경

### 시스템 테마 설정 변경

**macOS:**

```
System Preferences → General → Appearance
- Light / Dark / Auto
```

**Windows:**

```
Settings → Personalization → Colors
- Choose your color: Light / Dark
```

**개발자 도구에서 테스트:**

```
Chrome DevTools → More tools → Rendering → Emulate CSS media feature prefers-color-scheme
```

## 📊 동작 흐름도

### 언어 감지 흐름

```
사용자 접속 (/)
    ↓
Middleware 실행
    ↓
URL에 locale 있음? → Yes → 해당 locale 사용
    ↓ No
쿠키에 NEXT_LOCALE 있음? → Yes → 쿠키 locale 사용
    ↓ No
Accept-Language 헤더 확인
    ↓
지원하는 언어? → Yes → 해당 locale로 리다이렉트
    ↓ No
기본 언어(ko)로 리다이렉트
```

### 테마 감지 흐름

```
페이지 로드 시작
    ↓
ThemeScript 실행 (SSR 중)
    ↓
localStorage 확인
    ↓
저장된 테마 있음? → Yes → 해당 테마 적용
    ↓ No
prefers-color-scheme 확인
    ↓
시스템 설정 확인 → Dark/Light
    ↓
테마 적용 및 렌더링
```

## 💡 개발 팁

### 언어 감지 디버깅

```typescript
// middleware.ts에 로깅 추가
export default function middleware(request: NextRequest) {
  console.log('Accept-Language:', request.headers.get('accept-language'));
  console.log('Cookie:', request.cookies.get('NEXT_LOCALE'));

  return createMiddleware(routing)(request);
}
```

### 테마 감지 디버깅

```typescript
// 브라우저 콘솔에서
console.log('Stored theme:', localStorage.getItem('theme'));
console.log('System preference:', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
```

### 쿠키 초기화

사용자 선택을 초기화하려면:

```javascript
// 브라우저 콘솔
document.cookie = 'NEXT_LOCALE=; Max-Age=0; path=/';
localStorage.removeItem('theme');
location.reload();
```

## 🌍 다국어 확장

새 언어 추가 시 자동 감지도 함께 작동합니다:

```typescript
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ['ko', 'en', 'ja', 'zh'], // 일본어, 중국어 추가
  defaultLocale: 'ko',
  localeDetection: true, // 자동 감지 유지
});
```

브라우저가 `ja-JP`로 설정되어 있으면 자동으로 `/ja`로 리다이렉트됩니다.

## 📱 모바일 대응

모바일 브라우저도 동일한 로직으로 작동합니다:

- **iOS Safari**: Accept-Language 헤더 자동 전송
- **Android Chrome**: 시스템 언어 설정 사용
- **모바일 다크 모드**: prefers-color-scheme 지원

## 🔒 프라이버시

- 언어 설정: First-party 쿠키 (NEXT_LOCALE)
- 테마 설정: localStorage (동일 출처만 접근 가능)
- 서버 로깅 없음

## 참고 자료

- [next-intl Locale Detection](https://next-intl-docs.vercel.app/docs/routing/middleware#locale-detection)
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [MDN: Accept-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language)
