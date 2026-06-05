import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(url);

let ensured = false;

export async function ensureDb() {
  if (ensured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS cot_reports (
      id SERIAL PRIMARY KEY,
      commodity_key TEXT NOT NULL,
      contract_name TEXT NOT NULL,
      report_date DATE NOT NULL,
      commercial_long BIGINT NOT NULL,
      commercial_short BIGINT NOT NULL,
      commercial_net BIGINT NOT NULL,
      noncommercial_long BIGINT NOT NULL,
      noncommercial_short BIGINT NOT NULL,
      noncommercial_net BIGINT NOT NULL,
      open_interest BIGINT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (commodity_key, report_date)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cot_key_date ON cot_reports(commodity_key, report_date DESC)`;
  ensured = true;
}
