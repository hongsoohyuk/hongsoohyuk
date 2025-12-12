import {useEffect, useState} from 'react';

export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => root.classList.contains('dark');
    setIsDark(read());

    const observer = new MutationObserver(() => setIsDark(read()));
    observer.observe(root, {attributes: true, attributeFilter: ['class']});
    return () => observer.disconnect();
  }, []);

  return isDark;
}
