import {expect, test} from '@playwright/test';

function normalizeDateString(value: string): string {
  const trimmed = value.trim();
  const withDateTimeSeparator = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  const withOffsetMinutes = withDateTimeSeparator
    .replace(/([+-]\d{2})$/, '$1:00')
    .replace(/([+-]\d{2})(\d{2})$/, '$1:$2');

  return /(?:Z|[+-]\d{2}:\d{2})$/.test(withOffsetMinutes) ? withOffsetMinutes : `${withOffsetMinutes}Z`;
}

test.describe('Guestbook timezone parsing', () => {
  test('normalizes +00 offset format consistently across browser engines', async ({page}) => {
    const rawTimestamp = '2026-05-06 13:00:00+00';
    const normalizedTimestamp = normalizeDateString(rawTimestamp);

    const parsed = await page.evaluate(
      ({raw, normalized}) => {
        const toKoreaHour = (date: Date) =>
          new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Seoul',
            hour: '2-digit',
            hour12: false,
          }).format(date);

        const rawDate = new Date(raw);
        const normalizedDate = new Date(normalized);
        const rawValid = !Number.isNaN(rawDate.getTime());

        return {
          rawIso: rawValid ? rawDate.toISOString() : null,
          normalizedIso: normalizedDate.toISOString(),
          normalizedKoreaHour: toKoreaHour(normalizedDate),
        };
      },
      {raw: rawTimestamp, normalized: normalizedTimestamp},
    );

    expect(parsed.normalizedIso).toBe('2026-05-06T13:00:00.000Z');
    expect(parsed.normalizedKoreaHour).toBe('22');
  });

  test('normalizes compact +0000 offset format consistently', async ({page}) => {
    const rawTimestamp = '2026-05-06 13:00:00+0000';
    const normalizedTimestamp = normalizeDateString(rawTimestamp);

    const normalizedIso = await page.evaluate(
      (normalized) => new Date(normalized).toISOString(),
      normalizedTimestamp,
    );
    expect(normalizedIso).toBe('2026-05-06T13:00:00.000Z');
  });
});
