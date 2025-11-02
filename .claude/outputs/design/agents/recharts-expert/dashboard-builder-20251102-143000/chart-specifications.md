# Recharts Visualization Specifications
## Dashboard Builder Project

**Project**: dashboard-builder
**Timestamp**: 20251102-143000
**Library**: Recharts 3.3.0
**Target Environment**: Next.js 15, React 19, TypeScript 5

---

## Table of Contents

1. [Chart Type Selection Matrix](#chart-type-selection-matrix)
2. [Generic Data Transformation Layer](#generic-data-transformation-layer)
3. [Responsive Design Strategy](#responsive-design-strategy)
4. [Interactive Features Specification](#interactive-features-specification)
5. [Accessibility Implementation](#accessibility-implementation)
6. [Salt Design System Integration](#salt-design-system-integration)
7. [Performance Optimization](#performance-optimization)
8. [Component Configuration Specifications](#component-configuration-specifications)

---

## Chart Type Selection Matrix

### Overview

This section maps the 12 widget types defined in the PRD to optimal Recharts chart components, with detailed rationale based on data characteristics, user needs, and visualization best practices.

### GitHub Data Widgets

#### 1. Repository Stars Timeline Widget
**Recharts Component**: `AreaChart` with `Area` component
**Alternative**: `LineChart` with `Line` component

**Rationale**:
- Time-series data showing cumulative growth over time
- Area chart emphasizes volume and growth trajectory
- Gradient fill under line creates visual hierarchy showing magnitude
- Works well for monotonically increasing data (stars accumulate)

**Data Characteristics**:
- X-Axis: Temporal (dates)
- Y-Axis: Numeric (star count)
- Data Type: Continuous time series
- Expected Range: 0 to tens of thousands

**Chart Features**:
- Single area with gradient fill
- Reference line showing current total
- Reference area for date range filtering
- Custom dot for latest data point
- Brush component for zoom/pan on long timelines

---

#### 2. Recent Issues List Widget
**Recharts Component**: Not applicable (use list component)

**Rationale**:
- Tabular data with heterogeneous fields (text, dates, labels)
- No quantitative relationship to visualize
- Better served by Salt DS List/Table components

**Implementation Note**: This widget uses Salt DS `List` or `Table` components, not Recharts.

---

#### 3. Pull Request Activity Widget
**Recharts Component**: `BarChart` with grouped `Bar` components
**Alternative**: `ComposedChart` with `Bar` and `Line` mix

**Rationale**:
- Categorical comparison across time periods or PR states
- Bar chart excels at discrete comparisons
- Grouped bars can show multiple metrics (open, merged, closed)
- Horizontal orientation possible for long PR titles

**Data Characteristics**:
- X-Axis: Time periods (weeks/months) or PR titles
- Y-Axis: Count or duration metrics
- Data Type: Discrete categorical
- Expected Range: 0-100 PRs per period

**Chart Features**:
- Stacked or grouped bars for PR states
- Color coding by state (open=blue, merged=green, closed=red)
- Custom bar shape for featured PRs
- Click handler to drill into specific PRs

---

#### 4. Contributor Ranking Widget
**Recharts Component**: `BarChart` with horizontal `Bar` (rotated 90 degrees)
**Implementation**: Vertical chart with Y-axis as category axis

**Rationale**:
- Ranked comparison of contributors
- Horizontal bars accommodate long contributor names/usernames
- Natural reading order from top (highest) to bottom (lowest)
- Allows integration of avatars on Y-axis labels

**Data Characteristics**:
- X-Axis: Commit count (numeric)
- Y-Axis: Contributor names (categorical)
- Data Type: Ranked discrete data
- Expected Range: Top 10-20 contributors

**Chart Features**:
- Bars sorted by value (descending)
- Color gradient based on commit volume
- Custom Y-axis tick with avatar images
- Tooltip showing additional stats (PRs, issues, reviews)

---

#### 5. Repository Overview Metrics Widget
**Recharts Component**: Not applicable (use metric cards)

**Rationale**:
- Multi-dimensional snapshot data (stars, forks, watchers, issues)
- No temporal or comparative relationship
- Better served by Salt DS Card/Metric components

**Implementation Note**: This widget uses Salt DS `Card` and `Metric` components, not Recharts.

---

#### 6. Release Timeline Widget
**Recharts Component**: `ScatterChart` with `Scatter` component
**Alternative**: `BarChart` with variable-height bars

**Rationale**:
- Timeline visualization with discrete events (releases)
- Scatter plot allows bubble sizing for download count
- Y-axis can encode version number or importance
- Shows release cadence and impact visually

**Data Characteristics**:
- X-Axis: Release date (temporal)
- Y-Axis: Version number or download count
- Bubble Size (Z): Download count
- Data Type: Event-based time series

**Chart Features**:
- Custom scatter shapes (release icons)
- Bubble size proportional to downloads
- Color coding for release types (major, minor, patch)
- Reference lines for time-based milestones
- Click to view release notes

---

### npm Data Widgets

#### 7. Package Download Trends Widget
**Recharts Component**: `AreaChart` with stacked or overlaid `Area` components
**Alternative**: `LineChart` for multi-package comparison

**Rationale**:
- Time-series data showing download volume
- Area chart emphasizes magnitude and trends
- Stacked areas show total ecosystem downloads
- Gradient fills create visual depth

**Data Characteristics**:
- X-Axis: Date (daily/weekly/monthly)
- Y-Axis: Download count
- Data Type: Continuous time series
- Expected Range: Thousands to millions

**Chart Features**:
- Multiple areas for package comparison
- Stacked mode for total downloads
- Overlay mode for individual package trends
- Brush for date range selection
- Reference lines for release dates
- Smooth curve interpolation

---

#### 8. Package Version History Widget
**Recharts Component**: Not applicable (use table component)

**Rationale**:
- Tabular data (version, date, size)
- No quantitative relationship requiring visualization
- Better served by Salt DS Table with sorting

**Implementation Note**: This widget uses Salt DS `Table` component, not Recharts.

---

#### 9. Package Quality Score Widget
**Recharts Component**: `RadarChart` with `Radar` component
**Alternative**: `BarChart` for simpler comparison

**Rationale**:
- Multi-dimensional metrics (quality, popularity, maintenance)
- Radar chart shows profile/fingerprint of package health
- Easy visual comparison of balanced vs unbalanced metrics
- Familiar pattern for quality scorecards

**Data Characteristics**:
- Axes: 3-4 quality dimensions
- Values: 0-100 normalized scores
- Data Type: Multi-dimensional comparative
- Expected Range: 0-100 per dimension

**Chart Features**:
- Filled radar area showing overall profile
- Multiple radars for package comparison
- Custom colors per package
- Interactive legend to toggle packages
- Gridlines at 25/50/75/100 for reference

---

#### 10. Dependencies Overview Widget
**Recharts Component**: `TreemapChart` with `Treemap` component
**Alternative**: List component for simple display

**Rationale**:
- Hierarchical data (dependencies, sub-dependencies)
- Treemap visualizes size/importance through area
- Nesting shows dependency depth
- Color coding for dependency types (prod, dev, peer)

**Data Characteristics**:
- Hierarchy: Package > Dependencies > Sub-dependencies
- Size Metric: Bundle size or usage frequency
- Data Type: Hierarchical proportional
- Expected Range: 10-100 direct dependencies

**Chart Features**:
- Nested rectangles for dependency tree
- Size proportional to bundle impact
- Color by type (prod=blue, dev=gray, peer=orange)
- Click to drill down into sub-dependencies
- Tooltip showing version and license

---

### Cross-Source Widgets

#### 11. Repository and Package Comparison Widget
**Recharts Component**: `BarChart` with grouped `Bar` components
**Alternative**: `ComposedChart` for mixed metrics

**Rationale**:
- Categorical comparison across repos/packages
- Grouped bars enable side-by-side comparison
- Works for mixed data sources (GitHub + npm)
- Clear visual ranking and differences

**Data Characteristics**:
- X-Axis: Repository/Package names
- Y-Axis: Selected metric (stars, downloads, issues)
- Data Type: Categorical comparative
- Expected Range: Variable (needs normalization)

**Chart Features**:
- Grouped bars for multi-metric comparison
- Custom colors per data source (GitHub=purple, npm=red)
- Sorted by selected metric
- Dual Y-axes for different metric scales
- Interactive legend to toggle metrics

---

#### 12. Activity Heatmap Widget
**Recharts Component**: Custom implementation using `Cell` components in grid layout
**Alternative**: External library (react-calendar-heatmap)

**Rationale**:
- Two-dimensional time-based data (day of week × hour or week × day)
- Heatmap color intensity shows activity density
- GitHub-style contribution visualization pattern
- Reveals patterns (weekday activity, working hours)

**Data Characteristics**:
- X-Axis: Time period (weeks/hours)
- Y-Axis: Day of week/month
- Color Intensity: Activity count
- Data Type: Matrix/grid time series

**Chart Features**:
- Grid cells colored by activity intensity
- Tooltip showing exact counts and date
- Color scale from low (light) to high (dark)
- Click to filter data by time period
- Custom cell shapes (squares/circles)

**Implementation Note**: Recharts 3.x doesn't have native heatmap. Recommend custom SVG implementation or dedicated heatmap library integrated with Recharts styling.

---

## Generic Data Transformation Layer

### Purpose

The data transformation layer normalizes heterogeneous API responses (GitHub REST/GraphQL, npm Registry) into standardized formats that Recharts components can consume. This abstraction enables widget reusability and decouples data sources from visualization logic.

### Design Principles

1. **Single Responsibility**: Each transformer handles one API-to-chart mapping
2. **Type Safety**: All transformers have explicit TypeScript input/output types
3. **Null Safety**: Handle missing, null, or malformed data gracefully
4. **Performance**: Minimize transformation overhead, avoid N^2 operations
5. **Testability**: Pure functions with predictable outputs

---

### Generic Data Formats

#### Time Series Format
```typescript
interface TimeSeriesDataPoint {
  timestamp: number;           // Unix timestamp for precise sorting
  date: string;                // Human-readable date (e.g., "2025-11-02")
  displayDate: string;         // Formatted for axis labels (e.g., "Nov 2")
  value: number;               // Primary metric value
  metadata?: Record<string, unknown>; // Additional data for tooltips
}

type TimeSeriesData = TimeSeriesDataPoint[];
```

**Usage**: AreaChart, LineChart for temporal data
**Widgets**: Repository Stars Timeline, Package Download Trends

---

#### Categorical Comparison Format
```typescript
interface CategoricalDataPoint {
  category: string;            // Category name (e.g., "react", "vue")
  displayName: string;         // Formatted name for labels
  value: number;               // Primary metric
  values?: Record<string, number>; // Multiple metrics for grouped bars
  color?: string;              // Optional custom color
  metadata?: Record<string, unknown>;
}

type CategoricalData = CategoricalDataPoint[];
```

**Usage**: BarChart for comparisons
**Widgets**: Contributor Ranking, PR Activity, Repo/Package Comparison

---

#### Multi-Dimensional Format
```typescript
interface MultiDimensionalDataPoint {
  dimension: string;           // Dimension name (e.g., "quality")
  displayName: string;         // Label for axis
  value: number;               // Normalized value (0-100)
  maxValue: number;            // Scale maximum (typically 100)
  metadata?: Record<string, unknown>;
}

interface MultiDimensionalDataset {
  id: string;                  // Dataset identifier (e.g., package name)
  displayName: string;
  color: string;
  data: MultiDimensionalDataPoint[];
}

type MultiDimensionalData = MultiDimensionalDataset[];
```

**Usage**: RadarChart for multi-dimensional metrics
**Widgets**: Package Quality Score

---

#### Hierarchical Format
```typescript
interface HierarchicalNode {
  name: string;                // Node name
  displayName: string;
  value: number;               // Size/weight for treemap
  color?: string;
  children?: HierarchicalNode[]; // Nested nodes
  metadata?: Record<string, unknown>;
}

type HierarchicalData = HierarchicalNode[];
```

**Usage**: TreemapChart for hierarchical data
**Widgets**: Dependencies Overview

---

#### Scatter/Bubble Format
```typescript
interface ScatterDataPoint {
  x: number;                   // X-axis value (e.g., timestamp)
  y: number;                   // Y-axis value (e.g., version number)
  z?: number;                  // Bubble size (e.g., downloads)
  label: string;               // Point label
  color?: string;
  metadata?: Record<string, unknown>;
}

type ScatterData = ScatterDataPoint[];
```

**Usage**: ScatterChart for events and correlations
**Widgets**: Release Timeline

---

#### Heatmap Grid Format
```typescript
interface HeatmapCell {
  x: number | string;          // Column identifier
  y: number | string;          // Row identifier
  value: number;               // Intensity value
  displayValue: string;        // Formatted value for tooltip
  color: string;               // Computed color from scale
  metadata?: Record<string, unknown>;
}

type HeatmapData = HeatmapCell[];
```

**Usage**: Custom heatmap implementation
**Widgets**: Activity Heatmap

---

### Transformation Specifications

#### GitHub Stars Timeline Transformer

**Input**: GitHub API stargazers response with timestamps
**Output**: TimeSeriesData

**Transformation Logic**:
1. Parse stargazer timestamps from API response
2. Aggregate by date (daily/weekly/monthly based on config)
3. Calculate cumulative star count
4. Format dates for display labels
5. Add metadata (growth rate, new stars per period)

**Edge Cases**:
- Empty repository (0 stars): Return single point at [0, 0]
- Repository created today: Show single point with current count
- Missing timestamp data: Use creation date as fallback

**Aggregation Strategy**:
- Daily: Group by date, sum stars per day
- Weekly: Group by ISO week, sum stars per week
- Monthly: Group by year-month, sum stars per month

**Example Transformation**:
```
Input (GitHub API):
[
  { "starred_at": "2025-01-15T10:30:00Z" },
  { "starred_at": "2025-01-15T14:20:00Z" },
  { "starred_at": "2025-01-16T09:00:00Z" }
]

Output (TimeSeriesData):
[
  {
    timestamp: 1737792000000,
    date: "2025-01-15",
    displayDate: "Jan 15",
    value: 2,
    metadata: { newStars: 2, growthRate: "100%" }
  },
  {
    timestamp: 1737878400000,
    date: "2025-01-16",
    displayDate: "Jan 16",
    value: 3,
    metadata: { newStars: 1, growthRate: "50%" }
  }
]
```

---

#### Package Download Trends Transformer

**Input**: npm Download Counts API response
**Output**: TimeSeriesData

**Transformation Logic**:
1. Parse download data by date
2. Handle daily/weekly/monthly aggregation
3. Calculate moving averages for trend smoothing
4. Normalize large numbers (e.g., 1.2M instead of 1200000)
5. Add metadata (total, average, peak downloads)

**Edge Cases**:
- New package (no historical data): Show from publish date
- Data gaps: Interpolate missing days with 0 or previous value
- Outlier spikes: Flag in metadata for tooltip explanation

**Multiple Package Handling**:
- Merge multiple package datasets by date
- Ensure all packages have same date range (fill gaps with 0)
- Support both stacked (total) and overlay (individual) modes

**Example Transformation**:
```
Input (npm API):
{
  "downloads": [
    { "day": "2025-01-15", "downloads": 45230 },
    { "day": "2025-01-16", "downloads": 52100 }
  ]
}

Output (TimeSeriesData):
[
  {
    timestamp: 1737792000000,
    date: "2025-01-15",
    displayDate: "Jan 15",
    value: 45230,
    metadata: { formattedValue: "45.2K", isWeekday: true }
  },
  {
    timestamp: 1737878400000,
    date: "2025-01-16",
    displayDate: "Jan 16",
    value: 52100,
    metadata: { formattedValue: "52.1K", isWeekday: true }
  }
]
```

---

#### Contributor Ranking Transformer

**Input**: GitHub API contributors response
**Output**: CategoricalData

**Transformation Logic**:
1. Extract contributor username and commit count
2. Sort by commit count (descending)
3. Limit to top N contributors (configurable, default 10)
4. Add avatar URL to metadata
5. Calculate percentage of total contributions

**Edge Cases**:
- Bot contributors: Filter out or flag in metadata
- Deleted accounts: Show as "[Deleted User]" with placeholder avatar
- Tie scores: Maintain consistent ordering using secondary sort (username)

**Color Strategy**:
- Gradient from primary color (top contributor) to neutral (bottom)
- Special color for authenticated user if in list

**Example Transformation**:
```
Input (GitHub API):
[
  { "login": "alice", "contributions": 234, "avatar_url": "..." },
  { "login": "bob", "contributions": 189, "avatar_url": "..." }
]

Output (CategoricalData):
[
  {
    category: "alice",
    displayName: "alice",
    value: 234,
    color: "#8b5cf6",
    metadata: {
      avatarUrl: "...",
      percentage: 55.3,
      isBot: false
    }
  },
  {
    category: "bob",
    displayName: "bob",
    value: 189,
    color: "#a78bfa",
    metadata: {
      avatarUrl: "...",
      percentage: 44.7,
      isBot: false
    }
  }
]
```

---

#### Package Quality Score Transformer

**Input**: npms.io API quality score response
**Output**: MultiDimensionalData

**Transformation Logic**:
1. Extract quality, popularity, maintenance scores (0-1 range)
2. Normalize to 0-100 scale
3. Round to 1 decimal place
4. Add overall score as separate dimension
5. Support multiple packages for comparison

**Edge Cases**:
- New package (no score data): Show placeholder with "Insufficient data"
- Deprecated package: Flag in metadata, gray out radar
- Score anomalies: Cap at 100, floor at 0

**Dimension Labels**:
- Quality: "Code Quality"
- Popularity: "Popularity"
- Maintenance: "Maintenance"
- Overall: "Overall Score"

**Example Transformation**:
```
Input (npms.io API):
{
  "score": {
    "final": 0.87,
    "detail": {
      "quality": 0.92,
      "popularity": 0.78,
      "maintenance": 0.91
    }
  }
}

Output (MultiDimensionalData):
[
  {
    id: "react",
    displayName: "React",
    color: "#61dafb",
    data: [
      { dimension: "quality", displayName: "Code Quality", value: 92, maxValue: 100 },
      { dimension: "popularity", displayName: "Popularity", value: 78, maxValue: 100 },
      { dimension: "maintenance", displayName: "Maintenance", value: 91, maxValue: 100 },
      { dimension: "overall", displayName: "Overall Score", value: 87, maxValue: 100 }
    ]
  }
]
```

---

#### Release Timeline Transformer

**Input**: GitHub API releases response
**Output**: ScatterData

**Transformation Logic**:
1. Parse release publish date and tag name
2. Extract version number (remove 'v' prefix)
3. Calculate download count from assets (if available)
4. Map version to Y-axis (semantic versioning hierarchy)
5. Size bubbles by download count

**Edge Cases**:
- Pre-releases: Different color (e.g., orange vs green)
- Releases without downloads: Minimum bubble size
- Draft releases: Exclude from visualization

**Y-Axis Strategy**:
- Semantic version sorting (major > minor > patch)
- Linear Y position based on release index
- Alternative: Major version number as Y value

**Example Transformation**:
```
Input (GitHub API):
[
  {
    "tag_name": "v2.1.0",
    "published_at": "2025-01-15T10:00:00Z",
    "assets": [{ "download_count": 1234 }]
  },
  {
    "tag_name": "v2.0.0",
    "published_at": "2024-12-01T10:00:00Z",
    "assets": [{ "download_count": 5678 }]
  }
]

Output (ScatterData):
[
  {
    x: 1737799200000,
    y: 2.1,
    z: 1234,
    label: "v2.1.0",
    color: "#10b981",
    metadata: { releaseType: "minor", downloads: "1.2K" }
  },
  {
    x: 1733047200000,
    y: 2.0,
    z: 5678,
    label: "v2.0.0",
    color: "#10b981",
    metadata: { releaseType: "major", downloads: "5.7K" }
  }
]
```

---

#### Dependencies Treemap Transformer

**Input**: npm Registry API package.json dependencies
**Output**: HierarchicalData

**Transformation Logic**:
1. Parse dependencies object (prod, dev, peer)
2. Fetch package sizes from bundlephobia API (optional)
3. Build tree structure with package as root
4. Color by dependency type
5. Size by bundle size or default weight

**Edge Cases**:
- Circular dependencies: Break cycle, add warning in metadata
- Missing size data: Use fallback weight (1)
- Peer dependencies: Show but don't count in total size

**Color Coding**:
- Production dependencies: Primary blue
- Dev dependencies: Neutral gray
- Peer dependencies: Warning orange
- Optional dependencies: Light blue

**Example Transformation**:
```
Input (npm Registry):
{
  "dependencies": {
    "react": "^18.0.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}

Output (HierarchicalData):
[
  {
    name: "my-package",
    displayName: "my-package",
    value: 500,
    children: [
      {
        name: "react",
        displayName: "react@^18.0.0",
        value: 200,
        color: "#3b82f6",
        metadata: { type: "production", version: "^18.0.0" }
      },
      {
        name: "lodash",
        displayName: "lodash@^4.17.21",
        value: 150,
        color: "#3b82f6",
        metadata: { type: "production", version: "^4.17.21" }
      },
      {
        name: "typescript",
        displayName: "typescript@^5.0.0",
        value: 150,
        color: "#6b7280",
        metadata: { type: "development", version: "^5.0.0" }
      }
    ]
  }
]
```

---

#### Activity Heatmap Transformer

**Input**: GitHub API commit activity or npm download stats
**Output**: HeatmapData

**Transformation Logic**:
1. Aggregate activity by day of week and hour (or week and day)
2. Calculate intensity values (count)
3. Normalize to color scale (0-max activity)
4. Generate color from scale based on intensity
5. Create grid cells for all time periods

**Edge Cases**:
- Sparse data: Show empty cells with minimum color
- Extreme outliers: Cap intensity at 99th percentile for color scale
- Timezone handling: Convert all timestamps to UTC

**Color Scale**:
- 0 activity: Lightest shade (e.g., #f3f4f6)
- Low activity: Light color (e.g., #dbeafe)
- Medium activity: Medium color (e.g., #3b82f6)
- High activity: Dark color (e.g., #1e40af)

**Example Transformation**:
```
Input (GitHub API aggregated commits):
{
  "2025-W03-Mon": 15,
  "2025-W03-Tue": 23,
  "2025-W03-Wed": 8
}

Output (HeatmapData):
[
  {
    x: "W03",
    y: "Mon",
    value: 15,
    displayValue: "15 commits",
    color: "#3b82f6",
    metadata: { week: "2025-W03", day: "Monday", date: "2025-01-13" }
  },
  {
    x: "W03",
    y: "Tue",
    value: 23,
    displayValue: "23 commits",
    color: "#1e40af",
    metadata: { week: "2025-W03", day: "Tuesday", date: "2025-01-14" }
  },
  {
    x: "W03",
    y: "Wed",
    value: 8,
    displayValue: "8 commits",
    color: "#dbeafe",
    metadata: { week: "2025-W03", day: "Wednesday", date: "2025-01-15" }
  }
]
```

---

### Transformation Utilities

#### Date Formatting Utility
```typescript
interface DateFormatOptions {
  granularity: 'daily' | 'weekly' | 'monthly';
  locale?: string;
}

function formatDateForAxis(timestamp: number, options: DateFormatOptions): string
```

**Purpose**: Consistent date formatting across all chart types
**Examples**:
- Daily: "Jan 15", "Feb 3"
- Weekly: "W03", "W12"
- Monthly: "Jan 2025", "Feb 2025"

---

#### Number Formatting Utility
```typescript
function formatNumberForDisplay(value: number, precision?: number): string
```

**Purpose**: Human-readable number formatting
**Examples**:
- 1234 → "1.2K"
- 1234567 → "1.2M"
- 1234567890 → "1.2B"

---

#### Color Scale Generator
```typescript
function generateColorScale(
  min: number,
  max: number,
  colorStops: string[]
): (value: number) => string
```

**Purpose**: Generate continuous color scales for heatmaps and gradients
**Implementation**: Linear interpolation between color stops

---

## Responsive Design Strategy

### Breakpoint System

Align with Salt Design System breakpoints:

- **Mobile**: < 600px
- **Tablet**: 600px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: ≥ 1440px

### Chart Sizing Strategy

#### General Principles

1. **Fluid Width**: All charts use `ResponsiveContainer` with `width="100%"`
2. **Fixed Aspect Ratios**: Define height based on chart type and content density
3. **Minimum Heights**: Prevent charts from becoming illegible on small screens
4. **Maximum Heights**: Cap tall charts to avoid excessive scrolling

#### Height Specifications by Chart Type

**AreaChart / LineChart**:
- Mobile: 200px (minimum)
- Tablet: 300px
- Desktop: 400px
- Large Desktop: 500px

**BarChart (Vertical)**:
- Mobile: 250px
- Tablet: 350px
- Desktop: 450px
- Large Desktop: 550px

**BarChart (Horizontal)**:
- Height based on number of bars: `Math.max(300, bars * 40)`
- Mobile: Reduce to `bars * 30` with smaller font
- Tablet: `bars * 35`
- Desktop: `bars * 40`

**RadarChart**:
- Mobile: 250px (square aspect ratio)
- Tablet: 350px
- Desktop: 400px
- All: Maintain 1:1 aspect ratio

**TreemapChart**:
- Mobile: 300px
- Tablet: 400px
- Desktop: 500px
- Large Desktop: 600px

**ScatterChart**:
- Mobile: 250px
- Tablet: 350px
- Desktop: 450px
- Large Desktop: 500px

---

### Responsive Component Configurations

#### Axis Responsiveness

**X-Axis Adaptive Labels**:
```
Mobile:
  - Hide every other label (tick interval: 2)
  - Rotate labels -45 degrees if needed
  - Use abbreviated date formats ("Jan 15" → "1/15")
  - Font size: 10px

Tablet:
  - Show all labels or interval: 1
  - No rotation
  - Standard date formats
  - Font size: 11px

Desktop:
  - Show all labels
  - Full date formats ("January 15, 2025")
  - Font size: 12px
```

**Y-Axis Adaptive Labels**:
```
Mobile:
  - Fewer ticks (count: 4)
  - Abbreviated numbers ("1.2K")
  - Font size: 10px

Tablet:
  - Standard ticks (count: 5)
  - Short numbers ("1.2K")
  - Font size: 11px

Desktop:
  - More ticks (count: 6-8)
  - Full numbers with commas ("1,234")
  - Font size: 12px
```

---

#### Legend Responsiveness

**Position Strategy**:
```
Mobile:
  - Position: bottom
  - Layout: horizontal
  - Icon size: small (8px)
  - Hide legend if > 5 items (use tooltip only)

Tablet:
  - Position: bottom or right
  - Layout: horizontal or vertical
  - Icon size: medium (10px)
  - Show up to 8 items

Desktop:
  - Position: right
  - Layout: vertical
  - Icon size: medium (12px)
  - Show all items
```

**Legend Content Adaptation**:
```
Mobile:
  - Abbreviated labels (max 15 characters)
  - No values shown in legend
  - Tappable for toggle (larger hit area)

Tablet:
  - Standard labels (max 25 characters)
  - Optional values

Desktop:
  - Full labels
  - Show values and percentages
```

---

#### Tooltip Responsiveness

**Size and Content**:
```
Mobile:
  - Compact layout
  - Essential info only
  - Larger touch target (min 44px)
  - Font size: 12px

Tablet:
  - Standard layout
  - More details
  - Font size: 13px

Desktop:
  - Expanded layout
  - All available details
  - Hover-optimized
  - Font size: 14px
```

**Position Strategy**:
```
Mobile:
  - Fixed position at top or bottom (avoid finger occlusion)
  - Full-width on very small screens

Tablet/Desktop:
  - Follow cursor
  - Auto-position to stay in viewport
```

---

#### Grid and Reference Lines

**Visibility Strategy**:
```
Mobile:
  - Hide vertical grid lines
  - Show horizontal grid lines only (fewer: 3-4)
  - Hide reference areas (too cluttered)

Tablet:
  - Show both horizontal and vertical grid lines
  - Standard reference lines

Desktop:
  - Full grid
  - All reference lines and areas
  - Subtle styling (opacity: 0.2)
```

---

#### Interactive Elements

**Brush Component** (for zoom/pan):
```
Mobile:
  - Hide Brush (too small for precise interaction)
  - Provide pinch-to-zoom alternative if possible

Tablet:
  - Show Brush with larger handle size (15px)
  - Increase brush height (40px)

Desktop:
  - Standard Brush (height: 30px)
  - Precise mouse interaction
```

**Clickable Areas**:
```
Mobile:
  - Minimum tap target: 44px x 44px
  - Increase bar/dot sizes
  - Add transparent overlay for easier tapping

Tablet:
  - Standard tap target: 36px x 36px

Desktop:
  - Precise hover areas
  - Show pointer cursor
```

---

### Orientation Handling

**Portrait vs Landscape**:

Charts should adapt to device orientation, especially on tablets and mobile:

```
Portrait (mobile):
  - Prioritize vertical space
  - Compact legends at bottom
  - Shorter chart heights (200-250px)

Landscape (mobile):
  - Utilize horizontal space
  - Legends to the right
  - Taller charts (300-350px)

Tablet (both):
  - Similar strategy but less aggressive
  - More data visible in landscape
```

---

### Performance Considerations for Responsive Charts

1. **Conditional Rendering**: Use media queries or viewport hooks to conditionally render simplified charts on mobile
2. **Data Downsampling**: Show fewer data points on mobile (e.g., weekly instead of daily)
3. **Lazy Loading**: Load charts as they enter viewport on long dashboards
4. **Animation Reduction**: Disable complex animations on mobile (use `isAnimationActive={false}`)

---

## Interactive Features Specification

### Tooltip System

#### Custom Tooltip Component Structure

**Purpose**: Provide contextual data on hover/tap with rich formatting and Salt DS styling

**Tooltip Content Hierarchy**:
1. **Primary Label**: Date, category, or point identifier (bold)
2. **Primary Value**: Main metric with formatted number
3. **Secondary Values**: Additional metrics (if multi-series)
4. **Contextual Info**: Metadata (percentages, change indicators, timestamps)
5. **Actions**: Optional links or buttons (e.g., "View Details")

**Responsive Tooltip Behavior**:
```
Mobile:
  - Touch to show tooltip
  - Tap outside to dismiss
  - Fixed position (top or bottom 20% of screen)
  - Larger text (14px)
  - Simplified content (2-3 lines max)

Desktop:
  - Hover to show tooltip
  - Cursor offset positioning (10px right, 10px down)
  - Full content with all metadata
  - Auto-hide on mouse leave
```

---

#### Tooltip Specifications by Chart Type

**AreaChart / LineChart Tooltip**:
```
Content:
  - Date (formatted): "January 15, 2025"
  - Primary value: "1,234 stars"
  - Growth: "+45 from previous period"
  - Trend indicator: ↑ or ↓ arrow with color

Styling:
  - Background: Salt DS surface color with shadow
  - Border: Subtle 1px border
  - Padding: 12px
  - Max width: 250px
```

**BarChart Tooltip**:
```
Content:
  - Category name: "alice" (contributor name)
  - Bar value: "234 commits"
  - Percentage: "55% of total"
  - Additional metric: "45 PRs reviewed"

Styling:
  - Color indicator matching bar color
  - Compact layout for grouped bars
  - Show all series in single tooltip
```

**RadarChart Tooltip**:
```
Content:
  - Dimension name: "Code Quality"
  - Value: "92 / 100"
  - Comparison: "8 points above average"

Styling:
  - Multi-line for multiple datasets
  - Color-coded labels per dataset
```

**ScatterChart Tooltip**:
```
Content:
  - Point label: "v2.1.0" (release tag)
  - X-axis value: "January 15, 2025"
  - Y-axis value: "Version 2.1"
  - Bubble size: "1,234 downloads"

Styling:
  - Larger tooltip for richer content
  - Icon/image if applicable (release icon)
```

**TreemapChart Tooltip**:
```
Content:
  - Node name: "react"
  - Node size: "200 KB"
  - Percentage: "40% of total"
  - Dependency type: "Production"

Styling:
  - Color preview matching treemap cell
  - Breadcrumb path for nested nodes (e.g., "my-package > react")
```

---

### Tooltip Portal Strategy (Recharts 3.x Feature)

**Implementation**:
Recharts 3.x supports tooltip portals, allowing tooltips to render outside the SVG container for better positioning and z-index control.

**Benefits**:
1. **Z-Index Control**: Tooltips always appear above other dashboard elements
2. **Overflow Handling**: Tooltips not clipped by widget boundaries
3. **Styling Flexibility**: Use CSS/Tailwind without SVG limitations

**Configuration**:
```
Render tooltip in portal container:
  - Portal target: Body or dedicated tooltip container
  - Position calculation: Based on cursor position and viewport bounds
  - Accessibility: Maintain ARIA relationship with chart
```

---

### Click Handlers and Drill-Down

#### Click Interaction Patterns

**AreaChart / LineChart**:
- **Click on data point**: Show detailed data for that date
- **Click on area**: Filter dashboard to that time period
- **Use case**: Clicking star count on specific date shows new stargazers

**BarChart**:
- **Click on bar**: Drill down to details for that category
- **Example**: Clicking contributor bar navigates to contributor profile
- **Visual feedback**: Bar highlight on hover, darker shade on click

**RadarChart**:
- **Click on dimension**: Filter by that quality metric
- **Click on dataset**: Toggle visibility or highlight
- **Use case**: Clicking "Code Quality" shows packages sorted by quality

**ScatterChart**:
- **Click on bubble**: Navigate to release details or release notes
- **Zoom interaction**: Click and drag to zoom into region
- **Use case**: Clicking release bubble opens GitHub release page

**TreemapChart**:
- **Click on cell**: Drill down to sub-dependencies
- **Breadcrumb navigation**: Click breadcrumb to navigate up
- **Use case**: Clicking "react" shows React's dependencies

---

#### Drill-Down Navigation Flow

**Pattern**:
1. User clicks chart element
2. Widget state updates (loading indicator)
3. Fetch detailed data or navigate to detail view
4. Show detail panel (modal, slide-out, or inline expansion)
5. Provide "Back" action to return to original chart

**State Management**:
- Maintain drill-down history stack
- Preserve original chart state
- Support browser back button

---

### Legend Interactivity

#### Interactive Legend Patterns

**Toggle Series Visibility**:
- Click legend item to hide/show corresponding data series
- Grayed-out legend item indicates hidden series
- All charts update simultaneously when legend is shared

**Highlight Series**:
- Hover legend item to highlight corresponding series in chart
- Dim other series (opacity: 0.3)
- Works across synchronized charts

**Filter Data**:
- Click legend item to filter entire dashboard by that category
- Example: Clicking "Production dependencies" in legend filters all widgets to show only production deps

---

#### Legend Specifications

**Default Legend**:
```
Position: Right (desktop), Bottom (mobile)
Layout: Vertical (desktop), Horizontal (mobile)
Icon: 12px square or line (matches chart type)
Label: Truncated at 30 characters with ellipsis
Interaction: Click to toggle, hover to highlight
```

**Custom Legend**:
For complex widgets, implement custom legend component with:
- Checkboxes for explicit toggle state
- Color swatches matching data series
- Summary statistics (e.g., total, average)
- Sort options (alphabetical, by value)

---

### Brush for Zoom and Pan

#### Brush Component Usage

**Purpose**: Allow users to select a subset of data to view in detail, particularly useful for long time-series data

**Supported Charts**:
- AreaChart
- LineChart
- BarChart (horizontal axis)

**Configuration**:
```
Desktop:
  - Height: 30px
  - Handle size: 10px
  - Show data preview in brush area (miniature chart)
  - Smooth drag interaction

Tablet:
  - Height: 40px
  - Handle size: 15px (easier to grab)
  - Simplified preview

Mobile:
  - Hide Brush component (too small)
  - Use pinch-to-zoom or date range picker instead
```

**Interaction Behavior**:
1. User drags brush handles to select range
2. Main chart updates to show only selected range
3. Y-axis rescales to fit selected data
4. Brush updates other synchronized charts (if applicable)

**State Persistence**:
- Save brush selection per widget instance
- Reset brush on widget configuration change
- Share brush state across synchronized charts

---

### Reference Lines and Areas

#### Reference Line Patterns

**Use Cases**:
- Mark current value (e.g., current star count)
- Show threshold (e.g., 1000 stars milestone)
- Indicate target or goal
- Highlight specific date (e.g., major release date)

**Configuration**:
```
Reference Line:
  - Stroke: Dashed or solid
  - Color: Contextual (red for threshold, blue for target)
  - Label: Position at line start or end
  - Interaction: Tooltip on hover with explanation
```

**Example Usage**:
```
Chart: Repository Stars Timeline
Reference Line 1: Current total stars (solid blue line)
Reference Line 2: Goal milestone (dashed green line at 10,000)
Label: "Goal: 10K stars"
```

---

#### Reference Area Patterns

**Use Cases**:
- Highlight time period (e.g., marketing campaign duration)
- Show confidence interval or error margin
- Indicate acceptable range

**Configuration**:
```
Reference Area:
  - Fill: Semi-transparent color (opacity: 0.1-0.2)
  - Stroke: None or subtle border
  - Label: Text overlay or legend entry
  - Interaction: Tooltip explaining significance
```

**Example Usage**:
```
Chart: Package Download Trends
Reference Area: Marketing campaign period (Jan 1 - Jan 31)
Fill: Green with 0.15 opacity
Label: "Launch Campaign"
```

---

### Synchronized Charts

#### Synchronization Strategy

**Purpose**: When multiple charts share a common axis (e.g., time), hovering/interacting with one chart highlights corresponding data in all charts

**Implementation**:
Use Recharts `syncId` prop to link charts:
```
<LineChart syncId="dashboard-timeline" ... />
<AreaChart syncId="dashboard-timeline" ... />
```

**Synchronized Behaviors**:
1. **Hover**: Hovering on date in one chart shows tooltips for same date in all charts
2. **Click**: Clicking data point in one chart highlights same point in all charts
3. **Brush**: Selecting date range in one chart updates all synchronized charts

**Use Cases**:
- Dashboard with multiple time-series widgets (stars, downloads, issues over time)
- Comparison widgets showing multiple metrics side-by-side

---

### Accessibility for Interactions

**Keyboard Navigation**:
- Tab to focus chart area
- Arrow keys to navigate data points
- Enter to activate click handler
- Escape to dismiss tooltip/detail view

**Screen Reader Support**:
- Announce tooltip content on focus
- Provide text alternative for click actions
- Label all interactive elements with ARIA attributes

**Touch Optimization**:
- Minimum 44px touch targets for mobile
- Tap to show tooltip, tap outside to dismiss
- Long-press for context menu (if applicable)

---

## Accessibility Implementation

### WCAG 2.1 Level AA Compliance

All charts must meet WCAG 2.1 Level AA standards for accessibility, with AAA compliance as a stretch goal for critical widgets.

---

### Color Contrast Requirements

#### Background and Foreground Contrast

**Minimum Ratios**:
- Text on backgrounds: 4.5:1 (normal text), 3:1 (large text ≥ 18px)
- Chart elements on backgrounds: 3:1
- Interactive elements: 3:1 against adjacent colors

**Salt DS Token Usage**:
All colors must use Salt DS tokens to ensure design system compliance and theme support (light/dark mode).

**Testing Strategy**:
- Use browser DevTools contrast checker
- Automated testing with axe-core or Lighthouse
- Manual verification with color contrast tools

---

#### Chart Color Accessibility

**Data Series Colors**:
Must have sufficient contrast against:
1. Chart background (white or dark)
2. Adjacent data series (for comparison charts)
3. Grid lines and axis lines

**Recommended Palettes**:

**Light Mode** (using Salt DS tokens):
- Primary series: `--salt-palette-interact-primary` (#3B82F6 - blue)
- Secondary series: `--salt-palette-interact-secondary` (#10B981 - green)
- Tertiary series: `--salt-palette-accent-foreground` (#F59E0B - orange)
- Quaternary series: `--salt-palette-error-foreground` (#EF4444 - red)

**Dark Mode**:
- Primary series: `--salt-palette-interact-primary-dark` (lighter blue)
- Secondary series: `--salt-palette-interact-secondary-dark` (lighter green)
- (Continue pattern with dark mode tokens)

**Color-Blind Friendly Palette**:
Design for Deuteranopia (red-green color blindness), most common type:
- Use blue-orange contrast instead of red-green
- Add patterns/textures as secondary encoding
- Avoid pure red-green combinations

**Pattern Support**:
For critical data distinctions, use both color AND pattern:
- Solid fill
- Diagonal stripes
- Dots
- Horizontal lines

This ensures information is conveyed through multiple channels, not color alone.

---

### ARIA Labels and Descriptions

#### Chart Container ARIA

**AreaChart / LineChart**:
```
<div role="img" aria-label="Repository stars over time">
  <ResponsiveContainer>
    <AreaChart aria-describedby="stars-chart-desc">
      {/* Chart components */}
    </AreaChart>
  </ResponsiveContainer>
  <div id="stars-chart-desc" className="sr-only">
    Line chart showing repository star count from January 1, 2024 to November 2, 2025.
    Current total: 1,234 stars. Peak growth: 45 new stars on February 15, 2025.
  </div>
</div>
```

**BarChart**:
```
<div role="img" aria-label="Top contributors by commit count">
  <ResponsiveContainer>
    <BarChart aria-describedby="contributors-chart-desc">
      {/* Chart components */}
    </BarChart>
  </ResponsiveContainer>
  <div id="contributors-chart-desc" className="sr-only">
    Horizontal bar chart showing top 10 contributors.
    Leading contributor: alice with 234 commits (55% of total).
  </div>
</div>
```

**RadarChart**:
```
<div role="img" aria-label="Package quality scores">
  <ResponsiveContainer>
    <RadarChart aria-describedby="quality-chart-desc">
      {/* Chart components */}
    </RadarChart>
  </ResponsiveContainer>
  <div id="quality-chart-desc" className="sr-only">
    Radar chart showing quality metrics for React package.
    Code Quality: 92/100, Popularity: 78/100, Maintenance: 91/100, Overall: 87/100.
  </div>
</div>
```

---

#### Interactive Element ARIA

**Tooltips**:
```
<Tooltip
  role="tooltip"
  aria-live="polite"
  aria-atomic="true"
/>
```

When tooltip appears, content is announced to screen readers.

**Legend Items**:
```
<Legend>
  <LegendItem
    role="button"
    aria-pressed={isVisible}
    aria-label="Toggle React data series"
    tabIndex={0}
  />
</Legend>
```

**Clickable Chart Elements**:
```
<Bar
  role="button"
  aria-label="alice - 234 commits - click for details"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={handleKeyPress}
/>
```

---

### Keyboard Navigation

#### Focus Management

**Tab Order**:
1. Chart container (receives focus)
2. Interactive legend items
3. Brush handles (if present)
4. Data points (if individually interactive)

**Focus Indicators**:
- Visible focus ring using Salt DS focus token
- Minimum 2px outline with high contrast
- Clear distinction from hover state

---

#### Keyboard Shortcuts

**General Navigation**:
- `Tab`: Move focus between chart elements
- `Shift + Tab`: Move focus backward
- `Enter / Space`: Activate focused element (click handler)
- `Escape`: Dismiss tooltip, exit drill-down view

**Data Point Navigation** (for AreaChart, LineChart, BarChart):
- `Arrow Right`: Move to next data point
- `Arrow Left`: Move to previous data point
- `Home`: Jump to first data point
- `End`: Jump to last data point
- `Enter`: Activate click handler for focused point

**Legend Interaction**:
- `Space`: Toggle series visibility
- `Arrow Down / Up`: Navigate between legend items (vertical legend)
- `Arrow Right / Left`: Navigate between legend items (horizontal legend)

**Brush Control**:
- `Tab`: Focus brush start handle
- `Arrow Right / Left`: Move handle by single increment
- `Shift + Arrow`: Move handle by larger increment (10x)
- `Tab`: Move to end handle

---

### Data Table Alternative

#### Purpose

Provide a text-based alternative to visual charts for users who cannot perceive graphics or prefer tabular data.

#### Implementation

Every chart widget should offer a "View as Table" toggle or link that displays the underlying data in an accessible Salt DS `Table` component.

**Table Structure**:
```
Time Series Data:
  Columns: Date | Value | Change
  Rows: Each data point
  Sorting: Enabled by column
  Pagination: If > 50 rows

Categorical Data:
  Columns: Category | Value | Percentage
  Rows: Each category
  Sorting: Enabled by column

Multi-Dimensional Data:
  Columns: Dimension | Value
  Rows: Each dimension
  Nested rows: For multi-dataset comparison
```

**Accessibility Features**:
- Semantic `<table>` with `<thead>`, `<tbody>`
- Column headers with `scope="col"`
- Row headers with `scope="row"` (if applicable)
- Caption describing table content
- Sortable columns with ARIA sort indicators

**Example**:
```html
<table>
  <caption>Repository stars over time (January 2024 - November 2025)</caption>
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Stars</th>
      <th scope="col">Change</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">2024-01-01</th>
      <td>1,000</td>
      <td>+50</td>
    </tr>
    <!-- More rows -->
  </tbody>
</table>
```

---

### Reduced Motion Support

#### Respect User Preferences

Detect user's motion preferences using CSS media query:
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations */
}
```

**Implementation in Recharts**:
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<AreaChart isAnimationActive={!prefersReducedMotion}>
  {/* Chart components */}
</AreaChart>
```

**Animation Adjustments**:
- **Full motion**: Smooth transitions, animated loading
- **Reduced motion**: Instant rendering, no transitions, disable `isAnimationActive`

**Chart Elements Affected**:
- Initial render animations
- Data update transitions
- Brush drag animations
- Tooltip fade in/out
- Legend toggle transitions

---

### Screen Reader Announcements

#### Live Regions

Use ARIA live regions to announce dynamic chart updates:

**Data Update**:
```html
<div aria-live="polite" aria-atomic="true" className="sr-only">
  Chart updated. New data shows 1,234 stars as of November 2, 2025.
</div>
```

**Filter Applied**:
```html
<div aria-live="assertive" aria-atomic="true" className="sr-only">
  Filter applied. Showing data for last 30 days. 567 stars gained.
</div>
```

**Error State**:
```html
<div aria-live="assertive" role="alert" className="sr-only">
  Error loading chart data. Please try again.
</div>
```

---

### Accessible Color Scales

#### Heatmap Accessibility

For heatmaps and color-intensity visualizations:

**Multi-Channel Encoding**:
- **Primary**: Color intensity (light to dark)
- **Secondary**: Numeric value in cell (text)
- **Tertiary**: Border thickness or pattern

**Color Scale Design**:
- Use perceptually uniform color scale (e.g., viridis, plasma)
- Ensure each step has 3:1 contrast with adjacent steps
- Provide legend showing color-to-value mapping
- Include numeric labels on cells for precise values

**Example Heatmap Cell**:
```
Cell Background: Color from scale based on value
Cell Text: Numeric value (e.g., "23")
Cell Border: Thicker for high values (optional)
Cell Pattern: Diagonal lines for highest quartile (optional)
```

---

## Salt Design System Integration

### Color Token Mapping

#### Chart Color Palette

All chart colors must use Salt DS design tokens to ensure consistency across the application and support for theming (light/dark mode).

**Primary Data Series Colors**:

| Use Case | Light Mode Token | Light Mode Hex | Dark Mode Token | Dark Mode Hex |
|----------|------------------|----------------|-----------------|---------------|
| Primary series (default) | `--salt-color-blue-500` | #2563EB | `--salt-color-blue-400` | #3B82F6 |
| Secondary series | `--salt-color-green-500` | #10B981 | `--salt-color-green-400` | #34D399 |
| Tertiary series | `--salt-color-orange-500` | #F97316 | `--salt-color-orange-400` | #FB923C |
| Quaternary series | `--salt-color-purple-500` | #8B5CF6 | `--salt-color-purple-400` | #A78BFA |
| Neutral series | `--salt-color-gray-500` | #6B7280 | `--salt-color-gray-400` | #9CA3AF |

**Note**: Salt DS uses a semantic token system. Exact token names should be verified from official Salt DS documentation. Above tokens are examples based on common design system patterns.

---

#### Semantic Color Usage

**Positive / Success**:
- Use case: Growth indicators, positive trends, success states
- Token: `--salt-color-green-500` (light), `--salt-color-green-400` (dark)
- Example: Upward trend arrow, positive change values

**Negative / Error**:
- Use case: Decline indicators, negative trends, error states
- Token: `--salt-color-red-500` (light), `--salt-color-red-400` (dark)
- Example: Downward trend arrow, negative change values

**Warning / Caution**:
- Use case: Threshold warnings, moderate states
- Token: `--salt-color-orange-500` (light), `--salt-color-orange-400` (dark)
- Example: Nearing rate limit, deprecation warnings

**Informational / Neutral**:
- Use case: General information, neutral states
- Token: `--salt-color-blue-500` (light), `--salt-color-blue-400` (dark)
- Example: Informational tooltips, default chart elements

---

#### Background and Surface Colors

**Chart Backgrounds**:
- Light mode: `--salt-color-white` or `--salt-palette-neutral-background`
- Dark mode: `--salt-color-gray-900` or `--salt-palette-neutral-background-dark`

**Widget Container**:
- Light mode: `--salt-palette-surface` (typically white with subtle shadow)
- Dark mode: `--salt-palette-surface-dark`

**Grid Lines**:
- Light mode: `--salt-color-gray-200` with opacity 0.5
- Dark mode: `--salt-color-gray-700` with opacity 0.3

**Axis Lines**:
- Light mode: `--salt-color-gray-400`
- Dark mode: `--salt-color-gray-600`

---

### Typography Integration

#### Font Family

Use Salt DS font stack for all chart text elements:

```css
font-family: var(--salt-text-fontFamily);
```

**Default**: Typically "Open Sans", "Helvetica Neue", sans-serif (verify with Salt DS docs)

---

#### Font Size Scales

Map chart text elements to Salt DS typography tokens:

**Axis Labels**:
```css
font-size: var(--salt-text-fontSize-small);  /* Typically 12px */
font-weight: var(--salt-text-fontWeight-regular);  /* 400 */
```

**Chart Title**:
```css
font-size: var(--salt-text-fontSize-medium);  /* Typically 14px */
font-weight: var(--salt-text-fontWeight-semibold);  /* 600 */
```

**Tooltip Text**:
```css
font-size: var(--salt-text-fontSize-small);  /* 12px */
font-weight: var(--salt-text-fontWeight-regular);
```

**Tooltip Title**:
```css
font-size: var(--salt-text-fontSize-medium);  /* 14px */
font-weight: var(--salt-text-fontWeight-semibold);
```

**Legend Labels**:
```css
font-size: var(--salt-text-fontSize-small);  /* 12px */
font-weight: var(--salt-text-fontWeight-regular);
```

**Data Labels** (on chart elements):
```css
font-size: var(--salt-text-fontSize-xsmall);  /* 11px */
font-weight: var(--salt-text-fontWeight-medium);  /* 500 */
```

---

#### Text Color Tokens

**Primary Text** (axis labels, legend labels):
```css
color: var(--salt-color-text-primary);
```

**Secondary Text** (grid labels, secondary info):
```css
color: var(--salt-color-text-secondary);
```

**Disabled Text**:
```css
color: var(--salt-color-text-disabled);
```

---

### Spacing and Layout

#### Chart Margins

Use Salt DS spacing tokens for consistent margins around chart elements:

**Widget Padding** (space between widget border and chart):
```css
padding: var(--salt-spacing-200);  /* Typically 16px */
```

**Chart Margins** (space for axes and labels):
```typescript
const chartMargin = {
  top: parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--salt-spacing-100')),    // 8px
  right: parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--salt-spacing-200')),    // 16px
  bottom: parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--salt-spacing-150')),    // 12px
  left: parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--salt-spacing-200'))     // 16px
};

<AreaChart margin={chartMargin}>
  {/* Chart components */}
</AreaChart>
```

**Legend Spacing**:
```css
margin-top: var(--salt-spacing-100);  /* 8px between chart and legend */
gap: var(--salt-spacing-75);  /* 6px between legend items */
```

**Tooltip Padding**:
```css
padding: var(--salt-spacing-100) var(--salt-spacing-150);  /* 8px vertical, 12px horizontal */
```

---

#### Grid Spacing

**Grid Line Spacing**:
Use Recharts automatic tick calculation, but ensure sufficient space between lines for readability:

```typescript
<YAxis
  tickCount={6}  // Results in 5 grid lines between min and max
  minTickGap={40}  // Minimum 40px between ticks
/>
```

---

### Salt DS Component Integration

#### Widget Container

Wrap each chart in a Salt DS `Card` component for consistent styling:

```typescript
import { Card } from '@salt-ds/core';

<Card>
  <Card.Header>
    <h3>{widgetTitle}</h3>
  </Card.Header>
  <Card.Content>
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        {/* Chart components */}
      </AreaChart>
    </ResponsiveContainer>
  </Card.Content>
  <Card.Actions>
    {/* Widget actions: configure, remove, etc. */}
  </Card.Actions>
</Card>
```

---

#### Tooltips

For custom tooltips, use Salt DS `Tooltip` or `Popover` components (if compatible with Recharts):

**Option 1: Custom HTML Tooltip with Salt DS Styling**
```typescript
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="salt-tooltip" style={{
      backgroundColor: 'var(--salt-palette-surface)',
      border: '1px solid var(--salt-color-gray-300)',
      borderRadius: 'var(--salt-radius-small)',
      padding: 'var(--salt-spacing-100)',
      boxShadow: 'var(--salt-shadow-medium)'
    }}>
      <p style={{
        fontSize: 'var(--salt-text-fontSize-small)',
        fontWeight: 'var(--salt-text-fontWeight-semibold)',
        color: 'var(--salt-color-text-primary)',
        marginBottom: 'var(--salt-spacing-50)'
      }}>
        {label}
      </p>
      {payload.map((entry, index) => (
        <p key={index} style={{
          fontSize: 'var(--salt-text-fontSize-small)',
          color: 'var(--salt-color-text-secondary)'
        }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};
```

**Option 2: Recharts 3.x Portal with Salt DS Component**
```typescript
<Tooltip
  content={<CustomTooltip />}
  portal={{ target: document.body }}  // Render in portal for better positioning
/>
```

---

#### Buttons and Controls

For chart controls (e.g., time range selector, data export), use Salt DS `Button` component:

```typescript
import { Button } from '@salt-ds/core';

<Button variant="secondary" size="small" onClick={handleExport}>
  Export Data
</Button>

<Button variant="primary" size="small" onClick={handleRefresh}>
  Refresh
</Button>
```

---

### Theme Support (Light / Dark Mode)

#### Implementation Strategy

All color tokens automatically adapt to light/dark mode when Salt DS theme is applied at the application level.

**Theme Provider Setup**:
```typescript
import { SaltProvider } from '@salt-ds/core';

<SaltProvider mode={theme}>  {/* theme: 'light' or 'dark' */}
  <Dashboard>
    {/* Widgets with charts */}
  </Dashboard>
</SaltProvider>
```

**Chart Color Adaptation**:
All chart colors defined using Salt DS tokens will automatically switch between light and dark variants when theme changes. No additional logic required in chart components.

**Custom Color Handling**:
If using custom colors not from Salt DS tokens, implement theme-aware color selection:

```typescript
const getChartColor = (theme: 'light' | 'dark') => {
  return theme === 'light'
    ? '#3B82F6'  // Light mode blue
    : '#60A5FA';  // Dark mode blue (lighter for dark backgrounds)
};
```

---

### Gradient Fills

Use Salt DS colors for gradient fills in AreaCharts:

```typescript
<defs>
  <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stopColor="var(--salt-color-blue-500)"
      stopOpacity={0.8}
    />
    <stop
      offset="95%"
      stopColor="var(--salt-color-blue-500)"
      stopOpacity={0.1}
    />
  </linearGradient>
</defs>

<Area
  type="monotone"
  dataKey="stars"
  stroke="var(--salt-color-blue-500)"
  fill="url(#colorStars)"
/>
```

---

## Performance Optimization

### Large Dataset Handling

#### Data Downsampling

**Purpose**: Reduce number of data points rendered while maintaining visual fidelity

**Strategy**:
- **Threshold**: If dataset > 100 points, apply downsampling
- **Algorithm**: Largest Triangle Three Buckets (LTTB) - preserves peaks and valleys
- **Responsive**: More aggressive downsampling on mobile

**Implementation Approach**:
```typescript
function downsampleData(data: TimeSeriesDataPoint[], targetPoints: number): TimeSeriesDataPoint[] {
  if (data.length <= targetPoints) return data;

  // LTTB algorithm:
  // 1. Always keep first and last points
  // 2. Divide remaining data into buckets
  // 3. Select point in each bucket that forms largest triangle with neighbors

  // Simplified: Every Nth point
  const interval = Math.ceil(data.length / targetPoints);
  return data.filter((_, index) => index % interval === 0);
}
```

**Downsampling Targets**:
- Desktop: 200 points max
- Tablet: 150 points max
- Mobile: 100 points max

---

#### Data Aggregation

**Purpose**: Reduce granularity for long time ranges

**Strategy**:
- Daily data → Weekly aggregation for > 90 days
- Weekly data → Monthly aggregation for > 52 weeks

**Aggregation Methods**:
- **Sum**: For cumulative metrics (downloads, stars)
- **Average**: For rate metrics (daily active users)
- **Max**: For peak metrics (highest concurrent users)
- **Min**: For minimum thresholds

**Example**:
```typescript
function aggregateToWeekly(dailyData: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] {
  const weeklyData: Map<string, number> = new Map();

  dailyData.forEach(point => {
    const week = getISOWeek(point.timestamp);
    weeklyData.set(week, (weeklyData.get(week) || 0) + point.value);
  });

  return Array.from(weeklyData.entries()).map(([week, value]) => ({
    timestamp: getTimestampFromWeek(week),
    date: week,
    displayDate: `Week ${week}`,
    value,
    metadata: { aggregation: 'weekly' }
  }));
}
```

---

#### Virtualization for Long Lists

For widgets displaying many items (e.g., contributor lists with 100+ contributors):

**Strategy**: Use virtual scrolling library (e.g., react-window, react-virtualized)

**Implementation**:
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={contributors.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ContributorItem data={contributors[index]} />
    </div>
  )}
</FixedSizeList>
```

**Benefits**:
- Only render visible items (e.g., 10 items visible, 1000 items total)
- Smooth scrolling performance
- Reduced memory footprint

---

### Animation Performance

#### Selective Animation

**Strategy**: Enable animations for visual appeal but disable for performance-critical scenarios

**Animation Settings**:
```typescript
const shouldAnimate = !prefersReducedMotion && dataPoints.length < 100;

<AreaChart isAnimationActive={shouldAnimate} animationDuration={500}>
  {/* Chart components */}
</AreaChart>
```

**Conditional Animation Rules**:
- Disable animations if > 100 data points
- Disable animations on mobile (performance constraint)
- Disable animations if user prefers reduced motion
- Disable animations during rapid data updates

---

#### Animation Optimization

**Easing Functions**:
Use efficient easing for smooth animations:
```typescript
<Area
  animationEasing="ease-in-out"  // Smoother than 'linear'
  animationDuration={400}  // Shorter = more responsive
/>
```

**Animation Properties**:
- Avoid animating too many properties simultaneously
- Prefer transform and opacity (GPU-accelerated)
- Avoid animating width/height (triggers reflow)

---

### Render Optimization

#### React.memo for Chart Components

**Strategy**: Memoize chart components to prevent unnecessary re-renders

```typescript
import React, { memo } from 'react';

const StarsTrendChart = memo(({ data, config }: StarsTrendChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        {/* Chart components */}
      </AreaChart>
    </ResponsiveContainer>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if data or config changes
  return (
    prevProps.data === nextProps.data &&
    prevProps.config === nextProps.config
  );
});
```

---

#### Lazy Loading Charts

**Strategy**: Load charts only when they enter the viewport

```typescript
import { lazy, Suspense } from 'react';
import { useInView } from 'react-intersection-observer';

const StarsTrendChart = lazy(() => import('./StarsTrendChart'));

const WidgetContainer = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div ref={ref}>
      {inView && (
        <Suspense fallback={<ChartSkeleton />}>
          <StarsTrendChart data={data} />
        </Suspense>
      )}
    </div>
  );
};
```

**Benefits**:
- Reduce initial page load time
- Load charts as user scrolls
- Prioritize above-the-fold content

---

#### Debounce Resize Events

**Strategy**: Prevent excessive re-renders during window resize

```typescript
import { useDebouncedCallback } from 'use-debounce';

const ChartWidget = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleResize = useDebouncedCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, 200);  // Wait 200ms after last resize event

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <ResponsiveContainer>
      {/* Chart */}
    </ResponsiveContainer>
  );
};
```

---

### Memory Management

#### Data Cleanup

**Strategy**: Clear stale data and references when widgets unmount

```typescript
useEffect(() => {
  // Fetch data
  fetchChartData();

  return () => {
    // Cleanup on unmount
    cancelPendingRequests();
    clearDataCache();
  };
}, []);
```

---

#### Limit Cached Data

**Strategy**: Implement LRU (Least Recently Used) cache for chart data

```typescript
const DATA_CACHE_SIZE = 50;  // Store max 50 datasets
const dataCache = new Map();

function cacheData(key: string, data: any) {
  if (dataCache.size >= DATA_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = dataCache.keys().next().value;
    dataCache.delete(firstKey);
  }
  dataCache.set(key, data);
}
```

---

#### Avoid Memory Leaks

**Common Pitfalls**:
1. Event listeners not removed on unmount
2. Intervals/timers not cleared
3. References to large datasets in closures

**Prevention**:
```typescript
useEffect(() => {
  const timerId = setInterval(refreshData, 60000);

  return () => {
    clearInterval(timerId);  // Always clear timers
  };
}, []);
```

---

### Code Splitting

**Strategy**: Split chart components into separate bundles

```typescript
// Dynamic import for each chart type
const AreaChartComponent = lazy(() => import('./charts/AreaChartComponent'));
const BarChartComponent = lazy(() => import('./charts/BarChartComponent'));
const RadarChartComponent = lazy(() => import('./charts/RadarChartComponent'));

// Load only the chart type needed for each widget
<Suspense fallback={<ChartSkeleton />}>
  {widgetType === 'stars-trend' && <AreaChartComponent {...props} />}
  {widgetType === 'contributors' && <BarChartComponent {...props} />}
</Suspense>
```

**Benefits**:
- Smaller initial bundle size
- Faster initial page load
- Charts loaded on demand

---

## Component Configuration Specifications

### Repository Stars Timeline (AreaChart)

**Purpose**: Visualize repository star growth over time

**Recharts Configuration**:
```typescript
<ResponsiveContainer width="100%" height={400}>
  <AreaChart
    data={timeSeriesData}
    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
  >
    <defs>
      <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="var(--salt-color-blue-500)" stopOpacity={0.8} />
        <stop offset="95%" stopColor="var(--salt-color-blue-500)" stopOpacity={0.1} />
      </linearGradient>
    </defs>

    <CartesianGrid
      strokeDasharray="3 3"
      stroke="var(--salt-color-gray-300)"
      opacity={0.3}
    />

    <XAxis
      dataKey="displayDate"
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12, fontFamily: 'var(--salt-text-fontFamily)' }}
      tickLine={false}
    />

    <YAxis
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12, fontFamily: 'var(--salt-text-fontFamily)' }}
      tickLine={false}
      tickFormatter={(value) => value.toLocaleString()}
    />

    <Tooltip content={<CustomStarsTooltip />} />

    <ReferenceLine
      y={currentStarCount}
      stroke="var(--salt-color-blue-700)"
      strokeDasharray="5 5"
      label="Current"
    />

    <Area
      type="monotone"
      dataKey="value"
      stroke="var(--salt-color-blue-500)"
      strokeWidth={2}
      fill="url(#colorStars)"
      animationDuration={600}
    />

    <Brush
      dataKey="displayDate"
      height={30}
      stroke="var(--salt-color-blue-500)"
    />
  </AreaChart>
</ResponsiveContainer>
```

**Custom Tooltip Component**:
```typescript
interface StarsTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: TimeSeriesDataPoint }>;
  label?: string;
}

const CustomStarsTooltip: React.FC<StarsTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const newStars = data.metadata?.newStars || 0;
  const growthRate = data.metadata?.growthRate || '0%';

  return (
    <div style={{
      backgroundColor: 'var(--salt-palette-surface)',
      border: '1px solid var(--salt-color-gray-300)',
      borderRadius: '4px',
      padding: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <p style={{ fontWeight: 600, marginBottom: '8px' }}>{data.date}</p>
      <p>Total Stars: {payload[0].value.toLocaleString()}</p>
      <p>New Stars: +{newStars}</p>
      <p>Growth: {growthRate}</p>
    </div>
  );
};
```

**Responsive Breakpoints**:
- Mobile: Height 200px, hide Brush, show every 3rd X-axis label
- Tablet: Height 300px, show Brush
- Desktop: Height 400px, all features enabled

---

### Package Download Trends (AreaChart Multi-Series)

**Purpose**: Compare download trends across multiple packages

**Recharts Configuration**:
```typescript
<ResponsiveContainer width="100%" height={400}>
  <AreaChart
    data={multiPackageTimeSeriesData}
    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
  >
    <defs>
      {packages.map((pkg, index) => (
        <linearGradient key={pkg.id} id={`color${pkg.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={pkg.color} stopOpacity={0.6} />
          <stop offset="95%" stopColor={pkg.color} stopOpacity={0.05} />
        </linearGradient>
      ))}
    </defs>

    <CartesianGrid strokeDasharray="3 3" stroke="var(--salt-color-gray-300)" opacity={0.3} />

    <XAxis
      dataKey="displayDate"
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12 }}
    />

    <YAxis
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12 }}
      tickFormatter={(value) => formatNumberForDisplay(value)}
    />

    <Tooltip content={<CustomDownloadsTooltip />} />

    <Legend
      verticalAlign="top"
      height={36}
      iconType="line"
    />

    {packages.map((pkg) => (
      <Area
        key={pkg.id}
        type="monotone"
        dataKey={pkg.id}
        name={pkg.displayName}
        stroke={pkg.color}
        strokeWidth={2}
        fill={`url(#color${pkg.id})`}
        stackId={isStacked ? '1' : undefined}
      />
    ))}

    <Brush dataKey="displayDate" height={30} />
  </AreaChart>
</ResponsiveContainer>
```

**Data Format**:
```typescript
// Multi-package data merged by date
[
  {
    displayDate: 'Jan 15',
    react: 1200000,
    vue: 800000,
    angular: 600000,
    metadata: { ... }
  },
  // More dates...
]
```

**Stacked vs Overlay Mode**:
- Stacked: Show total downloads across all packages (use `stackId="1"`)
- Overlay: Show individual package trends (no `stackId`)

---

### Contributor Ranking (BarChart Horizontal)

**Purpose**: Display top contributors by commit count

**Recharts Configuration**:
```typescript
<ResponsiveContainer width="100%" height={Math.max(300, contributors.length * 40)}>
  <BarChart
    data={contributorData}
    layout="vertical"
    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" stroke="var(--salt-color-gray-300)" opacity={0.3} />

    <XAxis
      type="number"
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12 }}
    />

    <YAxis
      type="category"
      dataKey="displayName"
      stroke="var(--salt-color-text-secondary)"
      tick={<CustomContributorTick />}
      width={90}
    />

    <Tooltip content={<CustomContributorTooltip />} />

    <Bar
      dataKey="value"
      fill="var(--salt-color-blue-500)"
      radius={[0, 4, 4, 0]}
    >
      {contributorData.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={entry.color || 'var(--salt-color-blue-500)'}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

**Custom Y-Axis Tick with Avatar**:
```typescript
const CustomContributorTick = ({ x, y, payload }) => {
  const contributor = contributorData.find(c => c.displayName === payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <image
        href={contributor?.metadata?.avatarUrl}
        x={-85}
        y={-12}
        width={24}
        height={24}
        clipPath="circle(12px at 12px 12px)"
      />
      <text
        x={-55}
        y={0}
        dy={4}
        textAnchor="start"
        fill="var(--salt-color-text-primary)"
        fontSize={12}
      >
        {payload.value}
      </text>
    </g>
  );
};
```

---

### Pull Request Activity (BarChart Grouped)

**Purpose**: Show PR metrics by time period or state

**Recharts Configuration**:
```typescript
<ResponsiveContainer width="100%" height={400}>
  <BarChart
    data={prActivityData}
    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" stroke="var(--salt-color-gray-300)" opacity={0.3} />

    <XAxis
      dataKey="category"  // e.g., "Week 1", "Week 2"
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12 }}
    />

    <YAxis
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12 }}
    />

    <Tooltip content={<CustomPRTooltip />} />

    <Legend />

    <Bar
      dataKey="open"
      name="Open PRs"
      fill="var(--salt-color-blue-500)"
      radius={[4, 4, 0, 0]}
    />
    <Bar
      dataKey="merged"
      name="Merged PRs"
      fill="var(--salt-color-green-500)"
      radius={[4, 4, 0, 0]}
    />
    <Bar
      dataKey="closed"
      name="Closed PRs"
      fill="var(--salt-color-red-500)"
      radius={[4, 4, 0, 0]}
    />
  </BarChart>
</ResponsiveContainer>
```

**Data Format**:
```typescript
[
  {
    category: 'Week 1',
    open: 12,
    merged: 8,
    closed: 3
  },
  // More weeks...
]
```

---

### Package Quality Score (RadarChart)

**Purpose**: Visualize multi-dimensional quality metrics

**Recharts Configuration**:
```typescript
<ResponsiveContainer width="100%" height={400}>
  <RadarChart
    data={qualityDimensionsData}
    margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
  >
    <PolarGrid stroke="var(--salt-color-gray-300)" />

    <PolarAngleAxis
      dataKey="displayName"
      tick={{ fontSize: 12, fill: 'var(--salt-color-text-primary)' }}
    />

    <PolarRadiusAxis
      angle={90}
      domain={[0, 100]}
      tick={{ fontSize: 10 }}
    />

    <Tooltip content={<CustomQualityTooltip />} />

    <Legend />

    {packages.map((pkg, index) => (
      <Radar
        key={pkg.id}
        name={pkg.displayName}
        dataKey="value"
        data={pkg.data}
        stroke={pkg.color}
        fill={pkg.color}
        fillOpacity={0.3}
      />
    ))}
  </RadarChart>
</ResponsiveContainer>
```

**Data Format**:
```typescript
// Single package quality data
[
  { dimension: 'quality', displayName: 'Code Quality', value: 92 },
  { dimension: 'popularity', displayName: 'Popularity', value: 78 },
  { dimension: 'maintenance', displayName: 'Maintenance', value: 91 },
  { dimension: 'overall', displayName: 'Overall Score', value: 87 }
]
```

---

### Release Timeline (ScatterChart)

**Purpose**: Visualize release events over time

**Recharts Configuration**:
```typescript
<ResponsiveContainer width="100%" height={400}>
  <ScatterChart
    margin={{ top: 20, right: 30, bottom: 40, left: 20 }}
  >
    <CartesianGrid strokeDasharray="3 3" stroke="var(--salt-color-gray-300)" opacity={0.3} />

    <XAxis
      dataKey="x"
      name="Date"
      type="number"
      domain={['dataMin', 'dataMax']}
      tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12 }}
      angle={-45}
      textAnchor="end"
    />

    <YAxis
      dataKey="y"
      name="Version"
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12 }}
      label={{ value: 'Version', angle: -90, position: 'insideLeft' }}
    />

    <ZAxis
      dataKey="z"
      range={[100, 1000]}
      name="Downloads"
    />

    <Tooltip content={<CustomReleaseTooltip />} cursor={{ strokeDasharray: '3 3' }} />

    <Legend />

    <Scatter
      name="Releases"
      data={releaseData}
      fill="var(--salt-color-green-500)"
    >
      {releaseData.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={entry.color || 'var(--salt-color-green-500)'}
        />
      ))}
    </Scatter>
  </ScatterChart>
</ResponsiveContainer>
```

---

### Dependencies Overview (TreemapChart)

**Purpose**: Visualize dependency hierarchy and sizes

**Recharts Configuration**:
```typescript
<ResponsiveContainer width="100%" height={500}>
  <Treemap
    data={hierarchicalData}
    dataKey="value"
    stroke="var(--salt-color-white)"
    fill="var(--salt-color-blue-500)"
    content={<CustomTreemapContent />}
  >
    <Tooltip content={<CustomDependencyTooltip />} />
  </Treemap>
</ResponsiveContainer>
```

**Custom Treemap Content**:
```typescript
const CustomTreemapContent = (props) => {
  const { x, y, width, height, name, value, color } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: 'var(--salt-color-white)',
          strokeWidth: 2
        }}
      />
      {width > 50 && height > 30 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 7}
            textAnchor="middle"
            fill="var(--salt-color-white)"
            fontSize={12}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="var(--salt-color-white)"
            fontSize={10}
          >
            {formatNumberForDisplay(value)} KB
          </text>
        </>
      )}
    </g>
  );
};
```

---

### Repository/Package Comparison (BarChart Grouped)

**Purpose**: Compare metrics across multiple repositories or packages

**Recharts Configuration**:
```typescript
<ResponsiveContainer width="100%" height={400}>
  <BarChart
    data={comparisonData}
    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
  >
    <CartesianGrid strokeDasharray="3 3" stroke="var(--salt-color-gray-300)" opacity={0.3} />

    <XAxis
      dataKey="displayName"
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 11 }}
      angle={-45}
      textAnchor="end"
      height={80}
    />

    <YAxis
      stroke="var(--salt-color-text-secondary)"
      tick={{ fontSize: 12 }}
      tickFormatter={(value) => formatNumberForDisplay(value)}
    />

    <Tooltip content={<CustomComparisonTooltip />} />

    <Legend />

    {metrics.map((metric, index) => (
      <Bar
        key={metric.key}
        dataKey={metric.key}
        name={metric.displayName}
        fill={metric.color}
        radius={[4, 4, 0, 0]}
      />
    ))}
  </BarChart>
</ResponsiveContainer>
```

**Data Format**:
```typescript
// Comparison across repos/packages
[
  {
    category: 'react',
    displayName: 'React',
    stars: 210000,
    downloads: 12000000
  },
  {
    category: 'vue',
    displayName: 'Vue',
    stars: 205000,
    downloads: 8000000
  }
]
```

---

### Activity Heatmap (Custom SVG Implementation)

**Purpose**: Visualize activity patterns (day of week × hour or week × day)

**Note**: Recharts doesn't have native heatmap support. Recommend custom SVG implementation or external library.

**Alternative Approach with Recharts (Pseudo-Heatmap using Cell)**:
```typescript
// Not ideal, but possible with creative use of Bar chart and Cell
<ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={heatmapGridData}
    margin={{ top: 10, right: 10, left: 30, bottom: 30 }}
  >
    <XAxis dataKey="x" />
    <YAxis dataKey="y" />
    <Tooltip content={<CustomHeatmapTooltip />} />

    {/* Render each cell as a Bar with custom color */}
    {heatmapGridData.map((cell, index) => (
      <Bar key={index} dataKey="value" fill={cell.color} />
    ))}
  </BarChart>
</ResponsiveContainer>
```

**Recommended External Library**:
- `react-calendar-heatmap` for GitHub-style contribution graphs
- Custom SVG implementation using D3 for full control

**Custom SVG Heatmap Specification**:
```typescript
// Pseudo-code for custom heatmap
<svg width={gridWidth} height={gridHeight}>
  {heatmapData.map((cell) => (
    <rect
      key={`${cell.x}-${cell.y}`}
      x={cell.x * cellSize}
      y={cell.y * cellSize}
      width={cellSize}
      height={cellSize}
      fill={cell.color}
      stroke="var(--salt-color-white)"
      strokeWidth={2}
      rx={2}
      onClick={() => handleCellClick(cell)}
    />
  ))}
  <Tooltip ... />
</svg>
```

---

## Summary

This specification provides comprehensive guidance for implementing Recharts visualizations in the dashboard builder project. Key takeaways:

1. **Chart Type Selection**: 8 Recharts-based widgets + 4 non-chart widgets (tables/lists/cards)
2. **Data Transformation**: Standardized formats (TimeSeriesData, CategoricalData, etc.) with transformation specifications for each widget
3. **Responsive Design**: Breakpoint-specific configurations for mobile, tablet, desktop with adaptive heights, labels, and interactions
4. **Interactive Features**: Custom tooltips, click handlers, drill-downs, legend interactions, brush for zoom, reference lines/areas
5. **Accessibility**: WCAG 2.1 AA compliance with ARIA labels, keyboard navigation, data table alternatives, reduced motion support
6. **Salt DS Integration**: Use Salt DS tokens for colors, typography, spacing; wrap charts in Salt Card components
7. **Performance Optimization**: Data downsampling, lazy loading, animation controls, memoization, code splitting
8. **Component Configurations**: Detailed Recharts configurations for each widget type with code examples

**Implementation Priority**:
1. Start with core time-series charts (Stars Timeline, Download Trends)
2. Add comparison charts (Contributors, PR Activity)
3. Implement advanced visualizations (Radar, Treemap, Scatter)
4. Create custom implementations (Heatmap)

**Next Steps for Implementation Agents**:
- Use these specifications to build React components with TypeScript
- Implement data transformers following the defined interfaces
- Create responsive chart containers with Salt DS styling
- Build custom tooltip components with Salt DS design tokens
- Implement accessibility features (ARIA, keyboard nav)
- Add performance optimizations (lazy loading, memoization)

---

**Specification Version**: 1.0
**Last Updated**: 2025-11-02
**Total Lines**: 685
