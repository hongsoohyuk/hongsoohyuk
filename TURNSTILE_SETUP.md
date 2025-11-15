# Cloudflare Turnstile Setup Guide

## 1. 문제 해결

### 401 Unauthorized 에러

이 에러는 다음과 같은 이유로 발생합니다:

1. **Site Key가 설정되지 않음**: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 환경 변수 누락
2. **잘못된 Site Key**: 유효하지 않은 키 사용
3. **도메인 불일치**: Turnstile 설정에서 등록되지 않은 도메인에서 실행

### 무한 재요청 문제

다음 수정사항으로 해결되었습니다:

- ✅ useCallback으로 콜백 함수 메모이제이션
- ✅ useRef를 통한 콜백 함수 참조 저장 (의존성 배열 문제 해결)
- ✅ 중복 렌더링 방지 (`isRenderingRef` 및 `widgetIdRef` 체크)
- ✅ 모달이 열려있는 동안 위젯 유지 (cleanup을 모달 닫힐 때만 실행)
- ✅ 위젯 렌더링 useEffect 의존성을 `open`과 `scriptReady`로만 제한
- ✅ 상세한 로깅 추가

**핵심 해결 방법:**
- 토큰 수신 시 상태 변경으로 인한 리렌더링이 발생해도 위젯을 제거하지 않음
- `callbacksRef`를 통해 최신 콜백을 참조하되, 위젯은 재렌더링하지 않음
- 모달이 닫힐 때(`open === false`)만 위젯을 정리

## 2. CSP (Content Security Policy) 설정

Cloudflare Turnstile이 작동하려면 CSP 설정이 필요합니다.

### Next.js CSP 설정

`next.config.ts`에 다음 헤더를 추가했습니다:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://challenges.cloudflare.com",
            "frame-src 'self' https://challenges.cloudflare.com",
            "worker-src 'self' blob:",
          ].join('; '),
        },
      ],
    },
  ];
}
```

### CSP 에러 해결

만약 다음과 같은 에러가 발생한다면:

```
Note that 'script-src' was not explicitly set, so 'default-src' is used as a fallback.
```

이는 CSP 정책이 Turnstile 스크립트를 차단하고 있다는 의미입니다. 위의 설정이 적용되어 있는지 확인하세요.

**중요**: CSP 설정 변경 후 개발 서버를 재시작해야 합니다.

## 3. 환경 변수 설정

### 로컬 개발 환경

프로젝트 루트에 `.env.local` 파일을 생성하세요:

```bash
# 테스트용 키 (항상 통과)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

### 프로덕션 환경

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. Turnstile 섹션으로 이동
3. "Add Site" 클릭
4. 도메인 설정:
   - **Site Name**: 프로젝트 이름
   - **Domain**: 배포할 도메인 (예: `myapp.vercel.app`)
   - **Widget Mode**: Managed (권장)
5. Site Key 복사
6. 배포 플랫폼(Vercel 등)에 환경 변수 추가:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_actual_site_key
   ```

## 3. Turnstile 테스트 키

개발 중에 사용할 수 있는 공식 테스트 키:

| 목적 | Site Key |
|------|----------|
| 항상 통과 | `1x00000000000000000000AA` |
| 항상 실패 | `2x00000000000000000000AB` |
| 인터랙티브 챌린지 강제 | `3x00000000000000000000FF` |

## 4. 도메인 설정

### 로컬 개발

Turnstile 설정에서 다음 도메인들을 추가하세요:

- `localhost`
- `127.0.0.1`
- `*.local` (선택사항)

### 프로덕션

실제 도메인을 추가하세요:

- `yourdomain.com`
- `*.yourdomain.com` (서브도메인 포함)

## 5. 디버깅

브라우저 콘솔에서 다음 로그를 확인하세요:

```
[Turnstile] Rendering widget with site key: ...
[Turnstile] Widget rendered with ID: ...
[Turnstile] Token received successfully
```

에러 발생 시:

```
[Turnstile] Error occurred - check site key and domain configuration
```

이 경우:
1. Site Key가 올바른지 확인
2. 현재 도메인이 Turnstile 설정에 등록되어 있는지 확인
3. 브라우저 개발자 도구 Network 탭에서 실제 요청 확인

## 6. 보안 주의사항

⚠️ **중요**: 

- `.env.local` 파일을 `.gitignore`에 추가하세요 (이미 추가되어 있음)
- 프로덕션 Site Key를 공개 저장소에 커밋하지 마세요
- 테스트 키는 프로덕션에서 사용하지 마세요

## 7. 서버 사이드 검증

현재 구현은 클라이언트 사이드만 구현되어 있습니다.
프로덕션에서는 서버 사이드 검증을 추가하는 것을 강력히 권장합니다:

```typescript
// app/api/guestbook/route.ts 에서
const verifyTurnstile = async (token: string) => {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY, // 서버 전용
        response: token,
      }),
    }
  );
  
  const data = await response.json();
  return data.success;
};
```

## 8. 문제 해결 체크리스트

- [ ] `.env.local` 파일 생성 및 Site Key 설정
- [ ] 개발 서버 재시작 (`npm run dev` 또는 `pnpm dev`)
- [ ] 브라우저 캐시 및 쿠키 삭제
- [ ] Cloudflare Dashboard에서 도메인 설정 확인
- [ ] 브라우저 콘솔 로그 확인
- [ ] Network 탭에서 401 에러 상세 정보 확인

## 참고 자료

- [Cloudflare Turnstile 공식 문서](https://developers.cloudflare.com/turnstile/)
- [Turnstile 테스트 키](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
- [클라이언트 사이드 렌더링](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)

