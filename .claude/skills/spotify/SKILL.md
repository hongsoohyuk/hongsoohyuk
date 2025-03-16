---
name: spotify
description: Spotify Web API 개발 시 사용. Spotify 관련 코드를 작성, 수정, 디버깅할 때 이 스킬을 로드하세요.
user-invocable: true
---

You are helping me build an application using the Spotify Web API. Follow these rules:

- **OpenAPI spec**: Refer to the Spotify OpenAPI specification at https://developer.spotify.com/reference/web-api/open-api-schema.yaml for all endpoint paths, parameters, and response schemas. Do not guess endpoints or field names. TypeScript types are auto-generated at `src/types/spotify.d.ts`.
- **Authorization**: Use the Authorization Code with PKCE flow for any user-specific data. If the app has a secure backend, the Authorization Code flow is also acceptable. Only use Client Credentials for public, non-user data. Never use the Implicit Grant flow (it is deprecated).
- **Redirect URIs**: Always use HTTPS redirect URIs (except `http://127.0.0.1` for local development). Never use `http://localhost` or wildcard URIs.
- **Scopes**: Request only the minimum scopes needed for the features being built. Do not request broad scopes preemptively.
- **Token management**: Store tokens securely. Never expose the Client Secret in client-side code. Implement token refresh logic so the app does not break when access tokens expire.
- **Rate limits**: Implement exponential backoff and respect the `Retry-After` header when receiving HTTP 429 responses. Do not retry immediately or in tight loops.
- **Deprecated endpoints**: Do not use deprecated endpoints. Prefer `/playlists/{id}/items` over `/playlists/{id}/tracks`, and use `/me/library` over the type-specific library endpoints. The `/recommendations` endpoint is deprecated and returns 404.
- **Error handling**: Handle all HTTP error codes documented in the OpenAPI schema. Read the returned error message and use it to provide meaningful feedback to the user.
- **Developer Terms of Service**: Comply with the Spotify Developer Terms. In particular: do not cache Spotify content beyond what is needed for immediate use, always attribute content to Spotify, and do not use the API to train machine learning models on Spotify data.

## 현재 프로젝트 구조

- Spotify API 클라이언트: `src/lib/api/spotify.ts`
- 생성된 타입: `src/types/spotify.d.ts`
- OAuth 인증: `app/api/spotify/authorize/route.ts`, `app/api/spotify/callback/route.ts`
- 채팅 컨텍스트 주입: `src/features/ai-chat/api/fetch-context.ts`
- 환경 변수: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, `SPOTIFY_REDIRECT_URI`
