'use client';

/**
 * GitHub Contributors Widget
 *
 * Displays top contributors ranked by contributions
 *
 * Features:
 * - Fetches contributor data from GitHub API
 * - Ranked list with contribution counts
 * - Avatar display
 * - Link to contributor profiles
 * - Top 10 contributors
 * - Loading and error states
 */

import { useEffect, useState } from 'react';
import { githubService } from '@/lib/services/github-service';
import type { GitHubContributor } from '@/lib/services/github-service';

interface GitHubContributorsWidgetProps {
  config: {
    owner: string;
    repo: string;
  };
}

export default function GitHubContributorsWidget({ config }: GitHubContributorsWidgetProps) {
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
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

        const data = await githubService.getContributors(config.owner, config.repo);
        // Get top 10 contributors
        setContributors(data.slice(0, 10));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contributors');
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
          <p className="text-sm text-gray-600">Loading contributors...</p>
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

  if (contributors.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No contributors found</p>
      </div>
    );
  }

  const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
  const maxContributions = contributors[0]?.contributions || 1;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">
          {config.owner}/{config.repo}
        </h3>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{contributors.length}</span> top contributors
          <span className="mx-2">•</span>
          <span className="font-medium">{totalContributions.toLocaleString()}</span> total contributions
        </div>
      </div>

      {/* Contributors List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {contributors.map((contributor, index) => {
          const percentage = (contributor.contributions / maxContributions) * 100;
          const rankColors = [
            'bg-yellow-100 text-yellow-800 border-yellow-300', // 1st
            'bg-gray-100 text-gray-800 border-gray-300', // 2nd
            'bg-orange-100 text-orange-800 border-orange-300', // 3rd
          ];
          const rankColor = index < 3 ? rankColors[index] : 'bg-blue-50 text-blue-700 border-blue-200';

          return (
            <div
              key={contributor.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Rank */}
              <div
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 font-bold text-sm ${rankColor}`}
              >
                {index + 1}
              </div>

              {/* Avatar */}
              <a
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
                />
              </a>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <a
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-900 hover:text-blue-600 block truncate"
                >
                  {contributor.login}
                </a>
                <div className="text-sm text-gray-600">
                  {contributor.contributions.toLocaleString()} contributions
                </div>
                {/* Progress bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Percentage */}
              <div className="flex-shrink-0 text-right">
                <div className="text-lg font-bold text-gray-900">
                  {Math.round((contributor.contributions / totalContributions) * 100)}%
                </div>
                <div className="text-xs text-gray-500">of top 10</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 text-center">
        Top {contributors.length} contributors shown
      </div>
    </div>
  );
}
