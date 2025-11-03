'use client';

/**
 * npm Dependencies Widget
 *
 * Visualizes package dependencies with a treemap
 *
 * Features:
 * - Fetches dependencies from npm registry
 * - Treemap visualization showing dependency sizes
 * - Separate views for dependencies and devDependencies
 * - Dependency count statistics
 * - Loading and error states
 */

import { useEffect, useState } from 'react';
import { npmService } from '@/lib/services/npm-service';
import type { NpmPackage } from '@/lib/services/npm-service';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface NpmDependenciesWidgetProps {
  config: {
    packageName: string;
  };
}

interface TreemapNode {
  name: string;
  size: number;
  fill: string;
  [key: string]: string | number;
}

export default function NpmDependenciesWidget({ config }: NpmDependenciesWidgetProps) {
  const [packageInfo, setPackageInfo] = useState<NpmPackage | null>(null);
  const [deps, setDeps] = useState<Record<string, string>>({});
  const [devDeps, setDevDeps] = useState<Record<string, string>>({});
  const [view, setView] = useState<'dependencies' | 'devDependencies'>('dependencies');
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

        const [pkg, dependencies] = await Promise.all([
          npmService.getPackage(config.packageName),
          npmService.getDependencies(config.packageName),
        ]);

        setPackageInfo(pkg);
        setDeps(dependencies.dependencies);
        setDevDeps(dependencies.devDependencies);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dependencies');
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
          <p className="text-sm text-gray-600">Loading dependencies...</p>
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

  const currentDeps = view === 'dependencies' ? deps : devDeps;
  const depsCount = Object.keys(deps).length;
  const devDepsCount = Object.keys(devDeps).length;

  // Transform dependencies to treemap data
  const treemapData: TreemapNode[] = Object.entries(currentDeps).map(([name, version], index) => {
    // Assign sizes based on position (simulated - in real app would use package sizes)
    const baseSize = 100;
    const size = baseSize - index * 2;

    // Color gradient from blue to purple
    const hue = 200 + (index % 10) * 10;
    const fill = `hsl(${hue}, 70%, 60%)`;

    return {
      name,
      size: Math.max(size, 20),
      fill,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const version = currentDeps[data.name];
      return (
        <div className="bg-white border border-gray-200 rounded p-2 shadow-lg">
          <div className="font-semibold text-gray-900">{data.name}</div>
          <div className="text-xs text-gray-600 mt-1">Version: {version}</div>
        </div>
      );
    }
    return null;
  };

  const CustomContent = ({ x, y, width, height, name }: any) => {
    if (width < 30 || height < 30) return null;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: 'currentColor',
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(width / 8, height / 4, 12)}
          fontWeight="500"
        >
          {name.length > 15 ? name.substring(0, 12) + '...' : name}
        </text>
      </g>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">{packageInfo.name}</h3>
          <a
            href={`https://www.npmjs.com/package/${config.packageName}?activeTab=dependencies`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ↗ npm
          </a>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setView('dependencies')}
            className={`flex-1 px-3 py-2 text-sm rounded ${
              view === 'dependencies'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dependencies ({depsCount})
          </button>
          <button
            onClick={() => setView('devDependencies')}
            className={`flex-1 px-3 py-2 text-sm rounded ${
              view === 'devDependencies'
                ? 'bg-purple-600 text-white font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dev Dependencies ({devDepsCount})
          </button>
        </div>
      </div>

      {/* Treemap */}
      {treemapData.length > 0 ? (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              stroke="#fff"
              fill="#8884d8"
              content={<CustomContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No {view} found</p>
        </div>
      )}

      {/* Dependencies List */}
      {treemapData.length > 0 && (
        <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
          {Object.entries(currentDeps)
            .slice(0, 5)
            .map(([name, version]) => (
              <div
                key={name}
                className="flex items-center justify-between text-xs bg-white border border-gray-200 rounded px-2 py-1"
              >
                <span className="font-medium text-gray-900 truncate flex-1">{name}</span>
                <span className="text-gray-600 flex-shrink-0 ml-2">{version}</span>
              </div>
            ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 text-center">
        {treemapData.length > 5 && `Showing 5 of ${treemapData.length} ${view}`}
        {treemapData.length <= 5 && treemapData.length > 0 && `${treemapData.length} ${view} total`}
      </div>
    </div>
  );
}
