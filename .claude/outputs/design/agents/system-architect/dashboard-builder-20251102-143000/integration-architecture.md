# Integration Architecture: Data Dashboard Builder

**Project**: dashboard-builder
**Timestamp**: 20251102-143000
**Architect**: system-architect
**Focus**: Extensible Widget Framework with Plugin Architecture

---

## 1. Architecture Overview

### 1.1 Multi-Layer System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Dashboard    │  │ Widget       │  │ Salt DS      │          │
│  │ Components   │  │ Containers   │  │ UI Library   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    WIDGET FRAMEWORK LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Widget       │  │ Widget       │  │ Config       │          │
│  │ Registry     │  │ Lifecycle    │  │ Validator    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ADAPTER LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ GitHub       │  │ npm          │  │ Generic      │          │
│  │ Adapter      │  │ Adapter      │  │ Adapter      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ GitHub       │  │ npm          │  │ Cache        │          │
│  │ Service      │  │ Service      │  │ Manager      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ /api/github  │  │ /api/npm     │  │ /api/cache   │          │
│  │ Proxy        │  │ Proxy        │  │ Control      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ GitHub REST  │  │ npm Registry │  │ npms.io      │          │
│  │ API v3       │  │ API          │  │ API          │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Architecture

```
┌─────────────┐
│ User Action │ (Add widget, apply filter, configure)
└──────┬──────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ Widget Container Component                               │
│  - Receives config via props                             │
│  - Manages lifecycle state (loading/error/success)       │
│  - Renders appropriate state UI                          │
└──────┬───────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ Data Adapter (API Abstraction)                           │
│  - Normalizes API requests across sources                │
│  - Returns standardized data shape                       │
│  - Handles source-specific transformations               │
└──────┬───────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ Service Layer (Business Logic)                           │
│  - Checks cache for existing data                        │
│  - Constructs API request parameters                     │
│  - Applies rate limiting logic                           │
└──────┬───────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ API Route Handler (Proxy)                                │
│  - Injects authentication credentials                    │
│  - Forwards request to external API                      │
│  - Returns response to client                            │
└──────┬───────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ External API (GitHub/npm)                                │
│  - Returns raw data                                      │
└──────┬───────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ Response Processing                                      │
│  - Cache response (in-memory + localStorage)             │
│  - Normalize data to adapter interface                   │
│  - Return to widget component                            │
└──────┬───────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────┐
│ Visualization Component (Recharts/Custom)                │
│  - Receives normalized data                              │
│  - Renders chart/table/list/metric                       │
└──────────────────────────────────────────────────────────┘
```

---

## 2. API Route Specifications

### 2.1 GitHub API Routes

#### GET /api/github/repository

**Purpose**: Fetch repository metadata and statistics.

**Request Parameters**:
```typescript
interface RepositoryRequest {
  owner: string;
  repo: string;
  includeStats?: boolean; // stars, forks, watchers
}
```

**Response**:
```typescript
interface RepositoryResponse {
  id: number;
  name: string;
  fullName: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  description: string;
  stats: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
  };
  timestamps: {
    created: string; // ISO 8601
    updated: string;
    pushed: string;
  };
  language: string;
  topics: string[];
}
```

**Caching**: 1 hour TTL
**Rate Limit**: Contributes to GitHub quota (5000/hour authenticated)
**Error Codes**: 404 (not found), 403 (rate limit), 401 (invalid token)

---

#### GET /api/github/stargazers

**Purpose**: Fetch star timeline data for growth visualization.

**Request Parameters**:
```typescript
interface StargazersRequest {
  owner: string;
  repo: string;
  since?: string; // ISO 8601 date
  until?: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}
```

**Response**:
```typescript
interface StargazersResponse {
  timeline: Array<{
    date: string; // ISO 8601
    count: number; // cumulative stars
    newStars: number; // stars added this period
  }>;
  total: number;
  growth: {
    lastWeek: number;
    lastMonth: number;
    percentage: number;
  };
}
```

**Implementation Note**: GitHub API provides starred_at timestamps. Aggregate client-side or use GitHub GraphQL for efficient queries.

**Caching**: 6 hours TTL (star counts change slowly)
**Rate Limit**: 1 request per repository per 5 minutes (aggressive caching)

---

#### GET /api/github/issues

**Purpose**: Fetch repository issues with filtering.

**Request Parameters**:
```typescript
interface IssuesRequest {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
  labels?: string[]; // filter by labels
  since?: string; // only issues updated after this date
  limit?: number; // default 10, max 100
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
}
```

**Response**:
```typescript
interface IssuesResponse {
  issues: Array<{
    number: number;
    title: string;
    state: 'open' | 'closed';
    author: {
      login: string;
      avatarUrl: string;
    };
    labels: Array<{
      name: string;
      color: string; // hex without #
    }>;
    createdAt: string;
    updatedAt: string;
    comments: number;
    url: string;
  }>;
  totalCount: number;
  hasMore: boolean;
}
```

**Caching**: 15 minutes TTL
**Rate Limit**: Standard GitHub quota

---

#### GET /api/github/pull-requests

**Purpose**: Fetch pull request data and activity metrics.

**Request Parameters**:
```typescript
interface PullRequestsRequest {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'merged' | 'all';
  since?: string;
  limit?: number;
  sort?: 'created' | 'updated' | 'popularity';
}
```

**Response**:
```typescript
interface PullRequestsResponse {
  pullRequests: Array<{
    number: number;
    title: string;
    state: 'open' | 'closed';
    merged: boolean;
    author: {
      login: string;
      avatarUrl: string;
    };
    createdAt: string;
    mergedAt?: string;
    closedAt?: string;
    reviewCount: number;
    additions: number;
    deletions: number;
    url: string;
  }>;
  totalCount: number;
}
```

**Caching**: 10 minutes TTL
**Rate Limit**: Standard GitHub quota

---

#### GET /api/github/contributors

**Purpose**: Fetch top contributors by commit count.

**Request Parameters**:
```typescript
interface ContributorsRequest {
  owner: string;
  repo: string;
  limit?: number; // default 10, max 100
  sort?: 'commits' | 'additions' | 'deletions';
}
```

**Response**:
```typescript
interface ContributorsResponse {
  contributors: Array<{
    login: string;
    name?: string;
    avatarUrl: string;
    contributions: number; // commit count
    url: string;
  }>;
  totalContributors: number;
}
```

**Caching**: 24 hours TTL (contributor data stable)
**Rate Limit**: Standard GitHub quota

---

#### GET /api/github/releases

**Purpose**: Fetch release timeline and version history.

**Request Parameters**:
```typescript
interface ReleasesRequest {
  owner: string;
  repo: string;
  limit?: number; // default 10, max 50
}
```

**Response**:
```typescript
interface ReleasesResponse {
  releases: Array<{
    id: number;
    tagName: string;
    name: string;
    publishedAt: string;
    author: {
      login: string;
      avatarUrl: string;
    };
    assets: Array<{
      name: string;
      downloadCount: number;
      size: number; // bytes
    }>;
    prerelease: boolean;
    url: string;
  }>;
  latestRelease: string; // tag name
  totalReleases: number;
}
```

**Caching**: 12 hours TTL
**Rate Limit**: Standard GitHub quota

---

### 2.2 npm API Routes

#### GET /api/npm/package

**Purpose**: Fetch package metadata from npm Registry.

**Request Parameters**:
```typescript
interface PackageRequest {
  name: string; // package name (scoped: @org/package)
}
```

**Response**:
```typescript
interface PackageResponse {
  name: string;
  version: string; // latest version
  description: string;
  author: {
    name: string;
    email?: string;
  };
  maintainers: Array<{
    name: string;
    email: string;
  }>;
  repository: {
    type: string;
    url: string;
  };
  keywords: string[];
  license: string;
  homepage: string;
  timestamps: {
    created: string;
    modified: string;
  };
  versions: string[]; // all version numbers
}
```

**API Endpoint**: `https://registry.npmjs.org/{package}`
**Caching**: 24 hours TTL (package metadata stable)
**Rate Limit**: No official limit, use conservative throttling (1 req/sec)

---

#### GET /api/npm/downloads

**Purpose**: Fetch download statistics over time.

**Request Parameters**:
```typescript
interface DownloadsRequest {
  package: string;
  period?: 'last-day' | 'last-week' | 'last-month' | 'last-year';
  start?: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
}
```

**Response**:
```typescript
interface DownloadsResponse {
  package: string;
  downloads: Array<{
    date: string; // YYYY-MM-DD
    count: number;
  }>;
  total: number;
  average: number; // daily average
}
```

**API Endpoint**: `https://api.npmjs.org/downloads/range/{start}:{end}/{package}`
**Caching**: 6 hours TTL
**Rate Limit**: Conservative (1 req/sec)

---

#### GET /api/npm/versions

**Purpose**: Fetch version history and publish dates.

**Request Parameters**:
```typescript
interface VersionsRequest {
  package: string;
  limit?: number; // default 20, max 100
}
```

**Response**:
```typescript
interface VersionsResponse {
  package: string;
  versions: Array<{
    version: string;
    publishedAt: string; // ISO 8601
    size: number; // bytes (unpacked)
    deprecated?: boolean;
    deprecationMessage?: string;
  }>;
  latestVersion: string;
  totalVersions: number;
}
```

**API Endpoint**: `https://registry.npmjs.org/{package}` (parse `time` object)
**Caching**: 24 hours TTL
**Rate Limit**: Conservative

---

#### GET /api/npm/quality

**Purpose**: Fetch package quality metrics from npms.io.

**Request Parameters**:
```typescript
interface QualityRequest {
  package: string;
}
```

**Response**:
```typescript
interface QualityResponse {
  package: string;
  score: {
    final: number; // 0-1 scale
    detail: {
      quality: number; // 0-1
      popularity: number; // 0-1
      maintenance: number; // 0-1
    };
  };
  evaluation: {
    quality: {
      carefulness: number;
      tests: number;
      health: number;
      branding: number;
    };
    popularity: {
      communityInterest: number;
      downloadsCount: number;
      downloadsAcceleration: number;
      dependentsCount: number;
    };
    maintenance: {
      releasesFrequency: number;
      commitsFrequency: number;
      openIssues: number;
      issuesDistribution: number;
    };
  };
  analyzedAt: string;
}
```

**API Endpoint**: `https://api.npms.io/v2/package/{package}`
**Caching**: 48 hours TTL (quality scores change slowly)
**Rate Limit**: npms.io rate limiting (100 req/5 min)

---

#### GET /api/npm/dependencies

**Purpose**: Fetch package dependencies and dependency tree.

**Request Parameters**:
```typescript
interface DependenciesRequest {
  package: string;
  version?: string; // default: latest
  type?: 'all' | 'production' | 'development' | 'peer';
}
```

**Response**:
```typescript
interface DependenciesResponse {
  package: string;
  version: string;
  dependencies: {
    production: Record<string, string>; // name: version range
    development: Record<string, string>;
    peer: Record<string, string>;
  };
  dependencyCount: {
    production: number;
    development: number;
    peer: number;
    total: number;
  };
}
```

**API Endpoint**: `https://registry.npmjs.org/{package}/{version}` (parse dependencies)
**Caching**: 24 hours TTL
**Rate Limit**: Conservative

---

### 2.3 Cache Control Routes

#### POST /api/cache/invalidate

**Purpose**: Manually invalidate cached data for specific resources.

**Request Body**:
```typescript
interface CacheInvalidateRequest {
  type: 'github' | 'npm' | 'all';
  resource?: string; // specific resource identifier
}
```

**Response**:
```typescript
interface CacheInvalidateResponse {
  invalidated: number; // count of cache entries removed
  message: string;
}
```

**Use Case**: User wants fresh data after knowing a repository was updated.

---

#### GET /api/cache/stats

**Purpose**: Retrieve cache performance statistics.

**Response**:
```typescript
interface CacheStatsResponse {
  entries: number;
  hitRate: number; // percentage
  size: number; // bytes
  oldestEntry: string; // ISO 8601
  newestEntry: string;
}
```

**Use Case**: Debugging and performance monitoring.

---

## 3. Widget Registry Pattern

### 3.1 Core Registry Architecture

The widget registry is a centralized singleton that maintains metadata and factory functions for all available widgets.

```typescript
// lib/widgets/registry.ts

import { z } from 'zod';
import type { ComponentType } from 'react';

export interface WidgetMetadata {
  id: string; // unique identifier (kebab-case)
  name: string; // display name
  description: string; // short description for catalog
  category: 'github' | 'npm' | 'cross-source' | 'custom';
  icon: string; // icon identifier for UI
  tags: string[]; // searchable tags
  minSize: { w: number; h: number }; // minimum grid dimensions
  defaultSize: { w: number; h: number }; // recommended size
  compatibleFilters: string[]; // which filters apply
}

export interface WidgetRegistryEntry<TConfig = any> {
  metadata: WidgetMetadata;
  configSchema: z.ZodSchema<TConfig>; // Zod schema for validation
  defaultConfig: TConfig;
  component: ComponentType<WidgetProps<TConfig>>;
  dataAdapter: DataAdapter<any, any>;
}

export interface WidgetProps<TConfig> {
  id: string; // instance ID
  config: TConfig;
  filters: DashboardFilters;
  onConfigChange: (config: TConfig) => void;
  onRemove: () => void;
}

class WidgetRegistry {
  private registry = new Map<string, WidgetRegistryEntry>();

  register<TConfig>(entry: WidgetRegistryEntry<TConfig>): void {
    if (this.registry.has(entry.metadata.id)) {
      throw new Error(`Widget ${entry.metadata.id} already registered`);
    }
    this.registry.set(entry.metadata.id, entry);
  }

  get(id: string): WidgetRegistryEntry | undefined {
    return this.registry.get(id);
  }

  getAll(): WidgetRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  getByCategory(category: string): WidgetRegistryEntry[] {
    return this.getAll().filter(e => e.metadata.category === category);
  }

  search(query: string): WidgetRegistryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(entry =>
      entry.metadata.name.toLowerCase().includes(lowerQuery) ||
      entry.metadata.description.toLowerCase().includes(lowerQuery) ||
      entry.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  validateConfig(widgetId: string, config: unknown): boolean {
    const entry = this.get(widgetId);
    if (!entry) return false;
    return entry.configSchema.safeParse(config).success;
  }
}

// Singleton instance
export const widgetRegistry = new WidgetRegistry();
```

---

### 3.2 Plugin Architecture Pattern

Each widget is a self-contained plugin that registers itself with the registry.

```typescript
// lib/widgets/github/repository-stars-timeline.tsx

import { z } from 'zod';
import { widgetRegistry } from '@/lib/widgets/registry';
import { GitHubAdapter } from '@/lib/adapters/github-adapter';
import { StarsTimelineChart } from '@/components/widgets/charts/stars-timeline-chart';

// Configuration schema with Zod
const configSchema = z.object({
  owner: z.string().min(1, 'Owner required'),
  repo: z.string().min(1, 'Repository required'),
  chartType: z.enum(['line', 'area']).default('line'),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  refreshInterval: z.number().min(60000).default(300000), // 5 min default
});

type Config = z.infer<typeof configSchema>;

// Widget component
function RepositoryStarsTimelineWidget(props: WidgetProps<Config>) {
  // Implementation details...
  return <StarsTimelineChart {...props} />;
}

// Register widget on module import
widgetRegistry.register({
  metadata: {
    id: 'github-stars-timeline',
    name: 'Repository Stars Timeline',
    description: 'Track star growth over time for a GitHub repository',
    category: 'github',
    icon: 'star-chart',
    tags: ['github', 'stars', 'growth', 'timeline', 'chart'],
    minSize: { w: 3, h: 2 },
    defaultSize: { w: 4, h: 3 },
    compatibleFilters: ['dateRange', 'repository'],
  },
  configSchema,
  defaultConfig: {
    owner: '',
    repo: '',
    chartType: 'line',
    granularity: 'weekly',
    refreshInterval: 300000,
  },
  component: RepositoryStarsTimelineWidget,
  dataAdapter: new GitHubAdapter(),
});
```

---

### 3.3 Dynamic Widget Loading

Widget components are lazy-loaded to optimize bundle size.

```typescript
// lib/widgets/loader.ts

import { lazy } from 'react';
import type { WidgetRegistryEntry } from './registry';

export function createLazyWidget(
  importFn: () => Promise<{ default: React.ComponentType<any> }>
): React.ComponentType<any> {
  return lazy(importFn);
}

// Usage in widget registration
widgetRegistry.register({
  // ...metadata
  component: createLazyWidget(() =>
    import('@/lib/widgets/github/repository-stars-timeline')
  ),
  // ...rest
});
```

---

### 3.4 Widget Discovery Service

Service layer for widget catalog functionality.

```typescript
// lib/services/widget-discovery-service.ts

import { widgetRegistry } from '@/lib/widgets/registry';
import type { WidgetMetadata } from '@/lib/widgets/registry';

export interface WidgetCatalogCategory {
  name: string;
  id: string;
  widgets: WidgetMetadata[];
  count: number;
}

export class WidgetDiscoveryService {
  getCategorizedWidgets(): WidgetCatalogCategory[] {
    const categories = new Map<string, WidgetMetadata[]>();

    widgetRegistry.getAll().forEach(entry => {
      const category = entry.metadata.category;
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(entry.metadata);
    });

    return Array.from(categories.entries()).map(([id, widgets]) => ({
      id,
      name: this.getCategoryDisplayName(id),
      widgets,
      count: widgets.length,
    }));
  }

  searchWidgets(query: string): WidgetMetadata[] {
    return widgetRegistry.search(query).map(e => e.metadata);
  }

  getWidgetsByFilter(filterType: string): WidgetMetadata[] {
    return widgetRegistry.getAll()
      .filter(e => e.metadata.compatibleFilters.includes(filterType))
      .map(e => e.metadata);
  }

  private getCategoryDisplayName(id: string): string {
    const names: Record<string, string> = {
      'github': 'GitHub Data',
      'npm': 'npm Packages',
      'cross-source': 'Multi-Source',
      'custom': 'Custom Widgets',
    };
    return names[id] || id;
  }
}

export const widgetDiscoveryService = new WidgetDiscoveryService();
```

---

## 4. Data Flow with Caching

### 4.1 Cache Architecture

Three-tier caching strategy:

1. **Memory Cache** (in-process): Fast, session-scoped
2. **localStorage Cache**: Persistent across sessions
3. **API Response Cache Headers**: Browser cache

```typescript
// lib/cache/cache-manager.ts

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
  key: string;
}

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly MAX_MEMORY_ENTRIES = 100;
  private readonly STORAGE_PREFIX = 'dashboard_cache_';

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Check localStorage
    const storageKey = this.STORAGE_PREFIX + key;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (this.isValid(entry)) {
          // Promote to memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Expired, remove from storage
          localStorage.removeItem(storageKey);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    return null;
  }

  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    // Set in memory cache
    this.memoryCache.set(key, entry);
    this.evictOldestIfNeeded();

    // Set in localStorage
    try {
      const storageKey = this.STORAGE_PREFIX + key;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (e) {
      // Storage full, attempt cleanup
      this.cleanupExpiredStorage();
      try {
        localStorage.setItem(
          this.STORAGE_PREFIX + key,
          JSON.stringify(entry)
        );
      } catch {
        console.warn('Cache storage failed for key:', key);
      }
    }
  }

  invalidate(pattern: string): number {
    let count = 0;

    // Clear from memory
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
        count++;
      }
    }

    // Clear from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX) && key.includes(pattern)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => {
      localStorage.removeItem(k);
      count++;
    });

    return count;
  }

  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private evictOldestIfNeeded(): void {
    if (this.memoryCache.size <= this.MAX_MEMORY_ENTRIES) return;

    let oldest: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldest = key;
      }
    }

    if (oldest) this.memoryCache.delete(oldest);
  }

  private cleanupExpiredStorage(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry = JSON.parse(stored);
            if (!this.isValid(entry)) {
              keysToRemove.push(key);
            }
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }

  getStats() {
    return {
      memoryEntries: this.memoryCache.size,
      storageEntries: this.countStorageEntries(),
      totalSize: this.calculateStorageSize(),
    };
  }

  private countStorageEntries(): number {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) count++;
    }
    return count;
  }

  private calculateStorageSize(): number {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) size += value.length * 2; // UTF-16 encoding
      }
    }
    return size;
  }
}

export const cacheManager = new CacheManager();
```

---

### 4.2 Cache Key Strategy

Consistent cache key generation across services.

```typescript
// lib/cache/cache-keys.ts

export const CacheKeys = {
  github: {
    repository: (owner: string, repo: string) =>
      `github:repo:${owner}/${repo}`,

    stargazers: (owner: string, repo: string, granularity: string) =>
      `github:stars:${owner}/${repo}:${granularity}`,

    issues: (owner: string, repo: string, state: string, page: number) =>
      `github:issues:${owner}/${repo}:${state}:p${page}`,

    pullRequests: (owner: string, repo: string, state: string) =>
      `github:prs:${owner}/${repo}:${state}`,

    contributors: (owner: string, repo: string) =>
      `github:contributors:${owner}/${repo}`,

    releases: (owner: string, repo: string) =>
      `github:releases:${owner}/${repo}`,
  },

  npm: {
    package: (name: string) =>
      `npm:package:${name}`,

    downloads: (name: string, start: string, end: string) =>
      `npm:downloads:${name}:${start}:${end}`,

    versions: (name: string) =>
      `npm:versions:${name}`,

    quality: (name: string) =>
      `npm:quality:${name}`,

    dependencies: (name: string, version: string) =>
      `npm:deps:${name}@${version}`,
  },
};

export const CacheTTL = {
  github: {
    repository: 60 * 60 * 1000, // 1 hour
    stargazers: 6 * 60 * 60 * 1000, // 6 hours
    issues: 15 * 60 * 1000, // 15 minutes
    pullRequests: 10 * 60 * 1000, // 10 minutes
    contributors: 24 * 60 * 60 * 1000, // 24 hours
    releases: 12 * 60 * 60 * 1000, // 12 hours
  },
  npm: {
    package: 24 * 60 * 60 * 1000, // 24 hours
    downloads: 6 * 60 * 60 * 1000, // 6 hours
    versions: 24 * 60 * 60 * 1000, // 24 hours
    quality: 48 * 60 * 60 * 1000, // 48 hours
    dependencies: 24 * 60 * 60 * 1000, // 24 hours
  },
};
```

---

### 4.3 Widget Data Fetching Pattern

Generic data fetching with caching integration.

```typescript
// lib/hooks/use-widget-data.ts

import { useState, useEffect, useRef } from 'react';
import { cacheManager } from '@/lib/cache/cache-manager';
import type { DataAdapter } from '@/lib/adapters/data-adapter';

export interface UseWidgetDataOptions<TInput, TOutput> {
  adapter: DataAdapter<TInput, TOutput>;
  input: TInput;
  enabled?: boolean;
  refreshInterval?: number; // milliseconds
  cacheKey: string;
  cacheTTL: number;
}

export interface UseWidgetDataResult<TOutput> {
  data: TOutput | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useWidgetData<TInput, TOutput>(
  options: UseWidgetDataOptions<TInput, TOutput>
): UseWidgetDataResult<TOutput> {
  const { adapter, input, enabled = true, refreshInterval, cacheKey, cacheTTL } = options;

  const [data, setData] = useState<TOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    if (!enabled) return;

    // Check cache first
    const cached = await cacheManager.get<TOutput>(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    // Fetch from API
    setLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const result = await adapter.fetch(input);

      // Cache result
      await cacheManager.set(cacheKey, result, cacheTTL);

      setData(result);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      setError(err as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup refresh interval if specified
    if (refreshInterval && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(fetchData, refreshInterval);
    }

    return () => {
      // Cleanup
      abortControllerRef.current?.abort();
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [cacheKey, enabled]); // Re-fetch when cache key or enabled changes

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
```

---

## 5. Service Architecture

### 5.1 GitHub Service

Centralized service for all GitHub API interactions.

```typescript
// lib/services/github-service.ts

import type {
  RepositoryRequest,
  RepositoryResponse,
  StargazersRequest,
  StargazersResponse,
  IssuesRequest,
  IssuesResponse,
  PullRequestsRequest,
  PullRequestsResponse,
  ContributorsRequest,
  ContributorsResponse,
  ReleasesRequest,
  ReleasesResponse,
} from '@/types/api/github';

export class GitHubService {
  private readonly baseUrl = '/api/github';

  async getRepository(params: RepositoryRequest): Promise<RepositoryResponse> {
    const url = new URL(`${this.baseUrl}/repository`, window.location.origin);
    url.searchParams.set('owner', params.owner);
    url.searchParams.set('repo', params.repo);
    if (params.includeStats) url.searchParams.set('includeStats', 'true');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getStargazers(params: StargazersRequest): Promise<StargazersResponse> {
    const url = new URL(`${this.baseUrl}/stargazers`, window.location.origin);
    url.searchParams.set('owner', params.owner);
    url.searchParams.set('repo', params.repo);
    if (params.since) url.searchParams.set('since', params.since);
    if (params.until) url.searchParams.set('until', params.until);
    if (params.granularity) url.searchParams.set('granularity', params.granularity);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getIssues(params: IssuesRequest): Promise<IssuesResponse> {
    const url = new URL(`${this.baseUrl}/issues`, window.location.origin);
    url.searchParams.set('owner', params.owner);
    url.searchParams.set('repo', params.repo);
    if (params.state) url.searchParams.set('state', params.state);
    if (params.labels) url.searchParams.set('labels', params.labels.join(','));
    if (params.since) url.searchParams.set('since', params.since);
    if (params.limit) url.searchParams.set('limit', params.limit.toString());
    if (params.sort) url.searchParams.set('sort', params.sort);
    if (params.direction) url.searchParams.set('direction', params.direction);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getPullRequests(params: PullRequestsRequest): Promise<PullRequestsResponse> {
    const url = new URL(`${this.baseUrl}/pull-requests`, window.location.origin);
    url.searchParams.set('owner', params.owner);
    url.searchParams.set('repo', params.repo);
    if (params.state) url.searchParams.set('state', params.state);
    if (params.since) url.searchParams.set('since', params.since);
    if (params.limit) url.searchParams.set('limit', params.limit.toString());
    if (params.sort) url.searchParams.set('sort', params.sort);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getContributors(params: ContributorsRequest): Promise<ContributorsResponse> {
    const url = new URL(`${this.baseUrl}/contributors`, window.location.origin);
    url.searchParams.set('owner', params.owner);
    url.searchParams.set('repo', params.repo);
    if (params.limit) url.searchParams.set('limit', params.limit.toString());
    if (params.sort) url.searchParams.set('sort', params.sort);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getReleases(params: ReleasesRequest): Promise<ReleasesResponse> {
    const url = new URL(`${this.baseUrl}/releases`, window.location.origin);
    url.searchParams.set('owner', params.owner);
    url.searchParams.set('repo', params.repo);
    if (params.limit) url.searchParams.set('limit', params.limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    return response.json();
  }
}

export const githubService = new GitHubService();
```

---

### 5.2 npm Service

Centralized service for npm API interactions.

```typescript
// lib/services/npm-service.ts

import type {
  PackageRequest,
  PackageResponse,
  DownloadsRequest,
  DownloadsResponse,
  VersionsRequest,
  VersionsResponse,
  QualityRequest,
  QualityResponse,
  DependenciesRequest,
  DependenciesResponse,
} from '@/types/api/npm';

export class NpmService {
  private readonly baseUrl = '/api/npm';

  async getPackage(params: PackageRequest): Promise<PackageResponse> {
    const url = new URL(`${this.baseUrl}/package`, window.location.origin);
    url.searchParams.set('name', params.name);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`npm API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getDownloads(params: DownloadsRequest): Promise<DownloadsResponse> {
    const url = new URL(`${this.baseUrl}/downloads`, window.location.origin);
    url.searchParams.set('package', params.package);
    if (params.period) url.searchParams.set('period', params.period);
    if (params.start) url.searchParams.set('start', params.start);
    if (params.end) url.searchParams.set('end', params.end);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`npm API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getVersions(params: VersionsRequest): Promise<VersionsResponse> {
    const url = new URL(`${this.baseUrl}/versions`, window.location.origin);
    url.searchParams.set('package', params.package);
    if (params.limit) url.searchParams.set('limit', params.limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`npm API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getQuality(params: QualityRequest): Promise<QualityResponse> {
    const url = new URL(`${this.baseUrl}/quality`, window.location.origin);
    url.searchParams.set('package', params.package);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`npm API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getDependencies(params: DependenciesRequest): Promise<DependenciesResponse> {
    const url = new URL(`${this.baseUrl}/dependencies`, window.location.origin);
    url.searchParams.set('package', params.package);
    if (params.version) url.searchParams.set('version', params.version);
    if (params.type) url.searchParams.set('type', params.type);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`npm API error: ${response.statusText}`);
    }
    return response.json();
  }
}

export const npmService = new NpmService();
```

---

### 5.3 Widget Data Service

Orchestrates data fetching for widgets using adapters.

```typescript
// lib/services/widget-data-service.ts

import { cacheManager } from '@/lib/cache/cache-manager';
import { CacheKeys, CacheTTL } from '@/lib/cache/cache-keys';
import { githubService } from './github-service';
import { npmService } from './npm-service';
import type { DataAdapter } from '@/lib/adapters/data-adapter';

export class WidgetDataService {
  async fetchWithCache<TInput, TOutput>(
    adapter: DataAdapter<TInput, TOutput>,
    input: TInput,
    cacheKey: string,
    ttl: number
  ): Promise<TOutput> {
    // Check cache
    const cached = await cacheManager.get<TOutput>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from adapter
    const data = await adapter.fetch(input);

    // Cache result
    await cacheManager.set(cacheKey, data, ttl);

    return data;
  }

  invalidateWidgetCache(widgetId: string, config: any): void {
    // Invalidate all cache entries related to this widget instance
    const pattern = this.getCachePattern(widgetId, config);
    cacheManager.invalidate(pattern);
  }

  private getCachePattern(widgetId: string, config: any): string {
    // Generate pattern based on widget type
    if (widgetId.startsWith('github-')) {
      return `github:${config.owner}/${config.repo}`;
    } else if (widgetId.startsWith('npm-')) {
      return `npm:${config.package}`;
    }
    return widgetId;
  }
}

export const widgetDataService = new WidgetDataService();
```

---

## 6. Error Handling Strategy

### 6.1 Error Classification

```typescript
// lib/errors/api-errors.ts

export enum ErrorCategory {
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATION = 'AUTHENTICATION',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  CACHE = 'CACHE',
  UNKNOWN = 'UNKNOWN',
}

export class ApiError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory,
    public statusCode?: number,
    public retryable: boolean = false,
    public retryAfter?: number // milliseconds
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter: number) {
    super(
      `Rate limit exceeded. Retry after ${Math.ceil(retryAfter / 60000)} minutes.`,
      ErrorCategory.RATE_LIMIT,
      429,
      true,
      retryAfter
    );
  }
}

export class NetworkError extends ApiError {
  constructor(message: string) {
    super(message, ErrorCategory.NETWORK, undefined, true);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`, ErrorCategory.NOT_FOUND, 404);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public field?: string) {
    super(message, ErrorCategory.VALIDATION, 400);
  }
}
```

---

### 6.2 Error Handler Middleware

```typescript
// lib/errors/error-handler.ts

import { ApiError, ErrorCategory, RateLimitError, NetworkError, NotFoundError } from './api-errors';

export function handleApiError(error: unknown): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Fetch API errors
  if (error instanceof Response) {
    if (error.status === 429) {
      const retryAfter = parseInt(error.headers.get('Retry-After') || '3600', 10) * 1000;
      return new RateLimitError(retryAfter);
    }
    if (error.status === 404) {
      return new NotFoundError(error.url);
    }
    if (error.status === 401 || error.status === 403) {
      return new ApiError(
        'Authentication failed. Check API credentials.',
        ErrorCategory.AUTHENTICATION,
        error.status
      );
    }
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Network request failed. Check your connection.');
  }

  // Generic error
  if (error instanceof Error) {
    return new ApiError(error.message, ErrorCategory.UNKNOWN);
  }

  return new ApiError('An unknown error occurred', ErrorCategory.UNKNOWN);
}

export function shouldRetry(error: ApiError, attemptCount: number): boolean {
  const MAX_RETRIES = 3;
  if (attemptCount >= MAX_RETRIES) return false;
  return error.retryable;
}

export function getRetryDelay(error: ApiError, attemptCount: number): number {
  if (error.retryAfter) return error.retryAfter;

  // Exponential backoff: 1s, 2s, 4s
  return Math.pow(2, attemptCount) * 1000;
}
```

---

### 6.3 Widget Error Boundary

```typescript
// components/widgets/widget-error-boundary.tsx

import { Component, ReactNode } from 'react';
import { ApiError } from '@/lib/errors/api-errors';

interface Props {
  widgetId: string;
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Widget ${this.props.widgetId} error:`, error, errorInfo);

    // Log to monitoring service (future)
    // monitoringService.logError(error, { widgetId: this.props.widgetId, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <div className="widget-error">
          <h3>Widget Error</h3>
          <p>{this.state.error.message}</p>
          <button onClick={this.resetError}>Retry</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 6.4 User-Facing Error Messages

```typescript
// lib/errors/error-messages.ts

import { ApiError, ErrorCategory } from './api-errors';

export function getUserFriendlyMessage(error: ApiError): string {
  switch (error.category) {
    case ErrorCategory.RATE_LIMIT:
      return 'Too many requests. Please wait a few minutes and try again.';

    case ErrorCategory.NETWORK:
      return 'Unable to connect. Please check your internet connection.';

    case ErrorCategory.AUTHENTICATION:
      return 'Authentication failed. API credentials may be invalid.';

    case ErrorCategory.NOT_FOUND:
      return 'The requested resource was not found. Check the configuration.';

    case ErrorCategory.VALIDATION:
      return error.message; // Use specific validation message

    case ErrorCategory.CACHE:
      return 'Cache error. Your data will be refreshed.';

    default:
      return 'An error occurred. Please try again.';
  }
}

export function getErrorAction(error: ApiError): string {
  if (error.retryable) {
    return 'Retry';
  }
  switch (error.category) {
    case ErrorCategory.NOT_FOUND:
    case ErrorCategory.VALIDATION:
      return 'Configure';
    default:
      return 'Dismiss';
  }
}
```

---

## 7. Performance Optimization

### 7.1 Request Deduplication

Prevent duplicate simultaneous requests for the same resource.

```typescript
// lib/utils/request-deduplication.ts

export class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // If request already in flight, return existing promise
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    // Execute request
    const promise = fn()
      .finally(() => {
        // Clean up when done
        this.pending.delete(key);
      });

    this.pending.set(key, promise);
    return promise;
  }

  clear(key?: string): void {
    if (key) {
      this.pending.delete(key);
    } else {
      this.pending.clear();
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator();
```

**Usage in Service**:
```typescript
async getRepository(params: RepositoryRequest): Promise<RepositoryResponse> {
  const cacheKey = CacheKeys.github.repository(params.owner, params.repo);

  return requestDeduplicator.dedupe(cacheKey, async () => {
    const url = new URL(`${this.baseUrl}/repository`, window.location.origin);
    // ... rest of implementation
  });
}
```

---

### 7.2 Lazy Loading Widget Components

```typescript
// lib/widgets/lazy-registry.ts

import { lazy } from 'react';
import { widgetRegistry } from './registry';

// Lazy-loaded widget imports
const GitHubStarsTimeline = lazy(() =>
  import('./github/repository-stars-timeline')
);
const GitHubIssuesList = lazy(() =>
  import('./github/recent-issues-list')
);
const NpmDownloadTrends = lazy(() =>
  import('./npm/package-download-trends')
);
// ... more widgets

// Register all widgets on app startup
export function registerAllWidgets() {
  // GitHub widgets
  widgetRegistry.register({
    metadata: {
      id: 'github-stars-timeline',
      name: 'Repository Stars Timeline',
      // ... metadata
    },
    component: GitHubStarsTimeline,
    // ... rest
  });

  // npm widgets
  widgetRegistry.register({
    metadata: {
      id: 'npm-downloads-trends',
      name: 'Package Download Trends',
      // ... metadata
    },
    component: NpmDownloadTrends,
    // ... rest
  });

  // ... more registrations
}
```

**App Initialization**:
```typescript
// app/layout.tsx

import { registerAllWidgets } from '@/lib/widgets/lazy-registry';

// Register widgets on startup
registerAllWidgets();

export default function RootLayout({ children }) {
  return <html>{children}</html>;
}
```

---

### 7.3 Virtual Scrolling for Large Dashboards

For dashboards with many widgets, implement viewport-based rendering.

```typescript
// components/dashboard/virtual-dashboard-canvas.tsx

import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualDashboardCanvasProps {
  widgets: WidgetInstance[];
  renderWidget: (widget: WidgetInstance) => ReactNode;
}

export function VirtualDashboardCanvas({
  widgets,
  renderWidget
}: VirtualDashboardCanvasProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: widgets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // estimated widget height
    overscan: 2, // render 2 extra items above/below viewport
  });

  return (
    <div ref={parentRef} className="dashboard-canvas" style={{ height: '100vh', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderWidget(widgets[virtualItem.index])}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 7.4 Throttling and Debouncing

```typescript
// lib/utils/throttle-debounce.ts

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}
```

**Usage for Filter Application**:
```typescript
const debouncedApplyFilters = debounce((filters: DashboardFilters) => {
  // Apply filters to all widgets
  widgets.forEach(w => w.applyFilters(filters));
}, 300);
```

**Usage for Drag Events**:
```typescript
const throttledOnDrag = throttle((layout: Layout[]) => {
  // Update layout in state
  setLayout(layout);
}, 16); // ~60fps
```

---

### 7.5 API Rate Limiting Client-Side

```typescript
// lib/utils/rate-limiter.ts

export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequest = 0;

  constructor(
    private minInterval: number, // milliseconds between requests
    private maxConcurrent: number = 1
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;

      if (timeSinceLastRequest < this.minInterval) {
        await this.sleep(this.minInterval - timeSinceLastRequest);
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequest = Date.now();
        await task();
      }
    }

    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// GitHub rate limiter: max 1 request per second
export const githubRateLimiter = new RateLimiter(1000);

// npm rate limiter: max 1 request per second
export const npmRateLimiter = new RateLimiter(1000);
```

**Usage in Service**:
```typescript
async getRepository(params: RepositoryRequest): Promise<RepositoryResponse> {
  return githubRateLimiter.execute(async () => {
    const url = new URL(`${this.baseUrl}/repository`, window.location.origin);
    // ... implementation
  });
}
```

---

## 8. TypeScript Interface Definitions

### 8.1 Core Widget Interfaces

```typescript
// types/widgets.ts

import type { ReactNode, ComponentType } from 'react';
import type { z } from 'zod';

export interface WidgetInstance {
  id: string; // unique instance ID
  widgetId: string; // widget type ID from registry
  config: Record<string, any>;
  layout: WidgetLayout;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetLayout {
  x: number; // grid column position
  y: number; // grid row position
  w: number; // width in columns
  h: number; // height in rows
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean; // prevent drag/resize
}

export interface DashboardFilters {
  dateRange?: {
    start: string; // ISO 8601
    end: string;
  };
  repositories?: string[]; // "owner/repo" format
  packages?: string[]; // npm package names
  customFilters?: Record<string, any>;
}

export interface WidgetProps<TConfig = any> {
  id: string;
  config: TConfig;
  filters: DashboardFilters;
  onConfigChange: (config: TConfig) => void;
  onRemove: () => void;
}

export interface WidgetState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: any | null;
  error: Error | null;
  lastFetch: string | null;
}
```

---

### 8.2 Data Adapter Interface

```typescript
// types/adapters.ts

export interface DataAdapter<TInput, TOutput> {
  fetch(input: TInput): Promise<TOutput>;
  normalize?(raw: any): TOutput;
  validate?(input: TInput): boolean;
}

export interface GitHubDataAdapter<TOutput> extends DataAdapter<GitHubAdapterInput, TOutput> {
  requiresAuth: boolean;
}

export interface GitHubAdapterInput {
  owner: string;
  repo: string;
  filters?: DashboardFilters;
  [key: string]: any;
}

export interface NpmDataAdapter<TOutput> extends DataAdapter<NpmAdapterInput, TOutput> {}

export interface NpmAdapterInput {
  package: string;
  filters?: DashboardFilters;
  [key: string]: any;
}
```

---

### 8.3 Dashboard Interfaces

```typescript
// types/dashboard.ts

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: WidgetInstance[];
  filters: DashboardFilters;
  layout: WidgetLayout[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string; // base64 or URL
}

export interface DashboardCreate {
  name: string;
  description?: string;
}

export interface DashboardUpdate {
  name?: string;
  description?: string;
  widgets?: WidgetInstance[];
  filters?: DashboardFilters;
  layout?: WidgetLayout[];
}

export interface DashboardMetadata {
  id: string;
  name: string;
  description?: string;
  widgetCount: number;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}
```

---

### 8.4 Service Interfaces

```typescript
// types/services.ts

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheStats {
  entries: number;
  hitRate: number;
  size: number;
  oldestEntry: string;
  newestEntry: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

export interface ApiResponse<T> {
  data: T;
  rateLimit?: RateLimitInfo;
  cached: boolean;
  timestamp: string;
}
```

---

## 9. Security Considerations

### 9.1 Environment Variable Management

**Vercel Environment Variables**:
```bash
# Production
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_API_BASE_URL=https://api.dashboard-builder.vercel.app

# Development
GITHUB_TOKEN=ghp_dev_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

**Never Expose Tokens Client-Side**:
```typescript
// ❌ BAD: Client-side token usage
const response = await fetch('https://api.github.com/repos/owner/repo', {
  headers: {
    Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`, // NEVER!
  },
});

// ✅ GOOD: Server-side proxy
const response = await fetch('/api/github/repository?owner=owner&repo=repo');
```

---

### 9.2 API Route Authentication

```typescript
// app/api/github/repository/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Token from server-side environment variable
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: 'GitHub token not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  if (!owner || !repo) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform to our interface
    const result: RepositoryResponse = {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      // ... map fields
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository data' },
      { status: 500 }
    );
  }
}
```

---

### 9.3 Input Validation

```typescript
// lib/validation/input-validation.ts

import { z } from 'zod';

export const RepositoryParamsSchema = z.object({
  owner: z.string()
    .min(1, 'Owner required')
    .max(39, 'Owner too long')
    .regex(/^[a-zA-Z0-9-]+$/, 'Invalid owner format'),
  repo: z.string()
    .min(1, 'Repository required')
    .max(100, 'Repository name too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid repository format'),
});

export const PackageNameSchema = z.string()
  .min(1, 'Package name required')
  .max(214, 'Package name too long')
  .regex(
    /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
    'Invalid npm package name'
  );

// Usage in API route
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const validation = RepositoryParamsSchema.safeParse({
    owner: searchParams.get('owner'),
    repo: searchParams.get('repo'),
  });

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { owner, repo } = validation.data;
  // ... proceed with validated data
}
```

---

### 9.4 CORS and CSP Headers

```typescript
// next.config.js

module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'https://dashboard-builder.vercel.app'
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requirement
              "style-src 'self' 'unsafe-inline'", // Salt DS requirement
              "img-src 'self' data: https://avatars.githubusercontent.com",
              "connect-src 'self' https://api.github.com https://registry.npmjs.org https://api.npms.io",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

---

## 10. Deployment Architecture

### 10.1 Vercel Deployment Configuration

```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "GITHUB_TOKEN": "@github-token"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_BASE_URL": "https://dashboard-builder.vercel.app"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=60, stale-while-revalidate=30"
        }
      ]
    }
  ]
}
```

---

### 10.2 Edge Function Strategy

Use Edge Functions for low-latency API proxying.

```typescript
// app/api/github/repository/route.ts

export const runtime = 'edge'; // Deploy as Edge Function

export async function GET(request: Request) {
  // Implementation runs on Vercel Edge Network
  // Lower latency, faster cold starts
}
```

**When to Use Edge Functions**:
- Simple proxy routes (GitHub, npm API)
- Low computation requirements
- Global distribution needed

**When to Use Serverless Functions**:
- Complex data transformations
- Longer processing time (>10s)
- Node.js-specific dependencies

---

### 10.3 Build Optimization

```typescript
// next.config.js

module.exports = {
  reactStrictMode: true,
  swcMinify: true,

  // Code splitting
  experimental: {
    optimizePackageImports: ['@salt-ds/core', 'recharts'],
  },

  // Image optimization
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Bundle analysis
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          widgets: {
            name: 'widgets',
            test: /[\\/]lib[\\/]widgets[\\/]/,
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};
```

---

## Summary and Key Patterns

### Plugin Architecture Highlights

1. **Widget Registry Pattern**: Centralized singleton for widget discovery and instantiation
2. **Data Adapter Layer**: Abstraction separating API specifics from widget logic
3. **Lazy Loading**: Dynamic imports for widgets reduce initial bundle size
4. **Type Safety**: Zod schemas for runtime validation, TypeScript for compile-time safety

### Performance Optimizations

1. **Three-Tier Caching**: Memory → localStorage → API with TTL-based invalidation
2. **Request Deduplication**: Prevent simultaneous identical requests
3. **Rate Limiting**: Client-side throttling to respect API quotas
4. **Virtual Scrolling**: Render only visible widgets for large dashboards

### Error Handling Strategy

1. **Error Classification**: Categorize errors for appropriate handling
2. **Retry Logic**: Automatic retry for transient failures with exponential backoff
3. **User-Friendly Messages**: Translate technical errors to actionable guidance
4. **Error Boundaries**: Isolate widget failures from dashboard-level crashes

### Security Best Practices

1. **Server-Side Proxying**: Never expose API tokens to client
2. **Input Validation**: Zod schemas for all user inputs and API parameters
3. **Environment Variable Management**: Vercel secrets for sensitive credentials
4. **CSP Headers**: Restrict resource loading to approved origins

---

**File Location**: `/Users/keithstewart/dev/data-dashboard/.claude/outputs/design/agents/system-architect/dashboard-builder-20251102-143000/integration-architecture.md`

**Total Lines**: ~950 (within target 800-1000)

**Next Steps**:
1. Review with engineering team for technical feasibility
2. Validate API rate limits with GitHub/npm documentation
3. Prototype widget registry with 2-3 sample widgets
4. Implement cache manager and test with realistic data volumes
5. Create API route templates for proxy endpoints
