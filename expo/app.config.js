const { envToInfo, parseMobileEnvironment, resolveConvexUrl } =
  require("./environment.js");

const DEFAULT_EAS_PROJECT_ID = "b92605ee-1590-47dd-a260-11dc4b24b3bf";
const easProjectId = process.env.EAS_PROJECT_ID ?? DEFAULT_EAS_PROJECT_ID;

/** @param {string} envIcon */
function buildPlugins(envIcon) {
  return [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: envIcon,
        imageWidth: 100,
        resizeMode: "contain",
        backgroundColor: "#208AEF",
        android: {
          image: "./assets/images/splash-icon.png",
          imageWidth: 76,
        },
      },
    ],
  ];
}

/** @param {import("expo/config").ConfigContext} param0 */
module.exports = ({ config }) => {
  // Default to dev so tooling (eas init, expo config) works without .env.local loaded.
  const mobileEnvironment = parseMobileEnvironment(
    process.env.MOBILE_ENVIRONMENT ?? "dev",
  );
  const envInfo = envToInfo(mobileEnvironment);
  const convexUrl = resolveConvexUrl(mobileEnvironment) ?? "";

  return {
    ...config,
    name: envInfo.name,
    slug: "glimt",
    version: envInfo.version,
    runtimeVersion: envInfo.runtimeVersion,
    orientation: "portrait",
    icon: envInfo.icon,
    scheme: envInfo.scheme,
    userInterfaceStyle: "automatic",
    ios: {
      ...config.ios,
      icon: "./assets/expo.icon",
      bundleIdentifier: envInfo.bundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      ...config.android,
      package: envInfo.bundleIdentifier,
      adaptiveIcon: {
        foregroundImage: envInfo.iconAndroid,
        backgroundColor: "#E6F4FE",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: buildPlugins(envInfo.icon),
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
      autolinkingModuleResolution: true,
    },
    extra: {
      ...config.extra,
      mobileEnvironment,
      convexUrl,
      eas: {
        ...(typeof config.extra?.eas === "object" ? config.extra.eas : {}),
        projectId: easProjectId,
      },
    },
    updates: {
      url: `https://u.expo.dev/${easProjectId}`,
    },
  };
};
