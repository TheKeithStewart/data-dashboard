# Playwright Implementation Guide - Dashboard Builder

**Project**: dashboard-builder
**Timestamp**: 20251101-220250
**Framework**: Playwright + TypeScript

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Configuration](#2-configuration)
3. [Page Object Models](#3-page-object-models)
4. [Test Fixtures](#4-test-fixtures)
5. [Helper Utilities](#5-helper-utilities)
6. [API Mocking](#6-api-mocking)
7. [Example Test Implementation](#7-example-test-implementation)
8. [Best Practices](#8-best-practices)

---

## 1. Project Setup

### 1.1 Installation

```bash
# Install Playwright and dependencies
npm install -D @playwright/test

# Install Playwright browsers
npx playwright install

# Install additional testing libraries
npm install -D axe-playwright
npm install -D @faker-js/faker
```

### 1.2 Project Structure

```
tests/
├── playwright.config.ts           # Main Playwright configuration
├── global-setup.ts                # Global setup (if needed)
├── global-teardown.ts             # Global teardown (if needed)
│
├── e2e/                           # End-to-end tests
├── integration/                   # Integration tests
├── components/                    # Component tests
├── accessibility/                 # A11y tests
├── visual/                        # Visual regression tests
│
├── fixtures/                      # Test data and fixtures
│   ├── dashboard-data.ts
│   ├── widget-data.ts
│   ├── api-mocks.ts
│   └── test-helpers.ts
│
├── page-objects/                  # Page Object Models
│   ├── BasePage.ts
│   ├── DashboardPage.ts
│   ├── WidgetCatalogPage.ts
│   └── WidgetConfigModal.ts
│
└── utils/                         # Utility functions
    ├── selectors.ts
    ├── wait-helpers.ts
    └── data-generators.ts
```

---

## 2. Configuration

### 2.1 playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // Test execution
  fullyParallel: true,
  workers: process.env.CI ? 4 : 2,
  retries: process.env.CI ? 2 : 0,

  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],

  // Global setup/teardown
  globalSetup: require.resolve('./tests/global-setup'),
  globalTeardown: require.resolve('./tests/global-teardown'),

  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Browser context options
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,

    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Permissions
    permissions: ['clipboard-read', 'clipboard-write'],
  },

  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    // Tablet viewport
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 }
      }
    }
  ],

  // Web server (for local development)
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  }
});
```

### 2.2 Test Configuration Types

```typescript
// tests/config/types.ts

export interface TestDashboard {
  id: string;
  name: string;
  widgets: TestWidget[];
  createdAt?: string;
  modifiedAt?: string;
}

export interface TestWidget {
  id: string;
  type: WidgetType;
  config: WidgetConfig;
  layout?: WidgetLayout;
  refreshInterval?: RefreshInterval;
}

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type WidgetType =
  | 'GH-01' | 'GH-02' | 'GH-03' | 'GH-04' | 'GH-05' | 'GH-06'
  | 'NPM-01' | 'NPM-02' | 'NPM-03' | 'NPM-04'
  | 'COMBO-01' | 'COMBO-02';

export type RefreshInterval = 'off' | '1min' | '5min' | '15min' | '30min' | '1hr';

export interface WidgetConfig {
  repo?: string;
  package?: string;
  period?: string;
  title?: string;
}
```

---

## 3. Page Object Models

### 3.1 Base Page

```typescript
// tests/page-objects/BasePage.ts

import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common navigation
  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageReady();
  }

  async waitForPageReady() {
    // Wait for critical elements
    await this.page.locator('[data-testid="app-header"]').waitFor();
    await this.page.locator('[data-testid="dashboard-canvas"]').waitFor();
  }

  // Common getters
  get header() {
    return this.page.locator('[data-testid="app-header"]');
  }

  get sidebar() {
    return this.page.locator('[data-testid="sidebar"]');
  }

  get canvas() {
    return this.page.locator('[data-testid="dashboard-canvas"]');
  }

  // Toast notifications
  async getToastMessage() {
    const toast = this.page.locator('[data-testid="toast-message"]');
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    return await toast.textContent();
  }

  async waitForToastDisappear() {
    await this.page.locator('[data-testid="toast-message"]').waitFor({
      state: 'hidden',
      timeout: 10000
    });
  }

  // LocalStorage helpers
  async getLocalStorageItem(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  async setLocalStorageItem(key: string, value: string) {
    await this.page.evaluate(
      ({ k, v }) => localStorage.setItem(k, v),
      { k: key, v: value }
    );
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }
}
```

### 3.2 Dashboard Page

```typescript
// tests/page-objects/DashboardPage.ts

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get dashboardSelector() {
    return this.page.locator('[data-testid="dashboard-selector"]');
  }

  get newDashboardButton() {
    return this.page.locator('[data-testid="new-dashboard-button"]');
  }

  get settingsButton() {
    return this.page.locator('[data-testid="settings-button"]');
  }

  get refreshAllButton() {
    return this.page.locator('[data-testid="refresh-all-button"]');
  }

  // Dashboard operations
  async createDashboard(name: string) {
    await this.newDashboardButton.click();

    const modal = this.page.locator('[data-testid="dashboard-create-modal"]');
    await expect(modal).toBeVisible();

    await this.page.getByLabel(/dashboard name/i).fill(name);
    await this.page.getByRole('button', { name: /create dashboard/i }).click();

    await expect(modal).not.toBeVisible();
    await expect(this.dashboardSelector).toContainText(name);
  }

  async selectDashboard(name: string) {
    await this.dashboardSelector.click();
    await this.page.getByRole('option', { name }).click();
    await expect(this.dashboardSelector).toContainText(name);
  }

  async renameDashboard(newName: string) {
    await this.settingsButton.click();
    await this.page.locator('[data-testid="rename-dashboard-button"]').click();

    const nameInput = this.page.getByLabel(/dashboard name/i);
    await nameInput.clear();
    await nameInput.fill(newName);

    await this.page.getByRole('button', { name: /save/i }).click();
    await expect(this.dashboardSelector).toContainText(newName);
  }

  async deleteDashboard() {
    await this.settingsButton.click();
    await this.page.locator('[data-testid="delete-dashboard-button"]').click();

    // Confirm deletion
    await this.page.getByRole('button', { name: /delete/i }).click();
  }

  async duplicateDashboard(newName?: string) {
    await this.settingsButton.click();
    await this.page.locator('[data-testid="duplicate-dashboard-button"]').click();

    if (newName) {
      const nameInput = this.page.getByLabel(/dashboard name/i);
      await nameInput.clear();
      await nameInput.fill(newName);
    }

    await this.page.getByRole('button', { name: /duplicate/i }).click();
  }

  // Widget operations
  getWidget(widgetId: string) {
    return this.page.locator(`[data-testid="widget-${widgetId}"]`);
  }

  getAllWidgets() {
    return this.page.locator('[data-testid^="widget-"]');
  }

  async getWidgetCount(): Promise<number> {
    return await this.getAllWidgets().count();
  }

  async refreshAllWidgets() {
    await this.refreshAllButton.click();

    // Wait for refresh to complete
    await this.page.waitForTimeout(500); // Allow refresh to start

    const widgets = await this.getAllWidgets().all();
    for (const widget of widgets) {
      await expect(widget).not.toHaveClass(/refreshing/, { timeout: 15000 });
    }
  }

  // Export/Import
  async exportDashboard(): Promise<string> {
    await this.settingsButton.click();

    const downloadPromise = this.page.waitForEvent('download');
    await this.page.locator('[data-testid="export-dashboard-button"]').click();

    const download = await downloadPromise;
    const path = await download.path();

    const fs = require('fs');
    return fs.readFileSync(path, 'utf-8');
  }

  async importDashboard(jsonData: string) {
    await this.settingsButton.click();

    const fileInput = this.page.locator('[data-testid="import-file-input"]');
    await fileInput.setInputFiles({
      name: 'dashboard.json',
      mimeType: 'application/json',
      buffer: Buffer.from(jsonData)
    });

    await this.page.getByRole('button', { name: /import/i }).click();
  }
}
```

### 3.3 Widget Catalog Page

```typescript
// tests/page-objects/WidgetCatalogPage.ts

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class WidgetCatalogPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get catalogModal() {
    return this.page.locator('[data-testid="catalog-modal"]');
  }

  get searchInput() {
    return this.page.locator('[data-testid="catalog-search-input"]');
  }

  get categoryFilter() {
    return this.page.locator('[data-testid="category-filter"]');
  }

  get closeButton() {
    return this.page.locator('[data-testid="close-modal-button"]');
  }

  // Operations
  async open() {
    await this.page.locator('[data-testid="browse-catalog-button"]').click();
    await expect(this.catalogModal).toBeVisible();
  }

  async close() {
    await this.closeButton.click();
    await expect(this.catalogModal).not.toBeVisible();
  }

  async searchWidgets(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(400); // Debounce delay
  }

  async clearSearch() {
    await this.page.locator('[data-testid="clear-search-button"]').click();
  }

  async filterByCategory(category: 'GitHub' | 'npm' | 'Combined') {
    await this.categoryFilter.click();
    await this.page.getByRole('option', { name: new RegExp(category, 'i') }).click();
  }

  async clearFilter() {
    await this.page.locator('[data-testid="clear-filter-button"]').click();
  }

  getWidgetCard(widgetType: string) {
    return this.page.locator(`[data-testid="widget-card-${widgetType}"]`);
  }

  async addWidget(widgetType: string) {
    const addButton = this.page.locator(`[data-testid="add-widget-button-${widgetType}"]`);
    await addButton.click();

    // Config modal should open
    await expect(this.page.locator('[data-testid="widget-config-modal"]')).toBeVisible();
  }

  async getWidgetCardInfo(widgetType: string) {
    const card = this.getWidgetCard(widgetType);

    return {
      name: await card.locator('[data-testid="widget-name"]').textContent(),
      description: await card.locator('[data-testid="widget-description"]').textContent(),
      type: await card.locator('[data-testid="widget-type"]').textContent()
    };
  }
}
```

### 3.4 Widget Config Modal

```typescript
// tests/page-objects/WidgetConfigModal.ts

import { Page, expect } from '@playwright/test';

export class WidgetConfigModal {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get modal() {
    return this.page.locator('[data-testid="widget-config-modal"]');
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: /cancel/i });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /add to dashboard|save changes/i });
  }

  async fillRepositoryField(repo: string) {
    await this.page.getByLabel(/repository/i).fill(repo);
  }

  async fillPackageField(packageName: string) {
    await this.page.getByLabel(/package name/i).fill(packageName);
  }

  async selectTimePeriod(period: '7d' | '30d' | '90d' | '1yr' | 'all-time') {
    await this.page.getByLabel(/time period/i).selectOption(period);
  }

  async setWidgetTitle(title: string) {
    await this.page.getByLabel(/widget title/i).fill(title);
  }

  async setRefreshInterval(interval: 'off' | '1min' | '5min' | '15min' | '30min' | '1hr') {
    await this.page.getByLabel(/refresh interval/i).selectOption(interval);
  }

  async submit() {
    await this.submitButton.click();
    await expect(this.modal).not.toBeVisible();
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.modal).not.toBeVisible();
  }

  async configureGitHubWidget(config: {
    repo: string;
    period?: string;
    title?: string;
    refreshInterval?: string;
  }) {
    await this.fillRepositoryField(config.repo);

    if (config.period) {
      await this.selectTimePeriod(config.period as any);
    }

    if (config.title) {
      await this.setWidgetTitle(config.title);
    }

    if (config.refreshInterval) {
      await this.setRefreshInterval(config.refreshInterval as any);
    }

    await this.submit();
  }

  async configureNpmWidget(config: {
    package: string;
    period?: string;
    title?: string;
    refreshInterval?: string;
  }) {
    await this.fillPackageField(config.package);

    if (config.period) {
      await this.selectTimePeriod(config.period as any);
    }

    if (config.title) {
      await this.setWidgetTitle(config.title);
    }

    if (config.refreshInterval) {
      await this.setRefreshInterval(config.refreshInterval as any);
    }

    await this.submit();
  }

  async waitForValidation() {
    await this.page.waitForTimeout(600); // Debounce delay
  }

  async getValidationError(): Promise<string | null> {
    const errorElement = this.page.locator('[role="alert"]');
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }
}
```

---

## 4. Test Fixtures

### 4.1 Custom Test Fixtures

```typescript
// tests/fixtures/test-fixtures.ts

import { test as base } from '@playwright/test';
import { DashboardPage } from '../page-objects/DashboardPage';
import { WidgetCatalogPage } from '../page-objects/WidgetCatalogPage';
import { WidgetConfigModal } from '../page-objects/WidgetConfigModal';
import { TestDashboard } from '../config/types';

type DashboardFixtures = {
  dashboardPage: DashboardPage;
  catalogPage: WidgetCatalogPage;
  configModal: WidgetConfigModal;
  setupDashboard: (dashboard: TestDashboard) => Promise<void>;
};

export const test = base.extend<DashboardFixtures>({
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  catalogPage: async ({ page }, use) => {
    const catalogPage = new WidgetCatalogPage(page);
    await use(catalogPage);
  },

  configModal: async ({ page }, use) => {
    const configModal = new WidgetConfigModal(page);
    await use(configModal);
  },

  setupDashboard: async ({ page }, use) => {
    const setup = async (dashboard: TestDashboard) => {
      await page.evaluate((data) => {
        const state = {
          dashboards: [data],
          activeDashboardId: data.id,
          userPreferences: {
            theme: 'light',
            defaultRefreshInterval: 'off',
            compactMode: false
          }
        };
        localStorage.setItem('dashboard-builder-state', JSON.stringify(state));
      }, dashboard);
    };

    await use(setup);
  }
});

export { expect } from '@playwright/test';
```

### 4.2 Test Data Fixtures

```typescript
// tests/fixtures/dashboard-data.ts

import { TestDashboard, TestWidget } from '../config/types';

export const emptyDashboard: TestDashboard = {
  id: 'test-empty-dashboard',
  name: 'Empty Test Dashboard',
  widgets: []
};

export const singleWidgetDashboard: TestDashboard = {
  id: 'test-single-widget',
  name: 'Single Widget Dashboard',
  widgets: [
    {
      id: 'widget-1',
      type: 'GH-06',
      config: { repo: 'facebook/react' },
      layout: { x: 0, y: 0, w: 2, h: 2 }
    }
  ]
};

export const complexDashboard: TestDashboard = {
  id: 'test-complex-dashboard',
  name: 'Complex Dashboard',
  widgets: [
    {
      id: 'widget-1',
      type: 'GH-01',
      config: { repo: 'facebook/react', period: '30d' },
      layout: { x: 0, y: 0, w: 4, h: 2 }
    },
    {
      id: 'widget-2',
      type: 'GH-06',
      config: { repo: 'facebook/react' },
      layout: { x: 4, y: 0, w: 2, h: 2 }
    },
    {
      id: 'widget-3',
      type: 'NPM-01',
      config: { package: 'react', period: '30d' },
      layout: { x: 6, y: 0, w: 6, h: 3 }
    },
    {
      id: 'widget-4',
      type: 'GH-03',
      config: { repo: 'facebook/react', period: '90d' },
      layout: { x: 0, y: 2, w: 4, h: 3 }
    },
    {
      id: 'widget-5',
      type: 'COMBO-01',
      config: { repo: 'facebook/react', package: 'react' },
      layout: { x: 4, y: 2, w: 8, h: 3 }
    }
  ]
};

export const TEST_REPOSITORIES = {
  popular: 'facebook/react',
  moderate: 'nodejs/node',
  archived: 'angular/angular.js'
};

export const TEST_PACKAGES = {
  popular: 'react',
  moderate: 'lodash',
  deprecated: 'request'
};
```

---

## 5. Helper Utilities

### 5.1 Wait Helpers

```typescript
// tests/utils/wait-helpers.ts

import { Page, Locator, expect } from '@playwright/test';

export async function waitForDashboardLoad(page: Page) {
  await expect(page.locator('[data-testid="dashboard-canvas"]')).toBeVisible();
  await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
}

export async function waitForWidgetData(page: Page, widgetId: string) {
  const widget = page.locator(`[data-testid="widget-${widgetId}"]`);
  await expect(widget).not.toHaveClass(/loading/);
  await expect(widget).not.toHaveClass(/error/);
}

export async function waitForAllWidgetsReady(page: Page) {
  const widgets = await page.locator('[data-testid^="widget-"]').all();

  for (const widget of widgets) {
    await expect(widget).not.toHaveClass(/loading/);
  }
}

export async function waitForModalAnimation(page: Page, modalSelector: string) {
  const modal = page.locator(modalSelector);
  await expect(modal).toBeVisible();

  // Wait for animation to complete
  await page.waitForTimeout(350); // 300ms animation + buffer
}

export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
) {
  return await page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}
```

### 5.2 Data Generators

```typescript
// tests/utils/data-generators.ts

import { faker } from '@faker-js/faker';
import { TestDashboard, TestWidget } from '../config/types';

export function generateDashboard(overrides?: Partial<TestDashboard>): TestDashboard {
  return {
    id: faker.string.uuid(),
    name: faker.company.catchPhrase(),
    widgets: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    ...overrides
  };
}

export function generateWidget(type: string, overrides?: Partial<TestWidget>): TestWidget {
  return {
    id: faker.string.uuid(),
    type: type as any,
    config: generateWidgetConfig(type),
    layout: {
      x: faker.number.int({ min: 0, max: 8 }),
      y: faker.number.int({ min: 0, max: 10 }),
      w: faker.number.int({ min: 2, max: 4 }),
      h: faker.number.int({ min: 2, max: 3 })
    },
    refreshInterval: 'off',
    ...overrides
  };
}

function generateWidgetConfig(type: string) {
  if (type.startsWith('GH-')) {
    return {
      repo: `${faker.person.firstName()}/${faker.hacker.noun()}`,
      period: '30d'
    };
  } else if (type.startsWith('NPM-')) {
    return {
      package: faker.hacker.noun().toLowerCase(),
      period: '30d'
    };
  } else {
    return {
      repo: `${faker.person.firstName()}/${faker.hacker.noun()}`,
      package: faker.hacker.noun().toLowerCase(),
      period: '30d'
    };
  }
}

export function generateMultipleWidgets(count: number, types?: string[]): TestWidget[] {
  const availableTypes = types || ['GH-01', 'GH-06', 'NPM-01', 'COMBO-01'];

  return Array(count).fill(null).map((_, i) => {
    const type = availableTypes[i % availableTypes.length];
    return generateWidget(type);
  });
}
```

---

## 6. API Mocking

### 6.1 Mock API Responses

```typescript
// tests/fixtures/api-mocks.ts

import { Page, Route } from '@playwright/test';

export async function mockGitHubAPI(page: Page, responses?: Record<string, any>) {
  await page.route('**/api/github/**', async (route: Route) => {
    const url = route.request().url();

    // Extract repo from URL
    const repoMatch = url.match(/repos\/([^/]+\/[^/]+)/);
    const repo = repoMatch ? repoMatch[1] : 'facebook/react';

    // Default response
    let responseData = {
      stargazers_count: 245000,
      forks_count: 45000,
      open_issues_count: 842,
      name: repo.split('/')[1],
      owner: { login: repo.split('/')[0] }
    };

    // Override with custom responses
    if (responses && responses[repo]) {
      responseData = { ...responseData, ...responses[repo] };
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });
}

export async function mockNpmAPI(page: Page, responses?: Record<string, any>) {
  await page.route('**/api/npm/**', async (route: Route) => {
    const url = route.request().url();

    // Extract package from URL
    const packageMatch = url.match(/\/([^/]+)$/);
    const packageName = packageMatch ? packageMatch[1] : 'react';

    // Default response
    let responseData = {
      downloads: 28500000,
      package: packageName,
      start: '2025-10-01',
      end: '2025-10-31'
    };

    // Override with custom responses
    if (responses && responses[packageName]) {
      responseData = { ...responseData, ...responses[packageName] };
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });
}

export async function mockAPIError(
  page: Page,
  urlPattern: string | RegExp,
  statusCode: number,
  errorMessage?: string
) {
  await page.route(urlPattern, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        error: errorMessage || 'An error occurred',
        status: statusCode
      })
    });
  });
}

export async function mockAPIRateLimit(page: Page, resetTime?: number) {
  await page.route('**/api/github/**', async (route: Route) => {
    await route.fulfill({
      status: 403,
      contentType: 'application/json',
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(resetTime || Date.now() + 3600000)
      },
      body: JSON.stringify({
        message: 'API rate limit exceeded',
        documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
      })
    });
  });
}

export async function mockAPIDelay(
  page: Page,
  urlPattern: string | RegExp,
  delayMs: number
) {
  await page.route(urlPattern, async (route: Route) => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await route.continue();
  });
}
```

---

## 7. Example Test Implementation

### 7.1 Complete E2E Test

```typescript
// tests/e2e/dashboard-workflow.spec.ts

import { test, expect } from '../fixtures/test-fixtures';
import { mockGitHubAPI, mockNpmAPI } from '../fixtures/api-mocks';

test.describe('Complete Dashboard Workflow', () => {
  test.beforeEach(async ({ page, dashboardPage }) => {
    // Clear state
    await page.evaluate(() => localStorage.clear());

    // Setup API mocks
    await mockGitHubAPI(page);
    await mockNpmAPI(page);

    // Navigate to app
    await dashboardPage.goto();
  });

  test('user creates dashboard and adds widgets', async ({
    page,
    dashboardPage,
    catalogPage,
    configModal
  }) => {
    // Step 1: Create new dashboard
    await dashboardPage.createDashboard('My Project Dashboard');
    await expect(dashboardPage.canvas).toContainText(/your dashboard is empty/i);

    // Step 2: Open widget catalog
    await catalogPage.open();

    // Step 3: Add GitHub Stars widget
    await catalogPage.addWidget('GH-01');
    await configModal.configureGitHubWidget({
      repo: 'facebook/react',
      period: '30d',
      title: 'React Stars Growth'
    });

    // Verify widget added
    await expect(dashboardPage.getWidget('GH-01')).toBeVisible();
    await expect(page.getByText('React Stars Growth')).toBeVisible();

    // Step 4: Add npm Downloads widget
    await catalogPage.open();
    await catalogPage.addWidget('NPM-01');
    await configModal.configureNpmWidget({
      package: 'react',
      period: '30d'
    });

    // Verify second widget added
    await expect(dashboardPage.getWidget('NPM-01')).toBeVisible();

    // Step 5: Verify both widgets loaded data
    const widgetCount = await dashboardPage.getWidgetCount();
    expect(widgetCount).toBe(2);

    // Step 6: Verify persistence
    await page.reload();
    await expect(dashboardPage.dashboardSelector).toContainText('My Project Dashboard');
    expect(await dashboardPage.getWidgetCount()).toBe(2);
  });

  test('user manages multiple dashboards', async ({ dashboardPage }) => {
    // Create first dashboard
    await dashboardPage.createDashboard('Team Dashboard');

    // Create second dashboard
    await dashboardPage.createDashboard('Personal Dashboard');

    // Switch back to first
    await dashboardPage.selectDashboard('Team Dashboard');
    await expect(dashboardPage.dashboardSelector).toContainText('Team Dashboard');

    // Rename dashboard
    await dashboardPage.renameDashboard('Main Team Dashboard');

    // Duplicate dashboard
    await dashboardPage.duplicateDashboard('Team Dashboard Copy');
    await expect(dashboardPage.dashboardSelector).toContainText('Team Dashboard Copy');

    // Verify we have 3 dashboards
    await dashboardPage.settingsButton.click();
    const dashboardItems = page.locator('[data-testid^="dashboard-list-item-"]');
    await expect(dashboardItems).toHaveCount(3);
  });
});
```

### 7.2 Integration Test Example

```typescript
// tests/integration/widget-interactions.spec.ts

import { test, expect } from '../fixtures/test-fixtures';
import { singleWidgetDashboard } from '../fixtures/dashboard-data';
import { mockGitHubAPI } from '../fixtures/api-mocks';

test.describe('Widget Interactions', () => {
  test.beforeEach(async ({ page, setupDashboard }) => {
    await mockGitHubAPI(page);
    await setupDashboard(singleWidgetDashboard);
    await page.goto('/');
  });

  test('drags widget to new position', async ({ page, dashboardPage }) => {
    const widget = dashboardPage.getWidget('widget-1');

    // Get initial position
    const initialBox = await widget.boundingBox();
    expect(initialBox).not.toBeNull();

    // Drag widget
    await widget.hover();
    await page.mouse.down();
    await page.mouse.move(initialBox!.x + 300, initialBox!.y + 200);
    await page.mouse.up();

    // Verify new position
    const newBox = await widget.boundingBox();
    expect(newBox!.x).not.toBeCloseTo(initialBox!.x, 10);
    expect(newBox!.y).not.toBeCloseTo(initialBox!.y, 10);

    // Verify persistence
    await page.reload();
    const reloadedBox = await widget.boundingBox();
    expect(reloadedBox!.x).toBeCloseTo(newBox!.x, 10);
  });

  test('resizes widget', async ({ page, dashboardPage }) => {
    const widget = dashboardPage.getWidget('widget-1');

    // Hover to show resize handle
    await widget.hover();
    const resizeHandle = page.locator('[data-testid="resize-handle-widget-1"]');
    await expect(resizeHandle).toBeVisible();

    const initialBox = await widget.boundingBox();

    // Drag resize handle
    await resizeHandle.hover();
    await page.mouse.down();
    await page.mouse.move(
      initialBox!.x + initialBox!.width + 200,
      initialBox!.y + initialBox!.height + 100
    );
    await page.mouse.up();

    // Verify size changed
    const newBox = await widget.boundingBox();
    expect(newBox!.width).toBeGreaterThan(initialBox!.width);
    expect(newBox!.height).toBeGreaterThan(initialBox!.height);
  });

  test('removes widget', async ({ page, dashboardPage }) => {
    await dashboardPage.getWidget('widget-1').hover();
    await page.locator('[data-testid="widget-remove-button-widget-1"]').click();

    // Confirm removal
    await page.getByRole('button', { name: /remove/i }).click();

    // Widget removed
    await expect(dashboardPage.getWidget('widget-1')).not.toBeVisible();

    // Empty state shown
    await expect(page.getByText(/your dashboard is empty/i)).toBeVisible();
  });
});
```

---

## 8. Best Practices

### 8.1 Test Organization

```typescript
// Good: Descriptive test names
test('creates dashboard with valid name and displays empty state', async ({ page }) => {
  // ...
});

// Bad: Vague test names
test('test1', async ({ page }) => {
  // ...
});

// Good: Arrange-Act-Assert pattern
test('displays error for invalid repository', async ({ page }) => {
  // Arrange
  await setupInvalidRepositoryMock(page);
  await dashboardPage.goto();

  // Act
  await addWidgetWithInvalidRepo();

  // Assert
  await expect(page.getByText(/repository not found/i)).toBeVisible();
});

// Good: One assertion concept per test
test('validates repository format', async ({ page }) => {
  // Test only format validation
});

test('validates repository exists via API', async ({ page }) => {
  // Test only API validation (separate test)
});
```

### 8.2 Selector Best Practices

```typescript
// Preferred: data-testid
await page.locator('[data-testid="submit-button"]').click();

// Good: Role-based selectors
await page.getByRole('button', { name: 'Submit' }).click();

// Good: Label-based selectors
await page.getByLabel('Email address').fill('user@example.com');

// Avoid: CSS class selectors
await page.locator('.btn-primary').click(); // Brittle

// Avoid: Complex selectors
await page.locator('div > div > button:nth-child(2)').click(); // Brittle
```

### 8.3 Wait Strategies

```typescript
// Good: Explicit waits with conditions
await expect(page.locator('[data-testid="widget"]')).toBeVisible();
await page.waitForResponse(response => response.url().includes('/api/data'));

// Avoid: Arbitrary timeouts
await page.waitForTimeout(5000); // Bad - can be flaky

// Good: Wait for network idle
await page.goto('/', { waitUntil: 'networkidle' });

// Good: Wait for specific state
await expect(widget).not.toHaveClass(/loading/);
```

### 8.4 Test Isolation

```typescript
// Good: Each test is independent
test.beforeEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
});

// Good: No shared mutable state
test('test A', async ({ page }) => {
  const dashboard = generateDashboard(); // Fresh data
  await setupDashboard(page, dashboard);
});

// Avoid: Tests depending on each other
test.describe.serial('dependent tests', () => {
  test('step 1', async ({ page }) => {
    // Creates state for step 2
  });

  test('step 2', async ({ page }) => {
    // Depends on step 1 - fragile
  });
});
```

### 8.5 Error Handling

```typescript
// Good: Specific error assertions
await expect(async () => {
  await someAction();
}).toThrow('Expected error message');

// Good: Screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    await page.screenshot({
      path: `test-results/failure-${testInfo.testId}.png`,
      fullPage: true
    });
  }
});

// Good: Retry with exponential backoff
async function retryWithBackoff(fn: () => Promise<void>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-01
**Output Path**: `.claude/outputs/design/agents/playwright-expert/dashboard-builder-20251101-220250/test-implementation-guide.md`
