import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/shared/ui";

export default function GuestbookPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">📝 방명록</h1>
          <p className="text-xl text-muted-foreground">
            방문해주셔서 감사합니다! 소중한 메시지를 남겨주세요
          </p>
        </div>

        {/* 방명록 작성 폼 */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>새로운 메시지 작성</CardTitle>
            <CardDescription>
              여러분의 생각과 응원을 공유해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">이름</label>
                  <input
                    type="text"
                    placeholder="이름을 입력하세요"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">이메일 (선택)</label>
                  <input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">메시지</label>
                <textarea
                  rows={4}
                  placeholder="메시지를 입력하세요"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                />
              </div>
              <Button className="w-full md:w-auto">
                메시지 남기기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 방명록 목록 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">남겨주신 메시지들</h2>
            <Badge variant="secondary">총 0개</Badge>
          </div>

          {/* 빈 상태 */}
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold mb-2">아직 메시지가 없어요</h3>
              <p className="text-muted-foreground mb-6">
                첫 번째 메시지를 남겨주세요!
              </p>
              <Button variant="outline">
                첫 메시지 작성하기
              </Button>
            </CardContent>
          </Card>

          {/* 메시지 목록 (추후 구현) */}
          {/*
          {messages.map((message) => (
            <Card key={message.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{message.author.name}</CardTitle>
                    <CardDescription>{formatDate(message.createdAt)}</CardDescription>
                  </div>
                  {message.isApproved && (
                    <Badge variant="secondary">승인됨</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{message.content}</p>
              </CardContent>
            </Card>
          ))}
          */}
        </div>

        {/* 개발 중 안내 */}
        <Card className="mt-12 border-dashed">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold mb-2">방명록 기능 개발 중</h3>
            <p className="text-muted-foreground">
              데이터베이스 연결과 메시지 관리 기능을 구현하고 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
