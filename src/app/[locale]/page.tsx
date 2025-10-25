import {Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/component/ui';
import {Link} from '@/i18n/routing';
import {getTranslations, setRequestLocale} from 'next-intl/server';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function Home({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {t('title')}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}
              {t('name')}
            </span>
            {t('suffix') && ` ${t('suffix')}`}
          </h1>
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="py-12">
        <div className="grid gap-6 max-w-6xl mx-auto md:grid-cols-2 xl:grid-cols-4">
          {/* 방명록 카드 */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">{t('sections.guestbook.emoji')}</div>
              <CardTitle>{t('sections.guestbook.title')}</CardTitle>
              <CardDescription>{t('sections.guestbook.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/guestbook">
                <Button className="w-full group-hover:bg-primary/90">{t('sections.guestbook.button')}</Button>
              </Link>
            </CardContent>
          </Card>

          {/* 포트폴리오 카드 */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">{t('sections.portfolio.emoji')}</div>
              <CardTitle>{t('sections.portfolio.title')}</CardTitle>
              <CardDescription>{t('sections.portfolio.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/portfolio">
                <Button className="w-full group-hover:bg-primary/90">{t('sections.portfolio.button')}</Button>
              </Link>
            </CardContent>
          </Card>

          {/* 인스타그램 카드 */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">{t('sections.instagram.emoji')}</div>
              <CardTitle>{t('sections.instagram.title')}</CardTitle>
              <CardDescription>{t('sections.instagram.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/instagram">
                <Button className="w-full group-hover:bg-primary/90">{t('sections.instagram.button')}</Button>
              </Link>
            </CardContent>
          </Card>

          {/* 포켓몬 미니게임 카드 */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">{t('sections.pokemon.emoji')}</div>
              <CardTitle>{t('sections.pokemon.title')}</CardTitle>
              <CardDescription>{t('sections.pokemon.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pokemon">
                <Button className="w-full group-hover:bg-primary/90">{t('sections.pokemon.button')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 연락처 섹션 */}
      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold mb-8">{t('contact.title')}</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{t('contact.description')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" asChild>
            <a href="mailto:contact@example.com" className="flex items-center gap-2">
              📧 {t('contact.email')}
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/hongsoohyuk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              {t('contact.github')}
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://linkedin.com/in/hongsoohyuk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              💼 {t('contact.linkedin')}
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
