import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime for low latency
export const runtime = 'edge';

// Disable caching for dynamic API data
export const dynamic = 'force-dynamic';

interface NpmDownloadStats {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

/**
 * npm Downloads API Proxy
 *
 * Purpose: Fetch download statistics from npm registry
 * Authentication: No authentication required (public API)
 * Rate Limit: Self-imposed 60 requests/minute
 * Caching: 1 hour (npm data updates daily)
 *
 * @param request - NextRequest with query params: package, period
 * @returns NpmDownloadStats data or error response
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageName = searchParams.get('package');
    const period = searchParams.get('period') || 'last-month';

    // Validate required parameters
    if (!packageName) {
      return NextResponse.json(
        { error: 'Missing required parameter: package' },
        { status: 400 }
      );
    }

    // Validate period format
    const validPeriods = ['last-day', 'last-week', 'last-month', 'last-year'];
    if (!validPeriods.includes(period) && !period.match(/^\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json(
        {
          error: 'Invalid period format. Use: last-day, last-week, last-month, last-year, or YYYY-MM-DD:YYYY-MM-DD'
        },
        { status: 400 }
      );
    }

    // Encode package name for URL (handles scoped packages like @org/package)
    const encodedPackage = encodeURIComponent(packageName);

    // Fetch from npm API
    const response = await fetch(
      `https://api.npmjs.org/downloads/point/${period}/${encodedPackage}`,
      {
        headers: {
          'User-Agent': 'Dashboard-Builder/1.0',
        },
        // Cache for 1 hour (npm data updates daily)
        next: { revalidate: 3600 },
      }
    );

    // Handle npm API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: `npm API error: ${response.status} ${response.statusText}`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data: NpmDownloadStats = await response.json();

    // Return with cache headers
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
