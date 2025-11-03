'use client';

/**
 * npm Downloads Widget
 *
 * Visualizes package download trends over time with a line chart
 *
 * Features:
 * - Fetches download statistics from npm API
 * - Line chart visualization with Recharts
 * - Multiple time period support
 * - Loading and error states
 */

import { useEffect, useState } from 'react';
import { npmService } from '@/lib/services/npm-service';
import type { NpmPackage, NpmRangeDownloads } from '@/lib/services/npm-service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NpmDownloadsWidgetProps {
  config: {
    packageName: string;
  };
}

interface ChartDataPoint {
  date: string;
  downloads: number;
}

export default function NpmDownloadsWidget({ config }: NpmDownloadsWidgetProps) {
  const [packageInfo, setPackageInfo] = useState<NpmPackage | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDownloads, setTotalDownloads] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!config.packageName) {
        setError('Package name is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch package info
        const pkg = await npmService.getPackage(config.packageName);
        setPackageInfo(pkg);

        // Fetch download statistics for last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        const downloads = await npmService.getDownloadRange(
          config.packageName,
          formatDate(startDate),
          formatDate(endDate)
        );

        // Transform data for chart
        const data: ChartDataPoint[] = downloads.downloads.map((point) => ({
          date: new Date(point.day).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          downloads: point.downloads,
        }));

        setChartData(data);

        // Calculate total downloads
        const total = downloads.downloads.reduce((sum, point) => sum + point.downloads, 0);
        setTotalDownloads(total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch package data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [config.packageName]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
          <p className="text-sm text-gray-600">Loading package data...</p>
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

  if (!packageInfo) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with package info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg">{packageInfo.name}</h3>
          {packageInfo.repository?.url && (
            <a
              href={packageInfo.repository.url.replace('git+', '').replace('.git', '')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ↗
            </a>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-600">30-Day Downloads:</span>
            <span className="ml-2 font-semibold text-lg">{totalDownloads.toLocaleString()}</span>
          </div>
          <div className="text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">v{packageInfo.version}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Downloads']}
            />
            <Line
              type="monotone"
              dataKey="downloads"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer with description */}
      {packageInfo.description && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 line-clamp-2">{packageInfo.description}</p>
        </div>
      )}

      {/* License info */}
      {packageInfo.license && (
        <div className="mt-2">
          <span className="text-xs text-gray-500">License: {packageInfo.license}</span>
        </div>
      )}
    </div>
  );
}
