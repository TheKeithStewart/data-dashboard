/**
 * GitHub API Service Layer
 *
 * Provides data fetching for GitHub widgets with:
 * - Repository metrics
 * - Stars timeline
 * - Issues and Pull Requests
 * - Contributors
 * - Releases
 *
 * Features:
 * - Client-side API proxy usage
 * - Caching with TTL
 * - Rate limit tracking
 * - Error handling
 */

// GitHub Repository Data
export interface GitHubRepository {
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

// GitHub Issue
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
}

// GitHub Pull Request
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

// GitHub Contributor
export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

// GitHub Release
export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  created_at: string;
  published_at: string;
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  };
}

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class GitHubService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private baseUrl = '/api/github';

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const cacheKey = `repo:${owner}/${repo}`;
    const cached = this.getFromCache<GitHubRepository>(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${this.baseUrl}/repository?owner=${owner}&repo=${repo}`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubRepository = await response.json();
    this.setCache(cacheKey, data, 300); // 5 minutes
    return data;
  }

  /**
   * Get repository issues
   */
  async getIssues(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubIssue[]> {
    const cacheKey = `issues:${owner}/${repo}:${state}`;
    const cached = this.getFromCache<GitHubIssue[]>(cacheKey);
    if (cached) return cached;

    // Use GitHub API directly (no proxy route yet)
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubIssue[] = await response.json();
    // Filter out pull requests (GitHub API returns both issues and PRs)
    const issues = data.filter((issue) => !('pull_request' in issue));

    this.setCache(cacheKey, issues, 600); // 10 minutes
    return issues;
  }

  /**
   * Get repository pull requests
   */
  async getPullRequests(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubPullRequest[]> {
    const cacheKey = `prs:${owner}/${repo}:${state}`;
    const cached = this.getFromCache<GitHubPullRequest[]>(cacheKey);
    if (cached) return cached;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubPullRequest[] = await response.json();
    this.setCache(cacheKey, data, 600); // 10 minutes
    return data;
  }

  /**
   * Get repository contributors
   */
  async getContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
    const cacheKey = `contributors:${owner}/${repo}`;
    const cached = this.getFromCache<GitHubContributor[]>(cacheKey);
    if (cached) return cached;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubContributor[] = await response.json();
    this.setCache(cacheKey, data, 86400); // 24 hours
    return data;
  }

  /**
   * Get repository releases
   */
  async getReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
    const cacheKey = `releases:${owner}/${repo}`;
    const cached = this.getFromCache<GitHubRelease[]>(cacheKey);
    if (cached) return cached;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubRelease[] = await response.json();
    this.setCache(cacheKey, data, 3600); // 1 hour
    return data;
  }

  /**
   * Get from cache if not expired
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const githubService = new GitHubService();
