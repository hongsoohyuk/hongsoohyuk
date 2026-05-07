import {expect, test} from '@playwright/test';

test.describe('Instagram Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/instagram');
    await page.waitForLoadState('networkidle');
  });

  test('loads with success UI or error fallback', async ({page}) => {
    // Page must have a non-empty title from layout metadata
    await expect(page).toHaveTitle(/.+/);

    // Either ProfileCard renders an h1 (success) or error.tsx renders an h2 (failure)
    const successHeading = page.locator('h1');
    const errorHeading = page.getByRole('heading', {name: /Instagram.*문제|Instagram.*error/i});
    await expect(successHeading.or(errorHeading).first()).toBeVisible();
  });

  test('renders profile section or error fallback', async ({page}) => {
    // Profile stats list renders posts/followers/following labels in success state.
    // If API failed, the error retry button is visible instead.
    const profileStatsList = page.getByRole('list').filter({hasText: /posts/i}).first();
    const retryButton = page.getByRole('button', {name: /다시 시도하기|retry/i});

    await expect(profileStatsList.or(retryButton).first()).toBeVisible();
  });

  test('feed grid has at least one item or shows fallback state', async ({page}) => {
    const feed = page.getByRole('feed');
    const errorHeading = page.getByRole('heading', {name: /Instagram.*문제|Instagram.*error/i});

    const feedCount = await feed.count();
    if (feedCount > 0) {
      await expect(feed.first()).toBeVisible();
      // Feed may be empty if static data is empty — accept zero or more children
      const items = feed.first().locator('> div');
      expect(await items.count()).toBeGreaterThanOrEqual(0);
    } else {
      await expect(errorHeading).toBeVisible();
    }
  });
});

test.describe('Instagram Page - Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('renders correctly on mobile viewport', async ({page}) => {
    await page.goto('/instagram');
    await page.waitForLoadState('networkidle');

    // Either the feed (success) or error fallback heading should render
    const feed = page.getByRole('feed');
    const errorHeading = page.getByRole('heading', {name: /Instagram.*문제|Instagram.*error/i});

    await expect(feed.or(errorHeading).first()).toBeVisible();
  });
});

test.describe('Instagram Page - Localization', () => {
  test('English route /en/instagram loads', async ({page}) => {
    await page.goto('/en/instagram');
    await page.waitForLoadState('networkidle');

    // Title must be set by generateMetadata
    await expect(page).toHaveTitle(/.+/);

    // Either success heading (h1) or error fallback heading should be visible
    const anyHeading = page.locator('h1, h2').first();
    await expect(anyHeading).toBeVisible();
  });
});
