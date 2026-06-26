import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export function useStoresHydrated() {
  const authHydrated = useAuthStore((state) => state.hydrated);
  const profileHydrated = useProfileStore((state) => state.hydrated);
  return authHydrated && profileHydrated;
}
