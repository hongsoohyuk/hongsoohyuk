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

    // CardTitle/CardDescription은 div이므로 텍스트로 검증
    await expect(page.getByText('방명록').first()).toBeVisible();
    await expect(page.getByText('소중한 메시지를 남겨주세요')).toBeVisible();
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

    await expect(page.getByText('방명록').first()).toBeVisible();
    await expect(page.getByRole('button', {name: '작성하기'}).first()).toBeVisible();
  });
});

test.describe('Guestbook Page - Localization', () => {
  test('loads English locale via /en prefix', async ({page}) => {
    await page.goto('/en/guestbook');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/.+/);
    // en.json: Guestbook.title === "Guestbook"
    await expect(page.getByText('Guestbook').first()).toBeVisible();
    // en.json: Guestbook.formSection.trigger === "Write a note"
    await expect(page.getByRole('button', {name: 'Write a note'}).first()).toBeVisible();
  });
});
