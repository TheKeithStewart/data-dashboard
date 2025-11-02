# Playwright Testing Strategy - Dashboard Builder

**Project**: dashboard-builder
**Timestamp**: 20251101-220250
**Framework**: Playwright + TypeScript
**Technology Stack**: Next.js 15 + React 19 + TypeScript 5
**Design System**: Salt Design System
**Layout Engine**: react-grid-layout

---

## Executive Summary

This testing strategy provides a comprehensive approach to validating the Dashboard Builder application using Playwright. The strategy enables Test-Driven Development (TDD) workflows with progressive test complexity, ensuring production-ready quality through automated E2E, integration, and accessibility testing.

**Coverage Goal**: 90%+ of user-facing functionality
**Test Execution**: Parallel across Chrome, Firefox, Safari
**CI/CD**: GitHub Actions with test result reporting

---

## 1. Test Pyramid Architecture

### 1.1 Test Distribution

```
                    ┌──────────┐
                    │   E2E    │  20% - Critical user journeys
                    │  Tests   │       Complete workflows
                    └──────────┘
                 ┌──────────────┐
                 │ Integration  │  30% - Component integration
                 │    Tests     │       API interactions
                 └──────────────┘       Widget lifecycle
              ┌──────────────────┐
              │   Component      │  50% - UI components
              │     Tests        │       User interactions
              └──────────────────┘       State management
```

### 1.2 Test Categories

**Baseline Tests (5%)**
- Application loads successfully
- Critical routes accessible
- No console errors on startup
- Salt DS components render

**Component Tests (50%)**
- Individual widget rendering
- Form validation and submission
- Modal open/close behaviors
- Drag-and-drop interactions
- Resize operations
- Button states and interactions
- Input field behaviors

**Integration Tests (30%)**
- Widget catalog browsing and filtering
- Widget configuration workflows
- Dashboard CRUD operations
- Data fetching and caching
- Error handling and retry logic
- Toast notifications

**End-to-End Tests (15%)**
- First-time user onboarding
- Complete dashboard creation flow
- Multi-widget dashboard setup
- Dashboard switching workflow
- Data refresh scenarios
- Configuration persistence

---

## 2. TDD Workflow Integration

### 2.1 Progressive Testing Phases

**Phase 1: Baseline Tests (Red Phase)**
```typescript
// Week 1: Foundation validation
- Application shell renders
- Navigation components present
- No critical errors
- Routes accessible
```

**Phase 2: Component Scaffolding Tests (Red Phase)**
```typescript
// Week 2: UI structure validation
- Dashboard canvas visible
- Sidebar sections present
- Widget catalog modal opens
- Configuration forms render
- Empty states display
```

**Phase 3: Feature Tests (Red-Green-Verify Cycles)**
```typescript
// Weeks 3-6: Feature-by-feature implementation
Iteration 1: Dashboard CRUD
  - Create dashboard
  - Rename dashboard
  - Delete dashboard
  - Switch dashboards

Iteration 2: Widget Catalog
  - Browse widgets by category
  - Search widget catalog
  - Filter widgets
  - View widget details

Iteration 3: Widget Addition
  - Add widget to dashboard
  - Configure widget parameters
  - Validate configuration
  - Widget appears on canvas

Iteration 4: Widget Interactions
  - Drag widget to new position
  - Resize widget dimensions
  - Edit widget configuration
  - Remove widget from dashboard

Iteration 5: Data Integration
  - Fetch GitHub API data
  - Fetch npm API data
  - Handle loading states
  - Display error states
  - Implement caching

Iteration 6: Persistence
  - Save dashboard configuration
  - Restore dashboard on reload
  - Export configuration
  - Import configuration
```

**Phase 4: Integration Tests (Complete Workflows)**
```typescript
// Week 7: End-to-end validation
- Complete first-time user journey
- Multi-dashboard management
- Complex widget configurations
- Error recovery scenarios
```

### 2.2 Test Execution Order for TDD

```
1. Write test (Red)
   └─ Define expected behavior
   └─ Test fails (no implementation)

2. Implement minimum code (Green)
   └─ Make test pass
   └─ No optimization yet

3. Verify and refactor
   └─ Run all tests
   └─ Refactor implementation
   └─ Tests still pass

4. User approval
   └─ Demo functionality
   └─ Gather feedback
   └─ Adjust tests if needed

5. Next iteration
   └─ Move to next feature
   └─ Repeat cycle
```

---

## 3. Test Organization Structure

### 3.1 Directory Structure

```
tests/
├── e2e/                           # End-to-end user flows
│   ├── onboarding.spec.ts
│   ├── dashboard-workflows.spec.ts
│   ├── widget-workflows.spec.ts
│   └── data-refresh.spec.ts
│
├── integration/                   # Integration tests
│   ├── dashboard-operations.spec.ts
│   ├── widget-catalog.spec.ts
│   ├── widget-configuration.spec.ts
│   ├── widget-interactions.spec.ts
│   ├── api-integration.spec.ts
│   └── persistence.spec.ts
│
├── components/                    # Component-level tests
│   ├── header.spec.ts
│   ├── sidebar.spec.ts
│   ├── dashboard-canvas.spec.ts
│   ├── widget-card.spec.ts
│   ├── modals.spec.ts
│   └── forms.spec.ts
│
├── accessibility/                 # A11y tests
│   ├── keyboard-navigation.spec.ts
│   ├── screen-reader.spec.ts
│   └── wcag-compliance.spec.ts
│
├── visual/                        # Visual regression
│   ├── dashboard-layouts.spec.ts
│   ├── widget-states.spec.ts
│   └── responsive-breakpoints.spec.ts
│
├── fixtures/                      # Test data and setup
│   ├── dashboard-data.ts
│   ├── widget-data.ts
│   ├── api-mocks.ts
│   └── test-helpers.ts
│
└── page-objects/                  # Page Object Models
    ├── DashboardPage.ts
    ├── WidgetCatalogPage.ts
    ├── WidgetConfigModal.ts
    └── BasePage.ts
```

### 3.2 Test File Naming Convention

```
<feature>.<type>.spec.ts

Examples:
- dashboard-creation.integration.spec.ts
- widget-drag-drop.component.spec.ts
- onboarding-flow.e2e.spec.ts
- keyboard-navigation.a11y.spec.ts
```

---

## 4. Selector Strategy

### 4.1 Preferred Selector Hierarchy

**Priority 1: data-testid (Recommended)**
```typescript
// Stable, semantic, purpose-built for testing
await page.locator('[data-testid="dashboard-selector"]').click();
await page.locator('[data-testid="add-widget-button"]').click();
await page.locator('[data-testid="widget-GH-01"]').hover();
```

**Priority 2: Accessible Roles (Salt DS Components)**
```typescript
// Semantic HTML roles for accessibility
await page.getByRole('button', { name: 'Add to Dashboard' }).click();
await page.getByRole('heading', { name: 'Widget Catalog' }).isVisible();
await page.getByRole('textbox', { name: 'Repository' }).fill('facebook/react');
```

**Priority 3: Labels**
```typescript
// Form fields with labels
await page.getByLabel('Dashboard Name').fill('My Dashboard');
await page.getByLabel('Time Period').selectOption('Last 30 days');
```

**Priority 4: Text Content**
```typescript
// For links and buttons with text
await page.getByText('Browse Widget Catalog').click();
await page.getByText('Create Dashboard').click();
```

**Avoid:**
- CSS class selectors (`.btn-primary`, `.widget-card`)
- Complex CSS combinators
- XPath selectors
- Element position-based selectors

### 4.2 data-testid Naming Convention

```
Format: <component>-<element>[-<variant>]

Dashboard Components:
- dashboard-selector
- dashboard-list-item-{id}
- new-dashboard-button
- delete-dashboard-button-{id}

Widget Components:
- widget-{type}-{instanceId}
- widget-header-{instanceId}
- widget-config-button-{instanceId}
- widget-remove-button-{instanceId}
- widget-refresh-button-{instanceId}

Catalog Components:
- catalog-modal
- catalog-search-input
- catalog-category-{category}
- widget-card-{widgetType}
- add-widget-button-{widgetType}

Form Components:
- config-form
- config-field-{fieldName}
- config-submit-button
- config-cancel-button

Layout Components:
- dashboard-canvas
- grid-layout-container
- sidebar
- header
```

---

## 5. Wait Strategies

### 5.1 Explicit Waits (Recommended)

```typescript
// Wait for specific condition
await expect(page.locator('[data-testid="widget-GH-01"]')).toBeVisible();

// Wait for network response
await page.waitForResponse(response =>
  response.url().includes('/api/github/repos') && response.status() === 200
);

// Wait for state change
await expect(page.locator('[data-testid="widget-GH-01"]'))
  .not.toHaveClass(/loading/);

// Wait for element count
await expect(page.locator('[data-testid^="widget-"]'))
  .toHaveCount(3);
```

### 5.2 Auto-Waiting Features

Playwright auto-waits before actions:
- Element is visible
- Element is stable (not animating)
- Element receives events (not obscured)
- Element is enabled

```typescript
// No explicit wait needed - Playwright handles it
await page.locator('[data-testid="submit-button"]').click();
```

### 5.3 Custom Wait Utilities

```typescript
// Wait for dashboard to load
async function waitForDashboardLoad(page: Page) {
  await expect(page.locator('[data-testid="dashboard-canvas"]')).toBeVisible();
  await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
}

// Wait for widget data to load
async function waitForWidgetData(page: Page, widgetId: string) {
  await expect(page.locator(`[data-testid="widget-${widgetId}"]`))
    .not.toHaveClass(/loading/);
  await expect(page.locator(`[data-testid="widget-${widgetId}"]`))
    .not.toHaveClass(/error/);
}

// Wait for API rate limit recovery
async function waitForRateLimitRecovery(page: Page) {
  await expect(page.getByText(/rate limit/i)).not.toBeVisible({ timeout: 60000 });
}
```

---

## 6. Test Data Management

### 6.1 Test Data Strategy

**Mock API Responses**
```typescript
// Mock GitHub API
await page.route('**/api/github/**', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(githubMockData)
  });
});

// Mock npm API
await page.route('**/api/npm/**', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(npmMockData)
  });
});
```

**Test Repositories and Packages**
```typescript
// Use real, stable repositories for integration tests
const TEST_REPOS = {
  stable: 'facebook/react',      // High star count, active
  moderate: 'nodejs/node',        // Well-maintained
  archived: 'angular/angular.js'  // Archived state
};

const TEST_PACKAGES = {
  popular: 'react',               // High download count
  moderate: 'lodash',             // Stable downloads
  deprecated: 'request'           // Deprecated package
};
```

**Dashboard Test Data**
```typescript
// Fixture dashboards
const TEST_DASHBOARDS = {
  empty: {
    id: 'test-empty-dashboard',
    name: 'Empty Test Dashboard',
    widgets: []
  },

  singleWidget: {
    id: 'test-single-widget',
    name: 'Single Widget Dashboard',
    widgets: [
      { type: 'GH-06', config: { repo: 'facebook/react' } }
    ]
  },

  complex: {
    id: 'test-complex-dashboard',
    name: 'Complex Dashboard',
    widgets: [
      { type: 'GH-01', config: { repo: 'facebook/react', period: '30d' } },
      { type: 'NPM-01', config: { package: 'react', period: '30d' } },
      { type: 'COMBO-01', config: { repo: 'facebook/react', package: 'react' } }
    ]
  }
};
```

### 6.2 LocalStorage Fixtures

```typescript
// Setup dashboard state before test
async function setupDashboardState(page: Page, dashboards: Dashboard[]) {
  await page.evaluate((data) => {
    localStorage.setItem('dashboard-builder-state', JSON.stringify({
      dashboards: data.dashboards,
      activeDashboardId: data.dashboards[0]?.id || null,
      userPreferences: {
        theme: 'light',
        defaultRefreshInterval: 'off',
        compactMode: false
      }
    }));
  }, { dashboards });
}

// Clear state before test
async function clearDashboardState(page: Page) {
  await page.evaluate(() => localStorage.clear());
}
```

---

## 7. Parallel Execution Strategy

### 7.1 Test Parallelization

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 4 : 2,
  fullyParallel: true,

  // Retry failed tests
  retries: process.env.CI ? 2 : 0,

  // Project-level parallelization
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
    }
  ]
});
```

### 7.2 Test Isolation

```typescript
// Each test is fully isolated
test.beforeEach(async ({ page }) => {
  // Clear state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Navigate to fresh page
  await page.goto('/');

  // Wait for application ready
  await expect(page.locator('[data-testid="app-ready"]')).toBeVisible();
});

test.afterEach(async ({ page }) => {
  // Capture screenshot on failure
  if (test.info().status !== 'passed') {
    await page.screenshot({
      path: `test-results/failure-${test.info().testId}.png`,
      fullPage: true
    });
  }
});
```

### 7.3 Shared Test Context

```typescript
// Use test fixtures for shared setup
import { test as base } from '@playwright/test';

type DashboardFixtures = {
  dashboardPage: DashboardPage;
  catalogPage: WidgetCatalogPage;
};

export const test = base.extend<DashboardFixtures>({
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  catalogPage: async ({ page }, use) => {
    const catalogPage = new WidgetCatalogPage(page);
    await use(catalogPage);
  }
});
```

---

## 8. Performance Testing

### 8.1 Load Time Budgets

```typescript
test('dashboard loads within performance budget', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await expect(page.locator('[data-testid="dashboard-canvas"]')).toBeVisible();
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(2000); // 2 second budget per PRD
});

test('widget data refresh completes within budget', async ({ page }) => {
  await page.goto('/');

  const startTime = Date.now();
  await page.locator('[data-testid="refresh-all-button"]').click();
  await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  const refreshTime = Date.now() - startTime;

  expect(refreshTime).toBeLessThan(3000); // 3 second budget per PRD
});

test('drag interaction responds within 100ms', async ({ page }) => {
  // Performance test for interaction responsiveness
  await page.goto('/');

  const widget = page.locator('[data-testid="widget-GH-01"]');
  const startTime = Date.now();
  await widget.hover();
  const hoverResponseTime = Date.now() - startTime;

  expect(hoverResponseTime).toBeLessThan(100); // 100ms budget per PRD
});
```

---

## 9. Accessibility Testing

### 9.1 WCAG 2.1 AA Compliance

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('dashboard meets WCAG 2.1 AA standards', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);

  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
    axeOptions: {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    }
  });
});

test('keyboard navigation works for all interactive elements', async ({ page }) => {
  await page.goto('/');

  // Tab through all focusable elements
  const focusableElements = await page.locator('button, a, input, select, [tabindex]:not([tabindex="-1"])').all();

  for (let i = 0; i < focusableElements.length; i++) {
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  }
});
```

---

## 10. Visual Regression Testing

### 10.1 Screenshot Strategy

```typescript
test('dashboard layout matches design', async ({ page }) => {
  await page.goto('/');

  // Setup dashboard with known state
  await setupDashboardState(page, [TEST_DASHBOARDS.complex]);
  await page.reload();

  await expect(page).toHaveScreenshot('dashboard-complex.png', {
    maxDiffPixels: 100,
    fullPage: true
  });
});

test('widget states visual consistency', async ({ page }) => {
  await page.goto('/');

  // Test different widget states
  const states = ['loading', 'success', 'error'];

  for (const state of states) {
    await setupWidgetState(page, 'GH-01', state);
    await expect(page.locator('[data-testid="widget-GH-01"]'))
      .toHaveScreenshot(`widget-${state}.png`);
  }
});
```

---

## 11. Error Handling and Edge Cases

### 11.1 Error Scenarios

```typescript
// API errors
test('handles GitHub API rate limit gracefully', async ({ page }) => {
  await page.route('**/api/github/**', route => {
    route.fulfill({ status: 403, body: 'Rate limit exceeded' });
  });

  await page.goto('/');
  await expect(page.getByText(/rate limit/i)).toBeVisible();
  await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
});

// Network errors
test('handles network failure', async ({ page }) => {
  await page.route('**/api/**', route => route.abort());

  await page.goto('/');
  await expect(page.getByText(/connection failed/i)).toBeVisible();
});

// Data validation errors
test('prevents invalid repository format', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="add-widget-button"]').click();
  await page.locator('[data-testid="config-field-repository"]').fill('invalid format!');

  await expect(page.getByText(/invalid repository format/i)).toBeVisible();
  await expect(page.locator('[data-testid="config-submit-button"]')).toBeDisabled();
});
```

### 11.2 Edge Cases

```typescript
// Maximum widgets per dashboard
test('enforces maximum widget limit', async ({ page }) => {
  // Setup dashboard with 50 widgets (hypothetical limit)
  const maxWidgets = Array(50).fill(null).map((_, i) => ({
    type: 'GH-06',
    config: { repo: `test/repo${i}` }
  }));

  await setupDashboardState(page, [{
    id: 'max-widgets',
    name: 'Max Widgets',
    widgets: maxWidgets
  }]);

  await page.goto('/');
  await page.locator('[data-testid="add-widget-button"]').click();
  await expect(page.getByText(/maximum widget limit/i)).toBeVisible();
});

// Empty dashboard deletion
test('prevents deleting last dashboard', async ({ page }) => {
  await setupDashboardState(page, [TEST_DASHBOARDS.empty]);
  await page.goto('/');

  await page.locator('[data-testid="delete-dashboard-button"]').click();
  await expect(page.getByText(/at least one dashboard/i)).toBeVisible();
});
```

---

## 12. CI/CD Integration

### 12.1 GitHub Actions Workflow

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### 12.2 Test Reporting

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ]
});
```

---

## 13. Test Maintenance Strategy

### 13.1 Test Review Schedule

- **Daily**: Review failed tests, update selectors if needed
- **Weekly**: Review test coverage reports, add missing scenarios
- **Sprint**: Refactor duplicated test code, update page objects
- **Release**: Full regression suite, update visual baselines

### 13.2 Test Refactoring Guidelines

```typescript
// BAD: Duplicated setup
test('test 1', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="add-widget"]').click();
  // ... test logic
});

test('test 2', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="add-widget"]').click();
  // ... test logic
});

// GOOD: Shared helper
async function openWidgetCatalog(page: Page) {
  await page.goto('/');
  await page.locator('[data-testid="add-widget"]').click();
  await expect(page.locator('[data-testid="catalog-modal"]')).toBeVisible();
}

test('test 1', async ({ page }) => {
  await openWidgetCatalog(page);
  // ... test logic
});

test('test 2', async ({ page }) => {
  await openWidgetCatalog(page);
  // ... test logic
});
```

---

## 14. Success Metrics

### 14.1 Coverage Metrics

**Target**: 90%+ coverage of user-facing functionality

- Dashboard operations: 100%
- Widget catalog: 95%
- Widget interactions: 90%
- API integration: 85%
- Error scenarios: 80%

### 14.2 Quality Metrics

- **Test Pass Rate**: >95% on main branch
- **Flaky Test Rate**: <2% of total tests
- **Test Execution Time**: <10 minutes for full suite
- **False Positive Rate**: <1% of failures

### 14.3 Performance Metrics

- **Page Load**: <2 seconds (P90)
- **Widget Refresh**: <3 seconds (P90)
- **Interaction Response**: <100ms (P95)

---

## 15. Next Steps

### Phase 1: Foundation (Week 1)
- [ ] Setup Playwright configuration
- [ ] Create baseline tests
- [ ] Setup CI/CD pipeline
- [ ] Create page object models

### Phase 2: Component Coverage (Weeks 2-3)
- [ ] Dashboard operations tests
- [ ] Widget catalog tests
- [ ] Form validation tests
- [ ] Modal interaction tests

### Phase 3: Integration Testing (Weeks 4-5)
- [ ] API integration tests
- [ ] Widget lifecycle tests
- [ ] Persistence tests
- [ ] Error handling tests

### Phase 4: E2E Workflows (Week 6)
- [ ] Onboarding flow tests
- [ ] Complete dashboard workflows
- [ ] Multi-widget scenarios
- [ ] Data refresh flows

### Phase 5: Quality Assurance (Week 7)
- [ ] Accessibility testing
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Cross-browser validation

---

**Document Version**: 1.0
**Last Updated**: 2025-11-01
**Output Path**: `.claude/outputs/design/agents/playwright-expert/dashboard-builder-20251101-220250/test-strategy.md`
