---
title: "React 실시간 대시보드에서 Publish-subscribe 패턴으로 렌더링 최적화하기"
slug: "pubsub_rendering_optimization"
description: "Polling 기반 실시간 모니터링 대시보드에서 createNotification 패턴으로 O(1) 수준의 선택적 리렌더링을 구현한 사례 분석"
categories: ["Frontend", "Software Architecture"]
keywords: []
createdTime: "2026-02-23T23:58:04.459Z"
lastEditedTime: "2026-03-31T02:27:35.333Z"
---

React로 실시간 모니터링 대시보드를 Publish-subscribe 패턴 구현 경험을 기록하고 회고한다. REST Polling으로 수집한 대량의 메트릭 데이터를 어떻게 효율적으로 UI에 반영하는지 정리한다.

## 배경
- 다수의 외부 클라우드 서비스 프로바이더로부터 트래픽, 히트율, 성공률 등의 메트릭을 실시간으로 수집하여 테이블과 차트로 보여주는 대시보드 개발이 필요하게 되었다.
- 프로바이더가 N개이고 시간 슬롯이 M개면 테이블에 N×M개의 행이 존재하며, 각 행의 데이터는 독립적으로 API를 호출하여 갱신된다.
- 하나(특정 시간대의 특정 Provider)의 API 응답 이 돌아올 때, 해당 정보만 리렌더링 되도록 세밀한 조정이 필요했다.

## 전체 구조: Polling + Pub/Sub 조합

### 1. 1초 타이머 (tick)
`setInterval`로 매초 실행되는 `tick` 함수가 시간 슬롯을 관리한다.
```javascript
useEffect(() => {
  const timer = setInterval(() => tick(metrics, settings), 1000);
  return () => clearInterval(timer);
}, [settings]);
```
`tick`은 현재 시각 기준으로 프로바이더별 interval(분 단위)에 맞는 시간 슬롯을 생성하거나 제거한다. 새 슬롯이 생기면 빈 메트릭 객체를 배열에 넣고, 이후 API 호출로 채워넣는다.

### 2. 배치 API 루프 (createLoop)
```javascript
const createLoop = (items, run) => {
  let index = 0;
  const loop = async () => {
    const batch = Math.max(Math.floor(items.length / 10), 1);
    while (items.length > 0 && isRunning) {
      const tasks = [];
      for (let i = 0; i < batch; i++) {
        if (index >= items.length) index = 0;
        tasks.push(run(items[index++]));
      }
      tasks.push(new Promise(resolve => setTimeout(resolve, 1000)));
      await Promise.all(tasks);
    }
  };
  return { start, end };
};
```
배열을 순환하면서 1초 간격으로 `length / 10`개씩 API를 호출한다. 전체 아이템을 한 번에 호출하지 않고 배치로 나누어 부하를 분산하는 구조다.

### 3. Pub/Sub (createNotification)
클로저 하나가 전체 최적화를 담당한다.
```javascript
const createNotification = () => {
  const subscribers = [];
  return {
    publish: (data) => subscribers.forEach(sub => sub(data)),
    subscribe: (sub) => subscribers.push(sub),
    unsubscribe: (sub) => {
      const index = subscribers.indexOf(sub);
      if (index >= 0) subscribers.splice(index, 1);
    }
  };
};
```
이 함수로 생성된 notification 인스턴스가 **4가지 독립적인 채널**로 사용된다.

| 인스턴스 | publish 시점 | subscriber | 효과 |
| --- | --- | --- | --- |
| `timeMessenger` | `tick()`에서 매초 | 시각 표시 컴포넌트 | 현재 시각 갱신 |
| `item.notification` | API 응답 후 | 해당 테이블 행 | **그 행만** 리렌더링 |
| `updateNotification` | API 응답 후 | 차트 컴포넌트 | 차트 리렌더링 |
| `setting.notification` | 설정 변경 시 | 해당 테이블 행 | threshold 반영 |

## 핵심: mutable 객체 + notification = 선택적 리렌더링
일반적인 React 패턴이라면 이렇게 할 것이다:
```javascript
// 일반적 방식: API 응답마다 전체 배열을 새로 만들어 setState
const onApiResponse = (id, result) => {
  setMetrics(prev => prev.map(item =>
    item.id === id ? { ...item, ...result } : item
  ));
};
// → 모든 행 + 차트가 리렌더링됨
```
이 코드는 다르게 접근한다:
```javascript
// 이 코드의 방식: 객체를 직접 수정하고, notification으로 알림
const setMetric = async (item) => {
  const result = await fetchMetrics({ id: item.entityId });
  item.traffic = result.traffic;
  item.hitRatio = result.hitRatio;
  item.successRatio = result.successRatio;

  const updatedAt = new Date();
  item.notification.publish(updatedAt);       // 이 행만 리렌더링
  updateNotification.publish(updatedAt);      // 차트도 갱신
};
```
구독하는 컴포넌트에서는 `setState`를 콜백으로 등록한다:
```javascript
// 테이블 행 컴포넌트
const [updatedAt, setUpdatedAt] = useState(null);

useEffect(() => {
  item.notification.subscribe(setUpdatedAt);
  return () => item.notification.unsubscribe(setUpdatedAt);
}, []);

const used = useMemo(() => {
  return (item.traffic * 100) / threshold;
}, [item, updatedAt]);
```

## Pub/Sub 연쇄: notification → 조건 감지 → 자동 액션
notification은 리렌더링뿐 아니라 비즈니스 로직 트리거에도 활용된다.
```javascript
useEffect(() => {
  if (hasExceeded === true) {
    queue.enqueue(action);
  }
}, [hasExceeded, updatedAt]);
```
`notification.publish()` → `setUpdatedAt` → `useMemo` 재계산(`hasExceeded`) → `useEffect` 트리거 → 큐에 액션 등록.

## 회고
이 구현은 영리하지만, React의 규칙을 벗어나는 부분이 있다. mutable 객체를 직접 수정하고 `useEffect`로 수동 subscribe/unsubscribe를 관리하는 것은 버그 유발 가능성이 있고, 코드를 처음 보는 사람이 흐름을 파악하기 어렵다.

### useSyncExternalStore로 대체
React 18에서 도입된 `useSyncExternalStore`는 사실상 `createNotification`이 하는 일을 공식 API로 제공한다.
```javascript
const updatedAt = useSyncExternalStore(
  (callback) => {
    item.notification.subscribe(callback);
    return () => item.notification.unsubscribe(callback);
  },
  () => item.lastUpdatedAt
);
```

### React Query refetchInterval로 구조 단순화
```javascript
const MetricRow = ({ entityId, startDate }) => {
  const { data } = useQuery({
    queryKey: ['metrics', entityId, startDate.toISOString()],
    queryFn: () => fetchMetrics({ id: entityId, date: startDate }),
    refetchInterval: 10_000,
  });
  return <TableRow>...</TableRow>;
};
```

### Composition Pattern으로 리렌더링 경계 분리
```javascript
// Composition: 각 행이 자신의 데이터를 소유
const Dashboard = () => {
  const slots = useTimeSlots(settings);
  return slots.map(slot => <MetricRow key={slot.id} slot={slot} />);
};

const MetricRow = ({ slot }) => {
  const { data } = useQuery({ ... });
  return <TableRow>...</TableRow>;
};
```

## 참고 자료
- [React 공식 문서 - useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [TanStack Query - Render Optimizations](https://tanstack.com/query/v5/docs/framework/react/guides/render-optimizations)
- [SWR - Automatic Revalidation](https://swr.vercel.app/docs/revalidation)
- [React re-renders guide: everything, all at once](https://www.developerway.com/posts/react-re-renders-guide)
