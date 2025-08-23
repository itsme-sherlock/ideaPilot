// app/test/rate-limit/route.ts
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const { allowed, timeLeft } = await rateLimit();

  return Response.json({
    allowed,
    timeLeft,
    retryIn: timeLeft ? `${Math.ceil(timeLeft / 1000)} seconds` : null,
  });
}