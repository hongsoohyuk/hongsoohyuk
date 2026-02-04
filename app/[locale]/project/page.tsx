import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getProjectList, ProjectCard} from '@/features/project';

import {PaginationBackAndForth} from '@/components/ui/pagination-back-and-forth';
import {DEFAULT_PAGE} from '@/lib/api/pagination';

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

export default async function ProjectPage({params, searchParams}: Props) {
  const {locale} = await params;
  const {page} = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'Project'});
  const currentPage = Number(page) || DEFAULT_PAGE;

  const data = await getProjectList({page: currentPage});

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        </header>

        {data.items.length > 0 ? (
          <section>
            <div className="flex flex-col">
              {data.items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <PaginationBackAndForth totalPages={data.pagination.totalPages} />
              </div>
            )}
          </section>
        ) : (
          <section className="py-12">
            <p className="text-muted-foreground">{t('empty')}</p>
          </section>
        )}
      </div>
    </div>
  );
}
