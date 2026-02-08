import {LocalDateTime} from '@/components/ui/local-date-time';
import {Link} from '@/lib/i18n/routing';

import type {ProjectListItem} from '../types';

type Props = {
  project: ProjectListItem;
};

export function ProjectCard({project}: Props) {
  return (
    <Link
      href={`/project/${project.slug}`}
      className="group flex items-baseline justify-between gap-4 py-3 border-b border-border/50 transition-colors hover:border-foreground/20"
    >
      <h3 className="font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate">
        {project.title}
      </h3>
      <span className="text-sm text-muted-foreground shrink-0 tabular-nums">
        <LocalDateTime date={project.createdTime} dateStyle="medium" />
      </span>
    </Link>
  );
}
