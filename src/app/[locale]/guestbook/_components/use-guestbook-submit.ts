import {useMutation} from '@tanstack/react-query';
import {useState} from 'react';
import {FormValues} from './guestbook-types';

type UseGuestbookSubmitOptions = {
  onSuccess?: () => void;
  errorMessage: string;
};

type FormStatus = {
  type: 'success' | 'error';
  message: string;
} | null;

export function useGuestbookSubmit({onSuccess, errorMessage}: UseGuestbookSubmitOptions) {
  const [formStatus, setFormStatus] = useState<FormStatus>(null);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          author_name: values.name.trim(),
          message: values.message.trim(),
          emotions: values.emotions,
          turnstile_token: values.turnstileToken,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        const message = payload?.error ?? errorMessage;
        throw new Error(message);
      }
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
