import { CONTROL_CLASSES } from '../Input/Input';

type SelectProps = Omit<React.ComponentProps<'select'>, 'className'>;

/** Styled dropdown select with consistent focus ring. */
export function Select({ children, ...props }: SelectProps) {
  return (
    <select className={CONTROL_CLASSES} {...props}>
      {children}
    </select>
  );
}
