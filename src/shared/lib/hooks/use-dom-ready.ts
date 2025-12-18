import {useEffect, useState} from 'react';

/**
 * True only after the component has mounted in the browser.
 * Useful for SSR-safe access to `window`, `document`, `navigator`,
 * and to avoid hydration mismatches when client-only capabilities are involved.
 */
export function useDomReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}



