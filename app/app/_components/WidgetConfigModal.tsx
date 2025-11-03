'use client';

/**
 * Widget Configuration Modal
 *
 * Modal dialog for editing widget configurations
 *
 * Features:
 * - Dynamic form rendering based on widget type
 * - Form validation
 * - Save/Cancel actions
 * - Type-specific configuration fields
 */

import { useState } from 'react';
import { Button } from '@salt-ds/core';
import type { Widget, WidgetType } from '@/lib/types/dashboard';

interface WidgetConfigModalProps {
  widget: Widget;
  isOpen: boolean;
  onClose: () => void;
  onSave: (widgetId: string, config: Record<string, unknown>) => void;
}

export default function WidgetConfigModal({ widget, isOpen, onClose, onSave }: WidgetConfigModalProps) {
  const [config, setConfig] = useState<Record<string, unknown>>(widget.config);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate configuration
    const validationErrors = validateConfig(widget.type, config);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(widget.id, config);
    onClose();
  };

  const handleCancel = () => {
    setConfig(widget.config); // Reset to original
    setErrors({});
    onClose();
  };

  const updateField = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Configure Widget</h2>
              <p className="text-sm text-gray-600 mt-1">{widget.metadata.title}</p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {renderConfigForm(widget.type, config, updateField, errors)}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button onClick={handleCancel} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="cta">
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Render configuration form based on widget type
function renderConfigForm(
  type: WidgetType,
  config: Record<string, unknown>,
  updateField: (field: string, value: string) => void,
  errors: Record<string, string>
): React.ReactNode {
  // GitHub widgets - owner/repo config
  if (type.startsWith('github-')) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repository Owner
          </label>
          <input
            type="text"
            value={(config.owner as string) || ''}
            onChange={(e) => updateField('owner', e.target.value)}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
              errors.owner
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="facebook"
          />
          {errors.owner && (
            <p className="mt-1 text-sm text-red-600">{errors.owner}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repository Name
          </label>
          <input
            type="text"
            value={(config.repo as string) || ''}
            onChange={(e) => updateField('repo', e.target.value)}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
              errors.repo
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="react"
          />
          {errors.repo && (
            <p className="mt-1 text-sm text-red-600">{errors.repo}</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Example:</strong> For the repository <code className="bg-blue-100 px-1 rounded">facebook/react</code>,
            enter <code className="bg-blue-100 px-1 rounded">facebook</code> as owner and{' '}
            <code className="bg-blue-100 px-1 rounded">react</code> as name.
          </p>
        </div>
      </div>
    );
  }

  // npm widgets - packageName config
  if (type.startsWith('npm-')) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Name
          </label>
          <input
            type="text"
            value={(config.packageName as string) || ''}
            onChange={(e) => updateField('packageName', e.target.value)}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
              errors.packageName
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="react"
          />
          {errors.packageName && (
            <p className="mt-1 text-sm text-red-600">{errors.packageName}</p>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Example:</strong> Enter the exact npm package name like{' '}
            <code className="bg-green-100 px-1 rounded">react</code>,{' '}
            <code className="bg-green-100 px-1 rounded">@angular/core</code>, or{' '}
            <code className="bg-green-100 px-1 rounded">lodash</code>.
          </p>
        </div>
      </div>
    );
  }

  // Default for other widget types
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600">
        Configuration options for this widget type are not yet available.
      </p>
    </div>
  );
}

// Validate configuration based on widget type
function validateConfig(
  type: WidgetType,
  config: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};

  // GitHub widgets validation
  if (type.startsWith('github-')) {
    if (!config.owner || (config.owner as string).trim() === '') {
      errors.owner = 'Repository owner is required';
    }
    if (!config.repo || (config.repo as string).trim() === '') {
      errors.repo = 'Repository name is required';
    }
  }

  // npm widgets validation
  if (type.startsWith('npm-')) {
    if (!config.packageName || (config.packageName as string).trim() === '') {
      errors.packageName = 'Package name is required';
    }
  }

  return errors;
}
