const ALLOWED_HOSTNAMES = new Set(['hongsoohyuk.com', 'www.hongsoohyuk.com', 'localhost', '127.0.0.1']);

function isAllowedOrigin(origin: string): boolean {
  try {
    return ALLOWED_HOSTNAMES.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !isAllowedOrigin(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|headless|lighthouse|phantomjs|puppeteer|playwright|scrapy|python-requests|wget/i;

export function isBotUserAgent(ua: string | null): boolean {
  return ua !== null && BOT_UA_PATTERN.test(ua);
}
