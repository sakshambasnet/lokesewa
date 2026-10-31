import { EmptyState } from './EmptyState';

type ErrorStateProps = {
  /** Friendly text for users. Never pass raw network errors here (rules.md §9.2). */
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <EmptyState
      title="केही गडबड भयो"
      message={message}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}
