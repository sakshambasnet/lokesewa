import { Redirect } from 'expo-router';

// Later: send first-time users to /onboarding to choose their target post.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
