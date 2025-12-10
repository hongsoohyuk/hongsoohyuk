import {EmotionCode, EmotionOption} from '@/entities/guestbook';
import {FormCopy} from '@/features/guestbook/submit';
import {EntriesCopy, GuestbookWidget} from '@/widgets/guestbook';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

type Props = {
  params: Promise<{locale: string}>;
};

const emotionOptions: {code: EmotionCode; emoji: string}[] = [
  {code: 'LIKE', emoji: '🖤'},
  {code: 'INSPIRATION', emoji: '🌊'},
  {code: 'NICE', emoji: '✨'},
  {code: 'HELLO', emoji: '👻'},
  {code: 'FUN', emoji: '🎉'},
  {code: 'THANK', emoji: '😀'},
];

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Guestbook'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Guestbook');
  const common = await getTranslations('Common');

  const formCopy: FormCopy = {
    title: t('formSection.title'),
    subtitle: t('formSection.subtitle'),
    placeholder: t('formSection.placeholder'),
    emotionTitle: t('formSection.emotionTitle'),
    emotionHint: t('formSection.emotionHint'),
    emotionHelper: t('formSection.emotionHelper'),
    securityTitle: t('formSection.securityTitle'),
    securityHelper: t('formSection.securityHelper'),
    button: t('formSection.button'),
    buttonPending: t('formSection.buttonPending'),
    note: t('formSection.note'),
    status: {
      success: t('formSection.status.success'),
      error: t('formSection.status.error'),
    },
    validation: {
      name: t('formSection.validation.name'),
      message: t('formSection.validation.message'),
      emotions: t('formSection.validation.emotions'),
      emotionLimit: t('formSection.validation.emotionLimit'),
      turnstile: t('formSection.validation.turnstile'),
    },
    nameLabel: t('form.name'),
    namePlaceholder: t('formSection.namePlaceholder'),
    messageLabel: t('form.message'),
    triggerLabel: t('formSection.trigger'),
  };

  const entriesCopy: EntriesCopy = {
    headerTitle: t('title'),
    headerSubtitle: t('description'),
    empty: t('entries.empty'),
    fetchError: t('entries.fetchError'),
    pagination: {
      previous: t('entries.pagination.previous'),
      next: t('entries.pagination.next'),
      summary: t('entries.pagination.summary', {page: 1, totalPages: 1}),
    },
    retry: common('retry'),
  };

  const localizedEmotionOptions: EmotionOption[] = emotionOptions.map((option) => ({
    ...option,
    label: t(`emotions.${option.code}.label`),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <GuestbookWidget
          locale={locale}
          entriesCopy={entriesCopy}
          formCopy={formCopy}
          emotionOptions={localizedEmotionOptions}
        />
      </div>
    </div>
  );
}
