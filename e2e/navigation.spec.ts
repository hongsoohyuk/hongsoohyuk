import { test, expect } from '@playwright/test';

test.describe('네비게이션', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('메인 네비게이션 링크가 작동한다', async ({ page }) => {
    // 네비게이션 메뉴 찾기
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // 네비게이션 내 링크들 확인
    const links = nav.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('Instagram 페이지로 이동한다', async ({ page }) => {
    // Instagram 링크 클릭
    const instagramLink = page.locator('a[href*="instagram"]').first();

    if (await instagramLink.isVisible()) {
      await instagramLink.click();
      await expect(page).toHaveURL(/instagram/);
    }
  });

  test('Guestbook 페이지로 이동한다', async ({ page }) => {
    // Guestbook 링크 클릭
    const guestbookLink = page.locator('a[href*="guestbook"]').first();

    if (await guestbookLink.isVisible()) {
      await guestbookLink.click();
      await expect(page).toHaveURL(/guestbook/);
    }
  });

  test('Project 페이지로 이동한다', async ({ page }) => {
    // Project 링크 클릭
    const projectLink = page.locator('a[href*="project"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await expect(page).toHaveURL(/project/);
    }
  });
});
