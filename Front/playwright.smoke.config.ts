import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/smoke',
    timeout: 60000,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:5175',
        actionTimeout: 10000,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        launchOptions: {
            executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
        },
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile', use: { ...devices['Pixel 5'] } },
    ],
    webServer: {
        command: 'node ../scripts/start-smoke.cjs',
        url: 'http://127.0.0.1:5175/api/v1/health',
        reuseExistingServer: false,
    },
});
