import { test, expect, devices } from '@playwright/test';

test.describe('반응형 디자인', () => {
  test('데스크톱에서 올바르게 렌더링된다', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // 데스크톱 네비게이션이 보이는지 확인
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('태블릿에서 올바르게 렌더링된다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // 페이지가 정상적으로 로드되는지 확인
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('모바일에서 올바르게 렌더링된다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 페이지가 정상적으로 로드되는지 확인
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // 컨텐츠가 뷰포트를 벗어나지 않는지 확인
    const bodyWidth = await body.evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});

test.describe('접근성', () => {
  test('주요 랜드마크가 존재한다', async ({ page }) => {
    await page.goto('/');

    // main 랜드마크 확인
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('이미지에 alt 텍스트가 있다', async ({ page }) => {
    await page.goto('/');

    // 모든 이미지 찾기
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // alt가 존재하거나 role="presentation" 또는 aria-hidden="true"인지 확인
      const role = await img.getAttribute('role');
      const ariaHidden = await img.getAttribute('aria-hidden');

      const hasValidAlt = alt !== null || role === 'presentation' || ariaHidden === 'true';
      expect(hasValidAlt).toBe(true);
    }
  });

  test('버튼에 접근 가능한 이름이 있다', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();

      if (isVisible) {
        // 버튼에 텍스트, aria-label, 또는 aria-labelledby가 있는지 확인
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledby = await button.getAttribute('aria-labelledby');

        const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel || ariaLabelledby;
        expect(hasAccessibleName).toBeTruthy();
      }
    }
  });
});
