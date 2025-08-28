// lib/rate-limit.ts
import { createClient } from '@/lib/supabase/server';
import { getClientIp } from './get-ip';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 1;

export async function rateLimit(): Promise<{ allowed: boolean; timeLeft?: number }> {
  const ip = getClientIp();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - WINDOW_MS).toISOString();

  console.log('Checking rate limit for:', ip);
  console.log('Window:', WINDOW_MS);
  console.log('Max requests:', MAX_REQUESTS);

  const supabase = createClient();

  // Count how many times this IP has submitted in the last hour
  const { data, error } = await supabase
    .from('usage_logs')
    .select('created_at', { count: 'exact' })
    .eq('ip_address', ip)
    .gte('created_at', oneHourAgo);

  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Fail open — allow if DB fails
  }

  const count = data.length;
  console.log('Count:', count);

  if (count >= MAX_REQUESTS) {
    // Find the oldest request in the window
    const sorted = data.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const oldest = new Date(sorted[0].created_at).getTime();
    const timeLeft = WINDOW_MS - (now.getTime() - oldest);
    console.log('Oldest request:', new Date(oldest).toISOString());
    console.log('Time left:', timeLeft);
    
    return { allowed: false, timeLeft };
  }

  // Log this request
  await supabase.from('usage_logs').insert({
    ip_address: ip,
    created_at: now.toISOString()
  });

  console.log('Allowed!');
  return { allowed: true };
}
