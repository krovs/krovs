import { reducedMotion } from './lib/animation';

type Theme = 'light' | 'dark';

function storedTheme(): Theme {
  try { return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'; }
  catch { return 'dark'; }
}

// The sun/moon icon follows html[data-theme] in CSS; only the logo video needs swapping.
function render(theme: Theme) {
  const logo = document.querySelector<HTMLVideoElement>('#logo-video');
  const src = logo?.dataset[theme === 'dark' ? 'darkSrc' : 'lightSrc'];
  if (logo && src && logo.getAttribute('src') !== src) {
    logo.src = src;
    logo.load();
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  render(theme);
}

function toggleTheme(event: Event) {
  event.preventDefault();
  const next: Theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  const swap = () => {
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch { /* private mode */ }
  };
  if (!document.startViewTransition || reducedMotion.matches) { swap(); return; }
  const root = document.documentElement;
  root.classList.add('theme-transition');
  document.startViewTransition(swap).finished.finally(() => root.classList.remove('theme-transition'));
}

// The button is persisted across navigations, so bind it once.
document.addEventListener('click', (event) => {
  if ((event.target as Element).closest('#theme-switch')) toggleTheme(event);
});
// The incoming page carries the server default; restore the stored theme before it paints.
document.addEventListener('astro:after-swap', () => applyTheme(storedTheme()));
document.addEventListener('astro:page-load', () => render(storedTheme()));
