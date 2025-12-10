'use client';

import {Button, Card, CardContent} from '@/component/ui';
import {useEffect} from 'react';

interface InstagramErrorProps {
  error: Error & {digest?: string};
  reset: () => void;
}

export default function InstagramError({error, reset}: InstagramErrorProps) {
  useEffect(() => {
    console.error('Instagram page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-6xl mb-4">📷</div>
            <h2 className="text-2xl font-bold mb-4">Instagram 연결에 문제가 발생했습니다</h2>
            <p className="text-muted-foreground mb-6">
              Instagram API 연결 중 오류가 발생했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.
            </p>
            <div className="space-y-3">
              <Button onClick={reset} className="w-full sm:w-auto">
                다시 시도하기
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="w-full sm:w-auto ml-0 sm:ml-3"
              >
                홈으로 돌아가기
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  개발자 정보 (개발 환경에서만 표시)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto">
                  {error.message}
                  {error.stack && '\n\n' + error.stack}
                  {error.digest && '\n\nDigest: ' + error.digest}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
