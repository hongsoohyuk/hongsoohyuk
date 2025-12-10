import {EmotionOption} from '@/entities/guestbook';
import {FormCopy} from '@/features/guestbook/submit';

export type EntriesCopy = {
  headerTitle: string;
  headerSubtitle: string;
  empty: string;
  fetchError: string;
  pagination: {
    previous: string;
    next: string;
    summary: string;
  };
  retry: string;
};

export type GuestbookWidgetProps = {
  locale: string;
  entriesCopy: EntriesCopy;
  formCopy: FormCopy;
  emotionOptions: EmotionOption[];
};
