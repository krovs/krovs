import { reducedMotion } from './lib/animation';

// Types each home command on a full page load (not on in-site navigation); output appears instantly, like a real terminal.
const charDelay = 16;
const startDelay = 100;
const enterDelay = 90;
const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

let cancelIntro = () => {};
// Module state survives client-side navigation but resets on a full load or reload.
let initialLoad = true;

function shouldRun(root: Document) {
  return !reducedMotion.matches &&
    root.querySelector('.home-sections > section .terminal-command') !== null;
}

function prepareIntro(root: Document) {
  root.querySelectorAll<HTMLElement>('.home-sections > section').forEach((section) => section.classList.add('terminal-intro-pending'));
  root.querySelector<HTMLElement>('.site > footer')?.classList.add('terminal-intro-pending');
}

function startIntro() {
  cancelIntro();
  const firstPage = initialLoad;
  initialLoad = false;
  if (!firstPage || !shouldRun(document)) return;
  prepareIntro(document);

  const sections = Array.from(document.querySelectorAll<HTMLElement>('.home-sections > section'));
  const footer = document.querySelector<HTMLElement>('.site > footer');
  const commands = sections.map((section) => section.querySelector<HTMLElement>('.terminal-command'));
  const texts = commands.map((command) => command?.textContent ?? '');
  const cursor = document.createElement('span');
  cursor.className = 'terminal-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const controller = new AbortController();
  let timer: number | undefined;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    controller.abort();
    cursor.remove();
    commands.forEach((command, index) => { if (command) command.textContent = texts[index]; });
    sections.forEach((section) => section.classList.remove('terminal-intro-pending', 'terminal-intro-typing'));
    footer?.classList.remove('terminal-intro-pending');
  };
  cancelIntro = finish;
  skipEvents.forEach((type) => window.addEventListener(type, finish, { once: true, passive: true, signal: controller.signal }));

  let sectionIndex = 0;
  let charIndex = 0;
  const step = () => {
    if (finished) return;
    const section = sections[sectionIndex];
    if (!section) { finish(); return; }
    const command = commands[sectionIndex];
    const text = texts[sectionIndex];
    if (!command) {
      section.classList.remove('terminal-intro-pending');
      sectionIndex++;
      timer = window.setTimeout(step, 0);
      return;
    }
    if (charIndex === 0) {
      section.classList.add('terminal-intro-typing');
      command.textContent = '';
      command.after(cursor);
    }
    if (charIndex < text.length) {
      command.textContent = text.slice(0, ++charIndex);
      // Slight jitter so it reads as typing rather than a ticker.
      timer = window.setTimeout(step, charDelay + Math.random() * 10);
      return;
    }
    timer = window.setTimeout(() => {
      if (finished) return;
      cursor.remove();
      section.classList.remove('terminal-intro-pending', 'terminal-intro-typing');
      sectionIndex++;
      charIndex = 0;
      step();
    }, enterDelay);
  };
  timer = window.setTimeout(step, startDelay);
}

document.addEventListener('astro:page-load', startIntro);
document.addEventListener('astro:before-swap', () => cancelIntro());
