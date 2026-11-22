import { STATUS_EVENT, reducedMotion } from './lib/animation';

let cleanupConnections = () => {};

function initConnections() {
  cleanupConnections();
  const scene = document.querySelector<SVGSVGElement>('.homelab-scene > svg');
  if (!scene) return;
  const devices = scene.querySelectorAll<SVGElement>('[data-scene-device]');
  const cables = scene.querySelectorAll<SVGElement>('[data-connects]');
  const labels = scene.querySelectorAll<SVGElement>('[data-scene-label]');
  const panel = document.querySelector<HTMLElement>('[data-scene-details]');
  const list = panel?.querySelector('ul');
  const title = panel?.querySelector<HTMLElement>('[data-scene-details-title]');
  const description = document.getElementById('scene-device-description');
  const controller = new AbortController();
  let hovered: string | undefined;
  let focused: string | undefined;
  let activeDevice: string | undefined;
  let typingAnimations: Animation[] = [];
  const findDevice = (id: string) => Array.from(devices).find((item) => item.dataset.sceneDevice === id);

  // "> nuc [up]" for monitored devices; unmonitored ones just show their name.
  function renderTitle(id?: string, device?: SVGElement) {
    if (!title) return;
    title.textContent = id ? `> ${device?.dataset.hardwareLabel ?? id}` : '';
    const status = device?.hasAttribute('data-hardware-check') ? device.dataset.status : undefined;
    if (status !== 'online' && status !== 'offline') return;
    const badge = document.createElement('span');
    badge.className = status === 'online' ? 'status-online' : 'status-offline';
    badge.textContent = status === 'online' ? ' [up]' : ' [down]';
    title.append(badge);
  }

  function highlight(id?: string) {
    if (id === activeDevice) return;
    activeDevice = id;
    typingAnimations.forEach((animation) => animation.cancel());
    typingAnimations = [];
    if (id) scene!.setAttribute('data-scene-active', '');
    else scene!.removeAttribute('data-scene-active');
    cables.forEach((cable) => cable.classList.toggle('is-highlighted', Boolean(id && cable.dataset.connects?.split(' ').includes(id))));
    labels.forEach((label) => label.classList.toggle('is-highlighted', Boolean(id && label.dataset.sceneLabel?.split(' ').includes(id))));
    const device = id ? findDevice(id) : undefined;
    const details = device?.dataset.details?.split('|');
    renderTitle(id, device);
    if (panel && list) {
      panel.hidden = !details?.length;
      list.replaceChildren(...(details ?? []).map((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      }));
      if (details?.length && title && !reducedMotion.matches) {
        let delay = 0;
        try {
          [title, ...Array.from(list.children)].forEach((line) => {
            const characters = (line.textContent?.length ?? 0) + (line === title ? 0 : 2);
            const duration = Math.max(80, characters * 14);
            const animation = line.animate(
              [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
              { duration, delay, easing: `steps(${Math.max(1, characters)}, end)`, fill: 'both' },
            );
            animation.onfinish = () => animation.cancel();
            typingAnimations.push(animation);
            delay += duration + 20;
          });
        } catch {
          typingAnimations.forEach((animation) => animation.cancel());
          typingAnimations = [];
        }
      }
    }
    if (description) description.textContent = details?.join(', ') ?? '';
  }

  devices.forEach((device) => {
    device.setAttribute('aria-describedby', 'scene-device-description');
    const id = device.dataset.sceneDevice;
    device.addEventListener('pointerenter', () => { hovered = id; highlight(focused ?? hovered); }, { signal: controller.signal });
    device.addEventListener('pointerleave', () => { if (hovered === id) hovered = undefined; highlight(focused ?? hovered); }, { signal: controller.signal });
    device.addEventListener('focus', () => { focused = id; highlight(focused); }, { signal: controller.signal });
    device.addEventListener('blur', () => { if (focused === id) focused = undefined; highlight(focused ?? hovered); }, { signal: controller.signal });
  });

  document.addEventListener(STATUS_EVENT, () => {
    if (activeDevice) renderTitle(activeDevice, findDevice(activeDevice));
  }, { signal: controller.signal });

  cleanupConnections = () => { controller.abort(); highlight(); };
}

document.addEventListener('astro:page-load', initConnections);
document.addEventListener('astro:before-swap', () => cleanupConnections());
