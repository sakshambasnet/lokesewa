import { EmptyState, Screen } from '@/components/ui';

// Placeholder. Build the real screen in src/features/practice/ and keep this file thin.
export default function PracticeScreen() {
  return (
    <Screen edges={['top']}>
      <EmptyState title="अभ्यास" message="Papers and topics will appear here." />
    </Screen>
  );
}
