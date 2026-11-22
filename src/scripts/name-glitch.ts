import { reducedMotion } from './lib/animation';

window.setInterval(() => {
  const title = document.getElementById('minimal-name');
  if (!title || reducedMotion.matches || document.hidden) return;

  title.classList.add('is-glitching');
  window.setTimeout(() => title.classList.remove('is-glitching'), 500);
}, 10000);
