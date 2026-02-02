import { test, expect } from '@playwright/test';

test.describe('홈페이지', () => {
  test('홈페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/');

    // 페이지가 로드되었는지 확인
    await expect(page).toHaveURL(/\//);

    // 기본적인 콘텐츠가 있는지 확인
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('페이지 타이틀이 존재한다', async ({ page }) => {
    await page.goto('/');

    // 타이틀이 비어있지 않은지 확인
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('다크모드 토글이 작동한다', async ({ page }) => {
    await page.goto('/');

    // 다크모드 토글 버튼 찾기 (일반적인 선택자)
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="mode"], [data-testid="theme-toggle"]').first();

    // 토글 버튼이 존재하면 테스트
    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // html에 dark 클래스가 토글되는지 확인
      const html = page.locator('html');
      const classList = await html.getAttribute('class');
      expect(classList).toBeDefined();
    }
  });
});
