import {Button} from '@/components/ui/button';
import {EmotionOption} from '@/entities/emotion';


type EmotionButtonProps = {
  option: EmotionOption;
  isSelected: boolean;
  disabled?: boolean;
  onToggle(): void;
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
          ? 'border-blue-400/50 bg-blue-500/15 text-foreground shadow-sm dark:border-blue-500/40 dark:bg-blue-500/15'
          : 'border-black/20 bg-black/10 text-foreground hover:border-blue-300/40 dark:border-white/15 dark:bg-white/10'
      }`}
    >
      <span className="text-lg">{option.emoji}</span>
      <div className="min-w-0 flex flex-col text-xs">
        <span className="truncate text-sm font-medium">{option.label}</span>
      </div>
    </Button>
  );
}
