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
    const fieldIssue = actionState.issues.find((entry) => entry.path.includes(field));
    if (!fieldIssue) return null;

    const messageKey = fieldIssue.message;

    if (messageKey === 'Common.validation.maxLength') {
      const maxLength = MAX_LENGTHS[field] ?? 40;
      return t(messageKey, {maxLength});
    }

    return t(messageKey);
  };

  return {getFieldError};
}
