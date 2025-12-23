import {EmotionOption} from '@/entities/guestbook';

export type Texts = {
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

export type SubmissionText = Texts;

export type SubmissionEmotionOption = EmotionOption;
