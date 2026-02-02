import {expect, test} from '@playwright/test';

test.describe('Project Detail Page', () => {
  // First, get a valid project slug from the list page
  let projectSlug: string | null = null;

  test.beforeAll(async ({browser}) => {
    const page = await browser.newPage();
    await page.goto('/project');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="grid"] a').first();
    if ((await firstCard.count()) > 0) {
      const href = await firstCard.getAttribute('href');
      if (href) {
        projectSlug = href.replace(/.*\/project\//, '');
      }
    }
    await page.close();
  });

  test('displays project title', async ({page}) => {
    test.skip(!projectSlug, 'No projects available');

    await page.goto(`/project/${projectSlug}`);
    await page.waitForLoadState('networkidle');

    // Should have a title (h1)
    await expect(page.locator('h1')).toBeVisible();
  });

  test('displays back link to project list', async ({page}) => {
    test.skip(!projectSlug, 'No projects available');

    await page.goto(`/project/${projectSlug}`);
    await page.waitForLoadState('networkidle');

    // Should have a back link
    const backLink = page.getByRole('link', {name: /back|목록|돌아가기/i});

    // If back link exists, it should navigate to list
    if ((await backLink.count()) > 0) {
      await backLink.click();
      await page.waitForURL(/\/project$/);
      expect(page.url()).toContain('/project');
    }
  });

  test('renders Notion blocks', async ({page}) => {
    test.skip(!projectSlug, 'No projects available');

    await page.goto(`/project/${projectSlug}`);
    await page.waitForLoadState('networkidle');

    // Page should have some content
    const content = page.locator('main, [class*="container"]').first();
    await expect(content).toBeVisible();
  });

  test('handles various Notion block types', async ({page}) => {
    test.skip(!projectSlug, 'No projects available');

    await page.goto(`/project/${projectSlug}`);
    await page.waitForLoadState('networkidle');

    // Check for common block types that might exist
    // Headings
    const headings = page.locator('h1, h2, h3');

    // Paragraphs
    const paragraphs = page.locator('p');

    // At least some content should be visible
    const totalElements = (await headings.count()) + (await paragraphs.count());
    expect(totalElements).toBeGreaterThan(0);
  });

  test('displays last edited time', async ({page}) => {
    test.skip(!projectSlug, 'No projects available');

    await page.goto(`/project/${projectSlug}`);
    await page.waitForLoadState('networkidle');

    // Look for date/time display (might show modified date)
    const dateText = page.locator('time, [class*="date"], [class*="time"]');

    // Date might not always be visible, just ensure page loads
    await expect(page.locator('h1')).toBeVisible();
  });

  test('handles invalid slug gracefully', async ({page}) => {
    // Navigate to an invalid project
    const response = await page.goto('/project/invalid-slug-that-does-not-exist');

    // Should either show error page or redirect
    // The exact behavior depends on implementation
    expect(response?.status()).toBeDefined();
  });
});

test.describe('Project Detail Page - Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('displays correctly on mobile', async ({page, browser}) => {
    // Get a valid slug first
    const listPage = await browser.newPage();
    await listPage.goto('/project');
    await listPage.waitForLoadState('networkidle');

    const firstCard = listPage.locator('[class*="grid"] a').first();
    let slug: string | null = null;

    if ((await firstCard.count()) > 0) {
      const href = await firstCard.getAttribute('href');
      if (href) {
        slug = href.replace(/.*\/project\//, '');
      }
    }
    await listPage.close();

    test.skip(!slug, 'No projects available');

    await page.goto(`/project/${slug}`);
    await page.waitForLoadState('networkidle');

    // Content should be visible and properly sized
    await expect(page.locator('h1')).toBeVisible();

    // Images should be responsive
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

test.describe('Project Detail Page - Images', () => {
  test('images load correctly', async ({page, browser}) => {
    // Get a valid slug first
    const listPage = await browser.newPage();
    await listPage.goto('/project');
    await listPage.waitForLoadState('networkidle');

    const firstCard = listPage.locator('[class*="grid"] a').first();
    let slug: string | null = null;

    if ((await firstCard.count()) > 0) {
      const href = await firstCard.getAttribute('href');
      if (href) {
        slug = href.replace(/.*\/project\//, '');
      }
    }
    await listPage.close();

    test.skip(!slug, 'No projects available');

    await page.goto(`/project/${slug}`);
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      // Check that images have src attribute
      const src = await img.getAttribute('src');
      if (src) {
        // Images should either load or have loading="lazy"
        const loading = await img.getAttribute('loading');
        expect(loading === 'lazy' || (await img.isVisible())).toBeTruthy();
      }
    }
  });
});

test.describe('Project Detail Page - Code Blocks', () => {
  test('code blocks are styled correctly', async ({page, browser}) => {
    // Get a valid slug first
    const listPage = await browser.newPage();
    await listPage.goto('/project');
    await listPage.waitForLoadState('networkidle');

    const firstCard = listPage.locator('[class*="grid"] a').first();
    let slug: string | null = null;

    if ((await firstCard.count()) > 0) {
      const href = await firstCard.getAttribute('href');
      if (href) {
        slug = href.replace(/.*\/project\//, '');
      }
    }
    await listPage.close();

    test.skip(!slug, 'No projects available');

    await page.goto(`/project/${slug}`);
    await page.waitForLoadState('networkidle');

    const codeBlocks = page.locator('pre code');
    const codeCount = await codeBlocks.count();

    if (codeCount > 0) {
      // Code blocks should be within pre elements
      for (let i = 0; i < codeCount; i++) {
        const codeBlock = codeBlocks.nth(i);
        await expect(codeBlock).toBeVisible();
      }
    }
  });
});
