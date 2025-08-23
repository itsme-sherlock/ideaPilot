import { getClientIp } from "./get-ip";

// lib/rate-limit.ts
interface RateLimit {
  count: number;
  windowStart: number;
}

const requests = new Map<string, RateLimit>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 1;

export async function rateLimit(): Promise<{ allowed: boolean; timeLeft?: number }> {
  const ip = await getClientIp();
  // Get the current time in milliseconds
  const now = Date.now();

  // Fetch the current rate limit record for the IP
  const record = requests.get(ip);

  if (record) {
    // Check if the time window has expired
    const timeElapsedSinceWindowStart = now - record.windowStart;
    if (timeElapsedSinceWindowStart >= WINDOW_MS) {
      // Window expired — remove old record and start fresh
      requests.delete(ip);
      requests.set(ip, { count: 1, windowStart: now });
      return { allowed: true };
    } 

    // Within window — check count
    if (record.count >= MAX_REQUESTS) {
      const timeLeft = WINDOW_MS - timeElapsedSinceWindowStart;
      // Calculate the time left in the window until the rate limit is reset
      return { allowed: false, timeLeft };
    }

    // Increment and allow
    record.count++;
    // No need to .set() — the record is already mutated
    return { allowed: true };
  }

  // First time from this IP
  requests.set(ip, { count: 1, windowStart: now });
  return { allowed: true };
}
