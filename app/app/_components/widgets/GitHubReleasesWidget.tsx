'use client';

/**
 * GitHub Releases Widget
 *
 * Displays release timeline with scatter/bubble chart
 *
 * Features:
 * - Fetches releases from GitHub API
 * - Timeline visualization with scatter chart
 * - Release metadata (version, date, author)
 * - Links to releases on GitHub
 * - Loading and error states
 */

import { useEffect, useState } from 'react';
import { githubService } from '@/lib/services/github-service';
import type { GitHubRelease } from '@/lib/services/github-service';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GitHubReleasesWidgetProps {
  config: {
    owner: string;
    repo: string;
  };
}

interface ChartDataPoint {
  date: number;
  index: number;
  tag: string;
  name: string;
  author: string;
  published: string;
}

export default function GitHubReleasesWidget({ config }: GitHubReleasesWidgetProps) {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
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

        const data = await githubService.getReleases(config.owner, config.repo);
        setReleases(data.slice(0, 20)); // Show last 20 releases

        // Transform for scatter chart
        const chartPoints: ChartDataPoint[] = data.slice(0, 20).map((release, index) => ({
          date: new Date(release.published_at).getTime(),
          index: index,
          tag: release.tag_name,
          name: release.name || release.tag_name,
          author: release.author.login,
          published: new Date(release.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        }));

        setChartData(chartPoints);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch releases');
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
          <p className="text-sm text-gray-600">Loading releases...</p>
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

  if (releases.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No releases found</p>
      </div>
    );
  }

  const latestRelease = releases[0];

  return (
    <div className="h-full flex flex-col">
      {/* Header with latest release */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">
            {config.owner}/{config.repo}
          </h3>
          <a
            href={latestRelease.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ↗ Latest
          </a>
        </div>

        {/* Latest Release Card */}
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-green-700 uppercase tracking-wide">Latest Release</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded">
              {latestRelease.tag_name}
            </span>
          </div>
          <div className="font-semibold text-gray-900">{latestRelease.name || latestRelease.tag_name}</div>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <img
              src={latestRelease.author.avatar_url}
              alt={latestRelease.author.login}
              className="w-4 h-4 rounded-full"
            />
            <span>{latestRelease.author.login}</span>
            <span>•</span>
            <span>
              {new Date(latestRelease.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="flex-1 min-h-0 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) =>
                new Date(timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  year: '2-digit',
                })
              }
              stroke="#6b7280"
              style={{ fontSize: '11px' }}
            />
            <YAxis
              dataKey="index"
              type="number"
              domain={[0, 'dataMax']}
              hide
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload as ChartDataPoint;
                  return (
                    <div className="bg-white border border-gray-200 rounded p-2 shadow-lg">
                      <div className="font-semibold text-gray-900 mb-1">{data.name}</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Tag: {data.tag}</div>
                        <div>By: {data.author}</div>
                        <div>{data.published}</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={chartData} fill="#3b82f6">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#10b981' : '#3b82f6'}
                  opacity={index === 0 ? 1 : 0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Releases List */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {releases.slice(0, 5).map((release, index) => (
          <a
            key={release.id}
            href={release.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-2 rounded border hover:shadow-md transition-shadow ${
              index === 0
                ? 'bg-green-50 border-green-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    index === 0
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {release.tag_name}
                </span>
                <span className="text-sm text-gray-900 truncate">
                  {release.name || release.tag_name}
                </span>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {new Date(release.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 text-center">
        Showing {Math.min(releases.length, 5)} of {releases.length} releases
      </div>
    </div>
  );
}
