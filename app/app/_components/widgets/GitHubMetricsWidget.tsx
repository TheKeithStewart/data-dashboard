'use client';

/**
 * GitHub Metrics Widget
 *
 * Displays key repository metrics in a compact card format
 *
 * Features:
 * - Repository stars, forks, watchers, and issues
 * - Language and creation date
 * - Last update timestamp
 * - Direct link to repository
 */

import { useEffect, useState } from 'react';
import { githubService } from '@/lib/services/github-service';
import type { GitHubRepository } from '@/lib/services/github-service';

interface GitHubMetricsWidgetProps {
  config: {
    owner: string;
    repo: string;
  };
}

interface Metric {
  label: string;
  value: string | number;
  icon: string;
}

export default function GitHubMetricsWidget({ config }: GitHubMetricsWidgetProps) {
  const [repository, setRepository] = useState<GitHubRepository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!config.owner || !config.repo) {
        setError('Repository owner and name are required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const repo = await githubService.getRepository(config.owner, config.repo);
        setRepository(repo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repository data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [config.owner, config.repo]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
          <p className="text-sm text-gray-600">Loading repository data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-semibold mb-1">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const metrics: Metric[] = [
    {
      label: 'Stars',
      value: repository.stargazers_count.toLocaleString(),
      icon: '⭐',
    },
    {
      label: 'Forks',
      value: repository.forks_count.toLocaleString(),
      icon: '🔀',
    },
    {
      label: 'Watchers',
      value: repository.watchers_count.toLocaleString(),
      icon: '👀',
    },
    {
      label: 'Open Issues',
      value: repository.open_issues_count.toLocaleString(),
      icon: '🔴',
    },
  ];

  const createdDate = new Date(repository.created_at);
  const updatedDate = new Date(repository.updated_at);
  const daysOld = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg">{repository.full_name}</h3>
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ↗
          </a>
        </div>
        {repository.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{repository.description}</p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{metric.icon}</span>
              <span className="text-xs text-gray-600 uppercase tracking-wide">{metric.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-auto space-y-2 text-sm">
        {repository.language && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Primary Language:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {repository.language}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Age:</span>
          <span className="text-gray-900 font-medium">{daysOld} days</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Last Updated:</span>
          <span className="text-gray-900 font-medium">
            {updatedDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Created:</span>
          <span className="text-gray-900 font-medium">
            {createdDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
