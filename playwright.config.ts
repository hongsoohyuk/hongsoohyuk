import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 테스트 디렉토리
  testDir: './e2e',

  // 테스트 파일 패턴
  testMatch: '**/*.spec.ts',

  // 병렬 실행
  fullyParallel: true,

  // CI에서 재시도 안 함, 로컬에서는 실패 시 2번 재시도
  retries: process.env.CI ? 0 : 2,

  // 병렬 워커 수
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],

  // 전역 설정
  use: {
    // 기본 URL
    baseURL: 'http://localhost:3000',

    // 실패 시 스크린샷
    screenshot: 'only-on-failure',

    // 실패 시 비디오 녹화
    video: 'retain-on-failure',

    // 트레이스 수집
    trace: 'retain-on-failure',

    // 타임아웃
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // 테스트 타임아웃
  timeout: 30000,

  // expect 타임아웃
  expect: {
    timeout: 5000,
  },

  // 프로젝트 (브라우저별 설정)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 모바일 뷰포트 테스트
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 로컬 개발 서버 설정
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
