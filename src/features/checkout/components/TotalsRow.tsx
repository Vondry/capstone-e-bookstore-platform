/**
 * One label/amount row of the Grand Total panel
 */

import { cn } from '@/lib/utils';

export type TotalsRowProps = {
  label: string;
  value: string;
  emphasis?: boolean;
};

export function TotalsRow({ label, value, emphasis = false }: Readonly<TotalsRowProps>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-16',
        emphasis ? 'text-16 font-semibold' : 'text-14'
      )}
    >
      <dt className="text-text-primary">{label}</dt>
      <dd className="text-right text-text-primary">{value}</dd>
    </div>
  );
}
