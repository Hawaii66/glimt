import type { ConfigContext, ExpoConfig } from "expo/config";

const easProjectId = process.env.EAS_PROJECT_ID;

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = [...(config.plugins ?? []), "expo-updates"] as NonNullable<
    ExpoConfig["plugins"]
  >;

  return {
    ...config,
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
