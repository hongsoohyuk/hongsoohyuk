import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {ProjectCard} from '@/features/project';
import {getProjectList} from '@/features/project/api';

import {Card, CardContent} from '@/components/ui/card';
import {createPageMetadata} from '@/config';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Seo'});

  return createPageMetadata({
    title: t('project.title'),
    description: t('project.description'),
    path: locale === 'ko' ? '/project' : `/${locale}/project`,
    locale,
    keywords: ['프로젝트', '포트폴리오', 'Projects', 'Portfolio', '개발자'],
  });
}

export default async function ProjectPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const data = await getProjectList();

  return (
    <div className="flex flex-col gap-4">
      {data.items.map((project) => (
        <Card key={project.id} className="flex-1 min-h-0 overflow-hidden">
          <CardContent className="h-full overflow-hidden">
            <ProjectCard project={project} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
