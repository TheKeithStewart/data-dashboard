# Widget Framework Design: Dashboard Builder

**Project**: dashboard-builder
**Timestamp**: 20251102-143000
**Agent**: widget-architecture-expert
**Version**: 1.0.0

## Executive Summary

This document specifies a comprehensive widget framework architecture for the Dashboard Builder application, designed around three core principles:

1. **Data Source Independence**: Widgets operate on normalized data contracts, decoupling visualization logic from API specifics
2. **Plugin Architecture**: New widget types integrate through a registry pattern without modifying core system code
3. **Type Safety**: Complete TypeScript type system with compile-time validation and runtime schema enforcement

The framework separates concerns across four distinct layers: Widget Registry (catalog and metadata), Data Adapters (source-agnostic data transformation), Generic Visualization Components (reusable chart/metric/table components), and Widget Lifecycle Management (initialization, updates, cleanup). This architecture enables developers to add new widgets by implementing three contracts: a configuration schema (Zod), a data adapter (transforms API responses to generic format), and a component (renders using generic visualization primitives).

## Architecture Overview

### System Architecture Pattern

The widget framework implements a **Registry-Based Plugin Architecture** with the following characteristics:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Widget Registry Layer                        │
│  - Type registration and metadata storage                        │
│  - Factory functions for widget instantiation                    │
│  - Configuration schema definitions                              │
│  - Category and catalog organization                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Adapter Layer                            │
│  - Source-specific API clients (GitHub, npm)                     │
│  - Data transformation to normalized contracts                   │
│  - Caching and rate limiting strategies                          │
│  - Error handling and retry logic                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Generic Visualization Components                    │
│  - ChartWidget (line, bar, area, pie)                           │
│  - MetricWidget (KPI cards, multi-metric displays)              │
│  - TableWidget (sortable, paginated data tables)                │
│  - ListWidget (ranked lists, activity feeds)                    │
│  - TimelineWidget (chronological event displays)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Widget Lifecycle Manager                         │
│  - Instantiation and mounting                                    │
│  - Data fetching orchestration                                   │
│  - Update and refresh cycles                                     │
│  - Cleanup and unmounting                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Separation of Concerns

**Widget Definition** (metadata, registration)
- Widget type identifier and display metadata
- Category classification for catalog organization
- Configuration schema and default values
- Size constraints and layout preferences
- Data requirements and dependencies

**Data Adapter** (API integration, transformation)
- Source-specific API client implementation
- Data fetching with authentication and rate limiting
- Response transformation to normalized data contracts
- Caching strategy with configurable TTL
- Error handling and fallback mechanisms

**Visualization Component** (rendering, interaction)
- Generic components accepting normalized data
- Rendering logic using Recharts and Salt DS
- User interaction handlers
- Loading and error state displays
- Responsive layout adjustments

**Widget Container** (lifecycle orchestration)
- Data fetching coordination
- State management (loading, error, data)
- Configuration change handling
- Refresh and update triggers
- Cleanup on unmount

### Core Design Principles

**Principle 1: Data Contract First**
- All widgets consume data through standardized interfaces
- Data adapters translate API responses to these contracts
- Visualization components are API-agnostic
- Switching data sources requires only adapter changes

**Principle 2: Configuration as Code**
- Widget configurations are type-safe TypeScript objects
- Zod schemas validate configurations at runtime
- Configuration UI auto-generates from schemas
- Default configurations provide sensible starting points

**Principle 3: Lifecycle Isolation**
- Each widget instance manages independent state
- No shared mutable state between widgets
- Widget failures don't cascade to other widgets
- Clean initialization and teardown patterns

**Principle 4: Progressive Enhancement**
- Core functionality works with minimal configuration
- Advanced features opt-in through configuration
- Graceful degradation for missing data
- Fallback rendering for error states

**Principle 5: Developer Ergonomics**
- Adding widgets requires minimal boilerplate
- TypeScript provides compile-time safety
- Registry pattern enables discovery
- Clear documentation through type definitions

## Type System Design

### Core Widget Types

```typescript
// Unique identifier for widget instances
type WidgetId = string & { readonly __brand: 'WidgetId' };

// Widget type discriminator
type WidgetType =
  | 'github-stars-timeline'
  | 'github-issues-list'
  | 'github-pull-requests'
  | 'github-contributors'
  | 'github-overview-metrics'
  | 'github-releases'
  | 'npm-downloads-trend'
  | 'npm-version-history'
  | 'npm-quality-score'
  | 'npm-dependencies'
  | 'cross-comparison'
  | 'activity-heatmap';

// Widget category for catalog organization
type WidgetCategory =
  | 'metrics'      // KPI cards, single/multi-value displays
  | 'charts'       // Line, bar, area, pie charts
  | 'tables'       // Data tables with sorting/filtering
  | 'lists'        // Ranked lists, activity feeds
  | 'timelines'    // Chronological visualizations
  | 'comparisons'  // Multi-entity comparisons
  | 'health';      // Status indicators, scores

// Widget size in grid units (react-grid-layout)
interface WidgetSize {
  w: number;  // Width in grid columns (12-column system)
  h: number;  // Height in grid rows (80-100px per row)
}

// Widget position in grid
interface WidgetPosition {
  x: number;  // Column position (0-11)
  y: number;  // Row position (0-infinite)
}

// Widget metadata
interface WidgetMetadata {
  createdAt: Date;
  updatedAt: Date;
  title?: string;        // User-customizable title
  description?: string;  // User-provided description
}

// Base widget instance structure
interface Widget<TConfig = WidgetConfig> {
  id: WidgetId;
  type: WidgetType;
  config: TConfig;
  position: WidgetPosition;
  size: WidgetSize;
  metadata: WidgetMetadata;
}
```

### Widget Configuration Types

```typescript
// GitHub Stars Timeline Configuration
interface GitHubStarsTimelineConfig {
  repository: {
    owner: string;
    name: string;
  };
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  showForks?: boolean;
  chartType: 'line' | 'area';
  aggregation?: 'daily' | 'weekly' | 'monthly';
}

// GitHub Issues List Configuration
interface GitHubIssuesListConfig {
  repository: {
    owner: string;
    name: string;
  };
  state: 'open' | 'closed' | 'all';
  limit: number;
  sortBy: 'created' | 'updated' | 'comments';
  sortDirection: 'asc' | 'desc';
  labels?: string[];
}

// GitHub Pull Requests Configuration
interface GitHubPullRequestsConfig {
  repository: {
    owner: string;
    name: string;
  };
  state: 'open' | 'closed' | 'merged' | 'all';
  timeRange: '7d' | '30d' | '90d' | 'all';
  sortBy: 'created' | 'updated' | 'merged';
}

// GitHub Contributors Configuration
interface GitHubContributorsConfig {
  repository: {
    owner: string;
    name: string;
  };
  limit: number;
  sortBy: 'contributions' | 'recent';
}

// GitHub Overview Metrics Configuration
interface GitHubOverviewMetricsConfig {
  repository: {
    owner: string;
    name: string;
  };
  metrics: Array<'stars' | 'forks' | 'watchers' | 'issues' | 'updated'>;
}

// GitHub Releases Configuration
interface GitHubReleasesConfig {
  repository: {
    owner: string;
    name: string;
  };
  limit: number;
  chartType: 'timeline' | 'bar';
}

// npm Downloads Trend Configuration
interface NpmDownloadsTrendConfig {
  packageName: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  aggregation: 'daily' | 'weekly' | 'monthly';
  comparePackages?: string[];
}

// npm Version History Configuration
interface NpmVersionHistoryConfig {
  packageName: string;
  limit: number;
}

// npm Quality Score Configuration
interface NpmQualityScoreConfig {
  packageName: string;
  metrics: Array<'quality' | 'popularity' | 'maintenance' | 'overall'>;
}

// npm Dependencies Configuration
interface NpmDependenciesConfig {
  packageName: string;
  dependencyType: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'all';
  limit?: number;
}

// Cross-Source Comparison Configuration
interface CrossComparisonConfig {
  sources: Array<{
    type: 'github' | 'npm';
    identifier: string;  // owner/repo or package name
  }>;
  metric: 'stars' | 'downloads' | 'issues' | 'quality';
  chartType: 'bar' | 'radar';
}

// Activity Heatmap Configuration
interface ActivityHeatmapConfig {
  source: {
    type: 'github' | 'npm';
    identifier: string;
  };
  activityType: 'commits' | 'downloads' | 'issues';
  timeRange: '30d' | '90d' | '1y';
  granularity: 'hour' | 'day';
}

// Discriminated union of all widget configurations
type WidgetConfig =
  | GitHubStarsTimelineConfig
  | GitHubIssuesListConfig
  | GitHubPullRequestsConfig
  | GitHubContributorsConfig
  | GitHubOverviewMetricsConfig
  | GitHubReleasesConfig
  | NpmDownloadsTrendConfig
  | NpmVersionHistoryConfig
  | NpmQualityScoreConfig
  | NpmDependenciesConfig
  | CrossComparisonConfig
  | ActivityHeatmapConfig;
```

### Data Adapter Contracts

```typescript
// Generic time-series data point
interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

// Generic metric value
interface MetricValue {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  icon?: string;
}

// Generic list item
interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  metadata?: Record<string, string | number>;
  timestamp?: Date;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  avatar?: string;
  url?: string;
}

// Generic table row
interface TableRow {
  id: string;
  cells: Record<string, string | number | Date | boolean>;
  metadata?: Record<string, any>;
  url?: string;
}

// Generic table column definition
interface TableColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sortable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

// Generic chart data (for Recharts)
interface ChartData {
  type: 'line' | 'bar' | 'area' | 'pie' | 'radar';
  data: Array<Record<string, string | number>>;
  xAxisKey?: string;
  yAxisKey?: string | string[];
  categories?: string[];  // For pie/radar charts
  colors?: string[];
}

// Generic timeline event
interface TimelineEvent {
  id: string;
  title: string;
  timestamp: Date;
  description?: string;
  type?: 'major' | 'minor';
  metadata?: Record<string, any>;
}

// Generic heatmap data
interface HeatmapData {
  data: Array<{
    date: Date;
    value: number;
  }>;
  minValue: number;
  maxValue: number;
}

// Adapter response wrapper
interface AdapterResponse<TData> {
  data: TData;
  metadata: {
    source: 'github' | 'npm' | 'npms';
    fetchedAt: Date;
    cacheKey: string;
    cacheTTL: number;
  };
}

// Data adapter interface
interface DataAdapter<TConfig, TData> {
  fetch(config: TConfig): Promise<AdapterResponse<TData>>;
  cache?: {
    enabled: boolean;
    ttl: number;  // Seconds
    keyGenerator: (config: TConfig) => string;
  };
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}
```

### Widget Registry Types

```typescript
// Widget definition (registered in registry)
interface WidgetDefinition<TConfig = WidgetConfig, TData = any> {
  // Identity
  type: WidgetType;
  name: string;
  description: string;
  icon: string;  // Icon name from Salt DS or custom
  category: WidgetCategory;
  tags?: string[];

  // Configuration
  defaultConfig: TConfig;
  configSchema: z.ZodSchema<TConfig>;

  // Layout
  minSize: WidgetSize;
  defaultSize: WidgetSize;
  maxSize?: WidgetSize;

  // Component
  component: React.ComponentType<WidgetProps<TConfig, TData>>;

  // Data
  dataAdapter?: DataAdapter<TConfig, TData>;

  // Lifecycle hooks
  lifecycle?: WidgetLifecycleHooks<TConfig, TData>;

  // Versioning
  version: string;
  migrations?: Record<string, (oldConfig: any) => TConfig>;

  // Feature flags
  features?: {
    supportsRefresh?: boolean;
    supportsExport?: boolean;
    supportsFilters?: boolean;
    requiresAuth?: boolean;
  };
}

// Widget registry interface
interface WidgetRegistry {
  register<TConfig, TData>(definition: WidgetDefinition<TConfig, TData>): void;
  unregister(type: WidgetType): void;
  get<TConfig, TData>(type: WidgetType): WidgetDefinition<TConfig, TData> | undefined;
  getAll(): WidgetDefinition[];
  getByCategory(category: WidgetCategory): WidgetDefinition[];
  getByTag(tag: string): WidgetDefinition[];
  has(type: WidgetType): boolean;
}

// Widget factory interface
interface WidgetFactory {
  create<TConfig>(
    type: WidgetType,
    configOverrides?: Partial<TConfig>,
    position?: WidgetPosition
  ): Widget<TConfig>;

  createWithDefaults(type: WidgetType): Widget;

  validate(widget: Widget): boolean;
}
```

### Widget Lifecycle Types

```typescript
// Widget lifecycle state
type WidgetLifecycleState =
  | 'uninitialized'  // Widget created but not mounted
  | 'initializing'   // Data fetching in progress
  | 'active'         // Normal operation
  | 'updating'       // Configuration changed, re-fetching data
  | 'refreshing'     // Manual refresh triggered
  | 'error'          // Error state
  | 'unmounting'     // Cleanup in progress
  | 'destroyed';     // Widget removed

// Widget state (runtime)
interface WidgetState<TData = any> {
  lifecycleState: WidgetLifecycleState;
  data: TData | null;
  error: Error | null;
  loading: boolean;
  lastFetched: Date | null;
  lastUpdated: Date | null;
  retryCount: number;
}

// Widget lifecycle hooks
interface WidgetLifecycleHooks<TConfig, TData> {
  onInit?(widget: Widget<TConfig>): void | Promise<void>;
  onMount?(widget: Widget<TConfig>): void;
  onDataFetched?(widget: Widget<TConfig>, data: TData): void;
  onUpdate?(widget: Widget<TConfig>, prevConfig: TConfig): void;
  onRefresh?(widget: Widget<TConfig>): void;
  onError?(widget: Widget<TConfig>, error: Error): void;
  onUnmount?(widget: Widget<TConfig>): void;
  onDestroy?(widget: Widget<TConfig>): void;
}

// Widget component props
interface WidgetProps<TConfig, TData> {
  widget: Widget<TConfig>;
  config: TConfig;
  data: TData | null;
  state: WidgetState<TData>;
  onConfigChange: (config: TConfig) => void;
  onRefresh: () => void;
  onRemove: () => void;
  onError: (error: Error) => void;
}
```

### Configuration Schema Types

```typescript
// Configuration field types for UI generation
type ConfigFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'daterange'
  | 'slider'
  | 'repository'   // Custom: GitHub repo selector
  | 'package';     // Custom: npm package selector

// Configuration field definition
interface ConfigField<T = any> {
  key: string;
  label: string;
  type: ConfigFieldType;
  placeholder?: string;
  helpText?: string;
  defaultValue?: T;
  required?: boolean;
  validation?: z.ZodSchema<T>;

  // For select/radio/multiselect
  options?: Array<{ label: string; value: string | number }>;

  // For number/slider
  min?: number;
  max?: number;
  step?: number;

  // Conditional display
  visibleWhen?: (config: Partial<WidgetConfig>) => boolean;

  // Dependencies
  dependsOn?: string[];
}

// Configuration section (for grouping fields)
interface ConfigSection {
  title: string;
  description?: string;
  fields: ConfigField[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// Widget configuration UI definition
interface WidgetConfigUI {
  sections: ConfigSection[];
  layout?: 'single-column' | 'two-column';
}
```

## Data Adapter Pattern

### Adapter Architecture

The Data Adapter Pattern decouples widgets from API specifics by introducing an abstraction layer that:

1. **Normalizes API Responses**: Transforms diverse API responses into standardized data contracts
2. **Handles Authentication**: Manages API tokens and authentication headers
3. **Implements Caching**: Reduces API calls with intelligent caching strategies
4. **Rate Limiting**: Prevents exceeding API quotas
5. **Error Handling**: Provides consistent error responses

### GitHub Data Adapters

```typescript
// GitHub Stars Timeline Adapter
interface GitHubStarsTimelineAdapter
  extends DataAdapter<GitHubStarsTimelineConfig, ChartData> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Validate config using Zod schema
    // 2. Check cache for existing data
    // 3. Call GitHub API: GET /repos/{owner}/{repo}/stargazers
    //    - Use 'Accept: application/vnd.github.v3.star+json' header
    //    - Paginate to collect all stargazers with timestamps
    // 4. Transform to ChartData:
    //    - Group by time period (daily/weekly/monthly)
    //    - Calculate cumulative counts
    //    - Format: [{ date: '2025-01-01', stars: 1234 }, ...]
    // 5. Cache result with 1-hour TTL
    // 6. Return AdapterResponse with metadata
  };

  cache: {
    enabled: true,
    ttl: 3600,  // 1 hour
    keyGenerator: (config) =>
      `github-stars-${config.repository.owner}-${config.repository.name}-${config.timeRange}`
  };

  rateLimit: {
    maxRequests: 5000,
    windowMs: 3600000  // 1 hour
  };
}

// GitHub Issues List Adapter
interface GitHubIssuesListAdapter
  extends DataAdapter<GitHubIssuesListConfig, ListItem[]> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Call GitHub API: GET /repos/{owner}/{repo}/issues
    //    - Parameters: state, labels, sort, direction, per_page
    // 2. Transform to ListItem[]:
    //    - id: issue.number
    //    - title: issue.title
    //    - subtitle: issue.user.login
    //    - metadata: { labels, comments, state }
    //    - timestamp: issue.created_at
    //    - status: open -> 'warning', closed -> 'success'
    //    - avatar: issue.user.avatar_url
    //    - url: issue.html_url
    // 3. Cache with 5-minute TTL (issues change frequently)
  };

  cache: {
    enabled: true,
    ttl: 300,  // 5 minutes
    keyGenerator: (config) =>
      `github-issues-${config.repository.owner}-${config.repository.name}-${config.state}-${config.limit}`
  };
}

// GitHub Pull Requests Adapter
interface GitHubPullRequestsAdapter
  extends DataAdapter<GitHubPullRequestsConfig, TableRow[]> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Call GitHub API: GET /repos/{owner}/{repo}/pulls
    //    - Parameters: state, sort, direction
    // 2. Transform to TableRow[]:
    //    - id: pr.number
    //    - cells: {
    //        title: pr.title,
    //        author: pr.user.login,
    //        status: pr.state,
    //        created: pr.created_at,
    //        merged: pr.merged_at,
    //        reviews: pr.review_comments
    //      }
    //    - url: pr.html_url
    // 3. Cache with 5-minute TTL
  };
}

// GitHub Contributors Adapter
interface GitHubContributorsAdapter
  extends DataAdapter<GitHubContributorsConfig, ListItem[]> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Call GitHub API: GET /repos/{owner}/{repo}/contributors
    //    - Parameters: per_page, sort (anon=false)
    // 2. Transform to ListItem[]:
    //    - id: contributor.login
    //    - title: contributor.login
    //    - subtitle: `${contributor.contributions} contributions`
    //    - metadata: { contributions: contributor.contributions }
    //    - avatar: contributor.avatar_url
    //    - url: contributor.html_url
    // 3. Sort by contributions descending
    // 4. Limit to config.limit
    // 5. Cache with 6-hour TTL (contributors change slowly)
  };

  cache: {
    enabled: true,
    ttl: 21600,  // 6 hours
    keyGenerator: (config) =>
      `github-contributors-${config.repository.owner}-${config.repository.name}-${config.limit}`
  };
}

// GitHub Overview Metrics Adapter
interface GitHubOverviewMetricsAdapter
  extends DataAdapter<GitHubOverviewMetricsConfig, MetricValue[]> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Call GitHub API: GET /repos/{owner}/{repo}
    // 2. Extract metrics based on config.metrics:
    //    - stars: { label: 'Stars', value: repo.stargazers_count, icon: 'star' }
    //    - forks: { label: 'Forks', value: repo.forks_count, icon: 'fork' }
    //    - watchers: { label: 'Watchers', value: repo.subscribers_count, icon: 'eye' }
    //    - issues: { label: 'Open Issues', value: repo.open_issues_count, icon: 'issue' }
    //    - updated: { label: 'Last Updated', value: repo.updated_at, icon: 'clock' }
    // 3. Calculate trends if possible (requires historical data)
    // 4. Cache with 30-minute TTL
  };

  cache: {
    enabled: true,
    ttl: 1800,  // 30 minutes
    keyGenerator: (config) =>
      `github-overview-${config.repository.owner}-${config.repository.name}`
  };
}

// GitHub Releases Adapter
interface GitHubReleasesAdapter
  extends DataAdapter<GitHubReleasesConfig, TimelineEvent[] | ChartData> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Call GitHub API: GET /repos/{owner}/{repo}/releases
    //    - Parameters: per_page (config.limit)
    // 2. Transform based on config.chartType:
    //    - timeline: TimelineEvent[] with release.name, release.published_at
    //    - bar: ChartData with download counts per release
    // 3. Cache with 1-hour TTL
  };
}
```

### npm Data Adapters

```typescript
// npm Downloads Trend Adapter
interface NpmDownloadsTrendAdapter
  extends DataAdapter<NpmDownloadsTrendConfig, ChartData> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Call npm API: GET /downloads/range/{period}:{last-day}/{package}
    //    - Period format: 'last-week', 'last-month', custom range
    // 2. If comparePackages provided, fetch data for each
    // 3. Transform to ChartData:
    //    - type: 'line' or 'area'
    //    - data: [{ date: '2025-01-01', downloads: 1234, package1: 1234, package2: 5678 }]
    //    - xAxisKey: 'date'
    //    - yAxisKey: ['downloads'] or ['package1', 'package2', ...]
    // 4. Aggregate by config.aggregation (daily/weekly/monthly)
    // 5. Cache with 24-hour TTL for historical data, 1-hour for recent
  };

  cache: {
    enabled: true,
    ttl: 3600,  // 1 hour (recent data changes)
    keyGenerator: (config) =>
      `npm-downloads-${config.packageName}-${config.timeRange}-${config.aggregation}`
  };

  rateLimit: {
    maxRequests: 1000,  // No official limit, be conservative
    windowMs: 3600000
  };
}

// npm Version History Adapter
interface NpmVersionHistoryAdapter
  extends DataAdapter<NpmVersionHistoryConfig, TableRow[]> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Call npm Registry API: GET /{package}
    // 2. Extract versions from response.time object
    // 3. Get size from response.versions[version].dist.unpackedSize
    // 4. Transform to TableRow[]:
    //    - id: version
    //    - cells: {
    //        version: version,
    //        published: time[version],
    //        size: formatBytes(size)
    //      }
    // 5. Sort by published date descending
    // 6. Limit to config.limit
    // 7. Cache with 24-hour TTL (versions don't change)
  };

  cache: {
    enabled: true,
    ttl: 86400,  // 24 hours
    keyGenerator: (config) => `npm-versions-${config.packageName}`
  };
}

// npm Quality Score Adapter
interface NpmQualityScoreAdapter
  extends DataAdapter<NpmQualityScoreConfig, MetricValue[]> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Call npms.io API: GET /v2/package/{package}
    // 2. Extract scores from response.score:
    //    - quality: response.score.detail.quality
    //    - popularity: response.score.detail.popularity
    //    - maintenance: response.score.detail.maintenance
    //    - overall: response.score.final
    // 3. Transform to MetricValue[]:
    //    - label: 'Quality Score'
    //    - value: (score * 100).toFixed(1)
    //    - unit: '%'
    //    - trend: based on historical comparison if available
    // 4. Cache with 6-hour TTL
  };

  cache: {
    enabled: true,
    ttl: 21600,  // 6 hours
    keyGenerator: (config) => `npm-quality-${config.packageName}`
  };
}

// npm Dependencies Adapter
interface NpmDependenciesAdapter
  extends DataAdapter<NpmDependenciesConfig, ListItem[]> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Call npm Registry API: GET /{package}/latest
    // 2. Extract dependencies based on config.dependencyType:
    //    - dependencies, devDependencies, peerDependencies, or all
    // 3. Transform to ListItem[]:
    //    - id: dependency name
    //    - title: dependency name
    //    - subtitle: version range
    //    - metadata: { type: 'prod' | 'dev' | 'peer' }
    // 4. Limit to config.limit if provided
    // 5. Cache with 24-hour TTL
  };
}
```

### Cross-Source Adapters

```typescript
// Cross-Source Comparison Adapter
interface CrossComparisonAdapter
  extends DataAdapter<CrossComparisonConfig, ChartData> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. For each source in config.sources:
    //    - If type === 'github': fetch metric from GitHub API
    //    - If type === 'npm': fetch metric from npm API
    // 2. Normalize metric values:
    //    - stars: direct count
    //    - downloads: last 30 days total
    //    - issues: open issues count
    //    - quality: npms.io score * 100
    // 3. Transform to ChartData:
    //    - type: 'bar' or 'radar'
    //    - data: [{ name: identifier, value: metricValue }, ...]
    // 4. Cache with 30-minute TTL
  };

  cache: {
    enabled: true,
    ttl: 1800,
    keyGenerator: (config) =>
      `cross-comparison-${config.metric}-${config.sources.map(s => s.identifier).join('-')}`
  };
}

// Activity Heatmap Adapter
interface ActivityHeatmapAdapter
  extends DataAdapter<ActivityHeatmapConfig, HeatmapData> {

  fetch: async (config) => {
    // Implementation strategy:
    // 1. Based on source.type and activityType:
    //    - GitHub commits: GET /repos/{owner}/{repo}/commits
    //    - GitHub issues: GET /repos/{owner}/{repo}/issues
    //    - npm downloads: GET /downloads/range/{period}/{package}
    // 2. Aggregate activity by config.granularity (hour or day)
    // 3. Transform to HeatmapData:
    //    - data: [{ date: Date, value: activityCount }, ...]
    //    - minValue, maxValue for color scale
    // 4. Cache with 1-hour TTL
  };
}
```

### Adapter Utilities

```typescript
// Cache manager interface
interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Rate limiter interface
interface RateLimiter {
  checkLimit(key: string): Promise<boolean>;
  recordRequest(key: string): Promise<void>;
  getRemainingRequests(key: string): Promise<number>;
  getResetTime(key: string): Promise<Date>;
}

// API client configuration
interface APIClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryStrategy?: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
}

// Generic API client
interface APIClient {
  get<T>(path: string, params?: Record<string, any>): Promise<T>;
  post<T>(path: string, body: any): Promise<T>;
  configure(config: Partial<APIClientConfig>): void;
}
```

## Generic Visualization Components

### Component Architecture

Generic visualization components accept normalized data contracts and render using Recharts and Salt DS components. Each component is:

1. **Data-Agnostic**: Accepts generic data formats (ChartData, MetricValue[], etc.)
2. **Responsive**: Adapts to widget size constraints
3. **Accessible**: WCAG 2.1 AA compliant with keyboard navigation
4. **Themeable**: Uses Salt DS tokens for colors and spacing
5. **Interactive**: Supports tooltips, legends, zooming where appropriate

### ChartWidget Component

```typescript
// ChartWidget renders line, bar, area, pie, radar charts
interface ChartWidgetProps {
  data: ChartData;
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  colors?: string[];  // Defaults to Salt DS palette
  height?: number;    // Pixels
  loading?: boolean;
  error?: Error | null;
}

// Component structure:
// - Salt DS Card container
// - Title bar with optional actions (refresh, export)
// - Recharts component based on data.type:
//   - LineChart for 'line'
//   - BarChart for 'bar'
//   - AreaChart for 'area'
//   - PieChart for 'pie'
//   - RadarChart for 'radar'
// - Responsive container adapts to widget size
// - Loading skeleton using Salt DS Skeleton
// - Error state with Salt DS Banner
// - Empty state with message

// Implementation considerations:
// - Use Salt DS color tokens: --salt-color-blue-500, --salt-color-green-500, etc.
// - Tooltip styling matches Salt DS theme
// - Legend uses Salt DS typography
// - Grid lines use --salt-color-gray-200
// - Responsive breakpoints: small (w < 4), medium (w < 8), large (w >= 8)
// - Axis label truncation for small sizes
// - Dynamic tick count based on width
```

### MetricWidget Component

```typescript
// MetricWidget renders KPI cards with optional trends
interface MetricWidgetProps {
  metrics: MetricValue[];
  layout: 'single' | 'grid' | 'horizontal';
  showTrends?: boolean;
  showIcons?: boolean;
  loading?: boolean;
  error?: Error | null;
}

// Component structure:
// - Salt DS Card container
// - Layout options:
//   - single: One large metric (for w=2, h=2 widgets)
//   - grid: 2x2 or 2x1 grid of metrics (for larger widgets)
//   - horizontal: Metrics in a row (for wide widgets)
// - Each metric displays:
//   - Icon (optional, from Salt DS or custom)
//   - Value (large typography)
//   - Label (smaller typography)
//   - Unit (if provided)
//   - Trend indicator (arrow + percentage, colored)
// - Loading skeleton for each metric
// - Error state with Salt DS Banner

// Implementation considerations:
// - Font sizes scale with widget size
// - Trend colors: up = --salt-color-green-500, down = --salt-color-red-500
// - Icon size: 24px for single layout, 16px for grid
// - Value typography: H1 for single, H3 for grid
// - Responsive: single layout for w < 3, grid otherwise
```

### TableWidget Component

```typescript
// TableWidget renders sortable, paginated data tables
interface TableWidgetProps {
  columns: TableColumn[];
  rows: TableRow[];
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (row: TableRow) => void;
}

// Component structure:
// - Salt DS Card container with table header
// - Salt DS Table component:
//   - Sortable column headers (if sortable=true)
//   - Row rendering with proper cell types
//   - Zebra striping for readability
//   - Hover state for rows
//   - Click handler for row selection
// - Salt DS Pagination component (if paginated=true)
// - Loading skeleton with multiple rows
// - Error state with Salt DS Banner
// - Empty state with custom message

// Implementation considerations:
// - Column widths: auto-calculate or use specified widths
// - Cell formatting based on type:
//   - number: right-aligned, formatted with commas
//   - date: formatted using Intl.DateTimeFormat
//   - boolean: checkmark/x icon
//   - string: left-aligned, truncated with ellipsis
// - Sort indicators: up/down arrows in column headers
// - Responsive: hide less important columns on small sizes
// - Virtualization for large datasets (react-window)
// - Max height with scroll for h > 4
```

### ListWidget Component

```typescript
// ListWidget renders ranked lists or activity feeds
interface ListWidgetProps {
  items: ListItem[];
  showRank?: boolean;
  showAvatar?: boolean;
  showMetadata?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  error?: Error | null;
  onItemClick?: (item: ListItem) => void;
}

// Component structure:
// - Salt DS Card container
// - Salt DS List component:
//   - Each item renders as ListItem:
//     - Rank number (if showRank=true)
//     - Avatar image (if showAvatar=true and item.avatar exists)
//     - Title and subtitle
//     - Metadata badges (labels, timestamps)
//     - Status indicator (colored dot)
//   - Click handler for navigation
// - Loading skeleton with multiple items
// - Error state with Salt DS Banner
// - Empty state with custom message

// Implementation considerations:
// - Avatar: 32px circle with fallback to initials
// - Rank: displayed as badge or number
// - Status colors:
//   - success: --salt-color-green-500
//   - warning: --salt-color-orange-500
//   - error: --salt-color-red-500
//   - neutral: --salt-color-gray-500
// - Metadata: displayed as small text below subtitle
// - Timestamps: relative time (e.g., "2 hours ago")
// - Responsive: hide metadata on very small widgets
// - Max items: 10-20 depending on widget height
// - Scroll overflow for long lists
```

### TimelineWidget Component

```typescript
// TimelineWidget renders chronological events
interface TimelineWidgetProps {
  events: TimelineEvent[];
  orientation: 'vertical' | 'horizontal';
  showDetails?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  error?: Error | null;
  onEventClick?: (event: TimelineEvent) => void;
}

// Component structure:
// - Salt DS Card container
// - Timeline visualization:
//   - Vertical: top-to-bottom with dates on left, events on right
//   - Horizontal: left-to-right with dates on top, events on bottom
//   - Each event:
//     - Timestamp marker (dot on timeline)
//     - Event title
//     - Description (if showDetails=true)
//     - Type indicator (major events larger/colored differently)
//     - Connecting lines between events
// - Loading skeleton
// - Error state
// - Empty state

// Implementation considerations:
// - Timeline line: 2px solid --salt-color-gray-300
// - Event markers: 8px circle for minor, 12px for major
// - Major events: --salt-color-blue-500
// - Minor events: --salt-color-gray-400
// - Spacing between events: consistent vertical/horizontal rhythm
// - Responsive: switch to vertical on small widgets
// - Scroll for many events
// - Zoom controls for dense timelines
```

### HeatmapWidget Component

```typescript
// HeatmapWidget renders activity heatmaps
interface HeatmapWidgetProps {
  data: HeatmapData;
  colorScale?: [string, string];  // [low, high] colors
  showLegend?: boolean;
  cellSize?: number;
  loading?: boolean;
  error?: Error | null;
}

// Component structure:
// - Salt DS Card container
// - Heatmap grid:
//   - Cells arranged by date (day of week vs week of year)
//   - Color intensity based on value
//   - Tooltip on hover showing date and value
//   - Legend showing color scale
// - Loading skeleton
// - Error state
// - Empty state

// Implementation considerations:
// - Color scale: interpolate between low and high colors
// - Default colors: --salt-color-blue-100 to --salt-color-blue-900
// - Cell size: dynamic based on widget size
// - Tooltip: Salt DS Tooltip component
// - Layout: GitHub-style contribution graph
// - Responsive: adjust cell size and layout for small widgets
// - Month labels on top or left
// - Day labels (M, W, F) on side
```

## Widget Registry System

### Registry Architecture

The Widget Registry is a singleton service that manages widget type registration, discovery, and instantiation. It provides:

1. **Type Registration**: Register widget definitions with validation
2. **Discovery**: Query widgets by type, category, or tags
3. **Instantiation**: Factory methods to create widget instances
4. **Validation**: Ensure widget definitions are complete and valid
5. **Versioning**: Support for widget definition migrations

### Registry Implementation Specification

```typescript
// Singleton registry instance
class WidgetRegistryImpl implements WidgetRegistry {
  private definitions: Map<WidgetType, WidgetDefinition>;
  private categoryIndex: Map<WidgetCategory, Set<WidgetType>>;
  private tagIndex: Map<string, Set<WidgetType>>;

  constructor() {
    this.definitions = new Map();
    this.categoryIndex = new Map();
    this.tagIndex = new Map();
  }

  register<TConfig, TData>(definition: WidgetDefinition<TConfig, TData>): void {
    // Implementation steps:
    // 1. Validate definition completeness:
    //    - Required fields: type, name, description, category, component
    //    - Config schema is valid Zod schema
    //    - Size constraints are positive integers
    //    - Version follows semver
    // 2. Check for duplicate type registration
    // 3. Store definition in Map
    // 4. Update category index
    // 5. Update tag index (if tags provided)
    // 6. Emit registration event for observability
  }

  unregister(type: WidgetType): void {
    // Implementation steps:
    // 1. Retrieve definition from Map
    // 2. Remove from category index
    // 3. Remove from tag index
    // 4. Delete from definitions Map
    // 5. Emit unregistration event
  }

  get<TConfig, TData>(type: WidgetType): WidgetDefinition<TConfig, TData> | undefined {
    // Simple Map lookup with type assertion
  }

  getAll(): WidgetDefinition[] {
    // Return Array from Map values, sorted by name
  }

  getByCategory(category: WidgetCategory): WidgetDefinition[] {
    // 1. Lookup category in categoryIndex
    // 2. Retrieve definitions for each type
    // 3. Sort by name and return
  }

  getByTag(tag: string): WidgetDefinition[] {
    // 1. Lookup tag in tagIndex
    // 2. Retrieve definitions for each type
    // 3. Sort by name and return
  }

  has(type: WidgetType): boolean {
    // Simple Map.has() check
  }
}

// Export singleton instance
export const widgetRegistry: WidgetRegistry = new WidgetRegistryImpl();
```

### Widget Factory Implementation Specification

```typescript
// Factory for creating widget instances
class WidgetFactoryImpl implements WidgetFactory {
  constructor(private registry: WidgetRegistry) {}

  create<TConfig>(
    type: WidgetType,
    configOverrides?: Partial<TConfig>,
    position?: WidgetPosition
  ): Widget<TConfig> {
    // Implementation steps:
    // 1. Retrieve widget definition from registry
    // 2. Throw error if type not found
    // 3. Merge defaultConfig with configOverrides
    // 4. Validate merged config using configSchema
    // 5. Generate unique widget ID (UUIDv4 or nanoid)
    // 6. Create Widget instance:
    //    - id: generated ID
    //    - type: provided type
    //    - config: merged and validated config
    //    - position: provided or default { x: 0, y: 0 }
    //    - size: definition.defaultSize
    //    - metadata: { createdAt: new Date(), updatedAt: new Date() }
    // 7. Return Widget instance
  }

  createWithDefaults(type: WidgetType): Widget {
    // Calls create() with no overrides
    return this.create(type);
  }

  validate(widget: Widget): boolean {
    // Implementation steps:
    // 1. Retrieve widget definition from registry
    // 2. If not found, return false
    // 3. Validate config against configSchema
    // 4. Check size constraints (min/max)
    // 5. Check position is non-negative
    // 6. Return true if all validations pass
  }
}

// Export factory instance
export const widgetFactory: WidgetFactory = new WidgetFactoryImpl(widgetRegistry);
```

### Widget Catalog Service

```typescript
// Service for browsing and searching widget catalog
interface WidgetCatalogService {
  getCategories(): WidgetCategory[];
  getCategoryMetadata(category: WidgetCategory): CategoryDefinition;
  searchWidgets(query: string): WidgetDefinition[];
  getRecentlyUsed(limit: number): WidgetDefinition[];
  getMostPopular(limit: number): WidgetDefinition[];
  getFeatured(): WidgetDefinition[];
}

// Category definitions
const CATEGORY_DEFINITIONS: Record<WidgetCategory, CategoryDefinition> = {
  metrics: {
    id: 'metrics',
    name: 'Metrics',
    description: 'Key performance indicators and metric displays',
    icon: 'dashboard'
  },
  charts: {
    id: 'charts',
    name: 'Charts',
    description: 'Line, bar, area, and pie chart visualizations',
    icon: 'chart-line'
  },
  tables: {
    id: 'tables',
    name: 'Tables',
    description: 'Data tables with sorting and filtering',
    icon: 'table'
  },
  lists: {
    id: 'lists',
    name: 'Lists',
    description: 'Ranked lists and activity feeds',
    icon: 'list'
  },
  timelines: {
    id: 'timelines',
    name: 'Timelines',
    description: 'Chronological event visualizations',
    icon: 'timeline'
  },
  comparisons: {
    id: 'comparisons',
    name: 'Comparisons',
    description: 'Multi-entity comparison charts',
    icon: 'compare'
  },
  health: {
    id: 'health',
    name: 'Health',
    description: 'Status indicators and health scores',
    icon: 'health'
  }
};
```

## Widget Lifecycle Management

### Lifecycle State Machine

```
┌──────────────┐
│ Uninitialized│ (Widget created, not mounted)
└──────┬───────┘
       │
       │ onMount()
       ▼
┌──────────────┐
│ Initializing │ (Data fetching begins)
└──────┬───────┘
       │
       │ Data fetched successfully
       ▼
┌──────────────┐
│    Active    │◄──────────┐ (Normal operation)
└──────┬───────┘           │
       │                   │ Data refreshed
       │ Config change     │
       ▼                   │
┌──────────────┐           │
│   Updating   │───────────┘ (Re-fetching data)
└──────┬───────┘
       │
       │ Error occurs
       ▼
┌──────────────┐
│    Error     │ (Error state, retry possible)
└──────┬───────┘
       │
       │ onUnmount()
       ▼
┌──────────────┐
│  Unmounting  │ (Cleanup in progress)
└──────┬───────┘
       │
       │ Cleanup complete
       ▼
┌──────────────┐
│  Destroyed   │ (Widget removed)
└──────────────┘
```

### Lifecycle Manager Specification

```typescript
// Manages widget lifecycle and data fetching
interface WidgetLifecycleManager {
  mount(widget: Widget): Promise<void>;
  unmount(widget: Widget): Promise<void>;
  update(widget: Widget, newConfig: WidgetConfig): Promise<void>;
  refresh(widget: Widget): Promise<void>;
  getState(widgetId: WidgetId): WidgetState | undefined;
  subscribeToState(widgetId: WidgetId, callback: (state: WidgetState) => void): () => void;
}

// Implementation specification
class WidgetLifecycleManagerImpl implements WidgetLifecycleManager {
  private states: Map<WidgetId, WidgetState>;
  private subscriptions: Map<WidgetId, Set<(state: WidgetState) => void>>;
  private refreshIntervals: Map<WidgetId, NodeJS.Timeout>;

  constructor(
    private registry: WidgetRegistry,
    private cacheManager: CacheManager,
    private rateLimiter: RateLimiter
  ) {
    this.states = new Map();
    this.subscriptions = new Map();
    this.refreshIntervals = new Map();
  }

  async mount(widget: Widget): Promise<void> {
    // Implementation steps:
    // 1. Initialize widget state:
    //    - lifecycleState: 'initializing'
    //    - data: null
    //    - error: null
    //    - loading: true
    //    - lastFetched: null
    //    - lastUpdated: new Date()
    //    - retryCount: 0
    // 2. Store state in Map
    // 3. Notify subscribers
    // 4. Retrieve widget definition from registry
    // 5. Execute lifecycle hook: onInit()
    // 6. Execute lifecycle hook: onMount()
    // 7. Start data fetching (if dataAdapter exists):
    //    a. Check cache for existing data
    //    b. If cache hit: update state with cached data, set to 'active'
    //    c. If cache miss: fetch data using adapter
    //    d. On success: update state with data, call onDataFetched(), set to 'active'
    //    e. On error: update state with error, call onError(), set to 'error'
    // 8. Setup auto-refresh if configured:
    //    - Check adapter.refresh.enabled
    //    - If true, setup interval with adapter.refresh.interval
    //    - Store interval handle in Map
    // 9. Notify subscribers of final state
  }

  async unmount(widget: Widget): Promise<void> {
    // Implementation steps:
    // 1. Update state: lifecycleState = 'unmounting'
    // 2. Notify subscribers
    // 3. Clear auto-refresh interval (if exists)
    // 4. Execute lifecycle hook: onUnmount()
    // 5. Remove widget state from Map
    // 6. Remove subscriptions for widget
    // 7. Execute lifecycle hook: onDestroy()
    // 8. Final cleanup
  }

  async update(widget: Widget, newConfig: WidgetConfig): Promise<void> {
    // Implementation steps:
    // 1. Retrieve current state
    // 2. Store previous config for comparison
    // 3. Update state: lifecycleState = 'updating', loading = true
    // 4. Notify subscribers
    // 5. Execute lifecycle hook: onUpdate(widget, prevConfig)
    // 6. Re-fetch data with new config:
    //    a. Check cache with new config key
    //    b. Fetch if cache miss
    //    c. Update state with new data or error
    // 7. Update widget.config to newConfig
    // 8. Update state: lifecycleState = 'active', loading = false
    // 9. Notify subscribers
  }

  async refresh(widget: Widget): Promise<void> {
    // Implementation steps:
    // 1. Update state: lifecycleState = 'refreshing', loading = true
    // 2. Notify subscribers
    // 3. Execute lifecycle hook: onRefresh()
    // 4. Invalidate cache for widget
    // 5. Fetch fresh data:
    //    a. Use adapter.fetch() directly
    //    b. On success: update state, call onDataFetched()
    //    c. On error: update state, call onError()
    // 6. Update state: lifecycleState = 'active', loading = false
    // 7. Notify subscribers
  }

  getState(widgetId: WidgetId): WidgetState | undefined {
    return this.states.get(widgetId);
  }

  subscribeToState(
    widgetId: WidgetId,
    callback: (state: WidgetState) => void
  ): () => void {
    // 1. Get or create subscription set for widget
    // 2. Add callback to set
    // 3. Return unsubscribe function that removes callback
  }

  private notifySubscribers(widgetId: WidgetId, state: WidgetState): void {
    // 1. Retrieve subscription set
    // 2. Call each callback with new state
  }

  private async fetchData<TConfig, TData>(
    widget: Widget<TConfig>,
    adapter: DataAdapter<TConfig, TData>
  ): Promise<void> {
    // 1. Check rate limit
    // 2. Check cache
    // 3. If cache hit: return cached data
    // 4. If cache miss:
    //    a. Call adapter.fetch(config)
    //    b. Store in cache with TTL
    //    c. Record rate limit usage
    // 5. Handle errors with retry logic
  }
}

// Export lifecycle manager instance
export const widgetLifecycleManager: WidgetLifecycleManager =
  new WidgetLifecycleManagerImpl(widgetRegistry, cacheManager, rateLimiter);
```

### React Integration

```typescript
// React hook for widget lifecycle management
function useWidget<TConfig, TData>(widget: Widget<TConfig>): {
  data: TData | null;
  state: WidgetState<TData>;
  refresh: () => void;
  updateConfig: (config: TConfig) => void;
} {
  // Implementation using:
  // - useEffect for mount/unmount
  // - useState for state management
  // - useCallback for action handlers
  // - widgetLifecycleManager for lifecycle operations

  // On mount: call lifecycleManager.mount(widget)
  // On unmount: call lifecycleManager.unmount(widget)
  // Subscribe to state changes and update local state
  // Provide refresh and updateConfig handlers
}

// Widget container component
function WidgetContainer({ widget }: { widget: Widget }) {
  const definition = widgetRegistry.get(widget.type);
  const { data, state, refresh, updateConfig } = useWidget(widget);

  if (!definition) {
    return <div>Widget type not found: {widget.type}</div>;
  }

  const Component = definition.component;

  return (
    <Component
      widget={widget}
      config={widget.config}
      data={data}
      state={state}
      onConfigChange={updateConfig}
      onRefresh={refresh}
      onRemove={() => {/* emit remove event */}}
      onError={(error) => {/* log error */}}
    />
  );
}
```

## Configuration Schema System

### Schema Design Principles

1. **Runtime Validation**: Zod schemas validate configurations at runtime
2. **Type Inference**: TypeScript types derived from Zod schemas
3. **Default Values**: Schemas provide defaults for optional fields
4. **Error Messages**: Validation errors include helpful messages
5. **Composability**: Share common schema patterns across widgets

### Configuration Schemas

```typescript
import { z } from 'zod';

// Common schema patterns
const GitHubRepositorySchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  name: z.string().min(1, 'Repository name is required')
});

const TimeRangeSchema = z.enum(['7d', '30d', '90d', '1y', 'all']);
const ChartTypeSchema = z.enum(['line', 'bar', 'area', 'pie', 'radar']);
const StateFilterSchema = z.enum(['open', 'closed', 'all']);
const SortDirectionSchema = z.enum(['asc', 'desc']);

// Widget-specific schemas
const GitHubStarsTimelineConfigSchema = z.object({
  repository: GitHubRepositorySchema,
  timeRange: TimeRangeSchema.default('30d'),
  showForks: z.boolean().default(false),
  chartType: z.enum(['line', 'area']).default('line'),
  aggregation: z.enum(['daily', 'weekly', 'monthly']).optional()
});

const GitHubIssuesListConfigSchema = z.object({
  repository: GitHubRepositorySchema,
  state: StateFilterSchema.default('open'),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.enum(['created', 'updated', 'comments']).default('created'),
  sortDirection: SortDirectionSchema.default('desc'),
  labels: z.array(z.string()).optional()
});

const GitHubPullRequestsConfigSchema = z.object({
  repository: GitHubRepositorySchema,
  state: z.enum(['open', 'closed', 'merged', 'all']).default('open'),
  timeRange: TimeRangeSchema.default('30d'),
  sortBy: z.enum(['created', 'updated', 'merged']).default('created')
});

const GitHubContributorsConfigSchema = z.object({
  repository: GitHubRepositorySchema,
  limit: z.number().min(1).max(50).default(10),
  sortBy: z.enum(['contributions', 'recent']).default('contributions')
});

const GitHubOverviewMetricsConfigSchema = z.object({
  repository: GitHubRepositorySchema,
  metrics: z.array(
    z.enum(['stars', 'forks', 'watchers', 'issues', 'updated'])
  ).min(1).default(['stars', 'forks', 'issues'])
});

const GitHubReleasesConfigSchema = z.object({
  repository: GitHubRepositorySchema,
  limit: z.number().min(1).max(50).default(10),
  chartType: z.enum(['timeline', 'bar']).default('timeline')
});

const NpmDownloadsTrendConfigSchema = z.object({
  packageName: z.string().min(1, 'Package name is required'),
  timeRange: TimeRangeSchema.default('30d'),
  aggregation: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  comparePackages: z.array(z.string()).optional()
});

const NpmVersionHistoryConfigSchema = z.object({
  packageName: z.string().min(1, 'Package name is required'),
  limit: z.number().min(1).max(100).default(20)
});

const NpmQualityScoreConfigSchema = z.object({
  packageName: z.string().min(1, 'Package name is required'),
  metrics: z.array(
    z.enum(['quality', 'popularity', 'maintenance', 'overall'])
  ).min(1).default(['quality', 'popularity', 'maintenance', 'overall'])
});

const NpmDependenciesConfigSchema = z.object({
  packageName: z.string().min(1, 'Package name is required'),
  dependencyType: z.enum([
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'all'
  ]).default('dependencies'),
  limit: z.number().min(1).max(100).optional()
});

const CrossComparisonConfigSchema = z.object({
  sources: z.array(z.object({
    type: z.enum(['github', 'npm']),
    identifier: z.string().min(1)
  })).min(2, 'At least two sources required for comparison'),
  metric: z.enum(['stars', 'downloads', 'issues', 'quality']),
  chartType: z.enum(['bar', 'radar']).default('bar')
});

const ActivityHeatmapConfigSchema = z.object({
  source: z.object({
    type: z.enum(['github', 'npm']),
    identifier: z.string().min(1)
  }),
  activityType: z.enum(['commits', 'downloads', 'issues']),
  timeRange: TimeRangeSchema.default('90d'),
  granularity: z.enum(['hour', 'day']).default('day')
});

// Type inference from schemas
type GitHubStarsTimelineConfig = z.infer<typeof GitHubStarsTimelineConfigSchema>;
type GitHubIssuesListConfig = z.infer<typeof GitHubIssuesListConfigSchema>;
// ... (types inferred for all schemas)
```

### Configuration UI Generation

```typescript
// Configuration field definitions for UI generation
const GitHubStarsTimelineConfigUI: WidgetConfigUI = {
  sections: [
    {
      title: 'Repository',
      fields: [
        {
          key: 'repository.owner',
          label: 'Repository Owner',
          type: 'text',
          placeholder: 'facebook',
          helpText: 'GitHub username or organization name',
          required: true
        },
        {
          key: 'repository.name',
          label: 'Repository Name',
          type: 'text',
          placeholder: 'react',
          helpText: 'Repository name (without owner)',
          required: true
        }
      ]
    },
    {
      title: 'Display Options',
      fields: [
        {
          key: 'timeRange',
          label: 'Time Range',
          type: 'select',
          options: [
            { label: 'Last 7 days', value: '7d' },
            { label: 'Last 30 days', value: '30d' },
            { label: 'Last 90 days', value: '90d' },
            { label: 'Last year', value: '1y' },
            { label: 'All time', value: 'all' }
          ],
          defaultValue: '30d'
        },
        {
          key: 'chartType',
          label: 'Chart Type',
          type: 'radio',
          options: [
            { label: 'Line Chart', value: 'line' },
            { label: 'Area Chart', value: 'area' }
          ],
          defaultValue: 'line'
        },
        {
          key: 'aggregation',
          label: 'Aggregation',
          type: 'select',
          options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' }
          ],
          helpText: 'How to group data points',
          visibleWhen: (config) => config.timeRange !== '7d'
        },
        {
          key: 'showForks',
          label: 'Include Forks',
          type: 'checkbox',
          helpText: 'Show fork count alongside stars',
          defaultValue: false
        }
      ]
    }
  ],
  layout: 'single-column'
};

// Similar UI definitions for all widget types...
// Each includes appropriate field types, validation, and conditional visibility
```

### Configuration Form Component

```typescript
// Generic configuration form component
interface ConfigFormProps<TConfig> {
  config: TConfig;
  configUI: WidgetConfigUI;
  schema: z.ZodSchema<TConfig>;
  onSave: (config: TConfig) => void;
  onCancel: () => void;
}

// Component renders:
// - Salt DS Form with sections
// - Appropriate input components based on field type:
//   - Text: Salt DS Input
//   - Number: Salt DS Input with type="number"
//   - Select: Salt DS Dropdown
//   - Multiselect: Salt DS ComboBox
//   - Checkbox: Salt DS Checkbox
//   - Radio: Salt DS RadioButton group
//   - Date: Salt DS DatePicker
// - Field validation on blur
// - Form-level validation on submit
// - Error messages from Zod validation
// - Save/Cancel buttons with Salt DS Button
```

## Widget Registration Examples

### Complete Widget Registration Pattern

```typescript
// Example: GitHub Stars Timeline Widget Registration
import { widgetRegistry } from '@/lib/widget-registry';
import { GitHubStarsTimelineAdapter } from '@/lib/adapters/github';
import { ChartWidget } from '@/components/widgets/ChartWidget';

// 1. Define configuration schema
const schema = GitHubStarsTimelineConfigSchema;

// 2. Define data adapter
const adapter = new GitHubStarsTimelineAdapter();

// 3. Define component wrapper (if needed)
const GitHubStarsTimelineWidget: React.FC<WidgetProps<
  GitHubStarsTimelineConfig,
  ChartData
>> = ({ widget, config, data, state, onRefresh, onConfigChange }) => {
  return (
    <ChartWidget
      data={data}
      title={widget.metadata.title || 'Repository Stars Timeline'}
      showLegend={true}
      showGrid={true}
      showTooltip={true}
      loading={state.loading}
      error={state.error}
    />
  );
};

// 4. Register widget definition
widgetRegistry.register({
  type: 'github-stars-timeline',
  name: 'Stars Timeline',
  description: 'Track star growth over time for a GitHub repository',
  icon: 'star',
  category: 'charts',
  tags: ['github', 'stars', 'growth', 'timeline'],

  defaultConfig: {
    repository: { owner: '', name: '' },
    timeRange: '30d',
    showForks: false,
    chartType: 'line'
  },

  configSchema: schema,

  minSize: { w: 4, h: 3 },
  defaultSize: { w: 6, h: 4 },
  maxSize: { w: 12, h: 8 },

  component: GitHubStarsTimelineWidget,
  dataAdapter: adapter,

  lifecycle: {
    onDataFetched: (widget, data) => {
      console.log(`Stars data fetched for ${widget.config.repository.name}`);
    }
  },

  version: '1.0.0',

  features: {
    supportsRefresh: true,
    supportsExport: true,
    supportsFilters: false,
    requiresAuth: false
  }
});
```

### Simplified Registration for Generic Components

```typescript
// When using generic components directly, registration is simpler
widgetRegistry.register({
  type: 'npm-quality-score',
  name: 'Package Quality Score',
  description: 'Display quality, popularity, and maintenance scores from npms.io',
  icon: 'quality',
  category: 'metrics',
  tags: ['npm', 'quality', 'score'],

  defaultConfig: {
    packageName: '',
    metrics: ['quality', 'popularity', 'maintenance', 'overall']
  },

  configSchema: NpmQualityScoreConfigSchema,

  minSize: { w: 2, h: 2 },
  defaultSize: { w: 4, h: 2 },

  // Use generic MetricWidget component directly
  component: ({ data, state, widget }) => (
    <MetricWidget
      metrics={data || []}
      layout="grid"
      showTrends={false}
      showIcons={true}
      loading={state.loading}
      error={state.error}
    />
  ),

  dataAdapter: new NpmQualityScoreAdapter(),

  version: '1.0.0'
});
```

## Extensibility Guidelines

### Adding a New Widget Type

To add a new widget type to the framework, developers follow this process:

**Step 1: Define Configuration Type**
```typescript
interface MyNewWidgetConfig {
  // Widget-specific configuration properties
  dataSource: string;
  displayMode: 'compact' | 'detailed';
  refreshInterval?: number;
}
```

**Step 2: Create Zod Schema**
```typescript
const MyNewWidgetConfigSchema = z.object({
  dataSource: z.string().min(1, 'Data source is required'),
  displayMode: z.enum(['compact', 'detailed']).default('compact'),
  refreshInterval: z.number().min(60).optional()
});
```

**Step 3: Define Data Contract**
```typescript
// Use existing generic types (ChartData, MetricValue[], ListItem[], etc.)
// OR define custom data type if needed
interface MyNewWidgetData {
  // Custom data structure if generic types don't fit
}
```

**Step 4: Implement Data Adapter**
```typescript
class MyNewWidgetAdapter implements DataAdapter<MyNewWidgetConfig, ChartData> {
  async fetch(config: MyNewWidgetConfig): Promise<AdapterResponse<ChartData>> {
    // 1. Fetch data from API
    // 2. Transform to generic data contract (ChartData)
    // 3. Return with metadata
  }

  cache = {
    enabled: true,
    ttl: 1800,
    keyGenerator: (config) => `mynewwidget-${config.dataSource}`
  };
}
```

**Step 5: Create Component (or use generic)**
```typescript
// Option A: Use generic component
const component = ({ data, state }) => (
  <ChartWidget data={data} loading={state.loading} error={state.error} />
);

// Option B: Create custom component
const MyNewWidget: React.FC<WidgetProps<MyNewWidgetConfig, ChartData>> = ({
  widget,
  config,
  data,
  state
}) => {
  // Custom rendering logic
  return <div>...</div>;
};
```

**Step 6: Register Widget**
```typescript
widgetRegistry.register({
  type: 'my-new-widget',
  name: 'My New Widget',
  description: 'Description of what this widget does',
  icon: 'icon-name',
  category: 'charts',  // or appropriate category
  defaultConfig: { /* defaults */ },
  configSchema: MyNewWidgetConfigSchema,
  minSize: { w: 4, h: 3 },
  defaultSize: { w: 6, h: 4 },
  component: component,  // or MyNewWidget
  dataAdapter: new MyNewWidgetAdapter(),
  version: '1.0.0'
});
```

### Widget Versioning and Migration

```typescript
// Version 1.0.0 configuration
interface MyWidgetConfigV1 {
  oldProperty: string;
}

// Version 2.0.0 configuration (breaking change)
interface MyWidgetConfigV2 {
  newProperty: string;
  additionalProperty: number;
}

// Register widget with migration
widgetRegistry.register({
  // ... other properties
  version: '2.0.0',
  migrations: {
    '1.0.0': (oldConfig: MyWidgetConfigV1): MyWidgetConfigV2 => {
      return {
        newProperty: oldConfig.oldProperty,
        additionalProperty: 10  // Default value for new property
      };
    }
  }
});

// Migration execution:
// When loading a dashboard with widgets from v1, the framework:
// 1. Detects version mismatch (widget.version vs definition.version)
// 2. Looks up migration function for widget.version
// 3. Executes migration to transform config
// 4. Updates widget.version to current version
// 5. Persists updated dashboard configuration
```

### Adding New Data Sources

To add support for a new API (beyond GitHub and npm):

**Step 1: Create API Client**
```typescript
class NewAPIClient implements APIClient {
  private baseURL = 'https://api.newservice.com';

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    // Implementation with authentication, error handling, retries
  }
}
```

**Step 2: Create Data Adapters**
```typescript
// Create adapters for each widget type using the new API
class NewAPIWidgetAdapter implements DataAdapter<WidgetConfig, GenericData> {
  private client = new NewAPIClient();

  async fetch(config: WidgetConfig): Promise<AdapterResponse<GenericData>> {
    const rawData = await this.client.get('/endpoint', { /* params */ });
    const normalizedData = this.transformToGenericFormat(rawData);
    return {
      data: normalizedData,
      metadata: {
        source: 'newapi',
        fetchedAt: new Date(),
        cacheKey: this.getCacheKey(config),
        cacheTTL: 3600
      }
    };
  }

  private transformToGenericFormat(rawData: any): GenericData {
    // Transform API response to ChartData, MetricValue[], etc.
  }
}
```

**Step 3: Register Widgets**
```typescript
// Register widgets using new adapters
widgetRegistry.register({
  type: 'newapi-metrics',
  // ... configuration
  dataAdapter: new NewAPIWidgetAdapter()
});
```

### Creating Widget Templates

```typescript
// Template factory for creating similar widgets
function createMetricWidgetDefinition(
  type: WidgetType,
  name: string,
  description: string,
  adapter: DataAdapter<any, MetricValue[]>,
  defaultConfig: any,
  configSchema: z.ZodSchema
): WidgetDefinition {
  return {
    type,
    name,
    description,
    icon: 'dashboard',
    category: 'metrics',
    defaultConfig,
    configSchema,
    minSize: { w: 2, h: 2 },
    defaultSize: { w: 4, h: 2 },
    component: ({ data, state }) => (
      <MetricWidget
        metrics={data || []}
        layout="grid"
        showTrends={true}
        loading={state.loading}
        error={state.error}
      />
    ),
    dataAdapter: adapter,
    version: '1.0.0',
    features: {
      supportsRefresh: true,
      supportsExport: true
    }
  };
}

// Use template to create multiple similar widgets
const githubMetricsWidget = createMetricWidgetDefinition(
  'github-overview-metrics',
  'Repository Metrics',
  'Key GitHub repository statistics',
  new GitHubOverviewMetricsAdapter(),
  { repository: { owner: '', name: '' }, metrics: ['stars', 'forks'] },
  GitHubOverviewMetricsConfigSchema
);

widgetRegistry.register(githubMetricsWidget);
```

## Integration Architecture

### Dashboard Integration

```typescript
// Dashboard component integrates with widget system
interface DashboardProps {
  dashboardId: string;
  widgets: Widget[];
  layout: ReactGridLayout.Layout[];
  onLayoutChange: (layout: ReactGridLayout.Layout[]) => void;
  onWidgetAdd: (widget: Widget) => void;
  onWidgetRemove: (widgetId: WidgetId) => void;
  onWidgetUpdate: (widget: Widget) => void;
}

// Dashboard renders:
// - ReactGridLayout with widget containers
// - Each WidgetContainer manages lifecycle and rendering
// - Layout changes persist to storage
// - Widget additions trigger registration and mounting
// - Widget removals trigger unmounting and cleanup
```

### Storage Integration

```typescript
// Dashboard storage service
interface DashboardStorageService {
  saveDashboard(dashboard: Dashboard): Promise<void>;
  loadDashboard(dashboardId: string): Promise<Dashboard | null>;
  listDashboards(): Promise<Dashboard[]>;
  deleteDashboard(dashboardId: string): Promise<void>;
}

// Dashboard model
interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  layout: ReactGridLayout.Layout[];
  filters?: DashboardFilters;
  createdAt: Date;
  updatedAt: Date;
}

// Implementation uses localStorage or IndexedDB
// Serialization handles Date objects and complex types
// Versioning supports schema migrations
```

### Filter System Integration

```typescript
// Board-level filters that affect compatible widgets
interface DashboardFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  repositories?: Array<{ owner: string; name: string }>;
  packages?: string[];
  customFilters?: Record<string, any>;
}

// Widget compatibility with filters
interface WidgetDefinition {
  // ... other properties
  filterCompatibility?: {
    supportsDateRange?: boolean;
    supportsRepositoryFilter?: boolean;
    supportsPackageFilter?: boolean;
    customFilterKeys?: string[];
  };
}

// Filter application:
// 1. User updates filters in dashboard sidebar
// 2. Dashboard emits filter change event
// 3. Each widget checks filterCompatibility
// 4. Compatible widgets update config and refresh data
// 5. Incompatible widgets ignore filter changes
```

## Performance Considerations

### Optimization Strategies

**Data Fetching**
- Cache API responses with appropriate TTL
- Batch requests when possible (GitHub GraphQL)
- Rate limit enforcement to prevent quota exhaustion
- Parallel fetching for independent widgets
- Cancel pending requests on widget unmount

**Rendering**
- Lazy load widget components with React.lazy()
- Memoize expensive components with React.memo()
- Virtualize large lists and tables (react-window)
- Debounce configuration changes
- Throttle auto-refresh intervals

**State Management**
- Isolate widget state (no global state for data)
- Use Context sparingly (only for theme, registry)
- Optimize re-renders with selective subscriptions
- Clean up subscriptions on unmount
- Avoid prop drilling with container pattern

**Bundle Size**
- Code split by widget type
- Dynamic imports for heavy dependencies (Recharts)
- Tree-shake unused Salt DS components
- Minimize adapter bundle size
- Lazy load configuration forms

### Performance Monitoring

```typescript
// Performance metrics to track
interface WidgetPerformanceMetrics {
  widgetType: WidgetType;
  mountTime: number;        // Time from mount() to active state
  dataFetchTime: number;    // Time to fetch and transform data
  renderTime: number;       // Time to render component
  updateTime: number;       // Time to process config change
  cacheHitRate: number;     // Percentage of cache hits
  errorRate: number;        // Percentage of failed fetches
}

// Instrumentation points:
// - Widget mount/unmount
// - Data fetch start/end
// - Component render
// - Cache hit/miss
// - Error occurrences
```

## Error Handling Patterns

### Error Types

```typescript
// Widget-specific error types
class WidgetError extends Error {
  constructor(
    public widgetId: WidgetId,
    public widgetType: WidgetType,
    message: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'WidgetError';
  }
}

class DataFetchError extends WidgetError {
  constructor(
    widgetId: WidgetId,
    widgetType: WidgetType,
    public statusCode?: number,
    message?: string,
    cause?: Error
  ) {
    super(widgetId, widgetType, message || 'Failed to fetch widget data', cause);
    this.name = 'DataFetchError';
  }
}

class ConfigValidationError extends WidgetError {
  constructor(
    widgetId: WidgetId,
    widgetType: WidgetType,
    public validationErrors: z.ZodError,
    message?: string
  ) {
    super(widgetId, widgetType, message || 'Widget configuration is invalid');
    this.name = 'ConfigValidationError';
  }
}

class RateLimitError extends WidgetError {
  constructor(
    widgetId: WidgetId,
    widgetType: WidgetType,
    public resetTime: Date,
    message?: string
  ) {
    super(
      widgetId,
      widgetType,
      message || `Rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`
    );
    this.name = 'RateLimitError';
  }
}
```

### Error Recovery Strategies

```typescript
// Retry strategy configuration
interface RetryStrategy {
  maxRetries: number;
  initialDelay: number;      // ms
  maxDelay: number;          // ms
  backoffMultiplier: number;
  retryableErrors: string[]; // Error types that should trigger retry
}

// Default retry strategy
const DEFAULT_RETRY_STRATEGY: RetryStrategy = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['NetworkError', 'TimeoutError', 'RateLimitError']
};

// Retry logic in lifecycle manager:
// 1. Catch error during data fetch
// 2. Check if error type is retryable
// 3. If retryCount < maxRetries:
//    a. Calculate delay with exponential backoff
//    b. Wait for delay
//    c. Retry fetch
//    d. Increment retryCount
// 4. If retryCount >= maxRetries:
//    a. Set widget to error state
//    b. Call onError hook
//    c. Display error UI
```

### Error UI Patterns

```typescript
// Error display component
interface WidgetErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
  onDismiss?: () => void;
}

// Error states:
// - Network error: Show retry button
// - Config error: Show "Configure Widget" button
// - Rate limit error: Show countdown to reset time
// - Generic error: Show error message and support link
```

## Testing Strategy

### Unit Testing

**Registry Tests**
- Test widget registration and unregistration
- Test retrieval by type, category, tag
- Test duplicate registration prevention
- Test validation of widget definitions

**Factory Tests**
- Test widget creation with defaults
- Test widget creation with config overrides
- Test validation of widget instances
- Test ID generation uniqueness

**Adapter Tests**
- Mock API responses
- Test data transformation to generic formats
- Test caching behavior
- Test rate limiting
- Test error handling and retries

**Schema Tests**
- Test config validation with valid inputs
- Test validation errors with invalid inputs
- Test default value application
- Test type inference

### Integration Testing

**Lifecycle Tests**
- Test full widget lifecycle (mount to unmount)
- Test data fetching on mount
- Test config updates triggering refresh
- Test manual refresh
- Test cleanup on unmount
- Test error recovery

**Component Tests**
- Test generic components with various data shapes
- Test loading states
- Test error states
- Test empty states
- Test responsive behavior

### End-to-End Testing

**Widget Addition Flow**
- User browses catalog
- User adds widget to dashboard
- Widget mounts and fetches data
- Widget displays data successfully

**Widget Configuration Flow**
- User opens widget config
- User modifies settings
- Config validates successfully
- Widget updates with new data

**Dashboard Persistence Flow**
- User creates dashboard with widgets
- User closes and reopens application
- Dashboard loads with all widgets
- Widgets restore previous state

## Summary

This widget framework architecture provides a comprehensive foundation for building an extensible, type-safe dashboard application. The key architectural decisions are:

1. **Registry Pattern**: Central widget catalog with factory functions enables easy widget discovery and instantiation without modifying core code

2. **Data Adapter Abstraction**: Separating API integration from visualization logic allows widgets to work with any data source by implementing a simple adapter interface

3. **Generic Visualization Components**: Reusable chart, metric, table, list, and timeline components accept standardized data formats, dramatically reducing implementation effort for new widgets

4. **Type-Safe Configuration**: Zod schemas provide runtime validation while TypeScript ensures compile-time safety, preventing configuration errors

5. **Lifecycle Management**: Explicit lifecycle phases with hooks enable proper initialization, updates, and cleanup for all widgets

6. **State Isolation**: Each widget manages independent state, preventing coupling and enabling fault isolation

The framework supports the 12 widgets specified in the PRD while providing clear patterns for extending to new widget types and data sources. By following the extensibility guidelines, developers can add new widgets with minimal boilerplate and maximum type safety.

## File References

**Implementation Files** (to be created by implementation agents):
- `/lib/widget-registry/registry.ts` - Registry implementation
- `/lib/widget-registry/factory.ts` - Factory implementation
- `/lib/adapters/github/*.ts` - GitHub data adapters
- `/lib/adapters/npm/*.ts` - npm data adapters
- `/lib/adapters/cache-manager.ts` - Caching layer
- `/lib/adapters/rate-limiter.ts` - Rate limiting
- `/lib/lifecycle/lifecycle-manager.ts` - Lifecycle orchestration
- `/lib/lifecycle/hooks.ts` - Lifecycle hook utilities
- `/components/widgets/ChartWidget.tsx` - Generic chart component
- `/components/widgets/MetricWidget.tsx` - Generic metric component
- `/components/widgets/TableWidget.tsx` - Generic table component
- `/components/widgets/ListWidget.tsx` - Generic list component
- `/components/widgets/TimelineWidget.tsx` - Generic timeline component
- `/components/widgets/HeatmapWidget.tsx` - Generic heatmap component
- `/components/widgets/WidgetContainer.tsx` - Widget lifecycle container
- `/components/widgets/ConfigForm.tsx` - Generic configuration form
- `/types/widget-types.ts` - Core type definitions
- `/schemas/widget-schemas.ts` - Zod configuration schemas
- `/registrations/github-widgets.ts` - GitHub widget registrations
- `/registrations/npm-widgets.ts` - npm widget registrations
- `/registrations/cross-source-widgets.ts` - Cross-source widget registrations

**Total Estimated LOC**: 6,500-7,000 lines across all files

This design provides complete specifications for implementation agents to build a production-ready widget framework while maintaining extensibility for future enhancements.
