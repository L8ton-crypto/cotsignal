import { NextResponse } from 'next/server';
import { ingestAll } from '@/lib/cot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function defaultSince(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 3);
  return d.toISOString().slice(0, 10);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function handler(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get('since');
  const since = raw && ISO_DATE.test(raw) ? raw : defaultSince();
  const results = await ingestAll(since);
  const totals = results.reduce(
    (a, r) => ({
      rows_seen: a.rows_seen + r.rows_seen,
      rows_inserted: a.rows_inserted + r.rows_inserted,
    }),
    { rows_seen: 0, rows_inserted: 0 }
  );
  return NextResponse.json({ ok: true, since, totals, results });
}

export const GET = handler;
export const POST = handler;
