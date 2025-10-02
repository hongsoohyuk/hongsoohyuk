export function ThemeScript() {
  const themeScript = `
    (function() {
      function getTheme() {
        // localStorage theme
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        
        // system theme
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      const theme = getTheme();
      const root = document.documentElement;
      
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.style.colorScheme = theme;
    })();
  `;

  return <script dangerouslySetInnerHTML={{__html: themeScript}} />;
}
