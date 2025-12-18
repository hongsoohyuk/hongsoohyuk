import {useTheme as useNextTheme} from 'next-themes';
import {useEffect, useState} from 'react';

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
