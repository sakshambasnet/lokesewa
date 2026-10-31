import { EmptyState, Screen } from '@/components/ui';

// Placeholder. Build the real screen in src/features/progress/ and keep this file thin.
export default function HomeScreen() {
  return (
    <Screen edges={['top']}>
      <EmptyState title="लोकसेवा तयारी" message="Daily quiz and your progress will appear here." />
    </Screen>
  );
}
