import { Link } from 'react-router-dom';

export type TextLinkProps = {
  to: string;
  children: React.ReactNode;
};

/** Underlined inline link (author, publisher, categories, language) */
export function TextLink({ to, children }: Readonly<TextLinkProps>) {
  return (
    <Link
      to={to}
      className="text-link underline hover:text-interactive-hover focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden"
    >
      {children}
    </Link>
  );
}
