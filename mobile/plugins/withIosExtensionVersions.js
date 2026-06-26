const { withXcodeProject } = require("expo/config-plugins");

/** Extension targets that must match the host app marketing version. */
const EXTENSION_BUNDLE_ID_SUFFIXES = [
  "expo-sharing-extension",
  "ExpoWidgetsTarget",
];

function bundleIdMatchesExtension(value) {
  if (!value) return false;
  const normalized = String(value).replace(/"/g, "");
  return EXTENSION_BUNDLE_ID_SUFFIXES.some((suffix) => normalized.includes(suffix));
}

/**
 * expo-widgets hardcodes MARKETING_VERSION to "1.0" in its Xcode target.
 * Sync extension targets to config.version / ios.buildNumber so signing succeeds.
 */
function withIosExtensionVersions(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const marketingVersion = config.version ?? "1.0.0";
    const currentProjectVersion = String(config.ios?.buildNumber ?? "1");

    const section = project.pbxXCBuildConfigurationSection;
    if (!section) {
      return config;
    }

    for (const key of Object.keys(section)) {
      const buildConfig = section[key];
      if (!buildConfig?.buildSettings) continue;

      const bundleId = buildConfig.buildSettings.PRODUCT_BUNDLE_IDENTIFIER;
      if (!bundleIdMatchesExtension(bundleId)) continue;

      buildConfig.buildSettings.MARKETING_VERSION = marketingVersion;
      buildConfig.buildSettings.CURRENT_PROJECT_VERSION = currentProjectVersion;
    }

    return config;
  });
}

module.exports = withIosExtensionVersions;
