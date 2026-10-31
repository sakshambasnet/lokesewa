import { EmptyState, Screen } from '@/components/ui';

// Placeholder. Build the real screen in src/features/mock-test/ and keep this file thin.
export default function TestsScreen() {
  return (
    <Screen edges={['top']}>
      <EmptyState title="मोडेल टेस्ट" message="Mock tests will appear here." />
    </Screen>
  );
}
