/**
 * 웹뷰 환경 감지 유틸리티
 *
 * 네이티브 앱(Android WebView, iOS WKWebView) 안에서
 * 실행 중인지 판별하는 함수들을 제공한다.
 */

export type WebViewPlatform = 'android' | 'ios' | 'unknown';

export interface WebViewInfo {
  isWebView: boolean;
  platform: WebViewPlatform;
}

/**
 * Android WebView 환경인지 판별
 *
 * - `wv` (WebView 플래그)가 UA에 포함
 * - 또는 Android 환경에서 독립 브라우저 식별자(Chrome, Firefox 등)가 없는 경우
 */
function isAndroidWebView(ua: string): boolean {
  if (!/Android/i.test(ua)) return false;

  // Android WebView는 UA에 'wv' 토큰을 포함한다
  if (/\bwv\b/.test(ua)) return true;

  // Chrome 커스텀탭이 아닌 순수 WebView: Version/x.x 패턴
  if (/Version\/[\d.]+/.test(ua) && !(/Chrome\/[\d.]+ Mobile Safari/i.test(ua))) {
    return true;
  }

  return false;
}

/**
 * iOS WKWebView 환경인지 판별
 *
 * iOS 독립 브라우저(Safari, CriOS, FxiOS 등)가 아니면서
 * AppleWebKit 기반이면 웹뷰로 판단한다.
 */
function isIOSWebView(ua: string): boolean {
  if (!/iPhone|iPad|iPod/i.test(ua)) return false;

  // 독립 브라우저가 아닌 WebKit 환경 = 웹뷰
  const isStandaloneBrowser = /Safari\/[\d.]+/i.test(ua);
  const isAppleWebKit = /AppleWebKit/i.test(ua);

  return isAppleWebKit && !isStandaloneBrowser;
}

/**
 * 현재 환경이 웹뷰인지 판별한다.
 *
 * @example
 * ```ts
 * if (detectWebView().isWebView) {
 *   bridge.postMessage({ type: 'READY' });
 * }
 * ```
 */
export function detectWebView(): WebViewInfo {
  if (typeof window === 'undefined') {
    return { isWebView: false, platform: 'unknown' };
  }

  const ua = navigator.userAgent;

  if (isAndroidWebView(ua)) {
    return { isWebView: true, platform: 'android' };
  }

  if (isIOSWebView(ua)) {
    return { isWebView: true, platform: 'ios' };
  }

  // 앱에서 주입한 커스텀 인터페이스가 있으면 웹뷰
  if (
    'ReactNativeWebView' in window ||
    'flutter_inappwebview' in window ||
    'AppBridge' in window
  ) {
    return { isWebView: true, platform: 'unknown' };
  }

  return { isWebView: false, platform: 'unknown' };
}
