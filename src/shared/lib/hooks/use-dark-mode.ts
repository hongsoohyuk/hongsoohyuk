import {useEffect, useState} from 'react';

import {useTheme as useNextTheme} from 'next-themes';

export function useDarkMode(): boolean {
  const {resolvedTheme} = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return false;
  }

  return resolvedTheme === 'dark';
}
