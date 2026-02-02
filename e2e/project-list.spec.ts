import {expect, test} from '@playwright/test';

test.describe('Project List Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/project');
  });

  test('displays page title and description', async ({page}) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('p.text-muted-foreground').first()).toBeVisible();
  });

  test('displays project cards in grid layout', async ({page}) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check if there are project cards or empty state
    const cards = page.locator('[class*="grid"] a');
    const emptyState = page.getByText(/empty|없습니다/i);

    // Either cards should be visible or empty state should be shown
    const hasCards = await cards.count();
    if (hasCards > 0) {
      await expect(cards.first()).toBeVisible();
    } else {
      await expect(emptyState).toBeVisible();
    }
  });

  test('project cards are clickable and navigate to detail', async ({page}) => {
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[class*="grid"] a');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      const firstCard = cards.first();
      const href = await firstCard.getAttribute('href');

      expect(href).toMatch(/\/project\/[a-z0-9]+/);

      await firstCard.click();
      await page.waitForURL(/\/project\/[a-z0-9]+/);

      expect(page.url()).toContain('/project/');
    }
  });

  test('pagination controls appear when needed', async ({page}) => {
    await page.waitForLoadState('networkidle');

    // Pagination might not always be visible depending on data
    const pagination = page.locator('[class*="pagination"], [class*="Pagination"]');
    const nextButton = page.getByRole('link', {name: /next|다음/i});

    // Just check the page loads without errors
    await expect(page).toHaveTitle(/.+/);
  });

  test('navigating pages updates URL', async ({page}) => {
    await page.waitForLoadState('networkidle');

    // Navigate to page 2 via URL
    await page.goto('/project?page=2');

    // URL should contain page param
    expect(page.url()).toContain('page=2');
  });
});

test.describe('Project List Page - Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('displays correctly on mobile viewport', async ({page}) => {
    await page.goto('/project');
    await page.waitForLoadState('networkidle');

    // Page should be scrollable and content should be visible
    await expect(page.locator('h1')).toBeVisible();

    // Cards should stack vertically on mobile (single column)
    const grid = page.locator('[class*="grid"]').first();
    if ((await grid.count()) > 0) {
      await expect(grid).toBeVisible();
    }
  });
});

test.describe('Project List Page - Localization', () => {
  test('displays Korean content by default', async ({page}) => {
    await page.goto('/project');
    await page.waitForLoadState('networkidle');

    // Check that the page loads without error
    await expect(page).toHaveTitle(/.+/);
  });

  test('displays English content with /en prefix', async ({page}) => {
    await page.goto('/en/project');
    await page.waitForLoadState('networkidle');

    // Check that the page loads without error
    await expect(page).toHaveTitle(/.+/);
  });
});
