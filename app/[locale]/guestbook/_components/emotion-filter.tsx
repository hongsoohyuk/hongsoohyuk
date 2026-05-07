'use client';

import {useTranslations} from 'next-intl';

import {Badge} from '@/components/ui/badge';

import {BASE_EMOTIONS} from '../_lib/emotion';
import {useEmotionEnum} from '../_lib/use-emotion-enum';
import {useGuestbookFilter} from '../_lib/use-guestbook-filter';

const CHIP_BUTTON_CLASS = 'shrink-0 focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md outline-none';

export function EmotionFilter() {
  const t = useTranslations('Guestbook.entries');
  const {getLabel, getEmoji} = useEmotionEnum();
  const {selectedEmotion, toggleEmotion, clearEmotion} = useGuestbookFilter();

  return (
    <div className="relative">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" role="group" aria-label="Emotion filter">
        <button type="button" onClick={clearEmotion} className={CHIP_BUTTON_CLASS}>
          <Badge variant={selectedEmotion === null ? 'default' : 'outline'} className="cursor-pointer text-xs">
            {t('filterAll')}
          </Badge>
        </button>
        {BASE_EMOTIONS.map(({code}) => (
          <button key={code} type="button" onClick={() => toggleEmotion(code)} className={CHIP_BUTTON_CLASS}>
            <Badge
              variant={selectedEmotion === code ? 'default' : 'outline'}
              className="cursor-pointer gap-1 text-xs"
            >
              <span>{getEmoji(code)}</span>
              <span>{getLabel(code)}</span>
            </Badge>
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
