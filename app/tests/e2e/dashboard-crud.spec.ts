import { test, expect } from '@playwright/test';

/**
 * Dashboard CRUD Operations E2E Tests
 *
 * Tests the complete lifecycle of dashboard management:
 * - Creating dashboards
 * - Viewing dashboard list
 * - Editing dashboard metadata
 * - Duplicating dashboards
 * - Deleting dashboards
 * - Clear all data functionality
 */

test.describe('Dashboard CRUD Operations', () => {
  // Reset state before each test by clearing localStorage
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboards');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  // Helper function to create a dashboard
  async function createDashboard(page: any, name: string) {
    await page.getByRole('button', { name: /Create New Dashboard/i }).first().click();
    const createForm = page.locator('.bg-white.rounded-lg.shadow-sm.border').filter({ hasText: 'Create Dashboard' });
    await createForm.getByPlaceholder('Enter dashboard name...').fill(name);
    await createForm.getByRole('button', { name: 'Create' }).first().click();
    // Wait for redirect to dashboard view
    await page.waitForURL(/\/dashboards\/dashboard-\d+/);
  }

  test('should show empty state on first visit', async ({ page }) => {
    await page.goto('/dashboards');

    // Check for empty state heading
    await expect(page.getByRole('heading', { name: 'No dashboards yet' })).toBeVisible();

    // Check for empty state description
    await expect(page.getByText('Create your first dashboard from scratch or use a template')).toBeVisible();

    // Check for create button (in empty state)
    const emptyState = page.locator('.bg-white.rounded-lg.shadow-sm.border').filter({ hasText: 'No dashboards yet' });
    await expect(emptyState.getByRole('button', { name: /Create Dashboard/i })).toBeVisible();

    // Check for templates button (in empty state)
    await expect(emptyState.getByRole('button', { name: /Browse Templates/i })).toBeVisible();
  });

  test('should create a new dashboard', async ({ page }) => {
    await page.goto('/dashboards');

    // Create dashboard using helper
    await createDashboard(page, 'Test Dashboard');

    // Should redirect to dashboard view
    await expect(page).toHaveURL(/\/dashboards\/dashboard-\d+/);

    // Go back to list
    await page.goto('/dashboards');

    // Dashboard should appear in list
    await expect(page.getByRole('heading', { name: 'Test Dashboard' })).toBeVisible();
  });

  test('should cancel dashboard creation', async ({ page }) => {
    await page.goto('/dashboards');

    // Click create button
    await page.getByRole('button', { name: /Create New Dashboard/i }).first().click();

    // Fill in dashboard name
    await page.getByPlaceholder('Enter dashboard name...').fill('Test Dashboard');

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Form should close
    await expect(page.getByPlaceholder('Enter dashboard name...')).not.toBeVisible();

    // No dashboard should be created
    await expect(page.getByRole('heading', { name: 'Test Dashboard' })).not.toBeVisible();
  });

  test('should edit dashboard metadata', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a dashboard first
    await createDashboard(page, 'Original Name');

    // Go back to list
    await page.goto('/dashboards');

    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Update name
    await page.getByPlaceholder('Dashboard name').fill('Updated Name');

    // Add description
    await page.getByPlaceholder('Description (optional)').fill('Test description');

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify changes
    await expect(page.getByRole('heading', { name: 'Updated Name' })).toBeVisible();
    await expect(page.getByText('Test description')).toBeVisible();
  });

  test('should cancel edit without saving changes', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a dashboard first
    await createDashboard(page, 'Original Name');

    // Go back to list
    await page.goto('/dashboards');

    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Update name
    await page.getByPlaceholder('Dashboard name').fill('This Should Not Save');

    // Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify original name is still there
    await expect(page.getByRole('heading', { name: 'Original Name' })).toBeVisible();
  });

  test('should duplicate a dashboard', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a dashboard first
    await createDashboard(page, 'Original Dashboard');

    // Go back to list
    await page.goto('/dashboards');

    // Click duplicate button
    await page.getByRole('button', { name: 'Duplicate' }).click();

    // Should redirect to duplicated dashboard
    await expect(page).toHaveURL(/\/dashboards\/dashboard-\d+/);

    // Go back to list
    await page.goto('/dashboards');

    // Should see both original and copy
    await expect(page.getByRole('heading', { name: 'Original Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Original Dashboard (Copy)' })).toBeVisible();

    // Should have 2 dashboard cards
    const dashboardCards = page.locator('.bg-white.rounded-lg.shadow-sm').filter({ hasText: 'Dashboard' });
    await expect(dashboardCards).toHaveCount(2);
  });

  test('should delete a dashboard', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a dashboard first
    await createDashboard(page, 'Dashboard To Delete');

    // Go back to list
    await page.goto('/dashboards');

    // Mock the confirm dialog
    page.on('dialog', dialog => dialog.accept());

    // Click delete button (trash icon)
    await page.locator('button[title="Delete dashboard"]').click();

    // Dashboard should be removed from list
    await expect(page.getByRole('heading', { name: 'Dashboard To Delete' })).not.toBeVisible();

    // Should show empty state
    await expect(page.getByRole('heading', { name: 'No dashboards yet' })).toBeVisible();
  });

  test('should open a dashboard from list', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a dashboard
    await createDashboard(page, 'Test Dashboard');

    // Go back to list
    await page.goto('/dashboards');

    // Click "Open Dashboard" button
    await page.getByRole('button', { name: 'Open Dashboard' }).click();

    // Should navigate to dashboard view
    await expect(page).toHaveURL(/\/dashboards\/dashboard-\d+/);
  });

  test('should show dashboard metadata (widget count, dates)', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a dashboard
    await createDashboard(page, 'Test Dashboard');

    // Go back to list
    await page.goto('/dashboards');

    // Should show widget count
    await expect(page.getByText('Widgets:').locator('..').getByText('0')).toBeVisible();

    // Should show created date
    await expect(page.getByText('Created:')).toBeVisible();
  });

  test('should clear all dashboards', async ({ page }) => {
    await page.goto('/dashboards');

    // Create multiple dashboards
    for (let i = 1; i <= 3; i++) {
      await createDashboard(page, `Dashboard ${i}`);
      await page.goto('/dashboards');
    }

    // Verify 3 dashboards exist
    const dashboardCards = page.locator('.bg-white.rounded-lg.shadow-sm').filter({ hasText: 'Dashboard' });
    await expect(dashboardCards).toHaveCount(3);

    // Mock confirm dialog
    page.on('dialog', dialog => dialog.accept());

    // Click "Clear All Data" button
    await page.getByRole('button', { name: /Clear All Data/i }).click();

    // Should show empty state
    await expect(page.getByRole('heading', { name: 'No dashboards yet' })).toBeVisible();
  });
});
