import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {compileMDX} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

import {ContentSurface} from '@/components/content/content-surface';
import {PageHeader, PageHeaderDescription} from '@/components/layout/page-header';
import {mdxComponents} from '@/components/mdx-components';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {getProjectDetail, getProjectList} from '@/lib/content/project';

import {locales} from '@/lib/i18n/config';
import {Link} from '@/lib/i18n/routing';
import {breadcrumbJsonLd, creativeWorkJsonLd, JsonLd} from '@/lib/seo/json-ld';
import {createPageMetadata} from '@/config';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export async function generateStaticParams() {
  const data = await getProjectList();
  return data.items.flatMap((item) => locales.map((locale) => ({locale, slug: item.slug})));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;

  try {
    const [data, listData] = await Promise.all([getProjectDetail(slug), getProjectList()]);
    const listItem = listData.items.find((item) => item.slug === slug);
    const description = listItem?.description || `${data.meta.title} - hongsoohyuk`;

    return createPageMetadata({
      title: data.meta.title,
      description,
      path: locale === 'ko' ? `/project/${slug}` : `/${locale}/project/${slug}`,
      locale,
    });
  } catch {
    return {
      title: 'Project Detail',
    };
  }
}

export default async function ProjectDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([getTranslations({locale, namespace: 'Project'}), getProjectDetail(slug)]);

  const {content} = await compileMDX({
    source: data.content,
    components: mdxComponents,
    options: {mdxOptions: {remarkPlugins: [remarkGfm]}},
  });

  const formattedDate = data.meta.lastEditedTime
    ? new Date(data.meta.lastEditedTime).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const basePath = locale === 'ko' ? '' : `/${locale}`;
  const projectPath = `${basePath}/project/${slug}`;

  return (
    <div className="space-y-6">
      <JsonLd
        data={[
          creativeWorkJsonLd({
            title: data.meta.title,
            description: data.meta.description,
            path: projectPath,
            // 마크다운 본문은 UI locale과 무관하게 한국어
            locale: 'ko',
            dateCreated: data.meta.createdTime,
            dateModified: data.meta.lastEditedTime,
          }),
          breadcrumbJsonLd([
            {name: t('title'), path: `${basePath}/project`},
            {name: data.meta.title, path: projectPath},
          ]),
        ]}
      />
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/project">{t('title')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.meta.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-bold tracking-tight">{data.meta.title}</h1>
        {formattedDate && <PageHeaderDescription>{t('lastEdited', {date: formattedDate})}</PageHeaderDescription>}
      </PageHeader>

      <ContentSurface>{content}</ContentSurface>
    </div>
  );
}
