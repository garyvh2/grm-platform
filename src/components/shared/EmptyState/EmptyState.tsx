interface EmptyStateProps {
  /** Message displayed when there is no data to show. */
  message: string;
}

/** Subtle text message for empty or zero-result states. */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <p role="status" className="text-sm text-slate-500">
      {message}
    </p>
  );
}
