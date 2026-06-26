/** @typedef {"dev" | "stage" | "prod"} MobileEnvironment */

/** @param {MobileEnvironment} env @returns {string | undefined} */
function resolveConvexUrl(env) {
  if (process.env.EXPO_PUBLIC_CONVEX_URL) {
    return process.env.EXPO_PUBLIC_CONVEX_URL;
  }

  const legacyVar = {
    dev: "EXPO_PUBLIC_CONVEX_URL_DEV",
    stage: "EXPO_PUBLIC_CONVEX_URL_STAGE",
    prod: "EXPO_PUBLIC_CONVEX_URL_PROD",
  }[env];

  return legacyVar ? process.env[legacyVar] : undefined;
}

/** @param {string | undefined} value @returns {MobileEnvironment} */
function parseMobileEnvironment(value) {
  if (!value) {
    throw new Error(
      "MOBILE_ENVIRONMENT is not set. Use dev, stage, or prod (see .env.example / Doppler).",
    );
  }

  if (value === "dev" || value === "stage" || value === "prod") {
    return value;
  }

  throw new Error(
    `Unknown MOBILE_ENVIRONMENT: ${value}. Expected dev, stage, or prod.`,
  );
}

module.exports = {
  parseMobileEnvironment,
  resolveConvexUrl,
};
