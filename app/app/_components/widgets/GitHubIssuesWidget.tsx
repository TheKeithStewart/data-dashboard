'use client';

/**
 * GitHub Issues Widget
 *
 * Displays recent repository issues in a list view
 *
 * Features:
 * - Fetches recent issues from GitHub API
 * - Filterable by state (open/closed/all)
 * - Shows issue metadata (number, title, author, labels)
 * - Links to issues on GitHub
 * - Loading and error states
 */

import { useEffect, useState } from 'react';
import { githubService } from '@/lib/services/github-service';
import type { GitHubIssue } from '@/lib/services/github-service';

interface GitHubIssuesWidgetProps {
  config: {
    owner: string;
    repo: string;
    state?: 'open' | 'closed' | 'all';
  };
}

export default function GitHubIssuesWidget({ config }: GitHubIssuesWidgetProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>(config.state || 'open');

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

        const data = await githubService.getIssues(config.owner, config.repo, filter);
        setIssues(data.slice(0, 20)); // Limit to 20 most recent
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [config.owner, config.repo, filter]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
          <p className="text-sm text-gray-600">Loading issues...</p>
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

  const openCount = issues.filter((i) => i.state === 'open').length;
  const closedCount = issues.filter((i) => i.state === 'closed').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header with filter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">
            {config.owner}/{config.repo}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('open')}
              className={`px-3 py-1 text-xs rounded ${
                filter === 'open'
                  ? 'bg-green-100 text-green-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Open ({filter === 'open' ? openCount : '...'})
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-3 py-1 text-xs rounded ${
                filter === 'closed'
                  ? 'bg-purple-100 text-purple-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Closed ({filter === 'closed' ? closedCount : '...'})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs rounded ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {issues.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No {filter} issues found</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {issue.state === 'open' ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Open"></div>
                  ) : (
                    <div className="w-2 h-2 bg-purple-500 rounded-full" title="Closed"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-blue-600 text-sm line-clamp-2"
                    >
                      {issue.title}
                    </a>
                    <span className="flex-shrink-0 text-xs text-gray-500">#{issue.number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <img
                      src={issue.user.avatar_url}
                      alt={issue.user.login}
                      className="w-4 h-4 rounded-full"
                    />
                    <span>{issue.user.login}</span>
                    <span>•</span>
                    <span>
                      {new Date(issue.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.slice(0, 3).map((label) => (
                        <span
                          key={label.name}
                          className="px-2 py-0.5 text-xs rounded"
                          style={{
                            backgroundColor: `#${label.color}20`,
                            color: `#${label.color}`,
                            border: `1px solid #${label.color}40`,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                      {issue.labels.length > 3 && (
                        <span className="text-xs text-gray-500">+{issue.labels.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer with total count */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 text-center">
        Showing {issues.length} of {filter === 'all' ? openCount + closedCount : filter === 'open' ? openCount : closedCount} {filter} issues
      </div>
    </div>
  );
}
