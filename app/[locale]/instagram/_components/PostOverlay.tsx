interface PostOverlayProps {
  likeCount?: number;
  commentsCount?: number;
}

export function PostOverlay({likeCount = 0, commentsCount = 0}: PostOverlayProps) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/40 group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex items-center gap-4 text-white font-semibold text-sm" role="group">
          <span aria-label={`${likeCount} likes`}>❤️ {likeCount.toLocaleString()}</span>
          <span aria-label={`${commentsCount} comments`}>💬 {commentsCount.toLocaleString()}</span>
        </div>
      </div>
    </>
  );
}
