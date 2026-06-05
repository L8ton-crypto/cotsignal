import { NextResponse } from 'next/server';
import { ingestAll } from '@/lib/cot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function defaultSince(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 3);
  return d.toISOString().slice(0, 10);
}

async function handler(req: Request) {
  const url = new URL(req.url);
  const since = url.searchParams.get('since') || defaultSince();
  const results = await ingestAll(since);
  const totals = results.reduce(
    (a, r) => ({
      rows_seen: a.rows_seen + r.rows_seen,
      rows_inserted: a.rows_inserted + r.rows_inserted,
    }),
    { rows_seen: 0, rows_inserted: 0 }
  );
  return NextResponse.json({
    ok: true,
    since,
    totals,
    results,
  });
}

export const GET = handler;
export const POST = handler;
