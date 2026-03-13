'use client';

import type { BridgeMessage } from '@/lib/webview/bridge';
import { useBridge } from '@/lib/webview/use-bridge';
import { useWebView } from '@/lib/webview/use-webview';

/**
 * 웹뷰 환경에서 Header/Footer를 숨기고,
 * 앱과의 Bridge 통신을 초기화하는 쉘 컴포넌트.
 *
 * 웹뷰가 아닌 일반 브라우저에서는 children을 그대로 렌더링한다.
 */
export function WebViewShell({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isWebView } = useWebView();

  useBridge((msg: BridgeMessage) => {
    // 앱에서 오는 메시지 처리 (추후 확장 가능)
    if (msg.type === 'NAVIGATE') {
      const path = msg.payload as string;
      window.location.href = path;
    }
  });

  return (
    <>
      {!isWebView && header}
      <main className={isWebView ? 'flex-1 pb-safe' : 'flex-1'}>
        {children}
      </main>
      {!isWebView && footer}
    </>
  );
}
