# Instagram Components

재사용 가능한 Instagram UI 컴포넌트 모음입니다.

## 컴포넌트 목록

### ProfileCard

Instagram 프로필 정보를 표시하는 카드 컴포넌트입니다.

**Props:**

- `profilePictureUrl`: 프로필 이미지 URL
- `username`: 사용자 이름
- `biography?`: 소개글 (선택)
- `mediaCount?`: 게시물 수 (선택)
- `followersCount?`: 팔로워 수 (선택)
- `followsCount?`: 팔로잉 수 (선택)

**사용 예시:**

```tsx
<ProfileCard
  profilePictureUrl="/profile.jpg"
  username="johndoe"
  biography="Hello world!"
  mediaCount={42}
  followersCount={1000}
  followsCount={500}
/>
```

---

### ProfileStats

팔로워, 팔로잉, 게시물 수 통계를 표시하는 컴포넌트입니다.

**Props:**

- `postsCount?`: 게시물 수
- `followersCount?`: 팔로워 수
- `followingCount?`: 팔로잉 수

---

### PostItem

개별 Instagram 게시물을 표시하는 컴포넌트입니다.

**Props:**

- `post`: Instagram 미디어 객체
- `aspectRatioClass?`: 이미지 비율 클래스 (기본: 'aspect-[4/5]')

**특징:**

- 호버 시 좋아요/댓글 수 표시
- 비디오는 썸네일 표시
- 이미지 lazy loading 지원
- memo로 최적화

---

### PostOverlay

게시물 위에 표시되는 오버레이 (좋아요, 댓글 수)

**Props:**

- `likeCount?`: 좋아요 수
- `commentsCount?`: 댓글 수

---

### PostGrid

게시물을 그리드 레이아웃으로 표시하는 컨테이너 컴포넌트입니다.

**Props:**

- `children`: 자식 요소
- `columns?`: 컬럼 수 (2 | 3 | 4, 기본: 3)

---

### LoadingSkeleton

로딩 상태를 표시하는 스켈레톤 컴포넌트입니다.

**Props:**

- `count?`: 스켈레톤 개수 (기본: 3)
- `aspectRatioClass?`: 이미지 비율 클래스

---

### EmptyState

게시물이 없을 때 표시하는 빈 상태 컴포넌트입니다.

**Props:**

- `icon?`: 아이콘 이모지 (기본: '📷')
- `title?`: 제목 (기본: '게시물이 없습니다')
- `description?`: 설명 텍스트 (선택)

---

### EndOfFeed

피드의 끝에 도달했을 때 표시하는 컴포넌트입니다.

**Props:**

- `message?`: 표시할 메시지 (기본: '모든 게시물을 불러왔습니다')

---

### InfiniteFeedSentinel

무한 스크롤을 위한 Intersection Observer 센티널 컴포넌트입니다.

**Props:**

- `onLoadMore`: 더 불러오기 콜백 함수
- `hasMore`: 더 불러올 항목이 있는지 여부
- `isLoading`: 로딩 중인지 여부

---

## 사용 패턴

### 기본 사용

```tsx
import {ProfileCard, PostGrid, PostItem, EmptyState} from '@/app/instagram/_components';

function MyComponent() {
  return (
    <>
      <ProfileCard {...profileData} />

      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <PostGrid columns={3}>
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </PostGrid>
      )}
    </>
  );
}
```

### 무한 스크롤

```tsx
import {PostGrid, PostItem, LoadingSkeleton, InfiniteFeedSentinel, EndOfFeed} from '@/app/instagram/_components';

function InfiniteFeed() {
  const {items, isLoading, hasMore, loadMore} = useInstagramFeed();

  return (
    <>
      <PostGrid>
        {items.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
        {isLoading && <LoadingSkeleton count={3} />}
      </PostGrid>

      <InfiniteFeedSentinel onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />

      {!hasMore && <EndOfFeed />}
    </>
  );
}
```

---

## 디자인 원칙

### 단일 책임 원칙 (SRP)

각 컴포넌트는 하나의 명확한 역할만 수행합니다:

- `ProfileCard`: 프로필 정보 표시
- `PostItem`: 개별 게시물 렌더링
- `PostGrid`: 레이아웃 관리
- `LoadingSkeleton`: 로딩 상태 표시

### 재사용성

모든 컴포넌트는 props를 통해 커스터마이즈 가능하며, 다른 프로젝트에서도 쉽게 재사용할 수 있습니다.

### 접근성

- 적절한 ARIA 속성 사용
- 키보드 네비게이션 지원
- 스크린 리더 호환

### 성능 최적화

- `PostItem`: React.memo로 불필요한 리렌더링 방지
- 이미지: lazy loading 적용
- IntersectionObserver: 무한 스크롤 최적화
