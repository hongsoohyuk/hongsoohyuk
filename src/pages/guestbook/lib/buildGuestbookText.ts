import {EmotionCode, EmotionOption} from '@/entities/guestbook';
import {FormText} from '@/features/guestbook/submit';
import {EntriesText} from '@/widgets/guestbook';
import type {getTranslations} from 'next-intl/server';

type Translator = Awaited<ReturnType<typeof getTranslations>>;

type BuildGuestbookTextParams = {
  tGuestbook: Translator;
  tCommon: Translator;
  emotionOptions: {code: EmotionCode; emoji: string}[];
};

export function buildGuestbookText({tGuestbook, tCommon, emotionOptions}: BuildGuestbookTextParams): {
  formText: FormText;
  entriesText: EntriesText;
  localizedEmotionOptions: EmotionOption[];
} {
  const formText: FormText = {
    title: tGuestbook('formSection.title'),
    subtitle: tGuestbook('formSection.subtitle'),
    placeholder: tGuestbook('formSection.placeholder'),
    emotionTitle: tGuestbook('formSection.emotionTitle'),
    emotionHint: tGuestbook('formSection.emotionHint'),
    emotionHelper: tGuestbook('formSection.emotionHelper'),
    securityTitle: tGuestbook('formSection.securityTitle'),
    securityHelper: tGuestbook('formSection.securityHelper'),
    button: tGuestbook('formSection.button'),
    buttonPending: tGuestbook('formSection.buttonPending'),
    note: tGuestbook('formSection.note'),
    status: {
      success: tGuestbook('formSection.status.success'),
      error: tGuestbook('formSection.status.error'),
    },
    validation: {
      name: tGuestbook('formSection.validation.name'),
      message: tGuestbook('formSection.validation.message'),
      emotions: tGuestbook('formSection.validation.emotions'),
      emotionLimit: tGuestbook('formSection.validation.emotionLimit'),
      turnstile: tGuestbook('formSection.validation.turnstile'),
    },
    nameLabel: tGuestbook('form.name'),
    namePlaceholder: tGuestbook('formSection.namePlaceholder'),
    messageLabel: tGuestbook('form.message'),
    triggerLabel: tGuestbook('formSection.trigger'),
  };

  const entriesText: EntriesText = {
    headerTitle: tGuestbook('title'),
    headerSubtitle: tGuestbook('description'),
    empty: tGuestbook('entries.empty'),
    fetchError: tGuestbook('entries.fetchError'),
    pagination: {
      previous: tGuestbook('entries.pagination.previous'),
      next: tGuestbook('entries.pagination.next'),
      summary: tGuestbook('entries.pagination.summary', {page: '{page}', totalPages: '{totalPages}'}),
    },
    retry: tCommon('retry'),
  };

  const localizedEmotionOptions: EmotionOption[] = emotionOptions.map((option) => ({
    ...option,
    label: tGuestbook(`emotions.${option.code}.label`),
  }));

  return {formText, entriesText, localizedEmotionOptions};
}
