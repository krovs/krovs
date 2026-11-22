import { expect, test } from 'bun:test';
import { parseBadge } from '../src/healthchecks-badge.ts';

test('only a known single-check badge is translated to online or offline', () => {
  expect(parseBadge({ total: 1, status: 'up' })).toBe('online');
  expect(parseBadge({ total: 1, status: 'down' })).toBe('offline');
  expect(parseBadge({ total: 1, status: 'late' })).toBe('unknown');
  expect(parseBadge({ total: 0, status: 'up' })).toBe('unknown');
  expect(parseBadge({ total: 2, status: 'up' })).toBe('unknown');
  expect(parseBadge(null)).toBe('unknown');
});
