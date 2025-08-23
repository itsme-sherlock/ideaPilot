// lib/getClientIp.ts
import { headers } from 'next/headers';

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const xForwardedFor = headersList.get('x-forwarded-for');
  let ip = xForwardedFor?.split(',')[0]?.trim() || 'unknown';

  // Normalize all localhost variants to '127.0.0.1'
  if (
    ip === '::1' || 
    ip === '::ffff:127.0.0.1' || 
    ip.startsWith('127.0.0.1') || 
    ip === 'localhost' ||
    ip === 'unknown'
  ) {
    return '127.0.0.1';
  }

  return ip; // For real public IPs
}