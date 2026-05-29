import { z } from "zod";

/** Credentials sent from the client to the Apple ConvexCredentials authorize handler. */
export const appleCredentialsSchema = z.object({
  verifierId: z.string().min(1),
  authorizationCode: z.string().min(1),
  additionalFields: z
    .object({
      name: z.string().min(1).optional(),
    })
    .optional(),
});

export type AppleCredentials = z.infer<typeof appleCredentialsSchema>;

/** Response from POST https://appleid.apple.com/auth/token on success. */
export const appleTokenResponseSchema = z.object({
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  id_token: z.string().min(1),
});

export type AppleTokenResponse = z.infer<typeof appleTokenResponseSchema>;

/** Response from POST https://appleid.apple.com/auth/token on failure. */
export const appleTokenErrorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

export type AppleTokenErrorResponse = z.infer<
  typeof appleTokenErrorResponseSchema
>;

/**
 * Claims from Apple's id_token after signature verification.
 * `iss`, `aud`, and `exp` are enforced by jose during jwtVerify.
 */
export const appleIdTokenClaimsSchema = z
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

export type AppleIdTokenClaims = z.infer<typeof appleIdTokenClaimsSchema>;

/** Result of `auth.providers.apple.initSignIn`. */
export const appleInitSignInSchema = z.object({
  verifierId: z.string().min(1),
  nonce: z.string().min(1),
});

export type AppleInitSignIn = z.infer<typeof appleInitSignInSchema>;

export function formatZodError(error: z.ZodError, label: string): string {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "value";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
  return `Invalid ${label}: ${details}`;
}

export function parseAppleCredentials(data: unknown): AppleCredentials {
  const result = appleCredentialsSchema.safeParse(data);
  if (!result.success) {
    throw new Error(formatZodError(result.error, "Apple sign-in credentials"));
  }
  return result.data;
}

export function parseAppleTokenResponse(data: unknown): AppleTokenResponse {
  const result = appleTokenResponseSchema.safeParse(data);
  if (!result.success) {
    throw new Error(formatZodError(result.error, "Apple token response"));
  }
  return result.data;
}

export function parseAppleIdTokenClaims(data: unknown): AppleIdTokenClaims {
  const result = appleIdTokenClaimsSchema.safeParse(data);
  if (!result.success) {
    throw new Error(formatZodError(result.error, "Apple identity token"));
  }
  return result.data;
}
