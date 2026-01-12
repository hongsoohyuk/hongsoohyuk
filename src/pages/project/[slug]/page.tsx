import {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';

import {Link} from '@/shared/i18n/routing';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

function extractFirstTitle(page: any): string {
  const props = page?.properties ?? {};
  for (const value of Object.values(props) as any[]) {
    if (value?.type === 'title') return (value?.title ?? []).map((t: any) => t?.plain_text ?? '').join('');
  }
  return '';
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  return {
    title: 'Project Detail',
  };
}

export async function ProjectDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-sm">
          <Link href="/project" className="text-muted-foreground hover:underline">
            ← 목록으로
          </Link>
        </div>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{'title'}</h1>
        </header>
      </div>
    </div>
  );
}
