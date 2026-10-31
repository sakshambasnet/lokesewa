import { QueryClient } from '@tanstack/react-query';

const STALE_TIME_MS = 5 * 60 * 1000;
const MAX_QUERY_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      retry: MAX_QUERY_RETRIES,
    },
  },
});
