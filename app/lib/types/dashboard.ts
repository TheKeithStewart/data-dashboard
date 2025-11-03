/**
 * Core Dashboard and Widget Type Definitions
 *
 * Following the design specifications from:
 * - Widget Architecture Expert: widget-framework-design.md
 * - System Architect: integration-architecture.md
 */

// Widget Types
export type WidgetType =
  | 'github-stars'
  | 'github-issues'
  | 'github-prs'
  | 'github-contributors'
  | 'github-metrics'
  | 'github-releases'
  | 'npm-downloads'
  | 'npm-versions'
  | 'npm-quality'
  | 'npm-dependencies'
  | 'comparison'
  | 'activity-heatmap';

// Widget Size and Position (for react-grid-layout)
export interface WidgetPosition {
  x: number;
  y: number;
  w: number; // width in grid units
  h: number; // height in grid units
}

// Base Widget Interface
export interface Widget<TConfig = Record<string, unknown>> {
  id: string;
  type: WidgetType;
  config: TConfig;
  position: WidgetPosition;
  metadata: WidgetMetadata;
}

// Widget Metadata
export interface WidgetMetadata {
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastDataFetch?: string;
  dataStatus: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}

// GitHub Widget Configurations
export interface GitHubRepoConfig {
  owner: string;
  repo: string;
}

export interface GitHubStarsConfig extends GitHubRepoConfig {
  period: '7d' | '30d' | '90d' | '1y';
}

export interface GitHubIssuesConfig extends GitHubRepoConfig {
  state: 'open' | 'closed' | 'all';
  limit: number;
}

// npm Widget Configurations
export interface NpmPackageConfig {
  packageName: string;
}

export interface NpmDownloadsConfig extends NpmPackageConfig {
  period: 'last-day' | 'last-week' | 'last-month' | 'last-year';
}

// Dashboard Interface
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  layouts: DashboardLayouts;
  metadata: DashboardMetadata;
  filters: DashboardFilters;
}

// Responsive Layouts (for react-grid-layout)
export interface DashboardLayouts {
  lg: WidgetPosition[]; // desktop (12 cols)
  md: WidgetPosition[]; // tablet (8 cols)
  sm: WidgetPosition[]; // mobile (4 cols)
}

// Dashboard Metadata
export interface DashboardMetadata {
  createdAt: string;
  updatedAt: string;
  lastViewed?: string;
  widgetCount: number;
}

// Dashboard-level Filters
export interface DashboardFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  repositories?: string[]; // ["owner/repo"]
  packages?: string[];
}

// Dashboard Store State
export interface DashboardState {
  dashboards: Dashboard[];
  activeDashboardId: string | null;
  loading: boolean;
  error: string | null;
}

// Widget Data Adapter Interface
export interface DataAdapter<TConfig, TData> {
  fetch(config: TConfig): Promise<TData>;
  transform(apiResponse: unknown): TData;
  getCacheKey(config: TConfig): string;
  getCacheTTL(): number; // in seconds
}
