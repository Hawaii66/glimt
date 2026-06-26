import Constants from "expo-constants";

import {
  type MobileEnvironment,
  parseMobileEnvironment,
} from "../../environment";

export type { MobileEnvironment, EnvInfo } from "../../environment";
export {
  convexUrlEnvVarName,
  envToInfo,
  parseMobileEnvironment,
  resolveConvexUrl,
} from "../../environment";

export function getMobileEnvironment(): MobileEnvironment {
  const fromExtra = Constants.expoConfig?.extra?.mobileEnvironment;

  if (typeof fromExtra === "string") {
    return parseMobileEnvironment(fromExtra);
  }

  return parseMobileEnvironment(process.env.MOBILE_ENVIRONMENT);
}
