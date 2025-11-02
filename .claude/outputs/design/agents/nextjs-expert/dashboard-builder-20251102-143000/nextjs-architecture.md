# Next.js 15 Architecture: Dashboard Builder

**Project**: dashboard-builder
**Timestamp**: 20251102-143000
**Framework**: Next.js 15 with App Router, React 19, TypeScript 5

## 1. App Router Structure

```
app/
├── layout.tsx                          # Root layout with Salt DS theme provider
├── page.tsx                            # Landing page (dashboard list)
├── error.tsx                           # Root error boundary
├── not-found.tsx                       # 404 page
├── loading.tsx                         # Root loading UI
│
├── (dashboard)/                        # Route group for dashboard features
│   ├── layout.tsx                      # Dashboard shell layout
│   ├── dashboards/
│   │   ├── page.tsx                    # Dashboard management page (Server Component)
│   │   ├── loading.tsx                 # Loading skeleton
│   │   └── [dashboardId]/
│   │       ├── page.tsx                # Individual dashboard view (async params)
│   │       ├── loading.tsx             # Dashboard loading state
│   │       ├── error.tsx               # Dashboard error boundary
│   │       └── edit/
│   │           └── page.tsx            # Dashboard edit mode
│   │
│   └── widgets/
│       ├── page.tsx                    # Widget catalog preview (Server Component)
│       └── [widgetType]/
│           └── page.tsx                # Widget detail/preview page
│
├── api/                                # API routes (Edge Runtime)
│   ├── github/
│   │   ├── repository/
│   │   │   └── route.ts                # GET /api/github/repository?owner=X&repo=Y
│   │   ├── issues/
│   │   │   └── route.ts                # GET /api/github/issues?owner=X&repo=Y
│   │   ├── pulls/
│   │   │   └── route.ts                # GET /api/github/pulls?owner=X&repo=Y
│   │   ├── contributors/
│   │   │   └── route.ts                # GET /api/github/contributors?owner=X&repo=Y
│   │   ├── releases/
│   │   │   └── route.ts                # GET /api/github/releases?owner=X&repo=Y
│   │   └── stars/
│   │       └── route.ts                # GET /api/github/stars?owner=X&repo=Y&period=30d
│   │
│   ├── npm/
│   │   ├── package/
│   │   │   └── route.ts                # GET /api/npm/package?name=X
│   │   ├── downloads/
│   │   │   └── route.ts                # GET /api/npm/downloads?package=X&period=last-month
│   │   ├── versions/
│   │   │   └── route.ts                # GET /api/npm/versions?package=X
│   │   └── quality/
│   │       └── route.ts                # GET /api/npm/quality?package=X (npms.io)
│   │
│   └── health/
│       └── route.ts                    # GET /api/health (deployment verification)
│
└── _components/                        # Shared components (prefix convention)
    ├── providers/
    │   ├── salt-theme-provider.tsx     # 'use client' - Salt DS theme
    │   └── query-provider.tsx          # 'use client' - React Query (if used)
    │
    ├── dashboard/
    │   ├── dashboard-grid.tsx          # 'use client' - react-grid-layout wrapper
    │   ├── dashboard-header.tsx        # Server Component
    │   ├── dashboard-toolbar.tsx       # 'use client' - actions
    │   └── dashboard-filters.tsx       # 'use client' - sidebar filters
    │
    ├── widgets/
    │   ├── widget-wrapper.tsx          # 'use client' - base widget container
    │   ├── widget-registry.ts          # Widget factory pattern
    │   ├── base/
    │   │   ├── chart-widget.tsx        # 'use client' - Recharts wrapper
    │   │   ├── metric-widget.tsx       # 'use client' - stat cards
    │   │   ├── table-widget.tsx        # 'use client' - data tables
    │   │   └── list-widget.tsx         # 'use client' - list views
    │   │
    │   └── implementations/
    │       ├── github-stars-widget.tsx          # 'use client'
    │       ├── github-issues-widget.tsx         # 'use client'
    │       ├── npm-downloads-widget.tsx         # 'use client'
    │       └── [...other-widgets].tsx           # 'use client'
    │
    ├── catalog/
    │   ├── widget-catalog.tsx          # 'use client' - sidebar catalog
    │   ├── widget-card.tsx             # Server Component
    │   └── widget-search.tsx           # 'use client' - search/filter
    │
    └── ui/                             # Salt DS component wrappers
        ├── button.tsx                  # Re-export from Salt DS
        ├── card.tsx
        ├── dialog.tsx
        └── [...other-components].tsx
```

## 2. Server vs Client Components Strategy

### Server Components (Default)

**Usage**: Static layouts, data fetching, SEO content, initial page structure

```typescript
// app/(dashboard)/dashboards/page.tsx
// Server Component - No 'use client' directive

import { Metadata } from 'next';
import { DashboardList } from '@/app/_components/dashboard/dashboard-list';

export const metadata: Metadata = {
  title: 'My Dashboards | Dashboard Builder',
  description: 'Manage your data visualization dashboards',
};

export default async function DashboardsPage() {
  // Server-side data operations (if needed)
  // No state, no browser APIs

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Dashboards</h1>
      {/* Client component will handle localStorage interactions */}
      <DashboardList />
    </div>
  );
}
```

**Server Component Examples**:
- `app/layout.tsx` - Root layout structure
- `app/(dashboard)/dashboards/page.tsx` - Dashboard list page
- `app/_components/dashboard/dashboard-header.tsx` - Static headers
- `app/_components/catalog/widget-card.tsx` - Widget metadata cards

### Client Components ('use client')

**Usage**: Interactivity, browser APIs, state management, event handlers

```typescript
// app/_components/dashboard/dashboard-grid.tsx
'use client';

import { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { WidgetWrapper } from '@/app/_components/widgets/widget-wrapper';
import { useDashboardStore } from '@/lib/stores/dashboard-store';

interface DashboardGridProps {
  dashboardId: string;
}

export function DashboardGrid({ dashboardId }: DashboardGridProps) {
  const [mounted, setMounted] = useState(false);
  const { layouts, widgets, updateLayout } = useDashboardStore(dashboardId);

  // Avoid hydration mismatch with localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <GridLayout
      className="dashboard-grid"
      layout={layouts}
      onLayoutChange={(newLayout) => updateLayout(dashboardId, newLayout)}
      cols={12}
      rowHeight={80}
      width={1200}
      draggableHandle=".widget-drag-handle"
    >
      {widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetWrapper widget={widget} />
        </div>
      ))}
    </GridLayout>
  );
}
```

**Client Component Examples**:
- `app/_components/dashboard/dashboard-grid.tsx` - react-grid-layout
- `app/_components/widgets/*` - All widget implementations
- `app/_components/catalog/widget-catalog.tsx` - Sidebar with state
- `app/_components/providers/salt-theme-provider.tsx` - Theme context

### Hydration Safety Pattern

```typescript
// Pattern to avoid hydration mismatches with localStorage
'use client';

import { useState, useEffect } from 'react';

export function ClientOnlyComponent() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Only access localStorage after mount
    const stored = localStorage.getItem('dashboard-config');
    setData(stored ? JSON.parse(stored) : null);
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return loading state matching server render
    return <div className="h-screen animate-pulse bg-gray-100" />;
  }

  return <div>{/* Render with client data */}</div>;
}
```

## 3. API Routes (Edge Runtime)

### GitHub API Proxy Route

```typescript
// app/api/github/repository/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime for low latency
export const runtime = 'edge';

// Disable caching for API routes with dynamic data
export const dynamic = 'force-dynamic';

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters: owner, repo' },
        { status: 400 }
      );
    }

    // Validate GitHub token exists
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Dashboard-Builder',
        },
        // Cache for 5 minutes at edge
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: `GitHub API error: ${response.status}`,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data: GitHubRepository = await response.json();

    // Return with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('GitHub API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### npm API Proxy Route

```typescript
// app/api/npm/downloads/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface DownloadStats {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageName = searchParams.get('package');
    const period = searchParams.get('period') || 'last-month';

    if (!packageName) {
      return NextResponse.json(
        { error: 'Missing required parameter: package' },
        { status: 400 }
      );
    }

    // npm API doesn't require authentication
    const response = await fetch(
      `https://api.npmjs.org/downloads/point/${period}/${packageName}`,
      {
        headers: {
          'User-Agent': 'Dashboard-Builder',
        },
        // Cache for 1 hour (npm data updates daily)
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `npm API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: DownloadStats = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('npm API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Health Check Route

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    githubTokenConfigured: !!process.env.GITHUB_TOKEN,
  };

  return NextResponse.json(health, { status: 200 });
}
```

## 4. Data Fetching Patterns

### Server-Side Data Fetching (Server Components)

```typescript
// Server Component - async function, direct fetch
export default async function WidgetCatalogPage() {
  // Fetch at build time or request time
  const widgets = await getWidgetCatalog();

  return (
    <div>
      <h1>Widget Catalog</h1>
      {widgets.map(widget => (
        <WidgetCard key={widget.id} widget={widget} />
      ))}
    </div>
  );
}

// Utility function for server-side fetching
async function getWidgetCatalog() {
  // This runs on the server, can access environment variables
  const response = await fetch('https://api.example.com/widgets', {
    next: { revalidate: 3600 }, // ISR: revalidate every hour
  });
  return response.json();
}
```

### Client-Side Data Fetching Pattern

```typescript
// app/_components/widgets/implementations/github-stars-widget.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChartWidget } from '@/app/_components/widgets/base/chart-widget';
import { useWidgetData } from '@/lib/hooks/use-widget-data';

interface GitHubStarsWidgetProps {
  widgetId: string;
  config: {
    owner: string;
    repo: string;
    period: string;
  };
}

export function GitHubStarsWidget({ widgetId, config }: GitHubStarsWidgetProps) {
  const { data, loading, error, refetch } = useWidgetData({
    widgetId,
    endpoint: '/api/github/stars',
    params: {
      owner: config.owner,
      repo: config.repo,
      period: config.period,
    },
    // Client-side cache duration
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  if (loading) {
    return <div className="animate-pulse">Loading stars data...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>Failed to load data</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <ChartWidget
      title={`${config.repo} Stars`}
      data={data}
      chartType="line"
      xKey="date"
      yKey="stars"
    />
  );
}
```

### Custom Data Fetching Hook

```typescript
// lib/hooks/use-widget-data.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWidgetDataOptions {
  widgetId: string;
  endpoint: string;
  params: Record<string, string>;
  cacheTime?: number;
}

interface WidgetDataResult<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const dataCache = new Map<string, { data: any; timestamp: number }>();

export function useWidgetData<T = any>({
  widgetId,
  endpoint,
  params,
  cacheTime = 5 * 60 * 1000, // Default 5 minutes
}: UseWidgetDataOptions): WidgetDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const url = `${endpoint}?${new URLSearchParams(params).toString()}`;
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update cache
      dataCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        console.error(`Widget ${widgetId} fetch error:`, err);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, cacheKey, cacheTime, widgetId]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

### Parallel Data Fetching

```typescript
// Server Component with parallel fetching
export default async function DashboardOverviewPage() {
  // Fetch multiple data sources in parallel
  const [githubStats, npmStats, recentActivity] = await Promise.all([
    fetch('/api/github/repository?owner=X&repo=Y').then(r => r.json()),
    fetch('/api/npm/package?name=Z').then(r => r.json()),
    fetch('/api/github/issues?owner=X&repo=Y&state=open').then(r => r.json()),
  ]);

  return (
    <div>
      <RepoStats data={githubStats} />
      <PackageStats data={npmStats} />
      <ActivityFeed data={recentActivity} />
    </div>
  );
}
```

## 5. Metadata & SEO

### Static Metadata

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard Builder | Data Visualization Platform',
    template: '%s | Dashboard Builder',
  },
  description: 'Create customizable data visualization dashboards using GitHub and npm APIs',
  keywords: ['dashboard', 'data visualization', 'GitHub', 'npm', 'analytics'],
  authors: [{ name: 'Dashboard Builder Team' }],
  creator: 'Dashboard Builder',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dashboard-builder.vercel.app',
    siteName: 'Dashboard Builder',
    title: 'Dashboard Builder | Data Visualization Platform',
    description: 'Create customizable data visualization dashboards',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dashboard Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard Builder | Data Visualization Platform',
    description: 'Create customizable data visualization dashboards',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### Dynamic Metadata (Next.js 15)

```typescript
// app/(dashboard)/dashboards/[dashboardId]/page.tsx
import { Metadata } from 'next';

interface DashboardPageProps {
  params: Promise<{ dashboardId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: DashboardPageProps): Promise<Metadata> {
  // MUST await params in Next.js 15
  const resolvedParams = await params;
  const dashboardId = resolvedParams.dashboardId;

  // Fetch dashboard data (server-side only)
  // In this case, localStorage is client-only, so use default metadata
  // For server-fetched data:
  // const dashboard = await getDashboard(dashboardId);

  return {
    title: `Dashboard ${dashboardId}`,
    description: `View and edit dashboard ${dashboardId}`,
    openGraph: {
      title: `Dashboard ${dashboardId}`,
      description: 'Data visualization dashboard',
      type: 'website',
    },
  };
}

export default async function DashboardPage({
  params,
  searchParams,
}: DashboardPageProps) {
  // Await params in Next.js 15
  const resolvedParams = await params;
  const dashboardId = resolvedParams.dashboardId;

  return (
    <div>
      <h1>Dashboard: {dashboardId}</h1>
      {/* Client component handles data loading */}
      <DashboardGrid dashboardId={dashboardId} />
    </div>
  );
}
```

### Robots and Sitemap

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_components/'],
    },
    sitemap: 'https://dashboard-builder.vercel.app/sitemap.xml',
  };
}

// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://dashboard-builder.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://dashboard-builder.vercel.app/dashboards',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://dashboard-builder.vercel.app/widgets',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];
}
```

## 6. Performance Optimizations

### Lazy Loading with Dynamic Imports

```typescript
// app/(dashboard)/dashboards/[dashboardId]/page.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const DashboardGrid = dynamic(
  () => import('@/app/_components/dashboard/dashboard-grid').then(mod => ({ default: mod.DashboardGrid })),
  {
    loading: () => <div className="h-screen animate-pulse bg-gray-100" />,
    ssr: false, // Disable SSR for client-only components
  }
);

const WidgetCatalog = dynamic(
  () => import('@/app/_components/catalog/widget-catalog').then(mod => ({ default: mod.WidgetCatalog })),
  {
    loading: () => <div>Loading catalog...</div>,
    ssr: false,
  }
);

export default async function DashboardPage({ params }: DashboardPageProps) {
  const resolvedParams = await params;

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r">
        <WidgetCatalog />
      </aside>
      <main className="flex-1">
        <DashboardGrid dashboardId={resolvedParams.dashboardId} />
      </main>
    </div>
  );
}
```

### Code Splitting by Route

```typescript
// Automatic code splitting by route
// Each page in app/ directory is automatically split

// Manual splitting for large component libraries
const Recharts = dynamic(() => import('recharts'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,
});

// Lazy load widget implementations
const widgetRegistry = {
  'github-stars': dynamic(() => import('./implementations/github-stars-widget')),
  'npm-downloads': dynamic(() => import('./implementations/npm-downloads-widget')),
  // ... other widgets
};
```

### Image Optimization

```typescript
// app/_components/ui/optimized-image.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, width, height, priority = false }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,..." // Low-quality placeholder
      loading={priority ? 'eager' : 'lazy'}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
    />
  );
}
```

### Streaming with Suspense

```typescript
// app/(dashboard)/dashboards/[dashboardId]/page.tsx
import { Suspense } from 'react';

export default async function DashboardPage({ params }: DashboardPageProps) {
  const resolvedParams = await params;

  return (
    <div>
      <DashboardHeader dashboardId={resolvedParams.dashboardId} />

      <Suspense fallback={<DashboardGridSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <DashboardGridData dashboardId={resolvedParams.dashboardId} />
      </Suspense>
    </div>
  );
}

// Skeleton loading component
function DashboardGridSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="col-span-4 h-64 animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}
```

### Caching Strategy

```typescript
// Route Segment Config for static pages
// app/(dashboard)/widgets/page.tsx
export const revalidate = 3600; // ISR: revalidate every hour
export const dynamic = 'force-static'; // Force static generation
export const fetchCache = 'force-cache'; // Aggressive caching

// For dynamic pages with frequent updates
// app/(dashboard)/dashboards/[dashboardId]/page.tsx
export const dynamic = 'force-dynamic'; // Always server-render
export const revalidate = 0; // No caching
```

### Bundle Analysis Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable bundle analyzer in development
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for dependencies
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared components
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Recharts separate chunk (large library)
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            chunks: 'all',
            priority: 30,
          },
        },
      };
    }
    return config;
  },

  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

module.exports = nextConfig;
```

### Prefetching Strategy

```typescript
// app/_components/dashboard/dashboard-list.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function DashboardList({ dashboards }: { dashboards: Dashboard[] }) {
  const router = useRouter();

  // Prefetch on hover for faster navigation
  const handleMouseEnter = (dashboardId: string) => {
    router.prefetch(`/dashboards/${dashboardId}`);
  };

  return (
    <div className="grid gap-4">
      {dashboards.map(dashboard => (
        <Link
          key={dashboard.id}
          href={`/dashboards/${dashboard.id}`}
          onMouseEnter={() => handleMouseEnter(dashboard.id)}
          className="block rounded-lg border p-4 hover:bg-gray-50"
        >
          <h3>{dashboard.name}</h3>
          <p>{dashboard.widgetCount} widgets</p>
        </Link>
      ))}
    </div>
  );
}
```

## Key Implementation Requirements

### Environment Variables

```bash
# .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env.production (Vercel)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dashboard-builder.vercel.app
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Performance Targets

- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.9s
- **Cumulative Layout Shift**: < 0.1
- **Initial JS Bundle**: < 300KB (gzipped)
- **API Response Time**: < 500ms (cached)
- **Dashboard Load Time**: < 2s (10+ widgets)

## Deployment Configuration

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "GITHUB_TOKEN": "@github-token"
  },
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=300, stale-while-revalidate=600"
        }
      ]
    }
  ]
}
```

### Edge Runtime Benefits

- **Low Latency**: API routes run at edge locations closest to users
- **Global Distribution**: Automatic global deployment
- **No Cold Starts**: Always warm, sub-50ms response times
- **Automatic Scaling**: Handles traffic spikes without configuration

## Critical Patterns Summary

1. **Always await params/searchParams in Next.js 15 dynamic routes**
2. **Use 'use client' only when necessary** (state, events, browser APIs)
3. **Implement hydration-safe patterns** for localStorage access
4. **Proxy all API calls through Edge Functions** to secure tokens
5. **Leverage aggressive caching** (5min GitHub, 1hr npm)
6. **Use dynamic imports** for heavy components (Recharts, react-grid-layout)
7. **Implement Suspense boundaries** for progressive loading
8. **Configure proper metadata** for SEO and social sharing
9. **Monitor bundle sizes** and implement code splitting
10. **Use TypeScript strictly** for type safety across components

This architecture provides a production-ready, performant Next.js 15 application optimized for Vercel deployment with proper separation of server and client concerns, efficient data fetching, and scalable widget architecture.
