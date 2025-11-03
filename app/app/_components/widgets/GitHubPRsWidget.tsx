'use client';

/**
 * GitHub Pull Requests Widget
 *
 * Visualizes PR activity over time with a bar chart
 *
 * Features:
 * - Fetches recent PRs from GitHub API
 * - Bar chart showing PR count by month
 * - Filterable by state (open/closed/all)
 * - Shows merged vs closed stats
 * - Loading and error states
 */

import { useEffect, useState } from 'react';
import { githubService } from '@/lib/services/github-service';
import type { GitHubPullRequest } from '@/lib/services/github-service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GitHubPRsWidgetProps {
  config: {
    owner: string;
    repo: string;
  };
}

interface ChartDataPoint {
  month: string;
  opened: number;
  closed: number;
  merged: number;
}

export default function GitHubPRsWidget({ config }: GitHubPRsWidgetProps) {
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, merged: 0 });

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

        // Fetch all PRs (open and closed)
        const [openPRs, closedPRs] = await Promise.all([
          githubService.getPullRequests(config.owner, config.repo, 'open'),
          githubService.getPullRequests(config.owner, config.repo, 'closed'),
        ]);

        const allPRs = [...openPRs, ...closedPRs];
        setPullRequests(allPRs);

        // Calculate stats
        const merged = closedPRs.filter((pr) => pr.merged_at !== null).length;
        setStats({
          total: allPRs.length,
          open: openPRs.length,
          closed: closedPRs.length,
          merged: merged,
        });

        // Group PRs by month for chart
        const monthMap = new Map<string, { opened: number; closed: number; merged: number }>();

        // Get last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          monthMap.set(key, { opened: 0, closed: 0, merged: 0 });
        }

        // Count PRs by month
        allPRs.forEach((pr) => {
          const createdDate = new Date(pr.created_at);
          const monthKey = createdDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

          if (monthMap.has(monthKey)) {
            const data = monthMap.get(monthKey)!;
            data.opened++;

            if (pr.state === 'closed') {
              data.closed++;
              if (pr.merged_at) {
                data.merged++;
              }
            }
          }
        });

        const data: ChartDataPoint[] = Array.from(monthMap.entries()).map(([month, counts]) => ({
          month,
          ...counts,
        }));

        setChartData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pull requests');
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
          <p className="text-sm text-gray-600">Loading pull requests...</p>
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

  return (
    <div className="h-full flex flex-col">
      {/* Header with stats */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-3">
          {config.owner}/{config.repo}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-50 rounded p-2 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-800">Total</div>
          </div>
          <div className="bg-green-50 rounded p-2 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.open}</div>
            <div className="text-xs text-green-800">Open</div>
          </div>
          <div className="bg-purple-50 rounded p-2 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.merged}</div>
            <div className="text-xs text-purple-800">Merged</div>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.closed - stats.merged}</div>
            <div className="text-xs text-gray-800">Closed</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="opened" fill="#3b82f6" name="Opened" />
              <Bar dataKey="merged" fill="#a855f7" name="Merged" />
              <Bar dataKey="closed" fill="#6b7280" name="Closed" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No PR data available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Merge Rate:</span>
          <span className="font-medium">
            {stats.closed > 0 ? Math.round((stats.merged / stats.closed) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
