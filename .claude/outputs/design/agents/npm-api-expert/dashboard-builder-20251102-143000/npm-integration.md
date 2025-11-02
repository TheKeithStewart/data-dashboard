# npm API Integration Design
## Dashboard Builder Project

**Project:** dashboard-builder
**Timestamp:** 20251102-143000
**Agent:** npm-api-expert
**Version:** 1.0.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [API Strategy](#api-strategy)
3. [Widget Endpoint Mapping](#widget-endpoint-mapping)
4. [TypeScript Data Models](#typescript-data-models)
5. [Service Implementation](#service-implementation)
6. [Caching Strategy](#caching-strategy)
7. [Rate Limiting & Throttling](#rate-limiting--throttling)
8. [Error Handling](#error-handling)
9. [Multi-Package Queries](#multi-package-queries)
10. [Production Code Examples](#production-code-examples)

---

## Executive Summary

This document provides a comprehensive npm API integration strategy for the Dashboard Builder project's four npm-focused widgets: Package Download Trends, Package Version History, Package Quality Score, and Dependencies Overview. The integration leverages three complementary npm data sources:

1. **npm Registry API** (`registry.npmjs.org`) - Package metadata, versions, dependencies
2. **npm Download Counts API** (`api.npmjs.org`) - Historical download statistics
3. **npms.io API** (`api.npms.io`) - Package quality metrics and scores

The strategy prioritizes aggressive client-side caching (24-hour TTL for historical data, 4-hour TTL for metadata), respectful rate limiting (100 req/min for Registry, 60 req/min for Downloads, 250 req/hour for npms.io), and robust error handling for unpublished packages and service failures. All code examples use TypeScript with strict type safety, Zod validation, and production-ready patterns including exponential backoff, circuit breakers, and comprehensive logging.

**Key Design Decisions:**
- Use npm Registry API for version history and dependencies (no auth required, unlimited for reasonable use)
- Use npm Downloads API for time-series download data (point and range endpoints)
- Use npms.io for quality scores with fallback to Registry API if unavailable
- Implement Next.js API routes as proxy layer to handle CORS and add server-side caching
- Cache responses in both browser (React Query) and server (Next.js Cache API)
- Support scoped packages with proper URL encoding (`@types/react` → `@types%2Freact`)

---

## API Strategy

### Overview

The npm ecosystem provides three distinct APIs that complement each other:

| API Source | Purpose | Rate Limit | Authentication | Cache Duration |
|------------|---------|------------|----------------|----------------|
| **npm Registry API** | Package metadata, versions, dependencies | None (be respectful: 100 req/min) | Not required | 4 hours |
| **npm Downloads API** | Historical download counts | None (be respectful: 60 req/min) | Not required | 24 hours (historical), 1 hour (current) |
| **npms.io API** | Quality scores, popularity, maintenance | 250 req/hour (unauth), 1000 req/hour (with key) | Optional API key | 24 hours |

### API Selection Rationale

**Why npm Registry API:**
- Official source for all published package data
- Comprehensive version history with exact publish timestamps
- Complete dependency trees (production, dev, peer dependencies)
- No rate limits for reasonable use (public, free service)
- Highly reliable and stable
- **Trade-off:** Large payloads for packages with many versions (e.g., lodash has 100+ versions)

**Why npm Downloads API:**
- Only official source for download statistics
- Supports both point queries (totals) and range queries (daily breakdown)
- No authentication required
- Stable data (historical downloads never change)
- **Trade-off:** Maximum 18 months of historical data, data updated daily after UTC midnight

**Why npms.io API:**
- Only source for computed quality metrics
- Aggregates multiple signals: code quality, popularity, maintenance
- Provides ecosystem rankings and comparisons
- Supports multi-package queries (`/v2/package/mget` endpoint)
- **Trade-off:** Third-party service with rate limits, occasional downtime

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Dashboard Widget Layer                   │
│  (PackageDownloadTrends, PackageVersionHistory, etc.)       │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   React Query Cache Layer                    │
│     (Browser-side caching with staleTime/cacheTime)         │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js API Routes (Proxy)                  │
│    /api/npm/package/[name]                                   │
│    /api/npm/downloads/[type]/[period]/[name]                 │
│    /api/npm/quality/[name]                                   │
└───────────────────────────────┬─────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
        ┌──────────────┐  ┌─────────┐  ┌─────────┐
        │ Registry API │  │Download │  │npms.io  │
        │registry.npmjs│  │   API   │  │   API   │
        │     .org     │  │api.npm  │  │api.npms │
        └──────────────┘  └─────────┘  └─────────┘
```

**Why Proxy Layer:**
1. **CORS Handling:** Browser requests to npm APIs may encounter CORS issues
2. **Server-Side Caching:** Next.js Cache API provides distributed caching on Vercel
3. **Rate Limit Management:** Centralized throttling and circuit breaking
4. **Error Normalization:** Consistent error responses across all APIs
5. **Request Batching:** Combine multiple client requests
6. **Monitoring:** Centralized logging and metrics collection

---

## Widget Endpoint Mapping

### Widget 1: Package Download Trends

**Purpose:** Display npm package downloads over time with time-series visualization

**API Endpoints:**
- **Primary:** `GET https://api.npmjs.org/downloads/range/{period}/{package}`
- **Secondary:** `GET https://api.npmjs.org/downloads/point/last-month/{package}` (fallback)

**Parameters:**
- `period`: `last-week`, `last-month`, `last-year`, or date range `YYYY-MM-DD:YYYY-MM-DD`
- `package`: Package name (URL-encoded for scoped packages)

**Response Format:**
```typescript
{
  downloads: [
    { day: "2024-10-01", downloads: 125000 },
    { day: "2024-10-02", downloads: 132000 }
  ],
  start: "2024-10-01",
  end: "2024-10-31",
  package: "react"
}
```

**Widget Configuration:**
```typescript
{
  packageName: string;           // e.g., "react" or "@types/react"
  period: "week" | "month" | "year" | "custom";
  customDateRange?: {
    start: string;               // YYYY-MM-DD
    end: string;                 // YYYY-MM-DD (max 18 months)
  };
  aggregation: "daily" | "weekly" | "monthly";
}
```

**Cache Strategy:**
- Historical data (not current day): **24 hours** (immutable)
- Current day data: **1 hour** (updates throughout day)

**Implementation Notes:**
- Use `range` endpoint for time-series visualization
- Aggregate daily data to weekly/monthly if requested
- Handle timezone issues (npm data is UTC-based)
- Scoped packages require URL encoding

---

### Widget 2: Package Version History

**Purpose:** Display published versions with dates, sizes, and release notes

**API Endpoints:**
- **Primary:** `GET https://registry.npmjs.org/{package}`
- **Extract:** `versions` object and `time` object from response

**Parameters:**
- `package`: Package name (URL-encoded for scoped packages)

**Response Format (Relevant Fields):**
```typescript
{
  name: "react",
  versions: {
    "18.0.0": {
      version: "18.0.0",
      dist: {
        shasum: "abc123...",
        tarball: "https://registry.npmjs.org/react/-/react-18.0.0.tgz",
        fileCount: 20,
        unpackedSize: 123456
      }
    }
  },
  time: {
    "18.0.0": "2022-03-29T14:20:31.223Z",
    "18.1.0": "2022-04-26T19:10:45.123Z"
  }
}
```

**Widget Configuration:**
```typescript
{
  packageName: string;
  maxVersions: number;           // e.g., 10 (show last 10 versions)
  versionFilter: "all" | "major" | "minor" | "patch";
  sortOrder: "newest" | "oldest";
}
```

**Cache Strategy:**
- **4 hours** (versions don't change, but new versions published periodically)

**Implementation Notes:**
- Response size can be large (100+ versions for popular packages)
- Filter versions client-side or server-side based on `versionFilter`
- Calculate time between releases for "release frequency" metric
- Parse semver to categorize major/minor/patch releases

---

### Widget 3: Package Quality Score

**Purpose:** Display npms.io quality metrics (quality, popularity, maintenance)

**API Endpoints:**
- **Primary:** `GET https://api.npms.io/v2/package/{package}`
- **Fallback:** `GET https://registry.npmjs.org/{package}` (extract basic metrics)

**Parameters:**
- `package`: Package name (no URL encoding needed for npms.io)

**Response Format:**
```typescript
{
  collected: {
    metadata: { name, version, description, keywords, license },
    npm: { downloads: [...], starsCount },
    github: { starsCount, forksCount, issues: { openCount } }
  },
  evaluation: {
    quality: {
      carefulness: 0.85,
      tests: 0.90,
      health: 0.95,
      branding: 0.80
    },
    popularity: {
      communityInterest: 0.92,
      downloadsCount: 0.88,
      downloadsAcceleration: 0.75
    },
    maintenance: {
      releasesFrequency: 0.85,
      commitsFrequency: 0.90,
      openIssues: 0.80,
      issuesDistribution: 0.85
    }
  },
  score: {
    final: 0.89,
    detail: {
      quality: 0.87,
      popularity: 0.85,
      maintenance: 0.86
    }
  }
}
```

**Widget Configuration:**
```typescript
{
  packageName: string;
  displayMode: "scores" | "details" | "both";
  scoresToShow: Array<"quality" | "popularity" | "maintenance" | "final">;
}
```

**Cache Strategy:**
- **24 hours** (npms.io updates periodically, not real-time)

**Implementation Notes:**
- npms.io rate limited to 250 req/hour (unauthenticated)
- Implement fallback to Registry API if npms.io unavailable
- Fallback metrics: lastPublish date, dependencies count, readme length
- Handle 404 for packages not yet analyzed by npms.io

---

### Widget 4: Dependencies Overview

**Purpose:** List package dependencies with types (prod/dev/peer) and versions

**API Endpoints:**
- **Primary:** `GET https://registry.npmjs.org/{package}`
- **Extract:** Latest version's `dependencies`, `devDependencies`, `peerDependencies`

**Parameters:**
- `package`: Package name (URL-encoded for scoped packages)
- `version`: Optional version (default: `latest`)

**Response Format (Relevant Fields):**
```typescript
{
  versions: {
    "18.0.0": {
      dependencies: {
        "loose-envify": "^1.1.0"
      },
      devDependencies: {
        "jest": "^29.0.0"
      },
      peerDependencies: {
        "react-dom": "^18.0.0"
      }
    }
  },
  "dist-tags": {
    "latest": "18.0.0"
  }
}
```

**Widget Configuration:**
```typescript
{
  packageName: string;
  version: string | "latest";
  dependencyTypes: Array<"dependencies" | "devDependencies" | "peerDependencies">;
  sortBy: "name" | "type";
  showVersionInfo: boolean;      // Fetch details for each dependency
}
```

**Cache Strategy:**
- **4 hours** (dependencies rarely change for published versions)

**Implementation Notes:**
- Use `dist-tags.latest` to resolve "latest" version
- If `showVersionInfo: true`, fetch metadata for each dependency (expensive)
- Group dependencies by type for visualization
- Handle missing dependency types (not all packages have all types)

---

## TypeScript Data Models

### Core Types

```typescript
/**
 * Standardized package identifier
 * Handles scoped packages (@org/package) and regular packages
 */
export type PackageName = string;

/**
 * Semver version string
 */
export type PackageVersion = string;

/**
 * ISO 8601 timestamp
 */
export type ISOTimestamp = string;

/**
 * Time period for download queries
 */
export type DownloadPeriod =
  | "last-day"
  | "last-week"
  | "last-month"
  | "last-year"
  | { start: string; end: string }; // YYYY-MM-DD format

/**
 * Dependency type classification
 */
export type DependencyType =
  | "dependencies"
  | "devDependencies"
  | "peerDependencies"
  | "optionalDependencies";
```

### npm Downloads API Models

```typescript
/**
 * Download count for a single day
 */
export interface DailyDownloads {
  day: string;              // YYYY-MM-DD
  downloads: number;
}

/**
 * Response from /downloads/range endpoint
 */
export interface DownloadRangeResponse {
  downloads: DailyDownloads[];
  start: string;            // YYYY-MM-DD
  end: string;              // YYYY-MM-DD
  package: PackageName;
}

/**
 * Response from /downloads/point endpoint
 */
export interface DownloadPointResponse {
  downloads: number;
  start: string;
  end: string;
  package: PackageName;
}

/**
 * Aggregated download statistics for widget display
 */
export interface DownloadStatistics {
  total: number;
  average: number;
  peak: DailyDownloads;
  trend: "increasing" | "decreasing" | "stable";
  trendPercentage: number;  // Percentage change over period
}
```

### npm Registry API Models

```typescript
/**
 * Package distribution metadata
 */
export interface DistInfo {
  shasum: string;
  tarball: string;
  fileCount: number;
  unpackedSize: number;
  integrity?: string;
}

/**
 * Repository information
 */
export interface Repository {
  type: string;             // "git"
  url: string;
  directory?: string;       // For monorepos
}

/**
 * Person (author, maintainer, contributor)
 */
export interface Person {
  name: string;
  email?: string;
  url?: string;
}

/**
 * Dependencies map
 */
export type Dependencies = Record<PackageName, string>; // version range

/**
 * Package version metadata
 */
export interface PackageVersionMetadata {
  name: PackageName;
  version: PackageVersion;
  description?: string;
  keywords?: string[];
  homepage?: string;
  repository?: Repository;
  bugs?: { url: string; email?: string };
  license?: string;
  author?: Person;
  maintainers?: Person[];
  contributors?: Person[];
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
  optionalDependencies?: Dependencies;
  bundledDependencies?: string[];
  scripts?: Record<string, string>;
  dist: DistInfo;
  publishedAt?: ISOTimestamp;
}

/**
 * Complete package document (packument)
 */
export interface PackageDocument {
  _id: string;
  _rev: string;
  name: PackageName;
  description?: string;
  "dist-tags": Record<string, PackageVersion>;
  versions: Record<PackageVersion, PackageVersionMetadata>;
  time: Record<PackageVersion | "created" | "modified", ISOTimestamp>;
  maintainers: Person[];
  author?: Person;
  repository?: Repository;
  readme?: string;
  readmeFilename?: string;
  homepage?: string;
  keywords?: string[];
  bugs?: { url: string; email?: string };
  license?: string;
}

/**
 * Simplified version info for widget display
 */
export interface VersionInfo {
  version: PackageVersion;
  publishedAt: ISOTimestamp;
  size: number;             // unpackedSize in bytes
  isMajor: boolean;
  isMinor: boolean;
  isPatch: boolean;
  timeSincePrevious?: number; // milliseconds
}

/**
 * Dependency entry with metadata
 */
export interface DependencyEntry {
  name: PackageName;
  versionRange: string;     // Semver range (e.g., "^1.0.0")
  type: DependencyType;
  isScoped: boolean;
  latestVersion?: PackageVersion; // If fetched
}
```

### npms.io API Models

```typescript
/**
 * Quality metrics from npms.io
 */
export interface QualityMetrics {
  carefulness: number;      // 0-1
  tests: number;            // 0-1
  health: number;           // 0-1
  branding: number;         // 0-1
}

/**
 * Popularity metrics from npms.io
 */
export interface PopularityMetrics {
  communityInterest: number;     // 0-1
  downloadsCount: number;        // 0-1
  downloadsAcceleration: number; // 0-1
}

/**
 * Maintenance metrics from npms.io
 */
export interface MaintenanceMetrics {
  releasesFrequency: number;     // 0-1
  commitsFrequency: number;      // 0-1
  openIssues: number;            // 0-1
  issuesDistribution: number;    // 0-1
}

/**
 * Evaluation scores from npms.io
 */
export interface EvaluationScores {
  quality: QualityMetrics;
  popularity: PopularityMetrics;
  maintenance: MaintenanceMetrics;
}

/**
 * Final score breakdown from npms.io
 */
export interface ScoreDetail {
  quality: number;          // 0-1
  popularity: number;       // 0-1
  maintenance: number;      // 0-1
}

/**
 * Complete npms.io package analysis
 */
export interface NpmsPackageAnalysis {
  analyzedAt: ISOTimestamp;
  collected: {
    metadata: {
      name: PackageName;
      version: PackageVersion;
      description?: string;
      keywords?: string[];
      license?: string;
      links?: {
        npm?: string;
        homepage?: string;
        repository?: string;
        bugs?: string;
      };
    };
    npm: {
      downloads: Array<{ from: string; to: string; count: number }>;
      starsCount?: number;
      dependentsCount?: number;
    };
    github?: {
      starsCount?: number;
      forksCount?: number;
      subscribersCount?: number;
      issues?: { count: number; openCount: number };
      contributors?: Array<{ username: string; commitsCount: number }>;
    };
  };
  evaluation: EvaluationScores;
  score: {
    final: number;          // 0-1
    detail: ScoreDetail;
  };
}

/**
 * Fallback quality metrics when npms.io unavailable
 */
export interface FallbackQualityMetrics {
  hasReadme: boolean;
  hasRepository: boolean;
  hasLicense: boolean;
  hasTests: boolean;        // Inferred from devDependencies
  dependenciesCount: number;
  lastPublishDays: number;  // Days since last publish
  versionCount: number;     // Total versions published
}
```

### Widget-Specific Models

```typescript
/**
 * Configuration for Package Download Trends widget
 */
export interface DownloadTrendsConfig {
  packageName: PackageName;
  period: DownloadPeriod;
  aggregation: "daily" | "weekly" | "monthly";
  showTrend: boolean;
  showAverage: boolean;
}

/**
 * Data for Package Download Trends widget
 */
export interface DownloadTrendsData {
  packageName: PackageName;
  downloads: DailyDownloads[];
  statistics: DownloadStatistics;
  period: { start: string; end: string };
  fetchedAt: ISOTimestamp;
}

/**
 * Configuration for Package Version History widget
 */
export interface VersionHistoryConfig {
  packageName: PackageName;
  maxVersions: number;
  versionFilter: "all" | "major" | "minor" | "patch";
  sortOrder: "newest" | "oldest";
}

/**
 * Data for Package Version History widget
 */
export interface VersionHistoryData {
  packageName: PackageName;
  versions: VersionInfo[];
  latestVersion: PackageVersion;
  totalVersions: number;
  averageTimeBetweenReleases: number; // milliseconds
  fetchedAt: ISOTimestamp;
}

/**
 * Configuration for Package Quality Score widget
 */
export interface QualityScoreConfig {
  packageName: PackageName;
  displayMode: "scores" | "details" | "both";
  scoresToShow: Array<"quality" | "popularity" | "maintenance" | "final">;
}

/**
 * Data for Package Quality Score widget
 */
export interface QualityScoreData {
  packageName: PackageName;
  source: "npms.io" | "fallback";
  npmsAnalysis?: NpmsPackageAnalysis;
  fallbackMetrics?: FallbackQualityMetrics;
  fetchedAt: ISOTimestamp;
}

/**
 * Configuration for Dependencies Overview widget
 */
export interface DependenciesConfig {
  packageName: PackageName;
  version: PackageVersion | "latest";
  dependencyTypes: DependencyType[];
  sortBy: "name" | "type";
  showVersionInfo: boolean;
}

/**
 * Data for Dependencies Overview widget
 */
export interface DependenciesData {
  packageName: PackageName;
  version: PackageVersion;
  dependencies: DependencyEntry[];
  totalCount: number;
  countByType: Record<DependencyType, number>;
  fetchedAt: ISOTimestamp;
}
```

### Error Types

```typescript
/**
 * npm API error codes
 */
export enum NpmErrorCode {
  PACKAGE_NOT_FOUND = "PACKAGE_NOT_FOUND",
  INVALID_PACKAGE_NAME = "INVALID_PACKAGE_NAME",
  INVALID_VERSION = "INVALID_VERSION",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  NETWORK_ERROR = "NETWORK_ERROR",
  INVALID_DATE_RANGE = "INVALID_DATE_RANGE",
  DATE_RANGE_TOO_LARGE = "DATE_RANGE_TOO_LARGE",
  UNPUBLISHED_PACKAGE = "UNPUBLISHED_PACKAGE",
  PRIVATE_PACKAGE = "PRIVATE_PACKAGE",
  TIMEOUT = "TIMEOUT",
}

/**
 * Structured npm API error
 */
export interface NpmApiError {
  code: NpmErrorCode;
  message: string;
  statusCode?: number;
  packageName?: PackageName;
  retryable: boolean;
  retryAfter?: number;      // seconds
  timestamp: ISOTimestamp;
}
```

---

## Service Implementation

### NpmService Class

The `NpmService` class is the primary interface for all npm API interactions. It provides methods for each widget's data requirements with built-in caching, rate limiting, and error handling.

```typescript
import { z } from "zod";

/**
 * Zod schemas for runtime validation
 */
const PackageNameSchema = z.string().min(1).max(214).regex(
  /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
  "Invalid package name format"
);

const DownloadPeriodSchema = z.union([
  z.enum(["last-day", "last-week", "last-month", "last-year"]),
  z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
]);

/**
 * Service configuration options
 */
export interface NpmServiceConfig {
  registryBaseUrl?: string;
  downloadsBaseUrl?: string;
  npmsBaseUrl?: string;
  npmsApiKey?: string;
  cacheEnabled?: boolean;
  cacheTTL?: {
    packageMetadata?: number;    // default: 4 hours
    downloads?: number;           // default: 24 hours
    qualityScores?: number;       // default: 24 hours
  };
  rateLimits?: {
    registry?: number;            // requests per minute
    downloads?: number;           // requests per minute
    npms?: number;                // requests per hour
  };
  timeout?: number;               // milliseconds
  retryConfig?: {
    maxRetries?: number;
    initialDelay?: number;        // milliseconds
    maxDelay?: number;            // milliseconds
  };
}

/**
 * Main npm service class
 * Handles all npm API interactions with caching and rate limiting
 */
export class NpmService {
  private readonly registryBaseUrl: string;
  private readonly downloadsBaseUrl: string;
  private readonly npmsBaseUrl: string;
  private readonly npmsApiKey?: string;
  private readonly config: Required<NpmServiceConfig>;
  private readonly cache: Map<string, CacheEntry>;
  private readonly rateLimiters: {
    registry: RateLimiter;
    downloads: RateLimiter;
    npms: RateLimiter;
  };

  constructor(config: NpmServiceConfig = {}) {
    this.registryBaseUrl = config.registryBaseUrl || "https://registry.npmjs.org";
    this.downloadsBaseUrl = config.downloadsBaseUrl || "https://api.npmjs.org";
    this.npmsBaseUrl = config.npmsBaseUrl || "https://api.npms.io/v2";
    this.npmsApiKey = config.npmsApiKey;

    this.config = {
      ...config,
      cacheEnabled: config.cacheEnabled ?? true,
      cacheTTL: {
        packageMetadata: config.cacheTTL?.packageMetadata ?? 4 * 60 * 60 * 1000, // 4 hours
        downloads: config.cacheTTL?.downloads ?? 24 * 60 * 60 * 1000, // 24 hours
        qualityScores: config.cacheTTL?.qualityScores ?? 24 * 60 * 60 * 1000, // 24 hours
      },
      rateLimits: {
        registry: config.rateLimits?.registry ?? 100, // per minute
        downloads: config.rateLimits?.downloads ?? 60, // per minute
        npms: config.rateLimits?.npms ?? 250, // per hour
      },
      timeout: config.timeout ?? 10000, // 10 seconds
      retryConfig: {
        maxRetries: config.retryConfig?.maxRetries ?? 3,
        initialDelay: config.retryConfig?.initialDelay ?? 1000,
        maxDelay: config.retryConfig?.maxDelay ?? 10000,
      },
    };

    this.cache = new Map();
    this.rateLimiters = {
      registry: new RateLimiter(this.config.rateLimits.registry, 60000),
      downloads: new RateLimiter(this.config.rateLimits.downloads, 60000),
      npms: new RateLimiter(this.config.rateLimits.npms, 3600000),
    };
  }

  /**
   * Fetch download statistics for a package over a time period
   * Used by: Package Download Trends widget
   */
  async getDownloadStats(
    packageName: PackageName,
    period: DownloadPeriod
  ): Promise<DownloadTrendsData> {
    // Validate input
    PackageNameSchema.parse(packageName);
    DownloadPeriodSchema.parse(period);

    const encodedPackage = this.encodePackageName(packageName);
    const periodStr = typeof period === "string"
      ? period
      : `${period.start}:${period.end}`;

    // Check cache
    const cacheKey = `downloads:range:${encodedPackage}:${periodStr}`;
    const cached = this.getFromCache<DownloadRangeResponse>(
      cacheKey,
      this.config.cacheTTL.downloads
    );
    if (cached) {
      return this.transformDownloadData(cached, packageName);
    }

    // Rate limit check
    await this.rateLimiters.downloads.acquire();

    // Fetch from API
    const url = `${this.downloadsBaseUrl}/downloads/range/${periodStr}/${encodedPackage}`;

    const response = await this.fetchWithRetry<DownloadRangeResponse>(url, {
      errorCode: NpmErrorCode.SERVICE_UNAVAILABLE,
      context: { packageName, period },
    });

    // Cache response
    this.setCache(cacheKey, response, this.config.cacheTTL.downloads);

    return this.transformDownloadData(response, packageName);
  }

  /**
   * Fetch package metadata including versions and dependencies
   * Used by: Package Version History widget, Dependencies Overview widget
   */
  async getPackageMetadata(packageName: PackageName): Promise<PackageDocument> {
    PackageNameSchema.parse(packageName);

    const encodedPackage = this.encodePackageName(packageName);
    const cacheKey = `package:${encodedPackage}`;

    const cached = this.getFromCache<PackageDocument>(
      cacheKey,
      this.config.cacheTTL.packageMetadata
    );
    if (cached) return cached;

    await this.rateLimiters.registry.acquire();

    const url = `${this.registryBaseUrl}/${encodedPackage}`;

    const response = await this.fetchWithRetry<PackageDocument>(url, {
      errorCode: NpmErrorCode.PACKAGE_NOT_FOUND,
      context: { packageName },
    });

    this.setCache(cacheKey, response, this.config.cacheTTL.packageMetadata);
    return response;
  }

  /**
   * Fetch package quality scores from npms.io
   * Used by: Package Quality Score widget
   */
  async getQualityScores(packageName: PackageName): Promise<QualityScoreData> {
    PackageNameSchema.parse(packageName);

    const cacheKey = `quality:${packageName}`;
    const cached = this.getFromCache<QualityScoreData>(
      cacheKey,
      this.config.cacheTTL.qualityScores
    );
    if (cached) return cached;

    await this.rateLimiters.npms.acquire();

    const url = `${this.npmsBaseUrl}/package/${encodeURIComponent(packageName)}`;
    const headers: HeadersInit = {};
    if (this.npmsApiKey) {
      headers["Authorization"] = `Bearer ${this.npmsApiKey}`;
    }

    try {
      const response = await this.fetchWithRetry<NpmsPackageAnalysis>(url, {
        headers,
        errorCode: NpmErrorCode.SERVICE_UNAVAILABLE,
        context: { packageName },
      });

      const result: QualityScoreData = {
        packageName,
        source: "npms.io",
        npmsAnalysis: response,
        fetchedAt: new Date().toISOString(),
      };

      this.setCache(cacheKey, result, this.config.cacheTTL.qualityScores);
      return result;
    } catch (error) {
      // Fallback to Registry API for basic metrics
      console.warn(`npms.io unavailable for ${packageName}, using fallback`, error);
      return this.getFallbackQualityMetrics(packageName);
    }
  }

  /**
   * Get version history for a package
   * Used by: Package Version History widget
   */
  async getVersionHistory(
    packageName: PackageName,
    config: VersionHistoryConfig
  ): Promise<VersionHistoryData> {
    const packageDoc = await this.getPackageMetadata(packageName);

    const versions = Object.keys(packageDoc.versions)
      .map((version): VersionInfo => {
        const versionData = packageDoc.versions[version];
        const publishedAt = packageDoc.time[version];

        return {
          version,
          publishedAt,
          size: versionData.dist.unpackedSize,
          isMajor: this.isMajorVersion(version),
          isMinor: this.isMinorVersion(version),
          isPatch: this.isPatchVersion(version),
        };
      })
      .sort((a, b) => {
        const order = config.sortOrder === "newest" ? -1 : 1;
        return order * (new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
      });

    // Filter by version type
    const filtered = this.filterVersions(versions, config.versionFilter);

    // Calculate time since previous release
    for (let i = 1; i < filtered.length; i++) {
      const current = filtered[i];
      const previous = filtered[i - 1];
      current.timeSincePrevious =
        new Date(current.publishedAt).getTime() - new Date(previous.publishedAt).getTime();
    }

    // Limit to maxVersions
    const limited = filtered.slice(0, config.maxVersions);

    // Calculate average time between releases
    const timeDiffs = limited
      .map(v => v.timeSincePrevious)
      .filter((t): t is number => t !== undefined);
    const averageTimeBetweenReleases =
      timeDiffs.length > 0
        ? timeDiffs.reduce((sum, t) => sum + t, 0) / timeDiffs.length
        : 0;

    return {
      packageName,
      versions: limited,
      latestVersion: packageDoc["dist-tags"].latest,
      totalVersions: versions.length,
      averageTimeBetweenReleases,
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Get dependencies for a package version
   * Used by: Dependencies Overview widget
   */
  async getDependencies(
    packageName: PackageName,
    config: DependenciesConfig
  ): Promise<DependenciesData> {
    const packageDoc = await this.getPackageMetadata(packageName);

    // Resolve version
    const version = config.version === "latest"
      ? packageDoc["dist-tags"].latest
      : config.version;

    const versionData = packageDoc.versions[version];
    if (!versionData) {
      throw {
        code: NpmErrorCode.INVALID_VERSION,
        message: `Version ${version} not found for package ${packageName}`,
        packageName,
        retryable: false,
        timestamp: new Date().toISOString(),
      } as NpmApiError;
    }

    // Extract dependencies
    const dependencies: DependencyEntry[] = [];

    for (const depType of config.dependencyTypes) {
      const deps = versionData[depType] || {};
      for (const [name, versionRange] of Object.entries(deps)) {
        dependencies.push({
          name,
          versionRange,
          type: depType,
          isScoped: name.startsWith("@"),
        });
      }
    }

    // Optionally fetch version info for each dependency
    if (config.showVersionInfo) {
      await Promise.allSettled(
        dependencies.map(async (dep) => {
          try {
            const depDoc = await this.getPackageMetadata(dep.name);
            dep.latestVersion = depDoc["dist-tags"].latest;
          } catch (error) {
            // Ignore errors for individual dependencies
            console.warn(`Failed to fetch version for ${dep.name}`, error);
          }
        })
      );
    }

    // Sort dependencies
    if (config.sortBy === "name") {
      dependencies.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      dependencies.sort((a, b) => a.type.localeCompare(b.type));
    }

    // Count by type
    const countByType: Record<DependencyType, number> = {
      dependencies: 0,
      devDependencies: 0,
      peerDependencies: 0,
      optionalDependencies: 0,
    };
    for (const dep of dependencies) {
      countByType[dep.type]++;
    }

    return {
      packageName,
      version,
      dependencies,
      totalCount: dependencies.length,
      countByType,
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Fetch multiple packages' quality scores in bulk
   * Uses npms.io /v2/package/mget endpoint
   */
  async getQualityScoresBulk(
    packageNames: PackageName[]
  ): Promise<Map<PackageName, QualityScoreData>> {
    // Validate all package names
    packageNames.forEach(name => PackageNameSchema.parse(name));

    await this.rateLimiters.npms.acquire();

    const url = `${this.npmsBaseUrl}/package/mget`;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (this.npmsApiKey) {
      headers["Authorization"] = `Bearer ${this.npmsApiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(packageNames),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`npms.io bulk request failed: ${response.status}`);
      }

      const data: Record<PackageName, NpmsPackageAnalysis> = await response.json();

      const results = new Map<PackageName, QualityScoreData>();
      for (const [packageName, analysis] of Object.entries(data)) {
        const qualityData: QualityScoreData = {
          packageName,
          source: "npms.io",
          npmsAnalysis: analysis,
          fetchedAt: new Date().toISOString(),
        };
        results.set(packageName, qualityData);

        // Cache individual results
        const cacheKey = `quality:${packageName}`;
        this.setCache(cacheKey, qualityData, this.config.cacheTTL.qualityScores);
      }

      return results;
    } catch (error) {
      console.error("Bulk quality scores fetch failed", error);

      // Fallback to individual requests
      const results = new Map<PackageName, QualityScoreData>();
      await Promise.allSettled(
        packageNames.map(async (packageName) => {
          try {
            const data = await this.getQualityScores(packageName);
            results.set(packageName, data);
          } catch (err) {
            console.warn(`Failed to fetch quality for ${packageName}`, err);
          }
        })
      );
      return results;
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * Encode package name for URL (handles scoped packages)
   */
  private encodePackageName(packageName: PackageName): string {
    // Scoped packages: @org/package → @org%2Fpackage
    return packageName.replace("/", "%2F");
  }

  /**
   * Transform raw download data into widget-ready format
   */
  private transformDownloadData(
    response: DownloadRangeResponse,
    packageName: PackageName
  ): DownloadTrendsData {
    const downloads = response.downloads;
    const total = downloads.reduce((sum, day) => sum + day.downloads, 0);
    const average = total / downloads.length;
    const peak = downloads.reduce((max, day) =>
      day.downloads > max.downloads ? day : max
    );

    // Calculate trend
    const midpoint = Math.floor(downloads.length / 2);
    const firstHalf = downloads.slice(0, midpoint);
    const secondHalf = downloads.slice(midpoint);
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.downloads, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.downloads, 0) / secondHalf.length;
    const trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;

    let trend: "increasing" | "decreasing" | "stable";
    if (trendPercentage > 5) trend = "increasing";
    else if (trendPercentage < -5) trend = "decreasing";
    else trend = "stable";

    return {
      packageName,
      downloads,
      statistics: {
        total,
        average,
        peak,
        trend,
        trendPercentage,
      },
      period: {
        start: response.start,
        end: response.end,
      },
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Get fallback quality metrics when npms.io unavailable
   */
  private async getFallbackQualityMetrics(
    packageName: PackageName
  ): Promise<QualityScoreData> {
    const packageDoc = await this.getPackageMetadata(packageName);
    const latestVersion = packageDoc["dist-tags"].latest;
    const versionData = packageDoc.versions[latestVersion];

    const hasReadme = !!packageDoc.readme && packageDoc.readme.length > 100;
    const hasRepository = !!packageDoc.repository;
    const hasLicense = !!versionData.license;
    const hasTests =
      !!versionData.devDependencies &&
      Object.keys(versionData.devDependencies).some(dep =>
        dep.includes("jest") || dep.includes("mocha") || dep.includes("vitest")
      );

    const dependenciesCount = Object.keys(versionData.dependencies || {}).length;

    const lastPublish = new Date(packageDoc.time[latestVersion]);
    const lastPublishDays = Math.floor(
      (Date.now() - lastPublish.getTime()) / (1000 * 60 * 60 * 24)
    );

    const versionCount = Object.keys(packageDoc.versions).length;

    const fallbackMetrics: FallbackQualityMetrics = {
      hasReadme,
      hasRepository,
      hasLicense,
      hasTests,
      dependenciesCount,
      lastPublishDays,
      versionCount,
    };

    return {
      packageName,
      source: "fallback",
      fallbackMetrics,
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Check if version is a major release (x.0.0)
   */
  private isMajorVersion(version: PackageVersion): boolean {
    const match = version.match(/^(\d+)\.0\.0/);
    return !!match;
  }

  /**
   * Check if version is a minor release (x.y.0)
   */
  private isMinorVersion(version: PackageVersion): boolean {
    const match = version.match(/^(\d+)\.(\d+)\.0$/);
    return !!match && match[2] !== "0";
  }

  /**
   * Check if version is a patch release (x.y.z where z > 0)
   */
  private isPatchVersion(version: PackageVersion): boolean {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    return !!match && match[3] !== "0";
  }

  /**
   * Filter versions by type
   */
  private filterVersions(
    versions: VersionInfo[],
    filter: "all" | "major" | "minor" | "patch"
  ): VersionInfo[] {
    if (filter === "all") return versions;
    if (filter === "major") return versions.filter(v => v.isMajor);
    if (filter === "minor") return versions.filter(v => v.isMinor);
    if (filter === "patch") return versions.filter(v => v.isPatch);
    return versions;
  }

  /**
   * Fetch with exponential backoff retry
   */
  private async fetchWithRetry<T>(
    url: string,
    options: {
      headers?: HeadersInit;
      errorCode: NpmErrorCode;
      context?: Record<string, unknown>;
    }
  ): Promise<T> {
    const { maxRetries, initialDelay, maxDelay } = this.config.retryConfig;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: options.headers,
          signal: AbortSignal.timeout(this.config.timeout),
        });

        if (response.status === 404) {
          throw {
            code: NpmErrorCode.PACKAGE_NOT_FOUND,
            message: `Package not found or unpublished`,
            statusCode: 404,
            retryable: false,
            timestamp: new Date().toISOString(),
            ...options.context,
          } as NpmApiError;
        }

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get("Retry-After") || "60");
          throw {
            code: NpmErrorCode.RATE_LIMIT_EXCEEDED,
            message: `Rate limit exceeded`,
            statusCode: 429,
            retryable: true,
            retryAfter,
            timestamp: new Date().toISOString(),
            ...options.context,
          } as NpmApiError;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;

        // Don't retry non-retryable errors
        if (
          error instanceof Object &&
          "retryable" in error &&
          !error.retryable
        ) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          initialDelay * Math.pow(2, attempt),
          maxDelay
        );

        console.warn(
          `Fetch failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms`,
          { url, error }
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries exhausted
    throw {
      code: options.errorCode,
      message: `Failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
      retryable: false,
      timestamp: new Date().toISOString(),
      ...options.context,
    } as NpmApiError;
  }

  /**
   * Get value from cache if not expired
   */
  private getFromCache<T>(key: string, ttl: number): T | null {
    if (!this.config.cacheEnabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  private setCache(key: string, value: unknown, ttl: number): void {
    if (!this.config.cacheEnabled) return;

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });

    // Cleanup old entries (simple LRU, limit to 1000 entries)
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
}

/**
 * Cache entry structure
 */
interface CacheEntry {
  value: unknown;
  timestamp: number;
  ttl: number;
}

/**
 * Simple rate limiter implementation
 */
class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms
  private lastRefill: number;

  constructor(maxTokens: number, windowMs: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = maxTokens / windowMs;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Wait until token available
    const waitTime = (1 - this.tokens) / this.refillRate;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this.tokens = 0; // Consumed the token we waited for
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

---

## Caching Strategy

### Overview

Effective caching is critical for npm API integration due to:
1. **No official rate limits** on Registry/Downloads APIs (but respectful usage expected)
2. **Rate limits on npms.io** (250 req/hour unauthenticated)
3. **Immutable historical data** (download counts for past dates never change)
4. **Infrequent package updates** (versions published periodically, not real-time)

### Multi-Layer Caching Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Layer                          │
│                     (React Query)                            │
│  - staleTime: 5 minutes                                      │
│  - cacheTime: 30 minutes                                     │
│  - Background refetch on focus/reconnect                     │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Route Layer                   │
│                (Next.js Cache API / unstable_cache)          │
│  - Server-side caching with revalidation                     │
│  - Distributed cache on Vercel Edge Network                  │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     NpmService Layer                         │
│                    (In-Memory Cache)                         │
│  - Request deduplication                                     │
│  - TTL-based expiration                                      │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
                         npm APIs (external)
```

### Cache Duration by Data Type

| Data Type | TTL | Rationale | Invalidation Strategy |
|-----------|-----|-----------|----------------------|
| **Package Metadata** | 4 hours | Versions published infrequently | Manual refresh button |
| **Historical Downloads** (past dates) | 24 hours | Immutable (never changes) | None (permanent) |
| **Current Day Downloads** | 1 hour | Updates throughout day | Time-based only |
| **npms.io Quality Scores** | 24 hours | Updated daily by npms.io | Manual refresh button |
| **Version List** | 4 hours | New versions published occasionally | Background refetch |
| **Dependency Tree** | 4 hours | Dependencies fixed per version | None (version-specific) |
| **Bulk Quality Scores** | 24 hours | Same as individual scores | Per-package invalidation |

### Cache Key Design

```typescript
/**
 * Cache key patterns for different data types
 */
const CACHE_KEYS = {
  // Package metadata
  packageMetadata: (pkg: string) => `npm:package:${pkg}`,

  // Download statistics
  downloadsRange: (pkg: string, period: string) =>
    `npm:downloads:range:${pkg}:${period}`,
  downloadsPoint: (pkg: string, period: string) =>
    `npm:downloads:point:${pkg}:${period}`,

  // Quality scores
  quality: (pkg: string) => `npm:quality:${pkg}`,
  qualityBulk: (packages: string[]) =>
    `npm:quality:bulk:${packages.sort().join(",")}`,

  // Version history
  versionHistory: (pkg: string, filter: string) =>
    `npm:versions:${pkg}:${filter}`,

  // Dependencies
  dependencies: (pkg: string, version: string, types: string[]) =>
    `npm:deps:${pkg}:${version}:${types.sort().join(",")}`,
};
```

### React Query Configuration

```typescript
import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * React Query client configuration for npm data
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Browser cache configuration
      staleTime: 5 * 60 * 1000,        // 5 minutes (data considered fresh)
      cacheTime: 30 * 60 * 1000,       // 30 minutes (keep in memory)

      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry 404 errors (package not found)
        if (error instanceof Object && "code" in error) {
          const npmError = error as NpmApiError;
          if (npmError.code === NpmErrorCode.PACKAGE_NOT_FOUND) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Background refetch
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: false,

      // Prevent duplicate requests
      refetchInterval: false,
    },
  },
});

/**
 * Query keys factory for type-safe cache keys
 */
export const npmQueryKeys = {
  all: ["npm"] as const,

  downloads: () => [...npmQueryKeys.all, "downloads"] as const,
  downloadRange: (pkg: string, period: DownloadPeriod) =>
    [...npmQueryKeys.downloads(), pkg, period] as const,

  packages: () => [...npmQueryKeys.all, "packages"] as const,
  package: (pkg: string) => [...npmQueryKeys.packages(), pkg] as const,

  quality: () => [...npmQueryKeys.all, "quality"] as const,
  qualityScore: (pkg: string) => [...npmQueryKeys.quality(), pkg] as const,
  qualityScoresBulk: (packages: string[]) =>
    [...npmQueryKeys.quality(), "bulk", ...packages.sort()] as const,

  versions: () => [...npmQueryKeys.all, "versions"] as const,
  versionHistory: (pkg: string, config: VersionHistoryConfig) =>
    [...npmQueryKeys.versions(), pkg, config] as const,

  dependencies: () => [...npmQueryKeys.all, "dependencies"] as const,
  packageDependencies: (pkg: string, config: DependenciesConfig) =>
    [...npmQueryKeys.dependencies(), pkg, config] as const,
};
```

### Next.js API Route Caching

```typescript
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js API route with server-side caching
 * Example: /api/npm/downloads/range/[period]/[package]/route.ts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { period: string; package: string } }
) {
  const { period, package: packageName } = params;

  // Validate inputs
  try {
    PackageNameSchema.parse(packageName);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid package name" },
      { status: 400 }
    );
  }

  // Use Next.js cache with revalidation
  const getCachedDownloads = unstable_cache(
    async () => {
      const npmService = new NpmService();
      return await npmService.getDownloadStats(
        packageName,
        period as DownloadPeriod
      );
    },
    [`downloads-${packageName}-${period}`],
    {
      revalidate: 3600, // 1 hour (in seconds)
      tags: [`npm-downloads`, `package-${packageName}`],
    }
  );

  try {
    const data = await getCachedDownloads();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, max-age=3600",
        "Vercel-CDN-Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch download stats", error);

    if (error instanceof Object && "code" in error) {
      const npmError = error as NpmApiError;
      return NextResponse.json(
        { error: npmError.message, code: npmError.code },
        { status: npmError.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Cache Invalidation Strategies

**Manual Invalidation (User-Triggered):**
```typescript
// Refresh button in widget
const handleRefresh = async () => {
  await queryClient.invalidateQueries({
    queryKey: npmQueryKeys.downloadRange(packageName, period),
  });
};

// Invalidate all npm data
const handleRefreshAll = async () => {
  await queryClient.invalidateQueries({
    queryKey: npmQueryKeys.all,
  });
};
```

**Time-Based Invalidation:**
- Automatic via React Query `staleTime` and Next.js `revalidate`
- No manual intervention required
- Balances freshness with performance

**Tag-Based Invalidation (Next.js):**
```typescript
import { revalidateTag } from "next/cache";

// Invalidate all data for a specific package
await revalidateTag(`package-${packageName}`);

// Invalidate all npm downloads data
await revalidateTag("npm-downloads");
```

### Performance Optimizations

**Prefetching Popular Packages:**
```typescript
// Prefetch data for popular packages on dashboard load
const POPULAR_PACKAGES = ["react", "vue", "express", "lodash"];

useEffect(() => {
  POPULAR_PACKAGES.forEach((pkg) => {
    queryClient.prefetchQuery({
      queryKey: npmQueryKeys.qualityScore(pkg),
      queryFn: () => npmService.getQualityScores(pkg),
    });
  });
}, []);
```

**Request Deduplication:**
```typescript
// React Query automatically deduplicates identical requests
// Multiple widgets requesting same package simultaneously only trigger one API call
const { data: downloads1 } = useQuery({
  queryKey: npmQueryKeys.downloadRange("react", "last-month"),
  queryFn: () => npmService.getDownloadStats("react", "last-month"),
});

const { data: downloads2 } = useQuery({
  queryKey: npmQueryKeys.downloadRange("react", "last-month"),
  queryFn: () => npmService.getDownloadStats("react", "last-month"),
});
// Only one API call made, both widgets share cached result
```

---

## Rate Limiting & Throttling

### Rate Limit Summary

| API | Limit | Window | Authenticated | Notes |
|-----|-------|--------|---------------|-------|
| **npm Registry** | ~100/min (recommended) | 1 minute | Not required | No official limit, be respectful |
| **npm Downloads** | ~60/min (recommended) | 1 minute | Not required | No official limit, be respectful |
| **npms.io** | 250/hour | 1 hour | No | Official limit |
| **npms.io** (with key) | 1000/hour | 1 hour | Yes | Requires API key |

### Client-Side Rate Limiting

The `RateLimiter` class (shown in Service Implementation) implements a token bucket algorithm:

```typescript
/**
 * Token bucket rate limiter
 *
 * Algorithm:
 * - Bucket holds maximum N tokens
 * - Each request consumes 1 token
 * - Tokens refill at constant rate
 * - If bucket empty, request waits until token available
 */
class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private lastRefill: number;

  constructor(maxTokens: number, windowMs: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = maxTokens / windowMs;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Wait for token
    const waitTime = (1 - this.tokens) / this.refillRate;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this.tokens = 0;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

**Usage:**
```typescript
// In NpmService constructor
this.rateLimiters = {
  registry: new RateLimiter(100, 60000),   // 100 requests per minute
  downloads: new RateLimiter(60, 60000),   // 60 requests per minute
  npms: new RateLimiter(250, 3600000),     // 250 requests per hour
};

// Before each API call
await this.rateLimiters.registry.acquire();
// ... make API call
```

### Handling 429 Responses

```typescript
/**
 * Handle rate limit exceeded errors
 */
if (response.status === 429) {
  const retryAfter = parseInt(
    response.headers.get("Retry-After") || "60"
  );

  throw {
    code: NpmErrorCode.RATE_LIMIT_EXCEEDED,
    message: `Rate limit exceeded, retry after ${retryAfter}s`,
    statusCode: 429,
    retryable: true,
    retryAfter,
    timestamp: new Date().toISOString(),
  } as NpmApiError;
}
```

### Circuit Breaker Pattern

```typescript
/**
 * Circuit breaker to prevent cascading failures
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, block all requests
 * - HALF_OPEN: Testing if service recovered
 */
class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly threshold: number = 5,        // Failures to open
    private readonly timeout: number = 60000,      // Time before half-open (ms)
    private readonly successThreshold: number = 2  // Successes to close
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "HALF_OPEN";
        this.successCount = 0;
      } else {
        throw {
          code: NpmErrorCode.SERVICE_UNAVAILABLE,
          message: "Circuit breaker open, service unavailable",
          retryable: true,
          timestamp: new Date().toISOString(),
        } as NpmApiError;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = "CLOSED";
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = "OPEN";
    }
  }

  getState(): string {
    return this.state;
  }
}

// Usage in NpmService
private readonly circuitBreakers = {
  registry: new CircuitBreaker(5, 60000, 2),
  downloads: new CircuitBreaker(5, 60000, 2),
  npms: new CircuitBreaker(5, 60000, 2),
};

// Wrap API calls
await this.circuitBreakers.registry.execute(async () => {
  return await fetch(url);
});
```

### Request Throttling

```typescript
/**
 * Throttle function to limit execution frequency
 */
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      fn(...args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn(...args);
      }, delay - timeSinceLastCall);
    }
  };
}

// Usage: Throttle refresh requests
const throttledRefresh = throttle(
  () => queryClient.invalidateQueries(npmQueryKeys.all),
  5000 // Max once every 5 seconds
);
```

---

## Error Handling

### Error Types and Recovery Strategies

| Error Code | HTTP Status | Retryable | Recovery Strategy | User Message |
|------------|-------------|-----------|-------------------|--------------|
| `PACKAGE_NOT_FOUND` | 404 | No | Show fallback UI | "Package not found. It may be unpublished or private." |
| `INVALID_PACKAGE_NAME` | 400 | No | Validate input | "Invalid package name format." |
| `INVALID_VERSION` | 400 | No | Show available versions | "Version not found. Try 'latest' or select from list." |
| `RATE_LIMIT_EXCEEDED` | 429 | Yes | Wait & retry | "Rate limit reached. Retrying in {seconds}s..." |
| `SERVICE_UNAVAILABLE` | 503 | Yes | Exponential backoff | "Service temporarily unavailable. Retrying..." |
| `NETWORK_ERROR` | - | Yes | Retry with backoff | "Network error. Check connection and retry." |
| `TIMEOUT` | - | Yes | Retry once | "Request timeout. Retrying..." |
| `UNPUBLISHED_PACKAGE` | 404 | No | Cache 404, show message | "This package was unpublished by the author." |

### Error Handling Implementation

```typescript
/**
 * Global error handler for npm API errors
 */
export function handleNpmError(error: unknown): NpmApiError {
  // Already an NpmApiError
  if (error instanceof Object && "code" in error && "message" in error) {
    return error as NpmApiError;
  }

  // Fetch/Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      code: NpmErrorCode.NETWORK_ERROR,
      message: "Network error occurred. Please check your connection.",
      retryable: true,
      timestamp: new Date().toISOString(),
    };
  }

  // Timeout errors
  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      code: NpmErrorCode.TIMEOUT,
      message: "Request timeout. Please try again.",
      retryable: true,
      timestamp: new Date().toISOString(),
    };
  }

  // Unknown errors
  return {
    code: NpmErrorCode.SERVICE_UNAVAILABLE,
    message: error instanceof Error ? error.message : "Unknown error occurred",
    retryable: false,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Error boundary component for widgets
 */
export function NpmErrorBoundary({
  error,
  reset,
}: {
  error: NpmApiError;
  reset: () => void;
}) {
  const getMessage = () => {
    switch (error.code) {
      case NpmErrorCode.PACKAGE_NOT_FOUND:
        return "Package not found. It may be unpublished or private.";
      case NpmErrorCode.RATE_LIMIT_EXCEEDED:
        return `Rate limit exceeded. ${
          error.retryAfter
            ? `Please wait ${error.retryAfter} seconds.`
            : "Please try again later."
        }`;
      case NpmErrorCode.SERVICE_UNAVAILABLE:
        return "npm service temporarily unavailable. Please try again.";
      case NpmErrorCode.NETWORK_ERROR:
        return "Network error. Check your connection and try again.";
      default:
        return error.message || "An error occurred loading npm data.";
    }
  };

  const showRetryButton = error.retryable && !error.retryAfter;

  return (
    <div className="npm-error-boundary">
      <div className="error-icon">⚠️</div>
      <h3>Unable to Load Package Data</h3>
      <p>{getMessage()}</p>
      {showRetryButton && (
        <button onClick={reset} className="retry-button">
          Retry
        </button>
      )}
      {error.retryAfter && (
        <p className="retry-info">
          Automatically retrying in {error.retryAfter} seconds...
        </p>
      )}
    </div>
  );
}
```

### React Query Error Handling

```typescript
/**
 * Custom hook with error handling
 */
export function usePackageDownloads(
  packageName: PackageName,
  period: DownloadPeriod
) {
  return useQuery({
    queryKey: npmQueryKeys.downloadRange(packageName, period),
    queryFn: async () => {
      try {
        const npmService = new NpmService();
        return await npmService.getDownloadStats(packageName, period);
      } catch (error) {
        throw handleNpmError(error);
      }
    },
    retry: (failureCount, error) => {
      const npmError = error as NpmApiError;

      // Don't retry non-retryable errors
      if (!npmError.retryable) return false;

      // Retry up to 3 times for retryable errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex, error) => {
      const npmError = error as NpmApiError;

      // Use server-provided retry-after if available
      if (npmError.retryAfter) {
        return npmError.retryAfter * 1000;
      }

      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });
}
```

### Logging and Monitoring

```typescript
/**
 * Structured logging for npm API errors
 */
export function logNpmError(
  error: NpmApiError,
  context: {
    widget?: string;
    packageName?: string;
    endpoint?: string;
  }
): void {
  console.error("[npm-api-error]", {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    retryable: error.retryable,
    retryAfter: error.retryAfter,
    timestamp: error.timestamp,
    ...context,
  });

  // Send to monitoring service (e.g., Sentry, Datadog)
  if (typeof window !== "undefined" && window.analytics) {
    window.analytics.track("npm_api_error", {
      error_code: error.code,
      package_name: context.packageName,
      widget: context.widget,
      retryable: error.retryable,
    });
  }
}

/**
 * Performance monitoring
 */
export function trackNpmApiCall(
  endpoint: string,
  packageName: string,
  duration: number,
  success: boolean
): void {
  if (typeof window !== "undefined" && window.analytics) {
    window.analytics.track("npm_api_call", {
      endpoint,
      package_name: packageName,
      duration_ms: duration,
      success,
    });
  }
}

// Usage in NpmService
private async fetchWithRetry<T>(url: string, options: any): Promise<T> {
  const startTime = Date.now();
  let success = false;

  try {
    const result = await /* fetch logic */;
    success = true;
    return result;
  } catch (error) {
    logNpmError(handleNpmError(error), {
      endpoint: url,
      packageName: options.context?.packageName,
    });
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    trackNpmApiCall(url, options.context?.packageName, duration, success);
  }
}
```

---

## Multi-Package Queries

### Parallel Fetching Strategy

```typescript
/**
 * Fetch data for multiple packages in parallel
 * Handles rate limiting and errors gracefully
 */
export async function fetchMultiplePackages(
  packageNames: PackageName[],
  dataType: "downloads" | "quality" | "metadata"
): Promise<Map<PackageName, any>> {
  const npmService = new NpmService();
  const results = new Map<PackageName, any>();

  // For quality scores, use bulk endpoint if available
  if (dataType === "quality" && packageNames.length > 1) {
    try {
      return await npmService.getQualityScoresBulk(packageNames);
    } catch (error) {
      console.warn("Bulk fetch failed, falling back to individual requests", error);
    }
  }

  // Parallel fetching with Promise.allSettled
  const promises = packageNames.map(async (packageName) => {
    try {
      let data: any;

      switch (dataType) {
        case "downloads":
          data = await npmService.getDownloadStats(packageName, "last-month");
          break;
        case "quality":
          data = await npmService.getQualityScores(packageName);
          break;
        case "metadata":
          data = await npmService.getPackageMetadata(packageName);
          break;
      }

      return { packageName, data, status: "fulfilled" as const };
    } catch (error) {
      console.error(`Failed to fetch ${dataType} for ${packageName}`, error);
      return { packageName, error, status: "rejected" as const };
    }
  });

  const settled = await Promise.allSettled(promises);

  for (const result of settled) {
    if (result.status === "fulfilled" && result.value.status === "fulfilled") {
      results.set(result.value.packageName, result.value.data);
    }
  }

  return results;
}

/**
 * React hook for multi-package comparison
 */
export function usePackageComparison(
  packageNames: PackageName[],
  metric: "downloads" | "quality"
) {
  return useQuery({
    queryKey: ["npm", "comparison", metric, ...packageNames.sort()],
    queryFn: async () => {
      return await fetchMultiplePackages(packageNames, metric);
    },
    enabled: packageNames.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### npms.io Bulk Query

```typescript
/**
 * Use npms.io /v2/package/mget endpoint for bulk quality scores
 * More efficient than individual requests
 */
async getQualityScoresBulk(
  packageNames: PackageName[]
): Promise<Map<PackageName, QualityScoreData>> {
  // Validate all package names
  packageNames.forEach(name => PackageNameSchema.parse(name));

  await this.rateLimiters.npms.acquire();

  const url = `${this.npmsBaseUrl}/package/mget`;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (this.npmsApiKey) {
    headers["Authorization"] = `Bearer ${this.npmsApiKey}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(packageNames),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`npms.io bulk request failed: ${response.status}`);
    }

    const data: Record<PackageName, NpmsPackageAnalysis> = await response.json();

    const results = new Map<PackageName, QualityScoreData>();
    for (const [packageName, analysis] of Object.entries(data)) {
      const qualityData: QualityScoreData = {
        packageName,
        source: "npms.io",
        npmsAnalysis: analysis,
        fetchedAt: new Date().toISOString(),
      };
      results.set(packageName, qualityData);

      // Cache individual results
      const cacheKey = `quality:${packageName}`;
      this.setCache(cacheKey, qualityData, this.config.cacheTTL.qualityScores);
    }

    return results;
  } catch (error) {
    console.error("Bulk quality scores fetch failed", error);

    // Fallback to individual requests
    const results = new Map<PackageName, QualityScoreData>();
    await Promise.allSettled(
      packageNames.map(async (packageName) => {
        try {
          const data = await this.getQualityScores(packageName);
          results.set(packageName, data);
        } catch (err) {
          console.warn(`Failed to fetch quality for ${packageName}`, err);
        }
      })
    );
    return results;
  }
}
```

### Bulk Download Statistics

```typescript
/**
 * Fetch download stats for multiple packages using bulk endpoint
 * npm Downloads API supports comma-separated package names
 */
export async function getBulkDownloadStats(
  packageNames: PackageName[],
  period: "last-day" | "last-week" | "last-month"
): Promise<Map<PackageName, number>> {
  // npm bulk endpoint doesn't support scoped packages yet
  const regularPackages = packageNames.filter(pkg => !pkg.startsWith("@"));
  const scopedPackages = packageNames.filter(pkg => pkg.startsWith("@"));

  const results = new Map<PackageName, number>();

  // Bulk request for regular packages (max 128 packages)
  if (regularPackages.length > 0) {
    const chunks = chunkArray(regularPackages, 128);

    for (const chunk of chunks) {
      const packagesStr = chunk.join(",");
      const url = `https://api.npmjs.org/downloads/point/${period}/${packagesStr}`;

      try {
        const response = await fetch(url);
        const data: Record<PackageName, { downloads: number }> = await response.json();

        for (const [packageName, stats] of Object.entries(data)) {
          results.set(packageName, stats.downloads);
        }
      } catch (error) {
        console.error("Bulk download stats failed for chunk", error);
      }
    }
  }

  // Individual requests for scoped packages
  if (scopedPackages.length > 0) {
    await Promise.allSettled(
      scopedPackages.map(async (packageName) => {
        try {
          const encoded = packageName.replace("/", "%2F");
          const url = `https://api.npmjs.org/downloads/point/${period}/${encoded}`;
          const response = await fetch(url);
          const data: { downloads: number } = await response.json();
          results.set(packageName, data.downloads);
        } catch (error) {
          console.error(`Failed to fetch downloads for ${packageName}`, error);
        }
      })
    );
  }

  return results;
}

/**
 * Utility: Chunk array into smaller arrays
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
```

---

## Production Code Examples

### Example 1: Package Download Trends Widget

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { NpmService, DownloadPeriod, npmQueryKeys } from "@/lib/npm";
import { Card, CardHeader, CardContent, Spinner, Button } from "@salt-ds/core";

interface PackageDownloadTrendsProps {
  packageName: string;
  period: DownloadPeriod;
}

export function PackageDownloadTrendsWidget({
  packageName,
  period,
}: PackageDownloadTrendsProps) {
  const npmService = new NpmService();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: npmQueryKeys.downloadRange(packageName, period),
    queryFn: () => npmService.getDownloadStats(packageName, period),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error: any) => {
      return error?.retryable && failureCount < 3;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <div className="error-state">
            <h4>Failed to load download statistics</h4>
            <p>{error?.message || "Unknown error"}</p>
            {error?.retryable && (
              <Button onClick={() => refetch()}>Retry</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const chartData = data.downloads.map((day) => ({
    date: new Date(day.day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    downloads: day.downloads,
  }));

  return (
    <Card>
      <CardHeader>
        <h3>{packageName} - Download Trends</h3>
        <div className="stats-summary">
          <div>
            <span className="label">Total:</span>
            <span className="value">{data.statistics.total.toLocaleString()}</span>
          </div>
          <div>
            <span className="label">Avg/day:</span>
            <span className="value">{Math.round(data.statistics.average).toLocaleString()}</span>
          </div>
          <div>
            <span className="label">Trend:</span>
            <span className={`value trend-${data.statistics.trend}`}>
              {data.statistics.trend === "increasing" ? "📈" : "📉"}
              {" "}
              {Math.abs(data.statistics.trendPercentage).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => value.toLocaleString()}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="downloads"
              stroke="#2670A9"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="widget-footer">
          <span className="last-updated">
            Updated: {new Date(data.fetchedAt).toLocaleString()}
          </span>
          <Button variant="secondary" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Example 2: Package Quality Score Widget

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { NpmService, npmQueryKeys } from "@/lib/npm";
import { Card, CardHeader, CardContent, Badge, Spinner } from "@salt-ds/core";

interface PackageQualityScoreProps {
  packageName: string;
  displayMode: "scores" | "details" | "both";
}

export function PackageQualityScoreWidget({
  packageName,
  displayMode,
}: PackageQualityScoreProps) {
  const npmService = new NpmService();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: npmQueryKeys.qualityScore(packageName),
    queryFn: () => npmService.getQualityScores(packageName),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent>
          <p>Failed to load quality scores</p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return "success";
    if (score >= 0.6) return "warning";
    return "error";
  };

  const formatScore = (score: number): string => {
    return (score * 100).toFixed(0);
  };

  return (
    <Card>
      <CardHeader>
        <h3>{packageName} - Quality Score</h3>
        {data.source === "fallback" && (
          <Badge sentiment="warning">Limited Data</Badge>
        )}
      </CardHeader>
      <CardContent>
        {data.source === "npms.io" && data.npmsAnalysis && (
          <>
            {(displayMode === "scores" || displayMode === "both") && (
              <div className="quality-scores">
                <div className="score-item">
                  <span className="score-label">Overall</span>
                  <div className="score-bar">
                    <div
                      className={`score-fill ${getScoreColor(data.npmsAnalysis.score.final)}`}
                      style={{ width: `${data.npmsAnalysis.score.final * 100}%` }}
                    />
                  </div>
                  <span className="score-value">
                    {formatScore(data.npmsAnalysis.score.final)}
                  </span>
                </div>

                <div className="score-item">
                  <span className="score-label">Quality</span>
                  <div className="score-bar">
                    <div
                      className={`score-fill ${getScoreColor(data.npmsAnalysis.score.detail.quality)}`}
                      style={{ width: `${data.npmsAnalysis.score.detail.quality * 100}%` }}
                    />
                  </div>
                  <span className="score-value">
                    {formatScore(data.npmsAnalysis.score.detail.quality)}
                  </span>
                </div>

                <div className="score-item">
                  <span className="score-label">Popularity</span>
                  <div className="score-bar">
                    <div
                      className={`score-fill ${getScoreColor(data.npmsAnalysis.score.detail.popularity)}`}
                      style={{ width: `${data.npmsAnalysis.score.detail.popularity * 100}%` }}
                    />
                  </div>
                  <span className="score-value">
                    {formatScore(data.npmsAnalysis.score.detail.popularity)}
                  </span>
                </div>

                <div className="score-item">
                  <span className="score-label">Maintenance</span>
                  <div className="score-bar">
                    <div
                      className={`score-fill ${getScoreColor(data.npmsAnalysis.score.detail.maintenance)}`}
                      style={{ width: `${data.npmsAnalysis.score.detail.maintenance * 100}%` }}
                    />
                  </div>
                  <span className="score-value">
                    {formatScore(data.npmsAnalysis.score.detail.maintenance)}
                  </span>
                </div>
              </div>
            )}

            {(displayMode === "details" || displayMode === "both") && (
              <div className="quality-details">
                <h4>Quality Metrics</h4>
                <ul>
                  <li>
                    Carefulness: {formatScore(data.npmsAnalysis.evaluation.quality.carefulness)}
                  </li>
                  <li>
                    Tests: {formatScore(data.npmsAnalysis.evaluation.quality.tests)}
                  </li>
                  <li>
                    Health: {formatScore(data.npmsAnalysis.evaluation.quality.health)}
                  </li>
                </ul>

                <h4>Popularity Metrics</h4>
                <ul>
                  <li>
                    Community Interest: {formatScore(data.npmsAnalysis.evaluation.popularity.communityInterest)}
                  </li>
                  <li>
                    Downloads: {formatScore(data.npmsAnalysis.evaluation.popularity.downloadsCount)}
                  </li>
                </ul>

                <h4>Maintenance Metrics</h4>
                <ul>
                  <li>
                    Release Frequency: {formatScore(data.npmsAnalysis.evaluation.maintenance.releasesFrequency)}
                  </li>
                  <li>
                    Commit Frequency: {formatScore(data.npmsAnalysis.evaluation.maintenance.commitsFrequency)}
                  </li>
                </ul>
              </div>
            )}
          </>
        )}

        {data.source === "fallback" && data.fallbackMetrics && (
          <div className="fallback-metrics">
            <p>Using basic metrics (npms.io unavailable)</p>
            <ul>
              <li>Has README: {data.fallbackMetrics.hasReadme ? "✓" : "✗"}</li>
              <li>Has Repository: {data.fallbackMetrics.hasRepository ? "✓" : "✗"}</li>
              <li>Has License: {data.fallbackMetrics.hasLicense ? "✓" : "✗"}</li>
              <li>Has Tests: {data.fallbackMetrics.hasTests ? "✓" : "✗"}</li>
              <li>Dependencies: {data.fallbackMetrics.dependenciesCount}</li>
              <li>Last Publish: {data.fallbackMetrics.lastPublishDays} days ago</li>
              <li>Total Versions: {data.fallbackMetrics.versionCount}</li>
            </ul>
          </div>
        )}

        <div className="widget-footer">
          <span className="last-updated">
            Updated: {new Date(data.fetchedAt).toLocaleString()}
          </span>
          <span className="data-source">
            Source: {data.source}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Example 3: Next.js API Route (Server Component)

```typescript
// app/api/npm/package/[name]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { NpmService, PackageNameSchema, handleNpmError } from "@/lib/npm";
import { z } from "zod";

/**
 * GET /api/npm/package/[name]
 * Fetch package metadata with server-side caching
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  const packageName = params.name;

  // Validate package name
  try {
    PackageNameSchema.parse(packageName);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid package name", details: (error as z.ZodError).errors },
      { status: 400 }
    );
  }

  // Cached fetcher function
  const getCachedPackage = unstable_cache(
    async () => {
      const npmService = new NpmService();
      return await npmService.getPackageMetadata(packageName);
    },
    [`package-${packageName}`],
    {
      revalidate: 4 * 60 * 60, // 4 hours (in seconds)
      tags: [`npm-package`, `package-${packageName}`],
    }
  );

  try {
    const data = await getCachedPackage();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=14400, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, max-age=14400",
        "Vercel-CDN-Cache-Control": "public, max-age=14400",
        "X-Package-Name": packageName,
        "X-Cache-Source": "next-cache",
      },
    });
  } catch (error) {
    const npmError = handleNpmError(error);

    console.error("[npm-api] Package fetch failed", {
      packageName,
      error: npmError,
    });

    return NextResponse.json(
      {
        error: npmError.message,
        code: npmError.code,
        retryable: npmError.retryable,
      },
      {
        status: npmError.statusCode || 500,
        headers: {
          "Cache-Control": npmError.retryable
            ? "no-cache"
            : "public, max-age=3600", // Cache 404s for 1 hour
        },
      }
    );
  }
}
```

### Example 4: Multi-Package Comparison Widget

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchMultiplePackages } from "@/lib/npm";
import { Card, CardHeader, CardContent, Spinner } from "@salt-ds/core";

interface PackageComparisonProps {
  packageNames: string[];
  metric: "downloads" | "quality";
}

export function PackageComparisonWidget({
  packageNames,
  metric,
}: PackageComparisonProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["npm", "comparison", metric, ...packageNames.sort()],
    queryFn: () => fetchMultiplePackages(packageNames, metric),
    enabled: packageNames.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent>
          <p>Failed to load comparison data</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = Array.from(data.entries()).map(([packageName, packageData]) => {
    let value = 0;

    if (metric === "downloads" && packageData.statistics) {
      value = packageData.statistics.total;
    } else if (metric === "quality" && packageData.npmsAnalysis) {
      value = packageData.npmsAnalysis.score.final * 100;
    }

    return {
      package: packageName,
      value,
    };
  });

  const title = metric === "downloads"
    ? "Download Comparison (Last Month)"
    : "Quality Score Comparison";

  const valueLabel = metric === "downloads" ? "Downloads" : "Score";

  return (
    <Card>
      <CardHeader>
        <h3>{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="package" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                metric === "downloads"
                  ? value.toLocaleString()
                  : value.toFixed(1)
              }
            />
            <Legend />
            <Bar dataKey="value" fill="#2670A9" name={valueLabel} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

## Summary

This npm API integration design provides:

1. **Comprehensive API Strategy** using three complementary npm data sources (Registry, Downloads, npms.io)
2. **Four Production-Ready Widgets** with complete endpoint mappings and configurations
3. **Type-Safe Data Models** with Zod validation and strict TypeScript interfaces
4. **Full-Featured NpmService Class** with caching, rate limiting, error handling, and retry logic
5. **Multi-Layer Caching** (browser, server, service) with optimized TTLs per data type
6. **Robust Error Handling** with structured error types, retry strategies, and circuit breakers
7. **Multi-Package Support** with bulk queries and parallel fetching
8. **Production Code Examples** ready for immediate implementation

**Key Features:**
- 600+ lines of production-ready TypeScript code
- Zero-authentication design (public APIs only)
- Respectful rate limiting (100/min Registry, 60/min Downloads, 250/hour npms.io)
- Aggressive caching (24 hours for immutable data, 4 hours for metadata)
- Comprehensive error handling with user-friendly messages
- Support for scoped packages (`@org/package`)
- Bulk query optimization for multi-package scenarios
- Next.js 15 App Router compatible
- React Query integration for client-side state management
- Salt Design System UI components

**Implementation Path:**
1. Copy type definitions to `lib/npm/types.ts`
2. Implement `NpmService` class in `lib/npm/service.ts`
3. Create Next.js API routes in `app/api/npm/`
4. Build widgets using provided examples
5. Configure React Query with recommended settings
6. Add error boundaries and loading states
7. Deploy to Vercel with Edge Functions

This integration is ready for immediate implementation by the `react-typescript-specialist` agent.
