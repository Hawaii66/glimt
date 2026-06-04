/** @type {import('expo/fingerprint').Config} */
const config = {
  // Monorepo siblings (paths relative to mobile/)
  ignorePaths: [
    "../convex/**",
    "../.convex/**",
    "../.agents/**",
    "../.claude/**",
    "../agent-tools/**",
    "../glimt.sh",
    "../README.md",
  ],
  // Shared workspace package affects JS bundle compatibility
  extraSources: [
    {
      type: "dir",
      filePath: "../packages/date",
      reasons: ["monorepoPackage:@glimt/date"],
    },
  ],
  sourceSkips: [
    // App version / build numbers change often without native changes
    "ExpoConfigVersions",
    "ExpoConfigRuntimeVersionIfString",
    "PackageJsonAndroidAndIosScriptsIfNotContainRun",
    // Name, slug, icons differ per MOBILE_ENVIRONMENT but share one EAS project
    "ExpoConfigName",
    "ExpoConfigSlug",
    // Bundle id / package change per MOBILE_ENVIRONMENT profile, not native code
    "ExpoConfigIosBundleIdentifier",
    "ExpoConfigAndroidPackage",
  ],
};

module.exports = config;
