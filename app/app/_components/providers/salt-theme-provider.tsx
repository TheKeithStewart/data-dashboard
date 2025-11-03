'use client';

import { SaltProvider } from '@salt-ds/core';
import '@salt-ds/theme/index.css';

interface SaltThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Salt Design System Theme Provider
 *
 * Configuration:
 * - density: "high" - Compact layout optimized for data-heavy dashboards
 * - mode: "light" - Light theme (can be extended to support dark mode)
 * - theme: "jpm" - JPMorgan brand theme
 *
 * Must be a client component for Next.js App Router compatibility.
 */
export function SaltThemeProvider({ children }: SaltThemeProviderProps) {
  return (
    <SaltProvider
      density="high"
      mode="light"
      applyClassesTo="root"
    >
      {children}
    </SaltProvider>
  );
}
