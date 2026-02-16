import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import {SearchInput} from '@/components/ui/search-input';
import {Skeleton} from '@/components/ui/skeleton';
import {BLOG_CATEGORIES} from '@/features/blog';
import {useTranslations} from 'next-intl';

export default function BlogLoading() {
  const t = useTranslations('Blog');
  return (
    <div className="flex flex-col gap-6 h-[calc(100dvh-16rem)]">
      <div className="shrink-0">
        <FilterSkeleton />
      </div>

      <Card className="flex-1 min-h-0 overflow-hidden">
        <CardContent className="h-full overflow-hidden">
          {Array.from({length: 5}).map((_, i) => (
            <div key={`blog-loading-skeleton-${i}`} className="space-y-2 py-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSkeleton() {
  const t = useTranslations('Blog');
  return (
    <div className="space-y-3">
      <SearchInput disabled />
      <div className="relative">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" role="group">
          <Badge variant="default" className="cursor-pointer text-xs">
            {t('allCategories')}
          </Badge>
          {BLOG_CATEGORIES.map((category) => (
            <Badge key={category} variant="outline">
              {category}
            </Badge>
          ))}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </div>
  );
}
