import { NextResponse } from 'next/server';
import { ensureDb, sql } from '@/lib/db';
import { findCommodity } from '@/lib/commodities';
import { buildSnapshot, type Row } from '@/lib/percentile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const c = findCommodity(key);
  if (!c) {
    return NextResponse.json({ ok: false, error: 'unknown commodity' }, { status: 404 });
  }
  await ensureDb();
  const rows = (await sql`
    SELECT report_date::text AS report_date,
           commercial_net::int AS commercial_net,
           noncommercial_net::int AS noncommercial_net,
           open_interest::int AS open_interest
    FROM cot_reports
    WHERE commodity_key = ${c.key}
      AND report_date >= NOW() - INTERVAL '3 years'
    ORDER BY report_date ASC
  `) as unknown as Row[];
  return NextResponse.json({
    ok: true,
    key: c.key,
    name: c.name,
    snapshot: buildSnapshot(rows),
    history: rows,
  });
}
