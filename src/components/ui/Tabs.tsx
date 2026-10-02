import { useId, useRef } from 'react';
import { cn } from '@/lib/utils';

export type TabItem<T extends string> = { id: T; label: string };

export type TabsProps<T extends string> = {
  /** Accessible name of the tab list */
  label: string;
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  orientation?: 'horizontal' | 'vertical';
  /** Content of the selected tab (only the active panel is rendered) */
  children: React.ReactNode;
  className?: string;
};

const NEXT_KEYS = ['ArrowDown', 'ArrowRight'];
const PREVIOUS_KEYS = ['ArrowUp', 'ArrowLeft'];

function nextIndex(key: string, current: number, count: number): number | null {
  if (NEXT_KEYS.includes(key)) return (current + 1) % count;
  if (PREVIOUS_KEYS.includes(key)) return (current - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}

/**
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation). Arrow keys in both axes,
 * Home and End move focus and selection; only the selected tab is in the Tab order.
 */
export function Tabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
  orientation = 'horizontal',
  children,
  className,
}: Readonly<TabsProps<T>>) {
  const baseId = useId();
  const tabRefs = useRef(new Map<T, HTMLButtonElement>());
  const vertical = orientation === 'vertical';
  const tabId = (id: T) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = tabs.findIndex((tab) => tab.id === value);
    const index = nextIndex(event.key, current, tabs.length);
    const target = index === null ? undefined : tabs[index];
    if (!target) return;
    event.preventDefault();
    onChange(target.id);
    tabRefs.current.get(target.id)?.focus();
  };

  return (
    <div className={cn('flex', vertical ? 'flex-row' : 'flex-col', className)}>
      <div
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex shrink-0',
          vertical ? 'w-[168px] flex-col' : 'flex-row overflow-x-auto'
        )}
      >
        {tabs.map((tab) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) tabRefs.current.set(tab.id, node);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-selected={selected}
              aria-controls={selected ? panelId : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                onChange(tab.id);
              }}
              className={cn(
                'flex min-h-48 shrink-0 items-center px-16 text-left text-14 whitespace-nowrap transition-colors',
                'focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden focus-visible:ring-inset',
                vertical ? 'border-b border-l-[3px] border-b-border' : 'border-b-[3px]',
                selected
                  ? 'border-l-interactive bg-layer-1 font-semibold text-text-primary'
                  : 'border-l-transparent bg-layer-2 text-text-secondary hover:text-text-primary',
                !vertical && (selected ? 'border-b-interactive' : 'border-b-transparent')
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={tabId(value)} className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
