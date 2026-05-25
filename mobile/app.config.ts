import type { ConfigContext, ExpoConfig } from "expo/config";

const easProjectId = process.env.EAS_PROJECT_ID;

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins: NonNullable<ExpoConfig["plugins"]> = [
    "expo-router",
    [
      "expo-splash-screen",
      {
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
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera to capture glimts.",
        microphonePermission: false,
        recordAudioAndroid: false,
        barcodeScannerEnabled: false,
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
        widgets: [
          {
            name: "FriendGlimt",
            displayName: "Glimt",
            description: "A random friend's latest moment.",
            supportedFamilies: ["systemSmall", "systemMedium"],
          },
        ],
      },
    ],
  ];

  return {
    ...config,
    name: config.name ?? "glimt",
    slug: config.slug ?? "glimt",
    ios: {
      ...config.ios,
      usesAppleSignIn: true,
    },
    plugins,
    runtimeVersion: {
      policy: "appVersion",
    },
    ...(easProjectId
      ? {
          updates: {
            url: `https://u.expo.dev/${easProjectId}`,
          },
          extra: {
            ...config.extra,
            eas: {
              ...(typeof config.extra?.eas === "object" ? config.extra.eas : {}),
              projectId: easProjectId,
            },
          },
        }
      : {}),
  };
};
