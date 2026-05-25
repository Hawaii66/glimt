import Constants from "expo-constants";

import {
  type MobileEnvironment,
  envToInfo,
  parseMobileEnvironment,
} from "../../environment";

export type { MobileEnvironment, EnvInfo } from "../../environment";
export { envToInfo, parseMobileEnvironment } from "../../environment";

export function getMobileEnvironment(): MobileEnvironment {
  const fromExtra = Constants.expoConfig?.extra?.mobileEnvironment;

  if (typeof fromExtra === "string") {
    return parseMobileEnvironment(fromExtra);
  }

  return parseMobileEnvironment(process.env.MOBILE_ENVIRONMENT);
}

export function getEnvInfo() {
  return envToInfo(getMobileEnvironment());
}
