/** @typedef {"dev" | "prod"} MobileEnvironment */

/** @typedef {{
 *   name: string;
 *   icon: string;
 *   iconAndroid: string;
 *   version: string;
 *   runtimeVersion: string;
 *   scheme: string;
 *   bundleIdentifier: string;
 * }} EnvInfo */

/** @param {MobileEnvironment} env @returns {string | undefined} */
function resolveConvexUrl(env) {
  if (process.env.EXPO_PUBLIC_CONVEX_URL) {
    return process.env.EXPO_PUBLIC_CONVEX_URL;
  }

  const legacyVar = {
    dev: "EXPO_PUBLIC_CONVEX_URL_DEV",
    prod: "EXPO_PUBLIC_CONVEX_URL_PROD",
  }[env];

  return legacyVar ? process.env[legacyVar] : undefined;
}

/** @param {string | undefined} value @returns {MobileEnvironment} */
function parseMobileEnvironment(value) {
  if (!value) {
    throw new Error(
      "MOBILE_ENVIRONMENT is not set. Use dev or prod (see .env.example / Doppler).",
    );
  }

  if (value === "dev" || value === "prod") {
    return value;
  }

  throw new Error(
    `Unknown MOBILE_ENVIRONMENT: ${value}. Expected dev or prod.`,
  );
}

/** @param {MobileEnvironment} env @returns {EnvInfo} */
function envToInfo(env) {
  switch (env) {
    case "dev":
      return {
        name: "Glimt Dev",
        icon: "./assets/images/icon-dev.png",
        iconAndroid: "./assets/images/icon-android-dev.png",
        version: "0.0.11",
        runtimeVersion: "0.0.11",
        scheme: "glimt-dev",
        bundleIdentifier: "com.hawaiidev.glimt.dev",
      };
    case "prod":
      return {
        name: "Glimt",
        icon: "./assets/images/icon.png",
        iconAndroid: "./assets/images/android-icon-foreground.png",
        version: "0.0.1",
        runtimeVersion: "0.0.1",
        scheme: "glimt",
        bundleIdentifier: "com.hawaiidev.glimt",
      };
  }
}

module.exports = {
  parseMobileEnvironment,
  envToInfo,
  resolveConvexUrl,
};
