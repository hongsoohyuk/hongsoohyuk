import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {Camera, FileUser, FolderKanban, Github, Linkedin, Mail, MessageCircle, MessageSquareText, PenLine, TerminalSquare} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {createPageMetadata} from '@/config';
import {HeroTitle} from '@/features/home';
import {Link} from '@/lib/i18n/routing';

const SECTION_ICONS = {
  guestbook: MessageSquareText,
  project: FolderKanban,
  instagram: Camera,
  blog: PenLine,
  cli: TerminalSquare,
  resume: FileUser,
} as const;

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Seo'});

  return createPageMetadata({
    title: t('home.title'),
    description: t('home.description'),
    path: locale === 'ko' ? '/' : `/${locale}`,
    locale,
    keywords: ['홍수혁', '프론트엔드', '개발자', '포트폴리오', 'Frontend Developer', 'Portfolio', 'Next.js', 'React'],
  });
}

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
        <div className="grid gap-3 md:gap-4 max-w-4xl mx-auto grid-cols-2 sm:grid-cols-3">
          {(['guestbook', 'project', 'instagram', 'blog', 'cli', 'resume'] as const).map((key) => {
            const href = key === 'cli' ? '/cli' : `/${key}`;
            const Icon = SECTION_ICONS[key];
            return (
              <Link key={key} href={href} className="group">
                <Card className="h-full transition-shadow duration-200 hover:shadow-md hover:border-foreground/20 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="flex items-center gap-3 text-base md:text-lg">
                      <Icon className="size-5 md:size-6 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
                      <span className="font-semibold">{t(`sections.${key}.title`)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm leading-relaxed">
                      {t(`sections.${key}.description`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg md:text-xl font-semibold text-center mb-6 flex items-center justify-center gap-2 text-balance">
            <MessageCircle className="size-5" aria-hidden="true" />
            {t('contact.title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild className="text-sm">
              <a href="mailto:hongsoohyuk@icloud.com" className="flex items-center gap-2">
                <Mail className="size-4" />
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
                <Github className="size-4" />
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
                <Linkedin className="size-4" />
                <span>{t('contact.linkedin')}</span>
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
