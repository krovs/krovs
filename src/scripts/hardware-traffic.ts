import { REFERENCE_WIDTH, TRAFFIC_SPEED } from '../diagrams/traffic.mjs';
import { LAYOUT_EVENT, STATUS_EVENT, animateDot, createDot, createScheduler, pick, random, reducedMotion } from './lib/animation';

let stopTraffic = () => {};

function startTraffic() {
  stopTraffic();
  const scene = document.querySelector<SVGSVGElement>('.homelab-scene > svg');
  const group = scene?.querySelector<SVGGElement>('.scene-traffic');
  if (!scene || !group || reducedMotion.matches || document.hidden) return;

  const cables = Array.from(scene.querySelectorAll<SVGPathElement>('.scene-cable'));
  const devices = new Map(Array.from(scene.querySelectorAll<SVGElement>('[data-scene-device]')).map((device) => [device.dataset.sceneDevice, device]));
  const speed = TRAFFIC_SPEED * scene.viewBox.baseVal.width / REFERENCE_WIDTH;
  const scheduler = createScheduler();
  // Unmonitored devices (switch, AP…) always carry traffic; monitored ones only while online.
  const isUp = (id: string) => {
    const device = devices.get(id);
    return Boolean(device && (!device.hasAttribute('data-hardware-check') || device.dataset.status === 'online'));
  };

  function travel() {
    if (!scene!.isConnected) return;
    const available = cables.filter((cable) => cable.dataset.connects!.split(' ').every(isUp));
    if (!available.length) { scheduler.after(travel, 3000); return; }
    const cable = pick(available);
    const length = cable.getTotalLength();
    if (!length) { scheduler.after(travel, 1000); return; }
    const reverse = Math.random() < .5;
    const [from, to] = cable.dataset.connects!.split(' ');
    // data-uplink names the internet-side end; dots heading there are outbound.
    const outbound = cable.dataset.uplink === (reverse ? from : to);
    const dot = createDot(group!, outbound ? 'scene-traffic-outbound' : undefined);
    animateDot(scheduler, dot, length / speed * 1000,
      (progress) => cable.getPointAtLength(length * (reverse ? 1 - progress : progress)),
      () => scheduler.after(travel, random(800, 4000)));
  }

  for (let i = 0; i < 3; i++) scheduler.after(travel, random(0, 3000));
  stopTraffic = () => { scheduler.stop(); group.replaceChildren(); };
}

document.addEventListener('astro:page-load', startTraffic);
document.addEventListener(STATUS_EVENT, startTraffic);
document.addEventListener(LAYOUT_EVENT, startTraffic);
document.addEventListener('astro:before-swap', () => stopTraffic());
document.addEventListener('visibilitychange', startTraffic);
reducedMotion.addEventListener('change', startTraffic);
