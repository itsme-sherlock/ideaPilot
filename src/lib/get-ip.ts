// lib/get-ip.ts
import { headers } from 'next/headers';

export function getClientIp(): string {
  const xForwardedFor = headers().get('x-forwarded-for');
  let ip = xForwardedFor?.split(',')[0]?.trim() || 'unknown';

  // Normalize localhost variants
  if (['::1', '127.0.0.1', 'localhost', 'unknown'].includes(ip)) {
    return '127.0.0.1';
  }

  return ip;
}