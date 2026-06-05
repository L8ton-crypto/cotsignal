import type { Snapshot } from '@/lib/percentile';
import { ZoneBadge } from './ZoneBadge';

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function signed(n: number): string {
  return (n >= 0 ? '+' : '') + fmt(n);
}

export type Card = {
  key: string;
  name: string;
  category: string;
  snapshot: Snapshot | null;
  rows: number;
};

export function CommodityCard({ card }: { card: Card }) {
  const s = card.snapshot;
  return (
    <a
      href={`/${card.key}`}
      className="block rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-base font-medium text-zinc-100">{card.name}</div>
          <div className="text-xs text-zinc-500">{card.category}</div>
        </div>
        {s && <div className="text-xs text-zinc-500">{s.date}</div>}
      </div>
      {!s && (
        <div className="mt-3 text-sm text-zinc-500">No data yet.</div>
      )}
      {s && (
        <>
          <div className="mt-3"><ZoneBadge zone={s.zone} /></div>
          <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
            <dt className="text-zinc-500">Commercial net</dt>
            <dd className="text-right text-zinc-200">{signed(s.commercial_net)}</dd>
            <dt className="text-zinc-500">vs prior week</dt>
            <dd className="text-right text-zinc-200">
              {s.week_over_week ? signed(s.week_over_week.commercial_net_delta) : 'n/a'}
            </dd>
            <dt className="text-zinc-500">Percentile (3yr)</dt>
            <dd className="text-right text-zinc-200">
              {s.commercial_net_percentile_3y === null ? `bootstrap (${s.sample_size}wk)` : `${s.commercial_net_percentile_3y}th`}
            </dd>
            <dt className="text-zinc-500">Open interest</dt>
            <dd className="text-right text-zinc-200">{fmt(s.open_interest)}</dd>
          </dl>
        </>
      )}
    </a>
  );
}
