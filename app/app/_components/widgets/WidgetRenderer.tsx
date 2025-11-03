'use client';

/**
 * Widget Renderer
 *
 * Dynamically renders the appropriate widget component based on widget type
 */

import type { Widget } from '@/lib/types/dashboard';
import GitHubStarsWidget from './GitHubStarsWidget';
import GitHubMetricsWidget from './GitHubMetricsWidget';
import NpmDownloadsWidget from './NpmDownloadsWidget';

interface WidgetRendererProps {
  widget: Widget;
}

export default function WidgetRenderer({ widget }: WidgetRendererProps) {
  // Render the appropriate widget component based on type
  switch (widget.type) {
    case 'github-stars':
      return <GitHubStarsWidget config={widget.config as { owner: string; repo: string }} />;

    case 'github-metrics':
      return <GitHubMetricsWidget config={widget.config as { owner: string; repo: string }} />;

    case 'npm-downloads':
      return <NpmDownloadsWidget config={widget.config as { packageName: string }} />;

    // Placeholder for other widget types
    case 'github-issues':
    case 'github-prs':
    case 'github-contributors':
    case 'github-releases':
    case 'npm-versions':
    case 'npm-quality':
    case 'npm-dependencies':
    case 'comparison':
    case 'activity-heatmap':
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="font-semibold mb-2">{widget.type}</p>
            <p className="text-sm">Widget implementation coming soon</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="h-full flex items-center justify-center text-red-600">
          <div className="text-center">
            <p className="font-semibold mb-2">Unknown Widget Type</p>
            <p className="text-sm">{widget.type}</p>
          </div>
        </div>
      );
  }
}
