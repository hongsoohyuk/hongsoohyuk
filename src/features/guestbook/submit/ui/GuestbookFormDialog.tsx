'use client';

import {EmotionCode, EmotionOption} from '@/entities/guestbook';
import {EmotionButtonGroup} from '@/features/guestbook/submit/ui/EmotionButtonGroup';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Textarea} from '@/shared/ui';
import {useEffect} from 'react';
import {useController, useForm} from 'react-hook-form';
import {useGuestbookSubmit} from '../hooks/useGuestbookSubmit';
import {useTurnstile} from '../hooks/useTurnstile';
import {FormText, FormValues} from '../model/types';

type Props = {
  open: boolean;
  onClose: () => void;
  formText: FormText;
  emotionOptions: EmotionOption[];
  onSubmitted?: () => void;
};

const GLASS_SECTION_CLASS =
  'rounded-2xl border border-black/20 bg-black/10 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.6)]';

export function GuestbookFormDialog({open, onClose, formText, emotionOptions, onSubmitted}: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: {errors},
  } = useForm<FormValues>({
    defaultValues: {name: '', message: '', emotions: [], turnstileToken: ''},
  });

  const {field: emotionsField} = useController({
    name: 'emotions',
    control,
    defaultValue: [],
  });

  // Turnstile integration
  const {scriptReady, containerRef, siteKey} = useTurnstile({
    open,
    setValue,
    clearErrors,
    setError,
    errorMessage: formText.validation.turnstile,
    onStatusChange: (status) => setFormStatus(status),
  });

  const selectedEmotions = (emotionsField.value as EmotionCode[] | undefined) ?? [];

  const handleEmotionsChange = (next: EmotionCode[]) => {
    setFormStatus(null);
    emotionsField.onChange(next);
  };

  // Form submission logic
  const {mutation, formStatus, setFormStatus} = useGuestbookSubmit({
    onSuccess: () => {
      setFormStatus({type: 'success', message: formText.status.success});
      reset({name: '', message: '', emotions: [], turnstileToken: ''});
      clearErrors();
      onSubmitted?.();
      onClose();
    },
    errorMessage: formText.status.error,
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
      setError('turnstileToken', {type: 'required', message: formText.validation.turnstile});
      return;
    }
    mutation.mutate(values);
  });

  return (
    <Modal open={open} onClose={onClose} labelledBy="guestbook-form-title">
      <ModalHeader
        onClose={onClose}
        showCloseButton
        className="border-b border-black/15 bg-background/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
      >
        <h2 id="guestbook-form-title" className="text-xl sm:text-2xl font-semibold leading-snug text-foreground">
          {formText.title}
        </h2>
      </ModalHeader>
      <form onSubmit={onSubmit} className="flex h-full min-h-0 flex-col">
        <ModalBody className="relative space-y-5 sm:space-y-6">
          <div className="pointer-events-none absolute -left-10 top-4 h-32 w-32 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/20" />
          <div className="pointer-events-none absolute right-0 top-16 h-40 w-40 rounded-full bg-purple-400/12 blur-3xl dark:bg-indigo-500/25" />
          <div className="pointer-events-none absolute left-1/4 bottom-6 h-28 w-28 rounded-full bg-black/10 blur-3xl dark:bg-white/10" />

          <div className={`${GLASS_SECTION_CLASS} space-y-4 p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">{formText.subtitle}</p>
                <p className="text-xs text-muted-foreground">{formText.note}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col space-y-2">
                <label htmlFor="guestbook-name" className="text-sm font-medium">
                  {formText.nameLabel}
                </label>
                <Input
                  id="guestbook-name"
                  maxLength={40}
                  aria-invalid={errors.name ? 'true' : undefined}
                  {...register('name', {
                    required: formText.validation.name,
                    minLength: {value: 1, message: formText.validation.name},
                    maxLength: {value: 40, message: formText.validation.name},
                  })}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
                  placeholder={formText.namePlaceholder}
                />
                {errors.name ? <p className="text-xs text-rose-500">{errors.name.message}</p> : null}
              </div>

              <div className="flex flex-col space-y-2">
                <label htmlFor="guestbook-message" className="text-sm font-medium">
                  {formText.messageLabel}
                </label>
                <Textarea
                  id="guestbook-message"
                  maxLength={500}
                  aria-invalid={errors.message ? 'true' : undefined}
                  {...register('message', {
                    required: formText.validation.message,
                    minLength: {value: 1, message: formText.validation.message},
                    maxLength: {value: 500, message: formText.validation.message},
                  })}
                  rows={3}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 sm:min-h-28"
                  placeholder={formText.placeholder}
                />
                {errors.message ? <p className="text-xs text-rose-500">{errors.message.message}</p> : null}
              </div>
            </div>
          </div>

          <div className={`${GLASS_SECTION_CLASS} space-y-3 p-4`}>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium">{formText.emotionTitle}</p>
            </div>
            <p className="text-xs text-muted-foreground">{formText.emotionHelper}</p>
            <EmotionButtonGroup
              options={emotionOptions}
              value={selectedEmotions}
              onChange={handleEmotionsChange}
              onMaxSelected={() => setError('emotions', {type: 'maxLength', message: formText.validation.emotionLimit})}
              maxSelected={2}
              disabled={mutation.isPending}
            />
          </div>

          <div className={`${GLASS_SECTION_CLASS} space-y-2 p-4`}>
            <p className="text-sm font-medium">{formText.securityTitle}</p>
            <div
              ref={containerRef}
              className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-black/25 bg-black/5 px-4 py-6 text-xs text-muted-foreground backdrop-blur-md dark:border-white/20 dark:bg-white/5"
            >
              {!siteKey ? (
                <span>Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable verification.</span>
              ) : !scriptReady ? (
                <span>{formText.securityHelper}</span>
              ) : null}
            </div>
            <input type="hidden" {...register('turnstileToken', {required: formText.validation.turnstile})} />
            <p className="text-xs text-muted-foreground">{formText.securityHelper}</p>
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
        <ModalFooter className="flex flex-col-reverse gap-2 border-t border-black/15 bg-background/70 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5">
          <p className="text-center text-xs text-muted-foreground sm:text-left">{formText.note}</p>
          <Button variant="glass" className="w-full rounded-full sm:w-auto" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? formText.buttonPending : formText.button}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
