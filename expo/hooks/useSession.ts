import { useConvexAuth } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';

import { convex } from '@/lib/convex';
import { api } from 'convex/_generated/api';

export function useSession() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.current,
    convex && isAuthenticated ? {} : 'skip',
  );

  const userLoading = Boolean(convex && isAuthenticated && user === undefined);
  const isReady = !convex || (!authLoading && !userLoading);

  return {
    isReady,
    isAuthenticated: Boolean(convex && isAuthenticated),
    user: user ?? null,
    onboardingComplete: Boolean(user?.onboardingComplete),
  };
}
