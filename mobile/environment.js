/** @typedef {"dev" | "stage" | "prod"} MobileEnvironment */

/** @typedef {{
 *   name: string;
 *   icon: string;
 *   iconAndroid: string;
 *   version: string;
 *   runtimeVersion: string;
 *   scheme: string;
 *   bundleIdentifier: string;
 * }} EnvInfo */

/** @param {string | undefined} value @returns {MobileEnvironment} */
function parseMobileEnvironment(value) {
  if (!value) {
    throw new Error(
      "MOBILE_ENVIRONMENT is not set. Use dev, stage, or prod (see mobile/.env.example).",
    );
  }

  if (value === "dev" || value === "stage" || value === "prod") {
    return value;
  }

  throw new Error(`Unknown MOBILE_ENVIRONMENT: ${value}. Expected dev, stage, or prod.`);
}

/** @param {MobileEnvironment} env @returns {EnvInfo} */
function envToInfo(env) {
  switch (env) {
    case "dev":
      return {
        name: "Glimt Dev",
        icon: "./assets/images/icon-dev.png",
        iconAndroid: "./assets/images/icon-android-dev.png",
        version: "0.0.1",
        runtimeVersion: "0.0.1",
        scheme: "glimt-dev",
        bundleIdentifier: "app.glimt.mobile.dev",
      };
    case "stage":
      return {
        name: "Glimt Stage",
        icon: "./assets/images/icon-stage.png",
        iconAndroid: "./assets/images/icon-android-stage.png",
        version: "0.0.1",
        runtimeVersion: "0.0.1",
        scheme: "glimt-stage",
        bundleIdentifier: "app.glimt.mobile.stage",
      };
    case "prod":
      return {
        name: "Glimt",
        icon: "./assets/images/icon.png",
        iconAndroid: "./assets/images/android-icon-foreground.png",
        version: "0.0.1",
        runtimeVersion: "0.0.1",
        scheme: "glimt",
        bundleIdentifier: "app.glimt.mobile",
      };
  }
}

module.exports = {
  parseMobileEnvironment,
  envToInfo,
};
