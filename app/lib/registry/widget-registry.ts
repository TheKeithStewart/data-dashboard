/**
 * Widget Registry
 *
 * Central registry for all widget types with:
 * - Widget metadata (name, description, icon)
 * - Default configurations
 * - Factory functions for creating widgets
 * - Widget size constraints
 */

import type {
  Widget,
  WidgetType,
  WidgetPosition,
  GitHubStarsConfig,
  GitHubIssuesConfig,
  GitHubRepoConfig,
  NpmDownloadsConfig,
  NpmPackageConfig,
} from '../types/dashboard';

// Widget Definition
export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  category: 'github' | 'npm' | 'cross-source';
  icon: string; // Icon name from @salt-ds/icons
  defaultSize: {
    w: number;
    h: number;
  };
  minSize: {
    w: number;
    h: number;
  };
  maxSize: {
    w: number;
    h: number;
  };
  configSchema: unknown; // Zod schema (future enhancement)
}

// Widget Registry
export const WIDGET_DEFINITIONS: Record<WidgetType, WidgetDefinition> = {
  'github-stars': {
    type: 'github-stars',
    name: 'Repository Stars Timeline',
    description: 'Visualize star growth over time with area chart',
    category: 'github',
    icon: 'StarSolid',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 12, h: 8 },
    configSchema: null, // TODO: Zod schema
  },
  'github-issues': {
    type: 'github-issues',
    name: 'Recent Issues List',
    description: 'Display recent repository issues',
    category: 'github',
    icon: 'ErrorSolid',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    maxSize: { w: 6, h: 8 },
    configSchema: null,
  },
  'github-prs': {
    type: 'github-prs',
    name: 'Pull Request Activity',
    description: 'Show PR activity with bar chart',
    category: 'github',
    icon: 'MoveHorizontal',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 12, h: 6 },
    configSchema: null,
  },
  'github-contributors': {
    type: 'github-contributors',
    name: 'Top Contributors',
    description: 'Rank contributors by contributions',
    category: 'github',
    icon: 'UserGroupSolid',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    maxSize: { w: 6, h: 6 },
    configSchema: null,
  },
  'github-metrics': {
    type: 'github-metrics',
    name: 'Repository Metrics',
    description: 'Display key repository metrics (stars, forks, issues)',
    category: 'github',
    icon: 'BarChart',
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 3 },
    configSchema: null,
  },
  'github-releases': {
    type: 'github-releases',
    name: 'Release Timeline',
    description: 'Show releases with scatter/bubble chart',
    category: 'github',
    icon: 'Clock',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 12, h: 6 },
    configSchema: null,
  },
  'npm-downloads': {
    type: 'npm-downloads',
    name: 'Download Trends',
    description: 'Visualize package downloads over time',
    category: 'npm',
    icon: 'TrendingDown',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 12, h: 8 },
    configSchema: null,
  },
  'npm-versions': {
    type: 'npm-versions',
    name: 'Version History',
    description: 'Display package version history',
    category: 'npm',
    icon: 'Document',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    maxSize: { w: 6, h: 6 },
    configSchema: null,
  },
  'npm-quality': {
    type: 'npm-quality',
    name: 'Package Quality Score',
    description: 'Show quality metrics with radar chart',
    category: 'npm',
    icon: 'Success',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    maxSize: { w: 6, h: 6 },
    configSchema: null,
  },
  'npm-dependencies': {
    type: 'npm-dependencies',
    name: 'Dependencies Overview',
    description: 'Visualize dependencies with treemap',
    category: 'npm',
    icon: 'Hierarchy',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 4 },
    maxSize: { w: 12, h: 8 },
    configSchema: null,
  },
  comparison: {
    type: 'comparison',
    name: 'Repository & Package Comparison',
    description: 'Compare metrics across repos and packages',
    category: 'cross-source',
    icon: 'Compare',
    defaultSize: { w: 8, h: 4 },
    minSize: { w: 6, h: 3 },
    maxSize: { w: 12, h: 6 },
    configSchema: null,
  },
  'activity-heatmap': {
    type: 'activity-heatmap',
    name: 'Activity Heatmap',
    description: 'Show activity patterns with heatmap',
    category: 'cross-source',
    icon: 'Grid',
    defaultSize: { w: 8, h: 4 },
    minSize: { w: 6, h: 3 },
    maxSize: { w: 12, h: 6 },
    configSchema: null,
  },
};

// Widget Factory Functions
export function createWidget(
  type: WidgetType,
  config: unknown,
  position?: Partial<WidgetPosition>
): Widget {
  const definition = WIDGET_DEFINITIONS[type];
  if (!definition) {
    throw new Error(`Unknown widget type: ${type}`);
  }

  const defaultPosition: WidgetPosition = {
    x: 0,
    y: 0,
    w: definition.defaultSize.w,
    h: definition.defaultSize.h,
    ...position,
  };

  return {
    id: `widget-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    config: config as Record<string, unknown>,
    position: defaultPosition,
    metadata: {
      title: definition.name,
      description: definition.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataStatus: 'idle',
    },
  };
}

// Specific widget creation helpers
export function createGitHubStarsWidget(config: GitHubStarsConfig, position?: Partial<WidgetPosition>): Widget {
  return createWidget('github-stars', config, position);
}

export function createGitHubIssuesWidget(config: GitHubIssuesConfig, position?: Partial<WidgetPosition>): Widget {
  return createWidget('github-issues', config, position);
}

export function createGitHubMetricsWidget(config: GitHubRepoConfig, position?: Partial<WidgetPosition>): Widget {
  return createWidget('github-metrics', config, position);
}

export function createNpmDownloadsWidget(config: NpmDownloadsConfig, position?: Partial<WidgetPosition>): Widget {
  return createWidget('npm-downloads', config, position);
}

export function createNpmQualityWidget(config: NpmPackageConfig, position?: Partial<WidgetPosition>): Widget {
  return createWidget('npm-quality', config, position);
}

// Get widgets by category
export function getWidgetsByCategory(category: 'github' | 'npm' | 'cross-source'): WidgetDefinition[] {
  return Object.values(WIDGET_DEFINITIONS).filter((def) => def.category === category);
}

// Get all widget categories
export function getWidgetCategories(): Array<{ id: string; name: string; widgets: WidgetDefinition[] }> {
  return [
    {
      id: 'github',
      name: 'GitHub Widgets',
      widgets: getWidgetsByCategory('github'),
    },
    {
      id: 'npm',
      name: 'npm Widgets',
      widgets: getWidgetsByCategory('npm'),
    },
    {
      id: 'cross-source',
      name: 'Cross-Source Widgets',
      widgets: getWidgetsByCategory('cross-source'),
    },
  ];
}
