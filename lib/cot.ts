import { sql, ensureDb } from './db';
import { COMMODITIES, type Commodity } from './commodities';

const CFTC_BASE = 'https://publicreporting.cftc.gov/resource/6dca-aqww.json';

type Raw = {
  report_date_as_yyyy_mm_dd?: string;
  market_and_exchange_names?: string;
  comm_positions_long_all?: string | number;
  comm_positions_short_all?: string | number;
  noncomm_positions_long_all?: string | number;
  noncomm_positions_short_all?: string | number;
  open_interest_all?: string | number;
};

function toInt(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0;
  const n = typeof v === 'string' ? parseInt(v.replace(/[^0-9-]/g, ''), 10) : Math.round(v);
  return Number.isFinite(n) ? n : 0;
}

function isoDate(s: string): string {
  return s.slice(0, 10);
}

async function fetchContract(contractName: string, sinceIso: string): Promise<Raw[]> {
  const params = new URLSearchParams({
    $select: [
      'report_date_as_yyyy_mm_dd',
      'market_and_exchange_names',
      'comm_positions_long_all',
      'comm_positions_short_all',
      'noncomm_positions_long_all',
      'noncomm_positions_short_all',
      'open_interest_all',
    ].join(','),
    $where: `market_and_exchange_names = '${contractName.replace(/'/g, "''")}' AND report_date_as_yyyy_mm_dd >= '${sinceIso}T00:00:00.000'`,
    $order: 'report_date_as_yyyy_mm_dd DESC',
    $limit: '300',
  });
  const url = `${CFTC_BASE}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'COTSignal/1.0 (portfolio app)' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`CFTC fetch ${res.status} for ${contractName}`);
  }
  return (await res.json()) as Raw[];
}

export type IngestResult = {
  commodity_key: string;
  contract_used: string | null;
  rows_seen: number;
  rows_inserted: number;
  latest_date: string | null;
  error: string | null;
};

export async function ingestCommodity(c: Commodity, sinceIso: string): Promise<IngestResult> {
  await ensureDb();
  let used: string | null = null;
  let rows: Raw[] = [];
  let lastErr: string | null = null;

  for (const candidate of c.match) {
    try {
      const got = await fetchContract(candidate, sinceIso);
      if (got.length > 0) {
        used = candidate;
        rows = got;
        break;
      }
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }

  if (!used) {
    return {
      commodity_key: c.key,
      contract_used: null,
      rows_seen: 0,
      rows_inserted: 0,
      latest_date: null,
      error: lastErr ?? 'no contract match returned data',
    };
  }

  let inserted = 0;
  let latest: string | null = null;
  for (const r of rows) {
    const date = r.report_date_as_yyyy_mm_dd ? isoDate(r.report_date_as_yyyy_mm_dd) : null;
    if (!date) continue;
    if (!latest || date > latest) latest = date;
    const commL = toInt(r.comm_positions_long_all);
    const commS = toInt(r.comm_positions_short_all);
    const nonL = toInt(r.noncomm_positions_long_all);
    const nonS = toInt(r.noncomm_positions_short_all);
    const oi = toInt(r.open_interest_all);
    const result = await sql`
      INSERT INTO cot_reports (
        commodity_key, contract_name, report_date,
        commercial_long, commercial_short, commercial_net,
        noncommercial_long, noncommercial_short, noncommercial_net,
        open_interest
      ) VALUES (
        ${c.key}, ${used}, ${date},
        ${commL}, ${commS}, ${commL - commS},
        ${nonL}, ${nonS}, ${nonL - nonS},
        ${oi}
      )
      ON CONFLICT (commodity_key, report_date) DO NOTHING
      RETURNING id
    `;
    if (Array.isArray(result) && result.length > 0) inserted++;
  }

  return {
    commodity_key: c.key,
    contract_used: used,
    rows_seen: rows.length,
    rows_inserted: inserted,
    latest_date: latest,
    error: null,
  };
}

export async function ingestAll(sinceIso: string): Promise<IngestResult[]> {
  const out: IngestResult[] = [];
  for (const c of COMMODITIES) {
    const r = await ingestCommodity(c, sinceIso);
    out.push(r);
    await new Promise(res => setTimeout(res, 200));
  }
  return out;
}
