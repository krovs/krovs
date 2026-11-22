export type HealthStatus = 'online' | 'offline' | 'unknown';

export function parseBadge(badge: unknown): HealthStatus {
  if (!badge || typeof badge !== 'object') return 'unknown';
  const value = badge as Record<string, unknown>;
  if (value.total !== 1) return 'unknown';
  return value.status === 'up' ? 'online' : value.status === 'down' ? 'offline' : 'unknown';
}
