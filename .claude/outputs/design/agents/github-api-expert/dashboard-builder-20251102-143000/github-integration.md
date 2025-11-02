# GitHub API Integration Design
## Dashboard Builder Project

**Project**: dashboard-builder
**Timestamp**: 20251102-143000
**Agent**: github-api-expert
**Target**: 6 GitHub widgets with production-ready TypeScript implementation

---

## Table of Contents

1. [API Strategy](#1-api-strategy)
2. [Widget Endpoint Mapping](#2-widget-endpoint-mapping)
3. [Authentication Architecture](#3-authentication-architecture)
4. [Rate Limiting Strategy](#4-rate-limiting-strategy)
5. [Caching Strategy](#5-caching-strategy)
6. [TypeScript Data Models](#6-typescript-data-models)
7. [Service Implementation](#7-service-implementation)
8. [Error Handling](#8-error-handling)
9. [Performance Optimization](#9-performance-optimization)
10. [Security Considerations](#10-security-considerations)

---

## 1. API Strategy

### Chosen Approach: Hybrid REST + GraphQL

**Decision Rationale:**

The dashboard builder requires a hybrid approach combining GitHub REST API v3 and GraphQL API v4 to optimize for both simplicity and efficiency:

**REST API Usage (60% of requests)**
- Simple, single-resource queries (repository overview, releases)
- Well-cached historical data (contributors, languages)
- Paginated lists that don't require complex relationships (issues, pull requests)
- Leverage extensive HTTP caching with ETags

**GraphQL API Usage (40% of requests)**
- Multi-resource queries requiring related data in single request
- Aggregated metrics across multiple repositories
- Reducing request count for dashboard-level operations
- Stargazer timeline with cursor-based pagination

**Why Not Pure GraphQL:**
- REST endpoints like `/repos/{owner}/{repo}/contributors` return pre-aggregated data
- REST `/stats/*` endpoints provide commit statistics not easily accessible in GraphQL
- REST API has broader community documentation for common use cases
- ETags work seamlessly with REST for conditional requests

**Why Not Pure REST:**
- Fetching repository overview + recent issues + PRs requires 3+ REST calls
- GraphQL can batch these into a single query with precise field selection
- GraphQL rateLimit query provides real-time quota visibility
- Stargazer timelines benefit from GraphQL cursor pagination

### API Version Pinning

```typescript
// Use consistent API versions across the application
const GITHUB_API_VERSION = '2022-11-28';
const REST_API_BASE = 'https://api.github.com';
const GRAPHQL_API_ENDPOINT = 'https://api.github.com/graphql';
```

**Headers for all requests:**
```typescript
{
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'DashboardBuilder/1.0 (Next.js; +https://github.com/yourusername/data-dashboard)',
  'Authorization': `Bearer ${token}`
}
```

---

## 2. Widget Endpoint Mapping

### Widget 1: Repository Stars Timeline

**API Approach**: GraphQL
**Rationale**: Stargazers with timeline require cursor pagination; GraphQL provides starredAt timestamps

**GraphQL Query**:
```graphql
query RepositoryStargazers($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    stargazerCount
    stargazers(first: 100, after: $cursor, orderBy: {field: STARRED_AT, direction: ASC}) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        starredAt
      }
    }
  }
  rateLimit {
    remaining
    resetAt
  }
}
```

**Cache Duration**: 1 hour (stars grow slowly)
**Estimated Cost**: 1 point per 100 stargazers (low cost)
**Data Processing**: Aggregate starredAt dates into daily/weekly buckets for chart

---

### Widget 2: Recent Issues List

**API Approach**: REST API
**Endpoint**: `GET /repos/{owner}/{repo}/issues`
**Query Parameters**:
```typescript
{
  state: 'open' | 'closed' | 'all',
  sort: 'created' | 'updated' | 'comments',
  direction: 'desc',
  per_page: 20,
  page: 1
}
```

**Cache Duration**: 10 minutes (issues change frequently)
**Response Headers to Track**:
- `ETag`: For conditional requests
- `X-RateLimit-Remaining`: Monitor quota
- `Link`: Pagination headers

**Data Points Extracted**:
- Issue number, title, state, created_at, updated_at
- User (login, avatar_url)
- Labels (name, color)
- Comments count

---

### Widget 3: Pull Request Activity

**API Approach**: REST API
**Endpoint**: `GET /repos/{owner}/{repo}/pulls`
**Query Parameters**:
```typescript
{
  state: 'open' | 'closed' | 'all',
  sort: 'created' | 'updated' | 'popularity',
  direction: 'desc',
  per_page: 20,
  page: 1
}
```

**Additional Endpoint for Review Count**:
`GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews`

**Cache Duration**: 10 minutes
**Data Points Extracted**:
- PR number, title, state, created_at, merged_at
- User (login, avatar_url)
- Base/head branches
- Review count (requires additional call or GraphQL optimization)
- Mergeable state, draft status

---

### Widget 4: Contributor Ranking

**API Approach**: REST API
**Endpoint**: `GET /repos/{owner}/{repo}/contributors`
**Query Parameters**:
```typescript
{
  anon: '0', // Exclude anonymous contributors
  per_page: 30,
  page: 1
}
```

**Cache Duration**: 24 hours (historical data, changes slowly)
**Data Points Extracted**:
- Login, avatar_url, html_url
- Contributions count (commits)
- Type (User or Bot)

**Note**: This endpoint is computationally expensive for GitHub. Cache aggressively.

---

### Widget 5: Repository Overview Metrics

**API Approach**: Hybrid (GraphQL for initial load, REST for ETags)

**GraphQL Query** (Initial Load):
```graphql
query RepositoryOverview($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    stargazerCount
    forkCount
    watchers {
      totalCount
    }
    issues(states: OPEN) {
      totalCount
    }
    pullRequests(states: OPEN) {
      totalCount
    }
    pushedAt
    createdAt
    updatedAt
    description
    primaryLanguage {
      name
      color
    }
  }
}
```

**REST Endpoint** (Subsequent Loads with ETag):
`GET /repos/{owner}/{repo}`

**Cache Duration**: 30 minutes
**GraphQL Cost**: ~1 point (efficient query)

**Data Points**:
- Stars, forks, watchers
- Open issues count, open PRs count
- Last push date, creation date
- Primary language
- Description

---

### Widget 6: Release Timeline

**API Approach**: REST API
**Endpoint**: `GET /repos/{owner}/{repo}/releases`
**Query Parameters**:
```typescript
{
  per_page: 20,
  page: 1
}
```

**Cache Duration**: 1 hour (releases are infrequent)
**Data Points Extracted**:
- Tag name, name, created_at, published_at
- Author (login, avatar_url)
- Prerelease, draft flags
- Assets (download counts per asset)
- Body (release notes markdown)

**Asset Download Aggregation**:
```typescript
// Sum all asset download counts for total release downloads
release.assets.reduce((sum, asset) => sum + asset.download_count, 0)
```

---

## 3. Authentication Architecture

### Token Management Strategy

**Environment Variables** (Server-side only):
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_APP_ID=123456 # Future: GitHub App integration
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY----- # Future
```

**Security Pattern**: Backend Proxy

All GitHub API requests MUST go through Next.js API routes (Edge Functions on Vercel):

```
Client → Next.js API Route → GitHub API
         (/api/github/*)

Client never has direct access to GITHUB_TOKEN
```

### Next.js API Route Structure

**Proxy Pattern**:
```typescript
// app/api/github/repos/[owner]/[repo]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { owner: string; repo: string } }
) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return Response.json(
      { error: 'GitHub token not configured' },
      { status: 500 }
    );
  }

  // Forward to GitHub with token
  const response = await fetch(
    `https://api.github.com/repos/${params.owner}/${params.repo}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'DashboardBuilder/1.0'
      }
    }
  );

  // Forward response with rate limit headers
  const data = await response.json();
  return Response.json(data, {
    status: response.status,
    headers: {
      'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining') || '',
      'X-RateLimit-Reset': response.headers.get('X-RateLimit-Reset') || '',
      'Cache-Control': 'public, max-age=1800' // 30 minutes
    }
  });
}
```

### Token Types

**Personal Access Token (Classic)** - v1 Implementation:
- Scopes needed: `public_repo` (read public repositories)
- User-scoped, 5,000 requests/hour
- Simple to implement, suitable for MVP

**Fine-Grained PAT** - Future Enhancement:
- Repository-specific permissions
- Minimum privilege principle
- Expiration dates (max 1 year)
- Better for production

**GitHub App** - Enterprise Scale:
- 15,000 requests/hour
- Installation-level authentication
- User attribution for actions
- Requires app setup and webhook handling

---

## 4. Rate Limiting Strategy

### Current Limits (2025)

**Authenticated Requests**:
- 5,000 requests/hour for PAT
- 15,000 requests/hour for GitHub Apps
- Resets at fixed hourly intervals

**GraphQL Queries**:
- 5,000 points/hour
- Simple queries: 1 point
- Complex nested queries: 50-100+ points
- Check `rateLimit` query for real-time status

**Secondary Rate Limits**:
- Content creation: ~80 requests/minute
- Search API: 30 requests/minute (not used in this project)

### Rate Limit Tracking

**Track in Client-Side Context**:
```typescript
interface RateLimitStatus {
  remaining: number;
  limit: number;
  resetAt: Date;
  resource: 'core' | 'graphql' | 'search';
}

// Store in React Context
const RateLimitContext = React.createContext<RateLimitStatus | null>(null);
```

**Update on Every Response**:
```typescript
function parseRateLimitHeaders(headers: Headers): RateLimitStatus {
  return {
    remaining: parseInt(headers.get('X-RateLimit-Remaining') || '0'),
    limit: parseInt(headers.get('X-RateLimit-Limit') || '5000'),
    resetAt: new Date(parseInt(headers.get('X-RateLimit-Reset') || '0') * 1000),
    resource: headers.get('X-RateLimit-Resource') as 'core' || 'core'
  };
}
```

### Quota Management Strategy

**Tiered Caching Based on Data Volatility**:

| Data Type | Cache Duration | Rationale |
|-----------|---------------|-----------|
| Repository basics (stars, forks) | 30 minutes | Changes slowly |
| Contributors list | 24 hours | Historical, expensive query |
| Commit statistics | 24 hours | Historical data |
| Releases | 1 hour | Infrequent events |
| Issues/PRs count | 10 minutes | Changes more frequently |
| Recent issues/PRs list | 10 minutes | Real-time monitoring |
| Stargazer timeline | 1 hour | Append-only data |

**Request Prioritization**:
1. User-initiated actions (high priority, immediate)
2. Visible widgets (normal priority, cached)
3. Background prefetching (low priority, deferred)

**Quota Threshold Alerts**:
- 80% remaining: Normal operation
- 50% remaining: Warn user to reduce refresh rate
- 20% remaining: Pause non-critical requests
- 0% remaining: Show retry timer until reset

---

## 5. Caching Strategy

### Multi-Layer Caching Architecture

**Layer 1: Browser Memory Cache** (React Query / SWR)
- Runtime cache in memory
- Immediate access, no network latency
- Cleared on page refresh
- Use React Query or SWR for automatic cache management

**Layer 2: Browser Storage Cache** (IndexedDB)
- Persistent across sessions
- 50MB+ storage quota
- Structured data with expiration timestamps
- Fallback when offline

**Layer 3: HTTP Cache** (Vercel Edge Network)
- CDN-level caching via `Cache-Control` headers
- Public data only (user-agnostic responses)
- Automatic purging based on TTL

**Layer 4: Conditional Requests** (ETags)
- GitHub returns `ETag` header for responses
- Client sends `If-None-Match` header
- 304 Not Modified response doesn't count against rate limit

### Cache Key Structure

```typescript
type CacheKey = {
  endpoint: string; // e.g., 'repos/owner/repo'
  queryParams?: Record<string, string>; // e.g., { state: 'open', per_page: '20' }
  version: string; // API version to invalidate on API changes
};

function generateCacheKey(key: CacheKey): string {
  const params = key.queryParams
    ? '?' + new URLSearchParams(key.queryParams).toString()
    : '';
  return `gh:${key.version}:${key.endpoint}${params}`;
}

// Example: "gh:2022-11-28:repos/facebook/react?state=open&per_page=20"
```

### Cache Entry Structure

```typescript
interface CacheEntry<T> {
  data: T;
  etag?: string; // For conditional requests
  cachedAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp
  stale: boolean; // Allow stale-while-revalidate
}
```

### Cache Implementation Pattern

```typescript
class GitHubCacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();

  async get<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<{ data: T; etag?: string }>
  ): Promise<T> {
    const now = Date.now();
    const cached = this.memoryCache.get(key);

    // Return fresh cache
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    // Stale-while-revalidate: return stale, fetch in background
    if (cached && cached.stale) {
      this.revalidate(key, ttl, fetcher);
      return cached.data;
    }

    // Conditional request with ETag
    if (cached?.etag) {
      const result = await fetcher();
      if (result === null) { // 304 Not Modified
        this.memoryCache.set(key, {
          ...cached,
          cachedAt: now,
          expiresAt: now + ttl
        });
        return cached.data;
      }
      // New data, update cache
      this.memoryCache.set(key, {
        data: result.data,
        etag: result.etag,
        cachedAt: now,
        expiresAt: now + ttl,
        stale: false
      });
      return result.data;
    }

    // Fresh fetch
    const result = await fetcher();
    this.memoryCache.set(key, {
      data: result.data,
      etag: result.etag,
      cachedAt: now,
      expiresAt: now + ttl,
      stale: false
    });
    return result.data;
  }

  private async revalidate<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<{ data: T; etag?: string }>
  ) {
    try {
      const result = await fetcher();
      const now = Date.now();
      this.memoryCache.set(key, {
        data: result.data,
        etag: result.etag,
        cachedAt: now,
        expiresAt: now + ttl,
        stale: false
      });
    } catch (error) {
      console.error('Background revalidation failed:', error);
    }
  }

  invalidate(pattern: string | RegExp) {
    for (const key of this.memoryCache.keys()) {
      if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }
}
```

### Cache Invalidation Rules

**Manual Invalidation Triggers**:
- User clicks "Refresh" button on widget
- Dashboard-level refresh action
- Configuration change (e.g., switching repositories)

**Automatic Invalidation**:
- TTL expiration (background revalidation)
- Rate limit exceeded (pause fetching)
- 4xx/5xx errors (exponential backoff)

**Invalidation Patterns**:
```typescript
// Invalidate all data for a specific repository
cache.invalidate('repos/facebook/react');

// Invalidate all issues across all repos
cache.invalidate(/issues/);

// Invalidate everything (nuclear option)
cache.invalidate(/.*/);
```

---

## 6. TypeScript Data Models

### Core Repository Models

```typescript
// Base repository information
interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: GitHubUser;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  language: string | null;
  topics: string[];
  visibility: 'public' | 'private' | 'internal';
  archived: boolean;
  disabled: boolean;
  license: GitHubLicense | null;
}

interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Organization' | 'Bot';
}

interface GitHubLicense {
  key: string;
  name: string;
  spdx_id: string;
  url: string | null;
}
```

### Issue Models

```typescript
interface GitHubIssue {
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: GitHubUser;
  labels: GitHubLabel[];
  state: 'open' | 'closed';
  locked: boolean;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string | null;
  html_url: string;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
}

interface GitHubLabel {
  id: number;
  node_id: string;
  name: string;
  color: string; // hex color without #
  description: string | null;
  default: boolean;
}
```

### Pull Request Models

```typescript
interface GitHubPullRequest {
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: GitHubUser;
  state: 'open' | 'closed';
  locked: boolean;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  labels: GitHubLabel[];
  draft: boolean;
  head: GitHubBranch;
  base: GitHubBranch;
  html_url: string;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

interface GitHubBranch {
  label: string;
  ref: string;
  sha: string;
  user: GitHubUser;
  repo: GitHubRepository;
}

interface GitHubReview {
  id: number;
  node_id: string;
  user: GitHubUser;
  body: string;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
  html_url: string;
  submitted_at: string;
}
```

### Contributor Models

```typescript
interface GitHubContributor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Bot';
  contributions: number;
}
```

### Release Models

```typescript
interface GitHubRelease {
  id: number;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
  assets: GitHubReleaseAsset[];
  tarball_url: string;
  zipball_url: string;
  body: string | null; // Markdown release notes
  author: GitHubUser;
  html_url: string;
}

interface GitHubReleaseAsset {
  id: number;
  node_id: string;
  name: string;
  label: string | null;
  content_type: string;
  state: 'uploaded' | 'open';
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
}
```

### Widget-Specific Data Models

```typescript
// Widget 1: Repository Stars Timeline
interface StargazerTimelineData {
  date: string; // ISO date
  cumulativeStars: number;
  newStarsToday: number;
}

// Widget 2: Recent Issues List
interface RecentIssueData {
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: {
    login: string;
    avatarUrl: string;
  };
  labels: Array<{ name: string; color: string }>;
  createdAt: string;
  commentsCount: number;
  url: string;
}

// Widget 3: Pull Request Activity
interface PullRequestActivityData {
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  author: {
    login: string;
    avatarUrl: string;
  };
  createdAt: string;
  mergedAt: string | null;
  reviewCount: number;
  isDraft: boolean;
  url: string;
}

// Widget 4: Contributor Ranking
interface ContributorRankingData {
  login: string;
  avatarUrl: string;
  contributions: number;
  profileUrl: string;
}

// Widget 5: Repository Overview Metrics
interface RepositoryMetrics {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  openPullRequests: number;
  lastPushDate: string;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
}

// Widget 6: Release Timeline
interface ReleaseTimelineData {
  tagName: string;
  name: string | null;
  publishedAt: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  totalDownloads: number;
  isPrerelease: boolean;
  url: string;
}
```

### API Response Wrappers

```typescript
// Standard REST API paginated response
interface GitHubPagedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextUrl: string | null;
    prevUrl: string | null;
  };
  rateLimit: RateLimitStatus;
}

// GraphQL response wrapper
interface GitHubGraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
  extensions?: {
    rateLimit: {
      cost: number;
      remaining: number;
      resetAt: string;
    };
  };
}
```

---

## 7. Service Implementation

### GitHubService Class

```typescript
import { CacheEntry, GitHubCacheManager } from './cache-manager';

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private graphqlUrl = 'https://api.github.com/graphql';
  private apiVersion = '2022-11-28';
  private cache: GitHubCacheManager;

  constructor(private proxyBaseUrl: string = '/api/github') {
    this.cache = new GitHubCacheManager();
  }

  // ============================================================
  // Widget 1: Repository Stars Timeline
  // ============================================================

  async getStargazerTimeline(
    owner: string,
    repo: string
  ): Promise<StargazerTimelineData[]> {
    const cacheKey = `gh:stargazers:${owner}/${repo}`;
    const ttl = 60 * 60 * 1000; // 1 hour

    return this.cache.get(cacheKey, ttl, async () => {
      const query = `
        query RepositoryStargazers($owner: String!, $name: String!, $cursor: String) {
          repository(owner: $owner, name: $name) {
            stargazerCount
            stargazers(first: 100, after: $cursor, orderBy: {field: STARRED_AT, direction: ASC}) {
              totalCount
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                starredAt
              }
            }
          }
          rateLimit {
            remaining
            resetAt
          }
        }
      `;

      const allStars: string[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      // Paginate through all stargazers
      while (hasNextPage && allStars.length < 10000) { // Safety limit
        const response = await this.graphqlRequest<{
          repository: {
            stargazers: {
              edges: Array<{ starredAt: string }>;
              pageInfo: { hasNextPage: boolean; endCursor: string };
            };
          };
        }>(query, { owner, name: repo, cursor });

        const edges = response.data.repository.stargazers.edges;
        allStars.push(...edges.map(e => e.starredAt));

        hasNextPage = response.data.repository.stargazers.pageInfo.hasNextPage;
        cursor = response.data.repository.stargazers.pageInfo.endCursor;
      }

      // Aggregate by date
      return this.aggregateStarsByDate(allStars);
    });
  }

  private aggregateStarsByDate(starDates: string[]): StargazerTimelineData[] {
    const dateMap = new Map<string, number>();

    for (const dateStr of starDates) {
      const date = new Date(dateStr).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    }

    const sortedDates = Array.from(dateMap.keys()).sort();
    let cumulative = 0;

    return sortedDates.map(date => {
      const newStars = dateMap.get(date) || 0;
      cumulative += newStars;
      return {
        date,
        cumulativeStars: cumulative,
        newStarsToday: newStars
      };
    });
  }

  // ============================================================
  // Widget 2: Recent Issues List
  // ============================================================

  async getRecentIssues(
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      limit?: number;
    } = {}
  ): Promise<RecentIssueData[]> {
    const { state = 'open', limit = 20 } = options;
    const cacheKey = `gh:issues:${owner}/${repo}:${state}:${limit}`;
    const ttl = 10 * 60 * 1000; // 10 minutes

    return this.cache.get(cacheKey, ttl, async () => {
      const endpoint = `/repos/${owner}/${repo}/issues`;
      const params = new URLSearchParams({
        state,
        sort: 'created',
        direction: 'desc',
        per_page: limit.toString()
      });

      const response = await this.restRequest<GitHubIssue[]>(
        `${endpoint}?${params}`
      );

      return response.data
        .filter(issue => !issue.pull_request) // Exclude PRs
        .map(issue => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          author: {
            login: issue.user.login,
            avatarUrl: issue.user.avatar_url
          },
          labels: issue.labels.map(label => ({
            name: label.name,
            color: `#${label.color}`
          })),
          createdAt: issue.created_at,
          commentsCount: issue.comments,
          url: issue.html_url
        }));
    });
  }

  // ============================================================
  // Widget 3: Pull Request Activity
  // ============================================================

  async getPullRequestActivity(
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      limit?: number;
    } = {}
  ): Promise<PullRequestActivityData[]> {
    const { state = 'open', limit = 20 } = options;
    const cacheKey = `gh:pulls:${owner}/${repo}:${state}:${limit}`;
    const ttl = 10 * 60 * 1000; // 10 minutes

    return this.cache.get(cacheKey, ttl, async () => {
      const endpoint = `/repos/${owner}/${repo}/pulls`;
      const params = new URLSearchParams({
        state,
        sort: 'created',
        direction: 'desc',
        per_page: limit.toString()
      });

      const response = await this.restRequest<GitHubPullRequest[]>(
        `${endpoint}?${params}`
      );

      // Fetch review counts in parallel (optional, expensive)
      const pullsWithReviews = await Promise.all(
        response.data.map(async (pr) => {
          try {
            const reviews = await this.getPullRequestReviews(owner, repo, pr.number);
            return {
              ...pr,
              reviewCount: reviews.length
            };
          } catch {
            return { ...pr, reviewCount: 0 };
          }
        })
      );

      return pullsWithReviews.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.merged_at ? 'merged' : pr.state,
        author: {
          login: pr.user.login,
          avatarUrl: pr.user.avatar_url
        },
        createdAt: pr.created_at,
        mergedAt: pr.merged_at,
        reviewCount: pr.reviewCount,
        isDraft: pr.draft,
        url: pr.html_url
      }));
    });
  }

  private async getPullRequestReviews(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<GitHubReview[]> {
    const endpoint = `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`;
    const response = await this.restRequest<GitHubReview[]>(endpoint);
    return response.data;
  }

  // ============================================================
  // Widget 4: Contributor Ranking
  // ============================================================

  async getContributorRanking(
    owner: string,
    repo: string,
    limit: number = 30
  ): Promise<ContributorRankingData[]> {
    const cacheKey = `gh:contributors:${owner}/${repo}:${limit}`;
    const ttl = 24 * 60 * 60 * 1000; // 24 hours

    return this.cache.get(cacheKey, ttl, async () => {
      const endpoint = `/repos/${owner}/${repo}/contributors`;
      const params = new URLSearchParams({
        anon: '0',
        per_page: limit.toString()
      });

      const response = await this.restRequest<GitHubContributor[]>(
        `${endpoint}?${params}`
      );

      return response.data.map(contributor => ({
        login: contributor.login,
        avatarUrl: contributor.avatar_url,
        contributions: contributor.contributions,
        profileUrl: contributor.html_url
      }));
    });
  }

  // ============================================================
  // Widget 5: Repository Overview Metrics
  // ============================================================

  async getRepositoryMetrics(
    owner: string,
    repo: string
  ): Promise<RepositoryMetrics> {
    const cacheKey = `gh:repo:${owner}/${repo}`;
    const ttl = 30 * 60 * 1000; // 30 minutes

    return this.cache.get(cacheKey, ttl, async () => {
      // Use GraphQL for efficient query
      const query = `
        query RepositoryOverview($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            stargazerCount
            forkCount
            watchers {
              totalCount
            }
            issues(states: OPEN) {
              totalCount
            }
            pullRequests(states: OPEN) {
              totalCount
            }
            pushedAt
            primaryLanguage {
              name
              color
            }
          }
        }
      `;

      const response = await this.graphqlRequest<{
        repository: {
          stargazerCount: number;
          forkCount: number;
          watchers: { totalCount: number };
          issues: { totalCount: number };
          pullRequests: { totalCount: number };
          pushedAt: string;
          primaryLanguage: { name: string; color: string } | null;
        };
      }>(query, { owner, name: repo });

      const repo = response.data.repository;
      return {
        stars: repo.stargazerCount,
        forks: repo.forkCount,
        watchers: repo.watchers.totalCount,
        openIssues: repo.issues.totalCount,
        openPullRequests: repo.pullRequests.totalCount,
        lastPushDate: repo.pushedAt,
        primaryLanguage: repo.primaryLanguage
      };
    });
  }

  // ============================================================
  // Widget 6: Release Timeline
  // ============================================================

  async getReleaseTimeline(
    owner: string,
    repo: string,
    limit: number = 20
  ): Promise<ReleaseTimelineData[]> {
    const cacheKey = `gh:releases:${owner}/${repo}:${limit}`;
    const ttl = 60 * 60 * 1000; // 1 hour

    return this.cache.get(cacheKey, ttl, async () => {
      const endpoint = `/repos/${owner}/${repo}/releases`;
      const params = new URLSearchParams({
        per_page: limit.toString()
      });

      const response = await this.restRequest<GitHubRelease[]>(
        `${endpoint}?${params}`
      );

      return response.data.map(release => ({
        tagName: release.tag_name,
        name: release.name,
        publishedAt: release.published_at || release.created_at,
        author: {
          login: release.author.login,
          avatarUrl: release.author.avatar_url
        },
        totalDownloads: release.assets.reduce(
          (sum, asset) => sum + asset.download_count,
          0
        ),
        isPrerelease: release.prerelease,
        url: release.html_url
      }));
    });
  }

  // ============================================================
  // Low-Level API Methods
  // ============================================================

  private async restRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; etag?: string; rateLimit: RateLimitStatus }> {
    const url = `${this.proxyBaseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new GitHubAPIError(
        response.status,
        `GitHub API error: ${response.statusText}`,
        await response.text()
      );
    }

    const data = await response.json();
    const etag = response.headers.get('ETag') || undefined;
    const rateLimit = this.parseRateLimitHeaders(response.headers);

    return { data, etag, rateLimit };
  }

  private async graphqlRequest<T>(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<GitHubGraphQLResponse<T>> {
    const url = `${this.proxyBaseUrl}/graphql`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new GitHubAPIError(
        response.status,
        `GitHub GraphQL error: ${response.statusText}`,
        await response.text()
      );
    }

    const result: GitHubGraphQLResponse<T> = await response.json();

    if (result.errors) {
      throw new GitHubGraphQLError(
        result.errors[0].message,
        result.errors
      );
    }

    return result;
  }

  private parseRateLimitHeaders(headers: Headers): RateLimitStatus {
    return {
      remaining: parseInt(headers.get('X-RateLimit-Remaining') || '5000'),
      limit: parseInt(headers.get('X-RateLimit-Limit') || '5000'),
      resetAt: new Date(
        parseInt(headers.get('X-RateLimit-Reset') || '0') * 1000
      ),
      resource: (headers.get('X-RateLimit-Resource') as 'core') || 'core'
    };
  }
}

// ============================================================
// Error Classes
// ============================================================

export class GitHubAPIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public responseBody?: string
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

export class GitHubGraphQLError extends Error {
  constructor(
    message: string,
    public errors: Array<{ message: string; path?: string[] }>
  ) {
    super(message);
    this.name = 'GitHubGraphQLError';
  }
}

export interface RateLimitStatus {
  remaining: number;
  limit: number;
  resetAt: Date;
  resource: 'core' | 'graphql' | 'search';
}
```

---

## 8. Error Handling

### Error Classification

**Client Errors (4xx)**:
- `400 Bad Request`: Invalid parameters, malformed query
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Rate limit exceeded OR insufficient permissions
- `404 Not Found`: Repository doesn't exist or no access
- `422 Unprocessable Entity`: Validation error

**Server Errors (5xx)**:
- `500 Internal Server Error`: GitHub service issue
- `502 Bad Gateway`: Upstream GitHub service issue
- `503 Service Unavailable`: GitHub maintenance or outage

### Retry Strategy

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  retryableStatusCodes: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
};

async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error as Error;

      if (error instanceof GitHubAPIError) {
        // Don't retry client errors (except 429)
        if (
          error.statusCode < 500 &&
          error.statusCode !== 429
        ) {
          throw error;
        }

        // Check if status code is retryable
        if (!config.retryableStatusCodes.includes(error.statusCode)) {
          throw error;
        }

        // Handle rate limiting
        if (error.statusCode === 429) {
          const retryAfter = parseInt(
            error.responseBody?.match(/retry-after: (\d+)/)?.[1] || '60'
          );
          await sleep(retryAfter * 1000);
          continue;
        }
      }

      // Exponential backoff
      if (attempt < config.maxRetries) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### User-Facing Error Messages

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof GitHubAPIError) {
    switch (error.statusCode) {
      case 401:
        return 'GitHub authentication failed. Please check your access token.';
      case 403:
        return 'Rate limit exceeded or insufficient permissions. Please try again later.';
      case 404:
        return 'Repository not found or you don\'t have access to it.';
      case 422:
        return 'Invalid request parameters. Please check your configuration.';
      case 503:
        return 'GitHub is temporarily unavailable. Please try again in a few minutes.';
      default:
        return `GitHub API error (${error.statusCode}). Please try again.`;
    }
  }

  if (error instanceof GitHubGraphQLError) {
    return `GraphQL query failed: ${error.message}`;
  }

  return 'An unexpected error occurred. Please try again.';
}
```

---

## 9. Performance Optimization

### Request Batching

**GraphQL Query Batching**:
```typescript
// Combine multiple widget queries into single GraphQL request
async function batchRepositoryQueries(
  repositories: Array<{ owner: string; repo: string }>
): Promise<Record<string, RepositoryMetrics>> {
  const query = `
    query BatchRepositories(
      $repo1: String!, $owner1: String!,
      $repo2: String!, $owner2: String!
    ) {
      repo1: repository(owner: $owner1, name: $repo1) {
        stargazerCount
        forkCount
      }
      repo2: repository(owner: $owner2, name: $repo2) {
        stargazerCount
        forkCount
      }
    }
  `;

  // Dynamically build query based on repositories array
  // ...implementation
}
```

### Parallel Fetching

```typescript
async function fetchDashboardData(
  dashboardConfig: DashboardConfig
): Promise<DashboardData> {
  // Fetch all widget data in parallel
  const widgets = await Promise.allSettled([
    githubService.getRepositoryMetrics(owner, repo),
    githubService.getRecentIssues(owner, repo),
    githubService.getPullRequestActivity(owner, repo),
    githubService.getContributorRanking(owner, repo)
  ]);

  // Handle fulfilled and rejected promises
  return widgets.map((result, index) => ({
    widgetId: dashboardConfig.widgets[index].id,
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
}
```

### Prefetching Strategy

```typescript
// Prefetch likely next page data
function usePrefetchNextPage(
  owner: string,
  repo: string,
  currentPage: number
) {
  useEffect(() => {
    // Prefetch next page in background
    const prefetchTimer = setTimeout(() => {
      githubService.getRecentIssues(owner, repo, {
        state: 'open',
        limit: 20,
        page: currentPage + 1
      });
    }, 1000);

    return () => clearTimeout(prefetchTimer);
  }, [owner, repo, currentPage]);
}
```

---

## 10. Security Considerations

### Token Security Checklist

- [ ] Store tokens in Vercel environment variables (server-side only)
- [ ] Never expose tokens in client-side JavaScript
- [ ] Use backend proxy (Next.js API routes) for all GitHub requests
- [ ] Implement token rotation schedule (every 90 days)
- [ ] Use fine-grained PATs with minimum required scopes
- [ ] Monitor token usage in Vercel logs
- [ ] Revoke compromised tokens immediately

### Environment Variable Setup

```bash
# .env.local (never commit to git)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Vercel Production Environment
# Dashboard: Settings → Environment Variables
GITHUB_TOKEN=ghp_yyyyyyyyyyyyyyyyyyyy (Production)
```

### API Proxy Security

```typescript
// app/api/github/[...path]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  // Validate request origin (prevent CSRF)
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000'
  ];

  if (origin && !allowedOrigins.includes(origin)) {
    return Response.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Rate limit per client IP
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimited = await checkRateLimit(clientIP);

  if (rateLimited) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Forward to GitHub with server-side token
  const token = process.env.GITHUB_TOKEN;
  const path = params.path.join('/');

  const response = await fetch(`https://api.github.com/${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'DashboardBuilder/1.0'
    }
  });

  // Forward response without exposing token
  return response;
}
```

### Input Validation

```typescript
import { z } from 'zod';

const RepositoryParamsSchema = z.object({
  owner: z.string().min(1).max(39).regex(/^[a-z0-9-]+$/i),
  repo: z.string().min(1).max(100).regex(/^[a-z0-9-_.]+$/i)
});

function validateRepositoryParams(
  owner: string,
  repo: string
): { valid: boolean; error?: string } {
  const result = RepositoryParamsSchema.safeParse({ owner, repo });

  if (!result.success) {
    return {
      valid: false,
      error: 'Invalid repository parameters'
    };
  }

  return { valid: true };
}
```

---

## Summary

This GitHub API integration design provides a production-ready foundation for the dashboard builder's 6 GitHub widgets:

1. **Repository Stars Timeline** - GraphQL with cursor pagination
2. **Recent Issues List** - REST API with 10-minute cache
3. **Pull Request Activity** - REST API with review counts
4. **Contributor Ranking** - REST API with 24-hour cache
5. **Repository Overview Metrics** - GraphQL batch query
6. **Release Timeline** - REST API with download aggregation

**Key Design Decisions**:
- Hybrid REST + GraphQL approach optimized for each widget's needs
- Multi-layer caching with ETags for efficient rate limit usage
- Backend proxy pattern ensuring token security
- Comprehensive TypeScript interfaces for type safety
- Production-ready GitHubService class with all 6 widget methods
- Exponential backoff retry strategy for resilience
- Rate limit tracking and user-facing quota warnings

**Implementation Path**:
1. Set up Next.js API routes as GitHub proxy
2. Implement GitHubCacheManager with memory + IndexedDB layers
3. Deploy GitHubService class with 6 widget methods
4. Connect widgets to service layer via React Query/SWR
5. Monitor rate limit consumption in production
6. Iterate on cache TTLs based on actual usage patterns

**Estimated Rate Limit Usage** (per dashboard with all 6 widgets):
- Initial load: ~10-15 requests (or 5-10 GraphQL points)
- Hourly refresh: ~5-8 requests (cached data returned)
- Daily quota consumption: ~50-100 requests for active user
- Well within 5,000 requests/hour limit for typical usage

This design balances performance, security, and developer experience while staying within GitHub's API constraints.
