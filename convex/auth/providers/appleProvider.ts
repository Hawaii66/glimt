import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { createAccount } from "@convex-dev/auth/server";
import * as jose from "jose";
import { createLocalJWKSet, jwtVerify, type JWTPayload } from "jose";

import { internal } from "../../_generated/api";
import type { DataModel, Id } from "../../_generated/dataModel";

import type { GenericActionCtxWithAuthConfig } from "@convex-dev/auth/server";
import type { JSONWebKeySet } from "jose";
import { env } from "../../_generated/server";

const PROVIDER_ID = "apple";
const ISSUER = "https://appleid.apple.com";

type AppleCredentials = {
  verifierId: Id<"authVerifiers">;
  authorizationCode: string;
  additionalFields?: {
    name?: string;
  };
};

type AppleTokenResponse = {
  id_token?: string;
};

async function fetchAppleJwks(): Promise<JSONWebKeySet> {
  const response = await fetch(new URL("/auth/keys", ISSUER));
  if (!response.ok) {
    throw new Error("Failed to fetch Apple JWKS");
  }
  return (await response.json()) as JSONWebKeySet;
}

async function generateAppleSecret() {
  const algorithm = "ES256";
  const pk8 = env.AUTH_APPLE_PK8;
  const kid = env.AUTH_APPLE_KID;
  const teamId = env.AUTH_APPLE_TEAM_ID;
  const bundleId = env.AUTH_APPLE_BUNDLE_ID;
  const audience = env.AUTH_APPLE_AUDIENCE;
  const expiration = env.AUTH_APPLE_EXPIRATION;

  const privateKey = await jose.importPKCS8(
    pk8.replace(/\\n/g, "\n"),
    algorithm,
  );

  const appleSecret = await new jose.SignJWT({})
    .setProtectedHeader({ alg: algorithm, kid })
    .setIssuedAt()
    .setIssuer(teamId)
    .setAudience(audience)
    .setExpirationTime(expiration)
    .setSubject(bundleId)
    .sign(privateKey);

  return appleSecret;
}

export const decodeAppleIdentityToken = (token: string) => {
  const decoded = jose.decodeJwt(token);
  return decoded.sub;
};

async function appleSubjectFromAuthorizationCode(
  credentials: Partial<Record<string, unknown>>,
  ctx: GenericActionCtxWithAuthConfig<DataModel>,
) {
  const { verifierId, authorizationCode, additionalFields } =
    credentials as AppleCredentials;

  if (!verifierId || !authorizationCode) {
    throw new Error("Missing verifierId or authorizationCode");
  }

  const expectedNonce: string = await ctx.runMutation(
    internal.auth.providers.apple.consumeVerifier,
    { verifierId },
  );
  const bundleId = env.AUTH_APPLE_BUNDLE_ID;
  const appleSecret = await generateAppleSecret();

  const formData = new URLSearchParams();
  formData.append("client_id", bundleId);
  formData.append("client_secret", appleSecret);
  formData.append("grant_type", "authorization_code");
  formData.append("code", authorizationCode);

  const response = await fetch(`${ISSUER}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (response.status != 200) {
    const text = await response.json();
    console.log("Apple sign in failed", text);
    throw new Error("Failed to sing in with apple");
  }

  try {
    const jwks = await fetchAppleJwks();
    const tokenResponse = await response.json();

    const { payload: claims }: { payload: JWTPayload } = await jwtVerify(
      tokenResponse.id_token,
      createLocalJWKSet(jwks),
      {
        issuer: ISSUER,
        audience: env.AUTH_APPLE_BUNDLE_ID,
      },
    );

    if (typeof claims.sub !== "string") {
      throw new Error("Apple token missing subject");
    }

    const hashedNonce = expectedNonce;
    if (claims.nonce !== hashedNonce) {
      throw new Error("Nonce mismatch");
    }

    const accountResult = await createAccount(ctx, {
      provider: PROVIDER_ID,
      account: { id: claims.sub },
      profile: {
        ...(additionalFields?.name ? { name: additionalFields.name } : {}),
        ...(typeof claims.email === "string"
          ? {
              email: claims.email,
              emailVerificationTime: Date.now(),
            }
          : {}),
      },
      shouldLinkViaEmail: typeof claims.email === "string",
    });

    return { userId: accountResult.user._id };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export const Apple = ConvexCredentials<DataModel>({
  id: PROVIDER_ID,
  authorize: appleSubjectFromAuthorizationCode,
});
