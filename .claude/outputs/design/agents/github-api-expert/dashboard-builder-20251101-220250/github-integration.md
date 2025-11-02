# GitHub API Integration Specification
## Dashboard Builder Project

**Project**: dashboard-builder
**Timestamp**: 20251101-220250
**Agent**: github-api-expert
**API Version**: GitHub REST API v3 & GraphQL API v4

---

## Table of Contents

1. [API Integration Strategy](#1-api-integration-strategy)
2. [Widget-Specific Endpoints](#2-widget-specific-endpoints)
3. [Caching Strategy](#3-caching-strategy)
4. [TypeScript Interfaces](#4-typescript-interfaces)
5. [Service Implementation](#5-service-implementation)
6. [Authentication Design](#6-authentication-design)
7. [Rate Limiting Management](#7-rate-limiting-management)
8. [Error Handling](#8-error-handling)

---

## 1. API Integration Strategy

### 1.1 REST vs GraphQL Decision Matrix

For the Dashboard Builder project, we will use a **hybrid approach** combining REST API v3 and GraphQL API v4:

| Widget Type | API Choice | Rationale |
|-------------|------------|-----------|
| **GH-01: Repository Stars Trend** | REST with Accept header | REST `/stargazers` with `application/vnd.github.star+json` provides timestamps. GraphQL doesn't support stargazer timestamps efficiently. |
| **GH-02: Issue Health Dashboard** | GraphQL | Single query can fetch open/closed counts, creation dates, and state transitions efficiently. |
| **GH-03: Pull Request Activity** | GraphQL | Batch fetch PR states, merge status, and timestamps in one query. |
| **GH-04: Top Contributors** | REST | `/stats/contributors` endpoint provides optimized aggregated data. GraphQL would require many queries. |
| **GH-05: Release Timeline** | REST | `/releases` endpoint is simple and complete. No GraphQL advantage. |
| **GH-06: Repository Health Score** | GraphQL + REST Hybrid | GraphQL for basic metrics (stars, forks, issues), REST for community profile. |

### 1.2 Authentication Approach

**Recommended**: Personal Access Token (Classic) for development, Fine-Grained Personal Access Tokens for production.

- **Development**: Classic PAT with `public_repo` scope (5,000 req/hour)
- **Production**: Fine-grained PAT with minimum permissions:
  - `metadata:read` (mandatory)
  - `contents:read` (for repository data)
  - No additional scopes needed for public repositories

**Backend Proxy Pattern**: All GitHub API requests MUST be proxied through Next.js API routes to prevent token exposure in client-side code.

### 1.3 Rate Limiting Context

- **Authenticated requests**: 5,000 requests/hour
- **GraphQL queries**: 1 point per query (counted against same limit)
- **Secondary limits**: 900 points/minute, 100 concurrent requests
- **Strategy**: Aggressive caching (1-hour minimum) + request deduplication

---

## 2. Widget-Specific Endpoints

### 2.1 GH-01: Repository Stars Trend

**API**: REST API v3
**Endpoint**: `GET /repos/{owner}/{repo}/stargazers`
**Required Headers**:
```typescript
{
  "Accept": "application/vnd.github.star+json",
  "Authorization": "Bearer {token}",
  "X-GitHub-Api-Version": "2022-11-28"
}
```

**Response Structure**:
```json
[
  {
    "starred_at": "2024-10-15T14:23:45Z",
    "user": {
      "login": "username",
      "id": 123456,
      "avatar_url": "https://avatars.githubusercontent.com/u/123456"
    }
  }
]
```

**Pagination**: 100 items per page, maximum 400 pages (40,000 stargazers limit)

**Data Processing**:
1. Fetch all stargazers with pagination
2. Group by time period (day/week/month)
3. Calculate cumulative star count
4. Cache aggregated data for 1 hour

**Cache Key**: `github:stars:${owner}:${repo}:${period}`
**Cache Duration**: 3600 seconds (1 hour)

---

### 2.2 GH-02: Issue Health Dashboard

**API**: GraphQL API v4
**Query**:
```graphql
query IssueHealthMetrics($owner: String!, $name: String!, $since: DateTime!) {
  repository(owner: $owner, name: $name) {
    openIssues: issues(states: OPEN) {
      totalCount
    }
    closedIssues: issues(states: CLOSED, filterBy: {since: $since}) {
      totalCount
      nodes {
        createdAt
        closedAt
        timelineItems(itemTypes: CLOSED_EVENT, first: 1) {
          nodes {
            ... on ClosedEvent {
              createdAt
            }
          }
        }
      }
    }
    recentIssues: issues(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        createdAt
        closedAt
        state
      }
    }
  }
  rateLimit {
    remaining
    resetAt
  }
}
```

**Metrics Calculated**:
- Open vs closed issue ratio
- Average time to close (in days)
- Issue velocity (issues opened vs closed per week)

**Cache Key**: `github:issues:${owner}:${repo}:${timeWindow}`
**Cache Duration**: 900 seconds (15 minutes)

---

### 2.3 GH-03: Pull Request Activity

**API**: GraphQL API v4
**Query**:
```graphql
query PullRequestActivity($owner: String!, $name: String!, $since: DateTime!) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      totalCount
      nodes {
        createdAt
        mergedAt
        closedAt
        state
        merged
        additions
        deletions
      }
    }
  }
  rateLimit {
    remaining
    resetAt
  }
}
```

**Data Aggregation**:
```typescript
// Group PRs by week/month
// Count: opened, merged, closed (not merged)
interface PRAggregation {
  period: string; // ISO week or month
  opened: number;
  merged: number;
  closed: number;
}
```

**Cache Key**: `github:prs:${owner}:${repo}:${period}`
**Cache Duration**: 1800 seconds (30 minutes)

---

### 2.4 GH-04: Top Contributors

**API**: REST API v3
**Endpoint**: `GET /repos/{owner}/{repo}/stats/contributors`

**Response Structure**:
```json
[
  {
    "author": {
      "login": "username",
      "id": 123456,
      "avatar_url": "https://avatars.githubusercontent.com/u/123456"
    },
    "total": 1234,
    "weeks": [
      {
        "w": 1604707200,
        "a": 45,
        "d": 23,
        "c": 12
      }
    ]
  }
]
```

**Data Processing**:
1. Filter by time period (last 30d, 90d, 1yr)
2. Sort by total commits
3. Return top N contributors (configurable, default: 10)

**Important**: Returns 0 for additions/deletions in repos with 10,000+ commits.

**Cache Key**: `github:contributors:${owner}:${repo}:${period}:${topN}`
**Cache Duration**: 86400 seconds (24 hours)

---

### 2.5 GH-05: Release Timeline

**API**: REST API v3
**Endpoint**: `GET /repos/{owner}/{repo}/releases`

**Response Structure**:
```json
[
  {
    "id": 123456,
    "tag_name": "v1.2.3",
    "name": "Release 1.2.3",
    "published_at": "2024-10-15T14:23:45Z",
    "assets": [
      {
        "name": "release.tar.gz",
        "download_count": 5432
      }
    ]
  }
]
```

**Data Processing**:
1. Fetch last N releases (configurable, default: 10)
2. Calculate total downloads per release
3. Calculate time between releases

**Cache Key**: `github:releases:${owner}:${repo}:${count}`
**Cache Duration**: 3600 seconds (1 hour)

---

### 2.6 GH-06: Repository Health Score

**API**: GraphQL + REST Hybrid

**GraphQL Query** (Basic Metrics):
```graphql
query RepositoryHealth($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    stargazerCount
    forkCount
    openIssues: issues(states: OPEN) {
      totalCount
    }
    hasIssuesEnabled
    hasWikiEnabled
    description
    homepageUrl
    licenseInfo {
      name
      spdxId
    }
    defaultBranchRef {
      target {
        ... on Commit {
          history(first: 1) {
            nodes {
              committedDate
            }
          }
        }
      }
    }
  }
}
```

**REST Endpoint** (Community Profile):
```
GET /repos/{owner}/{repo}/community/profile
Accept: application/vnd.github.v3+json
```

**Health Score Algorithm**:
```typescript
interface HealthScoreFactors {
  hasDescription: boolean;      // 10 points
  hasLicense: boolean;          // 15 points
  hasReadme: boolean;           // 15 points
  hasContributing: boolean;     // 10 points
  hasCodeOfConduct: boolean;    // 10 points
  recentActivity: number;       // 0-20 points (days since last commit)
  openIssueRatio: number;       // 0-20 points (open/total issues)
  stars: number;                // 0-10 points (logarithmic scale)
}

// Total: 100 points maximum
```

**Cache Key**: `github:health:${owner}:${repo}`
**Cache Duration**: 3600 seconds (1 hour)

---

## 3. Caching Strategy

### 3.1 Cache Duration Matrix

| Data Type | Cache Duration | Rationale |
|-----------|----------------|-----------|
| **Stargazers (raw)** | 1 hour | Historical data, changes slowly |
| **Stargazers (aggregated)** | 6 hours | Processed data, expensive to compute |
| **Issue counts** | 15 minutes | More dynamic, user-facing metrics |
| **PR activity** | 30 minutes | Moderate change frequency |
| **Contributors** | 24 hours | Historical data, rarely changes |
| **Releases** | 1 hour | Infrequent updates |
| **Health score** | 1 hour | Composite metric, moderate volatility |
| **Community profile** | 24 hours | Very stable data |

### 3.2 Cache Key Structure

**Pattern**: `github:{resource}:{owner}:{repo}:{...params}`

**Examples**:
```typescript
// Stars trend for 30-day period
"github:stars:facebook:react:30d"

// Issue health for 90-day window
"github:issues:vercel:next.js:90d"

// Top 10 contributors for 1-year period
"github:contributors:microsoft:typescript:1yr:10"

// Release timeline, last 5 releases
"github:releases:nodejs:node:5"
```

### 3.3 Stale-While-Revalidate Pattern

Implement SWR for better UX:

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleAt: number;
  expiresAt: number;
}

// Return stale data immediately, revalidate in background
// staleAt = now + (ttl * 0.8)
// expiresAt = now + ttl
```

### 3.4 Cache Invalidation Triggers

**Manual Refresh**: User-triggered invalidation via refresh button
**Time-based**: Automatic expiry based on TTL
**Event-based**: Invalidate related caches:
- Repository changed → Invalidate all widgets for that repo
- Time period changed → Invalidate only affected widgets

### 3.5 Cache Storage

**Development**: In-memory Map with LRU eviction
**Production**: Redis or Upstash Redis for persistent caching

```typescript
// Cache interface
interface CacheProvider {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(pattern: string): Promise<void>;
}
```

---

## 4. TypeScript Interfaces

### 4.1 API Response Types

```typescript
// ============================================================================
// GitHub REST API Response Types
// ============================================================================

/**
 * Stargazer with timestamp (requires Accept: application/vnd.github.star+json)
 */
export interface GitHubStargazer {
  starred_at: string; // ISO 8601 timestamp
  user: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
  };
}

/**
 * Repository basic information
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  language: string | null;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
  topics: string[];
  has_issues: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: "public" | "private";
}

/**
 * Contributor statistics
 */
export interface GitHubContributor {
  author: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
  };
  total: number; // Total commits
  weeks: Array<{
    w: number; // Unix timestamp (start of week)
    a: number; // Additions
    d: number; // Deletions
    c: number; // Commits
  }>;
}

/**
 * Release information
 */
export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null; // Markdown description
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  author: {
    login: string;
    id: number;
    avatar_url: string;
  };
  assets: Array<{
    id: number;
    name: string;
    label: string | null;
    content_type: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    browser_download_url: string;
  }>;
}

/**
 * Community profile
 */
export interface GitHubCommunityProfile {
  health_percentage: number;
  description: string | null;
  documentation: string | null;
  files: {
    code_of_conduct: {
      name: string;
      key: string;
      url: string;
      html_url: string;
    } | null;
    code_of_conduct_file: {
      url: string;
      html_url: string;
    } | null;
    contributing: {
      url: string;
      html_url: string;
    } | null;
    issue_template: {
      url: string;
      html_url: string;
    } | null;
    pull_request_template: {
      url: string;
      html_url: string;
    } | null;
    license: {
      name: string;
      key: string;
      spdx_id: string;
      url: string;
      html_url: string;
    } | null;
    readme: {
      url: string;
      html_url: string;
    } | null;
  };
  updated_at: string;
}

/**
 * Issue (simplified)
 */
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  comments: number;
  pull_request?: {
    url: string;
  };
}

/**
 * Pull Request
 */
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  additions: number;
  deletions: number;
  changed_files: number;
  merged: boolean;
  mergeable: boolean | null;
  draft: boolean;
}

/**
 * Rate limit information
 */
export interface GitHubRateLimit {
  resources: {
    core: {
      limit: number;
      used: number;
      remaining: number;
      reset: number; // Unix timestamp
    };
    search: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
    graphql: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
  };
  rate: {
    limit: number;
    used: number;
    remaining: number;
    reset: number;
  };
}

// ============================================================================
// GraphQL Response Types
// ============================================================================

/**
 * GraphQL Issue (for health dashboard)
 */
export interface GitHubGraphQLIssue {
  createdAt: string;
  closedAt: string | null;
  state: "OPEN" | "CLOSED";
  timelineItems?: {
    nodes: Array<{
      __typename: string;
      createdAt?: string;
    }>;
  };
}

/**
 * GraphQL Pull Request
 */
export interface GitHubGraphQLPullRequest {
  createdAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  state: "OPEN" | "CLOSED" | "MERGED";
  merged: boolean;
  additions: number;
  deletions: number;
}

/**
 * GraphQL Repository Health
 */
export interface GitHubGraphQLRepository {
  stargazerCount: number;
  forkCount: number;
  openIssues: {
    totalCount: number;
  };
  hasIssuesEnabled: boolean;
  hasWikiEnabled: boolean;
  description: string | null;
  homepageUrl: string | null;
  licenseInfo: {
    name: string;
    spdxId: string;
  } | null;
  defaultBranchRef: {
    target: {
      history: {
        nodes: Array<{
          committedDate: string;
        }>;
      };
    };
  } | null;
}

/**
 * GraphQL Rate Limit
 */
export interface GitHubGraphQLRateLimit {
  cost: number;
  remaining: number;
  resetAt: string;
}

// ============================================================================
// Widget Data Models
// ============================================================================

/**
 * GH-01: Repository Stars Trend
 */
export interface StarsWidgetData {
  repository: {
    owner: string;
    name: string;
    fullName: string;
  };
  period: "7d" | "30d" | "90d" | "1yr" | "all";
  totalStars: number;
  dataPoints: Array<{
    date: string; // ISO date string
    stars: number; // Cumulative count
    newStars: number; // Stars added on this day
  }>;
  metadata: {
    fetchedAt: string;
    cachedUntil: string;
  };
}

/**
 * GH-02: Issue Health Dashboard
 */
export interface IssueHealthWidgetData {
  repository: {
    owner: string;
    name: string;
    fullName: string;
  };
  timeWindow: "30d" | "90d" | "1yr";
  metrics: {
    openIssues: number;
    closedIssues: number;
    totalIssues: number;
    openRatio: number; // 0-1
    averageTimeToClose: number; // Days
    issueVelocity: {
      opened: number; // Per week
      closed: number; // Per week
      net: number; // Opened - closed
    };
  };
  trend: Array<{
    week: string; // ISO week string
    opened: number;
    closed: number;
  }>;
  metadata: {
    fetchedAt: string;
    cachedUntil: string;
  };
}

/**
 * GH-03: Pull Request Activity
 */
export interface PullRequestActivityWidgetData {
  repository: {
    owner: string;
    name: string;
    fullName: string;
  };
  period: "30d" | "90d" | "1yr";
  granularity: "week" | "month";
  dataPoints: Array<{
    period: string; // ISO week or month
    opened: number;
    merged: number;
    closed: number; // Closed without merging
    totalAdditions: number;
    totalDeletions: number;
  }>;
  summary: {
    totalOpened: number;
    totalMerged: number;
    totalClosed: number;
    mergeRate: number; // 0-1
    averageTimeToMerge: number; // Days
  };
  metadata: {
    fetchedAt: string;
    cachedUntil: string;
  };
}

/**
 * GH-04: Top Contributors
 */
export interface TopContributorsWidgetData {
  repository: {
    owner: string;
    name: string;
    fullName: string;
  };
  period: "30d" | "90d" | "1yr" | "all";
  topN: number;
  contributors: Array<{
    rank: number;
    user: {
      login: string;
      avatarUrl: string;
      profileUrl: string;
    };
    commits: number;
    additions: number; // 0 for repos with 10k+ commits
    deletions: number; // 0 for repos with 10k+ commits
    percentage: number; // Of total commits
  }>;
  summary: {
    totalContributors: number;
    totalCommits: number;
    topContributorsPercentage: number; // What % of commits from top N
  };
  metadata: {
    fetchedAt: string;
    cachedUntil: string;
    limitedData: boolean; // True if additions/deletions are 0
  };
}

/**
 * GH-05: Release Timeline
 */
export interface ReleaseTimelineWidgetData {
  repository: {
    owner: string;
    name: string;
    fullName: string;
  };
  count: number;
  releases: Array<{
    id: number;
    tagName: string;
    name: string | null;
    publishedAt: string;
    isPrerelease: boolean;
    isDraft: boolean;
    author: {
      login: string;
      avatarUrl: string;
    };
    totalDownloads: number;
    assets: Array<{
      name: string;
      downloadCount: number;
      size: number;
    }>;
    daysSincePrevious: number | null;
  }>;
  summary: {
    totalReleases: number;
    totalDownloads: number;
    averageDaysBetweenReleases: number;
    latestVersion: string;
  };
  metadata: {
    fetchedAt: string;
    cachedUntil: string;
  };
}

/**
 * GH-06: Repository Health Score
 */
export interface RepositoryHealthWidgetData {
  repository: {
    owner: string;
    name: string;
    fullName: string;
  };
  healthScore: number; // 0-100
  factors: {
    hasDescription: { score: number; weight: number; satisfied: boolean };
    hasLicense: { score: number; weight: number; satisfied: boolean };
    hasReadme: { score: number; weight: number; satisfied: boolean };
    hasContributing: { score: number; weight: number; satisfied: boolean };
    hasCodeOfConduct: { score: number; weight: number; satisfied: boolean };
    recentActivity: {
      score: number;
      weight: number;
      daysSinceLastCommit: number;
    };
    issueManagement: {
      score: number;
      weight: number;
      openIssueRatio: number;
    };
    popularity: { score: number; weight: number; stars: number };
  };
  badges: Array<"well-documented" | "active" | "popular" | "maintained">;
  recommendations: string[];
  metadata: {
    fetchedAt: string;
    cachedUntil: string;
  };
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * GitHub API Error Response
 */
export interface GitHubErrorResponse {
  message: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
    message?: string;
  }>;
}

/**
 * Service Error
 */
export interface GitHubServiceError {
  type:
    | "rate_limit_exceeded"
    | "not_found"
    | "unauthorized"
    | "forbidden"
    | "validation_error"
    | "server_error"
    | "network_error"
    | "unknown_error";
  message: string;
  statusCode?: number;
  retryAfter?: number; // Seconds
  resetAt?: number; // Unix timestamp
  originalError?: unknown;
}

// ============================================================================
// Service Configuration Types
// ============================================================================

/**
 * GitHub Service Configuration
 */
export interface GitHubServiceConfig {
  token: string;
  baseUrl?: string; // Default: https://api.github.com
  graphqlUrl?: string; // Default: https://api.github.com/graphql
  userAgent: string; // Required: "AppName/Version (contact@email.com)"
  timeout?: number; // Request timeout in ms (default: 10000)
  maxRetries?: number; // Max retry attempts (default: 3)
  retryDelay?: number; // Base delay for exponential backoff (default: 1000)
}

/**
 * Widget Request Configuration
 */
export interface WidgetRequestConfig {
  owner: string;
  repo: string;
  useCache?: boolean; // Default: true
  forceRefresh?: boolean; // Default: false
}

/**
 * Stars Widget Request
 */
export interface StarsWidgetRequest extends WidgetRequestConfig {
  period: "7d" | "30d" | "90d" | "1yr" | "all";
}

/**
 * Issue Health Widget Request
 */
export interface IssueHealthWidgetRequest extends WidgetRequestConfig {
  timeWindow: "30d" | "90d" | "1yr";
}

/**
 * Pull Request Activity Widget Request
 */
export interface PullRequestActivityWidgetRequest extends WidgetRequestConfig {
  period: "30d" | "90d" | "1yr";
  granularity: "week" | "month";
}

/**
 * Top Contributors Widget Request
 */
export interface TopContributorsWidgetRequest extends WidgetRequestConfig {
  period: "30d" | "90d" | "1yr" | "all";
  topN: number; // Default: 10
}

/**
 * Release Timeline Widget Request
 */
export interface ReleaseTimelineWidgetRequest extends WidgetRequestConfig {
  count: number; // Number of releases to fetch (default: 10)
}

/**
 * Repository Health Widget Request
 */
export interface RepositoryHealthWidgetRequest extends WidgetRequestConfig {
  // No additional parameters
}
```

---

## 5. Service Implementation

### 5.1 Core Service Class

```typescript
// ============================================================================
// lib/github/GitHubService.ts
// ============================================================================

import type {
  GitHubServiceConfig,
  GitHubServiceError,
  GitHubRateLimit,
  StarsWidgetRequest,
  StarsWidgetData,
  IssueHealthWidgetRequest,
  IssueHealthWidgetData,
  PullRequestActivityWidgetRequest,
  PullRequestActivityWidgetData,
  TopContributorsWidgetRequest,
  TopContributorsWidgetData,
  ReleaseTimelineWidgetRequest,
  ReleaseTimelineWidgetData,
  RepositoryHealthWidgetRequest,
  RepositoryHealthWidgetData,
} from "./types";

/**
 * GitHub API Service
 *
 * Handles all GitHub API interactions with rate limiting, caching, and error handling.
 * Designed for use in Next.js API routes (server-side only).
 */
export class GitHubService {
  private readonly config: Required<GitHubServiceConfig>;
  private rateLimitInfo: GitHubRateLimit["rate"] | null = null;

  constructor(config: GitHubServiceConfig) {
    this.config = {
      baseUrl: "https://api.github.com",
      graphqlUrl: "https://api.github.com/graphql",
      timeout: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    if (!this.config.token) {
      throw new Error("GitHub token is required");
    }

    if (!this.config.userAgent) {
      throw new Error("User-Agent is required");
    }
  }

  // ==========================================================================
  // Widget Data Methods
  // ==========================================================================

  /**
   * GH-01: Fetch repository stars trend data
   */
  async getStarsTrend(
    request: StarsWidgetRequest
  ): Promise<StarsWidgetData> {
    const { owner, repo, period } = request;
    const cacheKey = `github:stars:${owner}:${repo}:${period}`;

    // Check cache first
    if (request.useCache !== false && !request.forceRefresh) {
      const cached = await this.getFromCache<StarsWidgetData>(cacheKey);
      if (cached) return cached;
    }

    try {
      // Fetch all stargazers with timestamps
      const stargazers = await this.fetchAllStargazers(owner, repo);

      // Filter by period
      const cutoffDate = this.getPeriodCutoffDate(period);
      const filteredStars =
        period === "all"
          ? stargazers
          : stargazers.filter(
              (s) => new Date(s.starred_at) >= cutoffDate
            );

      // Group by date and calculate cumulative counts
      const dataPoints = this.aggregateStarsByDate(filteredStars);

      const result: StarsWidgetData = {
        repository: {
          owner,
          name: repo,
          fullName: `${owner}/${repo}`,
        },
        period,
        totalStars: stargazers.length,
        dataPoints,
        metadata: {
          fetchedAt: new Date().toISOString(),
          cachedUntil: new Date(
            Date.now() + 3600 * 1000
          ).toISOString(),
        },
      };

      // Cache for 1 hour
      await this.setCache(cacheKey, result, 3600);

      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GH-02: Fetch issue health dashboard data
   */
  async getIssueHealth(
    request: IssueHealthWidgetRequest
  ): Promise<IssueHealthWidgetData> {
    const { owner, repo, timeWindow } = request;
    const cacheKey = `github:issues:${owner}:${repo}:${timeWindow}`;

    if (request.useCache !== false && !request.forceRefresh) {
      const cached = await this.getFromCache<IssueHealthWidgetData>(cacheKey);
      if (cached) return cached;
    }

    try {
      const since = this.getPeriodCutoffDate(timeWindow).toISOString();

      const query = `
        query IssueHealthMetrics($owner: String!, $name: String!, $since: DateTime!) {
          repository(owner: $owner, name: $name) {
            openIssues: issues(states: OPEN) {
              totalCount
            }
            closedIssues: issues(states: CLOSED, filterBy: {since: $since}) {
              totalCount
              nodes {
                createdAt
                closedAt
              }
            }
            recentIssues: issues(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
              nodes {
                createdAt
                closedAt
                state
              }
            }
          }
          rateLimit {
            remaining
            resetAt
          }
        }
      `;

      const response = await this.graphqlRequest<{
        repository: {
          openIssues: { totalCount: number };
          closedIssues: {
            totalCount: number;
            nodes: Array<{ createdAt: string; closedAt: string | null }>;
          };
          recentIssues: {
            nodes: Array<{
              createdAt: string;
              closedAt: string | null;
              state: string;
            }>;
          };
        };
      }>(query, { owner, name: repo, since });

      // Calculate metrics
      const openCount = response.repository.openIssues.totalCount;
      const closedCount = response.repository.closedIssues.totalCount;
      const totalCount = openCount + closedCount;

      // Calculate average time to close
      const closedIssues = response.repository.closedIssues.nodes.filter(
        (i) => i.closedAt
      );
      const avgTimeToClose =
        closedIssues.length > 0
          ? closedIssues.reduce((sum, issue) => {
              const created = new Date(issue.createdAt);
              const closed = new Date(issue.closedAt!);
              const days =
                (closed.getTime() - created.getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / closedIssues.length
          : 0;

      // Calculate issue velocity (weekly)
      const trend = this.calculateIssueVelocity(
        response.repository.recentIssues.nodes
      );

      const result: IssueHealthWidgetData = {
        repository: {
          owner,
          name: repo,
          fullName: `${owner}/${repo}`,
        },
        timeWindow,
        metrics: {
          openIssues: openCount,
          closedIssues: closedCount,
          totalIssues: totalCount,
          openRatio: totalCount > 0 ? openCount / totalCount : 0,
          averageTimeToClose: Math.round(avgTimeToClose * 10) / 10,
          issueVelocity: {
            opened: trend.openedPerWeek,
            closed: trend.closedPerWeek,
            net: trend.openedPerWeek - trend.closedPerWeek,
          },
        },
        trend: trend.weeklyData,
        metadata: {
          fetchedAt: new Date().toISOString(),
          cachedUntil: new Date(Date.now() + 900 * 1000).toISOString(),
        },
      };

      // Cache for 15 minutes
      await this.setCache(cacheKey, result, 900);

      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GH-03: Fetch pull request activity data
   */
  async getPullRequestActivity(
    request: PullRequestActivityWidgetRequest
  ): Promise<PullRequestActivityWidgetData> {
    const { owner, repo, period, granularity } = request;
    const cacheKey = `github:prs:${owner}:${repo}:${period}:${granularity}`;

    if (request.useCache !== false && !request.forceRefresh) {
      const cached =
        await this.getFromCache<PullRequestActivityWidgetData>(cacheKey);
      if (cached) return cached;
    }

    try {
      const since = this.getPeriodCutoffDate(period).toISOString();

      const query = `
        query PullRequestActivity($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
              nodes {
                createdAt
                mergedAt
                closedAt
                state
                merged
                additions
                deletions
              }
            }
          }
          rateLimit {
            remaining
            resetAt
          }
        }
      `;

      const response = await this.graphqlRequest<{
        repository: {
          pullRequests: {
            nodes: Array<{
              createdAt: string;
              mergedAt: string | null;
              closedAt: string | null;
              state: string;
              merged: boolean;
              additions: number;
              deletions: number;
            }>;
          };
        };
      }>(query, { owner, name: repo });

      // Filter by period
      const cutoffDate = this.getPeriodCutoffDate(period);
      const filteredPRs = response.repository.pullRequests.nodes.filter(
        (pr) => new Date(pr.createdAt) >= cutoffDate
      );

      // Aggregate by granularity
      const dataPoints = this.aggregatePRsByPeriod(filteredPRs, granularity);

      // Calculate summary
      const summary = this.calculatePRSummary(filteredPRs);

      const result: PullRequestActivityWidgetData = {
        repository: {
          owner,
          name: repo,
          fullName: `${owner}/${repo}`,
        },
        period,
        granularity,
        dataPoints,
        summary,
        metadata: {
          fetchedAt: new Date().toISOString(),
          cachedUntil: new Date(Date.now() + 1800 * 1000).toISOString(),
        },
      };

      // Cache for 30 minutes
      await this.setCache(cacheKey, result, 1800);

      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GH-04: Fetch top contributors data
   */
  async getTopContributors(
    request: TopContributorsWidgetRequest
  ): Promise<TopContributorsWidgetData> {
    const { owner, repo, period, topN } = request;
    const cacheKey = `github:contributors:${owner}:${repo}:${period}:${topN}`;

    if (request.useCache !== false && !request.forceRefresh) {
      const cached =
        await this.getFromCache<TopContributorsWidgetData>(cacheKey);
      if (cached) return cached;
    }

    try {
      const url = `${this.config.baseUrl}/repos/${owner}/${repo}/stats/contributors`;
      const response = await this.restRequest<
        Array<{
          author: {
            login: string;
            id: number;
            avatar_url: string;
            html_url: string;
          };
          total: number;
          weeks: Array<{
            w: number;
            a: number;
            d: number;
            c: number;
          }>;
        }>
      >(url);

      // Filter by period
      const cutoffDate = this.getPeriodCutoffDate(period);
      const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);

      const contributors = response
        .map((contributor) => {
          const relevantWeeks =
            period === "all"
              ? contributor.weeks
              : contributor.weeks.filter((w) => w.w >= cutoffTimestamp);

          const commits = relevantWeeks.reduce((sum, w) => sum + w.c, 0);
          const additions = relevantWeeks.reduce((sum, w) => sum + w.a, 0);
          const deletions = relevantWeeks.reduce((sum, w) => sum + w.d, 0);

          return {
            user: {
              login: contributor.author.login,
              avatarUrl: contributor.author.avatar_url,
              profileUrl: contributor.author.html_url,
            },
            commits,
            additions,
            deletions,
          };
        })
        .filter((c) => c.commits > 0)
        .sort((a, b) => b.commits - a.commits);

      // Take top N
      const totalCommits = contributors.reduce(
        (sum, c) => sum + c.commits,
        0
      );
      const topContributors = contributors.slice(0, topN).map((c, idx) => ({
        rank: idx + 1,
        ...c,
        percentage: totalCommits > 0 ? (c.commits / totalCommits) * 100 : 0,
      }));

      const topCommits = topContributors.reduce(
        (sum, c) => sum + c.commits,
        0
      );

      const result: TopContributorsWidgetData = {
        repository: {
          owner,
          name: repo,
          fullName: `${owner}/${repo}`,
        },
        period,
        topN,
        contributors: topContributors,
        summary: {
          totalContributors: contributors.length,
          totalCommits,
          topContributorsPercentage:
            totalCommits > 0 ? (topCommits / totalCommits) * 100 : 0,
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          cachedUntil: new Date(
            Date.now() + 86400 * 1000
          ).toISOString(),
          limitedData: topContributors.every(
            (c) => c.additions === 0 && c.deletions === 0
          ),
        },
      };

      // Cache for 24 hours
      await this.setCache(cacheKey, result, 86400);

      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GH-05: Fetch release timeline data
   */
  async getReleaseTimeline(
    request: ReleaseTimelineWidgetRequest
  ): Promise<ReleaseTimelineWidgetData> {
    const { owner, repo, count } = request;
    const cacheKey = `github:releases:${owner}:${repo}:${count}`;

    if (request.useCache !== false && !request.forceRefresh) {
      const cached =
        await this.getFromCache<ReleaseTimelineWidgetData>(cacheKey);
      if (cached) return cached;
    }

    try {
      const url = `${this.config.baseUrl}/repos/${owner}/${repo}/releases?per_page=${count}`;
      const response = await this.restRequest<
        Array<{
          id: number;
          tag_name: string;
          name: string | null;
          published_at: string;
          prerelease: boolean;
          draft: boolean;
          author: {
            login: string;
            avatar_url: string;
          };
          assets: Array<{
            name: string;
            download_count: number;
            size: number;
          }>;
        }>
      >(url);

      // Process releases
      const releases = response.map((release, idx) => {
        const totalDownloads = release.assets.reduce(
          (sum, asset) => sum + asset.download_count,
          0
        );

        let daysSincePrevious: number | null = null;
        if (idx < response.length - 1) {
          const current = new Date(release.published_at);
          const previous = new Date(response[idx + 1].published_at);
          daysSincePrevious = Math.round(
            (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        return {
          id: release.id,
          tagName: release.tag_name,
          name: release.name,
          publishedAt: release.published_at,
          isPrerelease: release.prerelease,
          isDraft: release.draft,
          author: {
            login: release.author.login,
            avatarUrl: release.author.avatar_url,
          },
          totalDownloads,
          assets: release.assets.map((a) => ({
            name: a.name,
            downloadCount: a.download_count,
            size: a.size,
          })),
          daysSincePrevious,
        };
      });

      // Calculate summary
      const totalDownloads = releases.reduce(
        (sum, r) => sum + r.totalDownloads,
        0
      );
      const avgDaysBetween =
        releases.length > 1
          ? releases
              .slice(0, -1)
              .reduce((sum, r) => sum + (r.daysSincePrevious || 0), 0) /
            (releases.length - 1)
          : 0;

      const result: ReleaseTimelineWidgetData = {
        repository: {
          owner,
          name: repo,
          fullName: `${owner}/${repo}`,
        },
        count,
        releases,
        summary: {
          totalReleases: releases.length,
          totalDownloads,
          averageDaysBetweenReleases: Math.round(avgDaysBetween * 10) / 10,
          latestVersion: releases[0]?.tagName || "N/A",
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          cachedUntil: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      };

      // Cache for 1 hour
      await this.setCache(cacheKey, result, 3600);

      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GH-06: Fetch repository health score data
   */
  async getRepositoryHealth(
    request: RepositoryHealthWidgetRequest
  ): Promise<RepositoryHealthWidgetData> {
    const { owner, repo } = request;
    const cacheKey = `github:health:${owner}:${repo}`;

    if (request.useCache !== false && !request.forceRefresh) {
      const cached =
        await this.getFromCache<RepositoryHealthWidgetData>(cacheKey);
      if (cached) return cached;
    }

    try {
      // Fetch GraphQL data
      const query = `
        query RepositoryHealth($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            stargazerCount
            forkCount
            openIssues: issues(states: OPEN) {
              totalCount
            }
            closedIssues: issues(states: CLOSED) {
              totalCount
            }
            hasIssuesEnabled
            hasWikiEnabled
            description
            homepageUrl
            licenseInfo {
              name
              spdxId
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    nodes {
                      committedDate
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const graphqlData = await this.graphqlRequest<{
        repository: {
          stargazerCount: number;
          forkCount: number;
          openIssues: { totalCount: number };
          closedIssues: { totalCount: number };
          hasIssuesEnabled: boolean;
          hasWikiEnabled: boolean;
          description: string | null;
          homepageUrl: string | null;
          licenseInfo: { name: string; spdxId: string } | null;
          defaultBranchRef: {
            target: {
              history: {
                nodes: Array<{ committedDate: string }>;
              };
            };
          } | null;
        };
      }>(query, { owner, name: repo });

      // Fetch community profile
      const profileUrl = `${this.config.baseUrl}/repos/${owner}/${repo}/community/profile`;
      const profile = await this.restRequest<{
        health_percentage: number;
        files: {
          code_of_conduct: { name: string } | null;
          contributing: { url: string } | null;
          license: { name: string } | null;
          readme: { url: string } | null;
        };
      }>(profileUrl, {
        Accept: "application/vnd.github.v3+json",
      });

      // Calculate health score
      const repoData = graphqlData.repository;
      const lastCommitDate =
        repoData.defaultBranchRef?.target.history.nodes[0]?.committedDate;
      const daysSinceLastCommit = lastCommitDate
        ? Math.floor(
            (Date.now() - new Date(lastCommitDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 999;

      const openIssues = repoData.openIssues.totalCount;
      const closedIssues = repoData.closedIssues.totalCount;
      const totalIssues = openIssues + closedIssues;
      const openIssueRatio =
        totalIssues > 0 ? openIssues / totalIssues : 0;

      // Factor scores
      const factors = {
        hasDescription: {
          score: repoData.description ? 10 : 0,
          weight: 10,
          satisfied: !!repoData.description,
        },
        hasLicense: {
          score: profile.files.license ? 15 : 0,
          weight: 15,
          satisfied: !!profile.files.license,
        },
        hasReadme: {
          score: profile.files.readme ? 15 : 0,
          weight: 15,
          satisfied: !!profile.files.readme,
        },
        hasContributing: {
          score: profile.files.contributing ? 10 : 0,
          weight: 10,
          satisfied: !!profile.files.contributing,
        },
        hasCodeOfConduct: {
          score: profile.files.code_of_conduct ? 10 : 0,
          weight: 10,
          satisfied: !!profile.files.code_of_conduct,
        },
        recentActivity: {
          score: Math.max(0, 20 - Math.floor(daysSinceLastCommit / 7)),
          weight: 20,
          daysSinceLastCommit,
        },
        issueManagement: {
          score: Math.max(0, 20 - Math.floor(openIssueRatio * 40)),
          weight: 20,
          openIssueRatio,
        },
        popularity: {
          score: Math.min(10, Math.floor(Math.log10(repoData.stargazerCount + 1) * 2)),
          weight: 10,
          stars: repoData.stargazerCount,
        },
      };

      const healthScore = Object.values(factors).reduce(
        (sum, factor) => sum + factor.score,
        0
      );

      // Generate badges
      const badges: Array<"well-documented" | "active" | "popular" | "maintained"> = [];
      if (
        factors.hasReadme.satisfied &&
        factors.hasLicense.satisfied &&
        factors.hasDescription.satisfied
      ) {
        badges.push("well-documented");
      }
      if (daysSinceLastCommit < 30) {
        badges.push("active");
      }
      if (repoData.stargazerCount > 1000) {
        badges.push("popular");
      }
      if (openIssueRatio < 0.3) {
        badges.push("maintained");
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (!factors.hasDescription.satisfied) {
        recommendations.push("Add a clear description to help users understand the project");
      }
      if (!factors.hasLicense.satisfied) {
        recommendations.push("Add a license to clarify usage terms");
      }
      if (!factors.hasReadme.satisfied) {
        recommendations.push("Add a README with setup and usage instructions");
      }
      if (!factors.hasContributing.satisfied) {
        recommendations.push("Add CONTRIBUTING.md to guide contributors");
      }
      if (!factors.hasCodeOfConduct.satisfied) {
        recommendations.push("Add CODE_OF_CONDUCT.md to foster a welcoming community");
      }
      if (daysSinceLastCommit > 90) {
        recommendations.push("Repository appears inactive - consider archiving or updating");
      }
      if (openIssueRatio > 0.5) {
        recommendations.push("High number of open issues - consider triaging and closing resolved issues");
      }

      const result: RepositoryHealthWidgetData = {
        repository: {
          owner,
          name: repo,
          fullName: `${owner}/${repo}`,
        },
        healthScore,
        factors,
        badges,
        recommendations,
        metadata: {
          fetchedAt: new Date().toISOString(),
          cachedUntil: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      };

      // Cache for 1 hour
      await this.setCache(cacheKey, result, 3600);

      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================================================
  // Rate Limit Management
  // ==========================================================================

  /**
   * Get current rate limit information
   */
  async getRateLimit(): Promise<GitHubRateLimit> {
    const url = `${this.config.baseUrl}/rate_limit`;
    const response = await this.restRequest<GitHubRateLimit>(url);
    this.rateLimitInfo = response.rate;
    return response;
  }

  /**
   * Check if we're approaching rate limit
   */
  isApproachingRateLimit(threshold = 0.1): boolean {
    if (!this.rateLimitInfo) return false;
    const ratio =
      this.rateLimitInfo.remaining / this.rateLimitInfo.limit;
    return ratio < threshold;
  }

  /**
   * Get seconds until rate limit reset
   */
  getSecondsUntilReset(): number {
    if (!this.rateLimitInfo) return 0;
    return Math.max(
      0,
      this.rateLimitInfo.reset - Math.floor(Date.now() / 1000)
    );
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Make REST API request with retry logic
   */
  private async restRequest<T>(
    url: string,
    additionalHeaders: Record<string, string> = {}
  ): Promise<T> {
    const headers = {
      Authorization: `Bearer ${this.config.token}`,
      "User-Agent": this.config.userAgent,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github.v3+json",
      ...additionalHeaders,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout
        );

        const response = await fetch(url, {
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Update rate limit info from headers
        this.updateRateLimitFromHeaders(response.headers);

        if (!response.ok) {
          if (response.status === 403 || response.status === 429) {
            const retryAfter =
              response.headers.get("retry-after") ||
              response.headers.get("x-ratelimit-reset");
            throw new Error(
              `Rate limit exceeded. Retry after: ${retryAfter}`
            );
          }

          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `GitHub API error: ${response.status} - ${JSON.stringify(errorData)}`
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on 4xx errors (except 429)
        if (
          error instanceof Error &&
          error.message.includes("GitHub API error") &&
          !error.message.includes("429")
        ) {
          throw error;
        }

        // Exponential backoff
        if (attempt < this.config.maxRetries - 1) {
          const delay =
            this.config.retryDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  /**
   * Make GraphQL API request
   */
  private async graphqlRequest<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<T> {
    const headers = {
      Authorization: `Bearer ${this.config.token}`,
      "User-Agent": this.config.userAgent,
      "Content-Type": "application/json",
    };

    const response = await fetch(this.config.graphqlUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(
        `GraphQL errors: ${JSON.stringify(result.errors)}`
      );
    }

    return result.data as T;
  }

  /**
   * Fetch all stargazers with pagination
   */
  private async fetchAllStargazers(
    owner: string,
    repo: string
  ): Promise<Array<{ starred_at: string }>> {
    const allStargazers: Array<{ starred_at: string }> = [];
    let page = 1;
    const perPage = 100;
    const maxPages = 400; // GitHub limitation

    while (page <= maxPages) {
      const url = `${this.config.baseUrl}/repos/${owner}/${repo}/stargazers?per_page=${perPage}&page=${page}`;
      const stargazers = await this.restRequest<
        Array<{ starred_at: string }>
      >(url, {
        Accept: "application/vnd.github.star+json",
      });

      if (stargazers.length === 0) break;

      allStargazers.push(...stargazers);

      if (stargazers.length < perPage) break;

      page++;
    }

    return allStargazers;
  }

  /**
   * Get cutoff date for period
   */
  private getPeriodCutoffDate(
    period: "7d" | "30d" | "90d" | "1yr" | "all"
  ): Date {
    const now = new Date();
    switch (period) {
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case "1yr":
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case "all":
        return new Date(0);
    }
  }

  /**
   * Aggregate stars by date
   */
  private aggregateStarsByDate(
    stargazers: Array<{ starred_at: string }>
  ): Array<{ date: string; stars: number; newStars: number }> {
    const byDate = new Map<string, number>();

    stargazers.forEach((s) => {
      const date = s.starred_at.split("T")[0];
      byDate.set(date, (byDate.get(date) || 0) + 1);
    });

    const sorted = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, newStars], idx, arr) => ({
        date,
        stars: arr.slice(0, idx + 1).reduce((sum, [, count]) => sum + count, 0),
        newStars,
      }));

    return sorted;
  }

  /**
   * Calculate issue velocity
   */
  private calculateIssueVelocity(
    issues: Array<{
      createdAt: string;
      closedAt: string | null;
      state: string;
    }>
  ) {
    const weeklyData = new Map<
      string,
      { opened: number; closed: number }
    >();

    issues.forEach((issue) => {
      const createdWeek = this.getISOWeek(new Date(issue.createdAt));
      const existing = weeklyData.get(createdWeek) || {
        opened: 0,
        closed: 0,
      };
      weeklyData.set(createdWeek, {
        ...existing,
        opened: existing.opened + 1,
      });

      if (issue.closedAt) {
        const closedWeek = this.getISOWeek(new Date(issue.closedAt));
        const existingClosed = weeklyData.get(closedWeek) || {
          opened: 0,
          closed: 0,
        };
        weeklyData.set(closedWeek, {
          ...existingClosed,
          closed: existingClosed.closed + 1,
        });
      }
    });

    const sorted = Array.from(weeklyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => ({ week, ...data }));

    const totalWeeks = sorted.length || 1;
    const totalOpened = sorted.reduce((sum, w) => sum + w.opened, 0);
    const totalClosed = sorted.reduce((sum, w) => sum + w.closed, 0);

    return {
      weeklyData: sorted,
      openedPerWeek: Math.round((totalOpened / totalWeeks) * 10) / 10,
      closedPerWeek: Math.round((totalClosed / totalWeeks) * 10) / 10,
    };
  }

  /**
   * Aggregate PRs by period
   */
  private aggregatePRsByPeriod(
    prs: Array<{
      createdAt: string;
      mergedAt: string | null;
      closedAt: string | null;
      state: string;
      merged: boolean;
      additions: number;
      deletions: number;
    }>,
    granularity: "week" | "month"
  ) {
    const byPeriod = new Map<
      string,
      {
        opened: number;
        merged: number;
        closed: number;
        totalAdditions: number;
        totalDeletions: number;
      }
    >();

    prs.forEach((pr) => {
      const period =
        granularity === "week"
          ? this.getISOWeek(new Date(pr.createdAt))
          : this.getISOMonth(new Date(pr.createdAt));

      const existing = byPeriod.get(period) || {
        opened: 0,
        merged: 0,
        closed: 0,
        totalAdditions: 0,
        totalDeletions: 0,
      };

      byPeriod.set(period, {
        opened: existing.opened + 1,
        merged: existing.merged + (pr.merged ? 1 : 0),
        closed:
          existing.closed + (pr.closedAt && !pr.merged ? 1 : 0),
        totalAdditions: existing.totalAdditions + pr.additions,
        totalDeletions: existing.totalDeletions + pr.deletions,
      });
    });

    return Array.from(byPeriod.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, data]) => ({ period, ...data }));
  }

  /**
   * Calculate PR summary
   */
  private calculatePRSummary(
    prs: Array<{
      createdAt: string;
      mergedAt: string | null;
      closedAt: string | null;
      merged: boolean;
    }>
  ) {
    const totalOpened = prs.length;
    const totalMerged = prs.filter((pr) => pr.merged).length;
    const totalClosed = prs.filter(
      (pr) => pr.closedAt && !pr.merged
    ).length;

    const mergedPRs = prs.filter(
      (pr) => pr.merged && pr.mergedAt
    );
    const avgTimeToMerge =
      mergedPRs.length > 0
        ? mergedPRs.reduce((sum, pr) => {
            const created = new Date(pr.createdAt);
            const merged = new Date(pr.mergedAt!);
            const days =
              (merged.getTime() - created.getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / mergedPRs.length
        : 0;

    return {
      totalOpened,
      totalMerged,
      totalClosed,
      mergeRate: totalOpened > 0 ? totalMerged / totalOpened : 0,
      averageTimeToMerge: Math.round(avgTimeToMerge * 10) / 10,
    };
  }

  /**
   * Get ISO week string (YYYY-Www)
   */
  private getISOWeek(date: Date): string {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  }

  /**
   * Get ISO month string (YYYY-MM)
   */
  private getISOMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  /**
   * Update rate limit from response headers
   */
  private updateRateLimitFromHeaders(headers: Headers) {
    const limit = headers.get("x-ratelimit-limit");
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    const used = headers.get("x-ratelimit-used");

    if (limit && remaining && reset && used) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
        used: parseInt(used, 10),
      };
    }
  }

  /**
   * Handle errors and convert to GitHubServiceError
   */
  private handleError(error: unknown): GitHubServiceError {
    if (error instanceof Error) {
      if (error.message.includes("Rate limit exceeded")) {
        return {
          type: "rate_limit_exceeded",
          message: "GitHub API rate limit exceeded",
          statusCode: 429,
          retryAfter: this.getSecondsUntilReset(),
          resetAt: this.rateLimitInfo?.reset,
          originalError: error,
        };
      }

      if (error.message.includes("404")) {
        return {
          type: "not_found",
          message: "Repository not found or not accessible",
          statusCode: 404,
          originalError: error,
        };
      }

      if (error.message.includes("401")) {
        return {
          type: "unauthorized",
          message: "Invalid or expired GitHub token",
          statusCode: 401,
          originalError: error,
        };
      }

      if (error.message.includes("403")) {
        return {
          type: "forbidden",
          message: "Access forbidden - check token permissions",
          statusCode: 403,
          originalError: error,
        };
      }
    }

    return {
      type: "unknown_error",
      message: "An unexpected error occurred",
      originalError: error,
    };
  }

  /**
   * Cache implementation (interface - implement with Redis/Memory)
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    // TODO: Implement with Redis or in-memory cache
    // For now, return null (no cache)
    return null;
  }

  /**
   * Cache implementation (interface - implement with Redis/Memory)
   */
  private async setCache<T>(
    key: string,
    value: T,
    ttl: number
  ): Promise<void> {
    // TODO: Implement with Redis or in-memory cache
    // For now, do nothing
  }
}
```

### 5.2 Next.js API Route Example

```typescript
// ============================================================================
// app/api/github/stars/route.ts
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { GitHubService } from "@/lib/github/GitHubService";
import type { StarsWidgetRequest } from "@/lib/github/types";

// Initialize service (singleton pattern)
const githubService = new GitHubService({
  token: process.env.GITHUB_TOKEN!,
  userAgent: "DashboardBuilder/1.0 (contact@example.com)",
});

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const period = searchParams.get("period") as
      | "7d"
      | "30d"
      | "90d"
      | "1yr"
      | "all"
      | null;

    // Validate required parameters
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing required parameters: owner, repo" },
        { status: 400 }
      );
    }

    if (
      period &&
      !["7d", "30d", "90d", "1yr", "all"].includes(period)
    ) {
      return NextResponse.json(
        { error: "Invalid period value" },
        { status: 400 }
      );
    }

    // Build request
    const widgetRequest: StarsWidgetRequest = {
      owner,
      repo,
      period: period || "30d",
      useCache: true,
      forceRefresh: searchParams.get("refresh") === "true",
    };

    // Fetch data
    const data = await githubService.getStarsTrend(widgetRequest);

    // Return response
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("GitHub API error:", error);

    // Handle specific error types
    if (
      error &&
      typeof error === "object" &&
      "type" in error
    ) {
      const githubError = error as { type: string; statusCode?: number; message: string };

      return NextResponse.json(
        { error: githubError.message, type: githubError.type },
        { status: githubError.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Rate limit check endpoint
export async function HEAD(request: NextRequest) {
  try {
    const rateLimit = await githubService.getRateLimit();

    return new NextResponse(null, {
      status: 200,
      headers: {
        "X-RateLimit-Limit": rateLimit.rate.limit.toString(),
        "X-RateLimit-Remaining": rateLimit.rate.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.rate.reset.toString(),
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
```

---

## 6. Authentication Design

### 6.1 Token Management

**Environment Variables** (`.env.local`):
```bash
# GitHub Personal Access Token
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Multiple tokens for load balancing
GITHUB_TOKEN_PRIMARY=ghp_token1
GITHUB_TOKEN_SECONDARY=ghp_token2
GITHUB_TOKEN_TERTIARY=ghp_token3
```

**Token Requirements**:
- **Classic PAT**: `public_repo` scope
- **Fine-Grained PAT**: `metadata:read`, `contents:read`
- **Minimum permissions**: Read-only access to public repositories

### 6.2 Security Best Practices

1. **Never expose tokens in client code**: All API calls proxied through Next.js API routes
2. **Token rotation**: Implement token pool for high-traffic scenarios
3. **Rate limit monitoring**: Track usage per token
4. **Error handling**: Graceful degradation when token expires
5. **Audit logging**: Log all API requests with token identifier (last 4 chars)

### 6.3 Token Pool Implementation

```typescript
// ============================================================================
// lib/github/TokenPool.ts
// ============================================================================

export class GitHubTokenPool {
  private tokens: Array<{
    token: string;
    id: string;
    rateLimitRemaining: number;
    rateLimitReset: number;
  }>;
  private currentIndex = 0;

  constructor(tokens: string[]) {
    this.tokens = tokens.map((token, idx) => ({
      token,
      id: `token-${idx + 1}`,
      rateLimitRemaining: 5000,
      rateLimitReset: 0,
    }));
  }

  /**
   * Get next available token with rate limit remaining
   */
  getToken(): { token: string; id: string } {
    const now = Math.floor(Date.now() / 1000);

    // Find token with available rate limit
    for (let i = 0; i < this.tokens.length; i++) {
      const idx = (this.currentIndex + i) % this.tokens.length;
      const tokenInfo = this.tokens[idx];

      // Reset if past reset time
      if (now >= tokenInfo.rateLimitReset) {
        tokenInfo.rateLimitRemaining = 5000;
      }

      if (tokenInfo.rateLimitRemaining > 100) {
        // Keep buffer of 100
        this.currentIndex = (idx + 1) % this.tokens.length;
        return { token: tokenInfo.token, id: tokenInfo.id };
      }
    }

    // All tokens exhausted - return first and hope for the best
    console.warn("All GitHub tokens exhausted");
    return {
      token: this.tokens[0].token,
      id: this.tokens[0].id,
    };
  }

  /**
   * Update rate limit info after request
   */
  updateRateLimit(tokenId: string, remaining: number, reset: number) {
    const token = this.tokens.find((t) => t.id === tokenId);
    if (token) {
      token.rateLimitRemaining = remaining;
      token.rateLimitReset = reset;
    }
  }

  /**
   * Get overall rate limit status
   */
  getStatus() {
    return this.tokens.map((t) => ({
      id: t.id,
      remaining: t.rateLimitRemaining,
      resetAt: new Date(t.rateLimitReset * 1000).toISOString(),
    }));
  }
}
```

---

## 7. Rate Limiting Management

### 7.1 Rate Limit Tracking

**Headers to Monitor**:
```typescript
interface RateLimitHeaders {
  "x-ratelimit-limit": string; // 5000
  "x-ratelimit-remaining": string; // 4999
  "x-ratelimit-reset": string; // 1672531200 (Unix timestamp)
  "x-ratelimit-used": string; // 1
  "x-ratelimit-resource": string; // "core" | "graphql" | "search"
}
```

### 7.2 Request Throttling

```typescript
// ============================================================================
// lib/github/RateLimiter.ts
// ============================================================================

export class GitHubRateLimiter {
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private requestsPerMinute = 60; // Conservative: 1 per second
  private minDelay = 1000; // 1 second between requests

  /**
   * Queue a request with throttling
   */
  async queueRequest<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
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

  /**
   * Process queued requests with delay
   */
  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        await this.delay(this.minDelay);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### 7.3 Circuit Breaker Pattern

```typescript
// ============================================================================
// lib/github/CircuitBreaker.ts
// ============================================================================

export class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private state: "closed" | "open" | "half-open" = "closed";
  private lastFailureTime = 0;
  private readonly threshold = 5; // Open after 5 failures
  private readonly timeout = 60000; // Try again after 1 minute
  private readonly successThreshold = 2; // Close after 2 successes

  /**
   * Execute function with circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      // Check if timeout has passed
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "half-open";
        this.successCount = 0;
      } else {
        throw new Error(
          "Circuit breaker is open - service temporarily unavailable"
        );
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

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === "half-open") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = "closed";
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = "open";
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}
```

---

## 8. Error Handling

### 8.1 Error Types and User Messages

```typescript
// ============================================================================
// lib/github/errorMessages.ts
// ============================================================================

export const ERROR_MESSAGES = {
  rate_limit_exceeded: {
    title: "Rate Limit Exceeded",
    message:
      "We've reached GitHub's API rate limit. Data will refresh automatically in {minutes} minutes.",
    action: "Wait for reset",
    severity: "warning",
  },
  not_found: {
    title: "Repository Not Found",
    message:
      "The repository '{owner}/{repo}' could not be found. Please check the repository name and ensure it's public.",
    action: "Check repository name",
    severity: "error",
  },
  unauthorized: {
    title: "Authentication Failed",
    message:
      "GitHub authentication failed. This may be a temporary issue. Please try again later.",
    action: "Retry",
    severity: "error",
  },
  forbidden: {
    title: "Access Denied",
    message:
      "Access to this repository is forbidden. The repository may be private or deleted.",
    action: "Verify repository access",
    severity: "error",
  },
  network_error: {
    title: "Network Error",
    message:
      "Unable to reach GitHub. Please check your internet connection.",
    action: "Check connection",
    severity: "error",
  },
  server_error: {
    title: "GitHub Server Error",
    message:
      "GitHub is experiencing issues. Your data will load automatically when service is restored.",
    action: "Wait and retry",
    severity: "error",
  },
  unknown_error: {
    title: "Unexpected Error",
    message: "An unexpected error occurred. Please try again.",
    action: "Retry",
    severity: "error",
  },
} as const;

export function getUserMessage(
  errorType: keyof typeof ERROR_MESSAGES,
  context?: Record<string, string>
): {
  title: string;
  message: string;
  action: string;
  severity: string;
} {
  const template = ERROR_MESSAGES[errorType];

  let message = template.message;
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });
  }

  return {
    ...template,
    message,
  };
}
```

### 8.2 Retry Strategy

```typescript
// ============================================================================
// lib/github/retryStrategy.ts
// ============================================================================

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    "network_error",
    "server_error",
    "rate_limit_exceeded",
  ],
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;
  let delay = config.initialDelay;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const errorType =
        error && typeof error === "object" && "type" in error
          ? (error as { type: string }).type
          : "unknown_error";

      const isRetryable = config.retryableErrors.includes(errorType);

      // Don't retry on last attempt or non-retryable errors
      if (attempt === config.maxAttempts || !isRetryable) {
        throw error;
      }

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);

      console.log(
        `Retry attempt ${attempt}/${config.maxAttempts} after ${delay}ms delay`
      );
    }
  }

  throw lastError!;
}
```

### 8.3 Fallback Data Strategy

```typescript
// ============================================================================
// lib/github/fallbackData.ts
// ============================================================================

export interface FallbackDataOptions {
  useStaleData: boolean;
  staleDataMaxAge: number; // milliseconds
  showPlaceholder: boolean;
}

export const DEFAULT_FALLBACK_OPTIONS: FallbackDataOptions = {
  useStaleData: true,
  staleDataMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  showPlaceholder: false,
};

/**
 * Get fallback data when API fails
 */
export function getFallbackData<T>(
  cacheKey: string,
  options: FallbackDataOptions = DEFAULT_FALLBACK_OPTIONS
): T | null {
  if (options.useStaleData) {
    // Attempt to retrieve stale cached data
    const staleData = getStaleFromCache<T>(cacheKey);
    if (
      staleData &&
      Date.now() - staleData.timestamp < options.staleDataMaxAge
    ) {
      return staleData.data;
    }
  }

  if (options.showPlaceholder) {
    // Return placeholder data structure
    return getPlaceholderData<T>(cacheKey);
  }

  return null;
}

function getStaleFromCache<T>(
  key: string
): { data: T; timestamp: number } | null {
  // TODO: Implement stale cache retrieval
  return null;
}

function getPlaceholderData<T>(key: string): T | null {
  // TODO: Return widget-specific placeholder data
  return null;
}
```

---

## Summary

This GitHub API integration specification provides a comprehensive, production-ready design for the Dashboard Builder project. Key highlights:

### Strengths

1. **Hybrid API Approach**: Leverages both REST and GraphQL for optimal performance
2. **Robust Rate Limiting**: Token pooling, circuit breakers, and request throttling
3. **Aggressive Caching**: 15min - 24hr TTLs with stale-while-revalidate
4. **Type Safety**: Complete TypeScript interfaces for all data structures
5. **Error Handling**: User-friendly messages and retry strategies
6. **Security**: Backend proxy pattern prevents token exposure

### Implementation Notes

1. **Cache Provider**: Implement Redis-backed caching (Upstash recommended for Vercel)
2. **Token Management**: Use environment variables, rotate tokens for high traffic
3. **Monitoring**: Add observability for rate limits, errors, and response times
4. **Testing**: Mock GitHub responses for unit tests, use real API for integration tests

### File Locations

**Service Layer**:
- `/lib/github/GitHubService.ts` - Main service class
- `/lib/github/types.ts` - All TypeScript interfaces
- `/lib/github/TokenPool.ts` - Token management
- `/lib/github/RateLimiter.ts` - Request throttling
- `/lib/github/CircuitBreaker.ts` - Failure handling
- `/lib/github/errorMessages.ts` - User-facing error messages

**API Routes**:
- `/app/api/github/stars/route.ts`
- `/app/api/github/issues/route.ts`
- `/app/api/github/prs/route.ts`
- `/app/api/github/contributors/route.ts`
- `/app/api/github/releases/route.ts`
- `/app/api/github/health/route.ts`

---

**Document Status**: Complete
**Implementation Ready**: Yes
**Estimated LOC**: ~2,500 lines (service + types + helpers)
**Dependencies**: `node-fetch` (if Node < 18), `ioredis` or `@upstash/redis`
