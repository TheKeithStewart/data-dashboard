import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime for low latency
export const runtime = 'edge';

// Disable caching for dynamic API data
export const dynamic = 'force-dynamic';

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

/**
 * GitHub Repository API Proxy
 *
 * Purpose: Fetch repository metadata from GitHub API
 * Authentication: Uses server-side GITHUB_TOKEN for higher rate limits
 * Rate Limit: 5,000 requests/hour (with token) vs 60/hour (without)
 * Caching: 5 minutes at edge, stale-while-revalidate for 10 minutes
 *
 * @param request - NextRequest with query params: owner, repo
 * @returns GitHubRepository data or error response
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    // Validate required parameters
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters: owner and repo' },
        { status: 400 }
      );
    }

    // Validate GitHub token (optional but recommended)
    const githubToken = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Dashboard-Builder/1.0',
    };

    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
    }

    // Fetch from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers,
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    // Handle GitHub API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Log rate limit info
      const rateLimit = response.headers.get('x-ratelimit-remaining');
      if (rateLimit) {
        console.warn(`GitHub API rate limit remaining: ${rateLimit}`);
      }

      return NextResponse.json(
        {
          error: `GitHub API error: ${response.status} ${response.statusText}`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data: GitHubRepository = await response.json();

    // Return with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-RateLimit-Remaining': response.headers.get('x-ratelimit-remaining') || 'unknown',
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
