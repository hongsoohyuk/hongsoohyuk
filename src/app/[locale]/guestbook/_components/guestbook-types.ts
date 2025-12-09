export type EmotionOption = {
  code: string;
  emoji: string;
  label: string;
};

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
  emotions: string[];
  turnstileToken: string;
};

export type EntriesCopy = {
  headerTitle: string;
  headerSubtitle: string;
  empty: string;
  fetchError: string;
  pagination: {
    previous: string;
    next: string;
    summary: string;
  };
  retry: string;
};
