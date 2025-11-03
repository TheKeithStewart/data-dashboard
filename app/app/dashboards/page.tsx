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
import { useEffect, useState, useRef } from 'react';
import { useHydratedDashboardStore } from '@/lib/stores/dashboard-store';
import { Button } from '@salt-ds/core';
import { AddIcon, DeleteIcon } from '@salt-ds/icons';
import { exportDashboard, exportAllDashboards, importDashboard, importDashboards } from '@/lib/utils/dashboard-io';
import { dashboardTemplates, createDashboardFromTemplate } from '@/lib/utils/dashboard-templates';

export default function DashboardsPage() {
  const router = useRouter();
  const {
    dashboards,
    loading,
    error,
    hydrated,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    setActiveDashboard,
    importDashboard: importDashboardToStore,
    importDashboards: importDashboardsToStore,
    duplicateDashboard,
    clearAllData,
  } = useHydratedDashboardStore();

  const [newDashboardName, setNewDashboardName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

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

  // Handle dashboard export
  const handleExport = (dashboard: any) => {
    try {
      exportDashboard(dashboard);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export dashboard');
    }
  };

  // Handle export all dashboards
  const handleExportAll = () => {
    try {
      exportAllDashboards(dashboards);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export dashboards');
    }
  };

  // Handle dashboard import
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);

      // Check if it's an array (multiple dashboards) or single dashboard
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);

      if (Array.isArray(data)) {
        const importedDashboards = await importDashboards(file);
        importDashboardsToStore(importedDashboards);
        alert(`Successfully imported ${importedDashboards.length} dashboard(s)`);
      } else {
        const importedDashboard = await importDashboard(file);
        const newId = importDashboardToStore(importedDashboard);
        router.push(`/dashboards/${newId}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import dashboard';
      setImportError(errorMessage);
      alert(errorMessage);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle dashboard duplication
  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = duplicateDashboard(id);
    if (newId) {
      router.push(`/dashboards/${newId}`);
    }
  };

  // Handle clear all data
  const handleClearAll = () => {
    if (
      confirm(
        'Are you sure you want to delete ALL dashboards? This action cannot be undone.'
      )
    ) {
      clearAllData();
    }
  };

  // Handle start editing
  const handleStartEdit = (dashboard: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(dashboard.id);
    setEditName(dashboard.name);
    setEditDescription(dashboard.description || '');
  };

  // Handle save edit
  const handleSaveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editName.trim()) {
      alert('Dashboard name cannot be empty');
      return;
    }
    updateDashboard(id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  // Handle cancel edit
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  // Handle create from template
  const handleCreateFromTemplate = (templateIndex: number) => {
    const template = dashboardTemplates[templateIndex];
    const newDashboard = createDashboardFromTemplate(template);
    const dashboardId = importDashboardToStore(newDashboard);
    setShowTemplates(false);
    router.push(`/dashboards/${dashboardId}`);
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboards</h1>
              <p className="text-gray-600">
                Create and manage your data visualization dashboards
              </p>
            </div>
            {/* Action Buttons */}
            {dashboards.length > 0 && (
              <div className="flex gap-2">
                <Button onClick={handleImport} variant="secondary">
                  Import
                </Button>
                <Button onClick={handleExportAll} variant="secondary">
                  Export All
                </Button>
                <Button
                  onClick={handleClearAll}
                  variant="secondary"
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All Data
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Create Dashboard Button */}
        <div className="mb-6">
          {!showCreateForm && !showTemplates ? (
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="cta"
              >
                <AddIcon />
                Create New Dashboard
              </Button>
              <Button
                onClick={() => setShowTemplates(true)}
                variant="secondary"
              >
                Browse Templates
              </Button>
            </div>
          ) : showTemplates ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Dashboard Templates</h2>
                <Button
                  onClick={() => setShowTemplates(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-gray-600 mb-6">
                Choose a pre-configured dashboard template to get started quickly
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardTemplates.map((template, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleCreateFromTemplate(index)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{template.dashboard.widgets.length} widgets</span>
                      <span className="text-blue-600 font-medium">Click to add →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : showCreateForm ? (
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
          ) : null}
        </div>

        {/* Dashboards List */}
        {dashboards.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No dashboards yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first dashboard from scratch or use a template
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="cta"
              >
                <AddIcon />
                Create Dashboard
              </Button>
              <Button
                onClick={() => setShowTemplates(true)}
                variant="secondary"
              >
                Browse Templates
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => editingId !== dashboard.id && handleSelect(dashboard.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {editingId === dashboard.id ? (
                      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Dashboard name"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description (optional)"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={(e) => handleSaveEdit(dashboard.id, e)}
                            variant="cta"
                            disabled={!editName.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="secondary"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {dashboard.name}
                        </h3>
                        {dashboard.description && (
                          <p className="text-sm text-gray-600">{dashboard.description}</p>
                        )}
                      </>
                    )}
                  </div>
                  {editingId !== dashboard.id && (
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
                  )}
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

                {editingId !== dashboard.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
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
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={(e) => handleStartEdit(dashboard, e)}
                        variant="secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(dashboard);
                        }}
                        variant="secondary"
                      >
                        Export
                      </Button>
                      <Button
                        onClick={(e) => handleDuplicate(dashboard.id, e)}
                        variant="secondary"
                      >
                        Duplicate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
