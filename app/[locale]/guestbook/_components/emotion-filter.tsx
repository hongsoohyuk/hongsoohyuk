'use client';

import {useTranslations} from 'next-intl';

import {Badge} from '@/components/ui/badge';

import {BASE_EMOTIONS} from '../_lib/emotion';
import {useEmotionEnum} from '../_lib/use-emotion-enum';
import {useGuestbookFilter} from '../_lib/use-guestbook-filter';

export function EmotionFilter() {
  const t = useTranslations('Guestbook.entries');
  const {getLabel, getEmoji} = useEmotionEnum();
  const {selectedEmotion, toggleEmotion, clearEmotion} = useGuestbookFilter();

  return (
    <div className="relative">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" role="group" aria-label="Emotion filter">
        <Badge asChild variant={selectedEmotion === null ? 'default' : 'outline'} className="cursor-pointer text-xs">
          <button type="button" onClick={clearEmotion} className="outline-none">
            {t('filterAll')}
          </button>
        </Badge>
        {BASE_EMOTIONS.map(({code}) => (
          <Badge
            key={code}
            asChild
            variant={selectedEmotion === code ? 'default' : 'outline'}
            className="cursor-pointer gap-1 text-xs"
          >
            <button type="button" onClick={() => toggleEmotion(code)} className="outline-none">
              <span>{getEmoji(code)}</span>
              <span>{getLabel(code)}</span>
            </button>
          </Badge>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
