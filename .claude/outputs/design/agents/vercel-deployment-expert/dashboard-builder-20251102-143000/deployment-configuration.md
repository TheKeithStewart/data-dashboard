# Vercel Deployment Configuration

**Project**: dashboard-builder
**Timestamp**: 20251102-143000
**Platform**: Vercel
**Framework**: Next.js 15

## 1. Vercel Configuration (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization"
        },
        {
          "key": "Cache-Control",
          "value": "s-maxage=3600, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

## 2. Environment Variables

### Required Environment Variables

| Variable | Type | Description | Example | Environments |
|----------|------|-------------|---------|--------------|
| `GITHUB_TOKEN` | Secret | GitHub API token for authenticated requests | `ghp_xxx` | Preview, Production |
| `NEXT_PUBLIC_APP_URL` | Public | Application base URL | `https://dashboard.vercel.app` | All |
| `NODE_ENV` | System | Node environment | `production` | Auto-set |
| `VERCEL` | System | Vercel deployment indicator | `1` | Auto-set |
| `VERCEL_ENV` | System | Deployment environment | `production` | Auto-set |
| `VERCEL_URL` | System | Deployment URL | `dashboard-xyz.vercel.app` | Auto-set |

### .env.example

```bash
# GitHub API Configuration
GITHUB_TOKEN=your_github_personal_access_token_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: npm API Key (for higher rate limits)
# NPM_API_KEY=your_npm_api_key_here
```

### Environment Variable Setup Instructions

**Local Development:**
1. Copy `.env.example` to `.env.local`
2. Fill in your GitHub token
3. Restart development server

**Vercel Dashboard:**
1. Navigate to Project Settings → Environment Variables
2. Add `GITHUB_TOKEN` for Preview and Production
3. Add `NEXT_PUBLIC_APP_URL` for each environment
4. Deploy to apply changes

## 3. CI/CD Pipeline

### Git Workflow

```
feature/widget-catalog
  ↓ (PR created)
Preview Deployment (auto)
  ↓ (Code review + approval)
main branch
  ↓ (Auto-deploy)
Production Deployment
```

### Branch Strategy

| Branch | Environment | Auto-Deploy | URL Pattern |
|--------|-------------|-------------|-------------|
| `main` | Production | ✅ | `dashboard.vercel.app` |
| `staging` | Staging | ✅ | `dashboard-staging.vercel.app` |
| `feature/*` | Preview | ✅ | `dashboard-<hash>.vercel.app` |
| Pull Requests | Preview | ✅ | `dashboard-pr-<number>.vercel.app` |

### Deployment Triggers

**Automatic Deployments:**
- Push to `main` → Production
- Push to `staging` → Staging
- Open/update PR → Preview
- Push to any branch → Preview (if enabled)

**Manual Deployments:**
- Vercel Dashboard → Deployments → Redeploy
- Vercel CLI: `vercel --prod`

### GitHub Actions Integration (Optional)

```yaml
# .github/workflows/vercel-preview.yml
name: Vercel Preview
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build Project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
```

## 4. Performance Optimization

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // SWC minification for faster builds
  swcMinify: true,

  // Enable compression
  compress: true,

  // Optimize fonts
  optimizeFonts: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      }
    ],
  },

  // Enable experimental features for Next.js 15
  experimental: {
    optimizePackageImports: ['recharts', '@salt-ds/core'],
  },

  // Configure headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=3600, stale-while-revalidate'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

### Edge Function Configuration

All API routes in `/app/api` automatically deploy as Edge Functions on Vercel.

**Edge Runtime Declaration:**

```typescript
// app/api/github/[...path]/route.ts
export const runtime = 'edge' // Deploy to Vercel Edge Network

export async function GET(request: Request) {
  // Low-latency API proxy
  const response = await fetch('https://api.github.com/...')
  return Response.json(await response.json())
}
```

### Caching Strategy

| Content Type | Strategy | Duration | Location |
|--------------|----------|----------|----------|
| Static assets | Cache-Control | 1 year | Edge CDN |
| API responses | stale-while-revalidate | 1 hour | Edge Cache |
| Dashboard layouts | localStorage | Persistent | Client |
| Widget data | IndexedDB | 5-15 min | Client |
| Next.js pages | ISR | N/A | N/A (SPA) |

### Bundle Size Optimization

**Lazy Loading Strategy:**

```typescript
// Lazy load heavy dependencies
const ReactGridLayout = dynamic(
  () => import('react-grid-layout').then(mod => mod.Responsive),
  { ssr: false, loading: () => <LoadingSpinner /> }
)

const RechartsChart = dynamic(
  () => import('@/components/charts/LineChart'),
  { ssr: false, loading: () => <ChartSkeleton /> }
)
```

**Bundle Analysis:**

```bash
# Add to package.json
"analyze": "ANALYZE=true next build"

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

## 5. Monitoring & Analytics

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Vercel Speed Insights

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Error Tracking (Sentry Integration)

```javascript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
})
```

## 6. Production Deployment Checklist

**Pre-Deployment:**
- [ ] All environment variables configured in Vercel Dashboard
- [ ] GitHub token has required permissions (repo, read:org)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] All tests passing (if implemented)
- [ ] Bundle size reviewed (`npm run analyze`)
- [ ] Security headers configured
- [ ] Error tracking configured

**Post-Deployment:**
- [ ] Production URL accessible
- [ ] GitHub API proxy working (`/api/github/*`)
- [ ] npm API proxy working (`/api/npm/*`)
- [ ] Dashboard creation working
- [ ] Widget addition working
- [ ] Data persistence (localStorage) working
- [ ] No console errors in browser
- [ ] Analytics tracking events
- [ ] Performance metrics acceptable (< 2s page load)

## 7. Rollback Procedures

### Instant Rollback (Vercel Dashboard)

1. Navigate to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Confirm promotion (instant rollback)

### Git-Based Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

### Environment Variable Rollback

1. Vercel Dashboard → Settings → Environment Variables
2. View variable history
3. Revert to previous value
4. Redeploy to apply

## 8. Troubleshooting

### Common Issues

**Build Failures:**
- Check build logs in Vercel Dashboard
- Verify all dependencies in package.json
- Ensure Node.js version compatibility (18.x)
- Check TypeScript errors

**Environment Variable Issues:**
- Verify variable names (case-sensitive)
- Check variable is set for correct environment (preview vs production)
- Redeploy after adding/changing variables
- Use `NEXT_PUBLIC_` prefix for client-side variables

**API Route 500 Errors:**
- Check Vercel function logs
- Verify GitHub token is valid and has permissions
- Check rate limit status
- Review error tracking (Sentry)

**Performance Issues:**
- Review bundle size (`npm run analyze`)
- Check API response times in network tab
- Verify caching headers
- Use Vercel Speed Insights

### Support Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Vercel Community: https://github.com/vercel/next.js/discussions
- Support: support@vercel.com (Pro/Enterprise)

## 9. Cost Optimization

### Vercel Hobby Plan Limits

- Bandwidth: 100 GB/month
- Serverless Function Execution: 100 GB-hrs/month
- Build Time: 100 hours/month
- Concurrent Builds: 1

### Optimization Strategies

**Reduce Function Execution:**
- Implement aggressive caching (1hr for GitHub, 24hr for npm)
- Use client-side caching (localStorage, IndexedDB)
- Minimize API calls per widget

**Reduce Bandwidth:**
- Optimize images with next/image
- Enable compression
- Use CDN caching for static assets

**Build Time Optimization:**
- Cache node_modules in CI/CD
- Use SWC instead of Babel
- Optimize bundle size

### Monitoring Usage

1. Vercel Dashboard → Analytics → Usage
2. Monitor bandwidth, function execution, build time
3. Set up usage alerts (80%, 90%)
4. Upgrade to Pro if consistently hitting limits

---

**Deployment Platform**: Vercel
**Estimated Monthly Cost**: $0 (Hobby) or $20/seat (Pro)
**Estimated Setup Time**: 30 minutes
**Recommended Plan**: Hobby for development, Pro for production
