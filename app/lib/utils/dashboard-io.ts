/**
 * Dashboard Import/Export Utilities
 *
 * Provides functions for exporting and importing dashboard data
 *
 * Features:
 * - Export dashboard as JSON file
 * - Import dashboard from JSON file
 * - Validation of imported data
 * - Error handling
 */

import type { Dashboard } from '../types/dashboard';

/**
 * Export a dashboard as a JSON file
 */
export function exportDashboard(dashboard: Dashboard): void {
  try {
    // Create JSON string with pretty formatting
    const jsonString = JSON.stringify(dashboard, null, 2);

    // Create blob with JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename with dashboard name and timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const safeName = dashboard.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `dashboard-${safeName}-${timestamp}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export dashboard:', error);
    throw new Error('Failed to export dashboard. Please try again.');
  }
}

/**
 * Export all dashboards as a JSON file
 */
export function exportAllDashboards(dashboards: Dashboard[]): void {
  try {
    const jsonString = JSON.stringify(dashboards, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `dashboards-backup-${timestamp}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export dashboards:', error);
    throw new Error('Failed to export dashboards. Please try again.');
  }
}

/**
 * Import dashboard from JSON file
 */
export function importDashboard(file: File): Promise<Dashboard> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = JSON.parse(jsonString);

        // Validate dashboard structure
        if (!validateDashboard(data)) {
          reject(new Error('Invalid dashboard format. Please check the file and try again.'));
          return;
        }

        // Generate new ID to avoid conflicts
        const importedDashboard: Dashboard = {
          ...data,
          id: `dashboard-${Date.now()}`,
          metadata: {
            ...data.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };

        resolve(importedDashboard);
      } catch (error) {
        reject(new Error('Failed to parse dashboard file. Please check the file format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file. Please try again.'));
    };

    reader.readAsText(file);
  });
}

/**
 * Import multiple dashboards from JSON file
 */
export function importDashboards(file: File): Promise<Dashboard[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = JSON.parse(jsonString);

        // Check if it's an array
        if (!Array.isArray(data)) {
          reject(new Error('Invalid format. Expected an array of dashboards.'));
          return;
        }

        // Validate all dashboards
        const invalidDashboards = data.filter((d) => !validateDashboard(d));
        if (invalidDashboards.length > 0) {
          reject(new Error(`${invalidDashboards.length} dashboard(s) have invalid format.`));
          return;
        }

        // Generate new IDs for all dashboards
        const importedDashboards = data.map((d) => ({
          ...d,
          id: `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            ...d.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }));

        resolve(importedDashboards);
      } catch (error) {
        reject(new Error('Failed to parse file. Please check the file format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file. Please try again.'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate dashboard structure
 */
function validateDashboard(data: any): boolean {
  if (!data || typeof data !== 'object') return false;

  // Check required fields
  if (!data.name || typeof data.name !== 'string') return false;
  if (!Array.isArray(data.widgets)) return false;
  if (!data.metadata || typeof data.metadata !== 'object') return false;
  if (!data.layouts || typeof data.layouts !== 'object') return false;

  // Validate widgets
  for (const widget of data.widgets) {
    if (!widget.id || !widget.type || !widget.config || !widget.position || !widget.metadata) {
      return false;
    }
  }

  return true;
}

/**
 * Create a copy of a dashboard with a new ID and name
 */
export function duplicateDashboard(dashboard: Dashboard, newName?: string): Dashboard {
  return {
    ...dashboard,
    id: `dashboard-${Date.now()}`,
    name: newName || `${dashboard.name} (Copy)`,
    metadata: {
      ...dashboard.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastViewed: undefined,
    },
    // Generate new widget IDs to avoid conflicts
    widgets: dashboard.widgets.map((widget) => ({
      ...widget,
      id: `widget-${widget.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        ...widget.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })),
  };
}
