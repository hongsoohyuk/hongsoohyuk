# ⚛️ React 19 학습 노트

## React 19의 새로운 기능들

### 1. **React Compiler (실험적)**
- 자동으로 컴포넌트를 최적화
- 수동 메모이제이션 감소
- 빌드 시점 최적화

### 2. **Server Components**
- 서버에서 실행되는 컴포넌트
- 클라이언트 번들 크기 감소
- 직접 데이터베이스 접근 가능

### 3. **Actions**
- 서버 함수를 클라이언트에서 호출
- 폼 제출 간소화
- 프로그래매틱 데이터 업데이트

## 핵심 개념

### 컴포넌트 패턴

#### 1. **Server Component (기본)**
```tsx
// 서버에서 실행, 클라이언트 번들 제외
export default async function ServerComponent() {
  const data = await fetchData(); // 직접 API 호출

  return (
    <div>
      <h1>{data.title}</h1>
      <ClientComponent data={data} />
    </div>
  );
}
```

#### 2. **Client Component**
```tsx
'use client';

import { useState } from 'react';

export default function ClientComponent({ data }) {
  const [state, setState] = useState('');

  return (
    <div>
      <input
        value={state}
        onChange={(e) => setState(e.target.value)}
      />
      <button onClick={() => console.log(state)}>
        Submit
      </button>
    </div>
  );
}
```

### React Hooks 심화

#### 1. **useState**
```tsx
const [state, setState] = useState(initialValue);

// 객체 상태 관리
const [user, setUser] = useState({
  name: '',
  email: '',
});

// 상태 업데이트 함수
const updateUser = (updates) => {
  setUser(prev => ({ ...prev, ...updates }));
};
```

#### 2. **useEffect**
```tsx
// 마운트 시 실행
useEffect(() => {
  console.log('Component mounted');
}, []);

// 의존성 배열이 변경될 때 실행
useEffect(() => {
  fetchData(dependency);
}, [dependency]);

// 클린업 함수
useEffect(() => {
  const subscription = subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

#### 3. **useCallback**
```tsx
// 함수 메모이제이션
const memoizedCallback = useCallback(() => {
  doSomething(dependency);
}, [dependency]);

// 이벤트 핸들러 최적화
const handleClick = useCallback((event) => {
  console.log('Button clicked', event);
}, []);
```

#### 4. **useMemo**
```tsx
// 값 메모이제이션
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(dependency);
}, [dependency]);

// 계산 비용이 큰 연산 최적화
const filteredList = useMemo(() => {
  return list.filter(item => item.active);
}, [list]);
```

#### 5. **커스텀 훅**
```tsx
// 데이터 fetching 훅
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// 사용법
const { data, loading, error } = useFetch('/api/posts');
```

### 상태 관리 패턴

#### 1. **Local State (useState)**
```tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

#### 2. **Context API**
```tsx
// Context 생성
const ThemeContext = createContext();

// Provider 컴포넌트
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer 컴포넌트
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className={theme}
    >
      Toggle Theme
    </button>
  );
}
```

#### 3. **Reducer 패턴**
```tsx
// 액션 타입
const ACTIONS = {
  INCREMENT: 'increment',
  DECREMENT: 'decrement',
  RESET: 'reset',
};

// 리듀서 함수
function counterReducer(state, action) {
  switch (action.type) {
    case ACTIONS.INCREMENT:
      return { count: state.count + 1 };
    case ACTIONS.DECREMENT:
      return { count: state.count - 1 };
    case ACTIONS.RESET:
      return { count: 0 };
    default:
      return state;
  }
}

// 사용법
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: ACTIONS.INCREMENT })}>
        +
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DECREMENT })}>
        -
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.RESET })}>
        Reset
      </button>
    </div>
  );
}
```

### 성능 최적화

#### 1. **React.memo**
```tsx
// 불필요한 리렌더링 방지
const MemoizedComponent = React.memo(function MyComponent({ data }) {
  return <div>{data.value}</div>;
});

// 커스텀 비교 함수
const CustomMemoComponent = React.memo(
  function MyComponent({ data }) {
    return <div>{data.value}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

#### 2. **React.lazy + Suspense**
```tsx
// 코드 스플리팅
const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

#### 3. **Error Boundaries**
```tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### 폼 처리 패턴

#### 1. **제어 컴포넌트 (Controlled Components)**
```tsx
function ControlledForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="이름"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="이메일"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="메시지"
      />
      <button type="submit">제출</button>
    </form>
  );
}
```

#### 2. **비제어 컴포넌트 (Uncontrolled Components)**
```tsx
function UncontrolledForm() {
  const nameRef = useRef();
  const emailRef = useRef();
  const messageRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      message: messageRef.current.value,
    };
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} placeholder="이름" />
      <input ref={emailRef} type="email" placeholder="이메일" />
      <textarea ref={messageRef} placeholder="메시지" />
      <button type="submit">제출</button>
    </form>
  );
}
```

### TypeScript와 함께하는 React

#### 1. **컴포넌트 Props 타입**
```tsx
interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  onEdit?: (userId: number) => void;
  isLoading?: boolean;
}

function UserCard({ user, onEdit, isLoading }: UserCardProps) {
  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={() => onEdit(user.id)} disabled={isLoading}>
          편집
        </button>
      )}
    </div>
  );
}
```

#### 2. **이벤트 핸들러 타입**
```tsx
function Form() {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input onChange={handleInputChange} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

#### 3. **Ref 타입**
```tsx
function FocusableInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleFocus}>Focus Input</button>
    </div>
  );
}
```

### 테스팅 전략

#### 1. **컴포넌트 테스팅**
```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  const buttonElement = screen.getByText(/click me/i);
  expect(buttonElement).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  const buttonElement = screen.getByText(/click me/i);
  fireEvent.click(buttonElement);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### 2. **커스텀 훅 테스팅**
```tsx
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounter());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

### 디버깅 기법

#### 1. **React DevTools**
- 컴포넌트 트리 시각화
- Props 및 State 검사
- 성능 프로파일링

#### 2. **useDebugValue**
```tsx
function useCustomHook(value) {
  const result = computeExpensiveValue(value);

  useDebugValue(result, value => `Computed: ${value}`);

  return result;
}
```

#### 3. **Error Boundaries 활용**
```tsx
// 개발 환경에서만 에러를 표시
class DevErrorBoundary extends React.Component {
  render() {
    if (process.env.NODE_ENV === 'development') {
      return <ErrorFallback error={this.state.error} />;
    }

    return <GenericErrorPage />;
  }
}
```

### 학습 리소스

- [React 공식 문서](https://react.dev)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [TypeScript + React 가이드](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library 문서](https://testing-library.com/docs/react-testing-library/intro/)
