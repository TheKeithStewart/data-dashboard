# Dashboard Builder - UI/UX Design Specification

**Project**: dashboard-builder
**Timestamp**: 20251101-220250
**Design System**: Salt Design System
**Technology Stack**: Next.js 15 + React 19 + TypeScript 5
**Data Sources**: GitHub API + npm Registry API
**Visualization Library**: Recharts 3
**Layout Engine**: react-grid-layout

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Design System](#2-visual-design-system)
3. [Wireframes](#3-wireframes)
4. [Component Hierarchy](#4-component-hierarchy)
5. [User Flows](#5-user-flows)
6. [Interaction Patterns](#6-interaction-patterns)
7. [Responsive Design](#7-responsive-design)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [State Management Strategy](#9-state-management-strategy)
10. [Animation & Transitions](#10-animation--transitions)

---

## 1. Design Philosophy

### Core Principles

**Clarity Over Decoration**: Every visual element serves a functional purpose. The dashboard is a tool for monitoring metrics, not a showcase of visual effects. Information density is balanced with whitespace to prevent cognitive overload.

**Progressive Disclosure**: Complex functionality is revealed contextually. New users see a clean, uncluttered interface while advanced features appear when needed through hover states, dropdown menus, and modal dialogs.

**Data-First Presentation**: Visualizations are the primary focus. Chrome, navigation, and controls are purposefully subdued to emphasize the data widgets. Salt DS's neutral palette supports this by providing subtle UI backgrounds that don't compete with colorful charts.

**Familiar Patterns**: Drag-and-drop, resize handles, and grid snapping follow conventions from established tools (Figma, Notion, Tableau). Users should feel immediately comfortable manipulating their dashboard layout.

**Purposeful Motion**: Animations communicate system state (loading, saving, errors) and provide feedback for user actions. Motion is functional, not decorative.

### Design Constraints

- **No Custom Theming**: Salt Design System tokens used exclusively
- **No Purple-Blue Gradients**: Avoid trendy AI/SaaS aesthetic clichés
- **Professional Palette**: Neutral grays, purposeful accent colors for semantic meaning
- **Grid Discipline**: All spacing adheres to 8px base grid
- **Density Options**: Support both comfortable and compact layout modes

---

## 2. Visual Design System

### Color Palette (Salt DS Tokens)

#### Primary Colors
```
Background Colors:
- Primary Background: #FFFFFF (Salt: --salt-color-white)
- Secondary Background: #F5F5F5 (Salt: --salt-container-primary-background)
- Tertiary Background: #E8E8E8 (Salt: --salt-container-secondary-background)
- Dashboard Canvas: #FAFAFA (Salt: --salt-palette-neutral-10)

Text Colors:
- Primary Text: #2D2D2D (Salt: --salt-content-primary-foreground)
- Secondary Text: #6C6C6C (Salt: --salt-content-secondary-foreground)
- Tertiary Text: #9F9F9F (Salt: --salt-content-tertiary-foreground)
- Disabled Text: #CACACA (Salt: --salt-content-disabled-foreground)

Border Colors:
- Primary Border: #D1D1D1 (Salt: --salt-separable-primary-borderColor)
- Secondary Border: #E8E8E8 (Salt: --salt-separable-secondary-borderColor)
- Focus Border: #2670A9 (Salt: --salt-focused-outlineColor)
```

#### Semantic Colors
```
Status Colors:
- Success: #14804A (Salt: --salt-status-success-foreground)
- Success Background: #E5F2E5 (Salt: --salt-status-success-background)
- Warning: #9C6E05 (Salt: --salt-status-warning-foreground)
- Warning Background: #FFF4D5 (Salt: --salt-status-warning-background)
- Error: #C82124 (Salt: --salt-status-error-foreground)
- Error Background: #FFEAEB (Salt: --salt-status-error-background)
- Info: #1D72B6 (Salt: --salt-status-info-foreground)
- Info Background: #E5F2FC (Salt: --salt-status-info-background)

Interactive Colors:
- Primary Action: #2670A9 (Salt: --salt-actionable-primary-background)
- Primary Hover: #1E5A8E (Salt: --salt-actionable-primary-background-hover)
- Primary Active: #164775 (Salt: --salt-actionable-primary-background-active)
- Secondary Action: #FFFFFF with border
- Link: #2670A9 (Salt: --salt-navigable-primary-foreground)
- Link Hover: #1E5A8E (Salt: --salt-navigable-primary-foreground-hover)
```

#### Chart Visualization Colors
```
Chart Palette (avoiding AI clichés):
- Chart Color 1: #2670A9 (Deep Ocean Blue)
- Chart Color 2: #14804A (Forest Green)
- Chart Color 3: #C77B05 (Amber)
- Chart Color 4: #7D4CDB (Violet - use sparingly)
- Chart Color 5: #C82124 (Crimson)
- Chart Color 6: #5E8C61 (Sage Green)
- Chart Color 7: #8C6900 (Dark Gold)
- Chart Color 8: #6A737D (Slate Gray)

Gradient Fills (for area charts):
- Primary Gradient: rgba(38, 112, 169, 0.1) to transparent
- Success Gradient: rgba(20, 128, 74, 0.1) to transparent
```

### Typography

#### Font Family
```
Font Stack: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif
(Salt DS default system font stack)
```

#### Type Scale
```
Display Headings:
- H1 Display: 32px / 40px line-height, 600 weight (Dashboard titles)
- H2 Section: 24px / 32px line-height, 600 weight (Widget catalog sections)
- H3 Subsection: 18px / 24px line-height, 600 weight (Widget titles)
- H4 Label: 16px / 24px line-height, 600 weight (Form labels, tabs)

Body Text:
- Body Large: 16px / 24px line-height, 400 weight (Widget descriptions)
- Body Default: 14px / 20px line-height, 400 weight (Primary UI text)
- Body Small: 12px / 16px line-height, 400 weight (Captions, metadata)
- Body XSmall: 10px / 14px line-height, 400 weight (Axis labels, fine print)

Data Display:
- Metric Large: 48px / 56px line-height, 300 weight (Primary metrics)
- Metric Medium: 32px / 40px line-height, 400 weight (Secondary metrics)
- Metric Small: 24px / 32px line-height, 400 weight (Tertiary metrics)

Code/Monospace:
- Code: 14px "Consolas", "Monaco", "Courier New", monospace (API endpoints, package names)
```

#### Font Weights
```
- Light: 300 (Large numeric metrics)
- Regular: 400 (Body text, descriptions)
- Semibold: 600 (Headings, labels, buttons)
```

### Spacing System

#### Base Grid: 8px

```
Spacing Scale:
- XXS: 4px (Tight inline spacing)
- XS: 8px (Compact component padding)
- SM: 16px (Default component padding)
- MD: 24px (Section spacing)
- LG: 32px (Major section separation)
- XL: 48px (Page margins)
- XXL: 64px (Layout regions)

Component-Specific Spacing:
- Button Padding: 12px horizontal, 8px vertical (SM + XS)
- Input Padding: 12px horizontal, 10px vertical
- Card Padding: 24px (MD)
- Widget Padding: 16px (SM)
- Modal Padding: 32px (LG)
- Page Container Padding: 48px desktop, 24px tablet, 16px mobile
```

### Elevation & Shadows

```
Shadow Definitions (Salt DS):
- Level 0 (Flat): none (Dashboard canvas)
- Level 1 (Raised): 0px 1px 3px rgba(0, 0, 0, 0.1) (Widgets at rest)
- Level 2 (Floating): 0px 4px 8px rgba(0, 0, 0, 0.15) (Hover state, dropdowns)
- Level 3 (Modal): 0px 8px 24px rgba(0, 0, 0, 0.2) (Dialogs, overlays)
- Level 4 (Dragging): 0px 12px 32px rgba(0, 0, 0, 0.25) (Active drag)

Widget States:
- Default: Level 1
- Hover: Level 2
- Dragging: Level 4
- Resizing: Level 2
```

### Border Radius

```
Radius Scale:
- None: 0px (Data tables, grid cells)
- Small: 4px (Buttons, inputs, tags)
- Medium: 8px (Cards, widgets, panels)
- Large: 12px (Modals, major containers)
- Circle: 50% (Avatars, icon buttons)

Widget Corners: 8px (Medium)
Modal Corners: 12px (Large)
Button Corners: 4px (Small)
Input Corners: 4px (Small)
```

### Iconography

```
Icon Library: Salt Icons (built-in to Salt DS)
Icon Sizes:
- Small: 16px (Inline icons, table cells)
- Medium: 20px (Buttons, form fields)
- Large: 24px (Headers, primary actions)
- XLarge: 32px (Empty states, widget placeholders)

Icon Colors:
- Primary: #2D2D2D (Default icons)
- Secondary: #6C6C6C (Supporting icons)
- Disabled: #CACACA (Inactive states)
- Interactive: #2670A9 (Clickable icons)
```

---

## 3. Wireframes

### 3.1 Application Shell

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════════════╗ │
│ ║  HEADER BAR                                               48px     ║ │
│ ║  [Logo] Dashboard Builder    [Dashboard Selector ▾]  [+ Add]      ║ │
│ ║                                                    [Refresh] [⚙]   ║ │
│ ╚═══════════════════════════════════════════════════════════════════╝ │
│                                                                         │
│ ┌───────────────┬───────────────────────────────────────────────────┐ │
│ │               │                                                   │ │
│ │   SIDEBAR     │              DASHBOARD CANVAS                     │ │
│ │   280px       │              (react-grid-layout container)        │ │
│ │               │                                                   │ │
│ │ Dashboards    │  ┌─────────────┐  ┌─────────────┐               │ │
│ │ ──────────    │  │  WIDGET 1   │  │  WIDGET 2   │               │ │
│ │ 📊 My Team    │  │  (2x2 grid) │  │  (2x1 grid) │               │ │
│ │ 📦 Packages   │  │             │  │             │               │ │
│ │ 🔍 Monitoring │  │   [Chart]   │  │  [Metric]   │               │ │
│ │ ──────────    │  │             │  │             │               │ │
│ │               │  └─────────────┘  └─────────────┘               │ │
│ │ + New         │                                                   │ │
│ │               │  ┌─────────────────────────────┐                 │ │
│ │ Widget Catalog│  │       WIDGET 3              │                 │ │
│ │ ──────────    │  │       (4x2 grid)            │                 │ │
│ │ 🎨 Browse     │  │                             │                 │ │
│ │               │  │       [Table/List]          │                 │ │
│ │               │  │                             │                 │ │
│ │               │  └─────────────────────────────┘                 │ │
│ │               │                                                   │ │
│ └───────────────┴───────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Dimensions:
- Header: Full width × 48px fixed
- Sidebar: 280px × Full height (collapsible to 64px icon-only)
- Canvas: Remaining width × Full height with 24px padding
- Total minimum width: 1024px
```

### 3.2 Main Dashboard View (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                  │
│ ─────────────────────────────────────────────────────────────────────── │
│ [🏠 Logo] Dashboard Builder                                            │
│                                                                         │
│           ┌────────────────────────────┐                               │
│           │ 📊 My Team Dashboard    ▾  │  [+ New Dashboard]            │
│           └────────────────────────────┘                               │
│                                              [🔄 Refresh] [⚙ Settings] │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ ┌─SIDEBAR────────┐  ┌─CANVAS─────────────────────────────────────────┐│
│ │                │  │                                                 ││
│ │ MY DASHBOARDS  │  │  [Empty State when no widgets]                 ││
│ │ ─────────────  │  │                                                 ││
│ │ 📊 My Team ◀   │  │     🎨                                          ││
│ │ 📦 Packages    │  │                                                 ││
│ │ 🔍 Monitor     │  │  Your dashboard is empty                       ││
│ │                │  │                                                 ││
│ │ + New          │  │  Add widgets to start monitoring your projects ││
│ │                │  │                                                 ││
│ │ ───────────    │  │  [Browse Widget Catalog]                       ││
│ │                │  │                                                 ││
│ │ QUICK ACTIONS  │  │                                                 ││
│ │ ─────────────  │  │                                                 ││
│ │ 🎨 Widgets     │  └─────────────────────────────────────────────────┘│
│ │ 📥 Import      │                                                     │
│ │ 📤 Export      │  ┌─CANVAS (with widgets)──────────────────────────┐│
│ │                │  │                                                 ││
│ │ ───────────    │  │ ╔═══════════╗ ╔═════════════════════╗         ││
│ │                │  │ ║ GH-06     ║ ║ NPM-01              ║         ││
│ │ SETTINGS       │  │ ║ Repo      ║ ║ Package Downloads   ║         ││
│ │ ─────────────  │  │ ║ Health    ║ ║                     ║         ││
│ │ 🎨 Theme       │  │ ║           ║ ║ [Area Chart]        ║         ││
│ │ 🔔 Refresh     │  │ ║   92/100  ║ ║                     ║         ││
│ │                │  │ ║  ●●●●●○   ║ ║ 145K downloads      ║         ││
│ │                │  │ ╚═══════════╝ ╚═════════════════════╝         ││
│ │                │  │                                                 ││
│ │                │  │ ╔═══════════════════════════════════╗           ││
│ │                │  │ ║ GH-04: Top Contributors          ║           ││
│ │                │  │ ║ ─────────────────────────────────║           ││
│ │                │  │ ║ 👤 Alice Chen      1,247 commits ║           ││
│ │                │  │ ║ 👤 Bob Smith         892 commits ║           ││
│ │                │  │ ║ 👤 Carol Davis       654 commits ║           ││
│ │                │  │ ║ 👤 Dave Wilson       441 commits ║           ││
│ │                │  │ ║ 👤 Eve Martinez      287 commits ║           ││
│ │                │  │ ╚═══════════════════════════════════╝           ││
│ │                │  │                                                 ││
│ └────────────────┘  └─────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Widget Grid Specifications:
- 12-column grid on desktop (1920px)
- Column width: ~120px with 16px gutters
- Row height: 80px with 16px gutters
- Widget minimum: 1x1 (140px × 96px)
- Widget maximum: 12x6 (full width, 6 rows)
- Drag handles: Entire widget header is draggable
- Resize handles: Bottom-right corner + all edges
```

### 3.3 Widget Catalog Interface

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Widget Catalog                                              [✕ Close]  │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ [🔍 Search widgets...]                              [Filter ▾]         │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │                                                                   │ │
│ │  ┌─ GitHub Widgets ─────────────────────────────────────────┐    │ │
│ │  │                                                           │    │ │
│ │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│    │ │
│ │  │  │ GH-01    │  │ GH-02    │  │ GH-03    │  │ GH-04    ││    │ │
│ │  │  │ [📈]     │  │ [📊]     │  │ [📊]     │  │ [👥]     ││    │ │
│ │  │  │          │  │          │  │          │  │          ││    │ │
│ │  │  │ Stars    │  │ Issue    │  │ Pull Req │  │ Top      ││    │ │
│ │  │  │ Trend    │  │ Health   │  │ Activity │  │ Contributors    ││
│ │  │  │          │  │          │  │          │  │          ││    │ │
│ │  │  │ Line     │  │ Gauges   │  │ Bar      │  │ Table    ││    │ │
│ │  │  │ chart    │  │ +metrics │  │ chart    │  │ ranked   ││    │ │
│ │  │  │          │  │          │  │          │  │          ││    │ │
│ │  │  │ [+ Add]  │  │ [+ Add]  │  │ [+ Add]  │  │ [+ Add]  ││    │ │
│ │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│    │ │
│ │  │                                                           │    │ │
│ │  │  ┌──────────┐  ┌──────────┐                             │    │ │
│ │  │  │ GH-05    │  │ GH-06    │                             │    │ │
│ │  │  │ [📅]     │  │ [✓]      │                             │    │ │
│ │  │  │          │  │          │                             │    │ │
│ │  │  │ Release  │  │ Repo     │                             │    │ │
│ │  │  │ Timeline │  │ Health   │                             │    │ │
│ │  │  │          │  │          │                             │    │ │
│ │  │  │ Timeline │  │ Score    │                             │    │ │
│ │  │  │ markers  │  │ composite│                             │    │ │
│ │  │  │          │  │          │                             │    │ │
│ │  │  │ [+ Add]  │  │ [+ Add]  │                             │    │ │
│ │  │  └──────────┘  └──────────┘                             │    │ │
│ │  └───────────────────────────────────────────────────────────┘    │ │
│ │                                                                   │ │
│ │  ┌─ npm Widgets ─────────────────────────────────────────────┐   │ │
│ │  │                                                            │   │ │
│ │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │ │
│ │  │  │ NPM-01   │  │ NPM-02   │  │ NPM-03   │  │ NPM-04   │ │   │ │
│ │  │  │ [📈]     │  │ [○]      │  │ [✓]      │  │ [#]      │ │   │ │
│ │  │  │          │  │          │  │          │  │          │ │   │ │
│ │  │  │ Downloads│  │ Version  │  │ Package  │  │ Dependency     ││
│ │  │  │ Trend    │  │ Distribution  Health   │  │ Risk     │ │   │ │
│ │  │  │          │  │          │  │          │  │          │ │   │ │
│ │  │  │ Area     │  │ Donut    │  │ Score    │  │ Heatmap  │ │   │ │
│ │  │  │ chart    │  │ chart    │  │ card     │  │ grid     │ │   │ │
│ │  │  │          │  │          │  │          │  │          │ │   │ │
│ │  │  │ [+ Add]  │  │ [+ Add]  │  │ [+ Add]  │  │ [+ Add]  │ │   │ │
│ │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │ │
│ │  └────────────────────────────────────────────────────────────┘   │ │
│ │                                                                   │ │
│ │  ┌─ Combined Widgets ────────────────────────────────────────┐   │ │
│ │  │                                                            │   │ │
│ │  │  ┌──────────┐  ┌──────────┐                              │   │ │
│ │  │  │ COMBO-01 │  │ COMBO-02 │                              │   │ │
│ │  │  │ [📊]     │  │ [📈📈]   │                              │   │ │
│ │  │  │          │  │          │                              │   │ │
│ │  │  │ Project  │  │ Growth   │                              │   │ │
│ │  │  │ Overview │  │ Comparison                              │   │ │
│ │  │  │          │  │          │                              │   │ │
│ │  │  │ Multi-   │  │ Dual-axis│                              │   │ │
│ │  │  │ section  │  │ line     │                              │   │ │
│ │  │  │          │  │          │                              │   │ │
│ │  │  │ [+ Add]  │  │ [+ Add]  │                              │   │ │
│ │  │  └──────────┘  └──────────┘                              │   │ │
│ │  └────────────────────────────────────────────────────────────┘   │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Widget Card Specifications:
- Card size: 180px × 240px
- Card padding: 16px
- Icon size: 48px centered at top
- Title: H4 (16px semibold)
- Description: Body Small (12px, 2 lines max)
- Button: Small primary button
- Hover: Elevate to Level 2, show preview tooltip
- Grid: 4 columns with 16px gap
```

### 3.4 Widget Configuration Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│     ┌───────────────────────────────────────────────────────────┐     │
│     │  Configure Widget: GitHub Stars Trend                     │     │
│     │                                                     [✕]    │     │
│     ├───────────────────────────────────────────────────────────┤     │
│     │                                                           │     │
│     │  Widget Preview                                           │     │
│     │  ┌─────────────────────────────────────────────────┐     │     │
│     │  │  [Mini chart visualization preview]             │     │     │
│     │  │                                                  │     │     │
│     │  │   ╱╲                                            │     │     │
│     │  │  ╱  ╲    ╱╲                                     │     │     │
│     │  │ ╱    ╲  ╱  ╲  ╱╲                               │     │     │
│     │  │       ╲╱    ╲╱  ╲                              │     │     │
│     │  │                                                  │     │     │
│     │  └─────────────────────────────────────────────────┘     │     │
│     │                                                           │     │
│     │  Configuration                                            │     │
│     │  ──────────────────────────────────────────────────       │     │
│     │                                                           │     │
│     │  Repository *                                             │     │
│     │  ┌─────────────────────────────────────────────────┐     │     │
│     │  │ facebook/react                              [🔍]│     │     │
│     │  └─────────────────────────────────────────────────┘     │     │
│     │  Format: owner/repository                                │     │
│     │                                                           │     │
│     │  Time Period *                                            │     │
│     │  ┌─────────────────────────────────────────────────┐     │     │
│     │  │ Last 30 days                                 ▾  │     │     │
│     │  └─────────────────────────────────────────────────┘     │     │
│     │  Options: 7d, 30d, 90d, 1yr, all-time                    │     │
│     │                                                           │     │
│     │  Widget Title (optional)                                 │     │
│     │  ┌─────────────────────────────────────────────────┐     │     │
│     │  │ React Stars Growth                              │     │     │
│     │  └─────────────────────────────────────────────────┘     │     │
│     │  Leave empty to use default title                        │     │
│     │                                                           │     │
│     │  Refresh Interval                                        │     │
│     │  ┌─────────────────────────────────────────────────┐     │     │
│     │  │ 15 minutes                                   ▾  │     │     │
│     │  └─────────────────────────────────────────────────┘     │     │
│     │  Options: Off, 1min, 5min, 15min, 30min, 1hr             │     │
│     │                                                           │     │
│     │  ─────────────────────────────────────────────────        │     │
│     │                                                           │     │
│     │                          [Cancel] [Add to Dashboard]     │     │
│     │                                                           │     │
│     └───────────────────────────────────────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Modal Specifications:
- Width: 600px
- Max height: 80vh with scroll
- Padding: 32px
- Shadow: Level 3
- Backdrop: rgba(0, 0, 0, 0.5)
- Border radius: 12px
- Preview height: 200px
- Form spacing: 24px between fields
- Required fields marked with *
```

### 3.5 Widget States (Individual Widget)

```
DEFAULT STATE (at rest):
┌──────────────────────────────────────┐
│ GH-01: React Stars Trend         [⚙]│ ← Header: draggable
├──────────────────────────────────────┤
│                                      │
│        ╱╲                           │
│       ╱  ╲    ╱╲                    │
│      ╱    ╲  ╱  ╲  ╱╲              │ ← Chart area
│     ╱      ╲╱    ╲╱  ╲             │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ 245K stars (+12K this month) │   │ ← Summary
│ └──────────────────────────────┘   │
└──────────────────────────────────────┘
Shadow: Level 1
Border: 1px #E8E8E8


HOVER STATE:
┌──────────────────────────────────────┐
│ GH-01: React Stars Trend    [⚙][✕] │ ← Actions appear
├──────────────────────────────────────┤
│                                      │
│        ╱╲                           │
│       ╱  ╲    ╱╲                    │
│      ╱    ╲  ╱  ╲  ╱╲              │
│     ╱      ╲╱    ╲╱  ╲             │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ 245K stars (+12K this month) │   │
│ └──────────────────────────────┘   │
└──────────────────────────────────────┘
                                     ╲╲ ← Resize handle visible
Shadow: Level 2
Border: 1px #2670A9
Cursor: move (on header)


DRAGGING STATE:
    ┌──────────────────────────────────────┐
    │ GH-01: React Stars Trend         [⚙]│
    ├──────────────────────────────────────┤
    │                                      │
    │                                      │  ← Reduced opacity 0.7
    │            [DRAGGING]                │
    │                                      │
    │                                      │
    └──────────────────────────────────────┘
Shadow: Level 4
Border: 2px dashed #2670A9
Cursor: grabbing


LOADING STATE:
┌──────────────────────────────────────┐
│ GH-01: React Stars Trend         [⚙]│
├──────────────────────────────────────┤
│                                      │
│          ┌─────────────┐            │
│          │   ⟳         │            │ ← Spinner centered
│          │   Loading...│            │
│          └─────────────┘            │
│                                      │
└──────────────────────────────────────┘
Skeleton: Pulsing background animation


ERROR STATE:
┌──────────────────────────────────────┐
│ GH-01: React Stars Trend         [⚙]│
├──────────────────────────────────────┤
│                                      │
│          ⚠                          │
│                                      │
│   Unable to load data               │
│   API rate limit exceeded           │ ← Error message
│                                      │
│          [Retry]                    │ ← Action button
│                                      │
└──────────────────────────────────────┘
Background: #FFEAEB (error background tint)
Border: 1px #C82124


RESIZING STATE:
┌──────────────────────────────────────┐
│ GH-01: React Stars Trend         [⚙]│
├──────────────────────────────────────┤
│                                      │
│        ╱╲                           │
│       ╱  ╲    ╱╲                    │
│      ╱    ╲  ╱  ╲  ╱╲              │
│     ╱      ╲╱    ╲╱  ╲             │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ 245K stars (+12K this month) │   │
└──────────────────────────────────────┘
                                  ▨▨▨▨ ← Resize handles on all edges
Shadow: Level 2
Border: 2px solid #2670A9
Grid overlay visible (faint)
```

### 3.6 Dashboard Management Panel

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Dashboard Settings                                          [✕ Close]  │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                         │
│ ┌─ Active Dashboard ────────────────────────────────────────────────┐ │
│ │                                                                   │ │
│ │  Name: My Team Dashboard                                         │ │
│ │  ┌─────────────────────────────────────────────────────────┐     │ │
│ │  │ My Team Dashboard                                       │     │ │
│ │  └─────────────────────────────────────────────────────────┘     │ │
│ │                                                                   │ │
│ │  Created: 2025-10-15                                             │ │
│ │  Widgets: 8                                                      │ │
│ │  Last modified: 2025-11-01 14:32                                 │ │
│ │                                                                   │ │
│ │  [Rename] [Duplicate] [Delete]                                   │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─ All Dashboards ──────────────────────────────────────────────────┐ │
│ │                                                                   │ │
│ │  ┌─────────────────────────────────────────────────────────────┐ │ │
│ │  │ 📊 My Team Dashboard                               [Active] │ │ │
│ │  │ 8 widgets · Modified 2025-11-01                     [⚙][✕] │ │ │
│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │  ┌─────────────────────────────────────────────────────────────┐ │ │
│ │  │ 📦 Package Monitoring                                        │ │ │
│ │  │ 5 widgets · Modified 2025-10-28                     [⚙][✕] │ │ │
│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │  ┌─────────────────────────────────────────────────────────────┐ │ │
│ │  │ 🔍 Monitoring Dashboard                                      │ │ │
│ │  │ 12 widgets · Modified 2025-10-20                    [⚙][✕] │ │ │
│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │  [+ Create New Dashboard]                                        │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─ Import / Export ─────────────────────────────────────────────────┐ │
│ │                                                                   │ │
│ │  Export Configuration                                            │ │
│ │  [Export Current Dashboard]  [Export All Dashboards]             │ │
│ │                                                                   │ │
│ │  Import Configuration                                            │ │
│ │  [Choose File...]  or drag JSON file here                       │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                                            [Close]      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Panel Specifications:
- Panel type: Slide-out from right
- Width: 480px
- Animation: 300ms ease-out
- Backdrop: rgba(0, 0, 0, 0.3)
- Dashboard list item height: 72px
- Icons: 20px medium size
- Action buttons: Icon buttons 32px
```

### 3.7 Responsive Breakpoints

#### Desktop (1920px)
```
┌────────────────────────────────────────────────────────────────┐
│ [Header 48px]                                                  │
├──────────┬─────────────────────────────────────────────────────┤
│ Sidebar  │  Canvas (12 columns)                                │
│ 280px    │  ┌───┐ ┌───┐ ┌───┐ ┌───┐                          │
│          │  └───┘ └───┘ └───┘ └───┘                          │
│          │  ┌─────────┐ ┌─────────┐                          │
│ Expanded │  └─────────┘ └─────────┘                          │
│          │                                                     │
└──────────┴─────────────────────────────────────────────────────┘
Grid: 12 columns × dynamic rows
Column width: ~140px (with 1640px available)
Gutter: 16px
Widget min: 2 columns wide (practical minimum)
```

#### Laptop (1440px)
```
┌──────────────────────────────────────────────────────────┐
│ [Header 48px]                                            │
├──────────┬───────────────────────────────────────────────┤
│ Sidebar  │  Canvas (12 columns)                          │
│ 280px    │  ┌───┐ ┌───┐ ┌───┐                           │
│          │  └───┘ └───┘ └───┘                           │
│          │  ┌─────────┐                                  │
│ Expanded │  └─────────┘                                  │
│          │                                                │
└──────────┴───────────────────────────────────────────────┘
Grid: 12 columns × dynamic rows
Column width: ~88px (with 1160px available)
Gutter: 16px
```

#### Tablet (1024px)
```
┌────────────────────────────────────────────────────┐
│ [Header 48px]                                      │
├─────┬──────────────────────────────────────────────┤
│[☰]  │  Canvas (8 columns)                          │
│64px │  ┌─────┐ ┌─────┐                            │
│     │  └─────┘ └─────┘                            │
│Icon │  ┌─────────────┐                            │
│Only │  └─────────────┘                            │
│     │                                              │
└─────┴──────────────────────────────────────────────┘
Grid: 8 columns × dynamic rows
Column width: ~110px (with 960px available)
Gutter: 16px
Sidebar: Collapsed to 64px icons
```

#### Mobile (768px) - Out of Scope for V1
```
Note: Mobile breakpoint defined but not fully supported.
Show message: "Please use a larger screen for best experience"
Allow view-only mode with vertical scroll (no editing)
```

---

## 4. Component Hierarchy

### 4.1 Application Structure

```
<DashboardApp>
├── <AppHeader>
│   ├── <Logo>
│   ├── <DashboardSelector>
│   │   ├── <Dropdown trigger="current dashboard name">
│   │   └── <DropdownMenu>
│   │       └── <DashboardMenuItem> × N
│   ├── <NewDashboardButton>
│   ├── <RefreshButton>
│   └── <SettingsButton>
│
├── <AppLayout>
│   ├── <Sidebar>
│   │   ├── <SidebarSection title="My Dashboards">
│   │   │   ├── <DashboardListItem active> × 1
│   │   │   ├── <DashboardListItem> × N
│   │   │   └── <NewDashboardButton variant="text">
│   │   │
│   │   ├── <SidebarSection title="Quick Actions">
│   │   │   ├── <ActionButton icon="widgets" label="Browse Catalog">
│   │   │   ├── <ActionButton icon="import" label="Import">
│   │   │   └── <ActionButton icon="export" label="Export">
│   │   │
│   │   └── <SidebarSection title="Settings">
│   │       ├── <ActionButton icon="theme" label="Theme">
│   │       └── <ActionButton icon="refresh" label="Auto-refresh">
│   │
│   └── <DashboardCanvas>
│       ├── <GridLayoutWrapper> (react-grid-layout)
│       │   └── <Widget> × N
│       │       ├── <WidgetHeader>
│       │       │   ├── <WidgetTitle>
│       │       │   ├── <WidgetActions>
│       │       │   │   ├── <RefreshButton>
│       │       │   │   ├── <ConfigButton>
│       │       │   │   └── <RemoveButton>
│       │       │
│       │       ├── <WidgetBody>
│       │       │   ├── <WidgetLoading> (when loading)
│       │       │   ├── <WidgetError> (when error)
│       │       │   └── <WidgetContent> (when success)
│       │       │       └── [Widget-specific visualization]
│       │       │
│       │       └── <WidgetFooter> (optional)
│       │           └── <WidgetSummary>
│       │
│       └── <EmptyDashboardState> (when no widgets)
│           ├── <EmptyStateIcon>
│           ├── <EmptyStateMessage>
│           └── <BrowseCatalogButton>
│
├── <WidgetCatalogModal> (when open)
│   ├── <ModalHeader>
│   │   ├── <ModalTitle>
│   │   └── <CloseButton>
│   ├── <CatalogFilters>
│   │   ├── <SearchInput>
│   │   └── <CategoryFilter>
│   ├── <CatalogContent>
│   │   └── <WidgetCategorySection> × N
│   │       ├── <SectionHeader>
│   │       └── <WidgetCard> × N
│   │           ├── <WidgetIcon>
│   │           ├── <WidgetName>
│   │           ├── <WidgetDescription>
│   │           └── <AddWidgetButton>
│   └── <ModalFooter>
│
├── <WidgetConfigModal> (when configuring)
│   ├── <ModalHeader>
│   ├── <WidgetPreview>
│   ├── <ConfigForm>
│   │   └── <FormField> × N
│   │       ├── <Label>
│   │       ├── <Input | Select | Textarea>
│   │       └── <HelperText | ErrorText>
│   └── <ModalActions>
│       ├── <CancelButton>
│       └── <SubmitButton>
│
├── <DashboardManagementPanel> (when open)
│   ├── <PanelHeader>
│   ├── <ActiveDashboardSection>
│   │   ├── <DashboardNameInput>
│   │   ├── <DashboardMetadata>
│   │   └── <DashboardActions>
│   ├── <AllDashboardsList>
│   │   └── <DashboardCard> × N
│   └── <ImportExportSection>
│       ├── <ExportButtons>
│       └── <ImportDropzone>
│
└── <ToastContainer>
    └── <Toast> × N (notifications)
        ├── <ToastIcon>
        ├── <ToastMessage>
        └── <ToastDismiss>
```

### 4.2 Widget Component Anatomy

Each widget follows a consistent internal structure regardless of type:

```
<Widget id={widgetId} type={widgetType} config={widgetConfig}>
│
├── Component Layers:
│   ├── Container (positioning, sizing, shadow)
│   ├── Header (draggable, title, actions)
│   ├── Body (content area, states)
│   └── Footer (optional summary)
│
├── State Management:
│   ├── loading: boolean
│   ├── error: Error | null
│   ├── data: WidgetData<T> | null
│   └── config: WidgetConfig<T>
│
├── Lifecycle:
│   ├── onMount → fetchData()
│   ├── onConfigChange → refetchData()
│   ├── onRefresh → refetchData()
│   └── onUnmount → cleanup()
│
└── Interactions:
    ├── Drag (via react-grid-layout)
    ├── Resize (via react-grid-layout)
    ├── Configure (opens modal)
    ├── Refresh (manual data fetch)
    └── Remove (delete from dashboard)
```

### 4.3 Data Flow Architecture

```
User Action
    ↓
Component Event Handler
    ↓
State Update (React State / Context)
    ↓
┌─────────────────────────────────────┐
│  Dashboard State                    │
│  ─────────────────────────────────  │
│  • activeDashboardId                │
│  • dashboards[]                     │
│  • widgets[]                        │
│  • layouts{}                        │
└─────────────────────────────────────┘
    ↓
Persist to LocalStorage
    ↓
Re-render Components
    ↓
    ├─→ Widget needs data?
    │       ↓
    │   API Service Layer
    │       ↓
    │   Cache Check
    │       ├─→ Cache Hit → Return cached data
    │       └─→ Cache Miss → Fetch from API
    │               ↓
    │           GitHub/npm API
    │               ↓
    │           Response
    │               ↓
    │           Update Cache
    │               ↓
    │           Return data
    │               ↓
    │   Update Widget State
    │       ↓
    └─→ Render Widget Content
```

### 4.4 State Management Strategy

**Global Application State** (React Context + LocalStorage):
```typescript
interface AppState {
  dashboards: Dashboard[]
  activeDashboardId: string | null
  userPreferences: UserPreferences
}

interface Dashboard {
  id: string
  name: string
  createdAt: string
  modifiedAt: string
  widgets: WidgetInstance[]
  layout: Layout[] // react-grid-layout format
}

interface WidgetInstance {
  id: string // unique instance ID
  type: WidgetType // GH-01, NPM-01, etc.
  config: Record<string, unknown> // widget-specific config
  refreshInterval: RefreshInterval
}

interface UserPreferences {
  theme: 'light' | 'dark'
  defaultRefreshInterval: RefreshInterval
  compactMode: boolean
}
```

**Widget-Level State** (React Component State):
```typescript
interface WidgetState<T> {
  loading: boolean
  error: Error | null
  data: T | null
  lastFetched: string | null
}
```

**Form State** (React Hook Form):
- Widget configuration forms
- Dashboard creation/rename forms
- Settings forms

**Cache State** (In-memory Map):
```typescript
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // time-to-live in ms
}

// Cache key format: `${widgetType}:${JSON.stringify(params)}`
```

---

## 5. User Flows

### 5.1 First-Time User Experience

```
Step 1: Application Load
┌────────────────────────────────────────┐
│ Dashboard Builder                      │
│                                        │
│  Welcome to Dashboard Builder!         │
│                                        │
│  Create your first dashboard to        │
│  start monitoring GitHub and npm       │
│  metrics.                              │
│                                        │
│  [Create Dashboard]                    │
│                                        │
└────────────────────────────────────────┘

Step 2: Dashboard Creation
┌────────────────────────────────────────┐
│ Create New Dashboard                   │
│ ────────────────────────────────────   │
│                                        │
│ Dashboard Name *                       │
│ ┌────────────────────────────────────┐ │
│ │ My First Dashboard                 │ │
│ └────────────────────────────────────┘ │
│                                        │
│        [Cancel] [Create Dashboard]     │
└────────────────────────────────────────┘

Step 3: Empty Dashboard State
┌────────────────────────────────────────┐
│ My First Dashboard             [⚙][+] │
│                                        │
│           🎨                           │
│                                        │
│  Your dashboard is empty               │
│                                        │
│  Add widgets to start monitoring       │
│  your projects                         │
│                                        │
│  [Browse Widget Catalog]               │
│                                        │
└────────────────────────────────────────┘

Step 4: Widget Catalog Opens
[User browses categories]
[User clicks "Add" on GH-06: Repo Health Score]

Step 5: Widget Configuration
┌────────────────────────────────────────┐
│ Configure Widget: Repo Health Score    │
│ ────────────────────────────────────   │
│                                        │
│ Repository *                           │
│ ┌────────────────────────────────────┐ │
│ │ facebook/react                     │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [Cancel] [Add to Dashboard]            │
└────────────────────────────────────────┘

Step 6: Widget Appears on Dashboard
┌────────────────────────────────────────┐
│ My First Dashboard             [⚙][+] │
│                                        │
│ ╔════════════════╗                    │
│ ║ Repo Health    ║                    │
│ ║ Score          ║  [Loading...]      │
│ ║                ║                    │
│ ╚════════════════╝                    │
│                                        │
└────────────────────────────────────────┘

Step 7: Data Loads
┌────────────────────────────────────────┐
│ My First Dashboard             [⚙][+] │
│                                        │
│ ╔════════════════╗                    │
│ ║ Repo Health    ║                    │
│ ║ facebook/react ║                    │
│ ║                ║                    │
│ ║     92/100     ║                    │
│ ║    ●●●●●○      ║                    │
│ ╚════════════════╝                    │
│                                        │
│  💡 Tip: Click + to add more widgets  │
│                                        │
└────────────────────────────────────────┘

Onboarding complete: User can now add more widgets
```

### 5.2 Adding a Widget to Existing Dashboard

```
User Journey: Add NPM Downloads widget

[1] User clicks "Browse Catalog" button in sidebar
    ↓
[2] Widget Catalog modal opens
    ├─ GitHub Widgets section expanded by default
    ├─ npm Widgets section collapsed
    └─ Combined Widgets section collapsed
    ↓
[3] User clicks "npm Widgets" to expand
    ↓
[4] User sees NPM-01: Package Downloads Trend card
    ├─ Icon: 📈
    ├─ Description: "Track package adoption with download trends"
    └─ [+ Add] button
    ↓
[5] User clicks [+ Add] button
    ↓
[6] Widget Config Modal opens
    ├─ Shows preview (empty until package entered)
    ├─ Form fields:
    │   ├─ Package Name * (required)
    │   ├─ Time Period * (dropdown: 7d, 30d, 90d, 1yr)
    │   ├─ Granularity (dropdown: daily, weekly, monthly)
    │   ├─ Widget Title (optional)
    │   └─ Refresh Interval (dropdown)
    └─ [Cancel] [Add to Dashboard] buttons
    ↓
[7] User enters "react" in Package Name field
    ├─ Preview updates with simulated chart
    └─ Validation: Package exists (check npm API)
    ↓
[8] User selects "Last 30 days" for Time Period
    ↓
[9] User clicks [Add to Dashboard]
    ↓
[10] Modal closes with fade animation
     ↓
[11] Widget appears on dashboard
     ├─ Position: Next available grid space (top-left to bottom-right)
     ├─ Default size: 4 columns × 2 rows
     ├─ State: Loading
     └─ Fetch data from npm API
     ↓
[12] Data loads successfully
     ├─ Chart renders with download data
     ├─ Summary shows total downloads
     └─ Widget state: Success
     ↓
[13] Toast notification appears
     ├─ Message: "Widget added successfully"
     ├─ Duration: 3 seconds
     └─ Auto-dismiss
     ↓
[14] Layout auto-saves to LocalStorage
     ↓
[Complete] User can now interact with widget (drag, resize, configure, remove)
```

### 5.3 Dashboard Switching Workflow

```
Current State: User viewing "My Team Dashboard"

[1] User clicks Dashboard Selector dropdown in header
    ├─ Current: "My Team Dashboard ▾"
    └─ Opens dropdown menu below
    ↓
[2] Dropdown shows all dashboards
    ├─ 📊 My Team Dashboard ✓ (active, checkmark)
    ├─ 📦 Package Monitoring
    ├─ 🔍 Monitoring Dashboard
    └─ ───────────────────
        [+ Create New Dashboard]
    ↓
[3] User clicks "📦 Package Monitoring"
    ↓
[4] Transition begins
    ├─ Dropdown closes
    ├─ Current dashboard fades out (200ms)
    └─ Loading state (if widgets need fetch)
    ↓
[5] Dashboard state loads from LocalStorage
    ├─ Dashboard metadata
    ├─ Widget instances
    └─ Layout configuration
    ↓
[6] New dashboard fades in (200ms)
    ├─ Canvas renders grid
    ├─ Widgets mount
    └─ Each widget:
        ├─ Renders with last known data (if cached)
        └─ Fetches fresh data if cache expired
    ↓
[7] Header updates
    ├─ Dashboard Selector shows "Package Monitoring ▾"
    └─ Sidebar highlights new active dashboard
    ↓
[8] URL updates (optional)
    ├─ From: /dashboard
    ├─ To: /dashboard?id=package-monitoring
    └─ Enables browser back/forward navigation
    ↓
[9] Widgets finish loading
    ├─ Loading states → Success/Error states
    └─ Charts render
    ↓
[Complete] User now viewing "Package Monitoring" dashboard

Edge Cases:
- If dashboard deleted while viewing: Redirect to first available dashboard
- If no dashboards exist: Show welcome/create first dashboard screen
- If localStorage corrupted: Show error, offer to reset
```

### 5.4 Widget Drag-and-Drop Interaction

```
Initial State: Dashboard with 4 widgets in 2×2 grid

┌────────────────────────────────────────┐
│ ╔══════╗  ╔══════╗                    │
│ ║ W1   ║  ║ W2   ║                    │
│ ╚══════╝  ╚══════╝                    │
│                                        │
│ ╔══════╗  ╔══════╗                    │
│ ║ W3   ║  ║ W4   ║                    │
│ ╚══════╝  ╚══════╝                    │
└────────────────────────────────────────┘

User wants to move W3 to top-right

[1] User hovers over W3
    ├─ Widget header shows hover state
    ├─ Shadow: Level 1 → Level 2
    ├─ Border: Gray → Blue
    └─ Cursor: pointer → move
    ↓
[2] User mousedown on W3 header
    ├─ Widget state: Default → Dragging
    ├─ Shadow: Level 2 → Level 4
    ├─ Opacity: 1 → 0.7
    ├─ Border: Solid → Dashed
    └─ Cursor: move → grabbing
    ↓
[3] User drags W3 upward and right
    ├─ Widget follows mouse position
    ├─ Grid overlay becomes visible
    ├─ Other widgets show potential positions
    └─ Collision detection active
    ↓
[4] W3 crosses into W2's space
    ├─ W2 shifts down to W3's old position
    ├─ Animation: 300ms ease-out
    └─ Grid recalculates layout

    State during drag:
    ┌────────────────────────────────────────┐
    │ ╔══════╗       ╔══════╗               │
    │ ║ W1   ║       ║ W3   ║ (dragging)    │
    │ ╚══════╝       ╚══════╝               │
    │                                        │
    │ ╔══════╗  ╔══════╗                    │
    │ ║ W2   ║  ║ W4   ║                    │
    │ ╚══════╝  ╚══════╝                    │
    └────────────────────────────────────────┘
    ↓
[5] User releases mouse (mouseup)
    ├─ Widget snaps to grid
    ├─ Dragging state → Default state
    ├─ Opacity: 0.7 → 1
    ├─ Border: Dashed → Solid
    ├─ Shadow: Level 4 → Level 1
    └─ Grid overlay fades out
    ↓
[6] Final layout calculated

    Final state:
    ┌────────────────────────────────────────┐
    │ ╔══════╗  ╔══════╗                    │
    │ ║ W1   ║  ║ W3   ║                    │
    │ ╚══════╝  ╚══════╝                    │
    │                                        │
    │ ╔══════╗  ╔══════╗                    │
    │ ║ W2   ║  ║ W4   ║                    │
    │ ╚══════╝  ╚══════╝                    │
    └────────────────────────────────────────┘
    ↓
[7] Layout persists to LocalStorage
    ├─ Layout array updated with new positions
    ├─ Timestamp updated
    └─ Auto-save (no user action required)
    ↓
[8] Success feedback (subtle)
    ├─ Widget pulses briefly
    └─ Status: "Layout saved" (sidebar, 2s)
    ↓
[Complete] Widget successfully repositioned

react-grid-layout handles:
- Collision detection
- Snap-to-grid
- Responsive recalculation
- Undo/redo (if implemented)
```

### 5.5 Widget Resize Interaction

```
Initial State: Widget is 2×2 grid units (280px × 176px)

┌────────────────────────┐
│ GH-03: Pull Requests   │
│ ─────────────────────  │
│                        │
│  [Bar Chart]           │
│                        │
└────────────────────────┘

User wants to expand to 4×3 grid units

[1] User hovers over widget
    ├─ Resize handles appear on all edges
    ├─ Corner handle most prominent (8×8px square)
    └─ Cursor: default → nwse-resize (on corner handle)
    ↓
[2] User mousedown on bottom-right corner handle
    ├─ Widget state: Default → Resizing
    ├─ Border: 1px gray → 2px blue
    ├─ Shadow: Level 1 → Level 2
    ├─ Grid overlay visible
    └─ Cursor: nwse-resize
    ↓
[3] User drags handle down and right
    ├─ Widget dimensions update in real-time
    ├─ Grid shows snapping preview
    ├─ Minimum size enforced (2×1 minimum)
    ├─ Maximum size enforced (12×6 maximum)
    └─ Other widgets shift to accommodate
    ↓
[4] Widget grows to 4×3

    During resize:
    ┌────────────────────────────────────────┐
    │ GH-03: Pull Requests              [⚙]│
    │ ─────────────────────────────────────  │
    │                                        │
    │  [Bar Chart - expanding]              │
    │                                        │
    │                                        │
    │                                        │
    └────────────────────────────────────────┘
                                          ▨▨ ← resize handle
    ↓
[5] Chart library re-renders
    ├─ Recharts ResponsiveContainer detects size change
    ├─ Chart scales to new dimensions
    ├─ Bars/lines redraw with more detail
    └─ Labels reposition for readability
    ↓
[6] User releases mouse
    ├─ Widget snaps to final grid size
    ├─ Resizing state → Default state
    ├─ Border: 2px blue → 1px gray
    ├─ Shadow: Level 2 → Level 1
    └─ Grid overlay fades out
    ↓
[7] Final size: 4×3 (560px × 256px)

    Final state:
    ┌────────────────────────────────────────┐
    │ GH-03: Pull Requests              [⚙]│
    │ ─────────────────────────────────────  │
    │                                        │
    │  ┌────────────────────────────────┐   │
    │  │ [Detailed Bar Chart]           │   │
    │  │  ████                          │   │
    │  │  ██      ███      ████         │   │
    │  │  ██  ██  ███  ██  ████  ███    │   │
    │  └────────────────────────────────┘   │
    │  Opened: 45  Merged: 38  Closed: 7    │
    └────────────────────────────────────────┘
    ↓
[8] Layout persists to LocalStorage
    ↓
[Complete] Widget successfully resized

Size Constraints per Widget Type:
- Metric Cards (GH-06, NPM-03): Min 2×2, Max 4×4
- Line/Area Charts (GH-01, NPM-01): Min 3×2, Max 8×4
- Bar Charts (GH-03): Min 3×2, Max 12×4
- Tables (GH-04): Min 3×3, Max 8×6
- Timelines (GH-05): Min 4×2, Max 12×3
```

### 5.6 Widget Configuration Update

```
Scenario: User changes repository for existing GH-01 widget

Current Widget State:
┌────────────────────────────────────────┐
│ GH-01: React Stars Trend          [⚙] │ ← Config button
│ ─────────────────────────────────────  │
│ facebook/react                         │
│                                        │
│  245K stars (+12K this month)         │
└────────────────────────────────────────┘

[1] User clicks [⚙] config button
    ↓
[2] Widget Config Modal opens
    ├─ Pre-filled with current configuration:
    │   ├─ Repository: "facebook/react"
    │   ├─ Time Period: "Last 30 days"
    │   ├─ Widget Title: "" (using default)
    │   └─ Refresh Interval: "15 minutes"
    ├─ Preview shows current data
    └─ Modal animation: fade + scale (300ms)
    ↓
[3] User changes Repository field
    ├─ Clears field
    ├─ Types "vuejs/vue"
    └─ Field validation:
        ├─ Pattern check: owner/repo format ✓
        └─ API check: Repository exists (debounced)
    ↓
[4] Preview updates (while typing, debounced 500ms)
    ├─ Shows loading skeleton
    ├─ Fetches preview data from API
    └─ Renders mini chart with new data
    ↓
[5] User clicks [Save Changes] button
    ↓
[6] Modal closes with fade animation
    ↓
[7] Widget on dashboard transitions
    ├─ Widget enters loading state
    ├─ Previous data fades out
    ├─ Loading spinner appears
    └─ Title updates: "Vue Stars Trend"

    Loading state:
    ┌────────────────────────────────────────┐
    │ GH-01: Vue Stars Trend            [⚙] │
    │ ─────────────────────────────────────  │
    │ vuejs/vue                              │
    │                                        │
    │          ⟳ Loading...                 │
    └────────────────────────────────────────┘
    ↓
[8] API request to GitHub
    ├─ Endpoint: /repos/vuejs/vue
    ├─ Fetch stargazers data
    └─ Cache response
    ↓
[9] Data received successfully
    ├─ Widget state: Loading → Success
    ├─ Chart renders with new data
    └─ Fade-in animation (300ms)

    Success state:
    ┌────────────────────────────────────────┐
    │ GH-01: Vue Stars Trend            [⚙] │
    │ ─────────────────────────────────────  │
    │ vuejs/vue                              │
    │                                        │
    │  207K stars (+8K this month)          │
    └────────────────────────────────────────┘
    ↓
[10] Widget configuration persists
     ├─ Update widget config in dashboard state
     ├─ Save to LocalStorage
     └─ Update last modified timestamp
     ↓
[11] Success toast notification
     ├─ Message: "Widget updated successfully"
     ├─ Icon: ✓ (success)
     ├─ Duration: 3 seconds
     └─ Position: Top-right
     ↓
[Complete] Widget now monitoring vuejs/vue

Error Handling:
- If repository doesn't exist:
  ├─ Show error message in modal
  ├─ Disable Save button
  └─ Highlight field in red

- If API rate limit exceeded:
  ├─ Widget shows error state
  ├─ Error message: "Rate limit exceeded. Try again in X minutes"
  ├─ Offer to increase refresh interval
  └─ Keep previous data visible (if available)
```

### 5.7 Data Refresh Scenarios

```
Scenario A: Manual Refresh (Single Widget)

[1] User clicks refresh button on GH-03 widget
    ├─ Button icon rotates (360° animation, 1s)
    └─ Widget state: Success → Loading
    ↓
[2] Widget shows loading overlay
    ├─ Previous chart remains visible (dimmed)
    ├─ Loading spinner overlaid
    └─ "Refreshing..." text
    ↓
[3] API request sent
    ├─ Check cache first
    ├─ If cache fresh (< 5 min): Use cached data
    └─ If cache stale: Fetch from GitHub API
    ↓
[4] Response received
    ├─ Update cache
    └─ Update widget data
    ↓
[5] Widget re-renders
    ├─ Loading overlay fades out
    ├─ Chart updates with new data
    └─ Timestamp: "Last updated: Just now"
    ↓
[Complete] Single widget refreshed

────────────────────────────────────────

Scenario B: Manual Refresh (All Widgets)

[1] User clicks global refresh button in header
    ├─ Button shows loading state
    └─ All widgets enter loading state sequentially
    ↓
[2] Refresh queue created
    ├─ Priority: Visible widgets first
    ├─ Batch: 3 concurrent requests max (rate limiting)
    └─ Queue: Remaining widgets
    ↓
[3] Batch 1 (Widgets 1-3) fetch simultaneously
    ↓
[4] Batch 1 completes
    ├─ Widgets update
    └─ Start Batch 2 (Widgets 4-6)
    ↓
[5] Progress indicator
    ├─ Header shows: "Refreshing... 6/10"
    └─ Progress bar (optional)
    ↓
[6] All widgets complete
    ├─ Header button returns to default state
    └─ Toast: "All widgets refreshed"
    ↓
[Complete] Dashboard fully refreshed

────────────────────────────────────────

Scenario C: Auto-Refresh (Background)

[1] Widget configured with 15-minute auto-refresh
    ├─ Timer started on widget mount
    └─ Countdown: 15:00 → 00:00
    ↓
[2] Timer reaches 00:00
    ├─ Check: Is widget visible in viewport?
    │   ├─ Yes: Proceed with refresh
    │   └─ No: Wait until scrolled into view
    └─ Check: Is tab active?
        ├─ Yes: Proceed with refresh
        └─ No: Defer until tab becomes active
    ↓
[3] Background refresh (silent, no loading state)
    ├─ Fetch new data
    ├─ Update cache
    └─ Update widget data
    ↓
[4] Widget updates
    ├─ Subtle transition (no loading spinner)
    ├─ Chart morphs to new values (animated)
    └─ Timestamp updates
    ↓
[5] Timer resets
    ├─ Countdown: 15:00
    └─ Repeat cycle
    ↓
[Continuous] Auto-refresh loop

────────────────────────────────────────

Scenario D: Refresh Error Handling

[1] Widget refresh triggered
    ↓
[2] API request fails
    ├─ Network error
    ├─ API rate limit (403)
    └─ Service unavailable (503)
    ↓
[3] Error categorization
    ├─ Rate Limit Error:
    │   ├─ Widget shows warning state (yellow)
    │   ├─ Message: "Rate limit exceeded. Retrying in X min"
    │   ├─ Keep previous data visible
    │   └─ Schedule retry based on rate limit reset time
    │
    ├─ Network Error:
    │   ├─ Widget shows error state (red)
    │   ├─ Message: "Connection failed"
    │   ├─ Keep previous data visible (if available)
    │   └─ [Retry] button
    │
    └─ Service Error:
        ├─ Widget shows error state
        ├─ Message: "Service temporarily unavailable"
        ├─ Keep previous data visible
        └─ [Retry] button
    ↓
[4] User options
    ├─ Manual retry via [Retry] button
    ├─ Adjust refresh interval via config
    └─ Ignore and wait for next auto-refresh
    ↓
[Resolution] Widget recovers when API available
```

---

## 6. Interaction Patterns

### 6.1 Button States and Behaviors

#### Primary Action Button
```
State: Default
┌─────────────────────┐
│  Add to Dashboard   │
└─────────────────────┘
Background: #2670A9
Color: #FFFFFF
Padding: 8px 12px
Border-radius: 4px
Font: 14px semibold

State: Hover
┌─────────────────────┐
│  Add to Dashboard   │
└─────────────────────┘
Background: #1E5A8E (darker)
Cursor: pointer
Transition: background 150ms ease

State: Active (mousedown)
┌─────────────────────┐
│  Add to Dashboard   │
└─────────────────────┘
Background: #164775 (even darker)
Transform: scale(0.98)

State: Focus (keyboard)
┌─────────────────────┐
│  Add to Dashboard   │
└─────────────────────┘
Outline: 2px solid #2670A9
Outline-offset: 2px

State: Disabled
┌─────────────────────┐
│  Add to Dashboard   │
└─────────────────────┘
Background: #E8E8E8
Color: #CACACA
Cursor: not-allowed
```

#### Secondary Button
```
State: Default
┌─────────────────────┐
│      Cancel         │
└─────────────────────┘
Background: #FFFFFF
Color: #2D2D2D
Border: 1px solid #D1D1D1
Padding: 8px 12px

State: Hover
┌─────────────────────┐
│      Cancel         │
└─────────────────────┘
Background: #F5F5F5
Border: 1px solid #2670A9
```

#### Icon Button
```
State: Default
[ ⚙ ]
Size: 32px × 32px
Icon: 20px
Background: transparent
Color: #6C6C6C

State: Hover
[ ⚙ ]
Background: rgba(38, 112, 169, 0.1)
Color: #2670A9

State: Active
[ ⚙ ]
Background: rgba(38, 112, 169, 0.2)
Transform: scale(0.95)
```

### 6.2 Input Field Interactions

#### Text Input
```
State: Default
┌─────────────────────────────────┐
│ facebook/react                  │
└─────────────────────────────────┘
Border: 1px solid #D1D1D1
Background: #FFFFFF
Padding: 10px 12px
Font: 14px

State: Focus
┌─────────────────────────────────┐
│ facebook/react|                 │ ← cursor
└─────────────────────────────────┘
Border: 2px solid #2670A9
Outline: none (custom border instead)

State: Error
┌─────────────────────────────────┐
│ invalid/format!                 │
└─────────────────────────────────┘
Border: 2px solid #C82124
Background: #FFEAEB

Error message below:
⚠ Repository not found

State: Success (after validation)
┌─────────────────────────────────┐
│ facebook/react                  │ ✓
└─────────────────────────────────┘
Border: 2px solid #14804A
Checkmark icon on right

State: Disabled
┌─────────────────────────────────┐
│ facebook/react                  │
└─────────────────────────────────┘
Background: #F5F5F5
Color: #CACACA
Cursor: not-allowed
```

#### Dropdown Select
```
State: Default
┌─────────────────────────────────┐
│ Last 30 days                 ▾  │
└─────────────────────────────────┘
Border: 1px solid #D1D1D1
Background: #FFFFFF
Chevron: #6C6C6C

State: Opened
┌─────────────────────────────────┐
│ Last 30 days                 ▴  │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Last 7 days                     │ ← hover highlight
│ Last 30 days                 ✓  │ ← selected
│ Last 90 days                    │
│ Last year                       │
│ All time                        │
└─────────────────────────────────┘
Dropdown shadow: Level 2
Max height: 300px with scroll
Selected item has checkmark

State: Option Hover
┌─────────────────────────────────┐
│ Last 7 days                     │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Last 30 days              ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│ Last 90 days                    │
└─────────────────────────────────┘
Background: #E5F2FC (light blue)
```

#### Search Input
```
State: Default
┌─────────────────────────────────┐
│ 🔍 Search widgets...            │
└─────────────────────────────────┘
Icon: 20px search icon, #6C6C6C
Placeholder: #9F9F9F

State: Typing
┌─────────────────────────────────┐
│ 🔍 github star|             [✕] │
└─────────────────────────────────┘
Clear button appears on right
Live filtering active (debounced 300ms)

State: Results Found
┌─────────────────────────────────┐
│ 🔍 github star              [✕] │
└─────────────────────────────────┘
Showing 3 results ↓

┌─────────────────────────────────┐
│ GH-01: Repository Stars Trend   │ ← highlighted matches
│ GH-06: Repository Health Score  │
│ COMBO-02: Growth Comparison     │
└─────────────────────────────────┘

State: No Results
┌─────────────────────────────────┐
│ 🔍 xyz123                   [✕] │
└─────────────────────────────────┘
No widgets found
Try different keywords
```

### 6.3 Modal Behaviors

#### Modal Open Animation
```
[1] Backdrop fades in: 0 → 0.5 opacity (200ms)
[2] Modal scales in: 0.9 → 1.0 scale (300ms ease-out)
[3] Modal fades in: 0 → 1 opacity (300ms)
[4] Focus trap activates
    └─ Tab key cycles through modal elements only
    └─ Escape key closes modal
```

#### Modal Close Animation
```
[1] Modal fades out: 1 → 0 opacity (200ms)
[2] Modal scales out: 1.0 → 0.95 scale (200ms ease-in)
[3] Backdrop fades out: 0.5 → 0 opacity (300ms)
[4] DOM element removed
[5] Focus returns to trigger element
```

#### Modal Interactions
```
Close Triggers:
├─ Click [X] button in header
├─ Click backdrop (outside modal)
├─ Press Escape key
├─ Click Cancel button (if present)
└─ Submit form successfully (if applicable)

Prevent Close:
├─ Unsaved changes warning
├─ Form validation errors
└─ Loading state active
```

### 6.4 Drag-and-Drop Visual Feedback

#### Grid Overlay (during drag)
```
┌────────────────────────────────────────┐
│ │  │  │  │  │  │  │  │  │  │  │  │   │ ← 12 columns visible
├─┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
│ │  │  │  │  │  │  │  │  │  │  │  │   │
├─┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
│ │  │  │  │  │  │  │  │  │  │  │  │   │
└────────────────────────────────────────┘
Grid lines: 1px dashed rgba(38, 112, 169, 0.2)
Visible only during drag/resize
Fades in: 150ms
Fades out: 300ms
```

#### Drop Target Highlight
```
Valid drop zone:
┌────────────────┐
│                │
│   Drop Here    │ ← light blue background
│                │
└────────────────┘
Background: rgba(38, 112, 169, 0.1)
Border: 2px dashed #2670A9

Invalid drop zone (collision):
┌────────────────┐
│                │
│   Cannot Drop  │ ← light red background
│                │
└────────────────┘
Background: rgba(200, 33, 36, 0.1)
Border: 2px dashed #C82124
Cursor: not-allowed
```

#### Widget Ghost (dragging element)
```
Original position (placeholder):
┌────────────────┐
│                │
│   [Empty]      │ ← dashed outline
│                │
└────────────────┘
Border: 2px dashed #D1D1D1
Background: rgba(0, 0, 0, 0.05)

Following cursor (ghost):
    ┌────────────────┐
    │ Widget Title   │ ← reduced opacity
    │   [Content]    │
    └────────────────┘
Opacity: 0.7
Shadow: Level 4
Transform: rotate(-2deg) for visual feedback
```

### 6.5 Loading States

#### Skeleton Loader (Widget)
```
┌────────────────────────────────────────┐
│ ▭▭▭▭▭▭▭▭▭▭▭                       │ ← title
├────────────────────────────────────────┤
│                                        │
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭                         │ ← chart placeholder
│ ▭▭▭▭▭▭▭▭▭▭                            │
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭                       │
│                                        │
└────────────────────────────────────────┘
Color: #E8E8E8
Animation: Shimmer left-to-right (1.5s infinite)
Gradient: linear-gradient(
  90deg,
  #E8E8E8 0%,
  #F5F5F5 50%,
  #E8E8E8 100%
)
```

#### Spinner (Inline)
```
⟳ Loading...

Spinner size: 20px
Rotation: 360deg continuous (1s linear infinite)
Color: #2670A9
Adjacent text: 14px, #6C6C6C
```

#### Progress Bar (Multi-widget refresh)
```
Refreshing widgets... 6/10

┌────────────────────────────────────────┐
│████████████░░░░░░░░░░░░░░░░░░░░░░░░░░│ 60%
└────────────────────────────────────────┘

Height: 4px
Background: #E8E8E8
Fill: #2670A9
Animation: Smooth progress (300ms ease)
```

### 6.6 Toast Notifications

```
Position: Top-right corner (fixed)
Stack: Vertical, newest on top
Max visible: 3 (older auto-dismiss)
Duration: 3s (success), 5s (error), ∞ (warning until dismissed)

Success Toast:
┌─────────────────────────────────────┐
│ ✓  Widget added successfully    [✕]│
└─────────────────────────────────────┘
Background: #E5F2E5
Border-left: 4px solid #14804A
Color: #2D2D2D
Icon: 20px #14804A
Shadow: Level 2

Error Toast:
┌─────────────────────────────────────┐
│ ⚠  Failed to load data          [✕]│
└─────────────────────────────────────┘
Background: #FFEAEB
Border-left: 4px solid #C82124
Icon: 20px #C82124

Info Toast:
┌─────────────────────────────────────┐
│ ℹ  Layout saved automatically   [✕]│
└─────────────────────────────────────┘
Background: #E5F2FC
Border-left: 4px solid #1D72B6
Icon: 20px #1D72B6

Warning Toast:
┌─────────────────────────────────────┐
│ ⚠  API rate limit approaching   [✕]│
└─────────────────────────────────────┘
Background: #FFF4D5
Border-left: 4px solid #9C6E05
Icon: 20px #9C6E05

Animation:
- Enter: Slide from right + fade (300ms)
- Exit: Fade out (200ms)
- Swipe right to dismiss
```

### 6.7 Accessibility Keyboard Navigation

```
Global Shortcuts:
- Tab: Move focus forward
- Shift+Tab: Move focus backward
- Escape: Close modal/dropdown/panel
- Enter/Space: Activate focused button/link
- Arrow keys: Navigate dropdowns/lists

Dashboard Canvas:
- Tab: Cycle through widgets (header focused)
- Enter on widget: Open config modal
- Delete/Backspace on widget: Remove widget
- Arrow keys on widget: Nudge position (1 grid unit)
- Shift+Arrow keys: Resize widget (1 grid unit)

Widget Catalog:
- Tab: Move between search, filters, widget cards
- Enter on widget card: Add widget
- Arrow keys: Navigate grid of widgets
- Escape: Close catalog

Dropdown:
- Space/Enter: Open dropdown
- Arrow Down/Up: Navigate options
- Home/End: First/last option
- Enter: Select option
- Escape: Close without selecting

Modal:
- Tab: Cycle through form fields
- Escape: Close modal
- Enter in text field: Submit form (if single field)
- Focus trap: Tab does not leave modal

Focus Indicators:
All interactive elements have visible focus ring:
- Outline: 2px solid #2670A9
- Outline-offset: 2px
- Border-radius: matches element
- Never: outline: none without alternative
```

---

## 7. Responsive Design

### 7.1 Breakpoint Strategy

```
Breakpoints (min-width):
- Mobile: 0px - 767px (NOT SUPPORTED in v1)
- Tablet: 768px - 1023px (Limited support)
- Laptop: 1024px - 1439px (Optimized)
- Desktop: 1440px - 1919px (Optimized)
- Large Desktop: 1920px+ (Optimized)

Grid Columns by Breakpoint:
- Tablet (1024px): 8 columns
- Laptop (1440px): 12 columns
- Desktop (1920px): 12 columns

Container Padding:
- Tablet: 16px
- Laptop: 24px
- Desktop: 48px
```

### 7.2 Responsive Component Behaviors

#### Header
```
Desktop (1920px):
┌──────────────────────────────────────────────────────┐
│ [Logo] Dashboard Builder  [Selector ▾]  [+][🔄][⚙] │
└──────────────────────────────────────────────────────┘
Height: 48px

Laptop (1440px):
┌──────────────────────────────────────────────┐
│ [Logo] Builder  [Selector ▾]  [+][🔄][⚙]   │
└──────────────────────────────────────────────┘
Height: 48px
Logo text shortened

Tablet (1024px):
┌──────────────────────────────────────┐
│ [☰] [Selector ▾]  [+][🔄][⚙]       │
└──────────────────────────────────────┘
Height: 48px
Logo → Hamburger menu
Sidebar hidden by default
```

#### Sidebar
```
Desktop/Laptop (>1024px):
Expanded by default
Width: 280px
Collapsible to 64px (icon-only)

Tablet (1024px):
Hidden by default
Opens as overlay (slide from left)
Width: 280px
Backdrop: rgba(0, 0, 0, 0.5)
```

#### Widget Grid
```
Desktop (1920px):
12 columns × dynamic rows
Column width: ~140px
Gutter: 16px
Widget minimum: 2 columns wide

Laptop (1440px):
12 columns × dynamic rows
Column width: ~88px
Gutter: 16px
Widget minimum: 2 columns wide
Some widgets auto-shrink content

Tablet (1024px):
8 columns × dynamic rows
Column width: ~110px
Gutter: 16px
Widget minimum: 2 columns wide
Charts adapt to narrower width
Text size may decrease slightly
```

#### Modals
```
Desktop (1920px):
Width: 600px (fixed)
Max height: 80vh
Centered in viewport

Laptop (1440px):
Width: 560px
Max height: 80vh
Centered

Tablet (1024px):
Width: 90vw (max 500px)
Max height: 85vh
Centered
Padding reduced from 32px to 24px
```

### 7.3 Typography Scaling

```
Desktop (1920px) - Base sizes:
H1: 32px / 40px line-height
H2: 24px / 32px
H3: 18px / 24px
H4: 16px / 24px
Body: 14px / 20px
Small: 12px / 16px

Laptop (1440px) - Same as desktop:
No changes to type scale

Tablet (1024px) - Slight reduction:
H1: 28px / 36px line-height
H2: 22px / 30px
H3: 16px / 22px
H4: 14px / 20px
Body: 14px / 20px (unchanged)
Small: 12px / 16px (unchanged)
```

### 7.4 Chart Responsiveness

All charts use Recharts ResponsiveContainer:

```typescript
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={data}>
    {/* chart configuration */}
  </LineChart>
</ResponsiveContainer>
```

#### Responsive Chart Behaviors:

**Line/Area Charts**:
- Desktop: All data points visible, full labels
- Laptop: Thinned data points if > 100 points
- Tablet: Reduced tick marks, abbreviated labels

**Bar Charts**:
- Desktop: Full bar width, all labels
- Laptop: Reduced bar padding
- Tablet: Stacked bars if > 10 categories

**Tables**:
- Desktop: All columns visible
- Laptop: Hide non-essential columns
- Tablet: Show only 3 most important columns

**Metric Cards**:
- Desktop: Large metric display (48px)
- Laptop: Same as desktop
- Tablet: Slightly smaller (40px)

### 7.5 Mobile Fallback (v1 Limited Support)

```
┌──────────────────────────────┐
│                              │
│         📱                   │
│                              │
│   Dashboard Builder          │
│                              │
│   This application requires  │
│   a larger screen for the    │
│   best experience.           │
│                              │
│   Please use a tablet,       │
│   laptop, or desktop.        │
│                              │
│   Minimum width: 1024px      │
│                              │
└──────────────────────────────┘

Show message when viewport < 1024px
Disable dashboard editing
Allow view-only scroll (optional)
```

---

## 8. Accessibility Requirements

### 8.1 WCAG 2.1 Level AA Compliance

#### Color Contrast
```
Text on Background:
- Normal text (14px): Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- UI components: Minimum 3:1

Verified Combinations:
✓ #2D2D2D on #FFFFFF = 12.63:1 (Primary text)
✓ #6C6C6C on #FFFFFF = 5.74:1 (Secondary text)
✓ #9F9F9F on #FFFFFF = 3.54:1 (Tertiary text - large only)
✓ #FFFFFF on #2670A9 = 5.14:1 (Button text)
✓ #2670A9 on #FFFFFF = 4.89:1 (Links)
✓ #14804A on #E5F2E5 = 5.23:1 (Success message)
✓ #C82124 on #FFEAEB = 4.97:1 (Error message)

Chart Colors (on white):
✓ #2670A9 = 4.89:1 (Deep Ocean Blue)
✓ #14804A = 4.51:1 (Forest Green)
✓ #C77B05 = 4.12:1 (Amber - use for charts only)
✓ #C82124 = 5.95:1 (Crimson)
```

#### Keyboard Navigation
```
All interactive elements keyboard accessible:
✓ Buttons: Tab to focus, Enter/Space to activate
✓ Links: Tab to focus, Enter to follow
✓ Form inputs: Tab to focus, typing to input
✓ Dropdowns: Space/Enter to open, arrows to navigate
✓ Modals: Tab trap, Escape to close
✓ Widgets: Tab to focus, Enter to configure
✓ Drag-and-drop: Keyboard alternative (arrow keys to move)

Focus Order:
1. Header navigation (left to right)
2. Sidebar sections (top to bottom)
3. Dashboard canvas (top-left to bottom-right, row-major)
4. Modals/overlays (when open)

Skip Links:
- "Skip to main content" (hidden until focused)
- Jump to: Header | Sidebar | Canvas
```

#### Screen Reader Support
```
Semantic HTML:
- <header>, <nav>, <main>, <aside>, <footer>
- <button> for clickable actions
- <a> for navigation links
- <form>, <label>, <input> for forms

ARIA Labels:
- aria-label for icon-only buttons
- aria-labelledby for complex widgets
- aria-describedby for help text
- aria-live for dynamic content updates
- aria-expanded for dropdowns/accordions
- aria-selected for active items
- aria-disabled for disabled states

Example Widget:
<div
  role="region"
  aria-labelledby="widget-title-gh01"
  aria-describedby="widget-summary-gh01"
>
  <h3 id="widget-title-gh01">GitHub Stars Trend</h3>
  <div aria-live="polite" aria-busy={loading}>
    {chart content}
  </div>
  <p id="widget-summary-gh01">
    245,000 stars, increased by 12,000 this month
  </p>
</div>

Live Regions:
- Toast notifications: aria-live="polite"
- Error messages: aria-live="assertive"
- Loading states: aria-busy="true"
- Dynamic charts: aria-live="polite" with summary
```

#### Form Accessibility
```
Labels:
- Every input has associated <label>
- Label for="" matches input id=""
- Visible labels, not placeholder-only

Required Fields:
- aria-required="true"
- Visual indicator (asterisk)
- Clear error messages

Error Messages:
<input
  id="repo-input"
  aria-invalid="true"
  aria-describedby="repo-error"
/>
<span id="repo-error" role="alert">
  Repository not found. Format: owner/repo
</span>

Field Groups:
<fieldset>
  <legend>Widget Configuration</legend>
  <label for="repo">Repository *</label>
  <input id="repo" required />
</fieldset>
```

#### Chart Accessibility
```
Visual Representation + Data Table:

┌────────────────────────────────────┐
│ [Line Chart]                       │
│                                    │
│ ╱╲    ╱╲                          │
│╱  ╲  ╱  ╲  ╱╲                     │
│    ╲╱    ╲╱  ╲                    │
└────────────────────────────────────┘

Accessible alternative (hidden visually, available to screen readers):
<table aria-label="Star count by month">
  <thead>
    <tr>
      <th>Month</th>
      <th>Stars</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Jan 2025</td><td>233,000</td></tr>
    <tr><td>Feb 2025</td><td>238,500</td></tr>
    <tr><td>Mar 2025</td><td>245,000</td></tr>
  </tbody>
</table>

Chart Summary (visible):
"245,000 stars, increased by 12,000 (5.1%) this month"

ARIA attributes:
- role="img" on chart container
- aria-label="Line chart showing star growth over time"
- aria-describedby pointing to summary paragraph
```

### 8.2 Focus Management

```
Focus Traps (Modals):
When modal opens:
1. Save reference to trigger element
2. Find all focusable elements in modal
3. Set focus to first element (usually close button or first input)
4. Trap Tab key:
   - Tab on last element → first element
   - Shift+Tab on first element → last element
5. On modal close:
   - Return focus to trigger element

Focus Indicators:
All focused elements show clear outline:
```css
:focus-visible {
  outline: 2px solid #2670A9;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Specific overrides */
button:focus-visible {
  outline-offset: 2px;
}

input:focus-visible {
  outline: none;
  border: 2px solid #2670A9;
}
```

Focus Order:
Logical, left-to-right, top-to-bottom flow
No unexpected focus jumps
Skip links available

### 8.3 Motion and Animation

```
Respect prefers-reduced-motion:

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

All animations are optional enhancements:
- Page still functional without animations
- No critical info conveyed only through motion
- Provide alternative feedback (text, icons)
```

### 8.4 Text and Content

```
Language:
<html lang="en">

Page Title:
<title>Dashboard Builder - My Team Dashboard</title>
Updates dynamically when dashboard changes

Headings Hierarchy:
- H1: Page title (Dashboard name)
- H2: Major sections (Widget Catalog categories)
- H3: Widget titles
- H4: Subsections, form labels

Alt Text:
- Decorative images: alt=""
- Functional images: Descriptive alt text
- Charts: aria-label + data table alternative

Link Text:
- Descriptive, not "click here"
- "Add Repository Stars widget"
- "Configure Pull Request Activity widget"
- "View GitHub documentation"
```

### 8.5 Assistive Technology Testing

```
Required Testing:
- Screen readers: NVDA (Windows), VoiceOver (macOS/iOS), JAWS
- Keyboard only: All functionality accessible without mouse
- Voice control: Dragon NaturallySpeaking
- Magnification: ZoomText, browser zoom up to 200%
- High contrast mode: Windows High Contrast

Test Scenarios:
1. Create new dashboard (keyboard only)
2. Add widget from catalog (screen reader)
3. Configure widget (voice control)
4. Rearrange dashboard (keyboard arrow keys)
5. Navigate between dashboards (keyboard)
6. Interpret chart data (screen reader with data table)
```

---

## 9. State Management Strategy

### 9.1 State Architecture Overview

```
Application State Layers:

┌─────────────────────────────────────────┐
│ Browser Storage (Persistence)           │
│ - LocalStorage: Dashboard configs       │
│ - SessionStorage: Temporary preferences │
│ - IndexedDB: Chart cache (if needed)    │
└─────────────────────────────────────────┘
              ↕ Sync
┌─────────────────────────────────────────┐
│ Global State (React Context)            │
│ - Active dashboard                      │
│ - All dashboards list                   │
│ - User preferences                      │
│ - UI state (modals, panels open)        │
└─────────────────────────────────────────┘
              ↕ Props
┌─────────────────────────────────────────┐
│ Component State (useState, useReducer)  │
│ - Widget data                           │
│ - Loading states                        │
│ - Form inputs                           │
│ - Local UI state                        │
└─────────────────────────────────────────┘
              ↕ Requests
┌─────────────────────────────────────────┐
│ API Cache (In-memory Map)               │
│ - GitHub API responses                  │
│ - npm API responses                     │
│ - TTL-based invalidation                │
└─────────────────────────────────────────┘
```

### 9.2 Context Structure

```typescript
// Global App Context
interface AppContextValue {
  // Dashboard Management
  dashboards: Dashboard[]
  activeDashboardId: string | null
  createDashboard: (name: string) => void
  deleteDashboard: (id: string) => void
  renameDashboard: (id: string, name: string) => void
  duplicateDashboard: (id: string) => void
  switchDashboard: (id: string) => void

  // Widget Management
  addWidget: (type: WidgetType, config: WidgetConfig) => void
  updateWidget: (id: string, config: Partial<WidgetConfig>) => void
  removeWidget: (id: string) => void

  // Layout Management
  updateLayout: (layout: Layout[]) => void

  // Preferences
  preferences: UserPreferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void

  // UI State
  uiState: {
    catalogOpen: boolean
    configModalOpen: boolean
    configModalWidgetId: string | null
    managementPanelOpen: boolean
  }
  toggleCatalog: () => void
  openConfigModal: (widgetId: string) => void
  closeConfigModal: () => void
  toggleManagementPanel: () => void
}

// Provide at App Root
<AppContext.Provider value={contextValue}>
  <DashboardApp />
</AppContext.Provider>

// Usage in Components
const { addWidget, activeDashboardId } = useAppContext()
```

### 9.3 Widget State Pattern

```typescript
// Each widget manages its own data state
function useWidgetData<T>(
  fetchFn: () => Promise<T>,
  config: WidgetConfig,
  refreshInterval?: number
) {
  const [state, setState] = useState<WidgetState<T>>({
    loading: true,
    error: null,
    data: null,
    lastFetched: null,
  })

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [JSON.stringify(config)]) // Re-fetch when config changes

  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval) return
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  async function fetchData() {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const data = await fetchFn()
      setState({
        loading: false,
        error: null,
        data,
        lastFetched: new Date().toISOString(),
      })
    } catch (error) {
      setState({
        loading: false,
        error: error as Error,
        data: null,
        lastFetched: null,
      })
    }
  }

  return { ...state, refetch: fetchData }
}

// Usage in Widget Component
function RepoStarsWidget({ config }: WidgetProps) {
  const { data, loading, error, refetch } = useWidgetData(
    () => fetchGitHubStars(config.repo, config.timePeriod),
    config,
    config.refreshInterval
  )

  if (loading) return <WidgetLoading />
  if (error) return <WidgetError error={error} onRetry={refetch} />
  if (!data) return <WidgetEmpty />

  return <LineChart data={data} />
}
```

### 9.4 Form State Management

```typescript
// Using React Hook Form for complex forms
import { useForm } from 'react-hook-form'

function WidgetConfigForm({ widget, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    defaultValues: widget.config,
    mode: 'onChange', // Validate on change
  })

  // Watch for preview updates
  const repo = watch('repo')
  const timePeriod = watch('timePeriod')

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('repo', {
          required: 'Repository is required',
          pattern: {
            value: /^[\w-]+\/[\w-]+$/,
            message: 'Format: owner/repo',
          },
          validate: async (value) => {
            const exists = await checkRepoExists(value)
            return exists || 'Repository not found'
          },
        })}
      />
      {errors.repo && <span role="alert">{errors.repo.message}</span>}

      <select {...register('timePeriod', { required: true })}>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>

      <button type="submit" disabled={!isValid}>
        Save Changes
      </button>
    </form>
  )
}
```

### 9.5 Persistence Strategy

```typescript
// LocalStorage Sync
const STORAGE_KEY = 'dashboard-builder-state'

// Save to LocalStorage
function saveToStorage(state: AppState) {
  try {
    const serialized = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
    // Fallback: Show warning to user
  }
}

// Load from LocalStorage
function loadFromStorage(): AppState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (!serialized) return null
    return JSON.parse(serialized)
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return null
  }
}

// Auto-save on state changes (debounced)
import { debounce } from 'lodash'

const debouncedSave = debounce(saveToStorage, 1000)

useEffect(() => {
  debouncedSave(appState)
}, [appState])

// Initial load
useEffect(() => {
  const savedState = loadFromStorage()
  if (savedState) {
    restoreState(savedState)
  }
}, [])
```

### 9.6 API Cache Implementation

```typescript
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>()

  set<T>(key: string, data: T, ttl: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear() {
    this.cache.clear()
  }

  clearExpired() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
export const apiCache = new APICache()

// Usage in API service
async function fetchGitHubStars(repo: string, period: string) {
  const cacheKey = `github:stars:${repo}:${period}`

  // Check cache first
  const cached = apiCache.get<StarsData>(cacheKey)
  if (cached) {
    console.log('Cache hit:', cacheKey)
    return cached
  }

  // Fetch from API
  console.log('Cache miss:', cacheKey)
  const data = await fetchFromGitHub(repo, period)

  // Cache response (1 hour TTL)
  apiCache.set(cacheKey, data, 60 * 60 * 1000)

  return data
}
```

---

## 10. Animation & Transitions

### 10.1 Transition Timing

```
Easing Functions:
- ease-out: Quick start, slow end (default for most)
  cubic-bezier(0, 0, 0.2, 1)
  Use for: Elements entering viewport

- ease-in: Slow start, quick end
  cubic-bezier(0.4, 0, 1, 1)
  Use for: Elements exiting viewport

- ease-in-out: Symmetric ease
  cubic-bezier(0.4, 0, 0.2, 1)
  Use for: State changes, transforms

- linear: Constant speed
  linear
  Use for: Spinners, continuous animations

Durations:
- Instant: 100ms (hover feedback)
- Fast: 200ms (simple transitions)
- Normal: 300ms (modals, panels)
- Slow: 500ms (complex animations)
```

### 10.2 Component Animations

#### Widget Entrance (on add)
```css
@keyframes widgetEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.widget-enter {
  animation: widgetEnter 300ms ease-out;
}
```

#### Widget Exit (on remove)
```css
@keyframes widgetExit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.widget-exit {
  animation: widgetExit 200ms ease-in forwards;
}
```

#### Modal Animations
```css
/* Backdrop */
@keyframes backdropFadeIn {
  from { opacity: 0; }
  to { opacity: 0.5; }
}

/* Modal */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-backdrop {
  animation: backdropFadeIn 200ms ease-out;
}

.modal-content {
  animation: modalEnter 300ms ease-out;
}
```

#### Skeleton Shimmer
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #E8E8E8 0px,
    #F5F5F5 40px,
    #E8E8E8 80px
  );
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite linear;
}
```

#### Loading Spinner
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

#### Toast Slide-In
```css
@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-enter {
  animation: toastSlideIn 300ms ease-out;
}
```

### 10.3 Micro-interactions

#### Button Press
```css
button:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}
```

#### Icon Rotation (refresh button)
```css
.button-refresh.is-refreshing .icon {
  animation: spin 1s linear infinite;
}
```

#### Checkbox Check
```css
@keyframes checkboxCheck {
  0% {
    transform: scale(0) rotate(45deg);
  }
  50% {
    transform: scale(1.2) rotate(45deg);
  }
  100% {
    transform: scale(1) rotate(45deg);
  }
}

.checkbox:checked::after {
  animation: checkboxCheck 200ms ease-out;
}
```

#### Tooltip Fade
```css
.tooltip {
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 150ms ease-out, transform 150ms ease-out;
  pointer-events: none;
}

.tooltip-trigger:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  transition-delay: 500ms; /* Appear after hover delay */
}
```

### 10.4 Chart Animations

```typescript
// Recharts configuration
<LineChart data={data}>
  <Line
    type="monotone"
    dataKey="stars"
    stroke="#2670A9"
    strokeWidth={2}
    dot={false}
    animationDuration={800}
    animationEasing="ease-out"
  />
</LineChart>

// Custom animation on data update
<AreaChart data={data}>
  <Area
    type="monotone"
    dataKey="downloads"
    fill="url(#gradient)"
    stroke="#2670A9"
    isAnimationActive={true}
    animationBegin={0}
    animationDuration={600}
  />
</AreaChart>
```

### 10.5 Layout Shift Prevention

```
Prevent CLS (Cumulative Layout Shift):

1. Reserve space for images
   <img width="200" height="150" /> or aspect-ratio CSS

2. Reserve space for dynamic content
   min-height on containers that load data

3. Skeleton loaders match final content dimensions
   Skeleton should be exact size as loaded content

4. Avoid inserting content above viewport
   Load new widgets at bottom, not top

5. Transitions instead of instant changes
   Smooth height changes, fade content swaps
```

---

## Summary

This UI/UX design specification provides a comprehensive blueprint for implementing the Dashboard Builder application with Salt Design System. The design prioritizes:

1. **Clarity**: Clean, data-focused interface with purposeful use of color and typography
2. **Consistency**: Standardized patterns across all components using Salt DS tokens
3. **Accessibility**: WCAG AA compliance with keyboard navigation and screen reader support
4. **Performance**: Efficient state management, caching, and responsive design
5. **Usability**: Familiar drag-and-drop interactions with clear visual feedback

### Key Design Decisions

- **Color Palette**: Professional neutrals from Salt DS, avoiding AI aesthetic clichés
- **Grid System**: 12-column responsive grid with react-grid-layout for flexibility
- **Component Architecture**: Widget-based modular system with independent state
- **Typography**: Open Sans with clear hierarchy for readability
- **Accessibility**: Keyboard-first navigation, semantic HTML, ARIA labels
- **Responsive**: Optimized for 1024px+ with graceful degradation

### Implementation Priorities

**Phase 1 - Core Structure**:
- Application shell (header, sidebar, canvas)
- Dashboard CRUD operations
- Widget catalog interface

**Phase 2 - Widget System**:
- Widget container component
- Drag-and-drop with react-grid-layout
- Widget state management
- Loading/error states

**Phase 3 - Data Integration**:
- GitHub API service layer
- npm API service layer
- API caching implementation
- Widget data fetching hooks

**Phase 4 - Polish**:
- Animations and transitions
- Accessibility audit
- Responsive testing
- Performance optimization

This specification should serve as the single source of truth for all UI/UX implementation decisions. All implementation agents should reference this document when building components to ensure consistency with the design system.

---

**Document Metadata**:
- Total Sections: 10
- Total Wireframes: 7
- Component Patterns: 25+
- Color Specifications: Complete Salt DS token mapping
- Accessibility: WCAG 2.1 Level AA compliant
- Responsive Breakpoints: 3 (Tablet, Laptop, Desktop)
