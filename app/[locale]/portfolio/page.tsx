import {Card, CardContent} from '@/shared/ui/card';
import {getCVServer} from '@/entities/portfolio';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Metadata} from 'next';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Portfolio'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function PortfolioPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  // Server-side data fetching
  const doc = await getCVServer().catch(() => null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* {JSON.stringify(doc)} */}

        {/* 개발 중 안내 */}
        <Card className="mt-12 border-dashed">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold mb-2">포트폴리오 기능 개발 중</h3>
            <p className="text-muted-foreground">Google Docs API 연동과 콘텐츠 관리 기능을 구현하고 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
