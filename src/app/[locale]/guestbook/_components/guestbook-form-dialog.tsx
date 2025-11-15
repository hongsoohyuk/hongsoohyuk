'use client';

import {Badge, Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Textarea} from '@/component/ui';
import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {EmotionButton} from './emotion-button';
import {EmotionOption, FormCopy, FormValues} from './guestbook-types';
import {useEmotionSelection} from './use-emotion-selection';
import {useGuestbookSubmit} from './use-guestbook-submit';
import {useTurnstile} from './use-turnstile';

type GuestbookFormDialogProps = {
  open: boolean;
  onClose: () => void;
  formCopy: FormCopy;
  emotionOptions: EmotionOption[];
  onSubmitted?: () => void;
};

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
  }, [open, reset]);

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
      <ModalHeader onClose={onClose} showCloseButton>
        <h2 id="guestbook-form-title" className="text-xl sm:text-2xl font-semibold leading-snug text-foreground">
          {formCopy.title}asdasd
        </h2>
      </ModalHeader>
      <form onSubmit={onSubmit}>
        <ModalBody className="space-y-4 sm:space-y-6">
          {/* Name Input */}
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
              placeholder="Hong Soo Hyuk"
            />
            {errors.name ? <p className="text-xs text-rose-500">{errors.name.message}</p> : null}
          </div>

          {/* Message Textarea */}
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
              className="sm:rows-4"
              placeholder={formCopy.placeholder}
            />
            {errors.message ? <p className="text-xs text-rose-500">{errors.message.message}</p> : null}
          </div>

          {/* Emotion Selection */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium">{formCopy.emotionTitle}</p>
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                {formCopy.emotionHint}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{formCopy.emotionHelper}</p>
            <div className="grid grid-cols-2 gap-2">
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

          {/* Turnstile Security Widget */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{formCopy.securityTitle}</p>
            <div
              ref={containerRef}
              className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 px-4 py-6 text-xs text-muted-foreground"
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

          {/* Status Message */}
          {formStatus ? (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                formStatus.type === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100'
                  : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100'
              }`}
            >
              {formStatus.message}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-muted-foreground sm:text-left">{formCopy.note}</p>
          <Button className="w-full sm:w-auto" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? formCopy.buttonPending : formCopy.button}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
