import {expect, test} from '@playwright/test';

/**
 * Chat page E2E tests.
 *
 * IMPORTANT: The /api/chat route calls Google Gemini (paid, rate-limited 10 req/min/IP).
 * These tests intentionally avoid triggering the API:
 *  - Never click the submit button
 *  - Never press Enter in the textarea
 *  - Never click suggestion buttons (they call sendMessage directly)
 * Safe interactions: navigation, typing into the textarea (client-side state only),
 * opening the model dropdown, asserting button disabled state.
 */

test.describe('Chat Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/chat');
  });

  test('loads chat page with assistant heading and input', async ({page}) => {
    // Empty state shows the assistant heading (h1)
    await expect(page.locator('h1')).toBeVisible();

    // Page loaded successfully with a title
    await expect(page).toHaveTitle(/.+/);

    // Input textarea is visible and editable
    const textarea = page.getByPlaceholder('메시지를 입력하세요...');
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeEditable();
  });

  test('submit button is visible and disabled when input is empty', async ({page}) => {
    // Send button rendered with aria-label from i18n; do NOT click it
    const sendButton = page.getByRole('button', {name: '전송'});
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();

    // Suggestion buttons are visible in empty state (do NOT click — they call the API)
    const suggestions = page.locator('button[type="button"]').filter({hasText: /기술 스택|프로젝트|연락처|경력|노래/});
    expect(await suggestions.count()).toBeGreaterThan(0);
  });

  test('typing into textarea updates value and enables submit button', async ({page}) => {
    const textarea = page.getByPlaceholder('메시지를 입력하세요...');
    const sendButton = page.getByRole('button', {name: '전송'});

    await expect(sendButton).toBeDisabled();

    // Fill is client-side state only; safe (no API call until submit/Enter)
    await textarea.fill('Hello from Playwright');
    await expect(textarea).toHaveValue('Hello from Playwright');

    // Submit becomes enabled once input has content
    await expect(sendButton).toBeEnabled();

    // Clear the field — submit goes back to disabled
    await textarea.fill('');
    await expect(sendButton).toBeDisabled();
  });

  test('model selector dropdown opens and lists available models', async ({page}) => {
    // Default label is "Flash"; trigger button shows current model
    const modelTrigger = page.getByRole('button', {name: /Flash/}).first();
    await expect(modelTrigger).toBeVisible();

    await modelTrigger.click();

    // Dropdown menu items render the three Gemini model labels
    await expect(page.getByRole('menuitem', {name: /Flash Lite/})).toBeVisible();
    await expect(page.getByRole('menuitem', {name: /Pro/})).toBeVisible();
  });
});

test.describe('Chat Page - Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('renders chat layout on mobile viewport', async ({page}) => {
    await page.goto('/chat');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByPlaceholder('메시지를 입력하세요...')).toBeVisible();
    await expect(page.getByRole('button', {name: '전송'})).toBeVisible();
  });
});

test.describe('Chat Page - Localization', () => {
  test('English locale loads at /en/chat', async ({page}) => {
    await page.goto('/en/chat');

    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('h1')).toBeVisible();

    // English placeholder
    await expect(page.getByPlaceholder('Enter your message...')).toBeVisible();

    // Send button uses English aria-label
    await expect(page.getByRole('button', {name: 'Send'})).toBeVisible();
  });
});
