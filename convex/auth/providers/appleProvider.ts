import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { createAccount } from "@convex-dev/auth/server";
import * as jose from "jose";
import { createLocalJWKSet, jwtVerify, type JWTPayload } from "jose";

import { internal } from "../../_generated/api";
import type { DataModel, Id } from "../../_generated/dataModel";

import type { GenericActionCtxWithAuthConfig } from "@convex-dev/auth/server";
import type { JSONWebKeySet } from "jose";
import { env } from "../../_generated/server";
import {
  appleTokenErrorResponseSchema,
  parseAppleCredentials,
  parseAppleIdTokenClaims,
  parseAppleTokenResponse,
} from "./appleSchemas";

const PROVIDER_ID = "apple";
const ISSUER = "https://appleid.apple.com";

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
    parseAppleCredentials(credentials);

  const expectedNonce: string = await ctx.runMutation(
    internal.auth.providers.apple.consumeVerifier,
    { verifierId: verifierId as Id<"authVerifiers"> },
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

  const responseBody: unknown = await response.json();

  if (!response.ok) {
    const errorResult = appleTokenErrorResponseSchema.safeParse(responseBody);
    const errorMessage = errorResult.success
      ? `${errorResult.data.error}${errorResult.data.error_description ? `: ${errorResult.data.error_description}` : ""}`
      : "Unknown Apple token error";
    console.error("Apple sign in failed", responseBody);
    throw new Error(`Failed to sign in with Apple: ${errorMessage}`);
  }

  const jwks = await fetchAppleJwks();
  const tokenResponse = parseAppleTokenResponse(responseBody);

  const { payload }: { payload: JWTPayload } = await jwtVerify(
    tokenResponse.id_token,
    createLocalJWKSet(jwks),
    {
      issuer: ISSUER,
      audience: env.AUTH_APPLE_BUNDLE_ID,
    },
  );

  const claims = parseAppleIdTokenClaims(payload);

  if (claims.nonce !== expectedNonce) {
    throw new Error("Nonce mismatch");
  }

  const accountResult = await createAccount(ctx, {
    provider: PROVIDER_ID,
    account: { id: claims.sub },
    profile: {
      ...(additionalFields?.name ? { name: additionalFields.name } : {}),
      ...(claims.email
        ? {
            email: claims.email,
            emailVerificationTime: Date.now(),
          }
        : {}),
    },
    shouldLinkViaEmail: Boolean(claims.email),
  });

  return { userId: accountResult.user._id };
}

export const Apple = ConvexCredentials<DataModel>({
  id: PROVIDER_ID,
  authorize: appleSubjectFromAuthorizationCode,
});
