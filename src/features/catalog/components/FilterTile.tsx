/**
 * Filter tiles from wireframe 01: the label sits inside a layer-1 tile above the value
 * (unlike form inputs, whose label sits above the field — .bob/rules/02-design-system.md).
 */

import { useId } from 'react';
import { ChevronDown, Search } from '@carbon/icons-react';

const tileClass =
  'relative flex flex-col gap-4 border-b border-border bg-layer-1 px-16 pb-8 pt-12 focus-within:ring-2 focus-within:ring-focus';
const labelClass = 'text-12 text-text-secondary';
const controlClass =
  'h-24 w-full appearance-none bg-transparent pr-32 text-16 text-text-primary outline-hidden placeholder:text-text-placeholder focus-visible:ring-0';
const iconClass = 'pointer-events-none absolute bottom-12 right-16 text-text-primary';

export type FilterSelectProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

export function FilterSelect({ label, value, options, onChange }: Readonly<FilterSelectProps>) {
  const id = useId();
  return (
    <div className={tileClass}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className={controlClass}
      >
        {options.map((option) => (
          // Native option lists don't inherit a transparent background, so set the token
          <option key={option.value} value={option.value} className="bg-layer-1 text-text-primary">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={20} aria-hidden="true" className={iconClass} />
    </div>
  );
}

export type FilterSearchProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function FilterSearch({ label, placeholder, value, onChange }: Readonly<FilterSearchProps>) {
  const id = useId();
  return (
    <div className={tileClass}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className={controlClass}
      />
      <Search size={20} aria-hidden="true" className={iconClass} />
    </div>
  );
}
