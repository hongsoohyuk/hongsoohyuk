import {GitHubLogoIcon, InstagramLogoIcon, LinkedInLogoIcon} from '@radix-ui/react-icons';
import {
  Bot,
  FileText,
  FolderKanban,
  Mail,
  MessageCircle,
  MessageSquareText,
  PenLine,
  TerminalSquare,
} from 'lucide-react';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {PageContainer} from '@/components/layout/page-container';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Link} from '@/lib/i18n/routing';
import {JsonLd, personJsonLd, websiteJsonLd} from '@/lib/seo/json-ld';
import {cn} from '@/utils/style';
import {createPageMetadata} from '@/config';

import {HeroTitle} from './_components/hero-title';

const SECTION_ICONS = {
  guestbook: MessageSquareText,
  project: FolderKanban,
  instagram: InstagramLogoIcon,
  blog: PenLine,
  cli: TerminalSquare,
  resume: FileText,
  chat: Bot,
} as const;

const SECTION_KEYS = ['guestbook', 'project', 'instagram', 'blog', 'cli', 'resume', 'chat'] as const;

// 카드는 12칸 그리드 위에 모바일 2열(span 6) / sm 이상 3열(span 4)로 놓인다.
// 카드 수가 열 수로 나눠떨어지지 않으면 마지막 줄이 왼쪽에 붙어 허전해지므로,
// 그 줄의 첫 카드를 남는 칸의 절반만큼 밀어 가운데로 맞춘다. (예: 3열에 1개 남으면 col-start-5)
const LAST_ROW_START: Record<number, Record<number, string>> = {
  2: {1: 'col-start-4'},
  3: {1: 'sm:col-start-5', 2: 'sm:col-start-3'},
};

function lastRowStartClass(index: number, total: number) {
  return Object.entries(LAST_ROW_START)
    .map(([columns, starts]) => {
      const remainder = total % Number(columns);
      return remainder > 0 && index === total - remainder ? starts[remainder] : null;
    })
    .filter(Boolean)
    .join(' ');
}

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
      <JsonLd data={[personJsonLd(), websiteJsonLd()]} />
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center px-4 py-12 md:py-20">
        <PageContainer size="wide">
          <HeroTitle />

          <p className="text-center text-muted-foreground mt-6 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {t('contact.description')}
          </p>
        </PageContainer>
      </section>

      {/* Navigation Cards */}
      <section className="px-4 pb-8 md:pb-16">
        <PageContainer size="wide" className="grid gap-3 md:gap-4 grid-cols-12">
          {SECTION_KEYS.map((key, index) => {
            const href = key === 'cli' ? '/cli' : `/${key}`;
            const Icon = SECTION_ICONS[key];
            return (
              <Link
                key={key}
                href={href}
                className={cn('group col-span-6 sm:col-span-4', lastRowStartClass(index, SECTION_KEYS.length))}
              >
                <Card className="h-full transition-shadow duration-200 hover:shadow-md hover:border-foreground/20 dark:hover:bg-input/50 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="flex items-center gap-3 text-base md:text-lg">
                      <Icon className="size-5 md:size-6 shrink-0 text-foreground" aria-hidden="true" />
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
        </PageContainer>
      </section>

      {/* Contact Section */}
      <section className="px-4 py-8 md:py-12">
        <PageContainer size="wide">
          <h2 className="text-lg md:text-xl font-semibold text-center mb-6 flex items-center justify-center gap-2 text-balance">
            <MessageCircle className="size-5" aria-hidden="true" />
            {t('contact.title')}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" asChild className="text-sm">
              <a href="mailto:hongsoohyuk@icloud.com">
                <Mail className="size-4" />
                <span>{t('contact.email')}</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-sm">
              <a href="https://github.com/hongsoohyuk" target="_blank" rel="noopener noreferrer">
                <GitHubLogoIcon className="size-4" />
                <span>{t('contact.github')}</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-sm">
              <a href="https://www.linkedin.com/in/soohyuk-hong-569020228/" target="_blank" rel="noopener noreferrer">
                <LinkedInLogoIcon className="size-4" />
                <span>{t('contact.linkedin')}</span>
              </a>
            </Button>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
