## Component Patterns Reference

Detailed patterns and examples for frontend development in the ClaudeCode Sentiment Monitor.

### Sentiment Color Scheme

**Color classification thresholds**:
```typescript
const POSITIVE_THRESHOLD = 0.2;
const NEGATIVE_THRESHOLD = -0.2;
```

**Color mapping**:
- **Positive** (> 0.2): `text-emerald-600 bg-emerald-50`
- **Negative** (< -0.2): `text-rose-600 bg-rose-50`
- **Neutral** (-0.2 to 0.2): `text-slate-600 bg-slate-50`

**Helper function**:
```typescript
function getSentimentColor(sentiment: number): string {
  if (sentiment > 0.2) return "text-emerald-600 bg-emerald-50";
  if (sentiment < -0.2) return "text-rose-600 bg-rose-50";
  return "text-slate-600 bg-slate-50";
}
```

**Sentiment Badge Component**:
```typescript
function SentimentBadge({ sentiment }: { sentiment: number }) {
  const colorClass = getSentimentColor(sentiment);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {sentiment > 0 ? "+" : ""}{sentiment.toFixed(2)}
    </span>
  );
}
```

### SWR Data Fetching Patterns

**Basic usage**:
```typescript
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const { data, error, isLoading } = useSWR("/api/endpoint", fetcher, {
  refreshInterval: 30000, // Refresh every 30 seconds
  revalidateOnFocus: true,
});
```

**Conditional fetching** (modal/dialog):
```typescript
const { data, error, isLoading } = useSWR(
  isOpen ? `/api/drill-down?date=${date}` : null,
  fetcher
);
```

**Type-safe fetching**:
```typescript
interface DashboardData {
  sentiment: number[];
  dates: string[];
}

const { data, error, isLoading } = useSWR<DashboardData>(
  "/api/dashboard/data",
  fetcher
);
```

### Recharts Patterns

**Sentiment Line Chart**:
```typescript
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-background border rounded-lg p-2 shadow-lg">
      <p className="text-sm font-medium">{payload[0].payload.date}</p>
      <p className="text-sm">Sentiment: {payload[0].value.toFixed(2)}</p>
    </div>
  );
};

// Chart component
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data} onClick={(e) => e && onDateClick(e.activeLabel)}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis
      dataKey="date"
      tickFormatter={(date) => format(new Date(date), "MMM d")}
    />
    <YAxis domain={[-1, 1]} />
    <Tooltip content={<CustomTooltip />} />
    <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
    <Line
      type="monotone"
      dataKey="sentiment"
      stroke="hsl(var(--primary))"
      strokeWidth={2}
      dot={{ r: 4 }}
    />
  </LineChart>
</ResponsiveContainer>
```

**Bar Chart**:
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), "MMM d")} />
    <YAxis />
    <Tooltip content={<CustomTooltip />} />
    <Bar dataKey="totalCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### shadcn/ui Dialog Pattern

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {isLoading && <p>Loading...</p>}
    {error && <p className="text-destructive">Error loading data</p>}
    {data && (
      <div className="space-y-4">
        {/* Content */}
      </div>
    )}
  </DialogContent>
</Dialog>
```

### State Management in DashboardShell

```typescript
// DashboardShell.tsx - Centralized state
export function DashboardShell() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [subreddit, setSubreddit] = useState<string>("all");
  const [drillDownDate, setDrillDownDate] = useState<string | null>(null);

  return (
    <div>
      <Tabs value={subreddit} onValueChange={setSubreddit}>
        {/* Tabs */}
      </Tabs>

      <Select value={timeRange} onValueChange={setTimeRange}>
        {/* Selector */}
      </Select>

      <SentimentChart
        timeRange={timeRange}
        subreddit={subreddit}
        onDateClick={setDrillDownDate}
      />

      <DrillDownDialog
        open={!!drillDownDate}
        onOpenChange={(open) => !open && setDrillDownDate(null)}
        date={drillDownDate}
        subreddit={subreddit}
      />
    </div>
  );
}
```

### Common UI Patterns

**CSV Export Button**:
```typescript
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

<Button onClick={() => window.open(`/api/export/csv?range=${timeRange}`, "_blank")} variant="outline" size="sm">
  <Download className="mr-2 h-4 w-4" />
  Export CSV
</Button>
```

**Skeleton Loading**:
```typescript
import { Skeleton } from "@/components/ui/skeleton";

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

// Usage
if (isLoading) return <ChartSkeleton />;
```

**Error Alert**:
```typescript
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    {error.message || "Failed to load data. Please try again."}
  </AlertDescription>
</Alert>
```

### Tailwind Utility Classes

**Common patterns**:
```typescript
// Spacing
className="space-y-4"      // Vertical spacing between children
className="flex gap-4"      // Horizontal spacing with flexbox
className="grid grid-cols-2 gap-4"  // Grid layout

// Containers
className="max-w-4xl mx-auto"       // Centered container
className="max-h-[80vh] overflow-y-auto"  // Scrollable container

// Typography
className="text-sm text-muted-foreground"  // Secondary text
className="text-lg font-semibold"          // Heading

// Colors (use CSS variables)
className="bg-background text-foreground"
className="border border-border"
className="text-primary"
className="text-destructive"
```

### Date Formatting

```typescript
import { format } from "date-fns";

// Chart axis labels
format(new Date(date), "MMM d")  // "Jan 1"

// Full date display
format(new Date(date), "PPP")  // "January 1, 2024"

// ISO date for API
new Date().toISOString().split("T")[0]  // "2024-01-01"
```

### TypeScript Interface Patterns

```typescript
// Component props
interface ChartProps {
  timeRange: "7d" | "30d" | "90d";
  subreddit: "all" | "ClaudeAI" | "ClaudeCode" | "Anthropic";
  onDateClick: (date: string) => void;
}

// API response types
interface DashboardData {
  dates: string[];
  sentiment: number[];
  positiveCount: number[];
  negativeCount: number[];
  neutralCount: number[];
  totalCount: number[];
}

// Type guards
function isValidTimeRange(value: string): value is "7d" | "30d" | "90d" {
  return ["7d", "30d", "90d"].includes(value);
}
```

### Existing Components

**DashboardShell** (`components/dashboard/DashboardShell.tsx`):
- Main container and state management
- Tabs for subreddit selection
- Time range selector
- CSV export button
- Drill-down modal trigger

**SentimentChart** (`components/dashboard/SentimentChart.tsx`):
- Line chart for sentiment trends
- Custom tooltip with date/sentiment
- Clickable data points for drill-down
- Reference line at y=0

**VolumeChart** (`components/dashboard/VolumeChart.tsx`):
- Bar chart for discussion volume
- Custom tooltip with positive/negative/neutral breakdown
- Rounded corners on bars

**DrillDownDialog** (`components/dashboard/DrillDownDialog.tsx`):
- Modal for daily details
- Top 10 posts and 10 comments
- Sentiment badges
- External links to Reddit

**KeywordPanel** (`components/dashboard/KeywordPanel.tsx`):
- Placeholder implementation (to be completed)
- Should display top keywords with TF-IDF

### Component Directory Structure

```
app/
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── DashboardShell.tsx
│   │   ├── SentimentChart.tsx
│   │   ├── VolumeChart.tsx
│   │   ├── DrillDownDialog.tsx
│   │   └── KeywordPanel.tsx
│   └── ui/                  # shadcn/ui base components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── tabs.tsx
│       └── [others]
```
