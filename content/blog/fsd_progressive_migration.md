---
title: "엔터프라이즈 SaaS 플랫폼에서 Feature-Sliced Design 점진적 마이그레이션"
slug: "fsd_progressive_migration"
description: "레거시 플랫 구조의 대규모 React 모노레포를 FSD 아키텍처로 점진적 전환한 경험과 전략 정리"
categories: ["Software Architecture", "Frontend"]
keywords: []
createdTime: "2026-02-24T04:12:42.090Z"
lastEditedTime: "2026-02-24T04:12:42.090Z"
---

## 개요
대규모 React 모노레포의 메인 앱(200+ 컴포넌트)을 플랫 디렉토리 구조에서 Feature-Sliced Design(FSD) 아키텍처로 점진적으로 전환한 경험을 정리했다. 약 50개의 커밋에 걸쳐 3개월간 진행 중인 마이그레이션의 전략, 도입 패턴, 그리고 실무에서 마주한 문제들을 다룬다.

## 배경
멀티 엔티티를 지원하는 SaaS 관리 플랫폼을 개발하고 있었다. 모노레포 안에 5개의 앱과 3개의 공유 패키지가 있었고, 메인 앱의 `src/` 디렉토리는 전형적인 플랫 구조였다.
```javascript
src/
  components/    (31개 디렉토리)
  hooks/         (17개)
  utils/         (17개)
  styled/        (6개)
  type/          (6개)
```
기능이 계속 추가되면서 `components/` 안에 비즈니스 로직과 UI가 뒤섞이고, 도메인 간 의존성이 암묵적으로 얽혀갔다.

## 해결 전략: 점진적 마이그레이션
빅뱅 방식의 전환은 현실적으로 불가능했다. 운영 중인 서비스에 기능 개발을 병행해야 했기 때문이다.

### 1단계: 도메인 단위로 FSD 레이어 신설
가장 변경이 활발한 도메인(비용 관리 모듈)부터 시작했다.
```javascript
src/
  entities/cost/           # 도메인 모델, 쿼리 키
  features/cost-dashboard/ # 대시보드 기능
  widgets/cost/            # 복합 위젯
  pages/cost/              # 페이지 컴포넌트
```

### 2단계: 전역 상태의 app 레이어 정비
Redux slice와 Recoil atom이 여기저기 흩어져 있었다. 이것들을 `app/store/slices/`, `app/store/atoms/`로 모았다.

이 단계에서 **참조 경로 오류가 연쇄적으로 발생**했다. 4개의 연속 커밋에 걸쳐 수정해야 했는데, 이는 "한 번에 너무 많이 옮기지 말 것"이라는 교훈을 남겼다.

### 3단계: 레거시 격리
당장 이관할 수 없는 레거시 코드는 `features/TO_BE_REPLACED/`라는 격리 디렉토리에 모았다. 현재 32개의 레거시 디렉토리가 여기에 있다.

### 4단계: ESLint로 레이어 규칙 강제
```javascript
'import/no-restricted-paths': ['error', {
  zones: [
    { target: './apps/*/src/shared',
      from: ['./apps/*/src/entities', './apps/*/src/features',
             './apps/*/src/widgets', './apps/*/src/pages', './apps/*/src/app'],
      message: 'shared 레이어는 상위 레이어를 import할 수 없습니다.' },
  ]
}]
```

## 도입한 핵심 패턴

### ViewModel 패턴
```typescript
// features/cost/model/useCostDetailViewModel.ts
export function useCostDetailViewModel(id: string) {
  const { data } = useQuery(costKeys.detail(id));
  const mutation = useMutation(/* ... */);
  return { data, isEditable: data?.status === 'DRAFT', submit: mutation.mutate };
}

// features/cost/ui/CostDetail.tsx — 순수 렌더링만 담당
function CostDetail({ id }: Props) {
  const { data, isEditable, submit } = useCostDetailViewModel(id);
  return <>{/* UI only */}</>;
}
```

### Query Key Factory 패턴
```typescript
export const costKeys = createQueryKeyStore({
  cost: {
    list: (params) => ({ queryKey: [params] }),
    detail: (id) => ({ queryKey: [id] }),
  },
});
```

### 슬라이스 공개 API
각 슬라이스는 `index.ts`를 통해서만 외부에 노출된다. 내부 구현을 캡슐화하여 변경 영향 범위를 제한했다.

## 실무에서 마주한 난제: 슬라이스 간 경계 모호성
FSD를 적용하면서 가장 많이 고민한 부분은 "이 코드가 어느 슬라이스에 속하는가"였다.

### 사례: 앱 관리자 조회 API는 어디에?
```typescript
// 응답 타입 — User 도메인에 의존
type AppManagerModel = {
  id: string;
  createdAt: number;
  user: UserBaseModel & {
    profileImageUrl: string | null;
    state: UserStateModel;
  };
};
```
만약 이 API 훅을 `entities/app-instance`에 두면, `entities/user`의 타입을 import해야 한다. 즉, **같은 entities 레이어 내에서 cross-import가 발생**한다.

결과적으로 이 API 훅은 `entities/user`에 배치했다.

### 이 판단이 남긴 트레이드오프
- **API 경로와 슬라이스가 불일치**
- **소비자와의 거리**: 이 API를 실제로 사용하는 컴포넌트는 모두 `widgets/app-instance`에 있다
- **유사 API와의 비일관성**

### 경계 판단에서 배운 것
- **cross-import 회피가 최우선**
- **return type 기준은 명확한 규칙이 된다**
- **합의를 문서화하라**
- **슬라이스 간 조합이 너무 많다면 FSD 도입 자체를 재고하라**: 도메인 간 경계가 명확한 서비스에서는 FSD가 잘 작동한다. 하지만 하나의 화면에서 여러 도메인의 데이터를 조합해야 하는 경우가 대부분이라면, cross-import와 상위 레이어 조합이 폭발적으로 늘어난다.

## 배운 점
- **점진적 마이그레이션은 "새 코드는 새 구조에" 원칙**이 핵심이다. 레거시를 한 번에 옮기려 하면 실패한다.
- **Store 이동은 가장 위험한 작업**이었다. 전역 상태는 참조점이 많아서, 한 번 경로를 바꾸면 수십 개 파일이 영향받는다.
- **ESLint 규칙은 초기에 설정**해야 한다. 레이어 규칙 없이 구조만 만들면, 금세 잘못된 import가 쌓인다.
- **TO_BE_REPLACED 패턴은 의외로 효과적**이다. "완벽하게 이관할 때까지 시작하지 않겠다"보다 "레거시를 격리하고 점진적으로 줄여나가겠다"가 실용적이다.
- **네이밍 컨벤션 통일은 이관 시에 함께** 해야 한다.

## 참고 자료
- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [@lukemorales/query-key-factory](https://github.com/lukemorales/query-key-factory)
- [eslint-plugin-import no-restricted-paths](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md)
