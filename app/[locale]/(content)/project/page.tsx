import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {
  ContentListRow,
  ContentListRowArrow,
  ContentListRowDescription,
  ContentListRowHeader,
  ContentListRowMeta,
  ContentListRowTitle,
} from '@/components/content/content-list-row';
import {ItemGroup} from '@/components/ui/item';
import {LocalDateTime} from '@/components/ui/local-date-time';
import {getProjectList} from '@/lib/content/project';

import {Link} from '@/lib/i18n/routing';
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
    <ItemGroup>
      {data.items.map((project) => (
        <ContentListRow key={project.slug}>
          <Link
            href={`/project/${project.slug}`}
            data-beacon-event="click"
            data-beacon-prop-target="project-card"
            data-beacon-prop-slug={project.slug}
          >
            <ContentListRowHeader className="items-baseline justify-between gap-4">
              <ContentListRowTitle>{project.title}</ContentListRowTitle>
              <ContentListRowMeta>
                <span className="text-xs text-muted-foreground/70 tabular-nums">
                  <LocalDateTime date={project.createdTime} dateStyle="medium" />
                </span>
                <ContentListRowArrow />
              </ContentListRowMeta>
            </ContentListRowHeader>
            {project.description && (
              <ContentListRowDescription className="mt-1">{project.description}</ContentListRowDescription>
            )}
          </Link>
        </ContentListRow>
      ))}
    </ItemGroup>
  );
}
