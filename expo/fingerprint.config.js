/** @type {import('expo/fingerprint').Config} */
const config = {
  ignorePaths: [
    "../convex/**",
    "../.convex/**",
    "../.agents/**",
    "../.claude/**",
    "../glimt.sh",
    "../README.md",
  ],
  sourceSkips: [
    "ExpoConfigVersions",
    "ExpoConfigRuntimeVersionIfString",
    "PackageJsonAndroidAndIosScriptsIfNotContainRun",
    "ExpoConfigName",
    "ExpoConfigSlug",
    "ExpoConfigIosBundleIdentifier",
    "ExpoConfigAndroidPackage",
  ],
};

module.exports = config;
