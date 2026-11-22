import { healthchecksBadges } from '../healthchecks-config';
import { parseBadge, type HealthStatus as Status } from '../healthchecks-badge';
import { STATUS_EVENT } from './lib/animation';

// Pages that show live status: the home drawing and the homelab topology.
const STATUS_ROOTS = '.homelab-overview, .homelab-scene';
let generation = 0;
let refreshTimer: number | undefined;
let lastStatuses: Record<string, Status> | undefined;
let lastUpdated = 0;
const refreshInterval = 300_000;

function badgeUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    // Only public badge JSON endpoints belong in browser code, never ping URLs.
    return url.protocol === 'https:' && url.hostname === 'healthchecks.io' &&
      !url.username && !url.password && !url.search && !url.hash &&
      (url.pathname.startsWith('/b/') || url.pathname.startsWith('/badge/')) &&
      url.pathname.endsWith('.json') ? url.href : null;
  } catch { return null; }
}

async function readStatus(value: string | null): Promise<Status> {
  const url = badgeUrl(value);
  if (!url) return 'unknown';
  try {
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return 'unknown';
    return parseBadge(await response.json());
  } catch { return 'unknown'; }
}

function renderStatus(statuses: Record<string, Status>) {
  document.querySelectorAll<SVGElement>('[data-hardware-check]').forEach((device) => {
    const status = statuses[device.dataset.hardwareCheck!] ?? 'unknown';
    device.dataset.status = status;
    const label = device.dataset.hardwareLabel ?? 'device';
    device.setAttribute('aria-label', `${label}: ${status}`);
  });
  document.querySelectorAll<SVGElement>('.homelab-scene [data-connects]').forEach((cable) => {
    const offline = cable.dataset.connects!.split(' ').some((id) => statuses[id] === 'offline');
    cable.classList.toggle('is-offline', offline);
  });
  document.querySelectorAll<HTMLElement>('[data-service-check]').forEach((badge) => {
    const status = statuses[badge.dataset.serviceCheck!] ?? 'unknown';
    badge.classList.remove('status-online', 'status-offline', 'status-unknown');
    badge.classList.add(`status-${status}`);
    const text = badge.querySelector('[data-status-text]');
    if (text) text.textContent = status === 'unknown' ? '[unknown]' : status;
  });
  document.querySelectorAll<SVGGElement>('.topology-map [data-check]').forEach((node) => {
    const status = statuses[node.dataset.check!] ?? 'unknown';
    node.dataset.status = status;
    node.classList.toggle('topology-node-offline', status === 'offline');
    node.setAttribute('aria-label', `${node.dataset.node}: ${status}`);
  });
  document.querySelectorAll<SVGGElement>('.topology-map [data-edge-from]').forEach((edge) => {
    const from = document.querySelector<SVGGElement>(`.topology-map [data-node="${edge.dataset.edgeFrom}"]`);
    const to = document.querySelector<SVGGElement>(`.topology-map [data-node="${edge.dataset.edgeTo}"]`);
    const offline = from?.dataset.status === 'offline' || to?.dataset.status === 'offline';
    const path = edge.querySelector<SVGPathElement>('[data-edge-path]');
    const cross = edge.querySelector<SVGPathElement>('[data-edge-cross]');
    if (path) {
      path.setAttribute('d', (offline ? path.dataset.offlinePath : path.dataset.onlinePath) ?? '');
      path.setAttribute('class', offline ? 'topology-offline-edge' : edge.hasAttribute('data-tailnet') ? 'topology-tailnet' : 'topology-edge');
    }
    if (cross) cross.style.display = offline ? '' : 'none';
  });
  document.dispatchEvent(new Event(STATUS_EVENT));
}

// One-line summary under the drawing, e.g. "# 4/5 up · nuc down · checked 12:13".
function renderCheckedAt() {
  const element = document.querySelector<HTMLElement>('[data-status-summary]');
  if (!element || !lastStatuses || !lastUpdated) return;
  const statuses = lastStatuses;
  const devices = Array.from(document.querySelectorAll<SVGElement>('.homelab-scene [data-hardware-check]')).map((device) => ({
    name: device.dataset.hardwareLabel ?? device.dataset.hardwareCheck!,
    status: statuses[device.dataset.hardwareCheck!] ?? 'unknown',
  }));
  const up = devices.filter((device) => device.status === 'online').length;
  const down = devices.filter((device) => device.status === 'offline').map((device) => device.name);
  const span = (className: string, text: string) => {
    const node = document.createElement('span');
    node.className = className;
    node.textContent = text;
    return node;
  };
  const date = new Date(lastUpdated);
  const time = document.createElement('time');
  time.dateTime = date.toISOString();
  time.textContent = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  const parts: (string | Node)[] = ['# '];
  if (!up && !down.length) parts.push('status unavailable');
  else {
    parts.push(span(down.length ? 'status-unknown' : 'status-online', `${up}/${devices.length} up`));
    if (down.length) parts.push(' · ', span('status-offline', `${down.join(', ')} down`));
  }
  parts.push(' · checked ', time);
  element.replaceChildren(...parts);
}

async function refresh() {
  const current = ++generation;
  const entries = await Promise.all(Object.entries(healthchecksBadges).map(async ([key, url]) => [key, await readStatus(url)] as const));
  if (current !== generation || !document.querySelector(STATUS_ROOTS)) return;
  lastStatuses = Object.fromEntries(entries);
  lastUpdated = Date.now();
  renderStatus(lastStatuses);
  renderCheckedAt();
}

function restoreStatus() {
  renderCheckedAt();
  if (lastStatuses && Date.now() - lastUpdated < refreshInterval && document.querySelector(STATUS_ROOTS)) {
    renderStatus(lastStatuses);
  }
}

function start() {
  window.clearInterval(refreshTimer);
  if (!document.querySelector(STATUS_ROOTS)) return;
  restoreStatus();
  void refresh();
  refreshTimer = window.setInterval(() => { if (!document.hidden) void refresh(); }, refreshInterval);
}

document.addEventListener('astro:after-swap', restoreStatus);
document.addEventListener('astro:page-load', start);
document.addEventListener('astro:before-swap', () => { generation++; window.clearInterval(refreshTimer); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && document.querySelector(STATUS_ROOTS)) void refresh(); });
