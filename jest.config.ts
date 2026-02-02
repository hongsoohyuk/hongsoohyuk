import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // next.config.js와 .env 파일을 로드할 Next.js 앱의 경로
  dir: './',
});

const config: Config = {
  // 테스트 환경
  testEnvironment: 'jsdom',

  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.(spec|test).[jt]s?(x)',
    '**/*.(spec|test).[jt]s?(x)',
  ],

  // 테스트에서 제외할 경로
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/', // Playwright E2E 테스트는 제외
  ],

  // 모듈 경로 별칭 (tsconfig.json의 paths와 일치)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 각 테스트 파일 실행 전 설정
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts', // barrel exports 제외
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],

  // 커버리지 리포터
  coverageReporters: ['text', 'lcov', 'html'],

  // 커버리지 디렉토리
  coverageDirectory: 'coverage',

  // 변환 무시 패턴
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // 테스트 타임아웃 (ms)
  testTimeout: 10000,
};

export default createJestConfig(config);
