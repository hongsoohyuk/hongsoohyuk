import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getBlogList} from '@/features/blog/api';
import {buildCliData} from '@/features/command-line/api';
import {Terminal} from '@/features/command-line';
import {getProjectList} from '@/features/project/api';
import {getResumePage} from '@/features/resume/api';
import {createPageMetadata} from '@/config';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Seo'});

  return createPageMetadata({
    title: t('cli.title'),
    description: t('cli.description'),
    path: locale === 'ko' ? '/cli' : `/${locale}/cli`,
    locale,
  });
}

export default async function CliPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [blogData, projectData, resumeData] = await Promise.all([
    getBlogList().catch(() => ({items: []})),
    getProjectList().catch(() => ({items: []})),
    getResumePage().catch(() => ({blocks: []})),
  ]);

  const cliData = buildCliData({
    blogPosts: blogData.items.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: '',
      categories: post.categories,
    })),
    projects: projectData.items.map((project) => ({
      slug: project.slug,
      title: project.title,
    })),
    resumeBlocks: resumeData.blocks,
  });

  return (
    <div className="h-screen flex flex-col bg-neutral-950">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <a
              href={`/${locale === 'ko' ? '' : locale}`}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 block focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              aria-label="Exit CLI"
            />
            <span className="w-3 h-3 rounded-full bg-yellow-500 block" />
            <span className="w-3 h-3 rounded-full bg-green-500 block" />
          </div>
          <span className="text-neutral-400 text-xs font-mono ml-2">guest@hongsoohyuk: ~</span>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 min-h-0">
        <Terminal cliData={cliData} />
      </div>
    </div>
  );
}
