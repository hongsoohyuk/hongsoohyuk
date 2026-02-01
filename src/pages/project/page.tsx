import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getProjectList} from '@/entities/project/api/pages/get-project-list';
import {ProjectCard} from '@/entities/project/ui/ProjectCard';

import {DEFAULT_PAGE} from '@/shared/api/pagination';
import {PaginationBackAndForth} from '@/shared/ui/pagination-back-and-forth';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{page?: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Project'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export async function ProjectPage({params, searchParams}: Props) {
  const {locale} = await params;
  const {page} = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'Project'});
  const currentPage = Number(page) || DEFAULT_PAGE;

  const data = await getProjectList({page: currentPage});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </header>

        {data.items.length > 0 ? (
          <section className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold">{t('listTitle')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <PaginationBackAndForth totalPages={data.pagination.totalPages} />
              </div>
            )}
          </section>
        ) : (
          <section className="mt-8">
            <p className="text-muted-foreground">{t('empty')}</p>
          </section>
        )}
      </div>
    </div>
  );
}
