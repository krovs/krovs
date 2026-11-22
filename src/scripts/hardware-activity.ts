import { STATUS_EVENT, createScheduler, random, reducedMotion } from './lib/animation';

let stopActivity = () => {};

function startActivity() {
  stopActivity();
  if (reducedMotion.matches || document.hidden) return;

  // LEDs of monitored devices only blink while the device is online; switch ports always do.
  const leds = (device: string, selector: string) => {
    const element = document.querySelector<SVGElement>(`.homelab-scene [data-scene-device="${device}"]`);
    const monitored = element?.hasAttribute('data-hardware-check');
    return element && (!monitored || element.dataset.status === 'online') ? Array.from(element.querySelectorAll<SVGElement>(selector)) : [];
  };
  const groups = [leds('nas', '[data-nas-disk-led]'), leds('router', '[data-router-port-led]'), leds('switch', '[data-switch-port-led]')];
  const scheduler = createScheduler();

  function animateGroup(group: SVGElement[]) {
    if (!group.length) return;
    let previous = -1;
    function flicker() {
      let index = Math.floor(random(0, group.length));
      if (group.length > 1 && index === previous) index = (index + 1) % group.length;
      previous = index;
      const led = group[index];
      led.setAttribute('data-led-dim', '');
      scheduler.after(() => {
        led.removeAttribute('data-led-dim');
        scheduler.after(flicker, random(100, 900));
      }, random(80, 220));
    }
    scheduler.after(flicker, random(100, 900));
  }

  groups.forEach(animateGroup);
  stopActivity = () => {
    scheduler.stop();
    groups.flat().forEach((led) => led.removeAttribute('data-led-dim'));
  };
}

document.addEventListener('astro:page-load', startActivity);
document.addEventListener(STATUS_EVENT, startActivity);
document.addEventListener('astro:before-swap', () => stopActivity());
document.addEventListener('visibilitychange', startActivity);
reducedMotion.addEventListener('change', startActivity);
