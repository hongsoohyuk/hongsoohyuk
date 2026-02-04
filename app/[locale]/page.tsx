import {getTranslations, setRequestLocale} from 'next-intl/server';

import {HeroTitle} from '@/widgets/home/ui/HeroTitle';

import {Link} from '@/lib/i18n/routing';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function Home({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');

  return (
    <div className="min-h-[calc(100dvh-3rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto w-full">
          <HeroTitle />
          <p className="text-center text-muted-foreground mt-6 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {t('contact.description')}
          </p>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="px-4 pb-8 md:pb-16">
        <div className="grid gap-3 md:gap-4 max-w-4xl mx-auto grid-cols-1 sm:grid-cols-3">
          <Link href="/guestbook" className="group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-foreground/20 group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="flex items-center gap-3 text-base md:text-lg">
                  <span className="text-xl md:text-2xl">{t('sections.guestbook.emoji')}</span>
                  <span className="font-semibold">{t('sections.guestbook.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">
                  {t('sections.guestbook.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/project" className="group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-foreground/20 group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="flex items-center gap-3 text-base md:text-lg">
                  <span className="text-xl md:text-2xl">{t('sections.project.emoji')}</span>
                  <span className="font-semibold">{t('sections.project.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">
                  {t('sections.project.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/instagram" className="group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-foreground/20 group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="flex items-center gap-3 text-base md:text-lg">
                  <span className="text-xl md:text-2xl">{t('sections.instagram.emoji')}</span>
                  <span className="font-semibold">{t('sections.instagram.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">
                  {t('sections.instagram.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg md:text-xl font-semibold text-center mb-6">{t('contact.title')}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild className="text-sm">
              <a href="mailto:hongsoohyuk@icloud.com" className="flex items-center gap-2">
                <span>📧</span>
                <span>{t('contact.email')}</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-sm">
              <a
                href="https://github.com/hongsoohyuk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                <span>{t('contact.github')}</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-sm">
              <a
                href="https://linkedin.com/in/hongsoohyuk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <span>💼</span>
                <span>{t('contact.linkedin')}</span>
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
