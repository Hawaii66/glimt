const TOKEN_PREFIX = "glimt-mock-unlock-v1:";
const SESSION_TTL_MS = 3 * 60 * 1000;
const NONCE_REFRESH_MS = 12_000;

export type MockUnlockTokenPayload = {
  sessionId: string;
  friendId: string;
  isoDate: string;
  hostRole: "show";
  nonce: string;
  exp: number;
};

type ActiveSession = {
  payload: MockUnlockTokenPayload;
  friendId: string;
  isoDate: string;
};

let activeSession: ActiveSession | null = null;

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function encodeMockUnlockToken(
  payload: MockUnlockTokenPayload,
): string {
  return `${TOKEN_PREFIX}${JSON.stringify(payload)}`;
}

export function decodeMockUnlockToken(
  token: string,
): MockUnlockTokenPayload | null {
  if (!token.startsWith(TOKEN_PREFIX)) {
    return null;
  }
  try {
    const parsed = JSON.parse(
      token.slice(TOKEN_PREFIX.length),
    ) as MockUnlockTokenPayload;
    if (
      typeof parsed.sessionId !== "string" ||
      typeof parsed.friendId !== "string" ||
      typeof parsed.isoDate !== "string" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function startMockUnlockSession(
  friendId: string,
  isoDate: string,
): { token: string; expiresAt: number; nonceRefreshMs: number } {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  const payload: MockUnlockTokenPayload = {
    sessionId: `mock-${now}`,
    friendId,
    isoDate,
    hostRole: "show",
    nonce: randomNonce(),
    exp: expiresAt,
  };
  activeSession = { payload, friendId, isoDate };
  return {
    token: encodeMockUnlockToken(payload),
    expiresAt,
    nonceRefreshMs: NONCE_REFRESH_MS,
  };
}

export function refreshMockUnlockSession(): {
  token: string;
  expiresAt: number;
} | null {
  if (!activeSession || activeSession.payload.exp <= Date.now()) {
    activeSession = null;
    return null;
  }
  const payload: MockUnlockTokenPayload = {
    ...activeSession.payload,
    nonce: randomNonce(),
  };
  activeSession = {
    ...activeSession,
    payload,
  };
  return {
    token: encodeMockUnlockToken(payload),
    expiresAt: payload.exp,
  };
}

export function recordMockUnlockScan(token: string): {
  friendId: string;
  isoDate: string;
} | null {
  const payload = decodeMockUnlockToken(token);
  if (!payload || payload.exp <= Date.now()) {
    return null;
  }
  if (
    !activeSession ||
    activeSession.payload.sessionId !== payload.sessionId ||
    activeSession.payload.nonce !== payload.nonce
  ) {
    return null;
  }
  activeSession = null;
  return { friendId: payload.friendId, isoDate: payload.isoDate };
}
