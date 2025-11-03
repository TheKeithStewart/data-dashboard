import { test, expect } from '@playwright/test';

/**
 * Dashboard Templates E2E Tests
 *
 * Tests the template system functionality:
 * - Browsing templates
 * - Creating dashboards from templates
 * - Template category display
 * - Template widget count display
 */

test.describe('Dashboard Templates', () => {
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

  test('should show Browse Templates button', async ({ page }) => {
    await page.goto('/dashboards');

    // Button should be visible in empty state
    await expect(page.getByRole('button', { name: /Browse Templates/i }).first()).toBeVisible();
  });

  test('should open template browser', async ({ page }) => {
    await page.goto('/dashboards');

    // Click Browse Templates
    await page.getByRole('button', { name: /Browse Templates/i }).first().click();

    // Template browser should be visible
    await expect(page.getByRole('heading', { name: 'Dashboard Templates' })).toBeVisible();
    await expect(page.getByText('Choose a pre-configured dashboard template')).toBeVisible();
  });

  test('should display all templates', async ({ page }) => {
    await page.goto('/dashboards');

    // Open template browser
    await page.getByRole('button', { name: /Browse Templates/i }).first().click();

    // Should show GitHub Analytics template
    await expect(page.getByText('GitHub Analytics')).toBeVisible();

    // Should show npm Package Monitor template
    await expect(page.getByText('npm Package Monitor')).toBeVisible();

    // Should show Package Comparison template
    await expect(page.getByText('Package Comparison')).toBeVisible();

    // Should show Full Development Overview template
    await expect(page.getByText('Full Development Overview')).toBeVisible();
  });

  test('should show template metadata (category, widget count)', async ({ page }) => {
    await page.goto('/dashboards');

    // Open template browser
    await page.getByRole('button', { name: /Browse Templates/i }).first().click();

    // Find a template card
    const templateCard = page.locator('.border.border-gray-200.rounded-lg').first();

    // Should show category badge
    await expect(templateCard.locator('.bg-blue-100.text-blue-700').first()).toBeVisible();

    // Should show widget count
    await expect(templateCard.getByText(/\d+ widgets/)).toBeVisible();
  });

  test('should create dashboard from template', async ({ page }) => {
    await page.goto('/dashboards');

    // Open template browser
    await page.getByRole('button', { name: /Browse Templates/i }).first().click();

    // Click on GitHub Analytics template
    await page.getByText('GitHub Analytics').click();

    // Should redirect to the new dashboard
    await expect(page).toHaveURL(/\/dashboards\/dashboard-\d+/);

    // Go back to list
    await page.goto('/dashboards');

    // Dashboard should exist with template name
    await expect(page.getByRole('heading', { name: 'GitHub Analytics Dashboard' })).toBeVisible();

    // Should show widget count from template
    await expect(page.getByText('Widgets:').locator('..').getByText(/[1-9]\d*/)).toBeVisible();
  });

  test('should close template browser on cancel', async ({ page }) => {
    await page.goto('/dashboards');

    // Open template browser
    await page.getByRole('button', { name: /Browse Templates/i }).first().click();

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Template browser should close
    await expect(page.getByRole('heading', { name: 'Dashboard Templates' })).not.toBeVisible();

    // Should return to main view
    await expect(page.getByRole('heading', { name: 'My Dashboards' })).toBeVisible();
  });

  test('should show Browse Templates button with existing dashboards', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a dashboard first
    await createDashboard(page, 'Test Dashboard');

    // Go back to list
    await page.goto('/dashboards');

    // Browse Templates should still be visible
    await expect(page.getByRole('button', { name: /Browse Templates/i }).first()).toBeVisible();
  });

  test('should create multiple dashboards from different templates', async ({ page }) => {
    await page.goto('/dashboards');

    // Create from GitHub Analytics template
    await page.getByRole('button', { name: /Browse Templates/i }).first().click();
    await page.getByText('GitHub Analytics').click();
    await page.goto('/dashboards');

    // Create from npm Package Monitor template
    await page.getByRole('button', { name: /Browse Templates/i }).first().click();
    await page.getByText('npm Package Monitor').click();
    await page.goto('/dashboards');

    // Should have 2 dashboards
    await expect(page.getByRole('heading', { name: 'GitHub Analytics Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'npm Package Monitor' })).toBeVisible();

    const dashboardCards = page.locator('.bg-white.rounded-lg.shadow-sm').filter({ hasText: 'Dashboard' });
    await expect(dashboardCards).toHaveCount(2);
  });

  test('should show template descriptions', async ({ page }) => {
    await page.goto('/dashboards');

    // Open template browser
    await page.getByRole('button', { name: /Browse Templates/i }).first().click();

    // Check for GitHub Analytics description
    await expect(page.getByText('Monitor repository metrics, stars growth, and contributor activity')).toBeVisible();

    // Check for npm Package Monitor description
    await expect(page.getByText('Track npm package downloads, versions, and dependencies')).toBeVisible();
  });

  test('should show different categories for templates', async ({ page }) => {
    await page.goto('/dashboards');

    // Open template browser
    await page.getByRole('button', { name: /Browse Templates/i }).first().click();

    // Should have development category badges
    const categoryBadges = page.locator('.bg-blue-100.text-blue-700');
    await expect(categoryBadges).toHaveCount(4);
  });
});
