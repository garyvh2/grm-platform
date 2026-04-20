import { useId } from 'react';
import type { ReactNode } from 'react';

interface SectionProps {
  /** Section heading text (e.g. "Upload Reference Data"). */
  heading: string;
  /** Content rendered below the heading. */
  children: ReactNode;
}

/** Titled content section used to group related UI blocks. */
export function Section({ heading, children }: SectionProps) {
  const headingId = useId();
  return (
    <section className="mb-8" aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-3 text-lg font-semibold text-slate-800">
        {heading}
      </h2>
      {children}
    </section>
  );
}
