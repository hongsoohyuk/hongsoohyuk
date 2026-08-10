import {ContentListRowSkeleton} from '@/components/content/content-list-row';
import {ItemGroup} from '@/components/ui/item';

export default function ProjectLoading() {
  return (
    <ItemGroup>
      {Array.from({length: 3}).map((_, i) => (
        <ContentListRowSkeleton key={`project-loading-skeleton-${i}`} />
      ))}
    </ItemGroup>
  );
}
