/**
 * Dashboard Templates
 *
 * Pre-configured dashboard templates with various widget configurations
 * for quick setup and demonstration purposes
 */

import type { Dashboard } from '../types/dashboard';

export interface DashboardTemplate {
  name: string;
  description: string;
  category: 'analytics' | 'monitoring' | 'social' | 'development';
  dashboard: Omit<Dashboard, 'id' | 'metadata'>;
}

export const dashboardTemplates: DashboardTemplate[] = [
  // GitHub Analytics Dashboard
  {
    name: 'GitHub Analytics',
    description: 'Monitor repository metrics, stars growth, and contributor activity',
    category: 'development',
    dashboard: {
      name: 'GitHub Analytics Dashboard',
      description: 'Track GitHub repository performance and engagement metrics',
      widgets: [
        {
          id: 'widget-github-stars-1',
          type: 'github-stars',
          config: {
            owner: 'facebook',
            repo: 'react',
          },
          position: {
            x: 0,
            y: 0,
            w: 6,
            h: 3,
          },
          metadata: {
            title: 'GitHub Stars',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-github-metrics-1',
          type: 'github-metrics',
          config: {
            owner: 'facebook',
            repo: 'react',
          },
          position: {
            x: 6,
            y: 0,
            w: 6,
            h: 3,
          },
          metadata: {
            title: 'GitHub Metrics',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-github-issues-1',
          type: 'github-issues',
          config: {
            owner: 'facebook',
            repo: 'react',
          },
          position: {
            x: 0,
            y: 3,
            w: 6,
            h: 3,
          },
          metadata: {
            title: 'GitHub Issues',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-github-contributors-1',
          type: 'github-contributors',
          config: {
            owner: 'facebook',
            repo: 'react',
          },
          position: {
            x: 6,
            y: 3,
            w: 6,
            h: 3,
          },
          metadata: {
            title: 'GitHub Contributors',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
      ],
      layouts: {
        lg: [],
        md: [],
        sm: [],
      },
      filters: {},
    },
  },

  // npm Package Monitor
  {
    name: 'npm Package Monitor',
    description: 'Track npm package downloads, versions, and dependencies',
    category: 'development',
    dashboard: {
      name: 'npm Package Monitor',
      description: 'Monitor npm package performance and dependencies',
      widgets: [
        {
          id: 'widget-npm-downloads-1',
          type: 'npm-downloads',
          config: {
            packageName: 'react',
          },
          position: {
            x: 0,
            y: 0,
            w: 8,
            h: 3,
          },
          metadata: {
            title: 'npm Downloads',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-npm-versions-1',
          type: 'npm-versions',
          config: {
            packageName: 'react',
          },
          position: {
            x: 8,
            y: 0,
            w: 4,
            h: 3,
          },
          metadata: {
            title: 'npm Versions',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-npm-dependencies-1',
          type: 'npm-dependencies',
          config: {
            packageName: 'react',
          },
          position: {
            x: 0,
            y: 3,
            w: 12,
            h: 4,
          },
          metadata: {
            title: 'npm Dependencies',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
      ],
      layouts: {
        lg: [],
        md: [],
        sm: [],
      },
      filters: {},
    },
  },

  // Package Comparison
  {
    name: 'Package Comparison',
    description: 'Compare multiple packages side-by-side with activity visualization',
    category: 'analytics',
    dashboard: {
      name: 'Package Comparison',
      description: 'Compare package metrics and visualize activity patterns',
      widgets: [
        {
          id: 'widget-comparison-1',
          type: 'comparison',
          config: {
            packages: ['react', 'vue', 'angular'],
          },
          position: {
            x: 0,
            y: 0,
            w: 12,
            h: 3,
          },
          metadata: {
            title: 'Package Comparison',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-activity-heatmap-1',
          type: 'activity-heatmap',
          config: {
            owner: 'facebook',
            repo: 'react',
          },
          position: {
            x: 0,
            y: 3,
            w: 12,
            h: 3,
          },
          metadata: {
            title: 'Activity Heatmap',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
      ],
      layouts: {
        lg: [],
        md: [],
        sm: [],
      },
      filters: {},
    },
  },

  // Development Overview
  {
    name: 'Full Development Overview',
    description: 'Comprehensive dashboard with GitHub, npm, and activity metrics',
    category: 'development',
    dashboard: {
      name: 'Development Overview',
      description: 'Complete development metrics dashboard',
      widgets: [
        {
          id: 'widget-github-stars-2',
          type: 'github-stars',
          config: {
            owner: 'vercel',
            repo: 'next.js',
          },
          position: {
            x: 0,
            y: 0,
            w: 4,
            h: 3,
          },
          metadata: {
            title: 'GitHub Stars',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-npm-downloads-2',
          type: 'npm-downloads',
          config: {
            packageName: 'next',
          },
          position: {
            x: 4,
            y: 0,
            w: 4,
            h: 3,
          },
          metadata: {
            title: 'npm Downloads',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-github-metrics-2',
          type: 'github-metrics',
          config: {
            owner: 'vercel',
            repo: 'next.js',
          },
          position: {
            x: 8,
            y: 0,
            w: 4,
            h: 3,
          },
          metadata: {
            title: 'GitHub Metrics',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-github-issues-2',
          type: 'github-issues',
          config: {
            owner: 'vercel',
            repo: 'next.js',
          },
          position: {
            x: 0,
            y: 3,
            w: 6,
            h: 3,
          },
          metadata: {
            title: 'GitHub Issues',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
        {
          id: 'widget-npm-dependencies-2',
          type: 'npm-dependencies',
          config: {
            packageName: 'next',
          },
          position: {
            x: 6,
            y: 3,
            w: 6,
            h: 3,
          },
          metadata: {
            title: 'npm Dependencies',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dataStatus: 'idle' as const,
          },
        },
      ],
      layouts: {
        lg: [],
        md: [],
        sm: [],
      },
      filters: {},
    },
  },
];

/**
 * Create a dashboard from a template
 * @param template The template to use
 * @returns A new dashboard with unique IDs
 */
export function createDashboardFromTemplate(template: DashboardTemplate): Dashboard {
  const timestamp = Date.now();

  return {
    ...template.dashboard,
    id: `dashboard-${timestamp}`,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      widgetCount: template.dashboard.widgets.length,
    },
    // Ensure unique widget IDs
    widgets: template.dashboard.widgets.map((widget, index) => ({
      ...widget,
      id: `widget-${widget.type}-${timestamp}-${index}`,
    })),
  };
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: DashboardTemplate['category']): DashboardTemplate[] {
  return dashboardTemplates.filter((template) => template.category === category);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): DashboardTemplate['category'][] {
  return ['analytics', 'monitoring', 'social', 'development'];
}
