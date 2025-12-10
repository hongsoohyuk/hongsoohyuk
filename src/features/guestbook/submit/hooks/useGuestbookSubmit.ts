import {createGuestbookEntry} from '@/entities/guestbook';
import {useMutation} from '@tanstack/react-query';
import {useState} from 'react';
import {FormValues, StatusMessage} from '../model/types';

type UseGuestbookSubmitOptions = {
  onSuccess?: () => void;
  errorMessage: string;
};

export function useGuestbookSubmit({onSuccess, errorMessage}: UseGuestbookSubmitOptions) {
  const [formStatus, setFormStatus] = useState<StatusMessage>(null);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      await createGuestbookEntry({
        author_name: values.name.trim(),
        message: values.message.trim(),
        emotions: values.emotions,
        turnstile_token: values.turnstileToken,
      });
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : errorMessage;
      setFormStatus({type: 'error', message});
    },
  });

  return {
    mutation,
    formStatus,
    setFormStatus,
  };
}
