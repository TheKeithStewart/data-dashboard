import { NextResponse } from 'next/server';

// Edge Runtime for low latency
export const runtime = 'edge';

/**
 * Health Check Endpoint
 *
 * Purpose: Verify deployment and application health
 * Used by: Monitoring systems, Vercel deployment verification
 *
 * @returns 200 OK with status and timestamp
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
