'use client';

import { useEffect, useRef } from 'react';

type Point = { date: string; commercial_net: number; noncommercial_net: number };

export function HistoryChart({ points }: { points: Point[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let chart: { destroy: () => void } | null = null;

    (async () => {
      const mod = await import('chart.js/auto');
      if (!mounted || !ref.current) return;
      const Chart = mod.default;
      const sorted = [...points].sort((a, b) => (a.date < b.date ? -1 : 1));
      chart = new Chart(ref.current, {
        type: 'line',
        data: {
          labels: sorted.map(p => p.date),
          datasets: [
            {
              label: 'Commercial net',
              data: sorted.map(p => p.commercial_net),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16,185,129,0.10)',
              pointRadius: 0,
              borderWidth: 1.5,
              tension: 0.2,
              fill: true,
            },
            {
              label: 'Noncommercial net',
              data: sorted.map(p => p.noncommercial_net),
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244,63,94,0.05)',
              pointRadius: 0,
              borderWidth: 1.5,
              tension: 0.2,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#d4d4d8' } },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: {
              ticks: { color: '#71717a', maxTicksLimit: 8 },
              grid: { color: 'rgba(63,63,70,0.4)' },
            },
            y: {
              ticks: { color: '#71717a' },
              grid: { color: 'rgba(63,63,70,0.4)' },
            },
          },
          interaction: { mode: 'nearest', axis: 'x', intersect: false },
        },
      }) as unknown as { destroy: () => void };
    })();

    return () => {
      mounted = false;
      if (chart) chart.destroy();
    };
  }, [points]);

  return (
    <div className="h-72 w-full">
      <canvas ref={ref} />
    </div>
  );
}
