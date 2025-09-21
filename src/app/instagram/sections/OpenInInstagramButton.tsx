'use client';

import {Button} from '@/shared/ui';

export default function OpenInInstagramButton({username}: {username?: string}) {
  const handleOpen = () => {
    if (!username) return;
    const appUrl = `instagram://user?username=${username}`;
    const webUrl = `https://instagram.com/${username}`;
    const timeout = setTimeout(() => {
      window.location.href = webUrl;
    }, 1200);
    // Try to open Instagram app
    window.location.href = appUrl;
    // Safety: clear timeout if the page is hidden (navigation likely happened)
    const onVisibility = () => {
      if (document.hidden) clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    document.addEventListener('visibilitychange', onVisibility);
  };

  return (
    <Button variant="outline" onClick={handleOpen} disabled={!username}>
      📱 Instagram 앱에서 보기
    </Button>
  );
}
