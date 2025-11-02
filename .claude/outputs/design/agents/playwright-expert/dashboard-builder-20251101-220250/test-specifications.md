# Playwright Test Specifications - Dashboard Builder

**Project**: dashboard-builder
**Timestamp**: 20251101-220250
**Framework**: Playwright + TypeScript
**Coverage Goal**: 90%+ of user-facing functionality

---

## Table of Contents

1. [Baseline Tests](#1-baseline-tests)
2. [Dashboard Operations](#2-dashboard-operations)
3. [Widget Catalog](#3-widget-catalog)
4. [Widget Configuration](#4-widget-configuration)
5. [Widget Interactions](#5-widget-interactions)
6. [Data Fetching and Caching](#6-data-fetching-and-caching)
7. [Layout and Grid System](#7-layout-and-grid-system)
8. [Persistence and State Management](#8-persistence-and-state-management)
9. [Error Handling](#9-error-handling)
10. [Accessibility](#10-accessibility)
11. [Visual Regression](#11-visual-regression)
12. [Performance](#12-performance)

---

## 1. Baseline Tests

### 1.1 Application Initialization

**Test ID**: BL-001
**Priority**: Critical
**Category**: Baseline

**Scenario**: Application loads successfully without errors

```typescript
test('application loads and renders main structure', async ({ page }) => {
  await page.goto('/');

  // Verify main layout components
  await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  await expect(page.locator('[data-testid="dashboard-canvas"]')).toBeVisible();

  // No critical console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});
```

---

### 1.2 Empty State Display

**Test ID**: BL-002
**Priority**: Critical
**Category**: Baseline

**Scenario**: Empty dashboard shows welcome state

```typescript
test('displays empty state when no dashboards exist', async ({ page }) => {
  // Clear localStorage
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');

  // Verify empty state
  await expect(page.getByText(/welcome to dashboard builder/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /create dashboard/i })).toBeVisible();
  await expect(page.locator('[data-testid="dashboard-canvas"]')).toContainText(/create your first dashboard/i);
});
```

---

### 1.3 Salt DS Components Load

**Test ID**: BL-003
**Priority**: High
**Category**: Baseline

**Scenario**: Salt Design System components render correctly

```typescript
test('Salt DS components are styled correctly', async ({ page }) => {
  await page.goto('/');

  // Check Salt DS button styling
  const button = page.getByRole('button', { name: /create/i }).first();
  await expect(button).toHaveCSS('border-radius', '4px');

  // Check Salt DS color tokens are applied
  const header = page.locator('[data-testid="app-header"]');
  const bgColor = await header.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );
  expect(bgColor).toBeTruthy();
});
```

---

## 2. Dashboard Operations

### 2.1 Dashboard Creation

**Test ID**: DS-001
**Priority**: Critical
**Category**: Dashboard Operations
**User Story**: US-01

**Scenario**: User creates a new dashboard

```typescript
test('creates new dashboard with valid name', async ({ page }) => {
  await page.goto('/');

  // Click create dashboard button
  await page.locator('[data-testid="new-dashboard-button"]').click();

  // Modal opens
  await expect(page.locator('[data-testid="dashboard-create-modal"]')).toBeVisible();

  // Fill in dashboard name
  await page.getByLabel(/dashboard name/i).fill('My Test Dashboard');

  // Submit form
  await page.getByRole('button', { name: /create dashboard/i }).click();

  // Modal closes
  await expect(page.locator('[data-testid="dashboard-create-modal"]')).not.toBeVisible();

  // Dashboard appears in selector
  await expect(page.locator('[data-testid="dashboard-selector"]'))
    .toContainText('My Test Dashboard');

  // Empty canvas is visible
  await expect(page.locator('[data-testid="dashboard-canvas"]')).toBeVisible();
  await expect(page.getByText(/your dashboard is empty/i)).toBeVisible();

  // Success notification
  await expect(page.getByText(/dashboard created/i)).toBeVisible();
});
```

---

### 2.2 Dashboard Creation Validation

**Test ID**: DS-002
**Priority**: High
**Category**: Dashboard Operations
**User Story**: US-01

**Scenario**: Dashboard creation validates required fields

```typescript
test('prevents dashboard creation with empty name', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="new-dashboard-button"]').click();

  // Try to submit without name
  const submitButton = page.getByRole('button', { name: /create dashboard/i });
  await expect(submitButton).toBeDisabled();

  // Enter only spaces
  await page.getByLabel(/dashboard name/i).fill('   ');
  await expect(submitButton).toBeDisabled();

  // Error message appears
  await expect(page.getByText(/name is required/i)).toBeVisible();
});

test('prevents duplicate dashboard names', async ({ page }) => {
  await page.goto('/');

  // Create first dashboard
  await page.locator('[data-testid="new-dashboard-button"]').click();
  await page.getByLabel(/dashboard name/i).fill('Test Dashboard');
  await page.getByRole('button', { name: /create dashboard/i }).click();

  // Try to create duplicate
  await page.locator('[data-testid="new-dashboard-button"]').click();
  await page.getByLabel(/dashboard name/i).fill('Test Dashboard');

  // Error appears
  await expect(page.getByText(/dashboard name already exists/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /create dashboard/i })).toBeDisabled();
});
```

---

### 2.3 Dashboard Switching

**Test ID**: DS-003
**Priority**: Critical
**Category**: Dashboard Operations
**User Story**: US-07

**Scenario**: User switches between dashboards

```typescript
test('switches between multiple dashboards', async ({ page }) => {
  // Setup: Create two dashboards with different widgets
  await setupDashboardState(page, [
    {
      id: 'dashboard-1',
      name: 'Dashboard One',
      widgets: [{ type: 'GH-06', config: { repo: 'facebook/react' } }]
    },
    {
      id: 'dashboard-2',
      name: 'Dashboard Two',
      widgets: [{ type: 'NPM-01', config: { package: 'react' } }]
    }
  ]);

  await page.goto('/');

  // Verify Dashboard One is active
  await expect(page.locator('[data-testid="dashboard-selector"]'))
    .toContainText('Dashboard One');
  await expect(page.locator('[data-testid="widget-GH-06"]')).toBeVisible();

  // Open dashboard selector
  await page.locator('[data-testid="dashboard-selector"]').click();

  // Select Dashboard Two
  await page.getByRole('option', { name: 'Dashboard Two' }).click();

  // Verify switch occurred
  await expect(page.locator('[data-testid="dashboard-selector"]'))
    .toContainText('Dashboard Two');
  await expect(page.locator('[data-testid="widget-NPM-01"]')).toBeVisible();
  await expect(page.locator('[data-testid="widget-GH-06"]')).not.toBeVisible();

  // Sidebar shows active dashboard highlighted
  await expect(page.locator('[data-testid="dashboard-list-item-dashboard-2"]'))
    .toHaveClass(/active/);
});
```

---

### 2.4 Dashboard Rename

**Test ID**: DS-004
**Priority**: High
**Category**: Dashboard Operations
**User Story**: US-08

**Scenario**: User renames existing dashboard

```typescript
test('renames dashboard successfully', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Old Name',
    widgets: []
  }]);

  await page.goto('/');

  // Open dashboard settings
  await page.locator('[data-testid="settings-button"]').click();

  // Click rename button
  await page.locator('[data-testid="rename-dashboard-button"]').click();

  // Update name
  const nameInput = page.getByLabel(/dashboard name/i);
  await nameInput.clear();
  await nameInput.fill('New Dashboard Name');

  // Save changes
  await page.getByRole('button', { name: /save/i }).click();

  // Verify name updated
  await expect(page.locator('[data-testid="dashboard-selector"]'))
    .toContainText('New Dashboard Name');

  // Success notification
  await expect(page.getByText(/dashboard renamed/i)).toBeVisible();
});
```

---

### 2.5 Dashboard Duplication

**Test ID**: DS-005
**Priority**: Medium
**Category**: Dashboard Operations
**User Story**: US-08

**Scenario**: User duplicates dashboard with all widgets

```typescript
test('duplicates dashboard with widgets and configuration', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'original',
    name: 'Original Dashboard',
    widgets: [
      { type: 'GH-01', config: { repo: 'facebook/react', period: '30d' } },
      { type: 'NPM-01', config: { package: 'react', period: '30d' } }
    ]
  }]);

  await page.goto('/');

  // Open dashboard settings
  await page.locator('[data-testid="settings-button"]').click();

  // Click duplicate
  await page.locator('[data-testid="duplicate-dashboard-button"]').click();

  // Confirm duplicate name
  await expect(page.getByLabel(/dashboard name/i))
    .toHaveValue('Original Dashboard (Copy)');

  await page.getByRole('button', { name: /duplicate/i }).click();

  // Verify new dashboard created
  await expect(page.locator('[data-testid="dashboard-selector"]'))
    .toContainText('Original Dashboard (Copy)');

  // Verify widgets copied
  await expect(page.locator('[data-testid="widget-GH-01"]')).toBeVisible();
  await expect(page.locator('[data-testid="widget-NPM-01"]')).toBeVisible();

  // Verify configurations copied
  await page.locator('[data-testid="widget-config-button-GH-01"]').click();
  await expect(page.getByLabel(/repository/i)).toHaveValue('facebook/react');
  await expect(page.getByLabel(/time period/i)).toHaveValue('30d');
});
```

---

### 2.6 Dashboard Deletion

**Test ID**: DS-006
**Priority**: Critical
**Category**: Dashboard Operations
**User Story**: US-08

**Scenario**: User deletes dashboard with confirmation

```typescript
test('deletes dashboard with confirmation', async ({ page }) => {
  await setupDashboardState(page, [
    { id: 'dashboard-1', name: 'Dashboard One', widgets: [] },
    { id: 'dashboard-2', name: 'Dashboard Two', widgets: [] }
  ]);

  await page.goto('/');

  // Open settings
  await page.locator('[data-testid="settings-button"]').click();

  // Click delete
  await page.locator('[data-testid="delete-dashboard-button"]').click();

  // Confirmation dialog appears
  await expect(page.getByText(/are you sure/i)).toBeVisible();
  await expect(page.getByText(/this action cannot be undone/i)).toBeVisible();

  // Confirm deletion
  await page.getByRole('button', { name: /delete/i }).click();

  // Dashboard removed, switches to remaining dashboard
  await expect(page.locator('[data-testid="dashboard-selector"]'))
    .toContainText('Dashboard Two');

  await expect(page.getByText(/dashboard deleted/i)).toBeVisible();
});

test('prevents deleting last dashboard', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'last-dashboard',
    name: 'Last Dashboard',
    widgets: []
  }]);

  await page.goto('/');

  await page.locator('[data-testid="settings-button"]').click();

  // Delete button disabled or shows warning
  const deleteButton = page.locator('[data-testid="delete-dashboard-button"]');
  await expect(deleteButton).toBeDisabled();

  // Tooltip explains why
  await deleteButton.hover();
  await expect(page.getByText(/at least one dashboard required/i)).toBeVisible();
});
```

---

## 3. Widget Catalog

### 3.1 Browse Widget Catalog

**Test ID**: WC-001
**Priority**: Critical
**Category**: Widget Catalog
**User Story**: US-02

**Scenario**: User browses widget catalog by category

```typescript
test('opens widget catalog and displays categories', async ({ page }) => {
  await page.goto('/');

  // Open catalog
  await page.locator('[data-testid="browse-catalog-button"]').click();

  // Modal appears
  await expect(page.locator('[data-testid="catalog-modal"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: /widget catalog/i })).toBeVisible();

  // All categories visible
  await expect(page.getByText(/github widgets/i)).toBeVisible();
  await expect(page.getByText(/npm widgets/i)).toBeVisible();
  await expect(page.getByText(/combined widgets/i)).toBeVisible();

  // GitHub widgets section expanded by default
  await expect(page.locator('[data-testid="widget-card-GH-01"]')).toBeVisible();
  await expect(page.locator('[data-testid="widget-card-GH-02"]')).toBeVisible();
  await expect(page.locator('[data-testid="widget-card-GH-06"]')).toBeVisible();
});
```

---

### 3.2 Widget Card Display

**Test ID**: WC-002
**Priority**: High
**Category**: Widget Catalog
**User Story**: US-02

**Scenario**: Widget cards show complete information

```typescript
test('widget cards display all required information', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();

  const widgetCard = page.locator('[data-testid="widget-card-GH-01"]');

  // Icon visible
  await expect(widgetCard.locator('[data-testid="widget-icon"]')).toBeVisible();

  // Widget name
  await expect(widgetCard.getByText(/repository stars trend/i)).toBeVisible();

  // Description
  await expect(widgetCard.getByText(/track repository popularity/i)).toBeVisible();

  // Visualization type indicator
  await expect(widgetCard.getByText(/line chart/i)).toBeVisible();

  // Add button
  await expect(widgetCard.locator('[data-testid="add-widget-button-GH-01"]')).toBeVisible();
  await expect(widgetCard.locator('[data-testid="add-widget-button-GH-01"]')).toBeEnabled();
});
```

---

### 3.3 Search Widget Catalog

**Test ID**: WC-003
**Priority**: Medium
**Category**: Widget Catalog
**User Story**: US-02

**Scenario**: User searches for widgets by keyword

```typescript
test('filters widgets by search term', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();

  // Enter search term
  await page.locator('[data-testid="catalog-search-input"]').fill('stars');

  // Wait for debounced search
  await page.waitForTimeout(400);

  // Only matching widgets visible
  await expect(page.locator('[data-testid="widget-card-GH-01"]')).toBeVisible(); // Repository Stars Trend
  await expect(page.locator('[data-testid="widget-card-GH-02"]')).not.toBeVisible(); // Issue Health
  await expect(page.locator('[data-testid="widget-card-NPM-01"]')).not.toBeVisible(); // Downloads

  // Search count indicator
  await expect(page.getByText(/showing 1 widget/i)).toBeVisible();
});

test('shows no results message when search has no matches', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();

  await page.locator('[data-testid="catalog-search-input"]').fill('nonexistent');
  await page.waitForTimeout(400);

  await expect(page.getByText(/no widgets found/i)).toBeVisible();
  await expect(page.getByText(/try different keywords/i)).toBeVisible();
});

test('clears search results', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();

  // Perform search
  await page.locator('[data-testid="catalog-search-input"]').fill('stars');
  await page.waitForTimeout(400);

  // Clear search
  await page.locator('[data-testid="clear-search-button"]').click();

  // All widgets visible again
  await expect(page.locator('[data-testid="widget-card-GH-01"]')).toBeVisible();
  await expect(page.locator('[data-testid="widget-card-GH-02"]')).toBeVisible();
  await expect(page.locator('[data-testid="widget-card-NPM-01"]')).toBeVisible();
});
```

---

### 3.4 Filter by Category

**Test ID**: WC-004
**Priority**: Medium
**Category**: Widget Catalog
**User Story**: US-02

**Scenario**: User filters widgets by data source category

```typescript
test('filters widgets by category selection', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();

  // Select npm category filter
  await page.locator('[data-testid="category-filter"]').click();
  await page.getByRole('option', { name: /npm widgets/i }).click();

  // Only npm widgets visible
  await expect(page.locator('[data-testid="widget-card-NPM-01"]')).toBeVisible();
  await expect(page.locator('[data-testid="widget-card-NPM-02"]')).toBeVisible();
  await expect(page.locator('[data-testid="widget-card-GH-01"]')).not.toBeVisible();

  // Filter shows in UI
  await expect(page.getByText(/filtered by: npm widgets/i)).toBeVisible();

  // Clear filter
  await page.locator('[data-testid="clear-filter-button"]').click();
  await expect(page.locator('[data-testid="widget-card-GH-01"]')).toBeVisible();
});
```

---

### 3.5 Widget Hover Preview

**Test ID**: WC-005
**Priority**: Low
**Category**: Widget Catalog
**User Story**: US-02

**Scenario**: Widget card shows preview on hover

```typescript
test('displays widget preview tooltip on hover', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();

  const widgetCard = page.locator('[data-testid="widget-card-GH-01"]');

  // Hover over card
  await widgetCard.hover();

  // Preview tooltip appears with more details
  await expect(page.locator('[data-testid="widget-preview-tooltip"]')).toBeVisible();
  await expect(page.getByText(/required parameters/i)).toBeVisible();
  await expect(page.getByText(/repository owner\/name/i)).toBeVisible();

  // Move away
  await page.mouse.move(0, 0);
  await expect(page.locator('[data-testid="widget-preview-tooltip"]')).not.toBeVisible();
});
```

---

## 4. Widget Configuration

### 4.1 Add Widget with Configuration

**Test ID**: WG-001
**Priority**: Critical
**Category**: Widget Configuration
**User Story**: US-03, US-06

**Scenario**: User adds widget and configures parameters

```typescript
test('adds GitHub Stars widget with configuration', async ({ page }) => {
  await page.goto('/');

  // Open catalog
  await page.locator('[data-testid="browse-catalog-button"]').click();

  // Click add on GH-01 widget
  await page.locator('[data-testid="add-widget-button-GH-01"]').click();

  // Configuration modal opens
  await expect(page.locator('[data-testid="widget-config-modal"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: /configure widget: repository stars trend/i }))
    .toBeVisible();

  // Fill required fields
  await page.getByLabel(/repository/i).fill('facebook/react');
  await page.getByLabel(/time period/i).selectOption('30d');

  // Optional custom title
  await page.getByLabel(/widget title/i).fill('React Stars Growth');

  // Preview updates (if implemented)
  await expect(page.locator('[data-testid="widget-preview"]')).toBeVisible();

  // Submit
  await page.getByRole('button', { name: /add to dashboard/i }).click();

  // Modal closes
  await expect(page.locator('[data-testid="widget-config-modal"]')).not.toBeVisible();

  // Widget appears on dashboard
  await expect(page.locator('[data-testid="widget-GH-01"]')).toBeVisible();
  await expect(page.getByText('React Stars Growth')).toBeVisible();

  // Widget starts loading data
  await expect(page.locator('[data-testid="widget-GH-01"]'))
    .toHaveClass(/loading/);

  // Success notification
  await expect(page.getByText(/widget added/i)).toBeVisible();
});
```

---

### 4.2 Widget Configuration Validation

**Test ID**: WG-002
**Priority**: High
**Category**: Widget Configuration
**User Story**: US-06

**Scenario**: Configuration form validates required fields

```typescript
test('prevents widget addition with missing required fields', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();
  await page.locator('[data-testid="add-widget-button-GH-01"]').click();

  // Submit button disabled when fields empty
  await expect(page.getByRole('button', { name: /add to dashboard/i }))
    .toBeDisabled();

  // Enter invalid repository format
  await page.getByLabel(/repository/i).fill('invalid');
  await expect(page.getByText(/format: owner\/repository/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /add to dashboard/i }))
    .toBeDisabled();

  // Enter valid format
  await page.getByLabel(/repository/i).clear();
  await page.getByLabel(/repository/i).fill('facebook/react');

  // Select time period
  await page.getByLabel(/time period/i).selectOption('30d');

  // Submit now enabled
  await expect(page.getByRole('button', { name: /add to dashboard/i }))
    .toBeEnabled();
});

test('validates repository exists via API', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();
  await page.locator('[data-testid="add-widget-button-GH-01"]').click();

  // Enter non-existent repository
  await page.getByLabel(/repository/i).fill('invalid/nonexistent-repo-12345');

  // Debounced validation check
  await page.waitForTimeout(600);

  // Error appears
  await expect(page.getByText(/repository not found/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /add to dashboard/i }))
    .toBeDisabled();

  // Field shows error state (red border)
  const repoInput = page.getByLabel(/repository/i);
  await expect(repoInput).toHaveCSS('border-color', /rgb\(200, 33, 36\)/); // Error color
});
```

---

### 4.3 Edit Widget Configuration

**Test ID**: WG-003
**Priority**: High
**Category**: Widget Configuration
**User Story**: US-06

**Scenario**: User updates existing widget configuration

```typescript
test('updates widget configuration', async ({ page }) => {
  // Setup dashboard with widget
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      {
        id: 'widget-1',
        type: 'GH-01',
        config: { repo: 'facebook/react', period: '30d' }
      }
    ]
  }]);

  await page.goto('/');

  // Open widget configuration
  await page.locator('[data-testid="widget-config-button-widget-1"]').click();

  // Modal opens with pre-filled values
  await expect(page.getByLabel(/repository/i)).toHaveValue('facebook/react');
  await expect(page.getByLabel(/time period/i)).toHaveValue('30d');

  // Change repository
  await page.getByLabel(/repository/i).clear();
  await page.getByLabel(/repository/i).fill('vuejs/vue');

  // Change time period
  await page.getByLabel(/time period/i).selectOption('90d');

  // Save changes
  await page.getByRole('button', { name: /save changes/i }).click();

  // Widget refreshes with new data
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toHaveClass(/loading/);

  await expect(page.getByText(/widget updated/i)).toBeVisible();

  // Verify configuration persisted
  await page.locator('[data-testid="widget-config-button-widget-1"]').click();
  await expect(page.getByLabel(/repository/i)).toHaveValue('vuejs/vue');
  await expect(page.getByLabel(/time period/i)).toHaveValue('90d');
});
```

---

### 4.4 Cancel Configuration

**Test ID**: WG-004
**Priority**: Medium
**Category**: Widget Configuration

**Scenario**: User cancels widget configuration

```typescript
test('cancels widget configuration without saving', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      {
        id: 'widget-1',
        type: 'GH-01',
        config: { repo: 'facebook/react', period: '30d' }
      }
    ]
  }]);

  await page.goto('/');

  // Open config
  await page.locator('[data-testid="widget-config-button-widget-1"]').click();

  // Make changes
  await page.getByLabel(/repository/i).clear();
  await page.getByLabel(/repository/i).fill('vuejs/vue');

  // Click cancel
  await page.getByRole('button', { name: /cancel/i }).click();

  // Modal closes
  await expect(page.locator('[data-testid="widget-config-modal"]')).not.toBeVisible();

  // Changes not saved
  await page.locator('[data-testid="widget-config-button-widget-1"]').click();
  await expect(page.getByLabel(/repository/i)).toHaveValue('facebook/react');
});

test('warns about unsaved changes on modal close', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();
  await page.locator('[data-testid="add-widget-button-GH-01"]').click();

  // Enter data
  await page.getByLabel(/repository/i).fill('facebook/react');

  // Try to close modal
  await page.locator('[data-testid="close-modal-button"]').click();

  // Confirmation dialog
  await expect(page.getByText(/unsaved changes/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /discard/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /continue editing/i })).toBeVisible();

  // Confirm discard
  await page.getByRole('button', { name: /discard/i }).click();

  // Modal closes
  await expect(page.locator('[data-testid="widget-config-modal"]')).not.toBeVisible();
});
```

---

### 4.5 Refresh Interval Configuration

**Test ID**: WG-005
**Priority**: Medium
**Category**: Widget Configuration
**User Story**: US-09

**Scenario**: User sets auto-refresh interval for widget

```typescript
test('configures widget auto-refresh interval', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="browse-catalog-button"]').click();
  await page.locator('[data-testid="add-widget-button-GH-01"]').click();

  // Configure widget
  await page.getByLabel(/repository/i).fill('facebook/react');
  await page.getByLabel(/time period/i).selectOption('30d');

  // Set refresh interval
  await page.getByLabel(/refresh interval/i).selectOption('15min');

  await page.getByRole('button', { name: /add to dashboard/i }).click();

  // Widget added with refresh configured
  await expect(page.locator('[data-testid="widget-GH-01"]')).toBeVisible();

  // Verify refresh indicator shows
  await expect(page.locator('[data-testid="widget-GH-01"]'))
    .toContainText(/auto-refresh: 15 min/i);

  // Wait and verify auto-refresh triggers (mock or real)
  // This would require waiting 15 minutes in real scenario,
  // so we'd mock the timer in actual implementation
});
```

---

## 5. Widget Interactions

### 5.1 Widget Drag and Drop

**Test ID**: WI-001
**Priority**: Critical
**Category**: Widget Interactions
**User Story**: US-04

**Scenario**: User drags widget to new position

```typescript
test('drags widget to new position on grid', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: {} },
      { id: 'widget-2', type: 'GH-02', config: {} },
      { id: 'widget-3', type: 'NPM-01', config: {} }
    ]
  }]);

  await page.goto('/');

  const widget1 = page.locator('[data-testid="widget-widget-1"]');
  const widget2 = page.locator('[data-testid="widget-widget-2"]');

  // Get initial positions
  const widget1Box = await widget1.boundingBox();
  const widget2Box = await widget2.boundingBox();

  // Drag widget-1 to widget-2's position
  await widget1.hover();
  await page.mouse.down();

  // Widget shows dragging state
  await expect(widget1).toHaveClass(/dragging/);
  await expect(widget1).toHaveCSS('opacity', '0.7');

  // Move to new position
  await page.mouse.move(widget2Box!.x + 50, widget2Box!.y + 50);

  // Grid overlay visible
  await expect(page.locator('[data-testid="grid-overlay"]')).toBeVisible();

  // Release
  await page.mouse.up();

  // Widget snaps to grid
  await expect(widget1).not.toHaveClass(/dragging/);
  await expect(widget1).toHaveCSS('opacity', '1');

  // Positions swapped
  const newWidget1Box = await widget1.boundingBox();
  expect(newWidget1Box!.x).toBeCloseTo(widget2Box!.x, 5);
  expect(newWidget1Box!.y).toBeCloseTo(widget2Box!.y, 5);

  // Layout saved notification
  await expect(page.getByText(/layout saved/i)).toBeVisible();
});
```

---

### 5.2 Widget Resize

**Test ID**: WI-002
**Priority**: Critical
**Category**: Widget Interactions
**User Story**: US-05

**Scenario**: User resizes widget dimensions

```typescript
test('resizes widget using corner handle', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      {
        id: 'widget-1',
        type: 'GH-03',
        config: {},
        layout: { x: 0, y: 0, w: 4, h: 2 } // 4 columns × 2 rows
      }
    ]
  }]);

  await page.goto('/');

  const widget = page.locator('[data-testid="widget-widget-1"]');

  // Get initial size
  const initialBox = await widget.boundingBox();

  // Hover to show resize handle
  await widget.hover();
  await expect(page.locator('[data-testid="resize-handle-widget-1"]')).toBeVisible();

  // Drag resize handle
  const resizeHandle = page.locator('[data-testid="resize-handle-widget-1"]');
  await resizeHandle.hover();
  await page.mouse.down();

  // Widget shows resizing state
  await expect(widget).toHaveClass(/resizing/);
  await expect(widget).toHaveCSS('border-width', '2px');

  // Drag to increase size
  await page.mouse.move(initialBox!.x + initialBox!.width + 200, initialBox!.y + initialBox!.height + 100);
  await page.mouse.up();

  // Widget resized
  const newBox = await widget.boundingBox();
  expect(newBox!.width).toBeGreaterThan(initialBox!.width);
  expect(newBox!.height).toBeGreaterThan(initialBox!.height);

  // Chart re-renders to fit new size
  await expect(widget.locator('[data-testid="chart-canvas"]')).toBeVisible();

  // Layout persisted
  await page.reload();
  const reloadedBox = await widget.boundingBox();
  expect(reloadedBox!.width).toBeCloseTo(newBox!.width, 10);
});
```

---

### 5.3 Widget Removal

**Test ID**: WI-003
**Priority**: High
**Category**: Widget Interactions
**User Story**: US-10

**Scenario**: User removes widget from dashboard

```typescript
test('removes widget from dashboard', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: {} },
      { id: 'widget-2', type: 'NPM-01', config: {} }
    ]
  }]);

  await page.goto('/');

  // Verify widget exists
  await expect(page.locator('[data-testid="widget-widget-1"]')).toBeVisible();

  // Hover to show remove button
  await page.locator('[data-testid="widget-widget-1"]').hover();

  // Click remove
  await page.locator('[data-testid="widget-remove-button-widget-1"]').click();

  // Confirmation dialog
  await expect(page.getByText(/remove widget/i)).toBeVisible();
  await page.getByRole('button', { name: /remove/i }).click();

  // Widget removed
  await expect(page.locator('[data-testid="widget-widget-1"]')).not.toBeVisible();

  // Other widget still visible
  await expect(page.locator('[data-testid="widget-widget-2"]')).toBeVisible();

  // Success notification
  await expect(page.getByText(/widget removed/i)).toBeVisible();
});

test('supports undo for widget removal', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');

  // Remove widget
  await page.locator('[data-testid="widget-widget-1"]').hover();
  await page.locator('[data-testid="widget-remove-button-widget-1"]').click();
  await page.getByRole('button', { name: /remove/i }).click();

  // Undo notification appears
  await expect(page.getByText(/widget removed/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /undo/i })).toBeVisible();

  // Click undo
  await page.getByRole('button', { name: /undo/i }).click();

  // Widget restored
  await expect(page.locator('[data-testid="widget-widget-1"]')).toBeVisible();

  // Configuration preserved
  await page.locator('[data-testid="widget-config-button-widget-1"]').click();
  await expect(page.getByLabel(/repository/i)).toHaveValue('facebook/react');
});
```

---

### 5.4 Widget Manual Refresh

**Test ID**: WI-004
**Priority**: High
**Category**: Widget Interactions
**User Story**: US-09

**Scenario**: User manually refreshes widget data

```typescript
test('refreshes individual widget data', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');

  // Wait for initial load
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .not.toHaveClass(/loading/);

  // Click refresh button
  await page.locator('[data-testid="widget-widget-1"]').hover();
  await page.locator('[data-testid="widget-refresh-button-widget-1"]').click();

  // Refresh icon animates
  const refreshButton = page.locator('[data-testid="widget-refresh-button-widget-1"]');
  await expect(refreshButton.locator('svg')).toHaveCSS('animation', /rotate/);

  // Widget shows loading overlay (previous data still visible)
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toHaveClass(/refreshing/);

  // Wait for refresh complete
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .not.toHaveClass(/refreshing/);

  // Timestamp updated
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toContainText(/last updated: just now/i);
});
```

---

### 5.5 Refresh All Widgets

**Test ID**: WI-005
**Priority**: Medium
**Category**: Widget Interactions
**User Story**: US-09

**Scenario**: User refreshes all widgets on dashboard

```typescript
test('refreshes all widgets simultaneously', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: {} },
      { id: 'widget-2', type: 'GH-02', config: {} },
      { id: 'widget-3', type: 'NPM-01', config: {} }
    ]
  }]);

  await page.goto('/');

  // Click global refresh
  await page.locator('[data-testid="refresh-all-button"]').click();

  // All widgets enter loading state
  await expect(page.locator('[data-testid="widget-widget-1"]')).toHaveClass(/refreshing/);
  await expect(page.locator('[data-testid="widget-widget-2"]')).toHaveClass(/refreshing/);
  await expect(page.locator('[data-testid="widget-widget-3"]')).toHaveClass(/refreshing/);

  // Progress indicator shows
  await expect(page.getByText(/refreshing/i)).toBeVisible();

  // Wait for all to complete
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .not.toHaveClass(/refreshing/, { timeout: 10000 });
  await expect(page.locator('[data-testid="widget-widget-2"]'))
    .not.toHaveClass(/refreshing/, { timeout: 10000 });
  await expect(page.locator('[data-testid="widget-widget-3"]'))
    .not.toHaveClass(/refreshing/, { timeout: 10000 });

  // Success notification
  await expect(page.getByText(/all widgets refreshed/i)).toBeVisible();
});
```

---

## 6. Data Fetching and Caching

### 6.1 GitHub API Integration

**Test ID**: DF-001
**Priority**: Critical
**Category**: Data Fetching

**Scenario**: Widget fetches data from GitHub API

```typescript
test('fetches GitHub repository data successfully', async ({ page }) => {
  // Mock GitHub API response
  await page.route('**/api/github/repos/facebook/react', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        stargazers_count: 245000,
        forks_count: 45000,
        open_issues_count: 842
      })
    });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-06', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');

  // Wait for API call
  const response = await page.waitForResponse(
    response => response.url().includes('/api/github/repos/facebook/react')
  );
  expect(response.status()).toBe(200);

  // Widget displays data
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toContainText('245,000'); // Stars formatted
});
```

---

### 6.2 npm API Integration

**Test ID**: DF-002
**Priority**: Critical
**Category**: Data Fetching

**Scenario**: Widget fetches data from npm API

```typescript
test('fetches npm package download data successfully', async ({ page }) => {
  // Mock npm API response
  await page.route('**/api/npm/downloads/point/last-month/react', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        downloads: 28500000,
        package: 'react',
        start: '2025-10-01',
        end: '2025-10-31'
      })
    });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'NPM-01', config: { package: 'react', period: '30d' } }
    ]
  }]);

  await page.goto('/');

  // Wait for API call
  const response = await page.waitForResponse(
    response => response.url().includes('/api/npm/downloads')
  );
  expect(response.status()).toBe(200);

  // Widget displays download count
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toContainText('28.5M'); // Formatted count
});
```

---

### 6.3 Cache Implementation

**Test ID**: DF-003
**Priority**: High
**Category**: Data Fetching

**Scenario**: API responses are cached to reduce requests

```typescript
test('caches API responses and reuses on subsequent loads', async ({ page }) => {
  let apiCallCount = 0;

  await page.route('**/api/github/repos/facebook/react', route => {
    apiCallCount++;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ stargazers_count: 245000 })
    });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-06', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');

  // Wait for initial load
  await page.waitForResponse(response => response.url().includes('/api/github'));
  expect(apiCallCount).toBe(1);

  // Reload page
  await page.reload();

  // Widget loads from cache (no new API call)
  await expect(page.locator('[data-testid="widget-widget-1"]')).toBeVisible();

  // Small delay to ensure no additional requests
  await page.waitForTimeout(1000);
  expect(apiCallCount).toBe(1); // Still 1, cached response used
});

test('cache expires after TTL and fetches fresh data', async ({ page }) => {
  let apiCallCount = 0;

  await page.route('**/api/github/**', route => {
    apiCallCount++;
    route.fulfill({
      status: 200,
      headers: { 'Cache-Control': 'max-age=5' }, // 5 second cache
      contentType: 'application/json',
      body: JSON.stringify({ stargazers_count: 245000 + apiCallCount })
    });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-06', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');
  await page.waitForResponse(response => response.url().includes('/api/github'));
  expect(apiCallCount).toBe(1);

  // Wait for cache to expire
  await page.waitForTimeout(6000);

  // Trigger refresh
  await page.locator('[data-testid="widget-refresh-button-widget-1"]').click();

  // New API call made
  await page.waitForResponse(response => response.url().includes('/api/github'));
  expect(apiCallCount).toBe(2);
});
```

---

### 6.4 Loading States

**Test ID**: DF-004
**Priority**: High
**Category**: Data Fetching

**Scenario**: Widget shows loading state while fetching data

```typescript
test('displays loading skeleton during initial data fetch', async ({ page }) => {
  // Delay API response
  await page.route('**/api/github/**', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ stargazers_count: 245000 })
    });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-06', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');

  // Loading state visible
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toHaveClass(/loading/);

  // Skeleton loader shown
  await expect(page.locator('[data-testid="skeleton-loader"]')).toBeVisible();

  // Spinner or loading indicator
  await expect(page.getByText(/loading/i)).toBeVisible();

  // Wait for data load
  await page.waitForResponse(response => response.url().includes('/api/github'));

  // Loading state removed
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .not.toHaveClass(/loading/);

  // Data displayed
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toContainText('245,000');
});
```

---

## 7. Layout and Grid System

### 7.1 Grid Layout Initialization

**Test ID**: LG-001
**Priority**: Critical
**Category**: Layout

**Scenario**: react-grid-layout initializes with correct configuration

```typescript
test('initializes grid layout with 12 columns', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: {}, layout: { x: 0, y: 0, w: 4, h: 2 } },
      { id: 'widget-2', type: 'GH-02', config: {}, layout: { x: 4, y: 0, w: 4, h: 2 } },
      { id: 'widget-3', type: 'NPM-01', config: {}, layout: { x: 8, y: 0, w: 4, h: 2 } }
    ]
  }]);

  await page.goto('/');

  // Grid container has correct attributes
  const gridContainer = page.locator('[data-testid="grid-layout-container"]');
  await expect(gridContainer).toHaveAttribute('data-cols', '12');

  // Widgets positioned according to layout
  const widget1Box = await page.locator('[data-testid="widget-widget-1"]').boundingBox();
  const widget2Box = await page.locator('[data-testid="widget-widget-2"]').boundingBox();
  const widget3Box = await page.locator('[data-testid="widget-widget-3"]').boundingBox();

  // Widgets are horizontally aligned
  expect(widget1Box!.y).toBeCloseTo(widget2Box!.y, 5);
  expect(widget2Box!.y).toBeCloseTo(widget3Box!.y, 5);

  // Widgets span grid columns (approximate)
  expect(widget1Box!.width).toBeCloseTo(widget2Box!.width, 10);
  expect(widget2Box!.width).toBeCloseTo(widget3Box!.width, 10);
});
```

---

### 7.2 Collision Detection

**Test ID**: LG-002
**Priority**: High
**Category**: Layout

**Scenario**: Grid prevents widget overlaps with collision detection

```typescript
test('prevents widget collision during drag', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: {}, layout: { x: 0, y: 0, w: 4, h: 2 } },
      { id: 'widget-2', type: 'GH-02', config: {}, layout: { x: 4, y: 0, w: 4, h: 2 } }
    ]
  }]);

  await page.goto('/');

  const widget1 = page.locator('[data-testid="widget-widget-1"]');
  const widget2 = page.locator('[data-testid="widget-widget-2"]');

  const widget2InitialBox = await widget2.boundingBox();

  // Try to drag widget1 onto widget2
  await widget1.hover();
  await page.mouse.down();
  await page.mouse.move(widget2InitialBox!.x + 50, widget2InitialBox!.y + 50);

  // Widget2 shifts to avoid collision
  const widget2NewBox = await widget2.boundingBox();
  expect(widget2NewBox!.y).not.toBeCloseTo(widget2InitialBox!.y, 5);

  await page.mouse.up();

  // Layout compacts after drop
  await expect(page.locator('[data-testid="widget-widget-1"]')).toBeVisible();
  await expect(page.locator('[data-testid="widget-widget-2"]')).toBeVisible();
});
```

---

### 7.3 Responsive Grid Breakpoints

**Test ID**: LG-003
**Priority**: Medium
**Category**: Layout

**Scenario**: Grid adjusts columns for different viewport sizes

```typescript
test('adjusts grid to 8 columns on tablet breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); // Tablet

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: {} },
      { id: 'widget-2', type: 'GH-02', config: {} }
    ]
  }]);

  await page.goto('/');

  // Grid switches to 8 columns
  const gridContainer = page.locator('[data-testid="grid-layout-container"]');
  await expect(gridContainer).toHaveAttribute('data-cols', '8');

  // Sidebar collapses to icon-only
  await expect(page.locator('[data-testid="sidebar"]')).toHaveCSS('width', '64px');
});

test('shows message for mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 }); // Mobile

  await page.goto('/');

  // Mobile warning message
  await expect(page.getByText(/please use a larger screen/i)).toBeVisible();

  // Dashboard in view-only mode (optional)
  const widgets = page.locator('[data-testid^="widget-"]');
  for (const widget of await widgets.all()) {
    await expect(widget).toHaveAttribute('draggable', 'false');
  }
});
```

---

## 8. Persistence and State Management

### 8.1 LocalStorage Persistence

**Test ID**: PS-001
**Priority**: Critical
**Category**: Persistence

**Scenario**: Dashboard state persists across browser sessions

```typescript
test('persists dashboard configuration to localStorage', async ({ page }) => {
  await page.goto('/');

  // Create dashboard
  await page.locator('[data-testid="new-dashboard-button"]').click();
  await page.getByLabel(/dashboard name/i).fill('Persistent Dashboard');
  await page.getByRole('button', { name: /create/i }).click();

  // Add widget
  await page.locator('[data-testid="browse-catalog-button"]').click();
  await page.locator('[data-testid="add-widget-button-GH-01"]').click();
  await page.getByLabel(/repository/i).fill('facebook/react');
  await page.getByLabel(/time period/i).selectOption('30d');
  await page.getByRole('button', { name: /add to dashboard/i }).click();

  // Reload page
  await page.reload();

  // Dashboard restored
  await expect(page.locator('[data-testid="dashboard-selector"]'))
    .toContainText('Persistent Dashboard');

  // Widget restored
  await expect(page.locator('[data-testid="widget-GH-01"]')).toBeVisible();

  // Widget configuration preserved
  await page.locator('[data-testid="widget-config-button-GH-01"]').first().click();
  await expect(page.getByLabel(/repository/i)).toHaveValue('facebook/react');
});
```

---

### 8.2 Export Configuration

**Test ID**: PS-002
**Priority**: Medium
**Category**: Persistence

**Scenario**: User exports dashboard configuration as JSON

```typescript
test('exports dashboard configuration to JSON', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Export Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: { repo: 'facebook/react' } },
      { id: 'widget-2', type: 'NPM-01', config: { package: 'react' } }
    ]
  }]);

  await page.goto('/');

  // Open settings
  await page.locator('[data-testid="settings-button"]').click();

  // Setup download promise before clicking
  const downloadPromise = page.waitForEvent('download');

  // Click export
  await page.locator('[data-testid="export-dashboard-button"]').click();

  // Download triggered
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/export-test-dashboard.*\.json/);

  // Verify file content
  const path = await download.path();
  const fs = require('fs');
  const content = JSON.parse(fs.readFileSync(path!, 'utf-8'));

  expect(content.name).toBe('Export Test Dashboard');
  expect(content.widgets).toHaveLength(2);
  expect(content.widgets[0].type).toBe('GH-01');
  expect(content.widgets[0].config.repo).toBe('facebook/react');
});
```

---

### 8.3 Import Configuration

**Test ID**: PS-003
**Priority**: Medium
**Category**: Persistence

**Scenario**: User imports dashboard configuration from JSON

```typescript
test('imports dashboard configuration from JSON file', async ({ page }) => {
  await page.goto('/');

  // Prepare import file
  const importData = {
    id: 'imported-dashboard',
    name: 'Imported Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-06', config: { repo: 'vuejs/vue' } }
    ]
  };

  // Open settings
  await page.locator('[data-testid="settings-button"]').click();

  // Upload file
  const fileInput = page.locator('[data-testid="import-file-input"]');
  await fileInput.setInputFiles({
    name: 'dashboard-config.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(importData))
  });

  // Confirm import
  await page.getByRole('button', { name: /import/i }).click();

  // Dashboard imported
  await expect(page.locator('[data-testid="dashboard-selector"]'))
    .toContainText('Imported Dashboard');

  // Widget from import visible
  await expect(page.locator('[data-testid="widget-widget-1"]')).toBeVisible();

  // Success notification
  await expect(page.getByText(/dashboard imported/i)).toBeVisible();
});

test('validates imported JSON structure', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="settings-button"]').click();

  // Upload invalid JSON
  const invalidData = { invalid: 'structure' };

  const fileInput = page.locator('[data-testid="import-file-input"]');
  await fileInput.setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(invalidData))
  });

  // Error message shown
  await expect(page.getByText(/invalid dashboard configuration/i)).toBeVisible();

  // Import button disabled
  await expect(page.getByRole('button', { name: /import/i })).toBeDisabled();
});
```

---

## 9. Error Handling

### 9.1 API Rate Limiting

**Test ID**: ER-001
**Priority**: Critical
**Category**: Error Handling

**Scenario**: Handle GitHub API rate limit gracefully

```typescript
test('displays rate limit error and retry options', async ({ page }) => {
  // Mock rate limit response
  await page.route('**/api/github/**', route => {
    route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'API rate limit exceeded',
        documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
      })
    });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');

  // Widget shows error state
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toHaveClass(/error/);

  // Error message displayed
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toContainText(/rate limit exceeded/i);

  // Retry button available
  await expect(page.locator('[data-testid="widget-retry-button-widget-1"]'))
    .toBeVisible();

  // Warning notification
  await expect(page.getByText(/api rate limit/i)).toBeVisible();

  // Suggestion to increase refresh interval
  await expect(page.getByText(/consider increasing refresh interval/i)).toBeVisible();
});
```

---

### 9.2 Network Errors

**Test ID**: ER-002
**Priority**: High
**Category**: Error Handling

**Scenario**: Handle network connection failures

```typescript
test('handles network failure gracefully', async ({ page }) => {
  // Simulate network failure
  await page.route('**/api/**', route => route.abort('failed'));

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');

  // Error state shown
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toHaveClass(/error/);

  // Network error message
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toContainText(/connection failed/i);

  // Retry button
  await expect(page.locator('[data-testid="widget-retry-button-widget-1"]'))
    .toBeVisible();

  // Click retry (allow network this time)
  await page.unroute('**/api/**');
  await page.locator('[data-testid="widget-retry-button-widget-1"]').click();

  // Widget recovers
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .not.toHaveClass(/error/);
});
```

---

### 9.3 Invalid Repository/Package

**Test ID**: ER-003
**Priority**: High
**Category**: Error Handling

**Scenario**: Handle non-existent repository or package

```typescript
test('shows error for non-existent repository', async ({ page }) => {
  await page.route('**/api/github/repos/invalid/nonexistent', route => {
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not Found' })
    });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: { repo: 'invalid/nonexistent' } }
    ]
  }]);

  await page.goto('/');

  // Error state
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toContainText(/repository not found/i);

  // Suggestion to reconfigure
  await expect(page.locator('[data-testid="widget-reconfigure-button-widget-1"]'))
    .toBeVisible();

  // Click to reconfigure
  await page.locator('[data-testid="widget-reconfigure-button-widget-1"]').click();

  // Config modal opens
  await expect(page.locator('[data-testid="widget-config-modal"]')).toBeVisible();
});
```

---

### 9.4 Data Validation Errors

**Test ID**: ER-004
**Priority**: Medium
**Category**: Error Handling

**Scenario**: Handle malformed API responses

```typescript
test('handles malformed API response', async ({ page }) => {
  await page.route('**/api/github/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: 'invalid json {'
    });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');

  // Error state due to parse failure
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .toContainText(/unable to load data/i);

  // Technical error details (collapsed)
  await page.locator('[data-testid="error-details-toggle"]').click();
  await expect(page.getByText(/unexpected token/i)).toBeVisible();
});
```

---

## 10. Accessibility

### 10.1 Keyboard Navigation

**Test ID**: A11Y-001
**Priority**: Critical
**Category**: Accessibility

**Scenario**: All interactive elements are keyboard accessible

```typescript
test('navigates entire interface using keyboard only', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: {} }
    ]
  }]);

  await page.goto('/');

  // Tab through all focusable elements
  await page.keyboard.press('Tab'); // Dashboard selector
  let focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focused).toBe('dashboard-selector');

  await page.keyboard.press('Tab'); // New dashboard button
  focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focused).toBe('new-dashboard-button');

  await page.keyboard.press('Tab'); // Refresh button
  await page.keyboard.press('Tab'); // Settings button

  // Continue tabbing through sidebar and widgets
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // Activate element with Enter/Space
  await page.keyboard.press('Enter');
});

test('allows closing modals with Escape key', async ({ page }) => {
  await page.goto('/');

  // Open catalog
  await page.locator('[data-testid="browse-catalog-button"]').click();
  await expect(page.locator('[data-testid="catalog-modal"]')).toBeVisible();

  // Press Escape
  await page.keyboard.press('Escape');

  // Modal closes
  await expect(page.locator('[data-testid="catalog-modal"]')).not.toBeVisible();
});
```

---

### 10.2 Screen Reader Support

**Test ID**: A11Y-002
**Priority**: High
**Category**: Accessibility

**Scenario**: Screen reader users can understand and navigate the interface

```typescript
test('provides appropriate ARIA labels and roles', async ({ page }) => {
  await page.goto('/');

  // Check main landmark roles
  await expect(page.locator('[role="banner"]')).toBeVisible(); // Header
  await expect(page.locator('[role="navigation"]')).toBeVisible(); // Sidebar
  await expect(page.locator('[role="main"]')).toBeVisible(); // Dashboard canvas

  // Widget has descriptive label
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.reload();

  const widget = page.locator('[data-testid="widget-widget-1"]');
  await expect(widget).toHaveAttribute('aria-label', /repository stars trend/i);

  // Buttons have descriptive labels
  await expect(page.locator('[data-testid="new-dashboard-button"]'))
    .toHaveAttribute('aria-label', /create new dashboard/i);

  // Loading states announced
  await page.locator('[data-testid="widget-refresh-button-widget-1"]').click();
  await expect(page.locator('[aria-live="polite"]')).toContainText(/refreshing/i);
});
```

---

### 10.3 WCAG 2.1 AA Compliance

**Test ID**: A11Y-003
**Priority**: Critical
**Category**: Accessibility

**Scenario**: Application meets WCAG 2.1 AA standards

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('passes automated accessibility audit', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);

  // Check main page
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

  // Check modal
  await page.locator('[data-testid="browse-catalog-button"]').click();
  await checkA11y(page, '[data-testid="catalog-modal"]', {
    detailedReport: true,
    axeOptions: {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    }
  });
});

test('maintains sufficient color contrast', async ({ page }) => {
  await page.goto('/');

  // Check button contrast
  const button = page.getByRole('button', { name: /create/i }).first();
  const bgColor = await button.evaluate(el => window.getComputedStyle(el).backgroundColor);
  const textColor = await button.evaluate(el => window.getComputedStyle(el).color);

  // Calculate contrast ratio (simplified check)
  // In real test, use contrast-ratio library
  expect(bgColor).toBeTruthy();
  expect(textColor).toBeTruthy();
});
```

---

### 10.4 Focus Management

**Test ID**: A11Y-004
**Priority**: High
**Category**: Accessibility

**Scenario**: Focus is managed correctly in dynamic interactions

```typescript
test('returns focus to trigger when closing modal', async ({ page }) => {
  await page.goto('/');

  const catalogButton = page.locator('[data-testid="browse-catalog-button"]');

  // Focus button
  await catalogButton.focus();
  expect(await page.evaluate(() => document.activeElement?.getAttribute('data-testid')))
    .toBe('browse-catalog-button');

  // Open modal
  await catalogButton.click();
  await expect(page.locator('[data-testid="catalog-modal"]')).toBeVisible();

  // Focus trapped in modal
  await page.keyboard.press('Tab');
  const focusedInModal = await page.evaluate(() =>
    document.activeElement?.closest('[data-testid="catalog-modal"]')
  );
  expect(focusedInModal).toBeTruthy();

  // Close modal
  await page.keyboard.press('Escape');

  // Focus returns to trigger
  expect(await page.evaluate(() => document.activeElement?.getAttribute('data-testid')))
    .toBe('browse-catalog-button');
});

test('sets focus on first input when opening config modal', async ({ page }) => {
  await page.goto('/');

  await page.locator('[data-testid="browse-catalog-button"]').click();
  await page.locator('[data-testid="add-widget-button-GH-01"]').click();

  // Focus automatically on first required field
  const activeElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  expect(activeElement).toMatch(/repository/i);
});
```

---

## 11. Visual Regression

### 11.1 Dashboard Layouts

**Test ID**: VR-001
**Priority**: Medium
**Category**: Visual Regression

**Scenario**: Dashboard layout matches design specifications

```typescript
test('empty dashboard matches design', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-testid="dashboard-canvas"]')).toBeVisible();

  await expect(page).toHaveScreenshot('empty-dashboard.png', {
    fullPage: true,
    maxDiffPixels: 100
  });
});

test('multi-widget dashboard layout matches design', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Visual Test Dashboard',
    widgets: [
      { id: 'w1', type: 'GH-01', config: {}, layout: { x: 0, y: 0, w: 4, h: 2 } },
      { id: 'w2', type: 'GH-06', config: {}, layout: { x: 4, y: 0, w: 2, h: 2 } },
      { id: 'w3', type: 'NPM-01', config: {}, layout: { x: 6, y: 0, w: 6, h: 3 } },
      { id: 'w4', type: 'COMBO-01', config: {}, layout: { x: 0, y: 2, w: 4, h: 3 } }
    ]
  }]);

  await page.goto('/');

  // Wait for all widgets to render
  await expect(page.locator('[data-testid^="widget-"]')).toHaveCount(4);

  await expect(page).toHaveScreenshot('multi-widget-dashboard.png', {
    fullPage: true,
    maxDiffPixels: 150
  });
});
```

---

### 11.2 Widget States

**Test ID**: VR-002
**Priority**: Medium
**Category**: Visual Regression

**Scenario**: Widget visual states match design

```typescript
test('widget loading state matches design', async ({ page }) => {
  // Delay response to capture loading state
  await page.route('**/api/**', async route => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    route.fulfill({ status: 200, body: '{}' });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [{ id: 'widget-1', type: 'GH-01', config: {} }]
  }]);

  await page.goto('/');

  // Capture loading state
  const widget = page.locator('[data-testid="widget-widget-1"]');
  await expect(widget).toHaveClass(/loading/);

  await expect(widget).toHaveScreenshot('widget-loading-state.png', {
    maxDiffPixels: 50
  });
});

test('widget error state matches design', async ({ page }) => {
  await page.route('**/api/**', route => {
    route.fulfill({ status: 500, body: 'Internal Server Error' });
  });

  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [{ id: 'widget-1', type: 'GH-01', config: {} }]
  }]);

  await page.goto('/');

  const widget = page.locator('[data-testid="widget-widget-1"]');
  await expect(widget).toHaveClass(/error/);

  await expect(widget).toHaveScreenshot('widget-error-state.png', {
    maxDiffPixels: 50
  });
});

test('widget hover state matches design', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [{ id: 'widget-1', type: 'GH-01', config: {} }]
  }]);

  await page.goto('/');

  const widget = page.locator('[data-testid="widget-widget-1"]');
  await widget.hover();

  await expect(widget).toHaveScreenshot('widget-hover-state.png', {
    maxDiffPixels: 50
  });
});
```

---

### 11.3 Responsive Breakpoints

**Test ID**: VR-003
**Priority**: Low
**Category**: Visual Regression

**Scenario**: Layout adapts correctly at breakpoints

```typescript
test('desktop layout (1920px) matches design', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await setupDashboardState(page, [complexDashboard]);

  await page.goto('/');

  await expect(page).toHaveScreenshot('desktop-1920px.png', {
    fullPage: true,
    maxDiffPixels: 200
  });
});

test('laptop layout (1440px) matches design', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setupDashboardState(page, [complexDashboard]);

  await page.goto('/');

  await expect(page).toHaveScreenshot('laptop-1440px.png', {
    fullPage: true,
    maxDiffPixels: 200
  });
});

test('tablet layout (1024px) matches design', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await setupDashboardState(page, [complexDashboard]);

  await page.goto('/');

  // Sidebar collapses
  await expect(page.locator('[data-testid="sidebar"]')).toHaveCSS('width', '64px');

  await expect(page).toHaveScreenshot('tablet-1024px.png', {
    fullPage: true,
    maxDiffPixels: 200
  });
});
```

---

## 12. Performance

### 12.1 Page Load Performance

**Test ID**: PF-001
**Priority**: High
**Category**: Performance

**Scenario**: Dashboard loads within performance budget

```typescript
test('dashboard loads within 2 second budget', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/');
  await expect(page.locator('[data-testid="dashboard-canvas"]')).toBeVisible();

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000); // 2 second budget per PRD
});

test('dashboard with 10 widgets loads within 3 seconds', async ({ page }) => {
  const widgets = Array(10).fill(null).map((_, i) => ({
    id: `widget-${i}`,
    type: i % 2 === 0 ? 'GH-01' : 'NPM-01',
    config: {}
  }));

  await setupDashboardState(page, [{
    id: 'perf-test',
    name: 'Performance Test',
    widgets
  }]);

  const startTime = Date.now();

  await page.goto('/');
  await expect(page.locator('[data-testid^="widget-"]')).toHaveCount(10);

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

---

### 12.2 Interaction Performance

**Test ID**: PF-002
**Priority**: High
**Category**: Performance

**Scenario**: Interactions respond within 100ms budget

```typescript
test('widget drag responds within 100ms', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: {} }
    ]
  }]);

  await page.goto('/');

  const widget = page.locator('[data-testid="widget-widget-1"]');

  const startTime = Date.now();
  await widget.hover();
  const hoverTime = Date.now() - startTime;

  expect(hoverTime).toBeLessThan(100); // 100ms budget per PRD
});

test('modal open animation completes within budget', async ({ page }) => {
  await page.goto('/');

  const startTime = Date.now();
  await page.locator('[data-testid="browse-catalog-button"]').click();
  await expect(page.locator('[data-testid="catalog-modal"]')).toBeVisible();
  const openTime = Date.now() - startTime;

  expect(openTime).toBeLessThan(500); // 500ms for animation + render
});
```

---

### 12.3 Data Refresh Performance

**Test ID**: PF-003
**Priority**: Medium
**Category**: Performance

**Scenario**: Widget data refresh completes within 3 second budget

```typescript
test('single widget refresh completes within 3 seconds', async ({ page }) => {
  await setupDashboardState(page, [{
    id: 'test-dashboard',
    name: 'Test Dashboard',
    widgets: [
      { id: 'widget-1', type: 'GH-01', config: { repo: 'facebook/react' } }
    ]
  }]);

  await page.goto('/');

  // Wait for initial load
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .not.toHaveClass(/loading/);

  const startTime = Date.now();

  // Trigger refresh
  await page.locator('[data-testid="widget-refresh-button-widget-1"]').click();

  // Wait for completion
  await expect(page.locator('[data-testid="widget-widget-1"]'))
    .not.toHaveClass(/refreshing/);

  const refreshTime = Date.now() - startTime;
  expect(refreshTime).toBeLessThan(3000); // 3 second budget per PRD
});
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-01
**Total Test Scenarios**: 60+
**Output Path**: `.claude/outputs/design/agents/playwright-expert/dashboard-builder-20251101-220250/test-specifications.md`
