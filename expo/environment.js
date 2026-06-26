/** @typedef {"dev" | "stage" | "prod"} MobileEnvironment */

/** @param {MobileEnvironment} env */
function convexUrlEnvVarName(env) {
  switch (env) {
    case "dev":
      return "EXPO_PUBLIC_CONVEX_URL_DEV";
    case "stage":
      return "EXPO_PUBLIC_CONVEX_URL_STAGE";
    case "prod":
      return "EXPO_PUBLIC_CONVEX_URL_PROD";
  }
}

/** @param {MobileEnvironment} env @returns {string | undefined} */
function resolveConvexUrl(env) {
  const envVar = convexUrlEnvVarName(env);
  const fromEnv = process.env[envVar];
  if (fromEnv) {
    return fromEnv;
  }

  if (env === "dev" && process.env.EXPO_PUBLIC_CONVEX_URL) {
    return process.env.EXPO_PUBLIC_CONVEX_URL;
  }

  return undefined;
}

/** @param {string | undefined} value @returns {MobileEnvironment} */
function parseMobileEnvironment(value) {
  if (!value) {
    throw new Error(
      "MOBILE_ENVIRONMENT is not set. Use dev, stage, or prod (see .env.example).",
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
  convexUrlEnvVarName,
  resolveConvexUrl,
};
