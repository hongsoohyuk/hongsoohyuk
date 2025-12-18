import {BASE_EMOTIONS, EMOTION_LABEL_KEYS, EmotionCode, EmotionOption} from '@/entities/guestbook';
import {useTranslations} from 'next-intl';
import {useMemo} from 'react';
import {EmotionButton} from './EmotionButton';

type Props = {
  value: EmotionCode[];
  onChange: (next: EmotionCode[]) => void;
  onMaxSelected?: (current: EmotionCode[]) => void;
  maxSelected?: number;
  disabled?: boolean;
};

export function EmotionButtonGroup({value, onChange, onMaxSelected, maxSelected, disabled}: Props) {
  const tGuestbook = useTranslations('Guestbook');
  const options = useMemo<EmotionOption[]>(
    () =>
      BASE_EMOTIONS.map((emotion) => ({
        ...emotion,
        label: tGuestbook(EMOTION_LABEL_KEYS[emotion.code]),
      })),
    [tGuestbook],
  );

  const handleToggle = (code: EmotionCode) => {
    if (disabled) return;
    const current = value ?? [];
    const isSelected = current.includes(code);

    if (isSelected) {
      const next = current.filter((item) => item !== code);
      onChange(next);
      return;
    }

    if (maxSelected && current.length >= maxSelected) {
      onMaxSelected?.(current);
      return;
    }

    const next = [...current, code];
    onChange(next);
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <EmotionButton
          key={option.code}
          option={option}
          isSelected={value?.includes(option.code) ?? false}
          disabled={disabled}
          onToggle={() => handleToggle(option.code)}
        />
      ))}
    </div>
  );
}
