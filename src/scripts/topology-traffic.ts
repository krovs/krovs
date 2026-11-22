import { TRAFFIC_SPEED } from "../diagrams/traffic.mjs";
import { trafficRoutes } from "../diagrams/topology";
import { STATUS_EVENT, animateDot, createDot, createScheduler, pick, random, reducedMotion } from "./lib/animation";

let stopAnimation = () => {};

function startTraffic() {
  stopAnimation();
  const group = document.querySelector<SVGGElement>('.topology-traffic');
  if (!group || reducedMotion.matches || document.hidden) return;
  const scheduler = createScheduler();

  const wifi = document.querySelector<SVGGElement>('.topology-nodes [data-node="ap"]');
  let signal = 3;
  function changeSignal() {
    if (!wifi?.isConnected) return;
    const next = Math.floor(random(1, 4));
    function step() {
      signal += Math.sign(next - signal);
      wifi!.dataset.signal = String(signal);
      if (signal !== next) scheduler.after(step, 350);
      else scheduler.after(changeSignal, random(2500, 7000));
    }
    step();
  }
  if (wifi) scheduler.after(changeSignal, random(2500, 7000));

  const isOnline = (name: string) => document.querySelector<SVGGElement>(`.topology-nodes [data-node="${name}"]`)?.dataset.status === 'online';

  function travel() {
    if (!group!.isConnected) return;
    const available = trafficRoutes.filter((path) => path.nodes.every(isOnline));
    if (!available.length) { scheduler.after(travel, 3000); return; }
    const { points, outbound } = pick(available);
    const lengths = points.slice(1).map((point, i) => Math.hypot(point[0] - points[i][0], point[1] - points[i][1]));
    const total = lengths.reduce((sum, length) => sum + length, 0);
    const dot = createDot(group!, outbound ? 'topology-traffic-outbound' : undefined);
    animateDot(scheduler, dot, total / TRAFFIC_SPEED * 1000, (progress) => {
      let distance = progress * total;
      let segment = 0;
      while (segment < lengths.length - 1 && distance > lengths[segment]) distance -= lengths[segment++];
      const ratio = distance / lengths[segment];
      const from = points[segment], to = points[segment + 1];
      return { x: from[0] + (to[0] - from[0]) * ratio, y: from[1] + (to[1] - from[1]) * ratio };
    }, () => scheduler.after(travel, random(800, 4000)));
  }

  for (let i = 0; i < 3; i++) scheduler.after(travel, random(0, 3500));
  stopAnimation = () => {
    scheduler.stop();
    wifi?.removeAttribute('data-signal');
    group.replaceChildren();
  };
}

document.addEventListener('astro:page-load', startTraffic);
document.addEventListener(STATUS_EVENT, startTraffic);
document.addEventListener('astro:before-swap', () => stopAnimation());
document.addEventListener('visibilitychange', startTraffic);
reducedMotion.addEventListener('change', startTraffic);
