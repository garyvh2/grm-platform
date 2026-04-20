type ButtonProps = React.ComponentProps<'button'>;

/** Primary action button with indigo styling and disabled state support. */
export function Button({ type = 'button', children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}
