"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ComponentNameProps {
  timeRange: "7d" | "30d" | "90d";
  subreddit: string;
}

export function ComponentName({ timeRange, subreddit }: ComponentNameProps) {
  // 1. State hooks
  const [state, setState] = useState();

  // 2. Data fetching with SWR
  const { data, error, isLoading } = useSWR(
    `/api/endpoint?range=${timeRange}&subreddit=${subreddit}`,
    fetcher,
    { refreshInterval: 30000 } // 30-second refresh
  );

  // 3. Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 4. Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load data. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  // 5. Empty state
  if (!data) {
    return null;
  }

  // 6. Main render
  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content here */}
        <div className="space-y-4">
          {/* Add your content */}
        </div>
      </CardContent>
    </Card>
  );
}
