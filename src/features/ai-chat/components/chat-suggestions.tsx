'use client';

import {Bot, Briefcase, Code, Mail, Music} from 'lucide-react';
import {useTranslations} from 'next-intl';

type ChatSuggestionsProps = {
  onSuggestionClick: (text: string) => void;
};

const SUGGESTION_KEYS = [
  {key: 'techStack', icon: Code},
  {key: 'projects', icon: Briefcase},
  {key: 'contact', icon: Mail},
  {key: 'experience', icon: Briefcase},
  {key: 'music', icon: Music},
] as const;

export function ChatSuggestions({onSuggestionClick}: ChatSuggestionsProps) {
  const t = useTranslations('AiChat');

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="text-center flex items-center gap-2">
          <Bot className="size-6" />
          <h1 className="text-xl font-semibold">{t('assistant')}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t('pageDescription')}</p>
      </div>

      <div className="grid w-full max-w-lg grid-cols-2 gap-2 sm:gap-3">
        {SUGGESTION_KEYS.map(({key, icon: Icon}) => (
          <button
            key={key}
            type="button"
            onClick={() => onSuggestionClick(t(`suggestions.${key}`))}
            className="flex items-start gap-2 rounded-xl border bg-background p-3 text-left text-sm transition-colors hover:bg-muted/50 sm:p-4"
          >
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>{t(`suggestions.${key}`)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
