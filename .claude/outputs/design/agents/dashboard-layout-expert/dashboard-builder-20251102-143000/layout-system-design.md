# Dashboard Grid Layout System Design

**Project**: dashboard-builder
**Timestamp**: 20251102-143000
**Library**: react-grid-layout v1.4.4
**Design System**: Salt Design System
**Target**: 400-600 lines specification

---

## Executive Summary

This specification defines a responsive, drag-and-drop dashboard grid layout system using react-grid-layout for the Data Dashboard Builder. The system supports 12 widgets across GitHub and npm data sources with three responsive breakpoints (desktop 12-col, tablet 8-col, mobile 4-col stacked). Layout persistence uses browser localStorage with debounced auto-save. The design prioritizes accessibility, performance for 20+ widgets, and seamless integration with Salt DS components.

---

## 1. Grid System Selection

### Library Choice: react-grid-layout

**Rationale**:
- Mature library (v1.4.4) with TypeScript support
- Built-in responsive breakpoints and layout transformations
- Proven drag-and-drop with collision detection
- Active maintenance and community support
- Bundle size: ~52KB gzipped (acceptable for dashboard complexity)

**Alternatives Rejected**:
- **react-gridstack**: Simpler but less flexible for complex widget sizing
- **Custom CSS Grid**: Would require manual drag-and-drop implementation
- **dnd-kit + CSS Grid**: More modern but less dashboard-specific features

**Installation**:
```bash
npm install react-grid-layout@1.4.4
npm install -D @types/react-grid-layout
```

**Dependencies**:
- React 19 (compatible)
- react-resizable (bundled)
- lodash.isequal (for layout comparison)

---

## 2. Grid Configuration

### Column System

**Desktop (≥1200px)**: 12 columns
- Supports 1/2, 1/3, 1/4, 1/6 widget layouts
- Industry standard for dashboard applications
- Maximum flexibility for complex arrangements

**Tablet (768px - 1199px)**: 8 columns
- Reduces complexity on medium screens
- Maintains side-by-side widget capability
- Widgets scale proportionally from desktop

**Mobile (<768px)**: 4 columns (stacked mode)
- Full-width widgets prioritized
- Vertical scrolling UX
- Simplified touch interactions

### Row Height Configuration

**Desktop**:
- Base row unit: 90px
- Rationale: Balances chart readability with vertical flexibility
- Typical widget heights: 2 rows (180px), 3 rows (270px), 4 rows (360px)

**Tablet**:
- Base row unit: 80px
- Slightly reduced for smaller viewport height
- Maintains aspect ratios for charts

**Mobile**:
- Base row unit: 100px
- Taller rows for touch-friendly interactions
- Widgets auto-expand to full width

### Margins and Spacing

**Container Padding**: 24px (Salt DS `--salt-spacing-300`)
- Consistent with Salt DS spacing scale
- Provides visual breathing room

**Widget Margins**: [16, 16] (horizontal, vertical)
- Maps to Salt DS `--salt-spacing-200`
- 16px gutters between widgets
- Prevents visual crowding

**Compact Mode Margins**: [12, 12]
- Optional dense layout mode
- For dashboards with 15+ widgets
- Salt DS `--salt-spacing-150`

---

## 3. Responsive Breakpoint Strategy

### Breakpoint Definitions

```typescript
const BREAKPOINTS = {
  lg: 1200,  // Desktop: 12 columns
  md: 768,   // Tablet: 8 columns
  sm: 0      // Mobile: 4 columns
};

const COLS = {
  lg: 12,
  md: 8,
  sm: 4
};
```

### Layout Transformation Rules

**Desktop → Tablet (12 col → 8 col)**:
- Widgets wider than 8 cols: Scale down proportionally
- Example: 12-col widget → 8-col widget (full width)
- Example: 6-col widget → 5-col widget (scale factor: 8/12 = 0.67)
- Maintain vertical positioning where possible
- Allow automatic reflowing if collisions occur

**Tablet → Mobile (8 col → 4 col)**:
- Force all widgets to 4 columns (full width)
- Stack vertically in user-defined order
- Height remains consistent (or expands for readability)
- Disable drag-and-drop on mobile (view-only)

**Mobile-Specific Behavior**:
- Single-column stacked layout
- Preserve widget order from desktop layout
- Enable vertical reordering via drag handles (optional)
- Collapse to content-only view (hide edit chrome)

### Responsive Layout Storage

Store separate layouts per breakpoint:

```typescript
interface DashboardLayouts {
  lg: LayoutItem[];  // Desktop layout
  md: LayoutItem[];  // Tablet layout (auto-generated if not customized)
  sm: LayoutItem[];  // Mobile layout (auto-generated stack)
}
```

**Auto-Generation Strategy**:
- If `md` layout not saved: Generate from `lg` with scaling
- If `sm` layout not saved: Generate vertical stack from `lg` widget order
- User can manually customize tablet/mobile layouts if needed

---

## 4. Drag-and-Drop Interaction Design

### Drag Handle Implementation

**Visual Design**:
- Icon: Salt DS `IconMoveVertical` or custom 6-dot drag icon
- Position: Top-left corner of widget header (12px padding)
- Size: 24x24px (touch-friendly)
- Color: `--salt-content-secondary` (neutral, accessible)
- Hover state: `--salt-content-primary` + cursor:grab
- Active state: cursor:grabbing + opacity:0.8

**Interaction Pattern**:
- Desktop: Click-and-drag on handle
- Touch: Long-press (500ms) on handle to enter drag mode
- Keyboard: Focus widget → Enter → Arrow keys to move

### Resize Handle Implementation

**Visual Design**:
- Icon: Salt DS resize corner indicator
- Position: Bottom-right corner overlay
- Size: 20x20px (desktop), 32x32px (touch)
- Visibility: Visible on hover (desktop), always visible (touch)

**Resize Constraints**:
- Snap to grid columns/rows
- Respect min/max width/height per widget type
- Prevent resize below minimum readable size
- Show dimension tooltip during resize (e.g., "4 x 3")

### Collision Detection Behavior

**Mode**: Compact (Vertical)
- Recommended for dashboard use case
- Widgets push others down when dropped
- Prevents overlapping
- Maintains visual clarity

**Configuration**:
```typescript
compactType: 'vertical'  // vertical | horizontal | null
preventCollision: false  // Allow pushing widgets
allowOverlap: false      // Strict non-overlap
```

**Visual Feedback During Drag**:
- Ghost preview: Semi-transparent widget at drop position
- Valid drop zone: Green outline on grid area
- Invalid drop zone: Red outline + disable drop
- Collision animation: Widgets smoothly shift when pushed

### Grid Snapping

**Snap Behavior**:
- Snap to column boundaries (always enabled)
- Snap to row boundaries (always enabled)
- Magnetic grid: Widget jumps to nearest valid position

**Configuration**:
```typescript
isBounded: true  // Widgets cannot be dragged outside grid
useCSSTransforms: true  // GPU-accelerated animations
```

---

## 5. Widget Size Constraints

### Widget Type Size Specifications

**Repository Stars Timeline** (Chart Widget):
- Default: 6 cols × 4 rows (540px × 360px on desktop)
- Minimum: 4 cols × 3 rows
- Maximum: 12 cols × 6 rows
- Rationale: Charts need horizontal space for X-axis labels

**Recent Issues List** (List Widget):
- Default: 4 cols × 4 rows
- Minimum: 3 cols × 3 rows
- Maximum: 6 cols × 8 rows
- Rationale: Lists expand vertically, limited horizontal benefit

**Pull Request Activity** (Table Widget):
- Default: 8 cols × 5 rows
- Minimum: 6 cols × 4 rows
- Maximum: 12 cols × 8 rows
- Rationale: Tables need width for multiple columns

**Contributor Ranking** (List Widget):
- Default: 4 cols × 4 rows
- Minimum: 3 cols × 3 rows
- Maximum: 6 cols × 6 rows

**Repository Overview Metrics** (Metric Card):
- Default: 3 cols × 2 rows
- Minimum: 2 cols × 2 rows
- Maximum: 4 cols × 3 rows
- Rationale: Compact metric display, minimal space needed

**Release Timeline** (Chart Widget):
- Default: 6 cols × 4 rows
- Minimum: 4 cols × 3 rows
- Maximum: 12 cols × 6 rows

**Package Download Trends** (Chart Widget):
- Default: 8 cols × 4 rows
- Minimum: 4 cols × 3 rows
- Maximum: 12 cols × 6 rows
- Rationale: Time-series charts benefit from width

**Package Version History** (Table Widget):
- Default: 6 cols × 4 rows
- Minimum: 4 cols × 3 rows
- Maximum: 12 cols × 6 rows

**Package Quality Score** (Metric Card):
- Default: 3 cols × 3 rows
- Minimum: 2 cols × 2 rows
- Maximum: 4 cols × 4 rows
- Rationale: Multi-metric card needs vertical space

**Dependencies Overview** (List Widget):
- Default: 5 cols × 5 rows
- Minimum: 4 cols × 4 rows
- Maximum: 8 cols × 8 rows

**Repository and Package Comparison** (Chart Widget):
- Default: 8 cols × 5 rows
- Minimum: 6 cols × 4 rows
- Maximum: 12 cols × 6 rows
- Rationale: Comparison charts need width for multiple bars

**Activity Heatmap** (Chart Widget):
- Default: 8 cols × 4 rows
- Minimum: 6 cols × 3 rows
- Maximum: 12 cols × 6 rows
- Aspect ratio: ~2:1 preferred for heatmap visibility

### Constraint Implementation

```typescript
interface WidgetLayoutConstraints {
  minW: number;  // Minimum width (columns)
  minH: number;  // Minimum height (rows)
  maxW: number;  // Maximum width (columns)
  maxH: number;  // Maximum height (rows)
  static?: boolean;  // Cannot be moved/resized
  isDraggable?: boolean;  // Override drag permission
  isResizable?: boolean;  // Override resize permission
}
```

### Static Elements

**Dashboard Header** (if implemented):
- Static position: Top of grid
- Full width: 12 cols × 1 row
- `static: true, isDraggable: false, isResizable: false`

**Filter Panel** (left sidebar - outside grid):
- Not part of grid layout
- Fixed sidebar using Salt DS layout components

---

## 6. Layout Persistence

### Data Structure

```typescript
interface DashboardConfig {
  id: string;  // UUID v4
  name: string;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
  layouts: {
    lg: LayoutItem[];
    md: LayoutItem[];
    sm: LayoutItem[];
  };
  widgets: WidgetInstance[];
  version: number;  // Schema version for migrations
}

interface LayoutItem {
  i: string;  // Widget instance ID (matches widgetId)
  x: number;  // Column position (0-indexed)
  y: number;  // Row position (0-indexed)
  w: number;  // Width in columns
  h: number;  // Height in rows
  minW: number;
  minH: number;
  maxW: number;
  maxH: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

interface WidgetInstance {
  id: string;  // Widget instance ID
  type: string;  // Widget type (e.g., "github-stars-timeline")
  config: WidgetConfig;  // Widget-specific configuration
  dataSource: DataSourceConfig;  // API parameters
}
```

### Storage Strategy

**Primary Storage**: localStorage
- Key pattern: `dashboard_config_{dashboardId}`
- Dashboard list key: `dashboard_list`
- Max storage: ~5-10MB per origin (sufficient for 50+ dashboards)

**Data Compression** (optional for large dashboards):
- Use lz-string library for JSON compression
- Apply if serialized config > 100KB
- Transparent compression/decompression

**Fallback Storage**: sessionStorage
- Temporary storage if localStorage full
- Warning to user: "Layout will not persist across browser sessions"

### Save/Load Operations

**Save Strategy**:
1. Serialize `DashboardConfig` to JSON
2. Validate schema before save
3. Store in localStorage with dashboard ID key
4. Update dashboard list index
5. Set `updatedAt` timestamp

**Load Strategy**:
1. Retrieve from localStorage by dashboard ID
2. Parse JSON and validate schema version
3. Apply migrations if version mismatch
4. Fallback to empty dashboard if corrupted
5. Log errors for debugging

**Error Handling**:
- QuotaExceededError: Prompt user to delete old dashboards
- Corrupted data: Reset to empty dashboard + warning
- Missing keys: Recreate with defaults

### Auto-Save Implementation

**Debounce Strategy**:
- Debounce delay: 2000ms (2 seconds)
- Trigger: `onLayoutChange` callback from react-grid-layout
- Cancel pending saves on new layout changes
- Force save on: widget deletion, configuration change, manual save

**Visual Indicators**:
- Save status: "Saving..." → "Saved" (Salt DS `StatusIndicator`)
- Location: Dashboard header (top-right)
- Icon: Salt DS `IconCheckmark` (success) or `IconError` (failure)
- Auto-hide after 3 seconds

**Optimistic Updates**:
- Update local state immediately during drag
- Queue save operation in background
- No blocking user interactions

---

## 7. Accessibility Design

### Keyboard Navigation

**Tab Order**:
1. Dashboard header controls (filters, add widget, save)
2. Widget catalog sidebar (if open)
3. Grid widgets (left-to-right, top-to-bottom)
4. Within widget: Interactive elements (buttons, links)

**Focus Management**:
- Focus ring: Salt DS `--salt-focused-outlineColor` (2px solid)
- Skip links: "Skip to widget grid" for screen reader users
- Trap focus in modals (widget configuration dialog)

**Keyboard Shortcuts**:
- **Tab**: Navigate between widgets
- **Enter**: Activate focused widget (open configuration)
- **Space**: Select widget for repositioning
- **Arrow keys**: Move selected widget (1 column/row per press)
- **Shift + Arrow**: Resize selected widget
- **Escape**: Cancel drag/resize operation
- **Delete**: Remove focused widget (with confirmation)

**Implementation**:
- Add `tabIndex={0}` to widget containers
- Implement `onKeyDown` handlers for arrow key movement
- Use `aria-grabbed` attribute during drag operations

### Screen Reader Support

**ARIA Attributes**:
```html
<div
  role="article"
  aria-label="Repository Stars Timeline widget"
  aria-describedby="widget-description-{id}"
  aria-posinset="3"
  aria-setsize="8"
>
  <span id="widget-description-{id}" className="sr-only">
    Chart showing star growth for react repository.
    Position: column 1, row 2. Size: 6 columns by 4 rows.
  </span>
</div>
```

**Live Regions**:
- Announce layout changes: `aria-live="polite"`
- Example: "Widget moved to column 3, row 1"
- Announce save status: "Dashboard saved successfully"
- Announce errors: `aria-live="assertive"` for critical errors

**Semantic HTML**:
- Use `<section>` for widget containers
- Use `<h3>` for widget titles
- Use `<button>` for drag handles (not divs)

### Touch Accessibility

**Touch Target Sizes**:
- Minimum: 44x44px (WCAG 2.2 guideline)
- Drag handle: 48x48px
- Resize handle: 48x48px (bottom-right)
- Widget action buttons: 44x44px minimum

**Touch Gestures**:
- Long-press (500ms): Enter edit mode on widget
- Drag: Move widget (after long-press)
- Pinch: Not supported (use resize handle)
- Double-tap: Open widget configuration

**Edit Mode Toggle**:
- Mobile/tablet: "Edit Layout" button enters edit mode
- Shows drag handles and action buttons
- "Done" button exits edit mode
- Prevents accidental drags during scrolling

---

## 8. Performance Optimization

### Render Optimization

**React.memo for Widget Components**:
```typescript
const Widget = React.memo(WidgetComponent, (prevProps, nextProps) => {
  return (
    prevProps.layout.i === nextProps.layout.i &&
    prevProps.layout.x === nextProps.layout.x &&
    prevProps.layout.y === nextProps.layout.y &&
    prevProps.layout.w === nextProps.layout.w &&
    prevProps.layout.h === nextProps.layout.h &&
    isEqual(prevProps.config, nextProps.config)
  );
});
```

**Debounced Layout Change Handler**:
- Debounce `onLayoutChange` to prevent excessive state updates
- Delay: 100ms during drag, 2000ms for save
- Use lodash.debounce or custom implementation

**Virtualization** (for 20+ widgets):
- Library: react-window or react-virtual
- Only render widgets in viewport + buffer (2 rows above/below)
- Lazy load widget data when scrolled into view
- Trade-off: Disables drag-and-drop outside viewport
- Recommendation: Apply only if dashboard has >20 widgets

### Data Fetching Optimization

**Lazy Load Widget Data**:
- Use Intersection Observer API
- Fetch data when widget is 200px from viewport
- Cache fetched data in widget state
- Prevents initial load of all 12 widget types

**Stale-While-Revalidate Pattern**:
- Show cached data immediately
- Fetch fresh data in background
- Update when new data arrives
- Library: SWR or TanStack Query

### Bundle Optimization

**Code Splitting**:
```typescript
// Lazy load widget components
const RepoStarsChart = lazy(() => import('./widgets/RepoStarsChart'));
const IssuesList = lazy(() => import('./widgets/IssuesList'));

// Lazy load react-grid-layout (optional)
const GridLayout = lazy(() => import('react-grid-layout'));
```

**Tree Shaking**:
- Import only used react-grid-layout components
- Use named imports from Recharts (not default export)
- Optimize lodash imports: `import debounce from 'lodash/debounce'`

**CSS Optimization**:
- Import react-grid-layout CSS only once in root layout
- Use Salt DS tokens instead of custom CSS where possible
- Minimize CSS-in-JS runtime overhead (use static styles)

### Memory Management

**Cleanup on Widget Removal**:
- Cancel pending API requests
- Clear intervals/timeouts
- Remove event listeners
- Reset widget state

**Layout Calculation Optimization**:
- react-grid-layout uses memoized calculations
- Avoid passing new object references on every render
- Use `useMemo` for layout transformations

---

## 9. Integration with Salt Design System

### Salt DS Component Usage

**Grid Container**:
```typescript
import { StackLayout } from '@salt-ds/core';

// Wrapper for entire dashboard
<StackLayout direction="column" gap={3}>
  <DashboardHeader />
  <GridLayoutContainer />
</StackLayout>
```

**Widget Card Wrapper**:
```typescript
import { Card } from '@salt-ds/core';

// Each widget wrapped in Salt DS Card
<Card className="widget-container">
  <DragHandle />
  <WidgetContent />
  <ResizeHandle />
</Card>
```

**Drag Handle Button**:
```typescript
import { Button } from '@salt-ds/core';
import { IconMoveVertical } from '@salt-ds/icons';

<Button
  variant="secondary"
  sentiment="neutral"
  className="drag-handle"
  aria-label="Drag to reposition widget"
>
  <IconMoveVertical />
</Button>
```

### Salt DS Styling Tokens

**Grid Spacing**:
- Container padding: `--salt-spacing-300` (24px)
- Widget margins: `--salt-spacing-200` (16px)
- Internal padding: `--salt-spacing-150` (12px)

**Widget Card Styling**:
- Background: `--salt-container-primary-background`
- Border: `--salt-container-primary-borderColor` (1px solid)
- Border radius: `--salt-palette-corner-weaker` (4px)
- Shadow: `--salt-shadow-1` (subtle elevation)

**Drag States**:
- Hover: `--salt-actionable-primary-background-hover`
- Active: `--salt-actionable-primary-background-active`
- Focus: `--salt-focused-outlineColor` (2px outline)

**Dark Mode Support**:
- Use Salt DS theme tokens (automatically adapts)
- No custom color values
- Test with `mode="dark"` on Salt Provider

---

## 10. Mobile-Specific Layout Strategy

### View Mode (Default)

**Layout**:
- Single column (4 cols = 100% width)
- Vertical stack in user-defined order
- No drag handles visible
- Optimized for scrolling and content viewing

**Features**:
- Pull-to-refresh dashboard data
- Tap widget to view full-screen detail (optional)
- Bottom navigation for dashboard switching

### Edit Mode (Opt-In)

**Activation**:
- "Edit Layout" button in dashboard header
- Enters edit mode with visual confirmation

**Layout Changes**:
- Drag handles appear on each widget
- "Delete" button (trash icon) on each widget
- "Done" button in header to exit edit mode

**Reordering**:
- Vertical drag-to-reorder only
- No column/width changes (all widgets full-width)
- Simplified collision detection (linear list)

**Implementation**:
```typescript
// Mobile-specific layout mode
const [isMobileEditMode, setIsMobileEditMode] = useState(false);

// Conditional rendering
{isMobile && !isMobileEditMode && <ViewOnlyGrid />}
{isMobile && isMobileEditMode && <EditableGrid />}
```

---

## 11. Testing Recommendations

### Interaction Testing (Playwright)

**Drag-and-Drop Tests**:
1. Drag widget from position A to position B
2. Verify widget updates position
3. Verify layout auto-saves
4. Verify collision detection (widgets shift)

**Resize Tests**:
1. Resize widget to minimum size
2. Verify cannot resize below minimum
3. Resize to maximum size
4. Verify snaps to grid columns/rows

**Keyboard Navigation Tests**:
1. Tab through widgets in correct order
2. Arrow keys move focused widget
3. Enter opens widget configuration
4. Escape cancels operations

### Layout Persistence Tests

**Save/Load Tests**:
1. Create dashboard with 5 widgets
2. Arrange in custom layout
3. Reload page
4. Verify layout restored correctly

**Multi-Dashboard Tests**:
1. Create 3 dashboards
2. Add different widgets to each
3. Switch between dashboards
4. Verify layouts remain independent

### Responsive Tests

**Breakpoint Transition Tests**:
1. Load dashboard at desktop size (1400px)
2. Resize to tablet (900px)
3. Verify widgets reflow correctly
4. Resize to mobile (375px)
5. Verify stacked layout

**Touch Tests** (Mobile Devices):
1. Long-press widget to enter edit mode
2. Drag widget to new position
3. Verify smooth touch interactions

### Performance Tests

**Load Time Tests**:
- Dashboard with 5 widgets: <1 second
- Dashboard with 10 widgets: <2 seconds
- Dashboard with 20 widgets: <3 seconds

**Drag Performance**:
- Measure frame rate during drag (target: 60fps)
- No jank or stuttering during drag
- Smooth animations

---

## 12. Implementation Checklist

### Phase 1: Core Grid Setup
- [ ] Install react-grid-layout and types
- [ ] Configure breakpoints (lg/md/sm)
- [ ] Set column counts (12/8/4)
- [ ] Configure row heights (90/80/100)
- [ ] Set margins (16x16)

### Phase 2: Widget Constraints
- [ ] Define min/max sizes for all 12 widget types
- [ ] Implement default widget sizes
- [ ] Configure drag handles
- [ ] Configure resize handles

### Phase 3: Drag-and-Drop
- [ ] Enable drag-and-drop on desktop
- [ ] Configure compact vertical mode
- [ ] Implement collision detection
- [ ] Add visual feedback (ghost preview)

### Phase 4: Persistence
- [ ] Define DashboardConfig schema
- [ ] Implement localStorage save/load
- [ ] Add auto-save with 2s debounce
- [ ] Add save status indicator

### Phase 5: Responsive
- [ ] Test desktop layout (12 cols)
- [ ] Test tablet layout (8 cols)
- [ ] Implement mobile stacked layout (4 cols)
- [ ] Test breakpoint transitions

### Phase 6: Accessibility
- [ ] Add keyboard navigation
- [ ] Implement ARIA attributes
- [ ] Add screen reader announcements
- [ ] Test with keyboard only
- [ ] Test with screen reader

### Phase 7: Performance
- [ ] Memoize widget components
- [ ] Debounce layout change handlers
- [ ] Implement lazy data loading
- [ ] Test with 20+ widgets

### Phase 8: Mobile Optimization
- [ ] Implement view/edit mode toggle
- [ ] Add touch-friendly drag handles
- [ ] Test on iOS Safari and Chrome
- [ ] Test on Android Chrome

---

## 13. Configuration Reference

### Complete react-grid-layout Config

```typescript
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const gridConfig = {
  className: "dashboard-grid",

  // Responsive breakpoints
  breakpoints: { lg: 1200, md: 768, sm: 0 },
  cols: { lg: 12, md: 8, sm: 4 },

  // Row configuration
  rowHeight: 90,  // Base unit (desktop)

  // Margins
  margin: [16, 16],
  containerPadding: [24, 24],

  // Drag and drop
  isDraggable: true,
  isResizable: true,
  isBounded: true,
  compactType: 'vertical',
  preventCollision: false,
  allowOverlap: false,

  // Performance
  useCSSTransforms: true,

  // Callbacks
  onLayoutChange: handleLayoutChange,
  onBreakpointChange: handleBreakpointChange,
  onDragStart: handleDragStart,
  onDragStop: handleDragStop,
  onResizeStart: handleResizeStart,
  onResizeStop: handleResizeStop,

  // Responsive layouts
  layouts: {
    lg: desktopLayout,
    md: tabletLayout,
    sm: mobileLayout
  }
};
```

---

## 14. Success Metrics

### Performance Targets
- Initial dashboard load: <2 seconds (10 widgets)
- Layout save operation: <100ms
- Drag smoothness: 60fps (no dropped frames)
- Memory usage: <50MB for 20-widget dashboard

### User Experience Targets
- Widget addition: <5 seconds from catalog to dashboard
- Layout customization: <2 minutes to arrange 10 widgets
- Auto-save feedback: Visible within 2 seconds of change
- Mobile edit mode: Clear visual distinction from view mode

### Accessibility Targets
- Keyboard navigation: 100% of functionality accessible
- Screen reader: All widgets properly announced
- Touch targets: 100% meet 44x44px minimum
- WCAG AA compliance: All contrast ratios pass

---

## Conclusion

This grid layout system provides a robust foundation for the Data Dashboard Builder using react-grid-layout. The design supports 12 widget types across 3 responsive breakpoints with comprehensive accessibility, performance optimization, and seamless Salt DS integration. Implementation teams should follow the phased checklist and validate against success metrics to ensure production-ready quality.

**Next Steps**: Handoff to `react-typescript-specialist` agent for implementation with integration into widget architecture and Salt DS components.