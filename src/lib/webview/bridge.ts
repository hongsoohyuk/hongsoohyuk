/**
 * 웹뷰 JS Bridge 통신 모듈
 *
 * 웹 ↔ 네이티브 앱 간 메시지를 주고받는 인터페이스.
 * 실무에서는 앱 팀과 메시지 타입을 협의하여 사용한다.
 *
 * @example
 * ```ts
 * const bridge = createBridge();
 *
 * // 웹 → 앱 메시지 전송
 * bridge.postMessage({ type: 'SHARE', payload: { url: '...' } });
 *
 * // 앱 → 웹 메시지 수신
 * const unsubscribe = bridge.onMessage((msg) => {
 *   if (msg.type === 'USER_INFO') {
 *     setUser(msg.payload);
 *   }
 * });
 * ```
 */

export interface BridgeMessage<T = unknown> {
  type: string;
  payload?: T;
}

type MessageHandler = (message: BridgeMessage) => void;

export interface Bridge {
  /** 웹 → 앱으로 메시지 전송 */
  postMessage: (message: BridgeMessage) => void;
  /** 앱 → 웹 메시지 수신 리스너 등록 */
  onMessage: (handler: MessageHandler) => () => void;
  /** 모든 리스너 해제 */
  destroy: () => void;
}

/**
 * 웹 → 앱 메시지 전송
 *
 * 앱 플랫폼별로 메시지를 보내는 방식이 다르다:
 * - React Native: window.ReactNativeWebView.postMessage
 * - Android: window.AppBridge.postMessage
 * - iOS: window.webkit.messageHandlers.appBridge.postMessage
 * - fallback: window.parent.postMessage (iframe 대응)
 */
function sendToNative(message: BridgeMessage): void {
  const serialized = JSON.stringify(message);

  // React Native WebView
  if ('ReactNativeWebView' in window) {
    (window as Record<string, any>).ReactNativeWebView.postMessage(serialized);
    return;
  }

  // Android @JavascriptInterface
  if ('AppBridge' in window) {
    (window as Record<string, any>).AppBridge.postMessage(serialized);
    return;
  }

  // iOS WKWebView (WKScriptMessageHandler)
  if (
    'webkit' in window &&
    (window as Record<string, any>).webkit?.messageHandlers?.appBridge
  ) {
    (window as Record<string, any>).webkit.messageHandlers.appBridge.postMessage(
      serialized,
    );
    return;
  }

  // fallback: iframe 또는 개발 환경
  window.parent.postMessage(message, '*');
}

/**
 * Bridge 인스턴스를 생성한다.
 *
 * 컴포넌트 마운트 시 생성하고, 언마운트 시 destroy()를 호출해야 한다.
 */
export function createBridge(): Bridge {
  const handlers = new Set<MessageHandler>();

  function handleMessageEvent(event: MessageEvent) {
    // 문자열로 온 메시지는 JSON 파싱 시도
    let data = event.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return; // 파싱 불가 메시지는 무시
      }
    }

    // type 필드가 없으면 Bridge 메시지가 아님
    if (!data || typeof data.type !== 'string') return;

    handlers.forEach((handler) => handler(data as BridgeMessage));
  }

  window.addEventListener('message', handleMessageEvent);

  return {
    postMessage(message: BridgeMessage) {
      sendToNative(message);
    },

    onMessage(handler: MessageHandler) {
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    },

    destroy() {
      handlers.clear();
      window.removeEventListener('message', handleMessageEvent);
    },
  };
}
