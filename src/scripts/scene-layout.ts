import { LAYOUT_EVENT } from './lib/animation';

// On phones the VPS cloud sits above the shelf instead of beside it, so the drawing can be larger.
// Elements opt in with `data-narrow` plus `data-narrow-<attribute>`; the wide value is kept in `data-wide-<attribute>`.
const narrow = window.matchMedia('(max-width: 520px)');
const attributes = ['viewBox', 'transform', 'd', 'x', 'y'];

function applyLayout() {
  const elements = document.querySelectorAll<SVGElement>('.homelab-scene [data-narrow]');
  if (!elements.length) return;
  elements.forEach((element) => {
    for (const name of attributes) {
      const key = name.toLowerCase();
      const alternative = element.getAttribute(`data-narrow-${key}`);
      if (alternative === null) continue;
      if (!element.hasAttribute(`data-wide-${key}`)) element.setAttribute(`data-wide-${key}`, element.getAttribute(name) ?? '');
      element.setAttribute(name, narrow.matches ? alternative : element.getAttribute(`data-wide-${key}`)!);
    }
  });
  document.dispatchEvent(new Event(LAYOUT_EVENT));
}

document.addEventListener('astro:page-load', applyLayout);
narrow.addEventListener('change', applyLayout);
