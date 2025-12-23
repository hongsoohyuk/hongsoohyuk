'use client';

import {Turnstile} from '@/shared/turnstile';
import {Button} from '@/shared/ui/button';
import {Card, CardContent} from '@/shared/ui/card';
import {Input} from '@/shared/ui/input';
import {Textarea} from '@/shared/ui/textarea';
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
import {useActionState} from 'react';
import {submit} from '../api/actions';
import {EmotionButtonGroup} from './EmotionButtonGroup';

export function GuestbookFormDialog() {
  const t = useTranslations('Guestbook');
  const [actionState, formAction, isPending] = useActionState(submit, {status: 'idle'});

  const fieldError = (field: string) =>
    actionState.status === 'error' && actionState.issues.some((issue) => issue.path.includes(field))
      ? actionState.issues.find((issue) => issue.path.includes(field))?.message
      : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>✍️ {t('formSection.trigger')}</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex h-full min-h-0 flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t('formSection.title')}</DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="guestbook-name">{t('form.name')}</Label>
                <Input
                  id="guestbook-name"
                  name="author_name"
                  maxLength={40}
                  aria-invalid={fieldError('author_name') ? 'true' : undefined}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
                  placeholder={t('formSection.namePlaceholder')}
                />
                {fieldError('author_name') && <span className="text-sm text-red-500">{fieldError('author_name')}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="guestbook-message">{t('form.message')}</Label>
                <Textarea
                  id="guestbook-message"
                  name="message"
                  maxLength={500}
                  aria-invalid={fieldError('message') ? 'true' : undefined}
                  rows={2}
                  className="border-black/20 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 sm:min-h-28"
                  placeholder={t('formSection.placeholder')}
                />
                {fieldError('message') && <span className="text-sm text-red-500">{fieldError('message')}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <Label>
                  {t('formSection.emotionTitle')}
                  <span className="text-xs text-muted-foreground"> {t('formSection.emotionHelper')}</span>
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
              {isPending ? t('formSection.buttonPending') : t('formSection.button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
