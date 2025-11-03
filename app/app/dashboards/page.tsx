'use client';

/**
 * Dashboard Management Page
 *
 * Features:
 * - List all user dashboards
 * - Create new dashboard
 * - Navigate to dashboard view
 * - Delete dashboards
 * - Display metadata (widget count, last viewed)
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useHydratedDashboardStore } from '@/lib/stores/dashboard-store';
import { Button } from '@salt-ds/core';
import { AddIcon, DeleteIcon } from '@salt-ds/icons';

export default function DashboardsPage() {
  const router = useRouter();
  const {
    dashboards,
    loading,
    error,
    hydrated,
    createDashboard,
    deleteDashboard,
    setActiveDashboard,
  } = useHydratedDashboardStore();

  const [newDashboardName, setNewDashboardName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Handle dashboard creation
  const handleCreate = () => {
    if (!newDashboardName.trim()) return;

    const dashboardId = createDashboard(newDashboardName.trim());
    setNewDashboardName('');
    setShowCreateForm(false);
    router.push(`/dashboards/${dashboardId}`);
  };

  // Handle dashboard deletion
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      deleteDashboard(id);
    }
  };

  // Handle dashboard selection
  const handleSelect = (id: string) => {
    setActiveDashboard(id);
    router.push(`/dashboards/${id}`);
  };

  // Show loading state during hydration
  if (!hydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboards...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboards</h1>
          <p className="text-gray-600">
            Create and manage your data visualization dashboards
          </p>
        </div>

        {/* Create Dashboard Button */}
        <div className="mb-6">
          {!showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="cta"
            >
              <AddIcon />
              Create New Dashboard
            </Button>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Create Dashboard</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newDashboardName}
                  onChange={(e) => setNewDashboardName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Enter dashboard name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Button
                  onClick={handleCreate}
                  variant="cta"
                  disabled={!newDashboardName.trim()}
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewDashboardName('');
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Dashboards List */}
        {dashboards.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No dashboards yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first dashboard to get started
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="cta"
            >
              <AddIcon />
              Create Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelect(dashboard.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {dashboard.name}
                    </h3>
                    {dashboard.description && (
                      <p className="text-sm text-gray-600">{dashboard.description}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(dashboard.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete dashboard"
                  >
                    <DeleteIcon />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Widgets:</span>
                    <span className="font-medium">{dashboard.metadata.widgetCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-medium">
                      {new Date(dashboard.metadata.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {dashboard.metadata.lastViewed && (
                    <div className="flex justify-between">
                      <span>Last Viewed:</span>
                      <span className="font-medium">
                        {new Date(dashboard.metadata.lastViewed).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleSelect(dashboard.id);
                    }}
                    variant="primary"
                    className="w-full"
                  >
                    Open Dashboard
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
