import type { ReactNode } from 'react';

interface BadgeProps {
  /** Content to display inside the badge pill. */
  children: ReactNode;
}

/** Inline pill badge for displaying tags or category labels. */
export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
      {children}
    </span>
  );
}
