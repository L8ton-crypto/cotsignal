import { NextResponse } from 'next/server';
import { ensureDb, sql } from '@/lib/db';
import { COMMODITIES } from '@/lib/commodities';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureDb();
  const out: Array<{ commodity_key: string; rows: number; latest: string | null }> = [];
  for (const c of COMMODITIES) {
    const rows = (await sql`
      SELECT COUNT(*)::int AS rows, MAX(report_date)::text AS latest
      FROM cot_reports WHERE commodity_key = ${c.key}
    `) as unknown as Array<{ rows: number; latest: string | null }>;
    out.push({ commodity_key: c.key, rows: rows[0]?.rows ?? 0, latest: rows[0]?.latest ?? null });
  }
  const ok = out.every(r => r.rows > 0);
  return NextResponse.json({ ok, commodities: out });
}
