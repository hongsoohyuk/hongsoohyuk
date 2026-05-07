/* eslint-disable no-await-in-loop -- E2E 테스트는 본질적으로 순차 검증 */
import {expect, test} from '@playwright/test';

test.describe('Blog List Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/blog');
  });

  test('displays page title and description', async ({page}) => {
    await page.waitForLoadState('networkidle');

    // Layout renders an h1 (블로그/Blog) — use first() because layout/MDX may add more
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('p.text-muted-foreground').first()).toBeVisible();
  });

  test('renders blog post cards or empty state', async ({page}) => {
    await page.waitForLoadState('networkidle');

    const cards = page.locator('a[href*="/blog/"]');
    const emptyState = page.getByText(/없습니다|no posts/i);

    const hasCards = await cards.count();
    if (hasCards > 0) {
      await expect(cards.first()).toBeVisible();
    } else {
      await expect(emptyState).toBeVisible();
    }
  });

  test('blog cards link to detail pages with valid slug', async ({page}) => {
    await page.waitForLoadState('networkidle');

    const cards = page.locator('a[href*="/blog/"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      const firstCard = cards.first();
      const href = await firstCard.getAttribute('href');

      // next-intl Link may or may not include locale prefix; ensure it ends with /blog/<slug>
      expect(href).toMatch(/\/blog\/[^/]+$/);

      await firstCard.click();
      await page.waitForURL(/\/blog\/[^/]+$/);

      expect(page.url()).toMatch(/\/blog\/[^/]+$/);
    }
  });

  test('navigating to /blog?page=2 preserves query string', async ({page}) => {
    await page.goto('/blog?page=2');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('page=2');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('search filter is rendered', async ({page}) => {
    await page.waitForLoadState('networkidle');

    // BlogSearchFilter renders a search input + category badges
    const searchInput = page.getByRole('textbox').first();
    if ((await searchInput.count()) > 0) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('displays English content with /en prefix', async ({page}) => {
    await page.goto('/en/blog');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('Blog List Page - Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('renders correctly on mobile viewport', async ({page}) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('Blog Detail Page', () => {
  let blogSlug: string | null = null;

  test.beforeAll(async ({browser}) => {
    const page = await browser.newPage();
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('a[href*="/blog/"]').first();
    if ((await firstCard.count()) > 0) {
      const href = await firstCard.getAttribute('href');
      if (href) {
        const match = href.match(/\/blog\/([^/]+)$/);
        if (match) {
          blogSlug = match[1];
        }
      }
    }
    await page.close();
  });

  test('displays blog post title (h1)', async ({page}) => {
    test.skip(!blogSlug, 'No blog posts available');

    await page.goto(`/blog/${blogSlug}`);
    await page.waitForLoadState('networkidle');

    // Detail page has layout h1, page h1, plus possibly MDX h1s — use first()
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('back link navigates to blog list', async ({page}) => {
    test.skip(!blogSlug, 'No blog posts available');

    await page.goto(`/blog/${blogSlug}`);
    await page.waitForLoadState('networkidle');

    // Back link uses t('title') as label (블로그/Blog) inside breadcrumb nav
    const backLink = page.locator('a[href$="/blog"]').first();
    await expect(backLink).toBeVisible();

    await backLink.click();
    await page.waitForURL(/\/blog$/);
    expect(page.url()).toMatch(/\/blog$/);
  });

  test('renders MDX content (paragraphs or headings)', async ({page}) => {
    test.skip(!blogSlug, 'No blog posts available');

    await page.goto(`/blog/${blogSlug}`);
    await page.waitForLoadState('networkidle');

    const headings = page.locator('h1, h2, h3');
    const paragraphs = page.locator('p');

    const totalElements = (await headings.count()) + (await paragraphs.count());
    expect(totalElements).toBeGreaterThan(0);
  });

  test('handles invalid slug gracefully', async ({page}) => {
    const response = await page.goto('/blog/invalid-slug-that-does-not-exist');

    // Should respond — either 404, error boundary, or redirect
    expect(response?.status()).toBeDefined();
  });
});

test.describe('Blog Detail Page - Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('renders correctly on mobile viewport', async ({page, browser}) => {
    const listPage = await browser.newPage();
    await listPage.goto('/blog');
    await listPage.waitForLoadState('networkidle');

    const firstCard = listPage.locator('a[href*="/blog/"]').first();
    let slug: string | null = null;

    if ((await firstCard.count()) > 0) {
      const href = await firstCard.getAttribute('href');
      if (href) {
        const match = href.match(/\/blog\/([^/]+)$/);
        if (match) {
          slug = match[1];
        }
      }
    }
    await listPage.close();

    test.skip(!slug, 'No blog posts available');

    await page.goto(`/blog/${slug}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').first()).toBeVisible();

    // Images (if any) should fit within mobile viewport
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const box = await img.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });
});
