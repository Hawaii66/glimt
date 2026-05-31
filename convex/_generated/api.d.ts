/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_providers_apple from "../auth/providers/apple.js";
import type * as auth_providers_appleProvider from "../auth/providers/appleProvider.js";
import type * as auth_providers_appleSchemas from "../auth/providers/appleSchemas.js";
import type * as crons from "../crons.js";
import type * as friendGroups from "../friendGroups.js";
import type * as friends from "../friends.js";
import type * as http from "../http.js";
import type * as journals from "../journals.js";
import type * as lib_accentTheme from "../lib/accentTheme.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_friendGroups from "../lib/friendGroups.js";
import type * as lib_journalTimezone from "../lib/journalTimezone.js";
import type * as lib_friends from "../lib/friends.js";
import type * as lib_meetLock from "../lib/meetLock.js";
import type * as lib_random from "../lib/random.js";
import type * as lib_requireEnv from "../lib/requireEnv.js";
import type * as lib_userError from "../lib/userError.js";
import type * as meetUnlock from "../meetUnlock.js";
import type * as test from "../test.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "auth/providers/apple": typeof auth_providers_apple;
  "auth/providers/appleProvider": typeof auth_providers_appleProvider;
  "auth/providers/appleSchemas": typeof auth_providers_appleSchemas;
  crons: typeof crons;
  friendGroups: typeof friendGroups;
  friends: typeof friends;
  http: typeof http;
  journals: typeof journals;
  "lib/accentTheme": typeof lib_accentTheme;
  "lib/auth": typeof lib_auth;
  "lib/dates": typeof lib_dates;
  "lib/friendGroups": typeof lib_friendGroups;
  "lib/journalTimezone": typeof lib_journalTimezone;
  "lib/friends": typeof lib_friends;
  "lib/meetLock": typeof lib_meetLock;
  "lib/random": typeof lib_random;
  "lib/requireEnv": typeof lib_requireEnv;
  "lib/userError": typeof lib_userError;
  meetUnlock: typeof meetUnlock;
  test: typeof test;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
