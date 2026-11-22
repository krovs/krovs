import { REFERENCE_WIDTH, TRAFFIC_SPEED } from '../diagrams/traffic.mjs';

function normalizeTrafficSpeed() {
  document.querySelectorAll<SVGSVGElement>('.homelab-diagram > svg').forEach((diagram) => {
    const width = diagram.viewBox.baseVal.width;
    if (!width) return;
    const speed = TRAFFIC_SPEED * width / REFERENCE_WIDTH;

    diagram.querySelectorAll<SVGCircleElement>('.diagram-traffic').forEach((dot) => {
      const motion = dot.querySelector<SVGAnimateMotionElement>('animateMotion');
      const pathData = motion?.getAttribute('path');
      if (!motion || !pathData) return;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('visibility', 'hidden');
      diagram.appendChild(path);
      const length = path.getTotalLength();
      path.remove();
      if (!length) return;
      const duration = `${(length / speed).toFixed(2)}s`;
      motion.setAttribute('dur', duration);
      dot.querySelector('animate[attributeName="visibility"]')?.setAttribute('dur', duration);
    });
    diagram.setCurrentTime(0);
  });
}

document.addEventListener('astro:page-load', normalizeTrafficSpeed);
