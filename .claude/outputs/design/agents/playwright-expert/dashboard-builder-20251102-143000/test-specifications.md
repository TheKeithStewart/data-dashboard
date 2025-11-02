# E2E Test Specifications: Data Dashboard Builder

**Project**: dashboard-builder
**Timestamp**: 20251102-143000
**Framework**: Playwright
**Test Coverage Goal**: 90%+

---

## 1. Test Strategy

### 1.1 Testing Approach

**Test Pyramid Distribution:**
- Component Tests: 40% (widget rendering, states, interactions)
- User Flow Tests: 40% (multi-step workflows, navigation)
- Integration Tests: 15% (API interactions, data persistence)
- Accessibility Tests: 5% (WCAG AA compliance)

**TDD Workflow Phases:**
1. **Baseline Tests** - Application loads, critical paths accessible
2. **Component Tests** - Individual UI elements and interactions
3. **User Flow Tests** - End-to-end user journeys
4. **Integration Tests** - API calls, localStorage, error handling

**Test Execution Strategy:**
- Parallel execution by test file (4-6 workers)
- Isolated browser contexts per test
- Deterministic test data (no random values)
- Clean localStorage/sessionStorage before each test

### 1.2 Coverage Goals

**Critical User Paths** (100% coverage):
- Dashboard creation and management
- Widget addition and configuration
- Layout manipulation (drag/resize)
- Filter application
- Multi-dashboard navigation

**Feature Coverage** (90%+ overall):
- All 12 widget types testable
- All error states validated
- All responsive breakpoints tested
- Keyboard navigation verified
- Screen reader compatibility confirmed

---

## 2. Test Organization

### 2.1 File Structure

```
tests/
├── baseline/
│   └── application-loads.spec.ts
├── dashboard-management/
│   ├── dashboard-crud.spec.ts
│   └── dashboard-navigation.spec.ts
├── widget-lifecycle/
│   ├── widget-catalog.spec.ts
│   ├── widget-addition.spec.ts
│   ├── widget-configuration.spec.ts
│   └── widget-removal.spec.ts
├── widget-interaction/
│   ├── widget-drag-drop.spec.ts
│   ├── widget-resize.spec.ts
│   └── widget-states.spec.ts
├── filtering/
│   ├── filter-application.spec.ts
│   └── filter-persistence.spec.ts
├── widgets/
│   ├── github-widgets.spec.ts
│   ├── npm-widgets.spec.ts
│   └── cross-source-widgets.spec.ts
├── accessibility/
│   ├── keyboard-navigation.spec.ts
│   ├── screen-reader.spec.ts
│   └── color-contrast.spec.ts
├── integration/
│   ├── github-api.spec.ts
│   ├── npm-api.spec.ts
│   ├── data-caching.spec.ts
│   └── error-handling.spec.ts
└── responsive/
    ├── desktop-layout.spec.ts
    ├── tablet-layout.spec.ts
    └── mobile-layout.spec.ts
```

### 2.2 Test Data Fixtures

**fixtures/dashboards.ts:**
- Sample dashboard configurations
- Widget layouts and positions
- Filter state presets

**fixtures/api-mocks.ts:**
- GitHub API response mocks
- npm API response mocks
- Error response scenarios

**fixtures/widget-configs.ts:**
- Default widget configurations
- Valid/invalid configuration examples

---

## 3. Selector Strategy

### 3.1 Preferred Selectors (Priority Order)

**1. data-testid attributes (PRIMARY):**
```typescript
// Examples from design spec
page.locator('[data-testid="dashboard-create-button"]')
page.locator('[data-testid="widget-catalog-sidebar"]')
page.locator('[data-testid="widget-container-stars-timeline"]')
page.locator('[data-testid="filter-date-range-from"]')
page.locator('[data-testid="table-row"]')
```

**2. Accessible role selectors:**
```typescript
page.getByRole('button', { name: 'New Dashboard' })
page.getByRole('navigation', { name: 'Widget Catalog' })
page.getByRole('dialog', { name: 'Configure Widget' })
page.getByRole('textbox', { name: 'Dashboard Name' })
```

**3. Label-based selectors:**
```typescript
page.getByLabel('Email address')
page.getByLabel('Repository selection')
page.getByLabel('Date range from')
```

**4. Text content selectors:**
```typescript
page.getByText('Project Alpha Dashboard')
page.getByText('Stars Timeline')
```

### 3.2 data-testid Naming Convention

**Pattern**: `[component-type]-[action/identifier]-[element]`

**Dashboard Management:**
- `dashboard-list-container`
- `dashboard-card-{id}`
- `dashboard-create-button`
- `dashboard-edit-button-{id}`
- `dashboard-delete-button-{id}`

**Widget Catalog:**
- `widget-catalog-sidebar`
- `widget-catalog-search`
- `widget-catalog-item-{widget-type}`
- `widget-add-button-{widget-type}`

**Widget Container:**
- `widget-container-{widget-id}`
- `widget-header-{widget-id}`
- `widget-settings-button-{widget-id}`
- `widget-remove-button-{widget-id}`
- `widget-content-{widget-id}`

**Filters:**
- `filter-panel-sidebar`
- `filter-date-range-from`
- `filter-date-range-to`
- `filter-repo-checkbox-{repo-name}`
- `filter-apply-button`
- `filter-reset-button`

**Configuration Modal:**
- `config-modal`
- `config-form`
- `config-save-button`
- `config-cancel-button`

---

## 4. Baseline Tests

### 4.1 Application Loads

**Test: Application loads successfully**
```typescript
test('loads homepage without errors', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page).toHaveTitle(/Dashboard Builder/);
});
```

**Acceptance Criteria:**
- Page loads within 2 seconds
- No console errors
- Logo visible
- User menu present

**Test: Dashboard management page accessible**
```typescript
test('navigates to dashboard management', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await expect(page).toHaveURL('/dashboards');
  await expect(page.getByTestId('dashboard-list-container')).toBeVisible();
});
```

**Test: No JavaScript errors on startup**
```typescript
test('loads without JavaScript errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(errors).toHaveLength(0);
});
```

---

## 5. User Story Tests

### 5.1 Story 1: View Dashboard List

**Test: Display all dashboards with metadata**
```typescript
test('displays dashboard list with metadata', async ({ page }) => {
  // Setup: Create 3 test dashboards
  await createTestDashboards(page, 3);

  await page.goto('/dashboards');

  const cards = page.locator('[data-testid^="dashboard-card-"]');
  await expect(cards).toHaveCount(3);

  // Verify first card has all elements
  const firstCard = cards.first();
  await expect(firstCard.locator('[data-testid="dashboard-thumbnail"]')).toBeVisible();
  await expect(firstCard.locator('[data-testid="dashboard-name"]')).toContainText(/.+/);
  await expect(firstCard.locator('[data-testid="dashboard-modified"]')).toContainText(/Modified .+ ago/);
  await expect(firstCard.locator('[data-testid="dashboard-edit-button"]')).toBeVisible();
  await expect(firstCard.locator('[data-testid="dashboard-delete-button"]')).toBeVisible();
});
```

**Acceptance Criteria:**
- All dashboards visible in grid layout
- Each card shows preview thumbnail
- Name and modified date displayed
- Edit and Delete buttons present

### 5.2 Story 2: Create Dashboard

**Test: Create new dashboard**
```typescript
test('creates new dashboard and redirects to editor', async ({ page }) => {
  await page.goto('/dashboards');

  await page.getByTestId('dashboard-create-button').click();

  // Modal appears
  await expect(page.getByRole('dialog')).toBeVisible();

  // Enter dashboard name
  await page.getByLabel('Dashboard Name').fill('Test Project');
  await page.getByTestId('modal-create-button').click();

  // Redirected to dashboard view
  await expect(page).toHaveURL(/\/dashboard\/.+/);
  await expect(page.getByText('Test Project')).toBeVisible();

  // Empty state shown
  await expect(page.getByTestId('empty-dashboard-state')).toBeVisible();
  await expect(page.getByText('Empty dashboard')).toBeVisible();
});
```

**Acceptance Criteria:**
- Modal opens on button click
- Dashboard created with provided name
- User redirected to edit view
- Empty canvas displayed
- Sidebar opens to catalog by default

**Test: Validate dashboard name requirement**
```typescript
test('prevents creation with empty name', async ({ page }) => {
  await page.goto('/dashboards');
  await page.getByTestId('dashboard-create-button').click();

  const createButton = page.getByTestId('modal-create-button');
  await expect(createButton).toBeDisabled();

  await page.getByLabel('Dashboard Name').fill('A');
  await expect(createButton).toBeEnabled();

  await page.getByLabel('Dashboard Name').clear();
  await expect(createButton).toBeDisabled();
});
```

### 5.3 Story 3: Rename and Delete Dashboard

**Test: Rename dashboard**
```typescript
test('renames dashboard successfully', async ({ page }) => {
  await page.goto('/dashboards');

  const card = page.getByTestId('dashboard-card-1');
  await card.getByTestId('dashboard-edit-button').click();

  // In dashboard view, click title to edit
  await page.getByTestId('dashboard-title').click();
  await page.getByTestId('dashboard-title-input').fill('Renamed Project');
  await page.keyboard.press('Enter');

  // Navigate back to list
  await page.getByTestId('dashboard-back-button').click();

  // Verify name updated
  await expect(card.getByTestId('dashboard-name')).toContainText('Renamed Project');
});
```

**Test: Delete dashboard with confirmation**
```typescript
test('deletes dashboard after confirmation', async ({ page }) => {
  await page.goto('/dashboards');

  const initialCount = await page.locator('[data-testid^="dashboard-card-"]').count();

  await page.getByTestId('dashboard-delete-button-1').click();

  // Confirmation dialog appears
  const dialog = page.getByRole('dialog', { name: 'Delete Dashboard?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/cannot be undone/)).toBeVisible();

  await dialog.getByRole('button', { name: 'Delete' }).click();

  // Dashboard removed from list
  const cards = page.locator('[data-testid^="dashboard-card-"]');
  await expect(cards).toHaveCount(initialCount - 1);

  // Toast notification shown
  await expect(page.getByTestId('toast-notification')).toContainText('Dashboard deleted');
});
```

**Test: Cancel dashboard deletion**
```typescript
test('cancels deletion on dialog cancel', async ({ page }) => {
  await page.goto('/dashboards');

  const initialCount = await page.locator('[data-testid^="dashboard-card-"]').count();

  await page.getByTestId('dashboard-delete-button-1').click();
  await page.getByRole('button', { name: 'Cancel' }).click();

  // Dashboard still present
  await expect(page.locator('[data-testid^="dashboard-card-"]')).toHaveCount(initialCount);
});
```

### 5.4 Story 4: Browse Widget Catalog

**Test: Open widget catalog sidebar**
```typescript
test('displays widget catalog with categories', async ({ page }) => {
  await page.goto('/dashboard/test-id');

  // Sidebar visible by default
  const sidebar = page.getByTestId('widget-catalog-sidebar');
  await expect(sidebar).toBeVisible();

  // Search input present
  await expect(sidebar.getByTestId('widget-catalog-search')).toBeVisible();

  // Categories visible
  await expect(sidebar.getByText('GitHub')).toBeVisible();
  await expect(sidebar.getByText('npm')).toBeVisible();

  // Expand GitHub category
  await sidebar.getByRole('button', { name: 'GitHub' }).click();

  // Widget items visible
  await expect(sidebar.getByTestId('widget-catalog-item-stars-timeline')).toBeVisible();
  await expect(sidebar.getByTestId('widget-catalog-item-recent-issues')).toBeVisible();

  // Widget metadata shown
  const starWidget = sidebar.getByTestId('widget-catalog-item-stars-timeline');
  await expect(starWidget.getByTestId('widget-icon')).toBeVisible();
  await expect(starWidget.getByTestId('widget-name')).toContainText('Repository Stars Timeline');
  await expect(starWidget.getByTestId('widget-description')).toContainText(/star growth/i);
});
```

**Acceptance Criteria:**
- Sidebar visible on dashboard view
- Search input present
- Widgets grouped by category
- Each widget shows icon, name, description
- Data source indicators visible

**Test: Search widget catalog**
```typescript
test('filters widgets by search term', async ({ page }) => {
  await page.goto('/dashboard/test-id');

  const sidebar = page.getByTestId('widget-catalog-sidebar');
  await sidebar.getByTestId('widget-catalog-search').fill('download');

  // Only download-related widgets visible
  await expect(sidebar.getByTestId('widget-catalog-item-download-trends')).toBeVisible();
  await expect(sidebar.getByTestId('widget-catalog-item-stars-timeline')).not.toBeVisible();

  // Clear search
  await sidebar.getByTestId('widget-catalog-search').clear();
  await expect(sidebar.getByTestId('widget-catalog-item-stars-timeline')).toBeVisible();
});
```

### 5.5 Story 5: Add Widget from Catalog

**Test: Add widget to dashboard**
```typescript
test('adds widget from catalog to canvas', async ({ page }) => {
  await page.goto('/dashboard/test-id');

  const sidebar = page.getByTestId('widget-catalog-sidebar');
  const canvas = page.getByTestId('dashboard-canvas');

  // Initially empty canvas
  await expect(canvas.locator('[data-testid^="widget-container-"]')).toHaveCount(0);

  // Add Stars Timeline widget
  await sidebar.getByTestId('widget-add-button-stars-timeline').click();

  // Widget appears on canvas
  const widget = canvas.getByTestId('widget-container-stars-timeline-0');
  await expect(widget).toBeVisible();

  // Widget in unconfigured state
  await expect(widget.getByTestId('widget-empty-state')).toBeVisible();
  await expect(widget.getByText('Not Configured')).toBeVisible();

  // Configure button present
  await expect(widget.getByTestId('widget-configure-button')).toBeVisible();

  // Toast notification
  await expect(page.getByTestId('toast-notification')).toContainText('Repository Stars Timeline added');
});
```

**Acceptance Criteria:**
- Widget appears on canvas after clicking Add
- Widget placed in next available grid position
- Empty/unconfigured state shown
- Settings button visible in widget header
- Toast notification confirms addition

**Test: Add multiple widgets**
```typescript
test('adds multiple widgets to canvas', async ({ page }) => {
  await page.goto('/dashboard/test-id');

  const sidebar = page.getByTestId('widget-catalog-sidebar');
  const canvas = page.getByTestId('dashboard-canvas');

  // Add 3 widgets
  await sidebar.getByTestId('widget-add-button-stars-timeline').click();
  await sidebar.getByTestId('widget-add-button-recent-issues').click();
  await sidebar.getByTestId('widget-add-button-download-trends').click();

  // All widgets visible
  await expect(canvas.locator('[data-testid^="widget-container-"]')).toHaveCount(3);

  // Widgets positioned in grid (non-overlapping)
  const widgets = await canvas.locator('[data-testid^="widget-container-"]').all();
  const positions = await Promise.all(
    widgets.map(w => w.boundingBox())
  );

  // Verify no overlap (simplified check)
  expect(positions[0]?.y).toBeLessThan(positions[1]?.y || Infinity);
});
```

### 5.6 Story 6: Resize and Reposition Widgets

**Test: Drag widget to new position**
```typescript
test('drags widget to reposition', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');
  const initialBox = await widget.boundingBox();

  // Drag widget header
  const header = widget.getByTestId('widget-header');
  await header.hover();
  await expect(header).toHaveCSS('cursor', 'move');

  await header.dragTo(page.getByTestId('dashboard-canvas'), {
    targetPosition: { x: 500, y: 300 }
  });

  const newBox = await widget.boundingBox();

  // Position changed
  expect(newBox?.x).not.toBe(initialBox?.x);
  expect(newBox?.y).not.toBe(initialBox?.y);

  // Layout persisted (reload and check)
  await page.reload();
  const reloadedBox = await widget.boundingBox();
  expect(reloadedBox?.x).toBe(newBox?.x);
});
```

**Test: Resize widget**
```typescript
test('resizes widget by dragging handle', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');
  const initialBox = await widget.boundingBox();

  // Hover bottom-right corner to show resize handle
  const handle = widget.getByTestId('widget-resize-handle');
  await handle.hover();

  // Drag to resize
  await handle.dragTo(widget, {
    targetPosition: {
      x: (initialBox?.width || 0) + 200,
      y: (initialBox?.height || 0) + 100
    }
  });

  const newBox = await widget.boundingBox();

  // Size increased
  expect(newBox?.width).toBeGreaterThan(initialBox?.width || 0);
  expect(newBox?.height).toBeGreaterThan(initialBox?.height || 0);
});
```

**Acceptance Criteria:**
- Widget drags smoothly with cursor
- Grid snapping prevents overlap
- Other widgets shift to accommodate
- Resize handle visible on hover
- Min/max size constraints enforced
- Layout persisted to localStorage

### 5.7 Story 7: Configure Widget

**Test: Open widget configuration modal**
```typescript
test('opens configuration modal for widget', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');
  await widget.getByTestId('widget-settings-button').click();

  // Modal visible
  const modal = page.getByRole('dialog', { name: 'Configure: Repository Stars Timeline' });
  await expect(modal).toBeVisible();

  // Form fields present
  await expect(modal.getByLabel('Repository')).toBeVisible();
  await expect(modal.getByLabel('Chart Type')).toBeVisible();
  await expect(modal.getByLabel('Time Range')).toBeVisible();
  await expect(modal.getByTestId('config-save-button')).toBeVisible();
  await expect(modal.getByTestId('config-cancel-button')).toBeVisible();
});
```

**Test: Configure widget with valid data**
```typescript
test('saves widget configuration and fetches data', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');
  await widget.getByTestId('widget-settings-button').click();

  const modal = page.getByRole('dialog');

  // Fill configuration
  await modal.getByLabel('Repository').fill('facebook/react');
  await modal.getByLabel('Chart Type').selectOption('Line Chart');
  await modal.getByTestId('config-save-button').click();

  // Modal closes
  await expect(modal).not.toBeVisible();

  // Widget shows loading state
  await expect(widget.getByTestId('widget-loading-state')).toBeVisible();
  await expect(widget.getByText('Loading data...')).toBeVisible();

  // Wait for data fetch
  await expect(widget.getByTestId('widget-loading-state')).not.toBeVisible({ timeout: 10000 });

  // Chart rendered
  await expect(widget.getByTestId('widget-chart')).toBeVisible();
  await expect(widget.getByText('facebook/react')).toBeVisible();
  await expect(widget.getByText(/Last updated:/)).toBeVisible();

  // Toast notification
  await expect(page.getByTestId('toast-notification')).toContainText('Widget configuration saved');
});
```

**Acceptance Criteria:**
- Settings icon opens configuration modal
- Modal pre-filled with current config
- Form validation provides real-time feedback
- Save triggers data fetch
- Widget transitions: empty → loading → success
- Configuration persisted on page reload

### 5.8 Story 8: Remove Widget

**Test: Remove widget from dashboard**
```typescript
test('removes widget with confirmation', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const canvas = page.getByTestId('dashboard-canvas');
  await expect(canvas.locator('[data-testid^="widget-container-"]')).toHaveCount(1);

  const widget = page.getByTestId('widget-container-stars-timeline-0');
  await widget.getByTestId('widget-remove-button').click();

  // Confirmation dialog
  const dialog = page.getByRole('dialog', { name: 'Remove Widget?' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Remove' }).click();

  // Widget removed
  await expect(widget).not.toBeVisible();
  await expect(canvas.locator('[data-testid^="widget-container-"]')).toHaveCount(0);

  // Toast notification
  await expect(page.getByTestId('toast-notification')).toContainText('Widget removed');
});
```

### 5.9 Story 9: Apply Board-Level Filters

**Test: Apply date range filter to widgets**
```typescript
test('applies date range filter to all compatible widgets', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');
  await addTestWidget(page, 'download-trends');

  // Open filter panel
  const filterPanel = page.getByTestId('filter-panel-sidebar');
  await filterPanel.getByRole('button', { name: 'Date Range' }).click();

  // Set date range
  await filterPanel.getByTestId('filter-date-range-from').fill('2024-01-01');
  await filterPanel.getByTestId('filter-date-range-to').fill('2024-12-31');

  // Apply filters
  await filterPanel.getByTestId('filter-apply-button').click();

  // Both widgets show loading state
  const widgets = page.locator('[data-testid^="widget-container-"]');
  await expect(widgets.first().getByTestId('widget-loading-state')).toBeVisible();
  await expect(widgets.last().getByTestId('widget-loading-state')).toBeVisible();

  // Wait for data refetch
  await page.waitForLoadState('networkidle');

  // Active filter badge shown
  await expect(filterPanel.getByTestId('active-filters-badge')).toContainText('2');

  // Toast notification
  await expect(page.getByTestId('toast-notification')).toContainText('Filters applied to 2 widgets');
});
```

**Test: Reset filters**
```typescript
test('resets all filters to default', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const filterPanel = page.getByTestId('filter-panel-sidebar');

  // Apply filters
  await filterPanel.getByTestId('filter-date-range-from').fill('2024-01-01');
  await filterPanel.getByTestId('filter-apply-button').click();

  await expect(filterPanel.getByTestId('active-filters-badge')).toBeVisible();

  // Reset filters
  await filterPanel.getByTestId('filter-reset-button').click();

  // Badge removed
  await expect(filterPanel.getByTestId('active-filters-badge')).not.toBeVisible();

  // Date field cleared
  await expect(filterPanel.getByTestId('filter-date-range-from')).toHaveValue('');
});
```

**Acceptance Criteria:**
- Filter panel accessible in sidebar
- Date range, repository filters available
- Apply button triggers widget updates
- Active filter indicators shown
- Reset clears all filters
- Filter state persisted per dashboard

### 5.10 Story 10: Switch Between Dashboards

**Test: Navigate between multiple dashboards**
```typescript
test('switches between dashboards with persisted state', async ({ page }) => {
  await page.goto('/dashboards');

  // Create two dashboards
  await createDashboard(page, 'Project A');
  await addTestWidget(page, 'stars-timeline');

  await page.getByTestId('dashboard-back-button').click();

  await createDashboard(page, 'Project B');
  await addTestWidget(page, 'download-trends');

  // Switch back to Project A
  await page.getByTestId('dashboard-back-button').click();
  await page.getByTestId('dashboard-card-project-a').getByTestId('dashboard-edit-button').click();

  // Project A state restored
  await expect(page.getByText('Project A')).toBeVisible();
  await expect(page.getByTestId('widget-container-stars-timeline-0')).toBeVisible();
  await expect(page.getByTestId('widget-container-download-trends-0')).not.toBeVisible();

  // Switch to Project B via dashboard switcher
  await page.getByTestId('dashboard-switcher').click();
  await page.getByRole('option', { name: 'Project B' }).click();

  // Project B state restored
  await expect(page.getByText('Project B')).toBeVisible();
  await expect(page.getByTestId('widget-container-download-trends-0')).toBeVisible();
  await expect(page.getByTestId('widget-container-stars-timeline-0')).not.toBeVisible();
});
```

**Acceptance Criteria:**
- Dashboard switcher in header
- All dashboards listed in dropdown
- Clicking dashboard loads its configuration
- Widget positions and configs restored
- Filter state restored per dashboard

### 5.11 Story 11: Widget Framework Extensibility

**Test: New widget registers and appears in catalog**
```typescript
test('new widget type appears in catalog after registration', async ({ page }) => {
  // This tests the widget registry pattern
  // Assumes a new widget has been added to the codebase

  await page.goto('/dashboard/test-id');

  const sidebar = page.getByTestId('widget-catalog-sidebar');

  // New widget visible in catalog
  await expect(sidebar.getByTestId('widget-catalog-item-new-widget-type')).toBeVisible();

  // Can be added to canvas
  await sidebar.getByTestId('widget-add-button-new-widget-type').click();

  const widget = page.getByTestId('widget-container-new-widget-type-0');
  await expect(widget).toBeVisible();

  // Has standard widget lifecycle
  await expect(widget.getByTestId('widget-header')).toBeVisible();
  await expect(widget.getByTestId('widget-settings-button')).toBeVisible();
  await expect(widget.getByTestId('widget-remove-button')).toBeVisible();
});
```

### 5.12 Story 12: Data Adapter Pattern

**Test: Widget switches between data sources**
```typescript
test('widget handles data source change gracefully', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'comparison-widget'); // Cross-source widget

  const widget = page.getByTestId('widget-container-comparison-widget-0');

  // Configure with GitHub source
  await widget.getByTestId('widget-settings-button').click();
  const modal = page.getByRole('dialog');

  await modal.getByLabel('Data Source').selectOption('GitHub');
  await modal.getByLabel('Repository').fill('facebook/react');
  await modal.getByTestId('config-save-button').click();

  await expect(widget.getByTestId('widget-loading-state')).toBeVisible();
  await expect(widget.getByTestId('widget-chart')).toBeVisible({ timeout: 10000 });

  // Switch to npm source
  await widget.getByTestId('widget-settings-button').click();
  await modal.getByLabel('Data Source').selectOption('npm');
  await modal.getByLabel('Package').fill('react');
  await modal.getByTestId('config-save-button').click();

  // Widget re-fetches with new source
  await expect(widget.getByTestId('widget-loading-state')).toBeVisible();
  await expect(widget.getByTestId('widget-chart')).toBeVisible({ timeout: 10000 });

  // No errors thrown
  const errors = await page.evaluate(() => window.console.error);
  expect(errors).toBeUndefined();
});
```

---

## 6. Widget State Tests

### 6.1 Loading States

**Test: Widget shows loading spinner during data fetch**
```typescript
test('displays loading state while fetching data', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');

  // Configure widget (triggers fetch)
  await widget.getByTestId('widget-settings-button').click();
  await page.getByLabel('Repository').fill('facebook/react');
  await page.getByTestId('config-save-button').click();

  // Loading state visible
  const loadingState = widget.getByTestId('widget-loading-state');
  await expect(loadingState).toBeVisible();
  await expect(loadingState.getByText('Loading data...')).toBeVisible();
  await expect(loadingState.getByTestId('loading-spinner')).toBeVisible();

  // Settings button disabled during load
  await expect(widget.getByTestId('widget-settings-button')).toBeDisabled();
});
```

### 6.2 Error States

**Test: Widget shows error state on API failure**
```typescript
test('displays error state on failed API request', async ({ page }) => {
  // Mock API failure
  await page.route('**/api/github/**', route => route.abort());

  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');

  // Configure widget
  await widget.getByTestId('widget-settings-button').click();
  await page.getByLabel('Repository').fill('invalid/repo');
  await page.getByTestId('config-save-button').click();

  // Error state shown
  const errorState = widget.getByTestId('widget-error-state');
  await expect(errorState).toBeVisible();
  await expect(errorState.getByText('⚠️ Data Unavailable')).toBeVisible();
  await expect(errorState.getByText(/Unable to fetch/)).toBeVisible();

  // Retry and Configure buttons present
  await expect(errorState.getByTestId('error-retry-button')).toBeVisible();
  await expect(errorState.getByTestId('error-configure-button')).toBeVisible();
});
```

**Test: Retry button refetches data**
```typescript
test('retry button triggers new data fetch', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');

  // Trigger error state
  // ... (similar setup as above)

  let fetchCount = 0;
  await page.route('**/api/github/**', route => {
    fetchCount++;
    if (fetchCount === 1) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Click retry
  await widget.getByTestId('error-retry-button').click();

  // Loading state shown
  await expect(widget.getByTestId('widget-loading-state')).toBeVisible();

  // Success state after retry
  await expect(widget.getByTestId('widget-chart')).toBeVisible({ timeout: 10000 });

  expect(fetchCount).toBe(2);
});
```

### 6.3 Empty/Unconfigured States

**Test: Widget shows empty state when not configured**
```typescript
test('displays unconfigured state for new widget', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');

  const emptyState = widget.getByTestId('widget-empty-state');
  await expect(emptyState).toBeVisible();
  await expect(emptyState.getByText('📊 Not Configured')).toBeVisible();
  await expect(emptyState.getByText('Select a repository to display star growth')).toBeVisible();
  await expect(emptyState.getByTestId('widget-configure-button')).toBeVisible();
});
```

---

## 7. Integration Tests

### 7.1 GitHub API Integration

**Test: Fetch repository data successfully**
```typescript
test('fetches GitHub repository data', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'repo-overview');

  const widget = page.getByTestId('widget-container-repo-overview-0');

  // Configure with real repo
  await widget.getByTestId('widget-settings-button').click();
  await page.getByLabel('Repository').fill('facebook/react');
  await page.getByTestId('config-save-button').click();

  // Wait for API response
  await page.waitForResponse(response =>
    response.url().includes('/api/github/repos/facebook/react') &&
    response.status() === 200
  );

  // Verify data displayed
  await expect(widget.getByTestId('metric-stars')).toContainText(/\d+/);
  await expect(widget.getByTestId('metric-forks')).toContainText(/\d+/);
  await expect(widget.getByTestId('metric-watchers')).toContainText(/\d+/);
});
```

**Test: Handle GitHub rate limit**
```typescript
test('displays rate limit message when quota exceeded', async ({ page }) => {
  // Mock rate limit response
  await page.route('**/api/github/**', route => {
    route.fulfill({
      status: 403,
      body: JSON.stringify({
        message: 'API rate limit exceeded',
        documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
      })
    });
  });

  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');

  await widget.getByTestId('widget-settings-button').click();
  await page.getByLabel('Repository').fill('facebook/react');
  await page.getByTestId('config-save-button').click();

  // Rate limit error shown
  const errorState = widget.getByTestId('widget-error-state');
  await expect(errorState).toContainText('Rate limit exceeded');

  // Retry button disabled with countdown
  const retryButton = errorState.getByTestId('error-retry-button');
  await expect(retryButton).toBeDisabled();
  await expect(retryButton).toContainText(/Try again in \d+ minutes/);
});
```

### 7.2 npm API Integration

**Test: Fetch npm package data**
```typescript
test('fetches npm package statistics', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'package-quality');

  const widget = page.getByTestId('widget-container-package-quality-0');

  await widget.getByTestId('widget-settings-button').click();
  await page.getByLabel('Package Name').fill('react');
  await page.getByTestId('config-save-button').click();

  // Wait for npm API response
  await page.waitForResponse(response =>
    response.url().includes('/api/npm/package/react') &&
    response.status() === 200
  );

  // Quality scores displayed
  await expect(widget.getByTestId('quality-score')).toContainText(/\d+/);
  await expect(widget.getByTestId('popularity-score')).toContainText(/\d+/);
  await expect(widget.getByTestId('maintenance-score')).toContainText(/\d+/);
});
```

### 7.3 Data Caching

**Test: Cache prevents redundant API calls**
```typescript
test('uses cached data for repeated requests', async ({ page }) => {
  let fetchCount = 0;
  await page.route('**/api/github/repos/facebook/react', route => {
    fetchCount++;
    route.continue();
  });

  await page.goto('/dashboard/test-id');

  // Add widget and configure
  await addTestWidget(page, 'stars-timeline');
  const widget = page.getByTestId('widget-container-stars-timeline-0');
  await widget.getByTestId('widget-settings-button').click();
  await page.getByLabel('Repository').fill('facebook/react');
  await page.getByTestId('config-save-button').click();

  await expect(widget.getByTestId('widget-chart')).toBeVisible();
  expect(fetchCount).toBe(1);

  // Add same widget type with same config
  await addTestWidget(page, 'stars-timeline');
  const widget2 = page.locator('[data-testid^="widget-container-stars-timeline"]').last();
  await widget2.getByTestId('widget-settings-button').click();
  await page.getByLabel('Repository').fill('facebook/react');
  await page.getByTestId('config-save-button').click();

  await expect(widget2.getByTestId('widget-chart')).toBeVisible();

  // Should use cached data, no new fetch
  expect(fetchCount).toBe(1);
});
```

### 7.4 localStorage Persistence

**Test: Dashboard configuration persists across sessions**
```typescript
test('saves and restores dashboard configuration', async ({ page }) => {
  await page.goto('/dashboards');
  await createDashboard(page, 'Persistent Test');

  // Add widgets and configure
  await addTestWidget(page, 'stars-timeline');
  const widget = page.getByTestId('widget-container-stars-timeline-0');
  await widget.getByTestId('widget-settings-button').click();
  await page.getByLabel('Repository').fill('facebook/react');
  await page.getByTestId('config-save-button').click();

  // Get widget position
  const position = await widget.boundingBox();

  // Reload page
  await page.reload();

  // Configuration restored
  await expect(page.getByText('Persistent Test')).toBeVisible();
  await expect(widget).toBeVisible();
  await expect(widget.getByTestId('widget-chart')).toBeVisible();

  // Position preserved
  const restoredPosition = await widget.boundingBox();
  expect(restoredPosition?.x).toBe(position?.x);
  expect(restoredPosition?.y).toBe(position?.y);
});
```

---

## 8. Accessibility Tests

### 8.1 Keyboard Navigation

**Test: Tab order follows logical flow**
```typescript
test('tab navigation follows top-to-bottom, left-to-right order', async ({ page }) => {
  await page.goto('/dashboards');

  // Focus first interactive element
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('dashboard-create-button')).toBeFocused();

  // Tab to first dashboard card
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('dashboard-edit-button-1')).toBeFocused();

  // Tab to delete button
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('dashboard-delete-button-1')).toBeFocused();
});
```

**Test: Keyboard widget manipulation**
```typescript
test('moves widget using arrow keys', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');
  const initialBox = await widget.boundingBox();

  // Focus widget
  await widget.focus();

  // Enter "move mode"
  await page.keyboard.press('Enter');

  // Move with arrow keys
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');

  // Exit move mode
  await page.keyboard.press('Enter');

  const newBox = await widget.boundingBox();

  // Position changed
  expect(newBox?.x).toBeGreaterThan(initialBox?.x || 0);
  expect(newBox?.y).toBeGreaterThan(initialBox?.y || 0);
});
```

**Test: Escape key closes modals**
```typescript
test('escape key closes configuration modal', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');
  await widget.getByTestId('widget-settings-button').click();

  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
});
```

**Test: Focus visible on all interactive elements**
```typescript
test('all interactive elements have visible focus indicators', async ({ page }) => {
  await page.goto('/dashboards');

  const button = page.getByTestId('dashboard-create-button');
  await button.focus();

  // Check focus outline
  const outline = await button.evaluate(el =>
    window.getComputedStyle(el).outline
  );

  expect(outline).toContain('2px solid');
  expect(outline).toContain('rgb(0, 118, 214)'); // --salt-blue-500
});
```

### 8.2 Screen Reader Support

**Test: ARIA landmarks present**
```typescript
test('page has proper ARIA landmarks', async ({ page }) => {
  await page.goto('/dashboard/test-id');

  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('complementary')).toBeVisible(); // Sidebar
});
```

**Test: Widget state announced to screen readers**
```typescript
test('widget loading state announced', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');

  await widget.getByTestId('widget-settings-button').click();
  await page.getByLabel('Repository').fill('facebook/react');
  await page.getByTestId('config-save-button').click();

  // Check aria-live region
  const liveRegion = widget.getByRole('status');
  await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  await expect(liveRegion).toHaveText('Loading data...');
});
```

**Test: Icon buttons have accessible labels**
```typescript
test('icon-only buttons have aria-label', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');

  const settingsButton = widget.getByTestId('widget-settings-button');
  await expect(settingsButton).toHaveAttribute('aria-label', /settings|configure/i);

  const removeButton = widget.getByTestId('widget-remove-button');
  await expect(removeButton).toHaveAttribute('aria-label', /remove|delete/i);
});
```

### 8.3 Color Contrast

**Test: Text meets WCAG AA contrast ratios**
```typescript
test('primary text has sufficient contrast', async ({ page }) => {
  await page.goto('/dashboards');

  const title = page.getByRole('heading', { name: 'My Dashboards' });

  const textColor = await title.evaluate(el =>
    window.getComputedStyle(el).color
  );
  const bgColor = await title.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );

  // Calculate contrast ratio (simplified check)
  // In practice, use a library like axe-core
  const contrast = calculateContrastRatio(textColor, bgColor);
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});
```

**Test: Error states use color and icons**
```typescript
test('error states do not rely on color alone', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');

  // Trigger error state
  // ...

  const errorState = widget.getByTestId('widget-error-state');

  // Icon present (not just red text)
  await expect(errorState.getByText('⚠️')).toBeVisible();

  // Descriptive text
  await expect(errorState.getByText(/Unable to fetch/)).toBeVisible();
});
```

---

## 9. Responsive Layout Tests

### 9.1 Desktop Layout (≥1280px)

**Test: 12-column grid layout on desktop**
```typescript
test('displays 12-column grid on desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/dashboard/test-id');

  const canvas = page.getByTestId('dashboard-canvas');

  // Check grid configuration
  const gridColumns = await canvas.evaluate(el =>
    window.getComputedStyle(el).gridTemplateColumns
  );

  const columnCount = gridColumns.split(' ').length;
  expect(columnCount).toBe(12);

  // Sidebar visible and fixed width
  const sidebar = page.getByTestId('widget-catalog-sidebar');
  await expect(sidebar).toBeVisible();

  const sidebarWidth = await sidebar.evaluate(el => el.offsetWidth);
  expect(sidebarWidth).toBe(280);
});
```

### 9.2 Tablet Layout (768-1279px)

**Test: 8-column grid layout on tablet**
```typescript
test('adapts to 8-column grid on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/dashboard/test-id');

  const canvas = page.getByTestId('dashboard-canvas');

  const gridColumns = await canvas.evaluate(el =>
    window.getComputedStyle(el).gridTemplateColumns
  );

  const columnCount = gridColumns.split(' ').length;
  expect(columnCount).toBe(8);

  // Sidebar collapsed by default
  const sidebar = page.getByTestId('widget-catalog-sidebar');
  await expect(sidebar).toHaveCSS('transform', /translate/);
});
```

### 9.3 Mobile Layout (<768px)

**Test: 4-column stacked layout on mobile**
```typescript
test('stacks widgets in 4-column grid on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/dashboard/test-id');

  await addTestWidget(page, 'stars-timeline');
  await addTestWidget(page, 'download-trends');

  const widgets = page.locator('[data-testid^="widget-container-"]');

  // All widgets full width (4 columns = 100%)
  const firstWidth = await widgets.first().evaluate(el => el.offsetWidth);
  const lastWidth = await widgets.last().evaluate(el => el.offsetWidth);

  expect(firstWidth).toBe(lastWidth);

  // Sidebar as full-screen drawer
  const sidebar = page.getByTestId('widget-catalog-sidebar');
  await expect(sidebar).not.toBeVisible();

  // Open sidebar
  await page.getByTestId('sidebar-toggle-button').click();
  await expect(sidebar).toBeVisible();

  const sidebarWidth = await sidebar.evaluate(el => el.offsetWidth);
  expect(sidebarWidth).toBeGreaterThan(300); // Full screen
});
```

---

## 10. Performance Tests

### 10.1 Page Load Time

**Test: Dashboard loads within performance budget**
```typescript
test('dashboard loads within 2 seconds', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/dashboard/test-id');
  await page.waitForSelector('[data-testid="dashboard-canvas"]');

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000);
});
```

### 10.2 Widget Rendering Performance

**Test: Widget renders quickly after data fetch**
```typescript
test('widget renders within 100ms after data received', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  const widget = page.getByTestId('widget-container-stars-timeline-0');

  await widget.getByTestId('widget-settings-button').click();
  await page.getByLabel('Repository').fill('facebook/react');

  // Wait for API response
  const responsePromise = page.waitForResponse(response =>
    response.url().includes('/api/github/')
  );

  await page.getByTestId('config-save-button').click();

  const response = await responsePromise;
  const responseTime = Date.now();

  // Wait for chart to appear
  await expect(widget.getByTestId('widget-chart')).toBeVisible();
  const renderTime = Date.now();

  const renderDuration = renderTime - responseTime;
  expect(renderDuration).toBeLessThan(100);
});
```

---

## 11. Test Fixtures and Helpers

### 11.1 Helper Functions

```typescript
// fixtures/helpers.ts

export async function createDashboard(page: Page, name: string) {
  await page.getByTestId('dashboard-create-button').click();
  await page.getByLabel('Dashboard Name').fill(name);
  await page.getByTestId('modal-create-button').click();
  await page.waitForURL(/\/dashboard\/.+/);
}

export async function addTestWidget(page: Page, widgetType: string) {
  const sidebar = page.getByTestId('widget-catalog-sidebar');
  await sidebar.getByTestId(`widget-add-button-${widgetType}`).click();
  await page.waitForSelector(`[data-testid^="widget-container-${widgetType}"]`);
}

export async function createTestDashboards(page: Page, count: number) {
  for (let i = 0; i < count; i++) {
    await createDashboard(page, `Test Dashboard ${i + 1}`);
    await page.getByTestId('dashboard-back-button').click();
  }
}

export function calculateContrastRatio(fg: string, bg: string): number {
  // Implementation of WCAG contrast calculation
  // ... (use library like colorjs.io)
}
```

### 11.2 Custom Fixtures

```typescript
// fixtures/authenticated-page.ts

import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Initialize localStorage with test data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('dashboards', JSON.stringify([
        {
          id: 'test-id',
          name: 'Test Dashboard',
          widgets: [],
          createdAt: Date.now()
        }
      ]));
    });

    await use(page);

    // Teardown: Clear localStorage
    await page.evaluate(() => localStorage.clear());
  }
});
```

---

## 12. CI/CD Integration

### 12.1 Test Execution Strategy

**Parallel Execution:**
```json
{
  "workers": 4,
  "fullyParallel": true,
  "retries": 2
}
```

**Test Sharding (for large test suites):**
```bash
# Run tests in 3 shards across CI workers
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

### 12.2 Visual Regression Testing

```typescript
test('dashboard matches baseline screenshot', async ({ page }) => {
  await page.goto('/dashboard/test-id');
  await addTestWidget(page, 'stars-timeline');

  // Configure widget to ensure deterministic render
  // ...

  await expect(page).toHaveScreenshot('dashboard-with-widget.png', {
    maxDiffPixels: 100
  });
});
```

---

## 13. Test Maintenance Strategy

### 13.1 Test Naming Conventions

**Pattern**: `[action] [expected outcome] [context]`

Examples:
- `creates new dashboard and redirects to editor`
- `displays error state on failed API request`
- `filters widgets by search term`

### 13.2 Test Documentation

Each test file includes:
- Brief description of feature under test
- Prerequisites (test data, mocked APIs)
- Known limitations or flaky behavior

### 13.3 Debugging Failed Tests

**Screenshot on failure:**
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  }
});
```

**Console log capture:**
```typescript
test('widget logs no errors', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => logs.push(msg.text()));

  // ... test actions

  const errors = logs.filter(log => log.includes('ERROR'));
  expect(errors).toHaveLength(0);
});
```

---

## 14. Coverage Verification

### 14.1 User Story Coverage Matrix

| Story | Test Files | Status |
|-------|-----------|--------|
| Story 1: View Dashboards | dashboard-crud.spec.ts | ✓ |
| Story 2: Create Dashboard | dashboard-crud.spec.ts | ✓ |
| Story 3: Rename/Delete | dashboard-crud.spec.ts | ✓ |
| Story 4: Browse Catalog | widget-catalog.spec.ts | ✓ |
| Story 5: Add Widget | widget-addition.spec.ts | ✓ |
| Story 6: Resize/Reposition | widget-drag-drop.spec.ts, widget-resize.spec.ts | ✓ |
| Story 7: Configure Widget | widget-configuration.spec.ts | ✓ |
| Story 8: Remove Widget | widget-removal.spec.ts | ✓ |
| Story 9: Apply Filters | filter-application.spec.ts | ✓ |
| Story 10: Switch Dashboards | dashboard-navigation.spec.ts | ✓ |
| Story 11: Widget Extensibility | widget-lifecycle.spec.ts | ✓ |
| Story 12: Data Adapter | integration/data-caching.spec.ts | ✓ |

### 14.2 Widget Coverage

All 12 widget types tested:
- GitHub: Stars Timeline, Recent Issues, PR Activity, Contributors, Repo Overview, Releases
- npm: Download Trends, Version History, Quality Score, Dependencies
- Cross-source: Comparison Widget, Activity Heatmap

### 14.3 Accessibility Coverage

- Keyboard navigation: 100%
- Screen reader support: 100%
- Color contrast: All text elements
- ARIA landmarks: All pages
- Focus management: All modals

---

## 15. Success Criteria

**Test suite considered complete when:**

- [ ] All 12 user stories have passing E2E tests
- [ ] 90%+ code coverage for critical paths
- [ ] All 12 widget types testable
- [ ] All error states validated
- [ ] Keyboard navigation verified
- [ ] Screen reader compatibility confirmed
- [ ] Responsive layouts tested (3 breakpoints)
- [ ] Performance budgets met (<2s load, <100ms render)
- [ ] API integration tests passing (GitHub + npm)
- [ ] Data persistence verified (localStorage)
- [ ] Test execution time <10 minutes (with parallelization)
- [ ] Zero flaky tests in CI

---

**End of Test Specifications**

**Files Referenced:**
- PRD: `/Users/keithstewart/dev/data-dashboard/docs/dashboard-prd-final.md`
- UI Design: `/Users/keithstewart/dev/data-dashboard/.claude/outputs/design/agents/ui-designer/dashboard-builder-20251102-143000/design-specification.md`

**Test Implementation Order:**
1. Baseline tests (foundation)
2. Dashboard CRUD (core functionality)
3. Widget lifecycle (catalog → add → configure → remove)
4. Layout manipulation (drag/resize)
5. Filtering system
6. Widget-specific tests (12 types)
7. Integration tests (APIs, caching)
8. Accessibility tests
9. Responsive layout tests
10. Performance validation

**Estimated Test Count:** 120+ E2E tests
**Estimated Execution Time:** 8-10 minutes (parallelized)
**Playwright Version:** 1.40+
**Browser Coverage:** Chromium, Firefox, WebKit
