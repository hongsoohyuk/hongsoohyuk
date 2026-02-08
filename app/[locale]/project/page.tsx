import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getProjectList, ProjectCard} from '@/features/project';

import {Card, CardContent, CardFooter} from '@/components/ui/card';
import {PaginationBackAndForth} from '@/components/ui/pagination-back-and-forth';
import {ScrollArea} from '@/components/ui/scroll-area';
import {PAGE_LAYOUT_CLASSES} from '@/config';
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

  const currentPage = Number(page) || DEFAULT_PAGE;

  const [t, data] = await Promise.all([
    getTranslations({locale, namespace: 'Project'}),
    getProjectList({page: currentPage}),
  ]);

  return (
    <div className={`flex flex-col gap-4 ${PAGE_LAYOUT_CLASSES.contentHeight}`}>
      <header className="px-4 md:px-0 space-y-1 shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </header>
      <Card className="flex-1 min-h-0 overflow-hidden">
        <CardContent className="flex-1 min-h-0 overflow-hidden pt-4 md:pt-6">
          <ScrollArea className="h-full">
            {data.items.length > 0 ? (
              <div className="flex flex-col">
                {data.items.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-12">{t('empty')}</p>
            )}
          </ScrollArea>
        </CardContent>
        {data.pagination.totalPages > 1 && (
          <CardFooter className="flex justify-end shrink-0">
            <PaginationBackAndForth totalPages={data.pagination.totalPages} />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
