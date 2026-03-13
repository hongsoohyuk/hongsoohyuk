'use client';

import { useEffect, useRef } from 'react';

import { createBridge } from './bridge';

import type { Bridge, BridgeMessage } from './bridge';

/**
 * Bridge 인스턴스를 생성/관리하는 훅
 *
 * 마운트 시 Bridge를 생성하고 언마운트 시 자동 정리한다.
 *
 * @param onMessage - 앱에서 보낸 메시지를 받는 핸들러
 *
 * @example
 * ```tsx
 * function GuestbookForm() {
 *   const bridge = useBridge((msg) => {
 *     if (msg.type === 'USER_INFO') {
 *       setName(msg.payload.name);
 *     }
 *   });
 *
 *   function handleSubmit() {
 *     bridge.current?.postMessage({
 *       type: 'GUESTBOOK_SUBMITTED',
 *       payload: { name, message },
 *     });
 *   }
 * }
 * ```
 */
export function useBridge(
  onMessage?: (message: BridgeMessage) => void,
): React.RefObject<Bridge | null> {
  const bridgeRef = useRef<Bridge | null>(null);

  useEffect(() => {
    const bridge = createBridge();
    bridgeRef.current = bridge;

    let unsubscribe: (() => void) | undefined;
    if (onMessage) {
      unsubscribe = bridge.onMessage(onMessage);
    }

    return () => {
      unsubscribe?.();
      bridge.destroy();
      bridgeRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return bridgeRef;
}
