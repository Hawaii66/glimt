import { authStorage } from "./auth-storage";
import { convex, convexUrl } from "./convex";

const JWT_STORAGE_KEY = "__convexAuthJWT";

function getAuthStorageKey(): string {
  const namespace = convexUrl.replace(/[^a-zA-Z0-9]/g, "");
  return `${JWT_STORAGE_KEY}_${namespace}`;
}

export async function ensureConvexAuthForBackground(): Promise<boolean> {
  if (!convex) {
    return false;
  }

  const token = await authStorage.getItem(getAuthStorageKey());
  if (!token) {
    return false;
  }

  convex.setAuth(async () => token);
  return true;
}
