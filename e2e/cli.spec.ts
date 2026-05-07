import {expect, test} from '@playwright/test';

test.describe('CLI Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/cli');
    await page.waitForLoadState('networkidle');
  });

  test('terminal UI loads with welcome message and focusable input', async ({page}) => {
    // Welcome banner from terminal-store.ts
    await expect(page.getByText('Welcome to hongsoohyuk.com')).toBeVisible();
    await expect(page.getByText('Type "help" for available commands.')).toBeVisible();

    // Terminal input is the only textbox in the page (aria-label="Terminal input")
    const input = page.getByRole('textbox', {name: 'Terminal input'});
    await expect(input).toBeVisible();
    await expect(input).toBeEditable();

    // Input should auto-focus on mount
    await expect(input).toBeFocused();
  });

  test('typing "help" prints the available commands list', async ({page}) => {
    const input = page.getByRole('textbox', {name: 'Terminal input'});
    await input.click();
    await page.keyboard.type('help');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Available commands:')).toBeVisible();
    // A few command descriptions from commands.ts help text
    await expect(page.getByText('현재 경로 출력').first()).toBeVisible();
    await expect(page.getByText('이 도움말').first()).toBeVisible();
  });

  test('"pwd" prints the current working directory', async ({page}) => {
    const input = page.getByRole('textbox', {name: 'Terminal input'});
    await input.click();
    await page.keyboard.type('pwd');
    await page.keyboard.press('Enter');

    // Default cwd is "~" — render it inside the scrollable terminal output area
    const terminal = page.getByRole('application', {name: 'Terminal'});
    await expect(terminal.getByText('~', {exact: true}).first()).toBeVisible();
  });

  test('"whoami" prints the site introduction', async ({page}) => {
    const input = page.getByRole('textbox', {name: 'Terminal input'});
    await input.click();
    await page.keyboard.type('whoami');
    await page.keyboard.press('Enter');

    await expect(
      page.getByText('hongsoohyuk.com - 프론트엔드 개발자 홍수혁의 포트폴리오'),
    ).toBeVisible();
  });

  test('an unknown command shows a "command not found" error', async ({page}) => {
    const input = page.getByRole('textbox', {name: 'Terminal input'});
    await input.click();
    await page.keyboard.type('nonexistentcmd');
    await page.keyboard.press('Enter');

    await expect(page.getByText(/command not found/i)).toBeVisible();
  });

  test('ArrowUp recalls the previous command from history', async ({page}) => {
    const input = page.getByRole('textbox', {name: 'Terminal input'});
    await input.click();

    await page.keyboard.type('pwd');
    await page.keyboard.press('Enter');

    // Now press ArrowUp — input should fill with the last command
    await page.keyboard.press('ArrowUp');
    await expect(input).toHaveValue('pwd');
  });
});

test.describe('CLI Page - Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('renders terminal on mobile viewport', async ({page}) => {
    await page.goto('/cli');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Welcome to hongsoohyuk.com')).toBeVisible();
    await expect(page.getByRole('textbox', {name: 'Terminal input'})).toBeVisible();
  });
});

test.describe('CLI Page - Localization', () => {
  test('English route /en/cli loads the terminal', async ({page}) => {
    await page.goto('/en/cli');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/.+/);
    await expect(page.getByText('Welcome to hongsoohyuk.com')).toBeVisible();
    await expect(page.getByRole('textbox', {name: 'Terminal input'})).toBeVisible();
  });
});
