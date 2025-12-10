import {EmotionCode, EmotionOption} from '@/entities/guestbook';
import {cn} from '@/shared/lib/utils';
import {EmotionButton} from './EmotionButton';

type Props = {
  options: EmotionOption[];
  value: EmotionCode[];
  onChange: (next: EmotionCode[]) => void;
  onMaxSelected?: (current: EmotionCode[]) => void;
  maxSelected?: number;
  disabled?: boolean;
  className?: string;
};

export function EmotionButtonGroup({options, value, onChange, onMaxSelected, maxSelected, disabled, className}: Props) {
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
    <div className={cn('grid grid-cols-3 gap-2', className)}>
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
