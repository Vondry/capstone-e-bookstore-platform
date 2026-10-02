import { Fragment } from 'react';
import { Link } from 'react-router-dom';

export type BreadcrumbItem = {
  label: string;
  /** Omit for the current page */
  to?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: Readonly<BreadcrumbProps>) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-8 text-14">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${String(index)}`}>
            {index > 0 && (
              <li aria-hidden="true" className="text-text-secondary">
                /
              </li>
            )}
            <li>
              {item.to ? (
                <Link to={item.to} className="text-link hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-text-primary">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
