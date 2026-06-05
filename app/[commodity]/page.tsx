import { notFound } from 'next/navigation';
import { ensureDb, sql } from '@/lib/db';
import { findCommodity, COMMODITIES } from '@/lib/commodities';
import { buildSnapshot, type Row } from '@/lib/percentile';
import { ZoneBadge } from '@/components/ZoneBadge';
import { HistoryChart } from '@/components/HistoryChart';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  return COMMODITIES.map(c => ({ commodity: c.key }));
}

type PageProps = { params: Promise<{ commodity: string }> };

function fmt(n: number): string { return n.toLocaleString('en-US'); }
function signed(n: number): string { return (n >= 0 ? '+' : '') + fmt(n); }

export default async function CommodityPage({ params }: PageProps) {
  const { commodity } = await params;
  const c = findCommodity(commodity);
  if (!c) notFound();

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

  const snapshot = buildSnapshot(rows);

  return (
    <div>
      <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300">&larr; back to dashboard</a>
      <header className="mt-2 mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
          <span className="text-xs text-zinc-500">{c.category} - {c.unit}</span>
        </div>
        {snapshot && <div className="mt-3"><ZoneBadge zone={snapshot.zone} /></div>}
      </header>

      {!snapshot && (
        <div className="rounded-lg border border-amber-900 bg-amber-950/40 p-4 text-sm text-amber-200">
          No data ingested for this commodity yet.
        </div>
      )}

      {snapshot && (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Report date" value={snapshot.date} />
            <Stat label="Open interest" value={fmt(snapshot.open_interest)} />
            <Stat
              label="Commercial net"
              value={signed(snapshot.commercial_net)}
              sub={snapshot.week_over_week ? `WoW ${signed(snapshot.week_over_week.commercial_net_delta)}` : 'WoW n/a'}
            />
            <Stat
              label="Percentile (3yr)"
              value={snapshot.commercial_net_percentile_3y === null ? `bootstrap ${snapshot.sample_size}wk` : `${snapshot.commercial_net_percentile_3y}th`}
            />
            <Stat label="Comm net as % of OI" value={`${snapshot.commercial_net_pct_oi}%`} />
            <Stat
              label="Noncomm net"
              value={signed(snapshot.noncommercial_net)}
              sub={snapshot.week_over_week ? `WoW ${signed(snapshot.week_over_week.noncommercial_net_delta)}` : 'WoW n/a'}
            />
            <Stat label="Noncomm net as % of OI" value={`${snapshot.noncommercial_net_pct_oi}%`} />
            <Stat label="History sample" value={`${snapshot.sample_size} weeks`} />
          </section>

          <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-base font-semibold">3-year history</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Net positions in contracts. Commercials in green, noncommercials in rose.
            </p>
            <div className="mt-4">
              <HistoryChart points={rows} />
            </div>
          </section>

          <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-base font-semibold">Context</h2>
            <p className="mt-2 text-sm text-zinc-300">{c.note}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-base font-medium text-zinc-100">{value}</div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
