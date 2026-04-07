---
title: "Google Spreadsheet 기반 다국어(i18n) 자동화 파이프라인 구축기"
slug: "i18n_automation_pipeline"
description: "Google Spreadsheet를 SSOT로 활용하여 PO가 관리하는 번역 데이터를 CLI 한 줄로 프론트엔드 JSON 리소스로 동기화하는 자동화 파이프라인 설계 및 구현 과정"
categories: ["Frontend"]
keywords: []
createdTime: "2026-03-07T08:06:52.714Z"
lastEditedTime: "2026-03-29T09:18:18.337Z"
---

## 배경
멀티 엔티티 빌링 플랫폼(GCP, Datadog 등)을 개발하면서 **한국어, 영어, 일본어** 3개 언어를 지원해야 했다. 번역 데이터의 관리 주체는 PO(Product Owner)이고, 개발자는 코드에서 키만 참조하는 구조가 필요했다.

**핵심 요구사항:**
- 개발자가 아닌 PO가 비개발 도구(Google Spreadsheet)에서 직접 번역을 관리
- 개발자는 명령어 실행으로 최신 번역을 동기화
- 키 규칙 위반, 중복 키, 번역 누락을 **스크립트 레벨에서 검증**
- i18next `t()` 함수에서 **타입 안전한 키 참조** (as any 제로)

---

## 전체 아키텍처
```
┌─────────────────────┐    pnpm i18n:pull     ┌─────────────────────┐
│  Google Spreadsheet │ ──────────────────▶   │   pull-i18n.mjs     │
│  PO 번역 관리         │ ◀──────────────────   │   (변환 스크립트)      │
└─────────────────────┘  Service Account      └──────────┬──────────┘
                          + Drive API                   │
                                              XLSX 파싱 + 검증
                                                        │
                                                        ▼
                                            ┌─────────────────────┐
                                            │    JSON 리소스        │
                                            │  src/config/locale/ │
                                            │   {ko,en,ja}/*.json │
                                            └──────────┬──────────┘
                                                       │
                                                 static import
                                                       │
                                                       ▼
                                            ┌─────────────────────┐
                                            │   React 컴포넌트      │
                                            │   useTranslation()  │
                                            └─────────────────────┘
```

---

## 1단계: Google Spreadsheet 구조 설계
시트 하나가 네임스페이스 하나에 대응된다.

| **key** | **ko** | **en** | **ja** |
| --- | --- | --- | --- |
| dashboard | 대시보드 | Dashboard | ダッシュボード |
| costValidation | 매입 관리 | Cost Validation | 仕入管理 |
| message.saveSuccess | 저장되었습니다. | Saved successfully. | 保存しました。 |

---

## 2단계: 변환 스크립트 (`pull-i18n.mjs`)

### 인증: Google Service Account
초기에는 API Key 방식을 시도했지만 비공개 시트에서 **401 오류**가 발생했다. Google Service Account + `google-auth-library`로 전환하여 해결했다.

#### Service Account 생성 절차
1. Google Cloud Console 접속 → 프로젝트 선택
2. API 및 서비스 → 라이브러리 → `Google Sheets API` + `Google Drive API` 둘 다 사용 설정
3. IAM 및 관리자 → 서비스 계정 → "서비스 계정 만들기"
4. 생성된 서비스 계정 클릭 → 키 탭 → "키 추가" → JSON 선택 → 다운로드
5. PO에게 서비스 계정 이메일 전달 → 시트에 뷰어로 초대

#### 환경 변수 설정
```
# .env
I18N_SHEET_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_PATH=credentials/google-service-account.json
```

```json
// package.json
{
  "scripts": {
    "i18n:pull": "node --env-file=.env scripts/pull-i18n.mjs"
  }
}
```

#### 인증 코드
```javascript
const auth = new GoogleAuth({
  keyFile: path.resolve(ROOT, process.env.GOOGLE_SERVICE_ACCOUNT_PATH),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})
const client = await auth.getClient()
const token = await client.getAccessToken()
```

### 다운로드 & 파싱
```javascript
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${token.token}` },
})
const buffer = await res.arrayBuffer()
const workbook = XLSX.read(buffer, { type: 'array' })
const namespaces = workbook.SheetNames
```

### 키 규칙 검증

| **패턴** | **규칙** | **예시** |
| --- | --- | --- |
| flat key | camelCase | `dashboard`, `costValidation` |
| message 접두사 | message.{camelCase} | `message.saveSuccess` |
| error 접두사 | error.{코드} | `error.NOT_FOUND` |
| plural suffix | i18next 문법 허용 | `item_one`, `item_other` |

### JSON 생성
```
src/config/locale/
├── ko/
│   ├── common.json
│   ├── account.json
│   └── setting.json
├── en/
│   └── ...
└── ja/
    └── ...
```

---

## 3단계: i18next 초기화 및 타입 안전성

### 리소스 등록
```typescript
export const resources = {
  ko: { common: koCommon, account: koAccounts, ... },
  en: { common: enCommon, account: enAccounts, ... },
  ja: { common: jaCommon, account: jaAccounts, ... },
} as const  // ← as const로 리터럴 타입 추론
```

### 타입 선언
```typescript
// src/types/i18next.d.ts
import type { defaultNamespace, resources } from '../config/i18n'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNamespace
    resources: (typeof resources)['en']
  }
}
```

### 동적 키 타입 안전성 — `as any` 완전 제거
```typescript
type NavChildKeys<NS extends Namespace> =
  NS extends NS  // ← distributive conditional type 트릭
    ? keyof (typeof resources)['en'][NS] & string
    : never
```

---

## 실행 결과
```
🌐 Google Spreadsheet → i18n JSON 변환 시작
📥 스프레드시트 다운로드 중...
📋 감지된 시트: common, account, cost_validation, setting

📄 common ... ✅ 45개 키
📄 account ... ✅ 32개 키
📄 cost_validation ... ✅ 28개 키
📄 setting ... ✅ 18개 키

──────────────────────────────────────────────────
✅ 완료: 4개 네임스페이스, 123개 키, 3개 언어
📁 출력: src/config/locale/{ko,en,ja}/*.json

📝 번역 누락 (2건):
   ⚠️  [setting] 번역 누락: "timezone" → ja (행 15)
   ⚠️  [account] 번역 누락: "billingType" → en (행 8)
```

---

## 핵심 의사결정 & 트레이드오프

| **결정** | **선택지** | **선택 이유** |
| --- | --- | --- |
| 번역 관리 도구 | Crowdin / Phrase vs **Google Spreadsheet** | PO가 이미 익숙한 도구, 추가 비용 없음, 빠른 도입 |
| 인증 방식 | API Key vs **Service Account** | 비공개 시트 접근 필요, API Key는 401 발생 |
| 리소스 로딩 | dynamic import (lazy) vs **static import** | Vite 빌드 타임에 JSON이 번들에 포함되어 `as const` 타입 추론 가능 |
| 타입 안전성 | `as any` 캐스팅 vs **유틸리티 타입 추출** | 런타임 키 조합에서도 컴파일 타임 검증, 오타 방지 |
| JSON 편집 정책 | 개발자 직접 수정 vs **스크립트만 허용** | SSOT를 Spreadsheet로 고정, 충돌 방지 |

---

## 회고
**잘된 점:**
- PO ↔ 개발자 간 번역 워크플로우가 명확하게 분리됨
- 키 규칙 검증으로 잘못된 키가 코드에 유입되는 것을 사전 차단
- `as const` + `CustomTypeOptions`로 별도 코드젠 없이 타입 안전성 확보

**아쉬운 점:**
- static import 방식이라 네임스페이스 추가 시 `i18n.ts`에 수동 등록 필요
- 번역 키가 많아지면 JSON 파일이 커지므로 네임스페이스 분리 전략이 중요

---

## 부록: 팀 온보딩 체크리스트
새 팀원이 `pnpm i18n:pull`을 실행하기 위한 최소 설정:
1. 서비스 계정 JSON 키 파일을 `credentials/google-service-account.json`에 배치
2. `.env` 파일에 `I18N_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_PATH` 설정
3. `pnpm install` (xlsx, google-auth-library 자동 설치)
4. `pnpm i18n:pull` 실행

> 서비스 계정 키 파일은 팀 비밀 관리 도구(1Password, Vault 등)를 통해 공유하고, 절대 git에 커밋하지 않는다.
