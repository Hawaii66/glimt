import {
  type MobileEnvironment,
  parseMobileEnvironment,
  resolveConvexUrl,
} from "../environment";

export type { MobileEnvironment };
export { parseMobileEnvironment, resolveConvexUrl };

export function getMobileEnvironment(): MobileEnvironment {
  return parseMobileEnvironment(process.env.MOBILE_ENVIRONMENT);
}
