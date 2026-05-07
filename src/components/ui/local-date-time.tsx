'use client';

import {useEffect, useState} from 'react';

import {useFormatter} from 'next-intl';

type Props = {
  date: string | Date;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
};

export function LocalDateTime({date, dateStyle, timeStyle}: Props) {
  const format = useFormatter();
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <time dateTime={new Date(date).toISOString()} suppressHydrationWarning>
      {format.dateTime(new Date(date), {
        dateStyle,
        timeStyle,
        ...(timeZone ? {timeZone} : {}),
      })}
    </time>
  );
}
