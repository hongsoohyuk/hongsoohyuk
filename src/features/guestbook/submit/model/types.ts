import {EmotionCode, EmotionOption} from '@/entities/guestbook';

export type FormCopy = {
  title: string;
  subtitle: string;
  placeholder: string;
  namePlaceholder: string;
  emotionTitle: string;
  emotionHint: string;
  emotionHelper: string;
  securityTitle: string;
  securityHelper: string;
  button: string;
  buttonPending: string;
  note: string;
  status: {
    success: string;
    error: string;
  };
  validation: {
    name: string;
    message: string;
    emotions: string;
    emotionLimit: string;
    turnstile: string;
  };
  nameLabel: string;
  messageLabel: string;
  triggerLabel: string;
};

export type FormValues = {
  name: string;
  message: string;
  emotions: EmotionCode[];
  turnstileToken: string;
};

export type StatusMessage = {type: 'success' | 'error'; message: string} | null;

export type SubmissionCopy = FormCopy;

export type SubmissionEmotionOption = EmotionOption;
