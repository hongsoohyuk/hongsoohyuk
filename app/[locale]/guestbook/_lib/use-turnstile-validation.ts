'use client';

import {useState} from 'react';

export function useTurnstileValidation() {
  const [turnstileToken, setTurnstileToken] = useState('');

  const turnstileValid = turnstileToken.length > 0;

  const resetTurnstile = () => setTurnstileToken('');

  const turnstileHandlers = {
    onSuccess: (token: string) => setTurnstileToken(token),
    onExpired: resetTurnstile,
    onError: resetTurnstile,
    onTimeout: resetTurnstile,
  };

  return {turnstileToken, turnstileValid, turnstileHandlers, resetTurnstile};
}
