import { NextResponse } from 'next/server';
import { ensureDb, sql } from '@/lib/db';
import { COMMODITIES } from '@/lib/commodities';
import { buildSnapshot, type Row } from '@/lib/percentile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureDb();
  const out: Array<{ key: string; name: string; category: string; snapshot: ReturnType<typeof buildSnapshot> }> = [];
  for (const c of COMMODITIES) {
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
    out.push({ key: c.key, name: c.name, category: c.category, snapshot: buildSnapshot(rows) });
  }
  return NextResponse.json({ ok: true, commodities: out });
}
