import { EmptyState, Screen } from '@/components/ui';

// Placeholder. Build the real screen in src/features/auth/ and keep this file thin.
export default function ProfileScreen() {
  return (
    <Screen edges={['top']}>
      <EmptyState
        title="प्रोफाइल"
        message="Account, subscription and downloads will appear here."
      />
    </Screen>
  );
}
