'use client';

import {EmotionCode} from '@/entities/guestbook';
import {EmotionButtonGroup} from '@/features/guestbook/ui/EmotionButtonGroup';
import {useTurnstile} from '@/shared/turnstile';
import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea} from '@/shared/ui';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {Label} from '@/shared/ui/label';
import {useTranslations} from 'next-intl';
import {useCallback, useState} from 'react';
import {useController, useForm} from 'react-hook-form';
import {useGuestbookSubmit} from '../hooks/useGuestbookSubmit';
import {TURNSTILE_SITE_KEY} from '../lib/turnstile-constants';
import {FormValues} from '../model/types';

type Props = {
  onSubmitted?: () => void;
};

export function GuestbookFormDialog({onSubmitted}: Props) {
  const t = useTranslations('Guestbook');
  const [open, setOpen] = useState(false);
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

  // Form submission logic
  const {mutation, formStatus, setFormStatus} = useGuestbookSubmit({
    onSuccess: () => {
      setFormStatus({type: 'success', message: t('formSection.status.success')});
      reset({name: '', message: '', emotions: [], turnstileToken: ''});
      clearErrors();
      onSubmitted?.();
    },
    errorMessage: t('formSection.status.error'),
  });

  // Turnstile integration - directly using shared hook
  const handleTurnstileSuccess = useCallback(
    (token: string) => {
      setValue('turnstileToken', token, {shouldValidate: true});
      clearErrors('turnstileToken');
      setFormStatus(null);
    },
    [clearErrors, setValue, setFormStatus],
  );

  const handleTurnstileExpired = useCallback(() => {
    setValue('turnstileToken', '');
    setError('turnstileToken', {type: 'expired', message: t('formSection.validation.turnstile')});
  }, [setError, setValue, t]);

  const handleTurnstileError = useCallback(() => {
    setValue('turnstileToken', '');
    setError('turnstileToken', {type: 'manual', message: t('formSection.validation.turnstile')});
  }, [setError, setValue, t]);

  const {scriptReady, containerRef} = useTurnstile({
    sitekey: TURNSTILE_SITE_KEY || '',
    enabled: open,
    theme: 'auto',
    onSuccess: handleTurnstileSuccess,
    onExpired: handleTurnstileExpired,
    onError: handleTurnstileError,
  });

  const selectedEmotions = (emotionsField.value as EmotionCode[] | undefined) ?? [];

  const handleEmotionsChange = (next: EmotionCode[]) => {
    setFormStatus(null);
    emotionsField.onChange(next);
  };

  // Reset form when modal closes

  const onSubmit = handleSubmit((values) => {
    setFormStatus(null);
    clearErrors();
    if (!values.turnstileToken) {
      setError('turnstileToken', {type: 'required', message: t('formSection.validation.turnstile')});
      return;
    }
    mutation.mutate(values);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFormStatus(null);
          clearErrors();
          setValue('turnstileToken', '');
        }
      }}
    >
      <form onSubmit={onSubmit} className="flex h-full min-h-0 flex-col">
        <DialogTrigger asChild>
          <Button>✍️ {t('formSection.trigger')}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('formSection.title')}</DialogTitle>
          </DialogHeader>
          <Card>
            <CardHeader>
              <CardTitle>{t('formSection.subtitle')}</CardTitle>
              <CardDescription>{t('formSection.note')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="guestbook-name">{t('form.name')}</Label>
                <Input
                  maxLength={40}
                  aria-invalid={errors.name ? 'true' : undefined}
                  {...register('name', {
                    required: t('formSection.validation.name'),
                    minLength: {value: 1, message: t('formSection.validation.name')},
                    maxLength: {value: 40, message: t('formSection.validation.name')},
                  })}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
                  placeholder={t('formSection.namePlaceholder')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="guestbook-message">{t('form.message')}</Label>
                <Textarea
                  id="guestbook-message"
                  maxLength={500}
                  aria-invalid={errors.message ? 'true' : undefined}
                  {...register('message', {
                    required: t('formSection.validation.message'),
                    minLength: {value: 1, message: t('formSection.validation.message')},
                    maxLength: {value: 500, message: t('formSection.validation.message')},
                  })}
                  rows={2}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 sm:min-h-28"
                  placeholder={t('formSection.placeholder')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>
                  {t('formSection.emotionTitle')}
                  <span className="text-xs text-muted-foreground">{t('formSection.emotionHelper')}</span>
                </Label>
                <EmotionButtonGroup
                  value={selectedEmotions}
                  onChange={handleEmotionsChange}
                  onMaxSelected={() =>
                    setError('emotions', {type: 'maxLength', message: t('formSection.validation.emotionLimit')})
                  }
                  maxSelected={2}
                  disabled={mutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('formSection.securityTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={containerRef} className="min-h-16">
                {!TURNSTILE_SITE_KEY ? (
                  <span>Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable verification.</span>
                ) : !scriptReady ? (
                  <span>{t('formSection.securityHelper')}</span>
                ) : null}
              </div>
              <input type="hidden" {...register('turnstileToken', {required: t('formSection.validation.turnstile')})} />
              <p className="text-xs text-muted-foreground">{t('formSection.securityHelper')}</p>
              {errors.turnstileToken ? <p className="text-xs text-rose-500">{errors.turnstileToken.message}</p> : null}
            </CardContent>
          </Card>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('formSection.buttonPending') : t('formSection.button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
