import {corsHeaders, isBotUserAgent} from '../http';

describe('corsHeaders', () => {
  it('hongsoohyuk.com origin에 CORS 헤더를 반환한다', () => {
    const headers = corsHeaders('https://hongsoohyuk.com');
    expect(headers['Access-Control-Allow-Origin']).toBe('https://hongsoohyuk.com');
    expect(headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
    expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type');
  });

  it('www 서브도메인과 localhost(포트 무관)를 허용한다', () => {
    expect(corsHeaders('https://www.hongsoohyuk.com')['Access-Control-Allow-Origin']).toBe(
      'https://www.hongsoohyuk.com',
    );
    expect(corsHeaders('http://localhost:3000')['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
  });

  it('허용 목록 밖 origin은 빈 객체를 반환한다', () => {
    expect(corsHeaders('https://evil.example.com')).toEqual({});
    expect(corsHeaders('https://hongsoohyuk.com.evil.com')).toEqual({});
  });

  it('origin이 없거나 URL이 아니면 빈 객체를 반환한다', () => {
    expect(corsHeaders(null)).toEqual({});
    expect(corsHeaders('not-a-url')).toEqual({});
  });
});

describe('isBotUserAgent', () => {
  it('크롤러/헤드리스 UA를 봇으로 판별한다', () => {
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 HeadlessChrome/120.0')).toBe(true);
    expect(isBotUserAgent('Chrome-Lighthouse')).toBe(true);
  });

  it('일반 브라우저와 curl은 봇이 아니다', () => {
    expect(isBotUserAgent('Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/126.0 Safari/537.36')).toBe(false);
    expect(isBotUserAgent('curl/8.6.0')).toBe(false);
    expect(isBotUserAgent(null)).toBe(false);
  });
});
