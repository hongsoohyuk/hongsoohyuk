'use client';

import {Turnstile} from '@/shared/turnstile';
import {Button} from '@/shared/ui/button';
import {Card, CardContent} from '@/shared/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {Input} from '@/shared/ui/input';
import {Label} from '@/shared/ui/label';
import {Textarea} from '@/shared/ui/textarea';
import {useTranslations} from 'next-intl';
import {useActionState, useEffect, useRef, useState} from 'react';
import {submit} from '../api/actions';
import {EmotionButtonGroup} from './EmotionButtonGroup';

export function GuestbookFormDialog() {
  const t = useTranslations();
  const [actionState, formAction, isPending] = useActionState(submit, {status: 'idle'});
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>✍️ {t('Guestbook.formSection.trigger')}</Button>
      </DialogTrigger>
      <DialogContent>
        <form ref={formRef} action={formAction} className="flex h-full min-h-0 flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t('Guestbook.formSection.title')}</DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="guestbook-name">{t('Guestbook.form.name')}</Label>
                <Input
                  id="guestbook-name"
                  name="author_name"
                  maxLength={40}
                  aria-invalid={fieldError('author_name') ? 'true' : undefined}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
                  placeholder={t('Guestbook.formSection.namePlaceholder')}
                />
                {fieldError('author_name') && <span className="text-sm text-red-500">{fieldError('author_name')}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="guestbook-message">{t('Guestbook.form.message')}</Label>
                <Textarea
                  id="guestbook-message"
                  name="message"
                  maxLength={500}
                  aria-invalid={fieldError('message') ? 'true' : undefined}
                  rows={2}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 sm:min-h-28"
                  placeholder={t('Guestbook.formSection.placeholder')}
                />
                {fieldError('message') && <span className="text-sm text-red-500">{fieldError('message')}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label>
                  {t('Guestbook.formSection.emotionTitle')}
                  <span className="text-xs text-muted-foreground"> {t('Guestbook.formSection.emotionHelper')}</span>
                </Label>
                <EmotionButtonGroup name="emotions" maxSelected={2} disabled={isPending} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Turnstile />
            </CardContent>
          </Card>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('Guestbook.formSection.buttonPending') : t('Guestbook.formSection.button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
