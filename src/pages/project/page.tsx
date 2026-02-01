import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getNotionBlockChildren, getNotionPage, NotionBlocks, NotionRichText} from '@/entities/project';

import {Link} from '@/shared/i18n/routing';
import {Card, CardContent} from '@/shared/ui/card';

type Props = {
  params: Promise<{locale: string}>;
};

function extractFirstTitleRichText(page: any): any[] {
  const props = page?.properties ?? {};
  for (const value of Object.values(props) as any[]) {
    if (value?.type === 'title') return value?.title ?? [];
  }
  return [];
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Project'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export async function ProjectPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'Project'});

  const introPageId = '1e8cc5bea79e80018f4df4db8dcf96ae';

  // Intro page (optional): shows a Notion page body at the top of /project
  const introPage = await getNotionPage(introPageId);
  const introTitleRichText = extractFirstTitleRichText(introPage);
  const introBlocks = await getNotionBlockChildren(introPageId);

  // child_page 블록들 추출 (프로젝트 상세 페이지들)
  const childPages = (introBlocks.results as any[]).filter((block) => block.type === 'child_page');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {introTitleRichText.length ? <NotionRichText richText={introTitleRichText} /> : t('title')}
          </h1>
        </header>

        {introBlocks.results.length ? (
          <section className="mt-8">
            <NotionBlocks blocks={introBlocks.results as any} />
          </section>
        ) : null}

        {childPages.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold">프로젝트 목록</h2>
            <div className="grid gap-4">
              {childPages.map((block) => {
                const pageId = block.id.replace(/-/g, '');
                const title = block.child_page?.title ?? 'Untitled';

                return (
                  <Link key={block.id} href={`/project/${pageId}`} className="block">
                    <Card className="transition-colors hover:bg-muted/40">
                      <CardContent className="py-6">
                        <h3 className="text-lg font-semibold">{title}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
