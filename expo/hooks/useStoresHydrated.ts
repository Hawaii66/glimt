import { useSession } from '@/hooks/useSession';

export function useStoresHydrated() {
  const { isReady } = useSession();
  return isReady;
}
