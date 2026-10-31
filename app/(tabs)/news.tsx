import { EmptyState, Screen } from '@/components/ui';

// Placeholder. Build the real screen in src/features/current-affairs/ and keep this file thin.
export default function NewsScreen() {
  return (
    <Screen edges={['top']}>
      <EmptyState title="समसामयिक" message="Current affairs will appear here." />
    </Screen>
  );
}
