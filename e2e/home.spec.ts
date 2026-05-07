import {expect, test} from '@playwright/test';

const SECTION_HREFS = ['/guestbook', '/project', '/instagram', '/blog', '/cli', '/chat'] as const;

test.describe('Home Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
  });

  test('loads with a meaningful title and visible content', async ({page}) => {
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('main, body').first()).toBeVisible();
  });

  test('renders hero text and contact description', async ({page}) => {
    // ScrollVelocity renders the literal text "hongsoohyuk" (locale-independent).
    await expect(page.getByText('hongsoohyuk').first()).toBeVisible();

    // Contact heading text is translated; assert presence via role.
    const contactHeading = page.getByRole('heading', {level: 2}).first();
    await expect(contactHeading).toBeVisible();
  });

  test('renders all section navigation cards with correct hrefs', async ({page}) => {
    for (const href of SECTION_HREFS) {
      const link = page.locator(`a[href$="${href}"]`).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', new RegExp(`${href}$`));
    }
  });

  test('renders external contact links (email, github, linkedin)', async ({page}) => {
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
    await expect(page.locator('a[href*="github.com/hongsoohyuk"]').first()).toBeVisible();
    await expect(page.locator('a[href*="linkedin.com"]').first()).toBeVisible();
  });

  test('navigates to project page when project card is clicked', async ({page}) => {
    const projectLink = page.locator('a[href$="/project"]').first();
    await projectLink.click();
    await page.waitForURL(/\/project$/);
    expect(page.url()).toMatch(/\/project$/);
  });
});

test.describe('Home Page - Mobile', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('renders correctly on mobile viewport', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // All section cards should remain present on mobile.
    for (const href of SECTION_HREFS) {
      await expect(page.locator(`a[href$="${href}"]`).first()).toBeVisible();
    }
  });
});

test.describe('Home Page - Localization', () => {
  test('loads Korean root (/) without prefix', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  });

  test('loads English root (/en) with prefix', async ({page}) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // English section links should be prefixed with /en.
    await expect(page.locator('a[href$="/en/project"]').first()).toBeVisible();
  });
});
