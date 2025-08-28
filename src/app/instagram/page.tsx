import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/shared/ui";

export default function InstagramPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">📸 인스타그램</h1>
          <p className="text-xl text-muted-foreground">
            일상 속 소소한 순간들과 개발 관련 사진들을 공유합니다
          </p>
        </div>

        {/* 프로필 정보 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              프로필 정보
              <Badge variant="outline">Instagram API 연동 예정</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                홍
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">@hongsoohyuk</h3>
                <p className="text-muted-foreground">
                  프론트엔드 개발자 지망생 | Next.js & React 학습 중
                </p>
                <div className="flex gap-4 text-sm">
                  <span><strong>0</strong> 게시물</span>
                  <span><strong>0</strong> 팔로워</span>
                  <span><strong>0</strong> 팔로잉</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 게시물 그리드 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">최근 게시물</h2>
            <Button variant="outline" asChild>
              <a
                href="https://instagram.com/hongsoohyuk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                📱 Instagram에서 보기
              </a>
            </Button>
          </div>

          {/* 빈 상태 */}
          <Card>
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-semibold mb-2">게시물이 준비 중입니다</h3>
              <p className="text-muted-foreground mb-6">
                Instagram API와의 연동을 통해 게시물들을 불러올 예정입니다
              </p>
              <Button variant="outline">
                Instagram 방문하기
              </Button>
            </CardContent>
          </Card>

          {/* 게시물 그리드 (추후 구현) */}
          {/*
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                    <Image
                      src={post.imageUrl}
                      alt={post.caption}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.caption}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>{formatDate(post.postedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          */}
        </div>

        {/* 콘텐츠 카테고리 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📂 콘텐츠 카테고리</CardTitle>
            <CardDescription>공유하고 있는 콘텐츠의 종류</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="text-2xl mb-2">💻</div>
                <div className="font-semibold">개발 일상</div>
                <div className="text-sm text-muted-foreground">코딩 과정</div>
              </div>
              <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold">학습 기록</div>
                <div className="text-sm text-muted-foreground">공부 내용</div>
              </div>
              <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="text-2xl mb-2">🌟</div>
                <div className="font-semibold">프로젝트</div>
                <div className="text-sm text-muted-foreground">작업물 소개</div>
              </div>
              <div className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="text-2xl mb-2">☕</div>
                <div className="font-semibold">일상</div>
                <div className="text-sm text-muted-foreground">일상 사진</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 개발 중 안내 */}
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold mb-2">인스타그램 기능 개발 중</h3>
            <p className="text-muted-foreground">
              Instagram API 연동을 통해 게시물과 사진을 불러오는 기능을 구현하고 있습니다.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>✅ Instagram API 정책 및 가이드라인 연구</p>
              <p>✅ 게시물 데이터 구조 설계</p>
              <p>🔄 API 연동 구현 (진행 중)</p>
              <p>⏳ 이미지 최적화 및 캐싱</p>
              <p>⏳ 반응형 갤러리 레이아웃</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
