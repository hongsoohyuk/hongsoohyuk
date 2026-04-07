---
title: "32만줄 레거시 프로젝트 코드 품질 부검"
slug: "legacy_code_quality_autopsy"
description: "실제 32만줄 규모의 React 프로젝트에서 발견한 소프트웨어 원칙 위반 사례를 코드 예시와 함께 정리했다."
categories: ["Frontend", "Software Architecture"]
keywords: ["SOLID", "코드 퀄리티", "안티패턴", "리팩토링", "SRP"]
createdTime: "2026-03-16T07:56:59.045Z"
lastEditedTime: "2026-03-29T04:57:03.682Z"
---

## 개요
32만줄 규모의 레거시 React 프로젝트를 분석하면서 발견한 소프트웨어 원칙 위반 사례를 정리했다. "그냥 코드가 더럽다"가 아니라, 어떤 원칙을 어떻게 위반하고 있는지 정량적 지표와 코드 예시로 증명하는 것이 목적이다.
## 배경
대상 프로젝트의 정량적 프로필:
- **전체 규모**: 835개 파일, 317,971줄
- **500줄 초과 파일**: 197개 (23.6%)
- **1,000줄 초과 파일**: 79개 (9.5%)
- **2,000줄 초과 파일**: 19개
- **5,000줄 초과 파일**: 2개
- **테스트 커버리지**: 0% (실질 테스트 없음)
- **ErrorBoundary**: 0개
아래 모든 코드 예시는 실제 코드의 구조적 패턴만 추출한 것으로, 비즈니스 로직은 제거되었다.
## 1. 단일 책임 원칙 (SRP) 위반
### 1-1. God Component — 1파일 14컴포넌트, 5,236줄
Dialog 기능을 담당하는 한 파일이 14개의 컴포넌트를 포함하고 있었다. 그 중 가장 큰 컴포넌트 하나만 1,805줄이었다.
```javascript
// dialog.jsx — 5,236줄, 14개 컴포넌트
export const AddItemDialog = ({ open, onClose, initialValues }) => {
  // useState 13개
  const [isLoading, setIsLoading] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);
  const [actionErrors, setActionErrors] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: window?.innerWidth });
  const [downloadFiles, setDownloadFiles] = useState([]);
  const [detailsDownloadFiles, setDetailsDownloadFiles] = useState([]);
  const [cloneData, setCloneData] = useState(null);
  const [cloneItem, setCloneItem] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);
  const [addedItems, setAddedItems] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // useEffect 4개
  useEffect(() => { /* 데이터 동기화 */ }, [open, initialValues]);
  useEffect(() => { /* 리사이즈 리스너 */ }, [open]);
  useEffect(() => { /* 클린업 */ }, []);
  useEffect(() => { /* 디바운스 */ }, [open]);

  // API 호출 7개
  const submitMutation = useSubmitMutation();
  const fileUploadMutation = useFileUploadMutation();
  const { data: details } = useGetDetailsQuery(id);
  const { data: listData } = useInfiniteGetListQuery(q);
  const { data: targetDetails } = useGetTargetDetailsQuery(targetId);
  const { data: downloadData } = useGetDownloadFiles(id);
  const { data: items } = useGetItems(id);

  // 이벤트 핸들러 17개
  const handleCloseDialog = useCallback(() => { /* ... */ }, []);
  const handleSearch = useCallback(() => { /* ... */ }, []);
  const handleSelectTarget = useCallback(() => { /* ... */ }, []);
  const handleSetFile = useCallback(() => { /* ... */ }, []);
  const handleSubmit = useCallback(() => { /* ... */ }, []);
  const handleResize = useCallback(() => { /* ... */ }, []);
  // ... +11개 더

  // 여기까지 1,200줄 + 인라인 스타일 136개
  return (
    <Dialog fullScreen open={open}>
      <Box style={{ paddingTop: 40, paddingLeft: 40, paddingRight: 40 }}>
        <Grid style={{ width: '60%', backgroundColor: theme?.palette?.primary[100] }}>
          {/* ... 1,200줄의 중첩된 JSX ... */}
        </Grid>
      </Box>
    </Dialog>
  );
};
// 여기까지 하나의 컴포넌트 (1,805줄)

export const CsvUploadDialog = () => { /* 821줄 */ };
export const AutomationDialog = () => { /* 312줄 */ };
export const ConnectDialog = () => { /* 411줄 */ };
export const DeleteDialog = () => { /* 89줄 */ };
// ... 총 14개
```
**위반**: 한 파일이 UI 렌더링 + 폼 상태 관리 + API 호출 + 비즈니스 로직 + 스타일링 + 에러 처리 + 윈도우 리사이즈를 전부 담당.
### 1-2. God Utility — 109개 export, 16개 도메인이 뒤섞인 유틸 파일
1,688줄의 유틸리티 파일이 날짜, 문자열, 색상, 트리 탐색, 세션 스토리지, CSV 파싱, JSX 렌더링, 라우팅, 검증까지 한번에 담당.
```javascript
// helper.js — 1,688줄, 109개 export
// === 날짜 포맷팅 ===
export const formatDate = (date) => moment(date).format('YYYY.MM.DD');
export const formatDateTime = (date) => moment(date).format('YYYY.MM.DD HH:mm:ss');
// === JSX 등장 (React 의존성) ===
export const CurrencySymbol = (value) => (
  <span style={{ fontSize: 11 }}>{value}</span>
);
// === 세션 스토리지 (브라우저 API) ===
export const setSessionStorage = ({ name, value }) =>
  sessionStorage.setItem(name, JSON.stringify(value));
// === 이름 오타 + 단위 오류 ===
export const hoursToSecounds = (hours) => hours * 60 * 60 * 1000;
// "Secounds" 오타, 실제론 밀리초 반환
```
## 2. DRY 원칙 위반
### 2-1. handleSearch — 100+개 파일에서 복붙
동일한 로직의 두 가지 변형이 100개 이상의 파일에 복붙되어 있었다.
```javascript
// Variant A — 36개 파일에서 발견
const handleSearch = useCallback((e) => {
  const { key, target: { value } } = e;
  if (fp.isEqual('Enter', key)) { setQ(value); setPage(0); }
}, []);
// Variant B — 29개 파일에서 발견
const handleSearch = useCallback((e) => {
  if (e.key !== 'Enter') return false;
  const value = fp.get('target.value', e);
  setResultKeyword(value);
}, []);
```
### 2-2. handleInvalidateQueries — 59개 파일에서 복붙
```javascript
// 59개 파일에서 거의 동일한 코드
const handleInvalidateQueries = useCallback(() => {
  queryClient.invalidateQueries(QUERY_KEY_1);
  queryClient.invalidateQueries(QUERY_KEY_2);
}, [queryClient]);
```
## 3. 계층 구조 (Layer Architecture) 위반
### 3-1. Component 계층이 Feature 계층을 import (역방향 의존성)
```javascript
// src/components/layout/default.jsx
import { LnbDrawer } from '@features/lnb';
import { DetailDrawer } from '@features/drawer';
```
### 3-2. Presentation 계층에서 Redux dispatch
```javascript
// src/components/catalog/add/authentication.jsx
import { useDispatch } from 'react-redux';
import { getAppsMetaData } from '@reducers/app';
```
## 4. 상태 관리 아키텍처 부재

### 4-1. 3개의 상태 관리 라이브러리 동시 사용
36개 파일에서 Redux와 Recoil이 같은 컴포넌트 안에서 동시에 사용되고 있었다.
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { useRecoilValue, useRecoilState } from 'recoil';

const ItemList = () => {
  const dispatch = useDispatch();
  const reduxState = useSelector(stateSelector);
  const hostnames = useRecoilValue(stateEnvHostnames);
  const [selected, setSelected] = useRecoilState(sessionSelectedItems);
  const { data } = useGetListQuery(params);  // React Query
  const [q, setQ] = useState('');            // 로컬 state까지 4중

  const handleSubmit = () => {
    dispatch(updateAction(payload));           // Redux
    setSelected([]);                           // Recoil
    queryClient.invalidateQueries(KEY);       // React Query
    setPage(0);                                // 로컬 state
  };
};
```

### 4-2. Prop Drilling — 33개 props를 받는 컴포넌트
```javascript
const AllAssignedUsers = ({
  useGetQuery, useGetDetailsQuery, useGetQueryKey,
  useGetDetailQueryKey, filterQueryParams, totalElements,
  q, page, setPage, workspaceId, appId, appDetails,
  integrationStatus, integrationApiResourceTypes,
  integrationActions, userIds, includeInternalizedUser,
  setOpenAssignDialogActive, setOpenUnAssignDialogActive,
  setAssignUserData, setUnAssignData, setCheckUsers,
  checkUsers, setCheckableUserData, assignUserDetails,
  setAssignUserDetails, setIndividualSelectItem,
  assignedUserIds, setAssignedUserIds, isSubTypeAll,
  isIntegratedApiProtocolWeb, isLastActiveDataMissingApp,
}) => {
  // 33개 prop + 내부 useState 19개 = 52개의 상태
  // JSX 최대 중첩: 26단계
};
```

## 5. 비기능적 품질 위반

### 5-1. 에러 처리 부재
```javascript
// 전체 앱에 ErrorBoundary가 0개
// 렌더링 에러 발생 시 → 앱 전체 화이트 스크린 크래시
// console.error 404개가 "에러 처리"의 전부
```

### 5-2. 테스트 커버리지 0%
```javascript
// 835개 파일 중 실제 테스트는 CRA 자동생성 보일러플레이트 1개
test('renders learn react link', () => {
  render(<App />);
  expect(screen.getByText(/learn react/i)).toBeInTheDocument();
});
// 실제 앱과 무관한 테스트.
```

### 5-3. 타입 안전성 부재
```javascript
// TypeScript 없음. PropTypes는 있지만:
Dialog.propTypes = {
  data: PropTypes.object,     // 546곳 — 어떤 shape인지 알 수 없음
  config: PropTypes.object,
  options: PropTypes.any,     // 47곳 — 완전 무타입
};
```

### 5-4. 죽은 코드
```javascript
// 버전 관리를 git이 아닌 파일명으로 하는 패턴
index.jsx      // 2,114줄 (현재)
index_bk.jsx   // 1,825줄 (백업) ← 이게 왜 repo에?
// 총 4,896줄의 죽은 코드

// 프로덕션 코드에 console.log 71개 + console.error 404개
// 디렉토리명 오타: app-instancess (s가 두 개) → 23개 파일에 영향
```

## 6. 인라인 스타일 남용
styled-components를 사용하는 프로젝트에서 4,569곳에 인라인 스타일이 존재했다.
```javascript
<Box style={{ paddingTop: 4, paddingBottom: 4 }}>
  <Grid style={{ left: 345, right: 72, width: 'auto' }}>
    <Typography style={{ marginTop: 1, fontSize: 18, color: theme.palette.common.white }}>
      <IconButton style={{ minWidth: '32px', padding: 0, height: '32px', borderRadius: '50%' }}>
        <Box style={{ width: 20, height: 20, flexWrap: 'nowrap', marginRight: 8 }}>
          {/* 하나의 dialog 파일에만 136개의 inline style */}
        </Box>
      </IconButton>
    </Typography>
  </Grid>
</Box>
```

## 배운 점
- **정량 지표가 먼저다.** "코드가 더럽다"는 주관적이지만, "196개 파일이 500줄 초과", "handleSearch가 100곳에서 복붙" 같은 수치는 반박할 수 없다.
- **레거시 프로젝트의 문제는 대부분 "한 번만 더"의 축적이다.** helper.js에 함수 하나 더 추가, dialog.jsx에 컴포넌트 하나 더 추가 — 이것이 반복되면 5,236줄이 된다.
- **구조적 원칙 위반은 번들러 성능에도 직결된다.** 109개 export의 유틸리티 파일은 하나만 수정해도 이를 import하는 모든 모듈이 리빌드 대상이 된다. 코드 품질과 DX는 별개의 문제가 아니라 동전의 양면이다.

## 요약

| 원칙 | 위반 사례 | 규모 |
| --- | --- | --- |
| **SRP (단일 책임)** | 1파일 14컴포넌트, useState 29개, 핸들러 52개 | 5,236줄 |
| **DRY (반복 금지)** | handleSearch 100+곳 복붙, 디렉토리 통째로 복사 | ~4,142줄 중복 |
| **계층 구조** | components → features 역방향 의존 11곳 | 아키텍처 붕괴 |
| **God Object** | helper.js 109개 export, 16개 도메인 | 1,688줄 |
| **상태 관리** | Redux + Recoil + React Query 3중 사용 | 36개 파일 |
| **Prop Drilling** | 33개 props를 받는 컴포넌트 | JSX 26단계 중첩 |
| **에러 처리** | ErrorBoundary 0개 | 앱 전체 |
| **테스트** | 835파일 중 실제 테스트 0개 | 0% 커버리지 |
| **타입 안전성** | PropTypes.object 546곳, PropTypes.any 47곳 | TypeScript 없음 |
| **죽은 코드** | _bk 파일 4,896줄 + console.log 476개 | 프로덕션 포함 |
