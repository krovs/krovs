export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Fired on document whenever healthcheck statuses are (re)applied to the page. */
export const STATUS_EVENT = 'homelab:status-change';

/** Fired when the drawing switches between its wide and narrow (phone) layout. */
export const LAYOUT_EVENT = 'homelab:layout-change';

export const random = (min: number, max: number) => min + Math.random() * (max - min);
export const pick = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

/** Timeouts and animation frames that can all be cancelled at once. */
export function createScheduler() {
  const timers = new Set<number>();
  const frames = new Set<number>();
  let stopped = false;
  return {
    get stopped() { return stopped; },
    after(callback: () => void, delay: number) {
      const id = window.setTimeout(() => { timers.delete(id); if (!stopped) callback(); }, delay);
      timers.add(id);
    },
    frame(callback: (time: number) => void) {
      const id = requestAnimationFrame((time) => { frames.delete(id); if (!stopped) callback(time); });
      frames.add(id);
    },
    stop() {
      stopped = true;
      timers.forEach(clearTimeout);
      frames.forEach(cancelAnimationFrame);
      timers.clear();
      frames.clear();
    },
  };
}

/** Moves a dot along a path over `duration` ms; `pointAt` maps progress 0..1 to coordinates. */
export function animateDot(
  scheduler: ReturnType<typeof createScheduler>,
  dot: SVGCircleElement,
  duration: number,
  pointAt: (progress: number) => { x: number; y: number },
  done: () => void,
) {
  let start: number | undefined;
  const step = (now: number) => {
    if (!dot.isConnected) return;
    start ??= now;
    const progress = Math.min((now - start) / duration, 1);
    const point = pointAt(progress);
    dot.setAttribute('cx', String(point.x));
    dot.setAttribute('cy', String(point.y));
    if (progress < 1) scheduler.frame(step);
    else { dot.remove(); done(); }
  };
  scheduler.frame(step);
}

export function createDot(group: SVGGElement, className?: string) {
  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('r', '3');
  if (className) dot.classList.add(className);
  group.append(dot);
  return dot;
}
