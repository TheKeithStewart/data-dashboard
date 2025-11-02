# UI/UX Design Specification: Data Dashboard Builder

**Project**: dashboard-builder
**Timestamp**: 20251102-143000
**Design System**: Salt Design System
**Target Platforms**: Desktop (primary), Tablet, Mobile (responsive)

---

## 1. Key Wireframes

### 1.1 Dashboard Management Page

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Dashboard Builder Logo]                        [@UserAvatar ▼]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  My Dashboards                                 [+ New Dashboard]    │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │   │
│  │ │  Preview    │ │  │ │  Preview    │ │  │ │  Preview    │ │   │
│  │ │  Thumbnail  │ │  │ │  Thumbnail  │ │  │ │  Thumbnail  │ │   │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │   │
│  │                 │  │                 │  │                 │   │
│  │ Project Alpha   │  │ NPM Packages    │  │ OSS Monitor     │   │
│  │ Modified 2h ago │  │ Modified 1d ago │  │ Modified 3d ago │   │
│  │                 │  │                 │  │                 │   │
│  │ [Edit] [Delete] │  │ [Edit] [Delete] │  │ [Edit] [Delete] │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐                         │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │                         │
│  │ │  Preview    │ │  │ │  Preview    │ │                         │
│  │ │  Thumbnail  │ │  │ │  Thumbnail  │ │                         │
│  │ └─────────────┘ │  │ └─────────────┘ │                         │
│  │                 │  │                 │                         │
│  │ Team Metrics    │  │ API Analytics   │                         │
│  │ Modified 1w ago │  │ Modified 2w ago │                         │
│  │                 │  │                 │                         │
│  │ [Edit] [Delete] │  │ [Edit] [Delete] │                         │
│  └─────────────────┘  └─────────────────┘                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Dashboard View with Left Sidebar

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [←Back] Project Alpha Dashboard         [@UserAvatar ▼] [⟳] [⚙️]       │
├──────────────────────────────────────────────────────────────────────────┤
│        │                                                                 │
│ FILTER │  ┌────────────────────┐  ┌────────────────────┐               │
│        │  │ Stars Timeline     │  │ Recent Issues      │               │
│ [≡]    │  │ ────────────       │  │                    │               │
│ Catalog│  │    /╲    /╲        │  │ • Issue #123       │               │
│        │  │   /  ╲  /  ╲       │  │   Bug report       │               │
│ ▼Date  │  │  /    ╲/    ╲      │  │                    │               │
│ Range  │  │ ────────────       │  │ • Issue #122       │               │
│        │  │ [⚙️] org/repo      │  │   Feature request  │               │
│ From:  │  └────────────────────┘  │                    │               │
│ [DATE] │                          │ • Issue #121       │               │
│ To:    │  ┌────────────────────┐  │   Documentation    │               │
│ [DATE] │  │ Download Trends    │  │                    │               │
│        │  │ ╱╲    ╱╲           │  │ [⚙️] org/repo      │               │
│ ▼Repos │  │   ╲  ╱  ╲          │  └────────────────────┘               │
│        │  │    ╲╱    ╲╱        │                                        │
│ □ org/ │  │ ────────────       │  ┌────────────────────┐               │
│   repo1│  │ [⚙️] npm-package   │  │ Package Quality    │               │
│ ☑ org/ │  └────────────────────┘  │                    │               │
│   repo2│                          │ Quality:    ██████ 95│              │
│ □ org/ │  ┌────────────────────┐  │ Popularity: ████── 78│              │
│   repo3│  │ Contributors       │  │ Maintenance:███─── 82│              │
│        │  │                    │  │                    │               │
│ [Apply]│  │ 1. @user1  324 ⭐  │  │ [⚙️] package-name  │               │
│ [Reset]│  │ 2. @user2  156 ⭐  │  └────────────────────┘               │
│        │  │ 3. @user3   89 ⭐  │                                        │
│ ────── │  │ 4. @user4   67 ⭐  │  ┌────────────────────┐               │
│        │  │                    │  │ PR Activity        │               │
│ CATALOG│  │ [⚙️] org/repo      │  │ ┌────┬─────┬─────┐ │               │
│        │  └────────────────────┘  │ │PR  │Auth │Stat │ │               │
│ 🔍[___]│                          │ ├────┼─────┼─────┤ │               │
│        │                          │ │#42 │user │Open │ │               │
│ ▼GitHub│                          │ │#41 │user │Merge│ │               │
│ • Stars│                          │ │#40 │user │Open │ │               │
│   Time │                          │ └────┴─────┴─────┘ │               │
│ • Issue│                          │ [⚙️] org/repo      │               │
│   List │                          └────────────────────┘               │
│ • PR   │                                                                │
│   Table│                                                                │
│ • Contr│                                                                │
│   Rank │                                                                │
│        │                                                                │
│ ▼npm   │                                                                │
│ • Downl│                                                                │
│   Trend│                                                                │
│ • Quali│                                                                │
│   Score│                                                                │
│        │                                                                │
│ [+Add] │                                                                │
└────────┴────────────────────────────────────────────────────────────────┘
│←280px→│
```

### 1.3 Widget States (Default, Loading, Error)

```
DEFAULT STATE
┌────────────────────────────────────┐
│ Package Download Trends      [⚙️][×]│
├────────────────────────────────────┤
│                                    │
│      ╱╲      ╱╲                    │
│     ╱  ╲    ╱  ╲                   │
│    ╱    ╲  ╱    ╲                  │
│   ╱      ╲╱      ╲                 │
│  ────────────────────              │
│  Jan  Feb  Mar  Apr                │
│                                    │
│  📦 react-package                  │
│  Last updated: 2 min ago           │
└────────────────────────────────────┘

LOADING STATE
┌────────────────────────────────────┐
│ Package Download Trends      [⚙️][×]│
├────────────────────────────────────┤
│                                    │
│                                    │
│         ⟳ Loading data...          │
│                                    │
│      [Progress Indicator]          │
│                                    │
│                                    │
│  📦 react-package                  │
│                                    │
└────────────────────────────────────┘

ERROR STATE
┌────────────────────────────────────┐
│ Package Download Trends      [⚙️][×]│
├────────────────────────────────────┤
│                                    │
│         ⚠️ Data Unavailable         │
│                                    │
│  Unable to fetch download data.    │
│  Rate limit exceeded or network    │
│  error.                            │
│                                    │
│         [Retry]  [Configure]       │
│                                    │
└────────────────────────────────────┘

EMPTY/UNCONFIGURED STATE
┌────────────────────────────────────┐
│ Package Download Trends      [⚙️][×]│
├────────────────────────────────────┤
│                                    │
│                                    │
│         📊 Not Configured          │
│                                    │
│  Select a package to display       │
│  download trends.                  │
│                                    │
│         [Configure Widget]         │
│                                    │
└────────────────────────────────────┘
```

### 1.4 Widget Configuration Modal

```
┌───────────────────────────────────────────────────────────┐
│  Configure: Repository Stars Timeline               [×]   │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Data Source                                              │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Repository: facebook/react                      [×] │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Display Settings                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Chart Type:  [Line Chart ▼]                         │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Time Range                                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ From: [2024-01-01]  To: [2024-12-31]               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Granularity                                              │
│  ○ Daily    ● Weekly    ○ Monthly                        │
│                                                           │
│  Refresh Interval                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ [5 minutes ▼]                                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│                                     [Cancel]  [Save]      │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Component Hierarchy

```
App
├── AppShell
│   ├── Header
│   │   ├── Logo
│   │   ├── DashboardSwitcher (dropdown)
│   │   ├── GlobalActions (refresh, settings)
│   │   └── UserMenu
│   └── MainContent
│       └── [Page Routes]
│
├── DashboardManagementPage
│   ├── PageHeader
│   │   ├── Title
│   │   └── CreateDashboardButton
│   └── DashboardGrid
│       └── DashboardCard[] (repeating)
│           ├── PreviewThumbnail
│           ├── DashboardMeta (name, modified date)
│           └── ActionButtons (edit, delete)
│
├── DashboardViewPage
│   ├── DashboardHeader
│   │   ├── BackButton
│   │   ├── DashboardTitle (editable)
│   │   └── ToolbarActions (refresh, settings)
│   ├── Sidebar (collapsible)
│   │   ├── SidebarToggle
│   │   ├── TabPanel
│   │   │   ├── FiltersTab
│   │   │   │   ├── DateRangeFilter
│   │   │   │   ├── RepositoryFilter
│   │   │   │   └── ApplyResetButtons
│   │   │   └── CatalogTab
│   │   │       ├── SearchInput
│   │   │       ├── CategoryAccordion[]
│   │   │       │   └── WidgetCatalogItem[]
│   │   │       │       ├── Icon
│   │   │       │       ├── WidgetMeta (name, description)
│   │   │       │       └── AddButton
│   │   │       └── AddAllButton
│   └── DashboardCanvas
│       └── GridLayout (react-grid-layout)
│           └── WidgetContainer[]
│               ├── WidgetHeader
│               │   ├── Title
│               │   └── Actions (configure, remove)
│               ├── WidgetContent
│               │   ├── LoadingState (conditional)
│               │   ├── ErrorState (conditional)
│               │   ├── EmptyState (conditional)
│               │   └── DataVisualization (conditional)
│               │       ├── ChartWidget (Recharts)
│               │       ├── MetricWidget (Cards)
│               │       ├── TableWidget (Data table)
│               │       └── ListWidget (Vertical list)
│               └── WidgetFooter (metadata)
│
├── ConfigurationModal
│   ├── ModalHeader
│   ├── ModalBody
│   │   └── ConfigForm
│   │       ├── DataSourceFields
│   │       ├── DisplaySettingsFields
│   │       └── ValidationMessages
│   └── ModalFooter (cancel, save)
│
└── SharedComponents
    ├── EmptyState
    ├── LoadingSpinner
    ├── ErrorBanner
    └── ConfirmationDialog
```

---

## 3. Core User Flows

### 3.1 Dashboard Creation
- Navigate to dashboard management page
- Click "New Dashboard" button
- Enter dashboard name in modal/dialog
- System creates empty dashboard with default grid
- User redirected to dashboard edit view
- Sidebar opens to catalog tab by default

### 3.2 Widget Addition
- User opens sidebar catalog tab (if collapsed)
- Browse categories or use search
- Click "Add" button on desired widget
- Widget appears on canvas in next available grid position (top-left to bottom-right)
- Widget displays "unconfigured" empty state
- User clicks widget settings icon to configure data source
- Widget fetches data and renders visualization

### 3.3 Filter Application
- User opens sidebar filters tab
- Select date range using date pickers
- Check/uncheck repository checkboxes
- Click "Apply" button
- All compatible widgets on canvas receive filter context
- Widgets re-fetch data with new parameters
- Loading states shown during fetch
- Visual indicator (badge, highlight) shows active filters

### 3.4 Widget Configuration
- User clicks settings icon in widget header
- Configuration modal opens with current settings pre-filled
- User modifies data source, display options, or refresh settings
- Form validation provides real-time feedback
- Click "Save" button
- Modal closes, widget re-fetches with new configuration
- Widget shows loading state then updated visualization

### 3.5 Multi-Dashboard Navigation
- User clicks dashboard switcher in header OR
- User clicks "Back" to return to management page
- Dashboard grid displays all saved dashboards
- Click "Edit" on any dashboard card
- System loads dashboard from localStorage
- Canvas renders with saved widget positions, sizes, and configurations
- Sidebar restores last filter state for that dashboard

---

## 4. Visual Specifications

### 4.1 Salt DS Color Palette (Key Colors)

| Token Name              | Hex Code  | Usage                                    |
|-------------------------|-----------|------------------------------------------|
| `--salt-blue-500`       | `#0076D6` | Primary actions, links, focus states     |
| `--salt-gray-900`       | `#2B2B2B` | Primary text, headers                    |
| `--salt-gray-600`       | `#6C6C6C` | Secondary text, labels                   |
| `--salt-gray-200`       | `#E0E0E0` | Borders, dividers                        |
| `--salt-gray-50`        | `#F5F5F5` | Background, surfaces                     |
| `--salt-red-500`        | `#E60000` | Error states, destructive actions        |
| `--salt-green-500`      | `#008A00` | Success states, positive metrics         |
| `--salt-yellow-500`     | `#FFB800` | Warning states, attention indicators     |

**Additional Context:**
- Use `--salt-white` (#FFFFFF) for card backgrounds
- Use `--salt-gray-100` (#F0F0F0) for hover states
- Maintain 4.5:1 contrast ratio for WCAG AA compliance

### 4.2 Typography Scale

| Element              | Font Family        | Size   | Weight | Line Height |
|----------------------|--------------------|--------|--------|-------------|
| Page Title (H1)      | Open Sans          | 28px   | 600    | 1.4         |
| Section Header (H2)  | Open Sans          | 20px   | 600    | 1.5         |
| Widget Title (H3)    | Open Sans          | 16px   | 600    | 1.5         |
| Body Text            | Open Sans          | 14px   | 400    | 1.6         |
| Small Text/Metadata  | Open Sans          | 12px   | 400    | 1.5         |

**Font Stack**: `'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### 4.3 Spacing Tokens

| Token         | Value  | Usage                                      |
|---------------|--------|--------------------------------------------|
| `--salt-spacing-25`  | 2px    | Tight spacing (icon padding)               |
| `--salt-spacing-50`  | 4px    | Minimal spacing (inline elements)          |
| `--salt-spacing-100` | 8px    | Standard spacing (between related items)   |
| `--salt-spacing-200` | 16px   | Section spacing (widget padding)           |
| `--salt-spacing-300` | 24px   | Large spacing (page margins)               |
| `--salt-spacing-400` | 32px   | Extra large spacing (section separators)   |

### 4.4 Breakpoints

| Breakpoint | Width    | Layout Behavior                              |
|------------|----------|----------------------------------------------|
| Desktop    | ≥1280px  | 12-column grid, sidebar 280px, full features |
| Tablet     | 768-1279px | 8-column grid, collapsible sidebar         |
| Mobile     | <768px   | 4-column grid, sidebar as drawer/overlay     |

**Grid Configuration (react-grid-layout):**
- Desktop: 12 columns, row height 80px
- Tablet: 8 columns, row height 80px
- Mobile: 4 columns, row height 100px (stacked)

### 4.5 Elevation/Shadow System

| Level      | Box Shadow                                      | Usage                        |
|------------|-------------------------------------------------|------------------------------|
| Level 1    | `0 1px 3px rgba(0,0,0,0.08)`                   | Widget cards                 |
| Level 2    | `0 2px 6px rgba(0,0,0,0.12)`                   | Modals, dropdowns            |
| Level 3    | `0 4px 12px rgba(0,0,0,0.15)`                  | Sidebar (when overlaid)      |

### 4.6 Border Radius

| Token                | Value | Usage                          |
|----------------------|-------|--------------------------------|
| `--salt-radius-small` | 4px   | Buttons, inputs                |
| `--salt-radius-medium`| 8px   | Widget containers, cards       |
| `--salt-radius-large` | 12px  | Modals, large panels           |

---

## 5. Accessibility Requirements

### 5.1 Keyboard Navigation
- Tab order follows logical left-to-right, top-to-bottom flow
- All interactive elements (buttons, links, form controls) reachable via Tab key
- Widget drag/drop has keyboard alternative (arrow keys to move, Enter to place)
- Esc key closes modals, dropdowns, and sidebar (when overlaid)
- Focus visible indicators on all interactive elements (`outline: 2px solid --salt-blue-500`)

### 5.2 Screen Reader Support
- Semantic HTML5 elements (`<nav>`, `<main>`, `<aside>`, `<article>`)
- ARIA landmarks for page regions (`role="navigation"`, `role="main"`, `role="complementary"`)
- ARIA labels for icon-only buttons (settings, remove, add)
- ARIA live regions for widget loading/error state announcements (`aria-live="polite"`)
- Widget grid has `aria-label="Dashboard canvas with draggable widgets"`

### 5.3 Color Contrast
- All text meets WCAG 2.1 Level AA (4.5:1 for normal text, 3:1 for large text)
- Error states use both color AND icon/text indicators (not color alone)
- Focus indicators visible against all backgrounds

### 5.4 Responsive Text Scaling
- Support browser text zoom up to 200% without loss of functionality
- Use relative units (rem) for font sizes where possible
- Widget content reflows gracefully when text size increases

### 5.5 Motion and Animation
- Respect `prefers-reduced-motion` media query
- Disable drag animations for users with motion preferences
- Loading spinners have alternative text announcements

### 5.6 Form Accessibility
- All form inputs have associated labels (visible or aria-label)
- Required fields marked with asterisk + aria-required
- Inline validation errors linked to inputs via aria-describedby
- Error summaries at top of forms with focus management

---

## 6. Widget Framework UI Patterns

### 6.1 Generic Widget Container Design

All widgets share a standardized container structure providing consistent chrome and lifecycle state management:

**Container Structure:**
- **Header**: Title (left), action buttons (right) - settings icon, remove icon
- **Body**: Content area with state-aware rendering - data visualization (default), loading spinner (fetching), error message with retry button (failed), empty state with configuration CTA (unconfigured)
- **Footer**: Metadata line with data source indicator, last updated timestamp

**State Management UI:**
- Loading: Centered spinner with "Loading data..." text, disabled header actions
- Error: Warning icon + error message + "Retry" and "Configure" buttons
- Empty/Unconfigured: Informational icon + prompt text + "Configure Widget" button
- Success: Visualization component + footer metadata

**Visual Consistency:**
- All widgets use same header height (48px), padding (16px), border radius (8px)
- Uniform action button styling (icon buttons, 32x32px touch target)
- Consistent footer typography (12px, gray-600, right-aligned timestamp)

**Interaction Patterns:**
- Settings icon opens modal with widget-specific configuration form
- Remove icon triggers confirmation dialog before deletion
- Widget body click-through to underlying chart interactions (zoom, tooltip)
- Drag handle on header for repositioning (cursor: move)

This generic container wraps all widget types (Chart, Metric, Table, List), ensuring visual and interaction consistency while allowing specialized content rendering within the body area.

---

## 7. Layout System

### 7.1 Grid Layout (react-grid-layout)

**Desktop (≥1280px):**
- 12 columns
- Row height: 80px
- Gutter: 16px (horizontal and vertical)
- Min widget size: 2 columns × 2 rows (160px × 160px)
- Max widget size: 12 columns × unlimited rows

**Tablet (768-1279px):**
- 8 columns
- Row height: 80px
- Gutter: 12px
- Min widget size: 2 columns × 2 rows
- Sidebar collapses by default

**Mobile (<768px):**
- 4 columns
- Row height: 100px
- Gutter: 8px
- Widgets stack vertically (full width)
- Sidebar becomes full-screen drawer

**Drag Behavior:**
- Grid snapping enabled
- Collision detection prevents overlap
- Vertical compaction (widgets float to top)
- Placeholder shown during drag
- Save layout to localStorage on dragStop event

### 7.2 Sidebar Layout

**Width:** 280px (fixed, not resizable)

**Toggle Behavior:**
- Desktop: Sidebar pushes content (canvas width adjusts)
- Tablet/Mobile: Sidebar overlays content (canvas width unchanged)

**Tab Structure:**
- Top tabs: "Filters" | "Catalog"
- Tab panel height: calc(100vh - header - tabs)
- Scrollable content within each tab

---

## 8. Interaction Patterns

### 8.1 Drag and Drop

**Widget Repositioning:**
1. User hovers over widget header → cursor changes to `move`
2. User clicks and drags → widget becomes semi-transparent (opacity: 0.7)
3. Grid shows placeholder outline at drop location
4. Other widgets shift position to accommodate (with animation)
5. User releases → widget snaps to grid, opacity returns to 1.0
6. Layout saved to localStorage

**Widget Resizing:**
1. User hovers over widget bottom-right corner → resize handle appears
2. User drags handle → widget dimensions update in real-time
3. Grid constraints enforced (min/max size)
4. User releases → widget re-renders content for new dimensions
5. Layout saved to localStorage

### 8.2 Modal Workflows

**Widget Configuration:**
- Modal opens centered on screen with overlay (backdrop: rgba(0,0,0,0.5))
- Focus trapped within modal
- First form field auto-focused
- Esc key or overlay click closes modal (with unsaved changes warning)
- Cancel button discards changes, Save button validates and applies

**Dashboard Creation:**
- Simple modal with single text input (dashboard name)
- Create button disabled until name is valid (1-50 characters)
- Enter key submits form

**Delete Confirmation:**
- Small dialog with title, description, and action buttons
- Destructive action (Delete) styled in red, secondary position
- Cancel action is primary (left position, default focus)

### 8.3 Filter Application

**Filter Panel Interaction:**
1. User toggles filter sections (accordion pattern)
2. User modifies filter values (date pickers, checkboxes)
3. Filter state stored locally (not applied yet)
4. User clicks "Apply" → filters sent to all widgets
5. Active filters badge appears in sidebar header
6. "Reset" button clears all filters

**Widget Response:**
- Widget receives filter context via props
- Widget shows loading state if data refetch required
- Widget re-renders with filtered data
- Widgets incompatible with filter ignore it (e.g., date filter on static metric)

---

## 9. Component Specifications

### 9.1 Dashboard Card (Management Page)

**Dimensions:** 300px × 240px
**Layout:**
- Thumbnail: 300px × 160px (16:10 aspect ratio)
- Metadata section: 80px height
- Actions: Inline buttons, 32px height

**Thumbnail Generation:**
- Canvas snapshot using html2canvas or similar
- Cached in localStorage alongside dashboard config
- Regenerated on dashboard save

**States:**
- Default: White background, shadow level 1
- Hover: Shadow level 2, border highlight (blue-500)

### 9.2 Widget Catalog Item

**Layout:** Horizontal card
**Dimensions:** Variable height (min 60px)

**Content:**
- Icon: 32×32px, left-aligned
- Text block: Name (16px bold), description (12px regular)
- Add button: Icon button, right-aligned

**Interaction:**
- Hover: Background changes to gray-100
- Click on card body: Expands to show full description (if truncated)
- Click "Add" button: Adds widget to canvas, animates button to checkmark

### 9.3 Widget Container

**Dimensions:** Variable (grid-based)
**Min Size:** 2 columns × 2 rows (minimum viable chart display)
**Recommended Sizes:**
- Metric widget: 2×2 (compact)
- List widget: 3×3 (medium)
- Chart widget: 4×3 or 6×4 (large)
- Table widget: 6×4 (extra large)

**Header:** 48px fixed height
**Body:** Flexible (calc(100% - header - footer))
**Footer:** 28px fixed height (optional, hidden if no metadata)

---

## 10. Responsive Behavior

### 10.1 Dashboard Management Page

| Breakpoint | Layout                                         |
|------------|------------------------------------------------|
| Desktop    | 3-column grid, 300px cards, 32px gap          |
| Tablet     | 2-column grid, fluid cards, 24px gap          |
| Mobile     | 1-column list, full-width cards, 16px gap     |

### 10.2 Dashboard View Page

| Breakpoint | Sidebar                | Canvas                  |
|------------|------------------------|-------------------------|
| Desktop    | Fixed 280px, visible   | 12-column grid          |
| Tablet     | Overlay, hidden        | 8-column grid           |
| Mobile     | Full-screen drawer     | 4-column stacked        |

### 10.3 Widget Adaptation

**Desktop → Tablet:**
- Widgets proportionally resize within 8-column grid
- Chart legends may move from side to bottom
- Table columns may become horizontally scrollable

**Tablet → Mobile:**
- All widgets become full-width (4 columns)
- Charts switch to mobile-optimized variants (simplified axes, larger touch targets)
- Tables switch to card view (vertical list of rows)

---

## 11. Loading and Empty States

### 11.1 Page-Level Loading

**Dashboard Management Page:**
- Skeleton cards (gray boxes) in grid layout
- Fade-in animation when data loads

**Dashboard View Page:**
- Canvas shows placeholder grid
- Widgets appear progressively as they load

### 11.2 Widget Loading States

**Initial Load:**
- Centered spinner (32×32px)
- "Loading data..." text below spinner
- Gray background to differentiate from empty canvas

**Refresh:**
- Small spinner in widget header (next to title)
- Content dims (opacity: 0.6)
- No full-screen overlay (non-blocking)

### 11.3 Empty States

**No Dashboards Created:**
- Centered illustration (dashboard icon)
- Headline: "No dashboards yet"
- Subtext: "Create your first dashboard to get started"
- CTA: "Create Dashboard" button

**No Widgets on Dashboard:**
- Centered illustration (widget grid icon)
- Headline: "Empty dashboard"
- Subtext: "Add widgets from the catalog to visualize your data"
- CTA: "Open Catalog" button (highlights sidebar)

**Widget Not Configured:**
- Widget-specific icon (e.g., chart icon for chart widget)
- "Not Configured" headline
- "Select a [data source] to display [metric]" subtext
- "Configure Widget" button

---

## 12. Error States

### 12.1 API Errors

**Rate Limit Exceeded:**
- Widget shows warning icon
- Message: "Rate limit exceeded. Try again in X minutes."
- "Retry" button (disabled with countdown timer)

**Network Error:**
- Widget shows error icon
- Message: "Unable to fetch data. Check your connection."
- "Retry" button (enabled)

**Invalid Configuration:**
- Widget shows alert icon
- Message: "Invalid repository/package name."
- "Configure" button (opens settings modal)

### 12.2 Application Errors

**Dashboard Load Failure:**
- Page-level error banner (top of viewport)
- "Unable to load dashboard. Your data may be corrupted."
- "Return to Dashboard List" button

**Storage Quota Exceeded:**
- Toast notification (bottom-right)
- "Storage full. Delete unused dashboards to free space."
- "Manage Dashboards" link

---

## 13. Animation and Transitions

### 13.1 Timing Functions

| Animation Type       | Duration | Easing                      |
|----------------------|----------|-----------------------------|
| Fade in/out          | 200ms    | ease-in-out                 |
| Slide panel          | 300ms    | cubic-bezier(0.4, 0, 0.2, 1)|
| Widget drag          | 0ms      | n/a (real-time tracking)    |
| Grid reflow          | 200ms    | ease-out                    |
| Button hover         | 100ms    | ease-in                     |

### 13.2 Key Animations

**Sidebar Toggle:**
- Desktop: Content area width animates (300ms ease-in-out)
- Mobile: Sidebar slides from left with overlay fade-in (300ms)

**Widget Addition:**
- Widget fades in (opacity 0 → 1, 200ms)
- Simultaneous scale animation (transform: scale(0.95) → scale(1))

**Filter Application:**
- Widgets flash subtle highlight border (blue-500, 400ms pulse)
- Loading spinner replaces content (fade transition, 200ms)

**Drag Preview:**
- Dragged widget opacity reduces to 0.7
- Placeholder appears with dashed border (blue-500)

### 13.3 Reduced Motion

When `prefers-reduced-motion: reduce`:
- All animations duration → 0ms (instant)
- Fade transitions become instant visibility toggles
- Grid reflow is immediate (no animation)
- Focus indicators remain (accessibility requirement)

---

## 14. Theming (Future Consideration)

**Current Scope:** Light mode only using Salt DS default theme

**Dark Mode Preparation:**
- Use Salt DS CSS custom properties for all colors
- Avoid hardcoded hex values in component styles
- Ensure color tokens are semantic (e.g., `--text-primary` not `--gray-900`)
- Test contrast ratios for both light and dark backgrounds

**Theming Strategy (if implemented):**
- Theme toggle in user menu (header)
- Preference saved to localStorage
- Respects OS preference via `prefers-color-scheme` media query
- Widget visualizations use theme-aware color palettes

---

## 15. Performance Considerations

### 15.1 Rendering Optimization

**Widget Virtualization:**
- Implement viewport-based rendering for dashboards with 20+ widgets
- Use React.memo for widget components
- Debounce grid layout recalculations (100ms)

**Data Caching:**
- Cache API responses in memory (Map data structure)
- TTL-based invalidation (1 hour for GitHub, 24 hours for npm)
- Avoid redundant fetches for identical queries

### 15.2 Asset Loading

**Code Splitting:**
- Lazy load widget components (React.lazy)
- Separate bundle per widget type
- Load on-demand when widget added to canvas

**Image Optimization:**
- Dashboard thumbnails stored as compressed JPEGs (quality: 80)
- User avatars lazy-loaded (IntersectionObserver)

### 15.3 Interaction Performance

**Drag and Drop:**
- Throttle drag event handlers (16ms, ~60fps)
- Use CSS transforms for positioning (GPU-accelerated)
- Disable non-essential animations during drag

**Filter Application:**
- Debounce filter input changes (300ms)
- Batch widget updates (single re-render cycle)
- Show immediate UI feedback (loading states) before async operations

---

## 16. Microcopy and Messaging

### 16.1 Button Labels

| Action                  | Label             |
|-------------------------|-------------------|
| Create dashboard        | "New Dashboard"   |
| Add widget              | "Add" or "+ Add"  |
| Save configuration      | "Save"            |
| Cancel action           | "Cancel"          |
| Delete dashboard        | "Delete"          |
| Apply filters           | "Apply"           |
| Reset filters           | "Reset"           |
| Retry failed fetch      | "Retry"           |
| Configure widget        | "Configure"       |

### 16.2 Confirmation Dialogs

**Delete Dashboard:**
- Title: "Delete Dashboard?"
- Body: "Are you sure you want to delete '[Dashboard Name]'? This action cannot be undone."
- Actions: "Cancel" (default), "Delete" (destructive)

**Remove Widget:**
- Title: "Remove Widget?"
- Body: "Remove '[Widget Name]' from this dashboard?"
- Actions: "Cancel", "Remove"

**Unsaved Changes:**
- Title: "Unsaved Changes"
- Body: "You have unsaved changes. Do you want to discard them?"
- Actions: "Cancel", "Discard"

### 16.3 Toast Notifications

| Event                     | Message                                  |
|---------------------------|------------------------------------------|
| Dashboard created         | "Dashboard created successfully"         |
| Dashboard deleted         | "Dashboard deleted"                      |
| Widget added              | "[Widget Name] added to dashboard"       |
| Widget removed            | "Widget removed"                         |
| Filters applied           | "Filters applied to X widgets"           |
| Configuration saved       | "Widget configuration saved"             |
| Data refresh complete     | "Data refreshed"                         |

---

## 17. Technical Implementation Notes

### 17.1 React Component Patterns

**Widget Registry:**
- Centralized registry exported as singleton
- Each widget exports factory function returning component + metadata
- TypeScript generics for type-safe widget configuration

**State Management:**
- Dashboard state: React Context for current dashboard
- Widget state: Local component state (useState) + data cache (external Map)
- Filter state: Context provider wrapping dashboard canvas

**Data Fetching:**
- Custom hooks per data source (useGitHubData, useNpmData)
- SWR or React Query for request deduplication and caching
- Abort controllers for cleanup on unmount

### 17.2 Salt DS Component Mapping

| UI Element              | Salt DS Component      |
|-------------------------|------------------------|
| Buttons                 | `<Button>`             |
| Text inputs             | `<Input>`              |
| Dropdowns               | `<Dropdown>`           |
| Date pickers            | `<DatePicker>`         |
| Checkboxes              | `<Checkbox>`           |
| Tabs                    | `<TabGroup>`, `<Tab>`  |
| Modal/Dialog            | `<Dialog>`             |
| Cards                   | `<Card>`               |
| Accordion               | `<Accordion>`          |
| Tooltips                | `<Tooltip>`            |
| Badges                  | `<Badge>`              |
| Progress indicators     | `<CircularProgress>`   |
| Grid layout             | Custom (react-grid-layout) |

### 17.3 Data Flow Architecture

```
User Action (Filter/Config)
  ↓
Widget Container (receives props)
  ↓
Data Adapter (API abstraction layer)
  ↓
API Client (fetch with caching)
  ↓
Response Normalization
  ↓
Widget Visualization Component (Recharts/Custom)
  ↓
Rendered Chart/Table/List
```

**Key Interfaces:**

```typescript
interface WidgetProps<TConfig> {
  id: string;
  config: TConfig;
  filters: DashboardFilters;
  onConfigChange: (config: TConfig) => void;
  onRemove: () => void;
}

interface DataAdapter<TInput, TOutput> {
  fetch: (input: TInput) => Promise<TOutput>;
  normalize: (raw: any) => TOutput;
}

interface WidgetRegistryEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  component: React.ComponentType<WidgetProps<any>>;
  configSchema: ZodSchema;
  defaultConfig: any;
}
```

---

## 18. Accessibility Testing Checklist

- [ ] Tab order logical for all page layouts
- [ ] Focus visible on all interactive elements
- [ ] Keyboard shortcuts documented (Esc, Enter, Arrow keys)
- [ ] Screen reader announces widget state changes
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI components)
- [ ] Form labels associated with inputs
- [ ] Error messages linked to form fields (aria-describedby)
- [ ] ARIA landmarks present (nav, main, aside)
- [ ] Image alt text provided (or aria-label for icon buttons)
- [ ] Modal focus trap working
- [ ] Skip links for main content
- [ ] Responsive to text zoom (200%)
- [ ] Respects prefers-reduced-motion

---

## 19. Design Handoff Checklist

### For Implementation Team:

- [ ] Review all wireframes (Section 1)
- [ ] Understand component hierarchy (Section 2)
- [ ] Study user flows (Section 3)
- [ ] Reference Salt DS color tokens (Section 4.1)
- [ ] Apply typography scale (Section 4.2)
- [ ] Use spacing tokens consistently (Section 4.3)
- [ ] Implement responsive breakpoints (Section 4.4)
- [ ] Map Salt DS components (Section 17.2)
- [ ] Implement widget framework patterns (Section 6)
- [ ] Add accessibility features (Section 5)
- [ ] Handle all error states (Section 12)
- [ ] Apply animation timing (Section 13)
- [ ] Use exact microcopy (Section 16)

### For QA/Testing:

- [ ] Verify keyboard navigation (Section 5.1)
- [ ] Test screen reader compatibility (Section 5.2)
- [ ] Validate color contrast (Section 5.3)
- [ ] Test responsive layouts (Section 10)
- [ ] Verify all user flows (Section 3)
- [ ] Test error scenarios (Section 12)
- [ ] Check loading states (Section 11)
- [ ] Validate filter application (Section 8.3)
- [ ] Test drag-and-drop on touch devices (Section 8.1)

---

## 20. Open Questions and Assumptions

### Assumptions Made:

1. **Users have modern browsers** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
2. **Desktop-first usage pattern** (primary workflow on desktop, tablet/mobile for viewing)
3. **Single-user environment** (no concurrent editing, no conflict resolution)
4. **Public data only** (no OAuth, no private repository access for v1)
5. **English language only** (no i18n/l10n in v1)

### Questions for Product/Engineering:

1. **Dashboard limits**: Maximum dashboards per user? Maximum widgets per dashboard?
2. **Data refresh strategy**: Auto-refresh on interval vs. manual only?
3. **Export functionality**: Dashboard export to PNG/PDF in v1 scope?
4. **Widget sharing**: Should users be able to copy widget configurations between dashboards?
5. **Undo/redo**: Support for layout/configuration changes?
6. **Analytics**: Track user interactions for product insights?

---

## Appendix: Widget Type Templates

### A1. Chart Widget Template

**Data Requirements:**
- X-axis values (dates, categories)
- Y-axis values (numeric metrics)
- Optional: Series grouping (multi-line charts)

**Configuration Options:**
- Chart type (line, bar, area)
- X/Y axis labels
- Show/hide legend
- Color palette

**Responsive Behavior:**
- Desktop: Full chart with legend
- Tablet: Compressed X-axis labels
- Mobile: Simplified chart, legend below

### A2. Metric Widget Template

**Data Requirements:**
- Primary metric value (number)
- Optional: Secondary metrics (2-3 additional values)
- Optional: Trend indicator (up/down arrow, percentage change)

**Configuration Options:**
- Metric label
- Display format (abbreviated, full number)
- Trend calculation (vs. previous period)

**Layout:**
- Large number (28px) centered
- Label above (14px)
- Trend indicator below (12px, with icon)

### A3. Table Widget Template

**Data Requirements:**
- Array of row objects
- Column definitions (key, label, type)

**Configuration Options:**
- Visible columns
- Sort column/direction
- Row limit (pagination)

**Responsive Behavior:**
- Desktop: Full table with horizontal scroll if needed
- Tablet: Fewer columns (hide less important)
- Mobile: Card list view (vertical layout per row)

### A4. List Widget Template

**Data Requirements:**
- Array of list items
- Item structure (title, subtitle, metadata)

**Configuration Options:**
- Item limit (top 5, 10, 20)
- Sort order
- Show/hide avatars or icons

**Layout:**
- Vertical list with dividers
- Item height: 56px (medium density)
- Scrollable if exceeds widget height

---

**End of Design Specification**

---

**Files Referenced:**
- PRD: `/Users/keithstewart/dev/data-dashboard/docs/dashboard-prd-final.md`
- Output: `/Users/keithstewart/dev/data-dashboard/.claude/outputs/design/agents/ui-designer/dashboard-builder-20251102-143000/design-specification.md`

**Next Steps:**
1. Review this specification with product and engineering teams
2. Validate Salt DS component availability for all UI elements
3. Create high-fidelity mockups in Figma (optional)
4. Begin implementation with `react-typescript-specialist` agent
5. Conduct accessibility audit during development

**Specification Metadata:**
- Lines: ~950 (target: 800-1000) ✓
- Sections: 20 + Appendix
- Wireframes: 4 key views
- User flows: 5 core flows
- Color palette: 8 essential colors
- Typography: 5 levels
- Breakpoints: 3 major points
