'use client';

import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Textarea} from '@/shared/ui';
import {EmotionOption} from '@/entities/guestbook';
import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {useEmotionSelection} from '../hooks/useEmotionSelection';
import {useGuestbookSubmit} from '../hooks/useGuestbookSubmit';
import {useTurnstile} from '../hooks/useTurnstile';
import {FormCopy, FormValues} from '../model/types';
import {EmotionButton} from './EmotionButton';

type GuestbookFormDialogProps = {
  open: boolean;
  onClose: () => void;
  formCopy: FormCopy;
  emotionOptions: EmotionOption[];
  onSubmitted?: () => void;
};

const GLASS_PANEL_CLASS =
  'rounded-3xl border border-white/50 bg-white/70 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]';

const GLASS_CARD_CLASS =
  'rounded-2xl border border-white/50 bg-white/70 p-4 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.6)]';

export function GuestbookFormDialog({open, onClose, formCopy, emotionOptions, onSubmitted}: GuestbookFormDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: {errors},
  } = useForm<FormValues>({
    defaultValues: {name: '', message: '', emotions: [], turnstileToken: ''},
  });

  const selectedEmotions = watch('emotions');

  // Turnstile integration
  const {scriptReady, containerRef, siteKey} = useTurnstile({
    open,
    setValue,
    clearErrors,
    setError,
    errorMessage: formCopy.validation.turnstile,
    onStatusChange: (status) => setFormStatus(status),
  });

  // Emotion selection logic
  const {handleEmotionToggle} = useEmotionSelection({
    getValues,
    setValue,
    setError,
    clearErrors,
    validationMessages: {
      emotions: formCopy.validation.emotions,
      emotionLimit: formCopy.validation.emotionLimit,
    },
    onStatusChange: (status) => setFormStatus(status),
  });

  // Form submission logic
  const {mutation, formStatus, setFormStatus} = useGuestbookSubmit({
    onSuccess: () => {
      setFormStatus({type: 'success', message: formCopy.status.success});
      reset({name: '', message: '', emotions: [], turnstileToken: ''});
      clearErrors();
      onSubmitted?.();
      onClose();
    },
    errorMessage: formCopy.status.error,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormStatus(null);
      reset({name: '', message: '', emotions: [], turnstileToken: ''});
    }
  }, [open, reset, setFormStatus]);

  const onSubmit = handleSubmit((values) => {
    setFormStatus(null);
    clearErrors();
    if (!values.turnstileToken) {
      setError('turnstileToken', {type: 'required', message: formCopy.validation.turnstile});
      return;
    }
    mutation.mutate(values);
  });

  return (
    <Modal open={open} onClose={onClose} labelledBy="guestbook-form-title">
      <ModalHeader
        onClose={onClose}
        showCloseButton
        className="border-b border-white/40 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
      >
        <h2 id="guestbook-form-title" className="text-xl sm:text-2xl font-semibold leading-snug text-foreground">
          {formCopy.title}
        </h2>
      </ModalHeader>
      <form onSubmit={onSubmit}>
        <ModalBody className="relative space-y-5 overflow-hidden sm:space-y-6">
          <div className="pointer-events-none absolute -left-10 top-4 h-32 w-32 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/20" />
          <div className="pointer-events-none absolute right-0 top-16 h-40 w-40 rounded-full bg-purple-300/20 blur-3xl dark:bg-indigo-500/25" />
          <div className="pointer-events-none absolute left-1/4 bottom-6 h-28 w-28 rounded-full bg-white/60 blur-3xl dark:bg-white/10" />

          <div className={`${GLASS_PANEL_CLASS} space-y-4 p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">{formCopy.subtitle}</p>
                <p className="text-xs text-muted-foreground">{formCopy.note}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col space-y-2">
                <label htmlFor="guestbook-name" className="text-sm font-medium">
                  {formCopy.nameLabel}
                </label>
                <Input
                  id="guestbook-name"
                  maxLength={40}
                  aria-invalid={errors.name ? 'true' : undefined}
                  {...register('name', {
                    required: formCopy.validation.name,
                    minLength: {value: 1, message: formCopy.validation.name},
                    maxLength: {value: 40, message: formCopy.validation.name},
                  })}
                  className="border-white/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
                  placeholder={formCopy.namePlaceholder}
                />
                {errors.name ? <p className="text-xs text-rose-500">{errors.name.message}</p> : null}
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="guestbook-message" className="text-sm font-medium">
                  {formCopy.messageLabel}
                </label>
                <Textarea
                  id="guestbook-message"
                  maxLength={500}
                  aria-invalid={errors.message ? 'true' : undefined}
                  {...register('message', {
                    required: formCopy.validation.message,
                    minLength: {value: 1, message: formCopy.validation.message},
                    maxLength: {value: 500, message: formCopy.validation.message},
                  })}
                  rows={3}
                  className="sm:rows-4 border-white/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
                  placeholder={formCopy.placeholder}
                />
                {errors.message ? <p className="text-xs text-rose-500">{errors.message.message}</p> : null}
              </div>
            </div>
          </div>

          <div className={`${GLASS_CARD_CLASS} space-y-3`}>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium">{formCopy.emotionTitle}</p>
            </div>
            <p className="text-xs text-muted-foreground">{formCopy.emotionHelper}</p>
            <div className="grid grid-cols-3 gap-2">
              {emotionOptions.map((option) => (
                <EmotionButton
                  key={option.code}
                  option={option}
                  isSelected={selectedEmotions.includes(option.code)}
                  disabled={mutation.isPending}
                  onToggle={() => handleEmotionToggle(option.code)}
                />
              ))}
            </div>
            {errors.emotions ? <p className="text-xs text-rose-500">{errors.emotions.message}</p> : null}
          </div>

          <div className={`${GLASS_CARD_CLASS} space-y-2`}>
            <p className="text-sm font-medium">{formCopy.securityTitle}</p>
            <div
              ref={containerRef}
              className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-white/60 bg-white/50 px-4 py-6 text-xs text-muted-foreground backdrop-blur-md dark:border-white/20 dark:bg-white/5"
            >
              {!siteKey ? (
                <span>Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable verification.</span>
              ) : !scriptReady ? (
                <span>{formCopy.securityHelper}</span>
              ) : null}
            </div>
            <input type="hidden" {...register('turnstileToken', {required: formCopy.validation.turnstile})} />
            <p className="text-xs text-muted-foreground">{formCopy.securityHelper}</p>
            {errors.turnstileToken ? <p className="text-xs text-rose-500">{errors.turnstileToken.message}</p> : null}
          </div>

          {formStatus ? (
            <div
              className={`rounded-xl border px-3 py-2 text-sm backdrop-blur-md ${
                formStatus.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100'
                  : 'border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100'
              }`}
            >
              {formStatus.message}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="flex flex-col-reverse gap-2 border-t border-white/40 bg-white/70 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5">
          <p className="text-center text-xs text-muted-foreground sm:text-left">{formCopy.note}</p>
          <Button
            className="w-full rounded-full border border-white/60 bg-white/80 text-blue-700 backdrop-blur-md hover:bg-white sm:w-auto dark:border-white/20 dark:bg-white/10 dark:text-white"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? formCopy.buttonPending : formCopy.button}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
