interface EndOfFeedProps {
  message?: string;
}

export function EndOfFeed({message = '모든 게시물을 불러왔습니다'}: EndOfFeedProps) {
  return (
    <div className="text-center py-4 text-sm text-muted-foreground" role="status">
      {message}
    </div>
  );
}
