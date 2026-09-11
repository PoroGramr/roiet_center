import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  timeout: 45000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/login",
    reuseExistingServer: true,
    timeout: 60000,
  },
  projects: [
    {
      name: "mobile-360",
      use: {
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "mobile-390",
      use: {
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "mobile-430",
      use: {
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 430, height: 932 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "tablet",
      use: {
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "desktop",
      use: {
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "safari-390",
      use: {
        browserName: "webkit",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
