import {UseFormClearErrors, UseFormGetValues, UseFormSetError, UseFormSetValue} from 'react-hook-form';
import {FormValues, StatusMessage} from '../model/types';

type UseEmotionSelectionOptions = {
  getValues: UseFormGetValues<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  setError: UseFormSetError<FormValues>;
  clearErrors: UseFormClearErrors<FormValues>;
  validationMessages: {
    emotions: string;
    emotionLimit: string;
  };
  onStatusChange?: (status: StatusMessage) => void;
};

const MAX_EMOTIONS = 2;

export function useEmotionSelection({
  getValues,
  setValue,
  setError,
  clearErrors,
  validationMessages,
  onStatusChange,
}: UseEmotionSelectionOptions) {
  const handleEmotionToggle = (code: string) => {
    onStatusChange?.(null);
    const current = getValues('emotions');

    if (current.includes(code)) {
      const next = current.filter((value) => value !== code);
      setValue('emotions', next, {shouldValidate: true});
      if (next.length === 0) {
        setError('emotions', {type: 'required', message: validationMessages.emotions});
      } else {
        clearErrors('emotions');
      }
      return;
    }

    if (current.length >= MAX_EMOTIONS) {
      setError('emotions', {type: 'maxLength', message: validationMessages.emotionLimit});
      return;
    }

    const next = [...current, code];
    setValue('emotions', next, {shouldValidate: true});
    clearErrors('emotions');
  };

  return {
    handleEmotionToggle,
  };
}
