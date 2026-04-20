/** Shared base classes for text-like form controls (input, select). */
export const CONTROL_CLASSES =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-600';

type InputProps = Omit<React.ComponentProps<'input'>, 'className'>;

/** Styled text/date/number input with consistent focus ring. */
export function Input(props: InputProps) {
  return <input className={CONTROL_CLASSES} {...props} />;
}
