import {Link} from '@/shared/i18n/routing';

import type {ProjectListItem} from '../model/types';

type Props = {
  project: ProjectListItem;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ProjectCard({project}: Props) {
  return (
    <Link
      href={`/project/${project.slug}`}
      className="group flex items-baseline justify-between gap-4 py-3 border-b border-border/50 transition-colors hover:border-foreground/20"
    >
      <h3 className="font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate">
        {project.title}
      </h3>
      <time
        dateTime={project.createdTime}
        className="text-sm text-muted-foreground shrink-0 tabular-nums"
      >
        {formatDate(project.createdTime)}
      </time>
    </Link>
  );
}
