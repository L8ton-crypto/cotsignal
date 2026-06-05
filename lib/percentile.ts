export type Row = {
  report_date: string;
  commercial_net: number;
  noncommercial_net: number;
  open_interest: number;
};

export type Snapshot = {
  date: string;
  commercial_net: number;
  noncommercial_net: number;
  open_interest: number;
  commercial_net_pct_oi: number;
  noncommercial_net_pct_oi: number;
  commercial_net_percentile_3y: number | null;
  zone: 'extreme_long' | 'crowded_long' | 'neutral' | 'crowded_short' | 'extreme_short' | 'bootstrap';
  sample_size: number;
  week_over_week: {
    commercial_net_delta: number;
    noncommercial_net_delta: number;
  } | null;
};

function percentileRank(values: number[], target: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return Math.round((lo / sorted.length) * 100);
}

export function buildSnapshot(rows: Row[]): Snapshot | null {
  if (rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => (a.report_date < b.report_date ? -1 : 1));
  const latest = sorted[sorted.length - 1];
  const prior = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const sampleSize = sorted.length;
  const commNets = sorted.map(r => r.commercial_net);
  const percentile = sampleSize >= 26 ? percentileRank(commNets, latest.commercial_net) : null;

  let zone: Snapshot['zone'];
  if (percentile === null) {
    zone = 'bootstrap';
  } else if (percentile >= 90) {
    zone = 'extreme_long';
  } else if (percentile >= 75) {
    zone = 'crowded_long';
  } else if (percentile <= 10) {
    zone = 'extreme_short';
  } else if (percentile <= 25) {
    zone = 'crowded_short';
  } else {
    zone = 'neutral';
  }

  const oi = latest.open_interest > 0 ? latest.open_interest : 1;

  return {
    date: latest.report_date,
    commercial_net: latest.commercial_net,
    noncommercial_net: latest.noncommercial_net,
    open_interest: latest.open_interest,
    commercial_net_pct_oi: Math.round((latest.commercial_net / oi) * 1000) / 10,
    noncommercial_net_pct_oi: Math.round((latest.noncommercial_net / oi) * 1000) / 10,
    commercial_net_percentile_3y: percentile,
    zone,
    sample_size: sampleSize,
    week_over_week: prior
      ? {
          commercial_net_delta: latest.commercial_net - prior.commercial_net,
          noncommercial_net_delta: latest.noncommercial_net - prior.noncommercial_net,
        }
      : null,
  };
}

export function zoneLabel(zone: Snapshot['zone']): string {
  switch (zone) {
    case 'extreme_long': return 'Commercial extreme long (90th+ percentile of 3yr)';
    case 'crowded_long': return 'Commercial crowded long (75th+ percentile)';
    case 'extreme_short': return 'Commercial extreme short (10th- percentile)';
    case 'crowded_short': return 'Commercial crowded short (25th- percentile)';
    case 'neutral': return 'Neutral positioning vs 3yr range';
    case 'bootstrap': return 'Bootstrapping (need >=26 weeks history)';
  }
}

export function zoneColor(zone: Snapshot['zone']): string {
  switch (zone) {
    case 'extreme_long': return 'text-emerald-300 bg-emerald-900/40 border-emerald-700';
    case 'crowded_long': return 'text-emerald-300 bg-emerald-900/20 border-emerald-800';
    case 'extreme_short': return 'text-rose-300 bg-rose-900/40 border-rose-700';
    case 'crowded_short': return 'text-rose-300 bg-rose-900/20 border-rose-800';
    case 'neutral': return 'text-zinc-300 bg-zinc-800/40 border-zinc-700';
    case 'bootstrap': return 'text-amber-300 bg-amber-900/30 border-amber-700';
  }
}
