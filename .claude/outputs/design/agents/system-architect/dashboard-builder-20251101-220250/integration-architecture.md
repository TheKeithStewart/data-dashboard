# Dashboard Builder - Integration Architecture

**Project**: dashboard-builder
**Timestamp**: 20251101-220250
**Technology Stack**: Next.js 15 App Router + React 19 + TypeScript 5
**Data Sources**: GitHub REST/GraphQL API + npm Registry API
**Design System**: Salt Design System
**Layout Engine**: react-grid-layout

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Route Specifications](#2-api-route-specifications)
3. [Frontend-Backend Data Flow](#3-frontend-backend-data-flow)
4. [Service Architecture](#4-service-architecture)
5. [Widget Registry Pattern](#5-widget-registry-pattern)
6. [Error Handling Strategy](#6-error-handling-strategy)
7. [Performance Optimization](#7-performance-optimization)
8. [Type System](#8-type-system)
9. [Caching Strategy](#9-caching-strategy)
10. [Security Considerations](#10-security-considerations)

---

## 1. Architecture Overview

### 1.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  React Components (Next.js 15 App Router)                    │ │
│  │  ─────────────────────────────────────────────────────────── │ │
│  │  • DashboardCanvas (react-grid-layout)                       │ │
│  │  • Widget Components (Recharts visualizations)               │ │
│  │  • Salt DS UI Components                                     │ │
│  │  • State Management (React Context + Local State)            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↕                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Client-Side Services & Cache                                │ │
│  │  ─────────────────────────────────────────────────────────── │ │
│  │  • WidgetDataService (orchestration)                         │ │
│  │  • CacheManager (in-memory + localStorage)                   │ │
│  │  • DashboardPersistence (localStorage)                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↕                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  API Client Layer                                            │ │
│  │  ─────────────────────────────────────────────────────────── │ │
│  │  • fetch() with retry logic                                  │ │
│  │  • Request deduplication                                     │ │
│  │  • Error handling & transformation                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                               ↕ HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS SERVER LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  API Routes (/app/api/*)                                     │ │
│  │  ─────────────────────────────────────────────────────────── │ │
│  │  • /api/github/* (proxy with auth)                           │ │
│  │  • /api/npm/* (proxy with caching)                           │ │
│  │  • Rate limiting middleware                                  │ │
│  │  • Response caching headers                                  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↕                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Service Layer (Singleton Pattern)                           │ │
│  │  ─────────────────────────────────────────────────────────── │ │
│  │  • GitHubService (API integration)                           │ │
│  │  • NpmService (API integration)                              │ │
│  │  • ServerCacheService (Redis/in-memory)                      │ │
│  │  • RateLimitService (token bucket)                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              ↕                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Data Transformation Layer                                   │ │
│  │  ─────────────────────────────────────────────────────────── │ │
│  │  • Raw API response → Widget data format                     │ │
│  │  • Zod schema validation                                     │ │
│  │  • Error normalization                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                               ↕ HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL APIs                                  │
├─────────────────────────────────────────────────────────────────────┤
│  • GitHub REST API v3                                              │
│  • GitHub GraphQL API v4                                           │
│  • npm Registry API                                                │
│  • npm Download Counts API                                         │
│  • npms.io API (package scores)                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Request Flow Example

**User adds GitHub Stars Trend widget:**

```
1. User Action
   └─> Component Event (onClick Add Widget)
       └─> DashboardContext.addWidget({type: 'GH-01', config: {...}})
           └─> LocalStorage.save(dashboard)
               └─> Widget Component Mounts
                   └─> useWidgetData hook triggers
                       └─> WidgetDataService.fetchData('GH-01', config)
                           └─> CacheManager.get(cacheKey)
                               ├─> Cache Hit → Return cached data
                               └─> Cache Miss → API Client.fetch()
                                   └─> GET /api/github/repos/:owner/:repo/stargazers
                                       └─> GitHubService.getStargazers()
                                           └─> GitHub API (with auth token)
                                               └─> Response
                                                   └─> Transform to widget format
                                                       └─> Cache response (TTL: 1hr)
                                                           └─> Return to widget
                                                               └─> Widget renders chart
```

---

## 2. API Route Specifications

### 2.1 GitHub API Routes

#### 2.1.1 Repository Metadata

**Endpoint**: `GET /api/github/repos/:owner/:repo`

**Purpose**: Fetch basic repository information (stars, forks, issues, etc.)

**Request**:
```typescript
interface GetRepoRequest {
  params: {
    owner: string    // Repository owner (e.g., "facebook")
    repo: string     // Repository name (e.g., "react")
  }
}
```

**Response**:
```typescript
interface GetRepoResponse {
  success: true
  data: {
    id: number
    name: string
    fullName: string
    description: string
    stars: number
    forks: number
    openIssues: number
    watchers: number
    language: string
    license: string | null
    createdAt: string       // ISO 8601
    updatedAt: string       // ISO 8601
    pushedAt: string        // ISO 8601
    size: number            // KB
    defaultBranch: string
    archived: boolean
    disabled: boolean
    homepage: string | null
    topics: string[]
  }
  cached: boolean
  timestamp: string         // ISO 8601
}
```

**Error Response**:
```typescript
interface ErrorResponse {
  success: false
  error: {
    code: 'REPO_NOT_FOUND' | 'RATE_LIMIT_EXCEEDED' | 'GITHUB_API_ERROR' | 'INVALID_REQUEST'
    message: string
    details?: unknown
    retryAfter?: number      // seconds until retry allowed
  }
  timestamp: string
}
```

**Implementation**:
```typescript
// app/api/github/repos/[owner]/[repo]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GitHubService } from '@/lib/services/github-service'
import { withRateLimit } from '@/lib/middleware/rate-limit'
import { withCache } from '@/lib/middleware/cache'

export const GET = withRateLimit(
  withCache(
    async (
      request: NextRequest,
      { params }: { params: { owner: string; repo: string } }
    ) => {
      try {
        const { owner, repo } = params

        const githubService = GitHubService.getInstance()
        const data = await githubService.getRepository(owner, repo)

        return NextResponse.json({
          success: true,
          data,
          cached: false,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        return handleGitHubError(error)
      }
    },
    { ttl: 3600000 } // 1 hour cache
  )
)
```

#### 2.1.2 Stargazers History

**Endpoint**: `GET /api/github/repos/:owner/:repo/stargazers`

**Purpose**: Fetch star count history for trend visualization

**Query Parameters**:
```typescript
interface StargazersQuery {
  period?: '7d' | '30d' | '90d' | '1y' | 'all'  // Default: '30d'
  granularity?: 'daily' | 'weekly' | 'monthly'   // Default: 'daily'
}
```

**Response**:
```typescript
interface StargazersResponse {
  success: true
  data: {
    repository: {
      owner: string
      name: string
      totalStars: number
    }
    history: Array<{
      date: string        // ISO 8601
      count: number       // cumulative stars at this date
      delta: number       // stars added since previous data point
    }>
    period: string
    granularity: string
  }
  cached: boolean
  timestamp: string
}
```

**Implementation Strategy**:
Since GitHub API doesn't provide historical star data directly, we have two approaches:

1. **GitHub GraphQL API** (preferred for new repos):
```graphql
query {
  repository(owner: "facebook", name: "react") {
    stargazers(first: 100, orderBy: {field: STARRED_AT, direction: ASC}) {
      edges {
        starredAt
      }
    }
  }
}
```

2. **Third-party service** (for comprehensive history):
Use services like `star-history.com` API or cache our own historical data

For MVP, implement simple approach:
- Current star count from REST API
- Estimate historical trend from commits/releases timeline
- Display current metrics prominently

#### 2.1.3 Issues Metrics

**Endpoint**: `GET /api/github/repos/:owner/:repo/issues`

**Query Parameters**:
```typescript
interface IssuesQuery {
  state?: 'open' | 'closed' | 'all'    // Default: 'all'
  period?: '7d' | '30d' | '90d'        // Default: '30d'
}
```

**Response**:
```typescript
interface IssuesResponse {
  success: true
  data: {
    summary: {
      totalOpen: number
      totalClosed: number
      avgTimeToClose: number        // hours
      issueVelocity: number          // issues/week
    }
    timeline: Array<{
      date: string                   // ISO 8601
      opened: number
      closed: number
      open: number                   // cumulative open
    }>
  }
  cached: boolean
  timestamp: string
}
```

#### 2.1.4 Pull Requests Activity

**Endpoint**: `GET /api/github/repos/:owner/:repo/pulls`

**Query Parameters**:
```typescript
interface PullsQuery {
  period?: '7d' | '30d' | '90d'        // Default: '30d'
  granularity?: 'daily' | 'weekly'     // Default: 'weekly'
}
```

**Response**:
```typescript
interface PullsResponse {
  success: true
  data: {
    summary: {
      totalOpen: number
      totalMerged: number
      totalClosed: number
      avgTimeToMerge: number         // hours
      mergeRate: number              // percentage
    }
    activity: Array<{
      period: string                 // "2025-W44" for weekly
      opened: number
      merged: number
      closed: number                 // closed without merge
    }>
  }
  cached: boolean
  timestamp: string
}
```

#### 2.1.5 Contributors

**Endpoint**: `GET /api/github/repos/:owner/:repo/contributors`

**Query Parameters**:
```typescript
interface ContributorsQuery {
  top?: number           // Default: 10, Max: 100
  period?: '30d' | '90d' | '1y' | 'all'  // Default: 'all'
}
```

**Response**:
```typescript
interface ContributorsResponse {
  success: true
  data: {
    contributors: Array<{
      login: string
      name: string | null
      avatarUrl: string
      contributions: number
      commits: number
      additions: number
      deletions: number
      pullRequests: number
    }>
    total: number
  }
  cached: boolean
  timestamp: string
}
```

#### 2.1.6 Releases

**Endpoint**: `GET /api/github/repos/:owner/:repo/releases`

**Query Parameters**:
```typescript
interface ReleasesQuery {
  limit?: number         // Default: 10, Max: 50
}
```

**Response**:
```typescript
interface ReleasesResponse {
  success: true
  data: {
    releases: Array<{
      id: number
      name: string
      tagName: string
      publishedAt: string         // ISO 8601
      isPrerelease: boolean
      isDraft: boolean
      author: {
        login: string
        avatarUrl: string
      }
      body: string                // Release notes (markdown)
      assets: Array<{
        name: string
        downloadCount: number
        size: number              // bytes
        contentType: string
      }>
    }>
    total: number
  }
  cached: boolean
  timestamp: string
}
```

#### 2.1.7 Repository Health Score

**Endpoint**: `GET /api/github/repos/:owner/:repo/health`

**Purpose**: Composite health score from multiple signals

**Response**:
```typescript
interface HealthResponse {
  success: true
  data: {
    score: number                    // 0-100
    components: {
      documentation: {
        score: number                // 0-100
        hasReadme: boolean
        hasContributing: boolean
        hasLicense: boolean
        hasCodeOfConduct: boolean
      }
      maintenance: {
        score: number
        lastCommitDays: number
        commitFrequency: number      // commits/month
        openIssueAge: number         // avg age in days
      }
      community: {
        score: number
        stars: number
        forks: number
        contributors: number
        issueResponseTime: number    // hours
      }
      quality: {
        score: number
        hasTests: boolean
        hasCI: boolean
        hasCodeCoverage: boolean
        openIssueRatio: number       // open/(open+closed)
      }
    }
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  }
  cached: boolean
  timestamp: string
}
```

**Scoring Algorithm**:
```typescript
// Documentation (25 points)
const docScore = (
  (hasReadme ? 10 : 0) +
  (hasContributing ? 5 : 0) +
  (hasLicense ? 7 : 0) +
  (hasCodeOfConduct ? 3 : 0)
)

// Maintenance (25 points)
const maintenanceScore = (
  (lastCommitDays < 7 ? 10 : lastCommitDays < 30 ? 7 : lastCommitDays < 90 ? 4 : 0) +
  (commitFrequency > 20 ? 10 : commitFrequency > 5 ? 7 : 4) +
  (openIssueAge < 30 ? 5 : openIssueAge < 90 ? 3 : 1)
)

// Community (25 points)
const communityScore = (
  Math.min(stars / 1000, 10) +           // max 10 pts
  Math.min(forks / 100, 5) +             // max 5 pts
  Math.min(contributors / 10, 5) +       // max 5 pts
  (issueResponseTime < 24 ? 5 : issueResponseTime < 168 ? 3 : 1)
)

// Quality (25 points)
const qualityScore = (
  (hasTests ? 8 : 0) +
  (hasCI ? 7 : 0) +
  (hasCodeCoverage ? 5 : 0) +
  (openIssueRatio < 0.3 ? 5 : openIssueRatio < 0.5 ? 3 : 1)
)

const totalScore = docScore + maintenanceScore + communityScore + qualityScore
```

### 2.2 npm API Routes

#### 2.2.1 Package Metadata

**Endpoint**: `GET /api/npm/package/:packageName`

**Purpose**: Fetch package information from npm registry

**Response**:
```typescript
interface NpmPackageResponse {
  success: true
  data: {
    name: string
    version: string                  // latest version
    description: string
    keywords: string[]
    license: string
    repository: {
      type: string
      url: string
    } | null
    homepage: string | null
    author: {
      name: string
      email?: string
    } | null
    maintainers: Array<{
      name: string
      email: string
    }>
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
    publishedAt: string              // ISO 8601
    versions: string[]               // all versions
    distTags: Record<string, string> // latest, next, etc.
  }
  cached: boolean
  timestamp: string
}
```

**Implementation**:
```typescript
// app/api/npm/package/[packageName]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { NpmService } from '@/lib/services/npm-service'

export const GET = async (
  request: NextRequest,
  { params }: { params: { packageName: string } }
) => {
  try {
    const npmService = NpmService.getInstance()
    const data = await npmService.getPackageMetadata(params.packageName)

    return NextResponse.json({
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
      }
    })
  } catch (error) {
    return handleNpmError(error)
  }
}
```

#### 2.2.2 Download Statistics

**Endpoint**: `GET /api/npm/downloads/:packageName`

**Query Parameters**:
```typescript
interface DownloadsQuery {
  period?: '7d' | '30d' | '90d' | '1y'    // Default: '30d'
  granularity?: 'daily' | 'weekly'        // Default: 'daily'
}
```

**Response**:
```typescript
interface DownloadsResponse {
  success: true
  data: {
    package: string
    total: number                    // total downloads in period
    downloads: Array<{
      day: string                    // "YYYY-MM-DD"
      downloads: number
    }>
    summary: {
      average: number                // avg downloads/day
      peak: number                   // highest daily downloads
      peakDate: string
      trend: 'up' | 'down' | 'stable'
      trendPercent: number           // % change vs previous period
    }
  }
  cached: boolean
  timestamp: string
}
```

**npm API Integration**:
```typescript
// Using npm download-counts API
// https://api.npmjs.org/downloads/range/{period}/{package}

async getDownloadStats(packageName: string, period: string) {
  const startDate = this.calculateStartDate(period)
  const endDate = new Date().toISOString().split('T')[0]

  const url = `https://api.npmjs.org/downloads/range/${startDate}:${endDate}/${packageName}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new NpmApiError('Failed to fetch download stats')
  }

  const data = await response.json()
  return this.transformDownloadData(data)
}
```

#### 2.2.3 Version Distribution

**Endpoint**: `GET /api/npm/versions/:packageName`

**Purpose**: Get download distribution across versions

**Response**:
```typescript
interface VersionDistributionResponse {
  success: true
  data: {
    package: string
    totalDownloads: number
    versions: Array<{
      version: string
      downloads: number
      percentage: number
      publishedAt: string
      isMajor: boolean              // major version bump
    }>
    majorVersions: Array<{
      major: number                  // e.g., 16, 17, 18
      totalDownloads: number
      percentage: number
      versions: string[]
    }>
  }
  cached: boolean
  timestamp: string
}
```

**Note**: npm doesn't provide per-version download stats directly. For MVP:
1. Show version metadata from registry
2. Display major version breakdown (estimated from publish dates)
3. Consider integrating with npms.io for additional metrics

#### 2.2.4 Package Health Score

**Endpoint**: `GET /api/npm/health/:packageName`

**Purpose**: Package quality metrics from npms.io

**Response**:
```typescript
interface NpmHealthResponse {
  success: true
  data: {
    packageName: string
    score: {
      final: number                  // 0-1
      detail: {
        quality: number              // 0-1
        popularity: number           // 0-1
        maintenance: number          // 0-1
      }
    }
    quality: {
      carefulness: number            // tests, linting, etc.
      tests: number
      health: number                 // outdated deps, vulnerabilities
      branding: number               // readme, badges
    }
    popularity: {
      communityInterest: number
      downloadsCount: number
      downloadsAcceleration: number
      dependentsCount: number
    }
    maintenance: {
      releasesFrequency: number
      commitsFrequency: number
      openIssues: number
      issuesDistribution: number
    }
    metadata: {
      date: string
      version: string
    }
  }
  cached: boolean
  timestamp: string
}
```

**npms.io API Integration**:
```typescript
// https://api.npms.io/v2/package/{package}

async getPackageHealth(packageName: string) {
  const url = `https://api.npms.io/v2/package/${encodeURIComponent(packageName)}`
  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      throw new PackageNotFoundError(packageName)
    }
    throw new NpmsApiError('Failed to fetch package health')
  }

  return response.json()
}
```

#### 2.2.5 Dependency Analysis

**Endpoint**: `GET /api/npm/dependencies/:packageName`

**Purpose**: Analyze package dependencies for risks

**Response**:
```typescript
interface DependencyAnalysisResponse {
  success: true
  data: {
    package: string
    version: string
    totalDependencies: number
    analysis: {
      outdated: Array<{
        name: string
        current: string
        latest: string
        type: 'dependencies' | 'devDependencies'
        severity: 'major' | 'minor' | 'patch'
      }>
      vulnerabilities: Array<{
        name: string
        severity: 'critical' | 'high' | 'moderate' | 'low'
        title: string
        url: string
      }>
      unmaintained: Array<{
        name: string
        lastPublish: string
        daysSinceUpdate: number
      }>
    }
    riskScore: number                // 0-100 (100 = highest risk)
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
  }
  cached: boolean
  timestamp: string
}
```

**Implementation Approach**:
1. Fetch package.json from npm registry
2. For each dependency, check npm registry for latest version
3. Calculate version difference (major/minor/patch)
4. Check known vulnerability databases (npm audit API)
5. Score based on outdated percentage and vulnerability severity

### 2.3 Combined Widget Routes

#### 2.3.1 Project Overview

**Endpoint**: `GET /api/combined/project-overview`

**Query Parameters**:
```typescript
interface ProjectOverviewQuery {
  githubRepo: string      // format: "owner/repo"
  npmPackage: string      // package name
}
```

**Response**:
```typescript
interface ProjectOverviewResponse {
  success: true
  data: {
    github: {
      name: string
      stars: number
      forks: number
      openIssues: number
      latestRelease: {
        version: string
        publishedAt: string
      } | null
    }
    npm: {
      name: string
      version: string
      weeklyDownloads: number
      monthlyDownloads: number
      license: string
    }
    correlation: {
      starsToDownloads: number      // ratio
      healthScore: number            // combined score 0-100
    }
  }
  cached: boolean
  timestamp: string
}
```

#### 2.3.2 Growth Comparison

**Endpoint**: `GET /api/combined/growth-comparison`

**Query Parameters**:
```typescript
interface GrowthComparisonQuery {
  githubRepo: string
  npmPackage: string
  period: '30d' | '90d' | '1y'
}
```

**Response**:
```typescript
interface GrowthComparisonResponse {
  success: true
  data: {
    timeline: Array<{
      date: string
      githubStars: number | null     // cumulative
      npmDownloads: number | null    // for this period
    }>
    correlation: {
      coefficient: number            // Pearson correlation -1 to 1
      trend: 'positive' | 'negative' | 'neutral'
    }
    summary: {
      github: {
        startStars: number
        endStars: number
        growth: number               // percentage
      }
      npm: {
        totalDownloads: number
        averageDaily: number
        growth: number               // percentage vs previous period
      }
    }
  }
  cached: boolean
  timestamp: string
}
```

### 2.4 Common Response Headers

All API routes include standardized headers:

```typescript
// Success responses
{
  'Content-Type': 'application/json',
  'Cache-Control': 'public, s-maxage={ttl}, stale-while-revalidate={swr}',
  'X-Cache-Status': 'HIT' | 'MISS' | 'STALE',
  'X-RateLimit-Limit': '{limit}',
  'X-RateLimit-Remaining': '{remaining}',
  'X-RateLimit-Reset': '{timestamp}'
}

// Error responses
{
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Retry-After': '{seconds}' // only for rate limit errors
}
```

---

## 3. Frontend-Backend Data Flow

### 3.1 Widget Data Fetching Pattern

Each widget follows a consistent data fetching pattern using a custom React hook:

```typescript
// hooks/use-widget-data.ts

interface UseWidgetDataOptions<TConfig, TData> {
  widgetId: string
  widgetType: WidgetType
  config: TConfig
  refreshInterval?: number          // milliseconds, 0 = manual only
  enabled?: boolean                 // default true
}

interface UseWidgetDataResult<TData> {
  data: TData | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  lastFetched: Date | null
  isCached: boolean
}

export function useWidgetData<TConfig, TData>(
  options: UseWidgetDataOptions<TConfig, TData>
): UseWidgetDataResult<TData> {
  const [state, setState] = useState<WidgetDataState<TData>>({
    data: null,
    loading: true,
    error: null,
    lastFetched: null,
    isCached: false
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Generate cache key from widget type + config
      const cacheKey = generateCacheKey(options.widgetType, options.config)

      // Check cache first
      const cached = CacheManager.get<TData>(cacheKey)
      if (cached && !isStale(cached)) {
        setState({
          data: cached.data,
          loading: false,
          error: null,
          lastFetched: new Date(cached.timestamp),
          isCached: true
        })
        return
      }

      // Fetch from API
      const data = await WidgetDataService.fetchData<TConfig, TData>(
        options.widgetType,
        options.config
      )

      // Update cache
      CacheManager.set(cacheKey, data, getCacheTTL(options.widgetType))

      setState({
        data,
        loading: false,
        error: null,
        lastFetched: new Date(),
        isCached: false
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }))
    }
  }, [options.widgetType, options.config])

  // Initial fetch
  useEffect(() => {
    if (options.enabled !== false) {
      fetchData()
    }
  }, [fetchData, options.enabled])

  // Auto-refresh interval
  useEffect(() => {
    if (options.refreshInterval && options.refreshInterval > 0) {
      const interval = setInterval(fetchData, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, options.refreshInterval])

  return {
    ...state,
    refetch: fetchData
  }
}
```

### 3.2 State Management Architecture

#### 3.2.1 Dashboard Context

Global dashboard state managed via React Context:

```typescript
// contexts/dashboard-context.tsx

interface DashboardState {
  dashboards: Dashboard[]
  activeDashboardId: string | null
  userPreferences: UserPreferences
}

interface DashboardContextValue extends DashboardState {
  // Dashboard operations
  createDashboard: (name: string) => Promise<Dashboard>
  deleteDashboard: (id: string) => Promise<void>
  renameDashboard: (id: string, name: string) => Promise<void>
  duplicateDashboard: (id: string) => Promise<Dashboard>
  setActiveDashboard: (id: string) => void

  // Widget operations
  addWidget: (widgetInstance: Omit<WidgetInstance, 'id'>) => Promise<WidgetInstance>
  removeWidget: (widgetId: string) => Promise<void>
  updateWidgetConfig: (widgetId: string, config: Record<string, unknown>) => Promise<void>

  // Layout operations
  updateLayout: (layout: Layout[]) => Promise<void>

  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>

  // Import/Export
  exportDashboard: (id: string) => Promise<string>       // JSON string
  exportAllDashboards: () => Promise<string>
  importDashboards: (json: string) => Promise<void>
}

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DashboardState>(loadFromLocalStorage)

  // Persist to localStorage on every state change
  useEffect(() => {
    saveToLocalStorage(state)
  }, [state])

  const createDashboard = async (name: string) => {
    const newDashboard: Dashboard = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      widgets: [],
      layout: []
    }

    setState(prev => ({
      ...prev,
      dashboards: [...prev.dashboards, newDashboard],
      activeDashboardId: newDashboard.id
    }))

    return newDashboard
  }

  // ... other operations

  return (
    <DashboardContext.Provider value={{ ...state, createDashboard, /* ... */ }}>
      {children}
    </DashboardContext.Provider>
  )
}
```

#### 3.2.2 Local Storage Schema

```typescript
// LocalStorage key: 'dashboard-builder-state'

interface PersistedState {
  version: string                    // schema version for migrations
  dashboards: Dashboard[]
  activeDashboardId: string | null
  userPreferences: UserPreferences
  lastSaved: string                  // ISO 8601
}

// Example persisted data
const exampleState: PersistedState = {
  version: '1.0.0',
  dashboards: [
    {
      id: 'dash-001',
      name: 'My Team Dashboard',
      createdAt: '2025-10-15T10:00:00Z',
      modifiedAt: '2025-11-01T14:32:00Z',
      widgets: [
        {
          id: 'widget-001',
          type: 'GH-01',
          config: {
            owner: 'facebook',
            repo: 'react',
            period: '30d'
          },
          refreshInterval: 900000 // 15 minutes
        },
        {
          id: 'widget-002',
          type: 'NPM-01',
          config: {
            package: 'react',
            period: '30d',
            granularity: 'daily'
          },
          refreshInterval: 3600000 // 1 hour
        }
      ],
      layout: [
        { i: 'widget-001', x: 0, y: 0, w: 4, h: 2 },
        { i: 'widget-002', x: 4, y: 0, w: 4, h: 2 }
      ]
    }
  ],
  activeDashboardId: 'dash-001',
  userPreferences: {
    theme: 'light',
    defaultRefreshInterval: 900000,
    compactMode: false
  },
  lastSaved: '2025-11-01T14:32:00Z'
}
```

### 3.3 Data Caching Strategy

#### 3.3.1 Client-Side Cache Manager

```typescript
// lib/cache-manager.ts

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

class CacheManager {
  private static instance: CacheManager
  private cache: Map<string, CacheEntry<unknown>>
  private maxSize: number = 100

  private constructor() {
    this.cache = new Map()
    this.loadFromSessionStorage()
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry as CacheEntry<T>
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Evict oldest entries if cache full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.findOldestEntry()
      if (oldestKey) this.cache.delete(oldestKey)
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key
    }

    this.cache.set(key, entry)
    this.saveToSessionStorage()
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    this.saveToSessionStorage()
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
      }
    }
    this.saveToSessionStorage()
  }

  clear(): void {
    this.cache.clear()
    sessionStorage.removeItem('cache-data')
  }

  private findOldestEntry(): string | null {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  private saveToSessionStorage(): void {
    try {
      const serialized = Array.from(this.cache.entries())
      sessionStorage.setItem('cache-data', JSON.stringify(serialized))
    } catch (error) {
      console.warn('Failed to save cache to sessionStorage', error)
    }
  }

  private loadFromSessionStorage(): void {
    try {
      const stored = sessionStorage.getItem('cache-data')
      if (stored) {
        const entries = JSON.parse(stored)
        this.cache = new Map(entries)
      }
    } catch (error) {
      console.warn('Failed to load cache from sessionStorage', error)
    }
  }
}

export default CacheManager
```

#### 3.3.2 Cache Key Generation

```typescript
// lib/cache-keys.ts

export function generateCacheKey(widgetType: WidgetType, config: Record<string, unknown>): string {
  // Sort config keys for consistent cache keys
  const sortedConfig = Object.keys(config)
    .sort()
    .reduce((acc, key) => {
      acc[key] = config[key]
      return acc
    }, {} as Record<string, unknown>)

  return `${widgetType}:${JSON.stringify(sortedConfig)}`
}

// Examples:
// generateCacheKey('GH-01', { owner: 'facebook', repo: 'react', period: '30d' })
// => "GH-01:{"owner":"facebook","period":"30d","repo":"react"}"

// generateCacheKey('NPM-01', { package: 'react', period: '30d', granularity: 'daily' })
// => "NPM-01:{"granularity":"daily","package":"react","period":"30d"}"
```

#### 3.3.3 TTL Configuration by Widget Type

```typescript
// lib/cache-config.ts

export const CACHE_TTL: Record<WidgetType, number> = {
  // GitHub widgets - 1 hour (3600000ms)
  'GH-01': 3600000,  // Stars (changes infrequently)
  'GH-02': 1800000,  // Issues (30 minutes, more dynamic)
  'GH-03': 1800000,  // Pull Requests (30 minutes)
  'GH-04': 3600000,  // Contributors (1 hour)
  'GH-05': 3600000,  // Releases (1 hour)
  'GH-06': 7200000,  // Health Score (2 hours, expensive to compute)

  // npm widgets - longer TTLs due to less frequent updates
  'NPM-01': 3600000, // Downloads (1 hour)
  'NPM-02': 86400000, // Version Distribution (24 hours)
  'NPM-03': 86400000, // Health Score (24 hours, from npms.io)
  'NPM-04': 86400000, // Dependencies (24 hours)

  // Combined widgets
  'COMBO-01': 3600000, // Project Overview (1 hour)
  'COMBO-02': 3600000  // Growth Comparison (1 hour)
}

export function getCacheTTL(widgetType: WidgetType): number {
  return CACHE_TTL[widgetType] ?? 3600000 // default 1 hour
}
```

### 3.4 Request Deduplication

Prevent multiple identical requests when multiple widgets request same data:

```typescript
// lib/request-deduplicator.ts

class RequestDeduplicator {
  private static instance: RequestDeduplicator
  private pending: Map<string, Promise<unknown>>

  private constructor() {
    this.pending = new Map()
  }

  static getInstance(): RequestDeduplicator {
    if (!RequestDeduplicator.instance) {
      RequestDeduplicator.instance = new RequestDeduplicator()
    }
    return RequestDeduplicator.instance
  }

  async dedupe<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    // If request already pending, return existing promise
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>
    }

    // Otherwise, execute fetch and store promise
    const promise = fetchFn()
      .finally(() => {
        // Clean up after request completes
        this.pending.delete(key)
      })

    this.pending.set(key, promise)
    return promise
  }
}

export default RequestDeduplicator
```

**Usage in WidgetDataService**:
```typescript
async fetchData<TConfig, TData>(
  widgetType: WidgetType,
  config: TConfig
): Promise<TData> {
  const cacheKey = generateCacheKey(widgetType, config)

  return RequestDeduplicator.getInstance().dedupe(
    cacheKey,
    () => this.executeFetch(widgetType, config)
  )
}
```

---

## 4. Service Architecture

### 4.1 GitHubService

Singleton service for all GitHub API interactions.

```typescript
// lib/services/github-service.ts

interface GitHubServiceConfig {
  baseUrl: string
  authToken?: string
  timeout: number
}

class GitHubService {
  private static instance: GitHubService
  private config: GitHubServiceConfig
  private rateLimitInfo: RateLimitInfo | null = null

  private constructor(config?: Partial<GitHubServiceConfig>) {
    this.config = {
      baseUrl: process.env.GITHUB_API_BASE_URL ?? 'https://api.github.com',
      authToken: process.env.GITHUB_TOKEN,
      timeout: 10000,
      ...config
    }
  }

  static getInstance(config?: Partial<GitHubServiceConfig>): GitHubService {
    if (!GitHubService.instance) {
      GitHubService.instance = new GitHubService(config)
    }
    return GitHubService.instance
  }

  /**
   * Fetch repository metadata
   */
  async getRepository(owner: string, repo: string): Promise<RepositoryData> {
    const response = await this.fetch(`/repos/${owner}/${repo}`)
    return this.transformRepositoryData(response)
  }

  /**
   * Fetch stargazers with pagination
   */
  async getStargazers(owner: string, repo: string, options?: {
    page?: number
    perPage?: number
  }): Promise<StargazersData> {
    const params = new URLSearchParams({
      page: String(options?.page ?? 1),
      per_page: String(options?.perPage ?? 100)
    })

    const response = await this.fetch(
      `/repos/${owner}/${repo}/stargazers?${params}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3.star+json' // includes starred_at
        }
      }
    )

    return this.transformStargazersData(response)
  }

  /**
   * Fetch issues with filtering
   */
  async getIssues(owner: string, repo: string, options?: {
    state?: 'open' | 'closed' | 'all'
    since?: string  // ISO 8601 timestamp
    page?: number
    perPage?: number
  }): Promise<IssuesData> {
    const params = new URLSearchParams({
      state: options?.state ?? 'all',
      ...(options?.since && { since: options.since }),
      page: String(options?.page ?? 1),
      per_page: String(options?.perPage ?? 100)
    })

    const response = await this.fetch(`/repos/${owner}/${repo}/issues?${params}`)
    return this.transformIssuesData(response)
  }

  /**
   * Fetch pull requests
   */
  async getPullRequests(owner: string, repo: string, options?: {
    state?: 'open' | 'closed' | 'all'
    page?: number
    perPage?: number
  }): Promise<PullRequestsData> {
    const params = new URLSearchParams({
      state: options?.state ?? 'all',
      page: String(options?.page ?? 1),
      per_page: String(options?.perPage ?? 100)
    })

    const response = await this.fetch(`/repos/${owner}/${repo}/pulls?${params}`)
    return this.transformPullRequestsData(response)
  }

  /**
   * Fetch contributors
   */
  async getContributors(owner: string, repo: string, options?: {
    page?: number
    perPage?: number
  }): Promise<ContributorsData> {
    const params = new URLSearchParams({
      page: String(options?.page ?? 1),
      per_page: String(options?.perPage ?? 100)
    })

    const response = await this.fetch(`/repos/${owner}/${repo}/contributors?${params}`)
    return this.transformContributorsData(response)
  }

  /**
   * Fetch releases
   */
  async getReleases(owner: string, repo: string, options?: {
    page?: number
    perPage?: number
  }): Promise<ReleasesData> {
    const params = new URLSearchParams({
      page: String(options?.page ?? 1),
      per_page: String(options?.perPage ?? 50)
    })

    const response = await this.fetch(`/repos/${owner}/${repo}/releases?${params}`)
    return this.transformReleasesData(response)
  }

  /**
   * Calculate repository health score
   */
  async getHealthScore(owner: string, repo: string): Promise<HealthScoreData> {
    // Fetch multiple endpoints in parallel
    const [repo, commits, issues, community] = await Promise.all([
      this.getRepository(owner, repo),
      this.fetch(`/repos/${owner}/${repo}/commits?per_page=100`),
      this.getIssues(owner, repo, { state: 'all', perPage: 100 }),
      this.fetch(`/repos/${owner}/${repo}/community/profile`)
    ])

    return this.calculateHealthScore({
      repo,
      commits,
      issues,
      community
    })
  }

  /**
   * Core fetch method with error handling and rate limit tracking
   */
  private async fetch(endpoint: string, options?: RequestInit): Promise<any> {
    // Check rate limit before making request
    if (this.rateLimitInfo && this.rateLimitInfo.remaining === 0) {
      const resetTime = new Date(this.rateLimitInfo.reset * 1000)
      if (resetTime > new Date()) {
        throw new GitHubRateLimitError(
          `Rate limit exceeded. Resets at ${resetTime.toISOString()}`,
          this.rateLimitInfo
        )
      }
    }

    const url = `${this.config.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      ...(this.config.authToken && {
        'Authorization': `Bearer ${this.config.authToken}`
      }),
      ...options?.headers
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      })

      // Update rate limit info from response headers
      this.updateRateLimitInfo(response.headers)

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GitHubTimeoutError(`Request to ${endpoint} timed out`)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private updateRateLimitInfo(headers: Headers): void {
    const limit = headers.get('X-RateLimit-Limit')
    const remaining = headers.get('X-RateLimit-Remaining')
    const reset = headers.get('X-RateLimit-Reset')

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10)
      }
    }
  }

  private async handleErrorResponse(response: Response): Promise<Error> {
    const data = await response.json().catch(() => ({}))

    switch (response.status) {
      case 404:
        return new GitHubNotFoundError(data.message ?? 'Resource not found')
      case 403:
        if (data.message?.includes('rate limit')) {
          return new GitHubRateLimitError(data.message, this.rateLimitInfo)
        }
        return new GitHubForbiddenError(data.message ?? 'Forbidden')
      case 401:
        return new GitHubAuthError(data.message ?? 'Unauthorized')
      default:
        return new GitHubApiError(
          data.message ?? `GitHub API error: ${response.status}`,
          response.status
        )
    }
  }

  private transformRepositoryData(raw: any): RepositoryData {
    return {
      id: raw.id,
      name: raw.name,
      fullName: raw.full_name,
      description: raw.description,
      stars: raw.stargazers_count,
      forks: raw.forks_count,
      openIssues: raw.open_issues_count,
      watchers: raw.watchers_count,
      language: raw.language,
      license: raw.license?.name ?? null,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      pushedAt: raw.pushed_at,
      size: raw.size,
      defaultBranch: raw.default_branch,
      archived: raw.archived,
      disabled: raw.disabled,
      homepage: raw.homepage,
      topics: raw.topics ?? []
    }
  }

  // ... other transformation methods
}

export default GitHubService
```

### 4.2 NpmService

Singleton service for npm Registry and npms.io API interactions.

```typescript
// lib/services/npm-service.ts

interface NpmServiceConfig {
  registryUrl: string
  npmsUrl: string
  timeout: number
}

class NpmService {
  private static instance: NpmService
  private config: NpmServiceConfig

  private constructor(config?: Partial<NpmServiceConfig>) {
    this.config = {
      registryUrl: process.env.NPM_REGISTRY_URL ?? 'https://registry.npmjs.org',
      npmsUrl: process.env.NPMS_API_URL ?? 'https://api.npms.io/v2',
      timeout: 10000,
      ...config
    }
  }

  static getInstance(config?: Partial<NpmServiceConfig>): NpmService {
    if (!NpmService.instance) {
      NpmService.instance = new NpmService(config)
    }
    return NpmService.instance
  }

  /**
   * Fetch package metadata from npm registry
   */
  async getPackageMetadata(packageName: string): Promise<PackageMetadata> {
    const url = `${this.config.registryUrl}/${encodeURIComponent(packageName)}`
    const response = await this.fetch(url)
    return this.transformPackageMetadata(response)
  }

  /**
   * Fetch download statistics
   */
  async getDownloadStats(packageName: string, period: string): Promise<DownloadStats> {
    const { start, end } = this.calculateDateRange(period)
    const url = `https://api.npmjs.org/downloads/range/${start}:${end}/${encodeURIComponent(packageName)}`

    const response = await this.fetch(url)
    return this.transformDownloadStats(response, period)
  }

  /**
   * Fetch package health score from npms.io
   */
  async getPackageHealth(packageName: string): Promise<PackageHealth> {
    const url = `${this.config.npmsUrl}/package/${encodeURIComponent(packageName)}`
    const response = await this.fetch(url)
    return this.transformPackageHealth(response)
  }

  /**
   * Analyze package dependencies
   */
  async analyzeDependencies(packageName: string): Promise<DependencyAnalysis> {
    const metadata = await this.getPackageMetadata(packageName)
    const dependencies = {
      ...metadata.dependencies,
      ...metadata.devDependencies
    }

    // Fetch latest versions for all dependencies in parallel
    const dependencyNames = Object.keys(dependencies)
    const latestVersions = await Promise.all(
      dependencyNames.map(dep => this.getLatestVersion(dep))
    )

    // Compare versions and identify issues
    return this.analyzeDependencyVersions(dependencies, latestVersions)
  }

  private async getLatestVersion(packageName: string): Promise<string> {
    try {
      const metadata = await this.getPackageMetadata(packageName)
      return metadata.version
    } catch {
      return 'unknown'
    }
  }

  private async fetch(url: string, options?: RequestInit): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response, url)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NpmTimeoutError(`Request to ${url} timed out`)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private async handleErrorResponse(response: Response, url: string): Promise<Error> {
    if (response.status === 404) {
      return new PackageNotFoundError(`Package not found: ${url}`)
    }

    const text = await response.text().catch(() => '')
    return new NpmApiError(
      `npm API error: ${response.status} - ${text}`,
      response.status
    )
  }

  private calculateDateRange(period: string): { start: string; end: string } {
    const end = new Date()
    const start = new Date()

    switch (period) {
      case '7d':
        start.setDate(end.getDate() - 7)
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        break
      case '90d':
        start.setDate(end.getDate() - 90)
        break
      case '1y':
        start.setFullYear(end.getFullYear() - 1)
        break
      default:
        start.setDate(end.getDate() - 30)
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }

  private transformPackageMetadata(raw: any): PackageMetadata {
    const latest = raw['dist-tags']?.latest ?? Object.keys(raw.versions ?? {}).pop()
    const latestVersion = raw.versions?.[latest] ?? {}

    return {
      name: raw.name,
      version: latest,
      description: latestVersion.description ?? '',
      keywords: latestVersion.keywords ?? [],
      license: latestVersion.license ?? 'UNLICENSED',
      repository: latestVersion.repository ?? null,
      homepage: latestVersion.homepage ?? null,
      author: latestVersion.author ?? null,
      maintainers: raw.maintainers ?? [],
      dependencies: latestVersion.dependencies ?? {},
      devDependencies: latestVersion.devDependencies ?? {},
      publishedAt: raw.time?.[latest] ?? '',
      versions: Object.keys(raw.versions ?? {}),
      distTags: raw['dist-tags'] ?? {}
    }
  }

  // ... other transformation methods
}

export default NpmService
```

### 4.3 WidgetDataService

Orchestration layer that routes widget data requests to appropriate services.

```typescript
// lib/services/widget-data-service.ts

class WidgetDataService {
  private static instance: WidgetDataService
  private githubService: GitHubService
  private npmService: NpmService

  private constructor() {
    this.githubService = GitHubService.getInstance()
    this.npmService = NpmService.getInstance()
  }

  static getInstance(): WidgetDataService {
    if (!WidgetDataService.instance) {
      WidgetDataService.instance = new WidgetDataService()
    }
    return WidgetDataService.instance
  }

  async fetchData<TConfig, TData>(
    widgetType: WidgetType,
    config: TConfig
  ): Promise<TData> {
    switch (widgetType) {
      case 'GH-01':
        return this.fetchGitHubStars(config as GitHubStarsConfig) as Promise<TData>

      case 'GH-02':
        return this.fetchIssueHealth(config as IssueHealthConfig) as Promise<TData>

      case 'GH-03':
        return this.fetchPullRequestActivity(config as PullRequestConfig) as Promise<TData>

      case 'GH-04':
        return this.fetchTopContributors(config as ContributorsConfig) as Promise<TData>

      case 'GH-05':
        return this.fetchReleaseTimeline(config as ReleasesConfig) as Promise<TData>

      case 'GH-06':
        return this.fetchRepositoryHealth(config as HealthScoreConfig) as Promise<TData>

      case 'NPM-01':
        return this.fetchPackageDownloads(config as DownloadsConfig) as Promise<TData>

      case 'NPM-02':
        return this.fetchVersionDistribution(config as VersionDistConfig) as Promise<TData>

      case 'NPM-03':
        return this.fetchPackageHealth(config as PackageHealthConfig) as Promise<TData>

      case 'NPM-04':
        return this.fetchDependencyRisk(config as DependencyConfig) as Promise<TData>

      case 'COMBO-01':
        return this.fetchProjectOverview(config as ProjectOverviewConfig) as Promise<TData>

      case 'COMBO-02':
        return this.fetchGrowthComparison(config as GrowthComparisonConfig) as Promise<TData>

      default:
        throw new Error(`Unknown widget type: ${widgetType}`)
    }
  }

  private async fetchGitHubStars(config: GitHubStarsConfig): Promise<GitHubStarsData> {
    const { owner, repo, period } = config
    const repoData = await this.githubService.getRepository(owner, repo)

    // For MVP, return current stars + simple trend
    // TODO: Implement historical star data fetching
    return {
      repository: {
        owner,
        name: repo,
        totalStars: repoData.stars
      },
      currentStars: repoData.stars,
      trend: 'up', // Placeholder
      periodGrowth: 0, // Placeholder
      history: [] // Placeholder for historical data
    }
  }

  private async fetchIssueHealth(config: IssueHealthConfig): Promise<IssueHealthData> {
    const { owner, repo, period } = config
    const issues = await this.githubService.getIssues(owner, repo, { state: 'all' })

    // Calculate metrics
    const openIssues = issues.filter(i => i.state === 'open')
    const closedIssues = issues.filter(i => i.state === 'closed')

    return {
      summary: {
        totalOpen: openIssues.length,
        totalClosed: closedIssues.length,
        avgTimeToClose: this.calculateAvgTimeToClose(closedIssues),
        issueVelocity: this.calculateIssueVelocity(issues, period)
      },
      timeline: this.buildIssueTimeline(issues, period)
    }
  }

  private async fetchPackageDownloads(config: DownloadsConfig): Promise<DownloadsData> {
    const { packageName, period, granularity } = config
    const stats = await this.npmService.getDownloadStats(packageName, period)

    return {
      package: packageName,
      total: stats.total,
      downloads: stats.downloads,
      summary: {
        average: stats.average,
        peak: stats.peak,
        peakDate: stats.peakDate,
        trend: stats.trend,
        trendPercent: stats.trendPercent
      }
    }
  }

  private async fetchProjectOverview(config: ProjectOverviewConfig): Promise<ProjectOverviewData> {
    const { githubRepo, npmPackage } = config
    const [owner, repo] = githubRepo.split('/')

    // Fetch GitHub and npm data in parallel
    const [ghData, npmData] = await Promise.all([
      this.githubService.getRepository(owner, repo),
      this.npmService.getPackageMetadata(npmPackage)
    ])

    return {
      github: {
        name: ghData.name,
        stars: ghData.stars,
        forks: ghData.forks,
        openIssues: ghData.openIssues,
        latestRelease: null // TODO: Fetch latest release
      },
      npm: {
        name: npmData.name,
        version: npmData.version,
        weeklyDownloads: 0, // TODO: Fetch weekly downloads
        monthlyDownloads: 0, // TODO: Fetch monthly downloads
        license: npmData.license
      },
      correlation: {
        starsToDownloads: 0, // TODO: Calculate ratio
        healthScore: 0 // TODO: Calculate combined score
      }
    }
  }

  // ... other widget data fetching methods
}

export default WidgetDataService
```

---

## 5. Widget Registry Pattern

### 5.1 Widget Type Registry

Central registry of all available widget types with metadata and configuration schemas.

```typescript
// lib/widgets/registry.ts

import { z } from 'zod'

export type WidgetType =
  | 'GH-01' | 'GH-02' | 'GH-03' | 'GH-04' | 'GH-05' | 'GH-06'
  | 'NPM-01' | 'NPM-02' | 'NPM-03' | 'NPM-04'
  | 'COMBO-01' | 'COMBO-02'

export interface WidgetMetadata {
  id: WidgetType
  name: string
  description: string
  category: 'github' | 'npm' | 'combined'
  icon: string
  defaultSize: { w: number; h: number }
  minSize: { w: number; h: number }
  maxSize: { w: number; h: number }
  configSchema: z.ZodObject<any>
  dataSchema: z.ZodObject<any>
  component: React.ComponentType<WidgetComponentProps<any, any>>
}

// Configuration schemas with Zod validation
export const GitHubStarsConfigSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository is required'),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).default('30d'),
  customTitle: z.string().optional()
})

export const IssueHealthConfigSchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository is required'),
  period: z.enum(['7d', '30d', '90d']).default('30d')
})

export const PackageDownloadsConfigSchema = z.object({
  packageName: z.string().min(1, 'Package name is required'),
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  customTitle: z.string().optional()
})

// Widget Registry
export const WIDGET_REGISTRY: Record<WidgetType, WidgetMetadata> = {
  'GH-01': {
    id: 'GH-01',
    name: 'Repository Stars Trend',
    description: 'Track repository popularity growth over time with star count visualization',
    category: 'github',
    icon: 'TrendingUp',
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 8, h: 4 },
    configSchema: GitHubStarsConfigSchema,
    dataSchema: z.object({
      repository: z.object({
        owner: z.string(),
        name: z.string(),
        totalStars: z.number()
      }),
      currentStars: z.number(),
      trend: z.enum(['up', 'down', 'stable']),
      periodGrowth: z.number(),
      history: z.array(z.object({
        date: z.string(),
        count: z.number(),
        delta: z.number()
      }))
    }),
    component: GitHubStarsWidget
  },

  'GH-02': {
    id: 'GH-02',
    name: 'Issue Health Dashboard',
    description: 'Monitor issue management with open/closed ratios and response times',
    category: 'github',
    icon: 'AlertCircle',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 4 },
    configSchema: IssueHealthConfigSchema,
    dataSchema: z.object({
      summary: z.object({
        totalOpen: z.number(),
        totalClosed: z.number(),
        avgTimeToClose: z.number(),
        issueVelocity: z.number()
      }),
      timeline: z.array(z.object({
        date: z.string(),
        opened: z.number(),
        closed: z.number(),
        open: z.number()
      }))
    }),
    component: IssueHealthWidget
  },

  'NPM-01': {
    id: 'NPM-01',
    name: 'Package Downloads Trend',
    description: 'Visualize package adoption with download statistics over time',
    category: 'npm',
    icon: 'Download',
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 8, h: 4 },
    configSchema: PackageDownloadsConfigSchema,
    dataSchema: z.object({
      package: z.string(),
      total: z.number(),
      downloads: z.array(z.object({
        day: z.string(),
        downloads: z.number()
      })),
      summary: z.object({
        average: z.number(),
        peak: z.number(),
        peakDate: z.string(),
        trend: z.enum(['up', 'down', 'stable']),
        trendPercent: z.number()
      })
    }),
    component: PackageDownloadsWidget
  },

  // ... other widget definitions
}

// Type-safe helper functions
export function getWidgetMetadata(type: WidgetType): WidgetMetadata {
  return WIDGET_REGISTRY[type]
}

export function validateWidgetConfig<T extends WidgetType>(
  type: T,
  config: unknown
): z.infer<typeof WIDGET_REGISTRY[T]['configSchema']> {
  const metadata = getWidgetMetadata(type)
  return metadata.configSchema.parse(config)
}

export function getAllWidgets(): WidgetMetadata[] {
  return Object.values(WIDGET_REGISTRY)
}

export function getWidgetsByCategory(category: 'github' | 'npm' | 'combined'): WidgetMetadata[] {
  return getAllWidgets().filter(w => w.category === category)
}
```

### 5.2 Widget Component Interface

Standard interface all widget components must implement:

```typescript
// lib/widgets/types.ts

export interface WidgetComponentProps<TConfig, TData> {
  widgetId: string
  config: TConfig
  data: TData | null
  loading: boolean
  error: Error | null
  onRefresh: () => Promise<void>
  onConfigure: () => void
  onRemove: () => void
  size: { width: number; height: number }
}

export interface WidgetInstance {
  id: string
  type: WidgetType
  config: Record<string, unknown>
  refreshInterval: number
}

export interface WidgetState<TData> {
  data: TData | null
  loading: boolean
  error: Error | null
  lastFetched: Date | null
  isCached: boolean
}
```

### 5.3 Base Widget Component

Abstract base component providing common widget functionality:

```typescript
// components/widgets/base-widget.tsx

import React from 'react'
import { Card } from '@salt-ds/core'
import { WidgetComponentProps } from '@/lib/widgets/types'

export interface BaseWidgetProps<TConfig, TData> extends WidgetComponentProps<TConfig, TData> {
  title: string
  children: (data: TData) => React.ReactNode
}

export function BaseWidget<TConfig, TData>({
  widgetId,
  config,
  data,
  loading,
  error,
  onRefresh,
  onConfigure,
  onRemove,
  size,
  title,
  children
}: BaseWidgetProps<TConfig, TData>) {
  return (
    <Card className="widget-container">
      <WidgetHeader
        title={title}
        onRefresh={onRefresh}
        onConfigure={onConfigure}
        onRemove={onRemove}
        loading={loading}
      />

      <div className="widget-body">
        {loading && <WidgetLoadingState />}
        {error && <WidgetErrorState error={error} onRetry={onRefresh} />}
        {data && !loading && !error && children(data)}
      </div>
    </Card>
  )
}
```

### 5.4 Example Widget Implementation

```typescript
// components/widgets/github-stars-widget.tsx

import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BaseWidget } from './base-widget'
import { WidgetComponentProps } from '@/lib/widgets/types'
import { GitHubStarsConfig, GitHubStarsData } from '@/lib/widgets/types'

export function GitHubStarsWidget(props: WidgetComponentProps<GitHubStarsConfig, GitHubStarsData>) {
  const title = props.config.customTitle ??
    `${props.config.owner}/${props.config.repo} Stars`

  return (
    <BaseWidget {...props} title={title}>
      {(data) => (
        <>
          <div className="metric-summary">
            <div className="metric-value">{data.currentStars.toLocaleString()}</div>
            <div className="metric-label">Total Stars</div>
            <div className={`metric-trend ${data.trend}`}>
              {data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'}
              {' '}
              {data.periodGrowth.toLocaleString()} this period
            </div>
          </div>

          {data.history.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.history}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2670A9"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </BaseWidget>
  )
}
```

---

## 6. Error Handling Strategy

### 6.1 Error Type Hierarchy

```typescript
// lib/errors/index.ts

export class DashboardError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'DashboardError'
  }
}

// GitHub API Errors
export class GitHubApiError extends DashboardError {
  constructor(message: string, public statusCode?: number) {
    super(message, 'GITHUB_API_ERROR')
    this.name = 'GitHubApiError'
  }
}

export class GitHubRateLimitError extends GitHubApiError {
  constructor(message: string, public rateLimitInfo: RateLimitInfo | null) {
    super(message, 403)
    this.code = 'GITHUB_RATE_LIMIT'
    this.name = 'GitHubRateLimitError'
  }
}

export class GitHubNotFoundError extends GitHubApiError {
  constructor(message: string) {
    super(message, 404)
    this.code = 'GITHUB_NOT_FOUND'
    this.name = 'GitHubNotFoundError'
  }
}

export class GitHubAuthError extends GitHubApiError {
  constructor(message: string) {
    super(message, 401)
    this.code = 'GITHUB_AUTH_ERROR'
    this.name = 'GitHubAuthError'
  }
}

export class GitHubForbiddenError extends GitHubApiError {
  constructor(message: string) {
    super(message, 403)
    this.code = 'GITHUB_FORBIDDEN'
    this.name = 'GitHubForbiddenError'
  }
}

export class GitHubTimeoutError extends GitHubApiError {
  constructor(message: string) {
    super(message)
    this.code = 'GITHUB_TIMEOUT'
    this.name = 'GitHubTimeoutError'
  }
}

// npm API Errors
export class NpmApiError extends DashboardError {
  constructor(message: string, public statusCode?: number) {
    super(message, 'NPM_API_ERROR')
    this.name = 'NpmApiError'
  }
}

export class PackageNotFoundError extends NpmApiError {
  constructor(message: string) {
    super(message, 404)
    this.code = 'PACKAGE_NOT_FOUND'
    this.name = 'PackageNotFoundError'
  }
}

export class NpmTimeoutError extends NpmApiError {
  constructor(message: string) {
    super(message)
    this.code = 'NPM_TIMEOUT'
    this.name = 'NpmTimeoutError'
  }
}

// Widget Errors
export class WidgetConfigError extends DashboardError {
  constructor(message: string) {
    super(message, 'WIDGET_CONFIG_ERROR')
    this.name = 'WidgetConfigError'
  }
}

export class WidgetDataError extends DashboardError {
  constructor(message: string) {
    super(message, 'WIDGET_DATA_ERROR')
    this.name = 'WidgetDataError'
  }
}

// Storage Errors
export class StorageError extends DashboardError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR')
    this.name = 'StorageError'
  }
}
```

### 6.2 Error Handler Utilities

```typescript
// lib/errors/handlers.ts

export function getErrorMessage(error: unknown): string {
  if (error instanceof DashboardError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}

export function getErrorCode(error: unknown): string {
  if (error instanceof DashboardError) {
    return error.code
  }

  return 'UNKNOWN_ERROR'
}

export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof GitHubNotFoundError) {
    return 'Repository not found. Please check the owner and repository name.'
  }

  if (error instanceof GitHubRateLimitError) {
    const resetTime = error.rateLimitInfo?.reset
      ? new Date(error.rateLimitInfo.reset * 1000).toLocaleTimeString()
      : 'soon'
    return `GitHub API rate limit exceeded. Please try again at ${resetTime}.`
  }

  if (error instanceof PackageNotFoundError) {
    return 'Package not found on npm. Please check the package name.'
  }

  if (error instanceof GitHubTimeoutError || error instanceof NpmTimeoutError) {
    return 'Request timed out. Please check your internet connection and try again.'
  }

  if (error instanceof GitHubAuthError) {
    return 'GitHub authentication failed. API token may be invalid.'
  }

  if (error instanceof WidgetConfigError) {
    return 'Invalid widget configuration. Please check your settings.'
  }

  if (error instanceof StorageError) {
    return 'Failed to save dashboard. Please check browser storage limits.'
  }

  return 'An unexpected error occurred. Please try again.'
}

export function shouldRetry(error: unknown): boolean {
  if (error instanceof GitHubTimeoutError || error instanceof NpmTimeoutError) {
    return true
  }

  if (error instanceof GitHubApiError) {
    // Retry on 5xx errors, but not on 4xx errors
    return error.statusCode ? error.statusCode >= 500 : false
  }

  if (error instanceof NpmApiError) {
    return error.statusCode ? error.statusCode >= 500 : false
  }

  return false
}

export function getRetryDelay(error: unknown, attemptNumber: number): number {
  if (error instanceof GitHubRateLimitError && error.rateLimitInfo) {
    // Wait until rate limit resets
    const resetTime = error.rateLimitInfo.reset * 1000
    return Math.max(0, resetTime - Date.now())
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, ...
  return Math.min(1000 * Math.pow(2, attemptNumber), 30000)
}
```

### 6.3 Retry Logic with Exponential Backoff

```typescript
// lib/utils/retry.ts

interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  shouldRetry?: (error: unknown) => boolean
  onRetry?: (error: unknown, attempt: number) => void
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
    onRetry
  } = options

  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if this is the last attempt
      if (attempt === maxAttempts - 1) {
        break
      }

      // Check if error is retryable
      if (!shouldRetry(error)) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)

      // Call retry callback
      onRetry?.(error, attempt + 1)

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Usage example
const data = await withRetry(
  () => fetchDataFromAPI(),
  {
    maxAttempts: 3,
    shouldRetry: (error) => shouldRetry(error),
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt} after error:`, error)
    }
  }
)
```

### 6.4 Error Boundary Component

```typescript
// components/error-boundary.tsx

import React from 'react'
import { Banner } from '@salt-ds/core'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: (error: Error, reset: () => void) => React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <Banner status="error">
          <div>
            <strong>Something went wrong</strong>
            <p>{getUserFriendlyErrorMessage(this.state.error)}</p>
            <button onClick={this.reset}>Try Again</button>
          </div>
        </Banner>
      )
    }

    return this.props.children
  }
}
```

---

## 7. Performance Optimization

### 7.1 Caching Strategy Summary

| Data Type | Cache Location | TTL | Rationale |
|-----------|---------------|-----|-----------|
| GitHub repo metadata | Client (memory) | 1 hour | Changes infrequently |
| GitHub stars | Client (memory) | 1 hour | Historical data, slow-changing |
| GitHub issues | Client (memory) | 30 min | More dynamic |
| GitHub PRs | Client (memory) | 30 min | More dynamic |
| GitHub contributors | Client (memory) | 1 hour | Changes slowly |
| GitHub releases | Client (memory) | 1 hour | Infrequent updates |
| GitHub health score | Client (memory) | 2 hours | Expensive computation |
| npm package metadata | Client (memory) | 24 hours | Very static |
| npm downloads | Client (memory) | 1 hour | Daily aggregation |
| npm health score | Client (memory) | 24 hours | Third-party API |
| Dashboard config | LocalStorage | Persistent | User data |
| Widget config | LocalStorage | Persistent | User data |

### 7.2 Parallel Data Fetching

When multiple widgets need data on dashboard load, fetch in parallel:

```typescript
// components/dashboard-canvas.tsx

export function DashboardCanvas({ widgets }: { widgets: WidgetInstance[] }) {
  const [widgetStates, setWidgetStates] = useState<Map<string, WidgetState<any>>>(new Map())

  useEffect(() => {
    // Fetch all widget data in parallel
    const fetchAllWidgets = async () => {
      const widgetDataPromises = widgets.map(async (widget) => {
        try {
          const data = await WidgetDataService.getInstance().fetchData(
            widget.type,
            widget.config
          )
          return { widgetId: widget.id, data, error: null }
        } catch (error) {
          return { widgetId: widget.id, data: null, error: error as Error }
        }
      })

      const results = await Promise.allSettled(widgetDataPromises)

      // Update all widget states at once
      const newStates = new Map()
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newStates.set(widgets[index].id, {
            data: result.value.data,
            loading: false,
            error: result.value.error,
            lastFetched: new Date(),
            isCached: false
          })
        }
      })

      setWidgetStates(newStates)
    }

    fetchAllWidgets()
  }, [widgets])

  // ...
}
```

### 7.3 Lazy Loading Widgets

Use React.lazy and Suspense for code splitting:

```typescript
// lib/widgets/lazy-widgets.ts

import { lazy } from 'react'

export const LazyGitHubStarsWidget = lazy(() =>
  import('@/components/widgets/github-stars-widget').then(m => ({
    default: m.GitHubStarsWidget
  }))
)

export const LazyIssueHealthWidget = lazy(() =>
  import('@/components/widgets/issue-health-widget').then(m => ({
    default: m.IssueHealthWidget
  }))
)

export const LazyPackageDownloadsWidget = lazy(() =>
  import('@/components/widgets/package-downloads-widget').then(m => ({
    default: m.PackageDownloadsWidget
  }))
)

// ... other widgets

// Dynamic widget loading
export function getWidgetComponent(type: WidgetType) {
  switch (type) {
    case 'GH-01': return LazyGitHubStarsWidget
    case 'GH-02': return LazyIssueHealthWidget
    case 'NPM-01': return LazyPackageDownloadsWidget
    // ... other cases
    default: throw new Error(`Unknown widget type: ${type}`)
  }
}
```

### 7.4 react-grid-layout Optimization

```typescript
// components/dashboard-canvas.tsx

import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'

export function DashboardCanvas() {
  const [layout, setLayout] = useState<Layout[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout)

    // Debounce persistence to avoid excessive writes
    debouncedSaveLayout(newLayout)
  }, [])

  const debouncedSaveLayout = useMemo(
    () => debounce((layout: Layout[]) => {
      DashboardContext.updateLayout(layout)
    }, 1000),
    []
  )

  return (
    <GridLayout
      className="dashboard-grid"
      layout={layout}
      cols={12}
      rowHeight={80}
      width={1200}
      margin={[16, 16]}
      containerPadding={[24, 24]}
      isDraggable={true}
      isResizable={true}
      onLayoutChange={handleLayoutChange}
      onDragStart={() => setIsDragging(true)}
      onDragStop={() => setIsDragging(false)}
      onResizeStart={() => setIsDragging(true)}
      onResizeStop={() => setIsDragging(false)}
      // Performance optimizations
      useCSSTransforms={true}
      compactType="vertical"
      preventCollision={false}
    >
      {widgets.map((widget) => (
        <div key={widget.id} data-grid={getLayoutItem(widget.id)}>
          <Suspense fallback={<WidgetLoadingSkeleton />}>
            <WidgetRenderer widget={widget} isDragging={isDragging} />
          </Suspense>
        </div>
      ))}
    </GridLayout>
  )
}
```

### 7.5 Debouncing and Throttling

```typescript
// lib/utils/debounce.ts

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
```

---

## 8. Type System

### 8.1 Core Type Definitions

```typescript
// types/index.ts

export type WidgetType =
  | 'GH-01' | 'GH-02' | 'GH-03' | 'GH-04' | 'GH-05' | 'GH-06'
  | 'NPM-01' | 'NPM-02' | 'NPM-03' | 'NPM-04'
  | 'COMBO-01' | 'COMBO-02'

export type RefreshInterval = 0 | 60000 | 300000 | 900000 | 1800000 | 3600000
// 0 = manual, 1min, 5min, 15min, 30min, 1hr

export interface Dashboard {
  id: string
  name: string
  createdAt: string
  modifiedAt: string
  widgets: WidgetInstance[]
  layout: Layout[]
}

export interface WidgetInstance {
  id: string
  type: WidgetType
  config: Record<string, unknown>
  refreshInterval: RefreshInterval
}

export interface Layout {
  i: string    // widget id
  x: number    // grid column position
  y: number    // grid row position
  w: number    // width in grid columns
  h: number    // height in grid rows
  minW?: number
  maxW?: number
  minH?: number
  maxH?: number
  static?: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  defaultRefreshInterval: RefreshInterval
  compactMode: boolean
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number  // Unix timestamp
}
```

### 8.2 Widget-Specific Types

```typescript
// types/widgets.ts

// GitHub Stars (GH-01)
export interface GitHubStarsConfig {
  owner: string
  repo: string
  period: '7d' | '30d' | '90d' | '1y' | 'all'
  customTitle?: string
}

export interface GitHubStarsData {
  repository: {
    owner: string
    name: string
    totalStars: number
  }
  currentStars: number
  trend: 'up' | 'down' | 'stable'
  periodGrowth: number
  history: Array<{
    date: string
    count: number
    delta: number
  }>
}

// Issue Health (GH-02)
export interface IssueHealthConfig {
  owner: string
  repo: string
  period: '7d' | '30d' | '90d'
}

export interface IssueHealthData {
  summary: {
    totalOpen: number
    totalClosed: number
    avgTimeToClose: number
    issueVelocity: number
  }
  timeline: Array<{
    date: string
    opened: number
    closed: number
    open: number
  }>
}

// Package Downloads (NPM-01)
export interface DownloadsConfig {
  packageName: string
  period: '7d' | '30d' | '90d' | '1y'
  granularity: 'daily' | 'weekly' | 'monthly'
  customTitle?: string
}

export interface DownloadsData {
  package: string
  total: number
  downloads: Array<{
    day: string
    downloads: number
  }>
  summary: {
    average: number
    peak: number
    peakDate: string
    trend: 'up' | 'down' | 'stable'
    trendPercent: number
  }
}

// ... other widget types
```

### 8.3 API Response Types

```typescript
// types/api.ts

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
    retryAfter?: number
  }
  cached: boolean
  timestamp: string
}

export interface RepositoryData {
  id: number
  name: string
  fullName: string
  description: string
  stars: number
  forks: number
  openIssues: number
  watchers: number
  language: string
  license: string | null
  createdAt: string
  updatedAt: string
  pushedAt: string
  size: number
  defaultBranch: string
  archived: boolean
  disabled: boolean
  homepage: string | null
  topics: string[]
}

export interface PackageMetadata {
  name: string
  version: string
  description: string
  keywords: string[]
  license: string
  repository: {
    type: string
    url: string
  } | null
  homepage: string | null
  author: {
    name: string
    email?: string
  } | null
  maintainers: Array<{
    name: string
    email: string
  }>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  publishedAt: string
  versions: string[]
  distTags: Record<string, string>
}
```

---

## 9. Caching Strategy

### 9.1 Multi-Layer Cache Architecture

```
┌─────────────────────────────────────────────┐
│  Request Layer                              │
│  (Widget Data Fetch)                        │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Layer 1: In-Memory Cache (Map)             │
│  - Fastest access                           │
│  - Lost on page reload                      │
│  - Max 100 entries (LRU eviction)           │
└────────────┬────────────────────────────────┘
             │ Cache Miss
             ▼
┌─────────────────────────────────────────────┐
│  Layer 2: SessionStorage                    │
│  - Persists during session                  │
│  - Lost on tab close                        │
│  - ~5MB limit                               │
└────────────┬────────────────────────────────┘
             │ Cache Miss
             ▼
┌─────────────────────────────────────────────┐
│  Layer 3: API Request                       │
│  - Fetch from backend API route             │
│  - Backend may have server cache            │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  External API (GitHub/npm)                  │
└─────────────────────────────────────────────┘
```

### 9.2 Cache Invalidation Strategies

```typescript
// lib/cache-invalidation.ts

export enum InvalidationStrategy {
  TIME_BASED = 'time-based',        // TTL expiration
  MANUAL = 'manual',                // User refresh action
  EVENT_BASED = 'event-based',      // Config change triggers invalidation
  PATTERN = 'pattern'               // Invalidate multiple related keys
}

export class CacheInvalidator {
  private cacheManager: CacheManager

  constructor(cacheManager: CacheManager) {
    this.cacheManager = cacheManager
  }

  /**
   * Invalidate cache for specific widget instance
   */
  invalidateWidget(widgetId: string, widgetType: WidgetType, config: Record<string, unknown>): void {
    const cacheKey = generateCacheKey(widgetType, config)
    this.cacheManager.invalidate(cacheKey)
  }

  /**
   * Invalidate all caches for a repository
   */
  invalidateRepository(owner: string, repo: string): void {
    const pattern = new RegExp(`GH-\\d{2}:.*"owner":"${owner}".*"repo":"${repo}"`)
    this.cacheManager.invalidatePattern(pattern)
  }

  /**
   * Invalidate all caches for a package
   */
  invalidatePackage(packageName: string): void {
    const pattern = new RegExp(`NPM-\\d{2}:.*"package(Name)?":"${packageName}"`)
    this.cacheManager.invalidatePattern(pattern)
  }

  /**
   * Invalidate all caches (e.g., user logout or settings reset)
   */
  invalidateAll(): void {
    this.cacheManager.clear()
  }
}
```

### 9.3 Cache Warming

Pre-fetch data for widgets that are likely to be added:

```typescript
// lib/cache-warming.ts

export class CacheWarmer {
  private widgetDataService: WidgetDataService

  async warmPopularWidgets(): Promise<void> {
    // Warm cache for commonly used repositories
    const popularRepos = [
      { owner: 'facebook', repo: 'react' },
      { owner: 'microsoft', repo: 'typescript' },
      { owner: 'vercel', repo: 'next.js' }
    ]

    const warmingPromises = popularRepos.map(({ owner, repo }) =>
      this.widgetDataService.fetchData('GH-01', { owner, repo, period: '30d' })
        .catch(() => {}) // Silently fail warming attempts
    )

    await Promise.allSettled(warmingPromises)
  }

  async warmDashboardWidgets(dashboard: Dashboard): Promise<void> {
    // Pre-fetch data for all widgets in dashboard
    const fetchPromises = dashboard.widgets.map(widget =>
      this.widgetDataService.fetchData(widget.type, widget.config)
        .catch(() => {})
    )

    await Promise.allSettled(fetchPromises)
  }
}
```

---

## 10. Security Considerations

### 10.1 API Token Management

```typescript
// Environment variables (never expose to client)
// .env.local

GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NPM_REGISTRY_URL=https://registry.npmjs.org
NPMS_API_URL=https://api.npms.io/v2

// Server-side only access
// lib/config/server-config.ts

export const serverConfig = {
  github: {
    token: process.env.GITHUB_TOKEN,
    baseUrl: process.env.GITHUB_API_BASE_URL ?? 'https://api.github.com'
  },
  npm: {
    registryUrl: process.env.NPM_REGISTRY_URL ?? 'https://registry.npmjs.org',
    npmsUrl: process.env.NPMS_API_URL ?? 'https://api.npms.io/v2'
  }
} as const

// Ensure this config is never imported in client-side code
if (typeof window !== 'undefined') {
  throw new Error('serverConfig should only be imported server-side')
}
```

### 10.2 Input Validation

All user inputs validated with Zod schemas:

```typescript
// lib/validation/schemas.ts

import { z } from 'zod'

export const RepositoryParamsSchema = z.object({
  owner: z.string()
    .min(1, 'Owner is required')
    .max(100, 'Owner too long')
    .regex(/^[a-zA-Z0-9-]+$/, 'Invalid owner format'),

  repo: z.string()
    .min(1, 'Repository is required')
    .max(100, 'Repository name too long')
    .regex(/^[a-zA-Z0-9-_.]+$/, 'Invalid repository format')
})

export const PackageNameSchema = z.string()
  .min(1, 'Package name is required')
  .max(214, 'Package name too long') // npm limit
  .regex(
    /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
    'Invalid package name format'
  )

// Usage in API routes
export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  try {
    // Validate inputs
    const validated = RepositoryParamsSchema.parse(params)

    // Proceed with validated data
    const data = await githubService.getRepository(validated.owner, validated.repo)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid request parameters',
          details: error.errors
        }
      }, { status: 400 })
    }

    throw error
  }
}
```

### 10.3 Rate Limiting

Client-side rate limiting to prevent abuse:

```typescript
// lib/rate-limiting/client-limiter.ts

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export class ClientRateLimiter {
  private requests: Map<string, number[]>
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.requests = new Map()
    this.config = config
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get existing requests for this key
    const keyRequests = this.requests.get(key) ?? []

    // Filter out requests outside the window
    const recentRequests = keyRequests.filter(timestamp => timestamp > windowStart)

    // Update stored requests
    this.requests.set(key, recentRequests)

    // Check if limit exceeded
    return recentRequests.length < this.config.maxRequests
  }

  recordRequest(key: string): void {
    const now = Date.now()
    const keyRequests = this.requests.get(key) ?? []
    keyRequests.push(now)
    this.requests.set(key, keyRequests)
  }

  getRemainingRequests(key: string): number {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    const keyRequests = this.requests.get(key) ?? []
    const recentRequests = keyRequests.filter(timestamp => timestamp > windowStart)

    return Math.max(0, this.config.maxRequests - recentRequests.length)
  }

  getResetTime(key: string): number {
    const keyRequests = this.requests.get(key) ?? []
    if (keyRequests.length === 0) return Date.now()

    const oldestRequest = Math.min(...keyRequests)
    return oldestRequest + this.config.windowMs
  }
}

// Global instance
export const rateLimiter = new ClientRateLimiter({
  maxRequests: 100,    // 100 requests
  windowMs: 60000      // per minute
})

// Usage in API client
async function fetchFromAPI(url: string): Promise<Response> {
  if (!rateLimiter.canMakeRequest(url)) {
    const resetTime = new Date(rateLimiter.getResetTime(url))
    throw new Error(`Rate limit exceeded. Try again at ${resetTime.toLocaleTimeString()}`)
  }

  rateLimiter.recordRequest(url)
  return fetch(url)
}
```

### 10.4 XSS Prevention

All user-generated content sanitized:

```typescript
// lib/security/sanitize.ts

import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title']
  })
}

export function sanitizeDashboardName(name: string): string {
  // Remove potential XSS vectors
  return name
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 100) // Max length
}

// Usage in components
function DashboardTitle({ name }: { name: string }) {
  const sanitized = sanitizeDashboardName(name)
  return <h1>{sanitized}</h1>
}
```

### 10.5 CORS Configuration

```typescript
// next.config.js

module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN ?? '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' }
        ]
      }
    ]
  }
}
```

---

## Summary

This integration architecture provides:

1. **Comprehensive API Routes** for GitHub and npm data sources with type-safe interfaces
2. **Efficient Data Flow** using React hooks, caching, and request deduplication
3. **Robust Service Layer** with singleton pattern and error handling
4. **Flexible Widget Registry** supporting dynamic widget loading and validation
5. **Sophisticated Error Handling** with retry logic and user-friendly messages
6. **Performance Optimizations** including multi-layer caching, parallel fetching, and lazy loading
7. **Type Safety** throughout the stack with TypeScript and Zod validation
8. **Multi-Layer Caching** with TTL-based invalidation and cache warming
9. **Security Best Practices** for token management, input validation, and XSS prevention

The architecture is designed for scalability, maintainability, and optimal user experience while respecting API rate limits and minimizing redundant requests.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-01
**Output Location**: `.claude/outputs/design/agents/system-architect/dashboard-builder-20251101-220250/integration-architecture.md`
