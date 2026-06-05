import { zoneColor, zoneLabel } from '@/lib/percentile';
import type { Snapshot } from '@/lib/percentile';

export function ZoneBadge({ zone }: { zone: Snapshot['zone'] }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded border ${zoneColor(zone)}`}>
      {zoneLabel(zone)}
    </span>
  );
}
