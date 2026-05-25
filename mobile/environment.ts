export type MobileEnvironment = "dev" | "stage" | "prod";

export type EnvInfo = {
  name: string;
  icon: string;
  iconAndroid: string;
  version: string;
  runtimeVersion: string;
  scheme: string;
  bundleIdentifier: string;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const environment = require("./environment.js") as {
  parseMobileEnvironment(value: string | undefined): MobileEnvironment;
  envToInfo(env: MobileEnvironment): EnvInfo;
};

export const parseMobileEnvironment = environment.parseMobileEnvironment;
export const envToInfo = environment.envToInfo;
