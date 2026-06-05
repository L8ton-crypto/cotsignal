import { ensureDb, sql } from '@/lib/db';
import { COMMODITIES } from '@/lib/commodities';
import { buildSnapshot, type Row } from '@/lib/percentile';
import { CommodityCard, type Card } from '@/components/CommodityCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function loadCards(): Promise<Card[]> {
  await ensureDb();
  const out: Card[] = [];
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
    out.push({
      key: c.key,
      name: c.name,
      category: c.category,
      snapshot: buildSnapshot(rows),
      rows: rows.length,
    });
  }
  return out;
}

export default async function HomePage() {
  const cards = await loadCards();
  const haveAny = cards.some(c => c.snapshot !== null);
  return (
    <div>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Where are the commercials right now</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Weekly CFTC Commitments of Traders positioning across 8 majors. Percentile rank of commercial net position vs the last 3 years.
          Extremes flag at the 10th and 90th percentiles. This is positioning data, not a buy or sell signal.
        </p>
      </section>

      {!haveAny && (
        <div className="rounded-lg border border-amber-900 bg-amber-950/40 p-4 text-sm text-amber-200">
          No CFTC data ingested yet. Trigger /api/cron or wait for the Friday 20:00 UTC schedule.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => (
          <CommodityCard key={card.key} card={card} />
        ))}
      </section>

      <section className="mt-10 rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="text-base font-semibold text-zinc-100">How to read the percentile</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          <li>90th percentile or higher: commercials are at their most-long position in 3 years. Often a contrary signal at major lows in physicals.</li>
          <li>10th percentile or lower: commercials are at their most-short position in 3 years. Often a contrary signal at major highs.</li>
          <li>Bootstrap: less than 26 weeks of history. Read the absolute net only, not the percentile.</li>
          <li>For E-mini S&P and Bitcoin futures the commercial label includes dealers and asset managers, so read positioning as crowd, not smart money.</li>
        </ul>
      </section>
    </div>
  );
}
