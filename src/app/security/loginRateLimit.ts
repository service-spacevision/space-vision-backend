type AttemptState = {
  attempts: number;
  windowStartedAt: number;
  blockedUntil: number;
};

const attemptStore = new Map<string, AttemptState>();

const parseNumberEnv = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const WINDOW_MS = parseNumberEnv(
  process.env.LOGIN_RATE_LIMIT_WINDOW_MS,
  15 * 60 * 1000,
);
const MAX_ATTEMPTS = parseNumberEnv(
  process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  5,
);
const BLOCK_MS = parseNumberEnv(
  process.env.LOGIN_RATE_LIMIT_BLOCK_MS,
  15 * 60 * 1000,
);

const pruneStore = (now: number): void => {
  if (attemptStore.size < 1000) return;

  for (const [key, state] of attemptStore.entries()) {
    const expiredWindow = now - state.windowStartedAt > WINDOW_MS;
    const notBlocked = state.blockedUntil <= now;
    if (expiredWindow && notBlocked) {
      attemptStore.delete(key);
    }
  }
};

export const getLoginRateLimitKey = (ip: string, email: string): string =>
  `${ip.toLowerCase()}|${email.toLowerCase()}`;

export const getClientIp = (headers: Headers): string => {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstHop = forwardedFor.split(',')[0]?.trim();
    if (firstHop) return firstHop;
  }

  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return 'unknown';
};

export const checkLoginRateLimit = (
  key: string,
): { blocked: boolean; retryAfterSeconds?: number } => {
  const now = Date.now();
  pruneStore(now);

  const state = attemptStore.get(key);
  if (!state) {
    return { blocked: false };
  }

  if (state.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((state.blockedUntil - now) / 1000);
    return { blocked: true, retryAfterSeconds };
  }

  if (now - state.windowStartedAt > WINDOW_MS) {
    attemptStore.delete(key);
    return { blocked: false };
  }

  return { blocked: false };
};

export const registerLoginFailure = (
  key: string,
): { blockedNow: boolean; retryAfterSeconds?: number } => {
  const now = Date.now();
  pruneStore(now);

  const current = attemptStore.get(key);
  if (!current || now - current.windowStartedAt > WINDOW_MS) {
    attemptStore.set(key, {
      attempts: 1,
      windowStartedAt: now,
      blockedUntil: 0,
    });
    return { blockedNow: false };
  }

  const attempts = current.attempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    current.attempts = attempts;
    current.blockedUntil = now + BLOCK_MS;
    attemptStore.set(key, current);
    return {
      blockedNow: true,
      retryAfterSeconds: Math.ceil(BLOCK_MS / 1000),
    };
  }

  current.attempts = attempts;
  attemptStore.set(key, current);
  return { blockedNow: false };
};

export const clearLoginFailures = (key: string): void => {
  attemptStore.delete(key);
};
