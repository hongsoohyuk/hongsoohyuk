import {AspectRatio} from '@/shared/ui/aspect-ratio';
import {Card, CardContent} from '@/shared/ui/card';
import {Skeleton} from '@/shared/ui/skeleton';

export default function InstagramLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent>
            <div className="flex items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-18" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <AspectRatio ratio={4 / 5} className="relative w-full bg-muted grid gap-0.5 grid-cols-3">
          {Array.from({length: 9}).map((_, index) => (
            <Skeleton key={index} className="absolute inset-0 rounded-none" />
          ))}
        </AspectRatio>
      </div>
    </div>
  );
}
