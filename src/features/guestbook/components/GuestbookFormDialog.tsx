'use client';

import {useActionState, useEffect, useRef, useState} from 'react';

import {useTranslations} from 'next-intl';

import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Turnstile} from '@/lib/turnstile';
import {GUESTBOOK_LAYOUT_CLASSES} from '@/config';

import {EmotionButtonGroup} from './EmotionButtonGroup';
import {submit} from '../api/actions';

export function GuestbookFormDialog() {
  const t = useTranslations();
  const [actionState, formAction, isPending] = useActionState(submit, {status: 'idle'});
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [turnstileValid, setTurnstileValid] = useState(false);

  const isFormValid = authorName.trim().length > 0 && message.trim().length > 0 && turnstileValid;

  const fieldError = (field: string) => {
    if (actionState.status !== 'error') return null;
    const issue = actionState.issues.find((issue) => issue.path.includes(field));
    if (!issue) return null;

    // Translate error message key
    const messageKey = issue.message;

    // Handle parameterized messages (e.g., maxLength)
    if (messageKey === 'Common.validation.maxLength') {
      const maxLength = field === 'author_name' ? 12 : 40;
      return t(messageKey, {maxLength});
    }

    return t(messageKey);
  };

  useEffect(() => {
    if (actionState.status === 'success') {
      setIsOpen(false);
      formRef.current?.reset();
    }
  }, [actionState.status]);

  useEffect(() => {
    formRef.current?.reset();
    setAuthorName('');
    setMessage('');
    setTurnstileValid(false);
  }, [isOpen]);

  const authorNameError = fieldError('author_name');
  const messageError = fieldError('message');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t('Guestbook.formSection.trigger')}</Button>
      </DialogTrigger>
      <DialogContent className={`${GUESTBOOK_LAYOUT_CLASSES.dialogMaxHeight} overflow-y-auto`}>
        <form ref={formRef} action={formAction} className="flex h-full min-h-0 flex-col gap-4">
          <FieldGroup>
            <FieldSet>
              <DialogHeader>
                <DialogTitle>{t('Guestbook.formSection.title')}</DialogTitle>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor="guestbook-name">{t('Guestbook.form.name')}</FieldLabel>
                <Input
                  id="guestbook-name"
                  name="author_name"
                  maxLength={40}
                  aria-invalid={authorNameError ? 'true' : undefined}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
                  placeholder={t('Guestbook.formSection.namePlaceholder')}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
                {authorNameError && <FieldError>{authorNameError}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="guestbook-message">{t('Guestbook.form.message')}</FieldLabel>
                <Textarea
                  id="guestbook-message"
                  name="message"
                  maxLength={500}
                  aria-invalid={messageError ? 'true' : undefined}
                  rows={2}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 sm:min-h-28"
                  placeholder={t('Guestbook.formSection.placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {messageError && <FieldError>{messageError}</FieldError>}
              </Field>
              <Field>
                <FieldLabel>{t('Guestbook.formSection.emotionTitle')}</FieldLabel>
                <FieldDescription>{t('Guestbook.formSection.emotionHelper')}</FieldDescription>
                <EmotionButtonGroup name="emotions" maxSelected={2} disabled={isPending} />
              </Field>
            </FieldSet>

            <FieldSeparator />
            <FieldSet>
              <Field>
                <FieldLabel>{t('Guestbook.formSection.securityTitle')}</FieldLabel>
                <FieldDescription>{t('Guestbook.formSection.securityHelper')}</FieldDescription>
                <Turnstile
                  onSuccess={() => setTurnstileValid(true)}
                  onExpired={() => setTurnstileValid(false)}
                  onError={() => setTurnstileValid(false)}
                  onTimeout={() => setTurnstileValid(false)}
                />
              </Field>
            </FieldSet>

            <DialogFooter className="flex flex-row justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending}>
                  {t('Guestbook.formSection.cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending || !isFormValid}>
                {isPending ? t('Guestbook.formSection.buttonPending') : t('Guestbook.formSection.button')}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
