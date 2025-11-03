/**
 * Dashboard Zustand Store
 *
 * Provides centralized state management for:
 * - Dashboard CRUD operations
 * - Widget management
 * - Active dashboard selection
 * - Auto-save to localStorage
 */

import { create } from 'zustand';
import type { Dashboard, Widget, WidgetPosition, DashboardFilters } from '../types/dashboard';
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
  debounce,
} from '../utils/storage';

interface DashboardStore {
  // State
  dashboards: Dashboard[];
  activeDashboardId: string | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;

  // Dashboard Actions
  loadDashboards: () => void;
  createDashboard: (name: string, description?: string) => string;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
  deleteDashboard: (id: string) => void;
  setActiveDashboard: (id: string | null) => void;
  getActiveDashboard: () => Dashboard | null;

  // Widget Actions
  addWidget: (dashboardId: string, widget: Widget) => void;
  updateWidget: (dashboardId: string, widgetId: string, updates: Partial<Widget>) => void;
  removeWidget: (dashboardId: string, widgetId: string) => void;
  updateWidgetPosition: (dashboardId: string, widgetId: string, position: WidgetPosition) => void;

  // Filter Actions
  updateFilters: (dashboardId: string, filters: Partial<DashboardFilters>) => void;

  // Utility Actions
  saveToPersistence: () => void;
  clearError: () => void;
}

// Auto-save with debouncing (500ms delay)
const debouncedSave = debounce((dashboards: Dashboard[]) => {
  setStorageItem(STORAGE_KEYS.DASHBOARDS, dashboards);
}, 500);

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial State
  dashboards: [],
  activeDashboardId: null,
  loading: false,
  error: null,
  hydrated: false,

  // Load dashboards from localStorage
  loadDashboards: () => {
    set({ loading: true, error: null });

    try {
      const stored = getStorageItem<Dashboard[]>(STORAGE_KEYS.DASHBOARDS);
      const activeDashboardId = getStorageItem<string>(STORAGE_KEYS.ACTIVE_DASHBOARD);

      set({
        dashboards: stored || [],
        activeDashboardId,
        loading: false,
        hydrated: true,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load dashboards',
        loading: false,
        hydrated: true,
      });
    }
  },

  // Create new dashboard
  createDashboard: (name: string, description?: string) => {
    const newDashboard: Dashboard = {
      id: `dashboard-${Date.now()}`,
      name,
      description,
      widgets: [],
      layouts: {
        lg: [],
        md: [],
        sm: [],
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgetCount: 0,
      },
      filters: {},
    };

    set((state) => {
      const updatedDashboards = [...state.dashboards, newDashboard];
      debouncedSave(updatedDashboards);
      return {
        dashboards: updatedDashboards,
        activeDashboardId: newDashboard.id,
      };
    });

    setStorageItem(STORAGE_KEYS.ACTIVE_DASHBOARD, newDashboard.id);
    return newDashboard.id;
  },

  // Update dashboard
  updateDashboard: (id: string, updates: Partial<Dashboard>) => {
    set((state) => {
      const updatedDashboards = state.dashboards.map((dashboard) =>
        dashboard.id === id
          ? {
              ...dashboard,
              ...updates,
              metadata: {
                ...dashboard.metadata,
                updatedAt: new Date().toISOString(),
              },
            }
          : dashboard
      );
      debouncedSave(updatedDashboards);
      return { dashboards: updatedDashboards };
    });
  },

  // Delete dashboard
  deleteDashboard: (id: string) => {
    set((state) => {
      const updatedDashboards = state.dashboards.filter((d) => d.id !== id);
      const newActiveDashboardId =
        state.activeDashboardId === id
          ? updatedDashboards[0]?.id || null
          : state.activeDashboardId;

      debouncedSave(updatedDashboards);
      if (newActiveDashboardId) {
        setStorageItem(STORAGE_KEYS.ACTIVE_DASHBOARD, newActiveDashboardId);
      }

      return {
        dashboards: updatedDashboards,
        activeDashboardId: newActiveDashboardId,
      };
    });
  },

  // Set active dashboard
  setActiveDashboard: (id: string | null) => {
    set({ activeDashboardId: id });
    if (id) {
      setStorageItem(STORAGE_KEYS.ACTIVE_DASHBOARD, id);

      // Update lastViewed
      get().updateDashboard(id, {
        metadata: {
          ...get().dashboards.find((d) => d.id === id)!.metadata,
          lastViewed: new Date().toISOString(),
        },
      });
    }
  },

  // Get active dashboard
  getActiveDashboard: () => {
    const { dashboards, activeDashboardId } = get();
    return dashboards.find((d) => d.id === activeDashboardId) || null;
  },

  // Add widget to dashboard
  addWidget: (dashboardId: string, widget: Widget) => {
    set((state) => {
      const updatedDashboards = state.dashboards.map((dashboard) => {
        if (dashboard.id !== dashboardId) return dashboard;

        const updatedWidgets = [...dashboard.widgets, widget];
        return {
          ...dashboard,
          widgets: updatedWidgets,
          metadata: {
            ...dashboard.metadata,
            widgetCount: updatedWidgets.length,
            updatedAt: new Date().toISOString(),
          },
        };
      });

      debouncedSave(updatedDashboards);
      return { dashboards: updatedDashboards };
    });
  },

  // Update widget
  updateWidget: (dashboardId: string, widgetId: string, updates: Partial<Widget>) => {
    set((state) => {
      const updatedDashboards = state.dashboards.map((dashboard) => {
        if (dashboard.id !== dashboardId) return dashboard;

        const updatedWidgets = dashboard.widgets.map((widget) =>
          widget.id === widgetId
            ? {
                ...widget,
                ...updates,
                metadata: {
                  ...widget.metadata,
                  updatedAt: new Date().toISOString(),
                },
              }
            : widget
        );

        return {
          ...dashboard,
          widgets: updatedWidgets,
          metadata: {
            ...dashboard.metadata,
            updatedAt: new Date().toISOString(),
          },
        };
      });

      debouncedSave(updatedDashboards);
      return { dashboards: updatedDashboards };
    });
  },

  // Remove widget
  removeWidget: (dashboardId: string, widgetId: string) => {
    set((state) => {
      const updatedDashboards = state.dashboards.map((dashboard) => {
        if (dashboard.id !== dashboardId) return dashboard;

        const updatedWidgets = dashboard.widgets.filter((w) => w.id !== widgetId);
        return {
          ...dashboard,
          widgets: updatedWidgets,
          metadata: {
            ...dashboard.metadata,
            widgetCount: updatedWidgets.length,
            updatedAt: new Date().toISOString(),
          },
        };
      });

      debouncedSave(updatedDashboards);
      return { dashboards: updatedDashboards };
    });
  },

  // Update widget position
  updateWidgetPosition: (dashboardId: string, widgetId: string, position: WidgetPosition) => {
    get().updateWidget(dashboardId, widgetId, { position });
  },

  // Update dashboard filters
  updateFilters: (dashboardId: string, filters: Partial<DashboardFilters>) => {
    set((state) => {
      const updatedDashboards = state.dashboards.map((dashboard) =>
        dashboard.id === dashboardId
          ? {
              ...dashboard,
              filters: { ...dashboard.filters, ...filters },
              metadata: {
                ...dashboard.metadata,
                updatedAt: new Date().toISOString(),
              },
            }
          : dashboard
      );

      debouncedSave(updatedDashboards);
      return { dashboards: updatedDashboards };
    });
  },

  // Manual save to persistence
  saveToPersistence: () => {
    const { dashboards } = get();
    setStorageItem(STORAGE_KEYS.DASHBOARDS, dashboards);
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

// Export hook for hydration safety
export function useHydratedDashboardStore() {
  const store = useDashboardStore();
  const { hydrated, loadDashboards } = store;

  // Load dashboards on mount (client-side only)
  if (typeof window !== 'undefined' && !hydrated) {
    loadDashboards();
  }

  return store;
}
