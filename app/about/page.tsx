export const metadata = {
  title: 'About - COTSignal',
  description: 'What COTSignal does and what it does not do.',
};

export default function AboutPage() {
  return (
    <article className="prose prose-invert max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">About COTSignal</h1>
      <p className="mt-3 text-sm text-zinc-300">
        Every Friday at 3:30pm ET the CFTC publishes the Commitments of Traders report covering positioning as of the prior Tuesday.
        Retail blogs read it as a buy or sell signal. It is not. It is a positioning snapshot from one specific Tuesday, one week stale by the time you see it.
      </p>
      <h2 className="mt-6 text-base font-semibold">What this site actually does</h2>
      <p className="mt-2 text-sm text-zinc-300">
        It loads the legacy COT report into Neon every Friday at 20:00 UTC, computes commercial and noncommercial net positions
        across 8 majors and ranks today against the 3-year history. The interesting number is the percentile, not the headline.
      </p>
      <h2 className="mt-6 text-base font-semibold">What this site does not do</h2>
      <ul className="mt-2 list-disc pl-5 text-sm text-zinc-300">
        <li>It does not tell you to buy or sell anything.</li>
        <li>It does not adjust for spread positions, options or futures-and-options combined.</li>
        <li>It does not predict price.</li>
      </ul>
      <h2 className="mt-6 text-base font-semibold">Why a percentile</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Absolute net contracts are not comparable across commodities or across years.
        A 100,000 contract net long in gold means something different from the same number in crude.
        The percentile rank against a rolling 3-year window normalises both effects and surfaces real extremes.
      </p>
      <h2 className="mt-6 text-base font-semibold">Data and accuracy</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Source: CFTC Public Reporting Environment, dataset 6dca-aqww (Legacy Futures Only). Free, no auth, weekly updates.
        Bugs and contract-match misses are likely; this is a free portfolio app, not a paid data product.
      </p>
    </article>
  );
}
