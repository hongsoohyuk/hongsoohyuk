'use client';

import {EmotionOption} from '@/entities/guestbook';
import {Button} from '@/shared/ui';

type EmotionButtonProps = {
  option: EmotionOption;
  isSelected: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export function EmotionButton({option, isSelected, disabled, onToggle}: EmotionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      disabled={disabled}
      className={`flex h-auto w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
        isSelected
          ? 'border-blue-400/60 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-50'
          : 'border-border/80 bg-background text-foreground hover:border-blue-200/60'
      }`}
    >
      <span className="text-lg">{option.emoji}</span>
      <div className="flex flex-col text-xs">
        <span className="text-sm font-medium">{option.label}</span>
      </div>
    </Button>
  );
}
