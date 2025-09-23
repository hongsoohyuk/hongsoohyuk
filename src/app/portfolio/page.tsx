import {Card, CardContent} from '@/component/ui';

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        {/* <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">💼 포트폴리오</h1>
          <p className="text-xl text-muted-foreground">저의 개발 여정과 프로젝트 경험을 소개합니다</p>
        </div> */}

        {/* 자기소개 섹션 */}
        {/* <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👤 자기소개
              <Badge variant="outline">Google Docs 연동 예정</Badge>
            </CardTitle>
            <CardDescription>Google Docs에 작성된 상세한 자기소개서를 확인하실 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">프론트엔드 개발자를 꿈꾸는 홍수혁입니다</h3>
                <p className="text-muted-foreground">
                  Next.js와 React를 중심으로 현대적인 웹 개발을 공부하고 있으며, 사용자 경험을 중요시하는 개발자가 되기
                  위해 노력하고 있습니다.
                </p>
              </div>
              <Button variant="outline" className="w-full">
                📄 Google Docs에서 전체 자기소개서 보기
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* 기술 스택 */}
        {/* <Card className="mb-8">
          <CardHeader>
            <CardTitle>🛠️ 기술 스택</CardTitle>
            <CardDescription>현재 공부하고 있는 기술들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">⚛️</div>
                <div className="font-semibold">React 19</div>
                <div className="text-sm text-muted-foreground">UI 라이브러리</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-semibold">Next.js 15</div>
                <div className="text-sm text-muted-foreground">React 프레임워크</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">📘</div>
                <div className="font-semibold">TypeScript</div>
                <div className="text-sm text-muted-foreground">타입 시스템</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-semibold">Tailwind CSS</div>
                <div className="text-sm text-muted-foreground">스타일링</div>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* 프로젝트 경험 */}
        {/* <Card className="mb-8">
          <CardHeader>
            <CardTitle>🚀 프로젝트 경험</CardTitle>
            <CardDescription>참여한 프로젝트와 학습 프로젝트들</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="personal-site">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>🌟 개인 사이트 개발</span>
                    <Badge variant="secondary">진행 중</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">Next.js 15와 React 19를 활용한 개인 포트폴리오 사이트 개발</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Next.js 15</Badge>
                      <Badge variant="outline">React 19</Badge>
                      <Badge variant="outline">TypeScript</Badge>
                      <Badge variant="outline">Tailwind CSS v4</Badge>
                      <Badge variant="outline">shadcn/ui</Badge>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Feature-Sliced Design 아키텍처 적용</li>
                      <li>방명록, 포트폴리오, 인스타그램 기능 구현 예정</li>
                      <li>반응형 디자인 및 접근성 고려</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="learning-projects">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>📚 학습 프로젝트들</span>
                    <Badge variant="secondary">진행 중</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">React와 Next.js의 다양한 개념을 학습하기 위한 프로젝트들</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Server Components와 Client Components 활용</li>
                      <li>커스텀 훅 개발 및 상태 관리</li>
                      <li>API 연동 및 데이터 fetching 패턴</li>
                      <li>컴포넌트 디자인 시스템 구축</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card> */}

        {/* 학습 목표 및 성장 */}
        {/* <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎯 학습 목표</CardTitle>
            <CardDescription>단기 및 장기 목표</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">단기 목표 (6개월)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Next.js와 React 마스터
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    TypeScript 고급 패턴 습득
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">🟡</span>
                    개인 프로젝트 완료
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">⭕</span>
                    협업 경험 쌓기
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">장기 목표 (2년)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">⭕</span>
                    프론트엔드 시니어 개발자
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">⭕</span>팀 리딩 경험
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">⭕</span>
                    오픈소스 기여
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">⭕</span>
                    기술 블로그 운영
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* 개발 중 안내 */}
        <Card className="mt-12 border-dashed">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold mb-2">포트폴리오 기능 개발 중</h3>
            <p className="text-muted-foreground">Google Docs API 연동과 콘텐츠 관리 기능을 구현하고 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
