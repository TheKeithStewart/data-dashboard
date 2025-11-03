'use client';

/**
 * Individual Dashboard View
 *
 * Features:
 * - Display dashboard with grid layout
 * - Drag-and-drop widget positioning
 * - Add/remove widgets
 * - Responsive breakpoints (lg/md/sm)
 * - Real-time auto-save
 */

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useHydratedDashboardStore } from '@/lib/stores/dashboard-store';
import { getWidgetCategories } from '@/lib/registry/widget-registry';
import { Button } from '@salt-ds/core';
import { AddIcon, ArrowLeftIcon, DeleteIcon, SettingsIcon } from '@salt-ds/icons';
import type { WidgetType } from '@/lib/types/dashboard';
import dynamic from 'next/dynamic';
import WidgetRenderer from '@/app/_components/widgets/WidgetRenderer';

// Dynamically import ReactGridLayout to avoid SSR issues
const GridLayout = dynamic(() => import('react-grid-layout').then((mod) => mod.Responsive), {
  ssr: false,
});

export default function DashboardViewPage() {
  const params = useParams();
  const router = useRouter();
  const dashboardId = params.id as string;

  const {
    dashboards,
    hydrated,
    loading,
    addWidget,
    removeWidget,
    updateWidgetPosition,
  } = useHydratedDashboardStore();

  const [showAddWidget, setShowAddWidget] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('github');

  const dashboard = dashboards.find((d) => d.id === dashboardId);
  const widgetCategories = getWidgetCategories();

  // Redirect if dashboard not found
  useEffect(() => {
    if (hydrated && !dashboard) {
      router.push('/dashboards');
    }
  }, [hydrated, dashboard, router]);

  // Handle widget addition
  const handleAddWidget = (widgetType: WidgetType) => {
    if (!dashboard) return;

    // Create default config based on widget type
    const defaultConfig = getDefaultConfig(widgetType);

    // Find next available position
    const existingPositions = dashboard.widgets.map((w) => ({
      x: w.position.x,
      y: w.position.y,
    }));

    const newWidget = {
      id: `widget-${widgetType}-${Date.now()}`,
      type: widgetType,
      config: defaultConfig,
      position: {
        x: 0,
        y: existingPositions.length > 0 ? Math.max(...existingPositions.map((p) => p.y)) + 1 : 0,
        w: 6,
        h: 4,
      },
      metadata: {
        title: widgetType,
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dataStatus: 'idle' as const,
      },
    };

    addWidget(dashboardId, newWidget);
    setShowAddWidget(false);
  };

  // Handle widget removal
  const handleRemoveWidget = (widgetId: string) => {
    if (confirm('Are you sure you want to remove this widget?')) {
      removeWidget(dashboardId, widgetId);
    }
  };

  // Handle layout change from react-grid-layout
  const handleLayoutChange = (layout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => {
    if (!dashboard) return;

    layout.forEach((item) => {
      const widget = dashboard.widgets.find((w) => w.id === item.i);
      if (widget) {
        const hasChanged =
          widget.position.x !== item.x ||
          widget.position.y !== item.y ||
          widget.position.w !== item.w ||
          widget.position.h !== item.h;

        if (hasChanged) {
          updateWidgetPosition(dashboardId, item.i, {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          });
        }
      }
    });
  };

  // Show loading state
  if (!hydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  // Dashboard not found
  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Dashboard not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/dashboards')}
              variant="secondary"
            >
              <ArrowLeftIcon />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{dashboard.name}</h1>
              {dashboard.description && (
                <p className="text-sm text-gray-600">{dashboard.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {dashboard.metadata.widgetCount} widgets
            </span>
            <Button
              onClick={() => setShowAddWidget(true)}
              variant="cta"
            >
              <AddIcon />
              Add Widget
            </Button>
          </div>
        </div>
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Add Widget</h2>
                <button
                  onClick={() => setShowAddWidget(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Category Tabs */}
              <div className="flex gap-2 mb-6">
                {widgetCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Widget Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgetCategories
                  .find((c) => c.id === selectedCategory)
                  ?.widgets.map((widget) => (
                    <div
                      key={widget.type}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleAddWidget(widget.type)}
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{widget.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{widget.description}</p>
                      <div className="text-xs text-gray-500">
                        Default size: {widget.defaultSize.w} × {widget.defaultSize.h}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="p-8">
        {dashboard.widgets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No widgets yet</h3>
            <p className="text-gray-500 mb-6">Add your first widget to start visualizing data</p>
            <Button onClick={() => setShowAddWidget(true)} variant="cta">
              <AddIcon />
              Add Widget
            </Button>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layouts={{
              lg: dashboard.widgets.map((w) => ({
                i: w.id,
                x: w.position.x,
                y: w.position.y,
                w: w.position.w,
                h: w.position.h,
              })),
            }}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 8, sm: 4 }}
            rowHeight={100}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
            isDraggable
            isResizable
          >
            {dashboard.widgets.map((widget) => (
              <div key={widget.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center drag-handle cursor-move">
                  <div>
                    <h3 className="font-semibold text-gray-900">{widget.metadata.title}</h3>
                    <p className="text-xs text-gray-500">{widget.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        /* TODO: Open settings */
                      }}
                    >
                      <SettingsIcon />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleRemoveWidget(widget.id)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
                <div className="p-4 h-[calc(100%-60px)] overflow-auto">
                  <WidgetRenderer widget={widget} />
                </div>
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  );
}

// Helper function to get default config for widget types
function getDefaultConfig(widgetType: WidgetType): Record<string, unknown> {
  switch (widgetType) {
    case 'github-stars':
    case 'github-issues':
    case 'github-prs':
    case 'github-contributors':
    case 'github-metrics':
    case 'github-releases':
      return {
        owner: 'facebook',
        repo: 'react',
      };
    case 'npm-downloads':
    case 'npm-versions':
    case 'npm-quality':
    case 'npm-dependencies':
      return {
        packageName: 'react',
      };
    case 'comparison':
      return {
        sources: [],
      };
    case 'activity-heatmap':
      return {
        sources: [],
      };
    default:
      return {};
  }
}
