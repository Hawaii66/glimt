import { useConvexAuth } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';

import { convex } from '@/lib/convex';
import { api } from 'convex/_generated/api';

export function useSession() {
  const { isLoading: authLoading, isAuthenticated: hasToken } = useConvexAuth();
  const user = useQuery(
    api.users.current,
    convex && hasToken ? {} : 'skip',
  );

  const userLoading = Boolean(convex && hasToken && user === undefined);
  const isReady = !convex || (!authLoading && !userLoading);
  const isAuthenticated = Boolean(convex && hasToken && user != null);
  const sessionInvalid = Boolean(convex && hasToken && isReady && user === null);

  return {
    isReady,
    isAuthenticated,
    hasToken: Boolean(convex && hasToken),
    sessionInvalid,
    user: user ?? null,
    onboardingComplete: Boolean(user?.onboardingComplete),
  };
}
