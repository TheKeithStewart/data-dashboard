import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Dashboard Import/Export E2E Tests
 *
 * Tests the import and export functionality:
 * - Exporting single dashboard as JSON
 * - Exporting all dashboards
 * - Importing dashboard from JSON file
 * - Import validation and error handling
 */

test.describe('Dashboard Import/Export', () => {
  let downloadsPath: string;
  let tempDir: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboards');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Create temp directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashboard-test-'));
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

  test.afterEach(async () => {
    // Clean up temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should show export button for dashboard', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a dashboard first
    await createDashboard(page, 'Test Dashboard');

    // Go back to list
    await page.goto('/dashboards');

    // Export button should be visible
    await expect(page.getByRole('button', { name: 'Export' }).first()).toBeVisible();
  });

  test('should show Import and Export All buttons in header', async ({ page }) => {
    await page.goto('/dashboards');

    // Create at least one dashboard to show header buttons
    await createDashboard(page, 'Test');
    await page.goto('/dashboards');

    // Header buttons should be visible
    await expect(page.getByRole('button', { name: 'Import' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export All' })).toBeVisible();
  });

  test('should export single dashboard as JSON', async ({ page, context }) => {
    // Enable downloads
    const downloadPromise = page.waitForEvent('download');

    await page.goto('/dashboards');

    // Create a dashboard
    await createDashboard(page, 'Export Test Dashboard');

    // Go back to list
    await page.goto('/dashboards');

    // Click export button
    await page.getByRole('button', { name: 'Export' }).first().click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download filename format
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^dashboard-export-test-dashboard-\d{4}-\d{2}-\d{2}\.json$/);

    // Save and verify content
    const downloadPath = path.join(tempDir, filename);
    await download.saveAs(downloadPath);

    // Read and parse JSON
    const content = JSON.parse(fs.readFileSync(downloadPath, 'utf-8'));

    // Verify structure
    expect(content).toHaveProperty('id');
    expect(content).toHaveProperty('name', 'Export Test Dashboard');
    expect(content).toHaveProperty('widgets');
    expect(content).toHaveProperty('metadata');
    expect(content).toHaveProperty('layouts');
  });

  test('should export all dashboards as JSON', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.goto('/dashboards');

    // Create multiple dashboards
    for (let i = 1; i <= 2; i++) {
      await createDashboard(page, `Dashboard ${i}`);
      await page.goto('/dashboards');
    }

    // Click Export All
    await page.getByRole('button', { name: 'Export All' }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify filename format
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^dashboards-backup-\d{4}-\d{2}-\d{2}\.json$/);

    // Save and verify content
    const downloadPath = path.join(tempDir, filename);
    await download.saveAs(downloadPath);

    // Read and parse JSON
    const content = JSON.parse(fs.readFileSync(downloadPath, 'utf-8'));

    // Should be an array
    expect(Array.isArray(content)).toBe(true);
    expect(content).toHaveLength(2);

    // Each item should have dashboard structure
    content.forEach((dashboard: any) => {
      expect(dashboard).toHaveProperty('id');
      expect(dashboard).toHaveProperty('name');
      expect(dashboard).toHaveProperty('widgets');
      expect(dashboard).toHaveProperty('metadata');
    });
  });

  test('should import dashboard from valid JSON file', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a valid dashboard JSON file
    const dashboardData = {
      id: 'dashboard-test-123',
      name: 'Imported Dashboard',
      description: 'This was imported',
      widgets: [],
      layouts: { lg: [], md: [], sm: [] },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgetCount: 0,
      },
      filters: {},
    };

    const filePath = path.join(tempDir, 'dashboard-import.json');
    fs.writeFileSync(filePath, JSON.stringify(dashboardData, null, 2));

    // Click Import button
    await page.getByRole('button', { name: 'Import' }).click();

    // Wait for file input (it's hidden)
    const fileInput = page.locator('input[type="file"]');

    // Upload file
    await fileInput.setInputFiles(filePath);

    // Wait for navigation to new dashboard
    await expect(page).toHaveURL(/\/dashboards\/dashboard-\d+/);

    // Go back to list
    await page.goto('/dashboards');

    // Imported dashboard should appear with new ID (not original)
    await expect(page.getByRole('heading', { name: 'Imported Dashboard' })).toBeVisible();
    await expect(page.getByText('This was imported')).toBeVisible();
  });

  test('should import multiple dashboards from array JSON', async ({ page }) => {
    await page.goto('/dashboards');

    // Create a valid dashboards array JSON file
    const dashboardsData = [
      {
        id: 'dashboard-1',
        name: 'Dashboard One',
        widgets: [],
        layouts: { lg: [], md: [], sm: [] },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          widgetCount: 0,
        },
        filters: {},
      },
      {
        id: 'dashboard-2',
        name: 'Dashboard Two',
        widgets: [],
        layouts: { lg: [], md: [], sm: [] },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          widgetCount: 0,
        },
        filters: {},
      },
    ];

    const filePath = path.join(tempDir, 'dashboards-import.json');
    fs.writeFileSync(filePath, JSON.stringify(dashboardsData, null, 2));

    // Handle alert dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Successfully imported 2 dashboard');
      await dialog.accept();
    });

    // Click Import button
    await page.getByRole('button', { name: 'Import' }).click();

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Wait a bit for import to complete
    await page.waitForTimeout(500);

    // Both dashboards should appear
    await expect(page.getByRole('heading', { name: 'Dashboard One' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard Two' })).toBeVisible();
  });

  test('should handle invalid JSON file gracefully', async ({ page }) => {
    await page.goto('/dashboards');

    // Create an invalid JSON file
    const filePath = path.join(tempDir, 'invalid.json');
    fs.writeFileSync(filePath, 'This is not valid JSON');

    // Handle error alert
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Failed to parse');
      await dialog.accept();
    });

    // Click Import button
    await page.getByRole('button', { name: 'Import' }).click();

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Wait for error dialog
    await page.waitForTimeout(500);

    // Should still be on dashboards page
    await expect(page).toHaveURL('/dashboards');
  });

  test('should handle dashboard with missing required fields', async ({ page }) => {
    await page.goto('/dashboards');

    // Create invalid dashboard JSON (missing required fields)
    const invalidDashboard = {
      id: 'test',
      // Missing name, widgets, metadata, etc.
    };

    const filePath = path.join(tempDir, 'invalid-dashboard.json');
    fs.writeFileSync(filePath, JSON.stringify(invalidDashboard, null, 2));

    // Handle error alert
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Invalid dashboard format');
      await dialog.accept();
    });

    // Click Import button
    await page.getByRole('button', { name: 'Import' }).click();

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    // Wait for error dialog
    await page.waitForTimeout(500);
  });

  test('should regenerate IDs on import to prevent conflicts', async ({ page }) => {
    await page.goto('/dashboards');

    // Create original dashboard
    await createDashboard(page, 'Original');

    // Export it
    const downloadPromise = page.waitForEvent('download');
    await page.goto('/dashboards');
    await page.getByRole('button', { name: 'Export' }).first().click();
    const download = await downloadPromise;

    // Save export
    const exportPath = path.join(tempDir, 'exported.json');
    await download.saveAs(exportPath);

    // Import the same dashboard
    await page.getByRole('button', { name: 'Import' }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(exportPath);

    // Wait for redirect
    await page.waitForTimeout(1000);

    // Go to list
    await page.goto('/dashboards');

    // Should have 2 dashboards with same name
    const dashboardCards = page.locator('.bg-white.rounded-lg.shadow-sm').filter({ hasText: 'Original' });
    await expect(dashboardCards).toHaveCount(2);
  });
});
