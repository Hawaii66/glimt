import type { ConfigContext, ExpoConfig } from "expo/config";

const { envToInfo, parseMobileEnvironment, resolveConvexUrl } =
  require("./environment.js") as {
    envToInfo: (env: "dev" | "stage" | "prod") => {
      name: string;
      icon: string;
      iconAndroid: string;
      version: string;
      runtimeVersion: string;
      scheme: string;
      bundleIdentifier: string;
    };
    parseMobileEnvironment: (
      value: string | undefined,
    ) => "dev" | "stage" | "prod";
    resolveConvexUrl: (env: "dev" | "stage" | "prod") => string | undefined;
  };

const DEFAULT_EAS_PROJECT_ID = "b92605ee-1590-47dd-a260-11dc4b24b3bf";
const easProjectId = process.env.EAS_PROJECT_ID ?? DEFAULT_EAS_PROJECT_ID;

function buildPlugins(
  envIcon: string,
  bundleIdentifier: string,
): NonNullable<ExpoConfig["plugins"]> {
  return [
    "expo-router",
    "expo-apple-authentication",
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
    "expo-updates",
    "expo-background-task",
    [
      "expo-camera",
      {
        cameraPermission:
          "Allow $(PRODUCT_NAME) to access your camera to capture glimts.",
        microphonePermission: false,
        recordAudioAndroid: false,
        barcodeScannerEnabled: true,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow $(PRODUCT_NAME) to access your photos to share glimts.",
        cameraPermission:
          "Allow $(PRODUCT_NAME) to access your camera to capture glimts.",
        microphonePermission: false,
      },
    ],
    [
      "expo-media-library",
      {
        photosPermission:
          "Allow $(PRODUCT_NAME) to access your photos to save and share glimts.",
        savePhotosPermission:
          "Allow $(PRODUCT_NAME) to save photos to your library.",
        isAccessMediaLocationEnabled: true,
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location when tagging glimts.",
        locationWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location when tagging glimts.",
      },
    ],
    [
      "expo-sharing",
      {
        ios: {
          enabled: true,
          activationRule: {
            supportsImageWithMaxCount: 5,
          },
        },
        android: {
          enabled: true,
          singleShareMimeTypes: ["image/*"],
          multipleShareMimeTypes: ["image/*"],
        },
      },
    ],
    [
      "expo-widgets",
      {
        groupIdentifier: `group.${bundleIdentifier}`,
        widgets: [
          {
            name: "FriendGlimt",
            displayName: "Glimt",
            description: "A random friend's latest moment.",
            supportedFamilies: ["systemSmall", "systemMedium", "systemLarge"],
            contentMarginsDisabled: true,
          },
          {
            name: "FriendGlimtCamera",
            displayName: "Glimt Camera",
            description: "Take a photo.",
            supportedFamilies: ["systemSmall"],
            contentMarginsDisabled: true,
          },
        ],
      },
    ],
    "./plugins/withIosExtensionVersions",
  ];
}

export default ({ config }: ConfigContext): ExpoConfig => {
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
      usesAppleSignIn: true,
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
    plugins: buildPlugins(envInfo.icon, envInfo.bundleIdentifier),
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
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
