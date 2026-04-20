interface PageHeaderProps {
  /** Primary heading text. */
  title: string;
  /** Optional subtitle displayed below the title. */
  subtitle?: string;
}

/** Top-of-page header with title and optional subtitle, separated by a bottom border. */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-8 border-b-2 border-slate-200 pb-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
    </header>
  );
}
