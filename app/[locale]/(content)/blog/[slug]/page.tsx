import {ArrowLeftIcon} from 'lucide-react';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {compileMDX} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

import {ContentSurface} from '@/components/content/content-surface';
import {PageHeader, PageHeaderDescription, PageHeaderTitle} from '@/components/layout/page-header';
import {mdxComponents} from '@/components/mdx-components';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {getBlogDetail, getBlogList} from '@/lib/content/blog';

import {locales} from '@/lib/i18n/config';
import {Link} from '@/lib/i18n/routing';
import {blogPostingJsonLd, breadcrumbJsonLd, JsonLd} from '@/lib/seo/json-ld';
import {createPageMetadata} from '@/config';
import {CategoryBadges} from '../_components/category-badges';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export async function generateStaticParams() {
  const data = await getBlogList();
  return data.items.flatMap((item) => locales.map((locale) => ({locale, slug: item.slug})));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;

  try {
    const [data, listData] = await Promise.all([getBlogDetail(slug), getBlogList()]);
    const listItem = listData.items.find((item) => item.slug === slug);
    const description = listItem?.description || `${data.meta.title} - ${data.meta.categories.join(', ')}`;

    return createPageMetadata({
      title: data.meta.title,
      description,
      path: locale === 'ko' ? `/blog/${slug}` : `/${locale}/blog/${slug}`,
      locale,
      keywords: data.meta.keywords.length > 0 ? data.meta.keywords : data.meta.categories,
      type: 'article',
    });
  } catch {
    return {
      title: 'Blog',
    };
  }
}

export default async function BlogDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([getTranslations({locale, namespace: 'Blog'}), getBlogDetail(slug)]);

  const {content} = await compileMDX({
    source: data.content,
    components: mdxComponents,
    options: {mdxOptions: {remarkPlugins: [remarkGfm]}},
  });

  const formattedDate = new Date(data.meta.lastEditedTime).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const basePath = locale === 'ko' ? '' : `/${locale}`;
  const postPath = `${basePath}/blog/${slug}`;

  return (
    <section className="space-y-6">
      <JsonLd
        data={[
          blogPostingJsonLd({
            title: data.meta.title,
            description: data.meta.description,
            path: postPath,
            // 마크다운 본문은 UI locale과 무관하게 한국어
            locale: 'ko',
            datePublished: data.meta.createdTime,
            dateModified: data.meta.lastEditedTime,
            keywords: data.meta.keywords.length > 0 ? data.meta.keywords : data.meta.categories,
          }),
          breadcrumbJsonLd([
            {name: t('title'), path: `${basePath}/blog`},
            {name: data.meta.title, path: postPath},
          ]),
        ]}
      />
      <PageHeader className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/blog" className="inline-flex items-center gap-1">
                  <ArrowLeftIcon className="size-3.5" />
                  {t('title')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.meta.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageHeaderTitle className="text-3xl font-bold">{data.meta.title}</PageHeaderTitle>
        {data.meta.categories.length > 0 && (
          <div className="flex gap-1.5">
            <CategoryBadges categories={data.meta.categories} />
          </div>
        )}
        <PageHeaderDescription>{t('lastEdited', {date: formattedDate})}</PageHeaderDescription>
      </PageHeader>

      <ContentSurface>{content}</ContentSurface>
    </section>
  );
}
