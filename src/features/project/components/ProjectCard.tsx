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
      className="group block py-4 border-b border-border/50 transition-colors hover:border-foreground/20"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate">
          {project.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground/70 tabular-nums">
            <LocalDateTime date={project.createdTime} dateStyle="medium" />
          </span>
          <span className="text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-200 -translate-x-2 group-hover:translate-x-0">
            →
          </span>
        </div>
      </div>
      {project.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description}</p>}
    </Link>
  );
}
