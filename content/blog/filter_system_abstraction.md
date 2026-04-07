---
title: "Custom Field 대응을 위한 필터 시스템 추상화 설계"
slug: "filter_system_abstraction"
description: "Discriminated Union과 Composition 패턴으로 확장 가능한 필터 컴포넌트 아키텍처를 설계한 경험 정리"
categories: ["Software Architecture", "Frontend"]
keywords: []
createdTime: "2026-02-24T08:05:02.143Z"
lastEditedTime: "2026-02-24T08:05:02.143Z"
---

## 개요
SaaS 관리 플랫폼에서 다양한 필터 타입(텍스트, 숫자, 단일/다중 선택, 날짜, 기간, 서버 검색 등)을 지원하면서도, 사용자가 정의한 Custom Field까지 동적으로 대응해야 하는 필터 시스템을 설계했다. TypeScript의 Discriminated Union과 React의 Composition 패턴을 활용해 OCP 원칙을 지키면서 확장 가능한 구조를 만든 과정을 정리한다.

## 배경
플랫폼의 리스트 화면마다 필터가 필요했다. 처음에는 각 화면에서 필터 UI를 직접 구현했지만, 비슷한 패턴이 반복되었다.

여기에 Custom Field 요구사항이 추가되었다. 관리자가 조직 설정에서 커스텀 필드를 정의하면, 해당 필드가 필터에도 동적으로 나타나야 했다. 정적으로 하드코딩된 필터 구조로는 대응이 불가능했다.

## 문제
1. **필터 타입별로 UI와 동작이 다르다**
2. **Custom Field는 런타임에 결정된다**
3. **새 필터 타입 추가 시 변경 범위를 최소화**해야 한다

## 해결: 타입 기반 다형성 설계

### 인터페이스 계층 구조
```typescript
interface BaseFilter {
  type: FilterType;
  parameterKey: string | { from: string; to: string };
  label: string;
  fixed?: boolean;
}

interface TextFilterType extends BaseFilter {
  type: 'SHORT_TEXT' | 'LONG_TEXT';
  parameterKey: string;
  placeholder?: string;
}

interface SingleSelectFilterType extends BaseFilter {
  type: 'SINGLE_SELECT';
  parameterKey: string;
  options: { label: string; value: string }[];
}

interface PeriodFilterType extends BaseFilter {
  type: 'PERIOD';
  parameterKey: { from: string; to: string };
}
```
핵심은 `type` 필드를 discriminant로 사용하는 **Discriminated Union**이다.
```typescript
type AvailableFilterType =
  | TextFilterType
  | NumberFilterType
  | SingleSelectFilterType
  | MultiSelectFilterType
  | PeriodFilterType
  | UserFilterType
  | ...;
```

### 다형적 렌더링 (UnionCaseRenderer)
```typescript
<UnionCaseRenderer
  value={filter}
  extractKey="type"
  cases={{
    KEYWORD:       (v) => <KeywordFilter {...v} />,
    SHORT_TEXT:    (v) => <TextFilter {...v} />,
    NUMBER:        (v) => <NumberFilter {...v} />,
    SINGLE_SELECT: (v) => <EnumFilter {...v} />,
    MULTI_SELECT:  (v) => <EnumMultiFilter {...v} />,
    PERIOD:        (v) => <PeriodFilter {...v} />,
    USER_SELECT:   (v) => <UserFilter {...v} />,
  }}
/>
```
OOP의 **다형성(Polymorphism)**을 클래스 상속 없이 구현한 셈이다. 새 필터 타입을 추가할 때는 (1) 타입 정의, (2) 컴포넌트 구현, (3) cases에 등록 — 세 곳만 수정하면 된다.

### 재사용 가능한 기반 컴포넌트 (Composition)
```
FilterContainer          — 팝오버 UI, 앵커 위치, 클리어 버튼 등 공통 크롬
FilterLocalSearch<T>     — 로컬 데이터 자동완성 (제네릭)
FilterServerSearch<T>    — 서버 데이터 자동완성 (제네릭)
useIdFilter              — ID 기반 필터의 URL 파라미터 관리
```

```typescript
const FilterServerSearch = <T,>({
  options: T[];
  getOptionId: (option: T) => string;
  getOptionLabel?: (option: T) => string;
  renderOption: (option: T, meta: { isSelected: boolean }) => ReactNode;
})
```
이 구조 덕분에 User, License, Application 등 서로 다른 도메인의 서버 검색 필터를 같은 컴포넌트로 구현할 수 있었다.

### URL 기반 상태 관리
```typescript
const useIdFilter = ({ parameterKey }) => {
  const queryParams = new URLSearchParams(location.search);
  const selectedIds = queryParams.getAll(parameterKey);

  const onFilter = (value: string[]) => {
    queryParams.delete(parameterKey);
    value.forEach(id => queryParams.append(parameterKey, id));
    history.replace(`${location.pathname}?${queryParams.toString()}`);
  };

  return { selectedIds, onFilter };
};
```
필터 상태가 URL에 반영되어 북마크, 공유, 뒤로 가기가 자연스럽게 동작한다.

## 배운 점
- **Discriminated Union은 클래스 상속의 대안**이 된다. TypeScript에서 다형성이 필요할 때 클래스 계층 대신 유니온 타입 + 패턴 매칭으로 더 간결하게 구현할 수 있다.
- **제네릭 컴포넌트는 도메인 독립성을 보장**한다. `FilterServerSearch<T>`처럼 타입 파라미터를 열어두면, 새 도메인이 추가되어도 기반 컴포넌트는 수정할 필요가 없다.
- **Custom Field 대응의 핵심은 "타입 → 컴포넌트" 매핑**이다.
- **URL 기반 상태 관리는 필터에 특히 적합**하다.

## 참고 자료
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [Composition vs Inheritance - React 공식 문서](https://react.dev/learn/thinking-in-react)
