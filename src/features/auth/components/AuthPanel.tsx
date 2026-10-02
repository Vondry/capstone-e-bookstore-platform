/**
 * AuthPanel - S1 shell: a centred layer-1 panel on the book illustration, styled like the S5 payment panel
 * (wireframe 04: 20 px title row with a divider, square corners, no shadow).
 */

import { useId } from 'react';
import { IllustratedBackground } from '@/components/ui/Illustration';

export type AuthPanelProps = {
  title: string;
  children: React.ReactNode;
};

export function AuthPanel({ title, children }: Readonly<AuthPanelProps>) {
  const titleId = useId();

  return (
    <IllustratedBackground>
      <section
        aria-labelledby={titleId}
        className="mx-auto w-full max-w-[480px] bg-layer-1 text-text-primary"
      >
        <div className="border-b border-border p-16">
          <h1 id={titleId} className="text-20">
            {title}
          </h1>
        </div>
        <div className="flex flex-col gap-24 p-16 md:p-24">{children}</div>
      </section>
    </IllustratedBackground>
  );
}
