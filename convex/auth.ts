import { convexAuth } from "@convex-dev/auth/server";

import { Apple } from "./auth/providers/appleProvider";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Apple],
});
