import { z } from "zod";

/** Credentials sent from the client to the Apple ConvexCredentials authorize handler. */
export const AppleCredentialsSchema = z.object({
  verifierId: z.string().min(1),
  authorizationCode: z.string().min(1),
  additionalFields: z
    .object({
      name: z.string().min(1).optional(),
    })
    .optional(),
});

export type AppleCredentials = z.infer<typeof AppleCredentialsSchema>;

/** Response from POST https://appleid.apple.com/auth/token on success. */
export const AppleTokenResponseSchema = z.object({
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  id_token: z.string().min(1),
});

export type AppleTokenResponse = z.infer<typeof AppleTokenResponseSchema>;

/** Response from POST https://appleid.apple.com/auth/token on failure. */
export const AppleTokenErrorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

export type AppleTokenErrorResponse = z.infer<
  typeof AppleTokenErrorResponseSchema
>;

/**
 * Claims from Apple's id_token after signature verification.
 * `iss`, `aud`, and `exp` are enforced by jose during jwtVerify.
 */
export const AppleIdTokenClaimsSchema = z
  .object({
    sub: z.string().min(1),
    nonce: z.string().min(1),
    email: z.string().email().optional(),
    email_verified: z
      .union([z.boolean(), z.literal("true"), z.literal("false")])
      .optional(),
    is_private_email: z
      .union([z.boolean(), z.literal("true"), z.literal("false")])
      .optional(),
  })
  .loose();

export type AppleIdTokenClaims = z.infer<typeof AppleIdTokenClaimsSchema>;

/** Unverified payload from jose.decodeJwt on an Apple id_token. */
export const AppleDecodedIdentityTokenSchema = z
  .object({
    sub: z.string().min(1),
  })
  .loose();

export type AppleDecodedIdentityToken = z.infer<
  typeof AppleDecodedIdentityTokenSchema
>;

const JsonWebKeySchema = z
  .object({
    kty: z.string(),
    kid: z.string().optional(),
    use: z.string().optional(),
    alg: z.string().optional(),
    n: z.string().optional(),
    e: z.string().optional(),
    crv: z.string().optional(),
    x: z.string().optional(),
    y: z.string().optional(),
  })
  .loose();

/** JWKS from GET https://appleid.apple.com/auth/keys. */
export const AppleJwksSchema = z.object({
  keys: z.array(JsonWebKeySchema).min(1),
});

export type AppleJwks = z.infer<typeof AppleJwksSchema>;

/** Result of `auth.providers.apple.initSignIn`. */
export const AppleInitSignInSchema = z.object({
  verifierId: z.string().min(1),
  nonce: z.string().min(1),
});

export type AppleInitSignIn = z.infer<typeof AppleInitSignInSchema>;

function FormatZodError(error: z.ZodError, label: string): string {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "value";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
  return `Invalid ${label}: ${details}`;
}

export function ParseAppleCredentials(data: unknown): AppleCredentials {
  const result = AppleCredentialsSchema.safeParse(data);
  if (!result.success) {
    throw new Error(FormatZodError(result.error, "Apple sign-in credentials"));
  }
  return result.data;
}

export function ParseAppleTokenResponse(data: unknown): AppleTokenResponse {
  const result = AppleTokenResponseSchema.safeParse(data);
  if (!result.success) {
    throw new Error(FormatZodError(result.error, "Apple token response"));
  }
  return result.data;
}

export function ParseAppleIdTokenClaims(data: unknown): AppleIdTokenClaims {
  const result = AppleIdTokenClaimsSchema.safeParse(data);
  if (!result.success) {
    throw new Error(FormatZodError(result.error, "Apple identity token"));
  }
  return result.data;
}

export function ParseAppleDecodedIdentityToken(
  data: unknown,
): AppleDecodedIdentityToken {
  const result = AppleDecodedIdentityTokenSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      FormatZodError(result.error, "Apple decoded identity token"),
    );
  }
  return result.data;
}

export function ParseAppleJwks(data: unknown): AppleJwks {
  const result = AppleJwksSchema.safeParse(data);
  if (!result.success) {
    throw new Error(FormatZodError(result.error, "Apple JWKS"));
  }
  return result.data;
}
