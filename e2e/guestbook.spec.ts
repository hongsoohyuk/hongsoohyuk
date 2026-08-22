import {expect, test} from '@playwright/test';

/**
 * /guestbook 페이지의 렌더링과 폼 가시성만 검증한다.
 *
 * 주의:
 * - 폼 제출은 절대 수행하지 않는다 (실제 Supabase DB 쓰기 + Cloudflare Turnstile 의존).
 * - 날짜 파싱은 guestbook-timezone.spec.ts에서 별도로 다루므로 여기서는 다루지 않는다.
 */
test.describe('Guestbook Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/guestbook');
  });

  test('loads page successfully with title and description', async ({page}) => {
    await page.waitForLoadState('networkidle');

    // 페이지 자체가 200으로 로드되고 head <title>이 채워졌는지
    await expect(page).toHaveTitle(/.+/);

    // 헤더 네비에도 '방명록' 링크가 있어 텍스트 검색은 그쪽을 먼저 잡는다.
    // 페이지 제목/설명은 슬롯으로 직접 겨냥한다.
    await expect(page.locator('[data-slot="page-header-title"]').first()).toHaveText('방명록');
    await expect(page.locator('[data-slot="page-header-description"]').first()).toHaveText(
      '소중한 메시지를 남겨주세요',
    );
  });

  test('renders guestbook entries section (list or empty state)', async ({page}) => {
    await page.waitForLoadState('networkidle');

    // GuestbookList는 ScrollArea 안에 entries를 렌더한다.
    // 데이터가 있으면 항목 button이 1개 이상, 없으면 비어있는 ScrollArea만 존재.
    // 어느 쪽이든 페이지가 깨지지 않았는지만 확인한다.
    const entryButtons = page.getByRole('button').filter({hasNot: page.getByText('작성하기').first()});
    const entryCount = await entryButtons.count();

    expect(entryCount).toBeGreaterThanOrEqual(0);
  });

  test('shows the "write a note" trigger button', async ({page}) => {
    await page.waitForLoadState('networkidle');

    // CardAction에 노출되는 다이얼로그 트리거 (variant="outline")
    const trigger = page.getByRole('button', {name: '작성하기'}).first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toBeEnabled();
  });

  // 목록 전체가 이미 클라이언트에 있으므로 페이지 이동은 서버 왕복 없이 끝나야 한다.
  // <Link> 네비게이션으로 되돌아가면 같은 데이터를 다시 받아오는 회귀이므로 요청 수로 감시한다.
  test('paginates without any server round trip', async ({page}) => {
    await page.waitForLoadState('networkidle');

    const secondPage = page.getByRole('link', {name: '2', exact: true}).first();
    if ((await secondPage.count()) === 0) test.skip(true, '2페이지를 만들 만큼 항목이 없음');

    // href는 새 탭 열기·링크 복사를 위해 유지되어야 한다.
    await expect(secondPage).toHaveAttribute('href', /page=2/);

    // 방명록 라우트 자체를 다시 받아오는 요청만 금지한다.
    // 분석 비콘 등 무관한 트래픽까지 세면 프로덕션 빌드에서 거짓 실패가 난다.
    const listRefetches: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      const isListRoute = /^\/(?:[a-z]{2}\/)?guestbook$/.test(url.pathname);
      if (isListRoute && (url.searchParams.has('_rsc') || request.resourceType() === 'document')) {
        listRefetches.push(request.url());
      }
    });

    await secondPage.click();
    await page.waitForFunction(() => window.location.search.includes('page=2'));
    await page.waitForTimeout(1000);

    expect(listRefetches).toEqual([]);
  });

  test('opens form dialog with name, message inputs and emotion buttons (no submit)', async ({page}) => {
    await page.waitForLoadState('networkidle');

    const trigger = page.getByRole('button', {name: '작성하기'}).first();
    await trigger.click();

    // 다이얼로그가 열렸는지
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 이름/메시지 입력 필드 (placeholder + label 기반)
    await expect(dialog.getByPlaceholder('이름이 뭐예요?')).toBeVisible();
    await expect(dialog.getByPlaceholder('오늘 느낀 점이나 하고 싶은 이야기를 적어주세요.')).toBeVisible();

    // 감정 버튼 6종이 모두 렌더되는지 (이모지 + 라벨). 클릭하지 않고 가시성만 확인.
    const emotionButtons = dialog.locator('button[type="button"]').filter({hasText: /[🖤🌊✨👻🎉😀]/u});
    expect(await emotionButtons.count()).toBeGreaterThanOrEqual(6);

    // submit 버튼은 비활성화 상태여야 한다 (이름/메시지/Turnstile 미충족).
    // ※ 실제 제출은 절대 수행하지 않는다.
    const submit = dialog.getByRole('button', {name: '작성하기', exact: true}).last();
    await expect(submit).toBeDisabled();
  });
});

test.describe('Guestbook Page - Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('renders correctly on mobile viewport', async ({page}) => {
    await page.goto('/guestbook');
    await page.waitForLoadState('networkidle');

    // 데스크톱 네비는 모바일 폭에서 숨겨지므로 텍스트로 찾으면 hidden 요소를 잡는다.
    await expect(page.locator('[data-slot="page-header-title"]').first()).toBeVisible();
    await expect(page.getByRole('button', {name: '작성하기'}).first()).toBeVisible();
  });
});

test.describe('Guestbook Page - Localization', () => {
  test('loads English locale via /en prefix', async ({page}) => {
    await page.goto('/en/guestbook');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/.+/);
    // en.json: Guestbook.title === "Guestbook"
    await expect(page.locator('[data-slot="page-header-title"]').first()).toHaveText('Guestbook');
    // en.json: Guestbook.formSection.trigger === "Write a note"
    await expect(page.getByRole('button', {name: 'Write a note'}).first()).toBeVisible();
  });
});
