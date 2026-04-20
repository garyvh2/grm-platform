import type { ReactNode } from 'react';

interface FormFieldProps {
  /** Visible label text. The label wraps children for implicit association. */
  label: string;
  /** Form control(s) to render inside the label. */
  children: ReactNode;
}

/**
 * Label wrapper for form controls.
 *
 * Uses implicit label association (children are rendered inside `<label>`)
 * so screen readers and `getByLabelText` queries work without explicit `id` wiring.
 */
export function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}
