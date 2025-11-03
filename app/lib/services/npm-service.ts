/**
 * npm API Service Layer
 *
 * Provides data fetching for npm widgets with:
 * - Package metadata
 * - Download statistics
 * - Version history
 * - Quality scores (via npms.io)
 *
 * Features:
 * - Client-side API proxy usage
 * - Caching with TTL
 * - Scoped package support
 * - Error handling
 */

// npm Package Metadata
export interface NpmPackage {
  name: string;
  version: string;
  description: string;
  author: string | { name: string; email?: string };
  license: string;
  repository?: {
    type: string;
    url: string;
  };
  homepage?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// npm Download Stats
export interface NpmDownloadStats {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

// npm Download Point (time-series data)
export interface NpmDownloadPoint {
  downloads: number;
  day: string;
}

// npm Range Downloads (time-series)
export interface NpmRangeDownloads {
  downloads: NpmDownloadPoint[];
  start: string;
  end: string;
  package: string;
}

// npm Package Quality Score (from npms.io)
export interface NpmQualityScore {
  quality: number;
  popularity: number;
  maintenance: number;
  final: number;
  detail: {
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
}

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class NpmService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private apiProxyUrl = '/api/npm';

  /**
   * Get package metadata from npm registry
   */
  async getPackage(packageName: string): Promise<NpmPackage> {
    const cacheKey = `package:${packageName}`;
    const cached = this.getFromCache<NpmPackage>(cacheKey);
    if (cached) return cached;

    const encodedPackage = encodeURIComponent(packageName);
    const response = await fetch(`https://registry.npmjs.org/${encodedPackage}`);

    if (!response.ok) {
      throw new Error(`npm API error: ${response.status}`);
    }

    const data = await response.json();
    const latestVersion = data['dist-tags']?.latest || Object.keys(data.versions).pop();
    const packageData: NpmPackage = data.versions[latestVersion];

    this.setCache(cacheKey, packageData, 14400); // 4 hours
    return packageData;
  }

  /**
   * Get download statistics for a period
   */
  async getDownloads(
    packageName: string,
    period: 'last-day' | 'last-week' | 'last-month' | 'last-year' = 'last-month'
  ): Promise<NpmDownloadStats> {
    const cacheKey = `downloads:${packageName}:${period}`;
    const cached = this.getFromCache<NpmDownloadStats>(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${this.apiProxyUrl}/downloads?package=${encodeURIComponent(packageName)}&period=${period}`);

    if (!response.ok) {
      throw new Error(`npm API error: ${response.status}`);
    }

    const data: NpmDownloadStats = await response.json();
    this.setCache(cacheKey, data, 3600); // 1 hour
    return data;
  }

  /**
   * Get download time-series data for a date range
   */
  async getDownloadRange(
    packageName: string,
    startDate: string,
    endDate: string
  ): Promise<NpmRangeDownloads> {
    const cacheKey = `downloads-range:${packageName}:${startDate}:${endDate}`;
    const cached = this.getFromCache<NpmRangeDownloads>(cacheKey);
    if (cached) return cached;

    const encodedPackage = encodeURIComponent(packageName);
    const response = await fetch(
      `https://api.npmjs.org/downloads/range/${startDate}:${endDate}/${encodedPackage}`
    );

    if (!response.ok) {
      throw new Error(`npm API error: ${response.status}`);
    }

    const data: NpmRangeDownloads = await response.json();
    this.setCache(cacheKey, data, 86400); // 24 hours (historical data doesn't change)
    return data;
  }

  /**
   * Get package versions
   */
  async getVersions(packageName: string): Promise<string[]> {
    const cacheKey = `versions:${packageName}`;
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) return cached;

    const encodedPackage = encodeURIComponent(packageName);
    const response = await fetch(`https://registry.npmjs.org/${encodedPackage}`);

    if (!response.ok) {
      throw new Error(`npm API error: ${response.status}`);
    }

    const data = await response.json();
    const versions = Object.keys(data.versions);

    this.setCache(cacheKey, versions, 14400); // 4 hours
    return versions;
  }

  /**
   * Get package quality score from npms.io
   */
  async getQualityScore(packageName: string): Promise<NpmQualityScore> {
    const cacheKey = `quality:${packageName}`;
    const cached = this.getFromCache<NpmQualityScore>(cacheKey);
    if (cached) return cached;

    const encodedPackage = encodeURIComponent(packageName);
    const response = await fetch(`https://api.npms.io/v2/package/${encodedPackage}`);

    if (!response.ok) {
      throw new Error(`npms.io API error: ${response.status}`);
    }

    const data = await response.json();
    const score: NpmQualityScore = data.score;

    this.setCache(cacheKey, score, 86400); // 24 hours
    return score;
  }

  /**
   * Get package dependencies tree
   */
  async getDependencies(packageName: string): Promise<{
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  }> {
    const pkg = await this.getPackage(packageName);
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
    };
  }

  /**
   * Search packages
   */
  async searchPackages(query: string, size: number = 20): Promise<unknown[]> {
    const cacheKey = `search:${query}:${size}`;
    const cached = this.getFromCache<unknown[]>(cacheKey);
    if (cached) return cached;

    const response = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${size}`
    );

    if (!response.ok) {
      throw new Error(`npm search API error: ${response.status}`);
    }

    const data = await response.json();
    this.setCache(cacheKey, data.objects, 3600); // 1 hour
    return data.objects;
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
export const npmService = new NpmService();
