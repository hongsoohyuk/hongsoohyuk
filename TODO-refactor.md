# Feature 리팩터링 TODO

Vercel Composition Patterns 기반 코드 리뷰 결과. 우선순위 순 정렬.

---

## 1. ai-chat — ChatPage 상태/로직 분리

- **파일**: `src/features/ai-chat/components/chat-page.tsx`
- **심각도**: HIGH
- **패턴**: `state-context-interface`, `state-lift-state`

### 현재 문제

ChatPage 컴포넌트가 3가지 역할을 동시에 수행:
1. 상태 관리 (messages, model, input, error — 4개 state)
2. 제출 로직 (sendWithModel, handleSubmit, handleSuggestionClick — 3개 함수)
3. 레이아웃 렌더링 (빈 상태 vs 메시지 목록 조건부 렌더링)

ChatInput에 6개 props를 drilling:
```tsx
<ChatInput
  input={input}
  isLoading={isLoading}
  model={model}
  onInputChange={setInput}
  onModelChange={setModel}
  onSubmit={handleSubmit}
/>
```

### 왜 문제인가

- 어떤 하나의 상태가 바뀌면 ChatPage 전체가 리렌더링됨
- ChatInput은 model만 바뀌어도 input/isLoading까지 전부 새로 받음
- 새 기능 추가 시 (예: 첨부파일, 채팅 세션 저장) ChatPage가 더 비대해짐
- 테스트 시 ChatInput 단독 테스트 불가 (부모 의존)

### 개선 방향

```
ChatProvider (zustand store)
├── state: { messages, model, input, isLoading, error }
├── actions: { sendMessage, setModel, setInput }
│
├── <ChatMessages />  ← useStore(s => s.messages) 만 구독
├── <ChatInput />     ← useStore(s => ({ input, model, isLoading })) 만 구독
└── <ChatSuggestions /> ← useStore(s => s.sendMessage) 만 구독
```

command-line feature에서 적용한 zustand 패턴과 동일하게 구현.

### 체크리스트

- [ ] `src/features/ai-chat/stores/chat-store.ts` 생성
- [ ] `src/features/ai-chat/stores/chat-provider.tsx` 생성 (Context + Provider + useStore hook)
- [ ] `ChatPage` → 레이아웃 컨테이너로 축소
- [ ] `ChatInput` → store에서 selector로 읽기 (props 제거)
- [ ] `ChatMessages` → store에서 messages만 구독
- [ ] `ChatSuggestions` → store에서 sendMessage만 구독

---

## 2. ai-chat — 수동 Dropdown → Radix DropdownMenu

- **파일**: `src/features/ai-chat/components/chat-input.tsx` (lines 38-50)
- **심각도**: MEDIUM
- **패턴**: 기존 UI 라이브러리 활용

### 현재 문제

```tsx
const dropdownRef = useRef<HTMLDivElement>(null);
const [open, setOpen] = useState(false);

useEffect(() => {
  if (!open) return;
  const handleClick = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown', handleClick);
}, [open]);
```

useRef + useEffect + document.addEventListener로 click-outside를 수동 감지하는 dropdown 구현.

### 왜 문제인가

- 키보드 접근성 미지원 (Esc 닫기, Arrow 탐색, Enter 선택 없음)
- 포커스 트랩 없음 (Tab으로 dropdown 밖으로 이탈 가능)
- 스크린리더 미지원 (aria-expanded, aria-haspopup 등 없음)
- Radix UI가 이미 프로젝트에 설치되어 있는데 안 쓰고 있음
- 같은 로직을 직접 구현하면 버그 발생 확률 높음

### 개선 방향

```tsx
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">{currentModel.label}</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {MODEL_OPTIONS.map((option) => (
      <DropdownMenuItem key={option.id} onSelect={() => onModelChange(option.id)}>
        {option.label} — {option.description}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

### 체크리스트

- [ ] 수동 dropdown (useRef, useEffect, click-outside) 코드 제거
- [ ] Radix `DropdownMenu` 컴포넌트로 교체
- [ ] MODEL_OPTIONS를 `src/features/ai-chat/config/` 또는 상수 파일로 이동

---

## 3. project (notion-blocks) — 모놀리식 switch문 분리

- **파일**: `src/components/notion/notion-blocks.tsx` (lines 32-266)
- **심각도**: HIGH
- **패턴**: `architecture-compound-components`

### 현재 문제

```tsx
function NotionBlock({block, allBlocks}: {...}) {
  switch (block.type) {
    case 'heading_1': return ...;    // line 41
    case 'heading_2': return ...;    // line 50
    case 'heading_3': return ...;    // line 59
    case 'paragraph': return ...;    // line 68
    case 'code': return ...;         // line 86
    case 'image': return ...;        // line 113
    case 'video': return ...;        // line 150
    case 'bookmark': return ...;     // line 187
    case 'callout': return ...;      // line 98
    case 'quote': return ...;        // line 77
    // ... 30+ cases total
  }
}
```

300줄짜리 단일 함수에 30개 이상의 case가 들어있음.

caption 추출 로직이 4곳에서 중복:
```tsx
// line 118: image
const caption = (image?.caption ?? []).map((t: any) => t?.plain_text ?? '').join('');
// line 159: video
const caption = (video?.caption ?? []).map((t: any) => t?.plain_text ?? '').join('');
// line 190: bookmark
const caption = (block.bookmark?.caption ?? []).map((t: any) => t?.plain_text ?? '').join('');
// line 203: embed
const caption = (block.embed?.caption ?? []).map((t: any) => t?.plain_text ?? '').join('');
```

### 왜 문제인가

- 새 블록 타입 추가 시 300줄 파일 전체를 수정해야 함
- 하나의 case 수정이 다른 case에 영향을 줄 위험
- 동일 패턴(caption, BlockChildren, 스타일 래핑)이 반복되지만 공유 안 됨
- 코드 리뷰 시 관련 없는 case까지 봐야 함

### 개선 방향

```tsx
// 블록 타입별 렌더러 맵
const BLOCK_RENDERERS: Record<string, React.ComponentType<BlockProps>> = {
  heading_1: HeadingBlock,
  heading_2: HeadingBlock,
  heading_3: HeadingBlock,
  paragraph: ParagraphBlock,
  code: CodeBlock,
  image: ImageBlock,
  // ...
};

// 공통 유틸
function extractCaption(block: NotionBlockWithChildren): string { ... }

// 메인 컴포넌트
function NotionBlock({block, allBlocks}: BlockProps) {
  const Renderer = BLOCK_RENDERERS[block.type];
  if (!Renderer) return null;
  return <Renderer block={block} allBlocks={allBlocks} />;
}
```

### 체크리스트

- [ ] `src/components/notion/blocks/` 디렉토리 생성
- [ ] 블록 타입별 컴포넌트 파일 분리 (heading.tsx, code.tsx, image.tsx 등)
- [ ] `extractCaption()`, `extractPlainText()` 공통 유틸 추출
- [ ] `BlockWrapper` 공통 래퍼 컴포넌트 추출 (space-y-2 + BlockChildren 패턴)
- [ ] `BLOCK_RENDERERS` 맵 기반 렌더링으로 전환
- [ ] 리스트 그룹핑 로직 (lines 276-320) 별도 함수로 추출

---

## 4. project (notion-blocks) — `any` 타입 제거

- **파일**: `src/components/notion/notion-blocks.tsx` (lines 88, 118, 159, 190, 203, 224), `src/types/notion.ts` (line 7)
- **심각도**: HIGH
- **패턴**: 타입 안전성

### 현재 문제

```tsx
// notion-blocks.tsx — 6곳에서 반복
(block.code?.rich_text ?? []).map((t: any) => t?.plain_text ?? '').join('')

// notion.ts
export type NotionBlockWithChildren = BlockObjectResponse & {
  children?: NotionBlockWithChildren[];
  [key: string]: any;  // ← 모든 타입 체크를 무력화
};
```

### 왜 문제인가

- `[key: string]: any` 인덱스 시그니처가 Notion 블록의 모든 프로퍼티 접근을 `any`로 만듦
- 오타나 잘못된 프로퍼티 접근을 컴파일 타임에 잡을 수 없음
- rich_text 매핑에서 `(t: any)` 캐스팅이 6번 반복 — 하나라도 API 스키마가 바뀌면 런타임 에러

### 개선 방향

```tsx
// types/notion.ts — 인덱스 시그니처 제거
export type NotionBlockWithChildren = BlockObjectResponse & {
  children?: NotionBlockWithChildren[];
};

// utils/notion-text.ts — 타입 안전한 유틸
import type {RichTextItemResponse} from '@notionhq/client/build/src/api-endpoints';

export function richTextToPlain(richText: RichTextItemResponse[]): string {
  return richText.map((t) => t.plain_text).join('');
}
```

### 체크리스트

- [ ] `src/types/notion.ts`에서 `[key: string]: any` 제거
- [ ] `richTextToPlain()` 유틸 함수 생성
- [ ] `extractCaption()` 유틸 함수 생성
- [ ] notion-blocks.tsx 내 6곳의 `(t: any)` 패턴을 유틸 함수로 교체
- [ ] 타입 에러가 발생하는 곳을 명시적 타입으로 수정

---

## 5. blog — 서버/클라이언트 이중 필터링 제거

- **파일**: `src/features/blog/components/BlogContent.tsx` (lines 14-24), `app/[locale]/(content)/blog/(list)/page.tsx`
- **심각도**: HIGH
- **패턴**: 서버/클라이언트 경계 정리

### 현재 문제

```tsx
// page.tsx (서버) — Notion API에서 필터링된 데이터 fetch
const data = await getBlogList({q: searchParams.q, category: searchParams.category});

// BlogContent.tsx (클라이언트) — 같은 데이터를 다시 필터링
const searchParams = useSearchParams();
const q = searchParams?.get('q') ?? '';
if (q) {
  filtered = filtered.filter((p) => p.title.toLowerCase().includes(lower));
}
```

서버에서 이미 필터링된 `data.items`를 전달받는데, 클라이언트에서 `useSearchParams`로 같은 파라미터를 다시 읽어서 또 필터링.

### 왜 문제인가

- 동일 로직 2번 실행 — 불필요한 클라이언트 연산
- 서버 필터링 결과와 클라이언트 필터링 결과가 다를 수 있음 (Notion API contains vs JS includes)
- `BlogSearchFilter`에서 URL 변경 시 `BlogContent`가 Suspense boundary 안에서 리렌더링되지 않을 수 있음 (서버 컴포넌트 갱신 필요)
- 디버깅 시 어느 쪽 필터가 적용되는지 혼란

### 개선 방향

클라이언트 필터링 제거. 서버에서 필터링 완료된 결과만 렌더링.

```tsx
// BlogContent.tsx — 단순 렌더링만
export function BlogContent({posts}: {posts: BlogListItem[]}) {
  if (posts.length === 0) return <p>{/* empty state */}</p>;
  return posts.map((post) => <BlogPostCard key={post.id} post={post} />);
}
```

### 체크리스트

- [ ] `BlogContent`에서 `useSearchParams`, 필터링 로직 제거
- [ ] `emptyText` prop 제거 또는 빈 상태 UI 구현
- [ ] 서버 컴포넌트에서 필터링 완료 후 결과만 전달하도록 확인
- [ ] `BlogSearchFilter` URL 변경 시 페이지 리렌더링 동작 검증

---

## 6. blog — API extractor 함수 중복 제거

- **파일**: `src/features/blog/api/get-blog-list.ts`, `src/features/blog/api/get-blog-detail.ts`
- **심각도**: MEDIUM
- **패턴**: 공통 유틸 추출

### 현재 문제

```tsx
// get-blog-list.ts
function extractTitle(page: PageObjectResponse): string { ... }
function extractCategories(page: PageObjectResponse): BlogCategory[] { ... }
function extractKeywords(page: PageObjectResponse): string[] { ... }

// get-blog-detail.ts — 동일 함수 복붙
function extractTitle(page: PageObjectResponse): string { ... }
function extractCategories(page: PageObjectResponse): BlogCategory[] { ... }
function extractKeywords(page: PageObjectResponse): string[] { ... }
```

### 왜 문제인가

- 한 파일의 extractor를 수정하면 다른 파일도 수동으로 동기화해야 함
- 실수로 한쪽만 수정하면 목록과 상세에서 다른 결과가 나올 수 있음

### 개선 방향

```tsx
// src/features/blog/utils/notion-extractors.ts
export function extractTitle(page: PageObjectResponse): string { ... }
export function extractCategories(page: PageObjectResponse): BlogCategory[] { ... }
export function extractKeywords(page: PageObjectResponse): string[] { ... }
```

### 체크리스트

- [ ] `src/features/blog/utils/notion-extractors.ts` 생성
- [ ] 공통 extractor 함수 이동
- [ ] `get-blog-list.ts`, `get-blog-detail.ts`에서 import로 교체
- [ ] project feature에도 동일 패턴 있는지 확인 후 통합 검토

---

## 7. blog — BlogSearchFilter 컴포넌트 책임 분리

- **파일**: `src/features/blog/components/BlogSearchFilter.tsx` (lines 17-105)
- **심각도**: MEDIUM
- **패턴**: SRP (Single Responsibility Principle)

### 현재 문제

하나의 컴포넌트가 5가지 역할 수행:
1. URL 파라미터 읽기/쓰기 (lines 47-70)
2. 스크롤 이벤트 리스닝 — sticky 감지 (lines 30-43)
3. collapse/expand 상태 관리 (lines 27-28)
4. 검색어 debounce (lines 51-57)
5. 카테고리 토글 (lines 59-64)

### 왜 문제인가

- 스크롤 리스너와 URL 관리가 한 컴포넌트에 섞여 있어 재사용 불가
- debounce 타이머 관리가 컴포넌트 내부에 하드코딩
- 테스트 시 DOM 스크롤 + URL + 타이머를 모두 모킹해야 함

### 개선 방향

```tsx
// hooks
function useSearchFilterParams() { ... }  // URL 관리
function useStickyDetection(ref, offset) { ... }  // 스크롤 감지
function useDebouncedValue(value, delay) { ... }  // debounce

// 컴포넌트 — 렌더링만
function BlogSearchFilter() {
  const {q, category, updateQ, updateCategory} = useSearchFilterParams();
  const {isSticky} = useStickyDetection(filterRef, HEADER_HEIGHT);
  // ... 렌더링만 담당
}
```

### 체크리스트

- [ ] `useSearchFilterParams()` 훅 추출
- [ ] `useStickyDetection()` 훅 추출 (또는 공유 hooks로)
- [ ] `useDebouncedValue()` 훅 추출 (공유 hooks)
- [ ] `BlogSearchFilter` → 렌더링 전용으로 축소

---

## 8. guestbook — EmotionBadge 렌더링 중복 제거

- **파일**: `src/features/guestbook/components/GuestbookList.tsx` (lines 34-37), `src/features/guestbook/components/GuestbookDetailDialog.tsx` (lines 29-32)
- **심각도**: MEDIUM
- **패턴**: `patterns-children-over-render-props`

### 현재 문제

```tsx
// GuestbookList.tsx
{item.emotions?.map((emotion) => (
  <Badge key={`${item.id}-${emotion}`} variant="secondary" className="gap-1 shrink-0">
    {getEmoji(emotion)} {getLabel(emotion)}
  </Badge>
))}

// GuestbookDetailDialog.tsx — 거의 동일
{item.emotions?.map((emotion) => (
  <Badge key={`detail-${item.id}-${emotion}`} variant="secondary" className="gap-1 shrink-0">
    {getEmoji(emotion)} {getLabel(emotion)}
  </Badge>
))}
```

### 왜 문제인가

- 배지 스타일이나 이모지 표시 방식을 바꿀 때 두 곳을 수정해야 함
- key prefix만 다르고 나머지 동일 — 복붙의 전형적 징후

### 개선 방향

```tsx
// src/features/guestbook/components/EmotionBadges.tsx
export function EmotionBadges({emotions}: {emotions: EmotionCode[]}) {
  const {getLabel, getEmoji} = useEmotionEnum();
  return emotions.map((emotion) => (
    <Badge key={emotion} variant="secondary" className="gap-1 shrink-0">
      {getEmoji(emotion)} {getLabel(emotion)}
    </Badge>
  ));
}
```

### 체크리스트

- [ ] `EmotionBadges` 컴포넌트 생성
- [ ] `GuestbookList`, `GuestbookDetailDialog`에서 교체

---

## 9. guestbook — FormDialog 책임 분리

- **파일**: `src/features/guestbook/components/GuestbookFormDialog.tsx` (lines 18-160)
- **심각도**: MEDIUM
- **패턴**: SRP

### 현재 문제

하나의 컴포넌트가 6가지 역할 수행:
1. Dialog 열기/닫기 (line 26)
2. 폼 필드 상태 관리 — authorName, message, turnstileToken (lines 29-32)
3. 서버 액션 제출 (line 20)
4. 에러 매핑 및 번역 (lines 42-49)
5. Turnstile 토큰 검증 (lines 35-36)
6. 폼 리셋 (lines 51-60)

### 왜 문제인가

- Turnstile 로직이 폼 컴포넌트에 하드코딩 — 다른 폼에서 재사용 불가
- 에러 매핑 함수 `fieldError()`가 컴포넌트 내부에 정의 — 테스트 불가
- 3개 필드의 리셋 로직이 2개의 useEffect로 분산

### 개선 방향

```tsx
function useTurnstileValidation() { ... }     // Turnstile 상태 + 검증
function useFieldError(state, field) { ... }  // 에러 추출 유틸
```

### 체크리스트

- [ ] `useTurnstileValidation()` 훅 추출
- [ ] `useFieldError()` 훅 추출
- [ ] 폼 리셋 로직 통합 (2개 useEffect → 1개)

---

## 10. instagram — PostMediaViewer 미디어 렌더링 중복 제거

- **파일**: `src/features/instagram/components/PostMediaViewer.tsx` (lines 40-50, 85-114)
- **심각도**: LOW
- **패턴**: 공통 컴포넌트 추출

### 현재 문제

`SingleMediaViewer`와 `CarouselViewer`에서 이미지/비디오 렌더링 로직이 동일:
```tsx
// 두 곳 모두
const thumbnail = post.thumbnail_url || post.media_url;
// 동일한 Image 컴포넌트 props
// 동일한 video 조건부 렌더링
```

### 왜 문제인가

- 미디어 표시 방식 변경 시 (예: lazy loading, placeholder) 두 곳 수정 필요
- thumbnail fallback 로직이 중복

### 개선 방향

```tsx
function MediaDisplay({media, ...props}: {media: InstagramMedia} & ImageProps) {
  if (media.media_type === 'VIDEO') return <video ... />;
  return <Image src={media.media_url} ... />;
}
```

### 체크리스트

- [ ] `MediaDisplay` 컴포넌트 추출
- [ ] `SingleMediaViewer`, `CarouselViewer`에서 교체

---

## 11. blog — 카테고리 배지 렌더링 중복

- **파일**: `src/features/blog/components/BlogPostCard.tsx` (lines 20-26), `app/[locale]/(content)/blog/[slug]/page.tsx` (lines 56-62)
- **심각도**: LOW
- **패턴**: 공통 컴포넌트 추출

### 현재 문제

```tsx
// BlogPostCard.tsx — gap-1, text-[11px]
{post.categories.map((category) => (
  <Badge key={category} variant="secondary" className="text-[11px] px-1.5 py-0">
    {category}
  </Badge>
))}

// blog/[slug]/page.tsx — gap-1.5, 기본 크기
{data.meta.categories.map((category) => (
  <Badge key={category} variant="secondary">
    {category}
  </Badge>
))}
```

### 왜 문제인가

- 같은 데이터(BlogCategory[])를 같은 방식(Badge)으로 렌더링하는데 코드가 분리
- 스타일 차이가 의도적인지 실수인지 불명확

### 개선 방향

```tsx
// src/features/blog/components/CategoryBadges.tsx
export function CategoryBadges({categories, size = 'default'}: {...}) { ... }
```

### 체크리스트

- [ ] `CategoryBadges` 컴포넌트 생성 (size variant 지원)
- [ ] `BlogPostCard`, 블로그 상세 페이지에서 교체

---

## 완료된 항목

- [x] **command-line — useState 13개 → zustand store** (2026-03-17)
  - `stores/terminal-store.ts` — zustand store factory
  - `stores/terminal-provider.tsx` — Context + Provider + useTerminalStore hook
  - discriminated union `TerminalMode` (normal/vim/donut/heredoc/ask)
  - `hooks/use-terminal.ts` 삭제
