import {getTranslations, setRequestLocale} from 'next-intl/server';

import {createPageMetadata} from '@/config';
import {ChatPage} from './_components/chat-page';
import type {Metadata, Viewport} from 'next';

export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false,
};

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Seo'});

  return createPageMetadata({
    title: t('chat.title'),
    description: t('chat.description'),
    path: locale === 'ko' ? '/chat' : `/${locale}/chat`,
    locale,
  });
}

export default async function AiChatPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <ChatPage />;
}
