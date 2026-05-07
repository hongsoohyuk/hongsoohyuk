'use client';

import {useEffect, useState} from 'react';

import {useFormatter} from 'next-intl';

type Props = {
  date: string | Date;
};

export function RelativeTime({date}: Props) {
  const format = useFormatter();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const dateObj = new Date(date);
  const absoluteLabel = format.dateTime(dateObj, {dateStyle: 'medium', timeStyle: 'short'});

  return (
    <time dateTime={dateObj.toISOString()} title={absoluteLabel} suppressHydrationWarning>
      {format.relativeTime(dateObj, now)}
    </time>
  );
}
