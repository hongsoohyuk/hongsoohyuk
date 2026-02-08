'use client';

import {useFormatter} from 'next-intl';

type Props = {
  date: string | Date;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
};

export function LocalDateTime({date, dateStyle = 'medium', timeStyle}: Props) {
  const format = useFormatter();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <time dateTime={new Date(date).toISOString()} suppressHydrationWarning>
      {format.dateTime(new Date(date), {
        dateStyle,
        timeStyle,
        timeZone: userTimeZone,
      })}
    </time>
  );
}
