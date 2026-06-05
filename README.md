# COTSignal

Free CFTC Commitments of Traders positioning dashboard for 8 majors. Built overnight as part of L8's portfolio.

## What it does

- Pulls the legacy COT report from `publicreporting.cftc.gov` every Friday at 20:00 UTC.
- Computes commercial and noncommercial net positions over 3 years of weekly history per commodity.
- Ranks the latest commercial net against the 3-year range and flags extremes.
- Renders per-commodity drilldowns with a Chart.js line chart and week-over-week deltas.

## What it does not do

- It does not say buy or sell.
- It does not use the disaggregated or financial-traders report variants.
- It does not include options or futures-and-options combined data.

## Stack

Next.js 15, Tailwind dark, Neon Postgres, Chart.js, Vercel cron.

## Setup

`DATABASE_URL` is the only required env var. Trigger `/api/cron` once to bootstrap, then the Friday cron keeps it fresh.

## Routes

- `/` - dashboard
- `/[commodity]` - drilldown (keys: gold, silver, crude, natgas, soybeans, corn, es, btc)
- `/about` - what it is and is not
- `/api/cron` - ingest job
- `/api/commodities` - all commodities snapshot
- `/api/commodities/[key]` - single commodity snapshot plus history
- `/api/health` - per-commodity row counts and latest dates

Source: CFTC dataset 6dca-aqww (Legacy Futures Only).
