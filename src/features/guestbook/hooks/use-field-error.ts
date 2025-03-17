'use client';

import {useTranslations} from 'next-intl';

import type {FormActionResult} from '@/types/form';

const MAX_LENGTHS: Record<string, number> = {
  author_name: 12,
  message: 40,
};

export function useFieldError(actionState: FormActionResult) {
  const t = useTranslations();

  const getFieldError = (field: string): string | null => {
    if (actionState.status !== 'error') return null;
    const issue = actionState.issues.find((issue) => issue.path.includes(field));
    if (!issue) return null;

    const messageKey = issue.message;

    if (messageKey === 'Common.validation.maxLength') {
      const maxLength = MAX_LENGTHS[field] ?? 40;
      return t(messageKey, {maxLength});
    }

    return t(messageKey);
  };

  return {getFieldError};
}
