import type { ReactNode } from 'react';

interface CardProps {
  /** Card body content. */
  children: ReactNode;
  /** Optional extra Tailwind classes appended to the base card styling. */
  className?: string;
}

/** Bordered container card with subtle background. */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 p-5 ${className}`.trim()}>
      {children}
    </div>
  );
}
