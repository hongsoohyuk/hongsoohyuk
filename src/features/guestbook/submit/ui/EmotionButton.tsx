'use client';

import {EmotionOption} from '@/entities/guestbook';
import {cn} from '@/shared/lib/utils';
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
      className={cn(
        'relative flex h-auto w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition backdrop-blur-md',
        'bg-white/70 border-white/60 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.35)]',
        'hover:border-blue-200/70 hover:bg-white/80',
        'dark:bg-white/5 dark:border-white/15 dark:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.6)] dark:hover:border-blue-400/30',
        disabled && 'opacity-70 pointer-events-none',
        isSelected
          ? 'border-blue-400/70 bg-white/90 text-blue-800 shadow-[0_14px_36px_-16px_rgba(59,130,246,0.55)] dark:text-blue-50'
          : 'text-foreground',
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/10 dark:via-white/5" />
      <div className="pointer-events-none absolute -left-6 top-3 h-10 w-10 rounded-full bg-blue-300/35 blur-2xl dark:bg-blue-500/20" />
      <span className="text-lg">{option.emoji}</span>
      <div className="flex flex-col text-xs">
        <span className="text-sm font-medium">{option.label}</span>
      </div>
    </Button>
  );
}
