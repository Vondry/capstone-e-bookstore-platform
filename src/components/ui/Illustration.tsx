/**
 * Book illustration used by the wireframes (S4 Grand Total panel, S5/S6 page background).
 * The colours are artwork, not UI colours, so they are not design tokens.
 */

import { cn } from '@/lib/utils';

export type BookIllustrationProps = {
  className?: string;
  /** 'portrait' for tall panels (S4 Grand Total), 'landscape' for page backgrounds */
  variant?: 'landscape' | 'portrait';
};

export function BookIllustration({
  className,
  variant = 'landscape',
}: Readonly<BookIllustrationProps>) {
  if (variant === 'portrait') return <PortraitIllustration className={className} />;
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="800" height="600" fill="#1b3a5c" />
      <circle cx="40" cy="40" r="140" fill="#24496f" />
      <circle cx="760" cy="10" r="90" fill="#c8612f" />
      <path
        d="M30 170 C 90 120, 160 220, 230 150"
        stroke="#b8865a"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M560 380 C 610 330, 650 450, 720 400"
        stroke="#b8865a"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60 470 C 100 440, 140 500, 180 470"
        stroke="#3a6f9c"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Orange book, top left */}
      <g transform="rotate(-18 210 170)">
        <rect x="120" y="110" width="200" height="130" fill="#d9732f" />
        <rect x="120" y="240" width="200" height="14" fill="#f2e3c6" />
        <rect x="180" y="140" width="70" height="45" fill="#b4432a" />
      </g>
      {/* Blue book, top right */}
      <rect x="520" y="0" width="120" height="150" fill="#2c6a99" />
      <rect x="560" y="0" width="12" height="150" fill="#235a84" />
      {/* Stack of books, bottom left */}
      <rect x="120" y="440" width="220" height="60" fill="#2c6a99" />
      <rect x="110" y="500" width="240" height="70" fill="#e0a63a" />
      <rect x="110" y="555" width="240" height="10" fill="#f2e3c6" />
      {/* Open book, bottom right */}
      <path d="M440 520 L 560 470 L 680 520 L 680 590 L 560 545 L 440 590 Z" fill="#e8dcc0" />
      <path d="M560 470 L 560 545" stroke="#c9b48f" strokeWidth="4" />
      <path d="M440 590 L 560 545 L 680 590 L 680 600 L 440 600 Z" fill="#c8612f" />
      {/* Confetti squares */}
      <rect x="430" y="90" width="22" height="22" fill="#d9a441" transform="rotate(20 441 101)" />
      <rect x="370" y="210" width="18" height="18" fill="#c8612f" transform="rotate(35 379 219)" />
      <rect x="60" y="300" width="16" height="16" fill="#c8612f" />
      <rect x="700" y="230" width="18" height="18" fill="#d9c441" transform="rotate(15 709 239)" />
      <rect x="480" y="560" width="16" height="16" fill="#c8612f" transform="rotate(40 488 568)" />
      <circle cx="660" cy="300" r="18" fill="#c8612f" />
    </svg>
  );
}

/** Tall composition matching the Grand Total panel in wireframe 03 */
function PortraitIllustration({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 300 520"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="300" height="520" fill="#1b3a5c" />
      <path
        d="M20 30 C 60 0, 90 60, 140 20"
        stroke="#b8865a"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M170 260 C 200 230, 230 300, 280 260"
        stroke="#b8865a"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M30 330 C 60 310, 90 350, 120 330"
        stroke="#3a6f9c"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Orange book, tilted */}
      <g transform="rotate(-20 80 150)">
        <rect x="20" y="100" width="120" height="85" fill="#d9732f" />
        <rect x="20" y="185" width="120" height="10" fill="#f2e3c6" />
        <rect x="55" y="120" width="40" height="28" fill="#b4432a" />
      </g>
      {/* Standing blue book, top right */}
      <rect x="210" y="40" width="60" height="110" fill="#2c6a99" />
      <rect x="228" y="40" width="8" height="110" fill="#235a84" />
      {/* Stack of books */}
      <rect x="30" y="380" width="120" height="34" fill="#2c6a99" />
      <rect x="22" y="414" width="136" height="40" fill="#e0a63a" />
      <rect x="22" y="446" width="136" height="8" fill="#f2e3c6" />
      {/* Open book */}
      <path d="M150 470 L 215 440 L 280 470 L 280 510 L 215 485 L 150 510 Z" fill="#e8dcc0" />
      <path d="M215 440 L 215 485" stroke="#c9b48f" strokeWidth="3" />
      {/* Confetti */}
      <rect x="230" y="200" width="14" height="14" fill="#d9a441" transform="rotate(20 237 207)" />
      <rect x="120" y="250" width="12" height="12" fill="#c8612f" transform="rotate(35 126 256)" />
      <rect x="40" y="260" width="10" height="10" fill="#d9c441" />
      <rect x="250" y="360" width="12" height="12" fill="#c8612f" transform="rotate(40 256 366)" />
      <circle cx="190" cy="350" r="10" fill="#c8612f" />
    </svg>
  );
}

export type IllustratedBackgroundProps = {
  children: React.ReactNode;
  className?: string;
};

/** Full-bleed illustrated page (S5 Payment, S6 Success, S1 Login) with content centred on top */
export function IllustratedBackground({
  children,
  className,
}: Readonly<IllustratedBackgroundProps>) {
  return (
    <div
      className={cn(
        'relative flex min-h-[calc(100vh-3rem)] items-center justify-center overflow-hidden p-16',
        className
      )}
    >
      {/* Dimmed on the dark theme like the wireframes; full strength on white */}
      <BookIllustration className="absolute inset-0 h-full w-full opacity-80 in-data-[theme=light]:opacity-100" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
