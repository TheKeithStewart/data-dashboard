'use client';

/**
 * npm Quality Widget
 *
 * Visualizes package quality metrics with a radar chart
 *
 * Features:
 * - Fetches quality scores from npms.io
 * - Radar chart for quality dimensions
 * - Overall score display
 * - Detailed metric breakdown
 * - Loading and error states
 */

import { useEffect, useState } from 'react';
import { npmService } from '@/lib/services/npm-service';
import type { NpmPackage, NpmQualityScore } from '@/lib/services/npm-service';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface NpmQualityWidgetProps {
  config: {
    packageName: string;
  };
}

export default function NpmQualityWidget({ config }: NpmQualityWidgetProps) {
  const [packageInfo, setPackageInfo] = useState<NpmPackage | null>(null);
  const [qualityScore, setQualityScore] = useState<NpmQualityScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const [pkg, score] = await Promise.all([
          npmService.getPackage(config.packageName),
          npmService.getQualityScore(config.packageName),
        ]);

        setPackageInfo(pkg);
        setQualityScore(score);
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
          <p className="text-sm text-gray-600">Loading quality data...</p>
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

  if (!packageInfo || !qualityScore) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Prepare radar chart data
  const radarData = [
    { metric: 'Quality', value: Math.round(qualityScore.quality * 100), fullMark: 100 },
    { metric: 'Popularity', value: Math.round(qualityScore.popularity * 100), fullMark: 100 },
    { metric: 'Maintenance', value: Math.round(qualityScore.maintenance * 100), fullMark: 100 },
  ];

  // Get score color based on value
  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-100 border-green-300';
    if (score >= 0.6) return 'bg-yellow-100 border-yellow-300';
    if (score >= 0.4) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const finalScore = Math.round(qualityScore.final * 100);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
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

        {/* Overall Score */}
        <div className={`rounded-lg border-2 p-4 text-center ${getScoreBgColor(qualityScore.final)}`}>
          <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Overall Score</div>
          <div className={`text-4xl font-bold ${getScoreColor(qualityScore.final)}`}>{finalScore}</div>
          <div className="text-xs text-gray-600 mt-1">out of 100</div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="flex-1 min-h-0 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="metric"
              style={{ fontSize: '12px', fill: '#6b7280' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              style={{ fontSize: '10px', fill: '#9ca3af' }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`${value}/100`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Scores */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Quality</span>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${qualityScore.quality * 100}%` }}
              ></div>
            </div>
            <span className={`font-semibold w-8 text-right ${getScoreColor(qualityScore.quality)}`}>
              {Math.round(qualityScore.quality * 100)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Popularity</span>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${qualityScore.popularity * 100}%` }}
              ></div>
            </div>
            <span className={`font-semibold w-8 text-right ${getScoreColor(qualityScore.popularity)}`}>
              {Math.round(qualityScore.popularity * 100)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Maintenance</span>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${qualityScore.maintenance * 100}%` }}
              ></div>
            </div>
            <span className={`font-semibold w-8 text-right ${getScoreColor(qualityScore.maintenance)}`}>
              {Math.round(qualityScore.maintenance * 100)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 text-center">
        Scores from npms.io • v{packageInfo.version}
      </div>
    </div>
  );
}
