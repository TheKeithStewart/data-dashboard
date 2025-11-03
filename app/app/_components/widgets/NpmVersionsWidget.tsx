'use client';

/**
 * npm Versions Widget
 *
 * Displays package version history
 *
 * Features:
 * - Fetches version list from npm registry
 * - Shows most recent versions
 * - Version badges (major/minor/patch)
 * - Links to npm package page
 * - Loading and error states
 */

import { useEffect, useState } from 'react';
import { npmService } from '@/lib/services/npm-service';
import type { NpmPackage } from '@/lib/services/npm-service';

interface NpmVersionsWidgetProps {
  config: {
    packageName: string;
  };
}

interface VersionInfo {
  version: string;
  type: 'major' | 'minor' | 'patch';
  isLatest: boolean;
}

export default function NpmVersionsWidget({ config }: NpmVersionsWidgetProps) {
  const [packageInfo, setPackageInfo] = useState<NpmPackage | null>(null);
  const [versions, setVersions] = useState<VersionInfo[]>([]);
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

        const [pkg, versionList] = await Promise.all([
          npmService.getPackage(config.packageName),
          npmService.getVersions(config.packageName),
        ]);

        setPackageInfo(pkg);

        // Process versions - get last 15 versions
        const latestVersion = pkg.version;
        const recentVersions = versionList
          .slice(-15)
          .reverse()
          .map((version) => ({
            version,
            type: getVersionType(version, latestVersion),
            isLatest: version === latestVersion,
          }));

        setVersions(recentVersions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch package versions');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [config.packageName]);

  // Determine if version is major, minor, or patch
  function getVersionType(version: string, latestVersion: string): 'major' | 'minor' | 'patch' {
    const [vMajor, vMinor] = version.split('.').map((n) => parseInt(n.split('-')[0]) || 0);
    const [lMajor, lMinor] = latestVersion.split('.').map((n) => parseInt(n.split('-')[0]) || 0);

    if (vMajor < lMajor) return 'major';
    if (vMajor === lMajor && vMinor < lMinor) return 'minor';
    return 'patch';
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
          <p className="text-sm text-gray-600">Loading versions...</p>
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

  const getVersionBadgeColor = (type: 'major' | 'minor' | 'patch'): string => {
    switch (type) {
      case 'major':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'patch':
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{packageInfo.name}</h3>
          <a
            href={`https://www.npmjs.com/package/${config.packageName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ↗ npm
          </a>
        </div>

        {/* Latest Version Card */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
          <div className="text-xs text-blue-700 uppercase tracking-wide mb-1">Latest Version</div>
          <div className="text-2xl font-bold text-blue-900">{packageInfo.version}</div>
          {packageInfo.license && (
            <div className="text-xs text-blue-700 mt-1">License: {packageInfo.license}</div>
          )}
        </div>
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {versions.map((version) => (
          <div
            key={version.version}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              version.isLatest
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <code className="font-mono font-semibold text-gray-900">{version.version}</code>
              {version.isLatest && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded">
                  Latest
                </span>
              )}
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${getVersionBadgeColor(
                version.type
              )}`}
            >
              {version.type.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Footer with legend */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-100 border border-red-300 rounded"></span>
            <span className="text-gray-600">Major</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></span>
            <span className="text-gray-600">Minor</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span>
            <span className="text-gray-600">Patch</span>
          </div>
        </div>
        <div className="text-center text-xs text-gray-600 mt-2">
          Showing {versions.length} most recent versions
        </div>
      </div>
    </div>
  );
}
