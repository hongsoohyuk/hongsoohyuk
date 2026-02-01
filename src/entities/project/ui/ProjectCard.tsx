import {Link} from '@/shared/i18n/routing';
import {Card, CardContent} from '@/shared/ui/card';

import type {ProjectListItem} from '../model/types';

type Props = {
  project: ProjectListItem;
};

export function ProjectCard({project}: Props) {
  return (
    <Link href={`/project/${project.slug}`} className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardContent className="py-6">
          <h3 className="text-lg font-semibold">{project.title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
}
