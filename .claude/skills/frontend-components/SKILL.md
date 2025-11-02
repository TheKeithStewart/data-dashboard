---
name: frontend-components
description: This skill should be used when creating or modifying frontend dashboard components in the ClaudeCode Sentiment Monitor project. Specifically trigger this skill for tasks involving React 19 components, Next.js 15 App Router pages, shadcn/ui components, Recharts visualizations, SWR data fetching, or Tailwind CSS styling.
---

# Frontend Components Development

## Overview

Guide for developing dashboard components in the ClaudeCode Sentiment Monitor project using React 19, Next.js 15, shadcn/ui, Recharts, and Tailwind CSS.

## When to Use This Skill

Use this skill when:
- Creating new dashboard components
- Modifying existing components
- Adding charts or visualizations
- Implementing data fetching with SWR
- Styling components with Tailwind CSS
- Working with shadcn/ui components
- Adding modals or dialogs
- Debugging frontend issues

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5
- **UI Library**: shadcn/ui with Tailwind CSS 4
- **Charts**: Recharts 3
- **Data Fetching**: SWR 2.3.6 (30-second refresh intervals)
- **Working Directory**: All component development in `app/` directory

## Quick Start

### Component Template

Use the bundled template asset: `assets/component-template.tsx`

This provides the standard structure:
1. "use client" directive
2. State hooks
3. SWR data fetching
4. Loading state
5. Error state
6. Empty state
7. Main render with Card layout

Copy and customize for new components.

### Component Structure

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ComponentNameProps {
  timeRange: "7d" | "30d" | "90d";
  subreddit: string;
}

export function ComponentName({ timeRange, subreddit }: ComponentNameProps) {
  // 1. Hooks first
  const { data, error, isLoading } = useSWR(
    `/api/endpoint?range=${timeRange}&subreddit=${subreddit}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  // 2. Early returns for states
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!data) return null;

  // 3. Render
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>{/* Content */}</CardContent>
    </Card>
  );
}
```

## Data Fetching with SWR

**Standard pattern**:
```typescript
const { data, error, isLoading } = useSWR("/api/endpoint", fetcher, {
  refreshInterval: 30000, // 30-second refresh
  revalidateOnFocus: true,
});
```

**Conditional fetching** (dialogs/modals):
```typescript
const { data, error, isLoading } = useSWR(
  isOpen ? `/api/endpoint?param=${value}` : null,
  fetcher
);
```

**Type-safe fetching**:
```typescript
interface DataType {
  field: string;
}

const { data } = useSWR<DataType>("/api/endpoint", fetcher);
```

See `references/component-patterns.md` for more SWR patterns.

## Charts with Recharts

### Line Chart (Sentiment)

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format } from "date-fns";

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

### Bar Chart (Volume)

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

**Chart best practices**:
- Always wrap in `<ResponsiveContainer>`
- Use Tailwind CSS variables for colors: `hsl(var(--primary))`
- Format dates with `date-fns`
- Create custom tooltip components
- Use `onClick` for drill-down functionality

See `references/component-patterns.md` for more chart patterns.

## Sentiment Colors

**Standard color scheme** (used across all components):

- **Positive** (> 0.2): `text-emerald-600 bg-emerald-50`
- **Negative** (< -0.2): `text-rose-600 bg-rose-50`
- **Neutral** (-0.2 to 0.2): `text-slate-600 bg-slate-50`

**Sentiment Badge Component**:
```typescript
function getSentimentColor(sentiment: number): string {
  if (sentiment > 0.2) return "text-emerald-600 bg-emerald-50";
  if (sentiment < -0.2) return "text-rose-600 bg-rose-50";
  return "text-slate-600 bg-slate-50";
}

function SentimentBadge({ sentiment }: { sentiment: number }) {
  const colorClass = getSentimentColor(sentiment);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {sentiment > 0 ? "+" : ""}{sentiment.toFixed(2)}
    </span>
  );
}
```

## Dialogs and Modals

Use shadcn/ui Dialog with conditional SWR fetching:

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {isLoading && <p>Loading...</p>}
    {error && <p className="text-destructive">Error</p>}
    {data && <div className="space-y-4">{/* Content */}</div>}
  </DialogContent>
</Dialog>
```

**Best practices**:
- Use conditional fetching (only fetch when open)
- Add `max-h-[80vh] overflow-y-auto` for scrollable content
- Handle loading/error states within dialog

## State Management

**DashboardShell pattern** (centralized state):

```typescript
export function DashboardShell() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [subreddit, setSubreddit] = useState<string>("all");
  const [drillDownDate, setDrillDownDate] = useState<string | null>(null);

  return (
    <div>
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

**Rules**:
- Keep state in nearest common ancestor (DashboardShell)
- Pass state down as props (no context for small apps)
- Use callback props for child-to-parent communication
- Avoid prop drilling beyond 2-3 levels

## Styling with Tailwind CSS

**Common patterns**:
```typescript
// Spacing
className="space-y-4"               // Vertical spacing
className="flex gap-4"               // Horizontal spacing
className="grid grid-cols-2 gap-4"  // Grid layout

// Containers
className="max-w-4xl mx-auto"          // Centered
className="max-h-[80vh] overflow-y-auto"  // Scrollable

// Typography
className="text-sm text-muted-foreground"  // Secondary text
className="text-lg font-semibold"          // Heading
```

**Best practices**:
- Use shadcn/ui CSS variables: `hsl(var(--primary))`, `text-muted-foreground`
- Prefer `space-y-*` and `gap-*` over margins
- Use responsive classes: `md:grid-cols-2 lg:grid-cols-3`

## TypeScript Best Practices

**Always use explicit types**:

```typescript
// Component props
interface ChartProps {
  timeRange: "7d" | "30d" | "90d";
  subreddit: "all" | "ClaudeAI" | "ClaudeCode" | "Anthropic";
  onDateClick: (date: string) => void;
}

// API responses
interface DashboardData {
  dates: string[];
  sentiment: number[];
}

// Type SWR responses
const { data } = useSWR<DashboardData>("/api/endpoint", fetcher);
```

## Common UI Patterns

**CSV Export Button**:
```typescript
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

<Button onClick={() => window.open(`/api/export/csv?range=${timeRange}`, "_blank")} variant="outline" size="sm">
  <Download className="mr-2 h-4 w-4" />
  Export CSV
</Button>
```

**Loading Skeleton**:
```typescript
import { Skeleton } from "@/components/ui/skeleton";

if (isLoading) {
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
```

**Error Alert**:
```typescript
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Failed to load data. Please try again.</AlertDescription>
    </Alert>
  );
}
```

## Testing Components

```bash
cd app
npm run dev  # Start dev server on http://localhost:3000

# In browser DevTools:
# - Check Network tab for API calls
# - Verify SWR caching behavior
# - Test responsive design
# - Check for console errors
```

## Component Checklist

When creating/modifying a component:

- [ ] Explicit TypeScript interface for props
- [ ] SWR used for data fetching (not useEffect + fetch)
- [ ] Loading, error, and empty states handled
- [ ] Sentiment colors follow standard scheme
- [ ] Charts use ResponsiveContainer and custom tooltips
- [ ] Dates formatted with date-fns
- [ ] Tailwind classes use shadcn/ui CSS variables
- [ ] Exported as named export (not default)
- [ ] "use client" directive if using hooks

## Common Pitfalls

Avoid these mistakes:

1. **useEffect for data fetching** - Use SWR instead
2. **Hardcoded colors** - Use Tailwind CSS variables
3. **Missing loading states** - Users need feedback
4. **Mutating props** - Components should be pure
5. **Skipping TypeScript types** - Explicit types prevent errors
6. **Deep nesting** - Extract to separate files if > 100 lines
7. **Inline styles** - Use Tailwind classes exclusively

## Resources

- **shadcn/ui docs**: https://ui.shadcn.com/
- **Recharts docs**: https://recharts.org/
- **SWR docs**: https://swr.vercel.app/
- **Tailwind CSS docs**: https://tailwindcss.com/
- **date-fns docs**: https://date-fns.org/
- **Component Patterns**: See `references/component-patterns.md` in this skill

## Examples

See existing implementations in `app/components/dashboard/`:
- `DashboardShell.tsx` - State management and layout
- `SentimentChart.tsx` - Line chart with drill-down
- `VolumeChart.tsx` - Bar chart with custom tooltips
- `DrillDownDialog.tsx` - Modal with conditional fetching
