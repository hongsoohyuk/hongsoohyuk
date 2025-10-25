import {Card, CardContent} from '@/component/ui';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
}

export function EmptyState({icon = '📷', title = '게시물이 없습니다', description}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">
          {icon}
        </div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
