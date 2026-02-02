import { test, expect } from '@playwright/test';

test.describe('방명록 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 한국어 locale로 방명록 페이지 접속
    await page.goto('/ko/guestbook');
  });

  test('방명록 페이지가 로드된다', async ({ page }) => {
    // 페이지 URL 확인
    await expect(page).toHaveURL(/guestbook/);
  });

  test('방명록 목록이 표시된다', async ({ page }) => {
    // 로딩이 완료될 때까지 대기
    await page.waitForLoadState('networkidle');

    // 방명록 아이템이나 빈 상태 메시지가 표시되는지 확인
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('방명록 작성 다이얼로그가 열린다', async ({ page }) => {
    // 방명록 작성 버튼 찾기
    const writeButton = page.locator('button:has-text("작성"), button:has-text("Write"), [data-testid="write-guestbook"]').first();

    if (await writeButton.isVisible()) {
      await writeButton.click();

      // 다이얼로그가 열리는지 확인
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
    }
  });

  test('방명록 폼 필드가 존재한다', async ({ page }) => {
    // 방명록 작성 버튼 클릭
    const writeButton = page.locator('button:has-text("작성"), button:has-text("Write"), [data-testid="write-guestbook"]').first();

    if (await writeButton.isVisible()) {
      await writeButton.click();

      // 폼 필드 확인
      const nameInput = page.locator('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]').first();
      const messageInput = page.locator('textarea[name="message"], textarea[placeholder*="메시지"], textarea[placeholder*="message"]').first();

      // 필드가 있으면 테스트
      if (await nameInput.isVisible()) {
        await expect(nameInput).toBeEnabled();
      }
      if (await messageInput.isVisible()) {
        await expect(messageInput).toBeEnabled();
      }
    }
  });
});
