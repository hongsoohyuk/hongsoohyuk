'use client';

import {useTranslations} from 'next-intl';

import {Badge} from '@/components/ui/badge';

import {BASE_EMOTIONS, type EmotionCode} from '../_lib/emotion';
import {useEmotionEnum} from '../_lib/use-emotion-enum';

// URL은 상위(GuestbookShell)에서 한 번만 읽고 값으로 내려받는다.
// 여기서 useSearchParams를 부르면 프리렌더 fallback으로 쓸 수 없다.
type Props = {
  selectedEmotion: EmotionCode | null;
  onToggle?: (code: EmotionCode) => void;
  onClear?: () => void;
};

export function EmotionFilter({selectedEmotion, onToggle, onClear}: Props) {
  const t = useTranslations('Guestbook.entries');
  const {getLabel, getEmoji} = useEmotionEnum();

  return (
    <div className="relative">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" role="group" aria-label="Emotion filter">
        <Badge asChild variant={selectedEmotion === null ? 'default' : 'outline'} className="cursor-pointer text-xs">
          <button type="button" onClick={onClear} className="outline-none">
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
            <button type="button" onClick={() => onToggle?.(code)} className="outline-none">
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
