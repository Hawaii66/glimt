/** @type {import('expo/fingerprint').Config} */
const config = {
  sourceSkips: [
    // App version / build numbers change often without native changes
    "ExpoConfigVersions",
    "ExpoConfigRuntimeVersionIfString",
    "PackageJsonAndroidAndIosScriptsIfNotContainRun",
    // Name, slug, icons differ per MOBILE_ENVIRONMENT but share one EAS project
    "ExpoConfigName",
    "ExpoConfigSlug",
  ],
};

module.exports = config;
