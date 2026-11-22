import { TRAFFIC_SPEED, REFERENCE_WIDTH } from "../diagrams/traffic.mjs";
import { diagramIcons } from "../diagrams/icons.mjs";

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function renderDiagram(source) {
  let diagram;
  try { diagram = JSON.parse(source); }
  catch (error) { throw new Error(`Invalid homelab-diagram JSON: ${error.message}`); }

  if (typeof diagram.title !== 'string' || !diagram.title.trim() || !Array.isArray(diagram.nodes) || !Array.isArray(diagram.edges)) {
    throw new Error('A homelab-diagram needs a title, nodes, and edges.');
  }
  const nodes = new Map();
  for (const node of diagram.nodes) {
    if (typeof node.id !== 'string' || !node.id || nodes.has(node.id) || !Number.isFinite(node.x) || !Number.isFinite(node.y) || (node.label !== undefined && typeof node.label !== 'string')) {
      throw new Error(`Invalid or duplicate node in homelab-diagram "${diagram.title}".`);
    }
    if (node.icon !== undefined && !Object.hasOwn(diagramIcons, node.icon)) {
      throw new Error(`Unknown icon "${node.icon}" for node "${node.id}" in homelab-diagram "${diagram.title}".`);
    }
    nodes.set(node.id, node);
  }

  const paths = diagram.edges.map((edge) => {
    const from = nodes.get(edge.from), to = nodes.get(edge.to);
    if (!from || !to || (from.x === to.x && from.y === to.y) || (edge.dashed !== undefined && typeof edge.dashed !== 'boolean') || (edge.viaY !== undefined && !Number.isFinite(edge.viaY))) throw new Error(`Invalid edge in homelab-diagram "${diagram.title}".`);
    const middleY = edge.viaY ?? (from.y + to.y) / 2;
    const direct = from.y === to.y && edge.viaY === undefined;
    const points = direct ? [[from.x, from.y], [to.x, to.y]] : [[from.x, from.y], [from.x, middleY], [to.x, middleY], [to.x, to.y]];
    return { from: edge.from, to: edge.to, points, d: direct ? `M${from.x} ${from.y} H${to.x}` : `M${from.x} ${from.y} V${middleY} H${to.x} V${to.y}`, dashed: edge.dashed, length: Math.abs(to.x - from.x) + (direct ? 0 : Math.abs(middleY - from.y) + Math.abs(to.y - middleY)) };
  });
  const nodeList = [...nodes.values()];
  if (!nodeList.length) throw new Error(`The homelab-diagram "${diagram.title}" needs at least one node.`);
  // Crop unused SVG space while leaving room for labels.
  const minX = Math.floor(Math.min(...nodeList.map(({ id, label = id, x }) => x - Math.max(18, label.length * 5))) - 8);
  const maxX = Math.ceil(Math.max(...nodeList.map(({ id, label = id, x }) => x + Math.max(18, label.length * 5))) + 8);
  const minY = Math.floor(Math.min(...nodeList.map(({ y }) => y - 50)));
  const maxY = Math.ceil(Math.max(...nodeList.map(({ y }) => y + (y >= 200 ? 55 : 15))));
  const diagramViewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  const labelSize = ((maxX - minX) * 0.033).toFixed(2);
  const title = escapeHtml(diagram.title);
  // Merge overlapping collinear segments so shared branches are drawn once.
  const segments = new Map();
  for (const { points, dashed } of paths) {
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1], [x2, y2] = points[i];
      if (x1 === x2 && y1 === y2) continue;
      const horizontal = y1 === y2;
      const fixed = horizontal ? y1 : x1;
      const start = Math.min(horizontal ? x1 : y1, horizontal ? x2 : y2);
      const end = Math.max(horizontal ? x1 : y1, horizontal ? x2 : y2);
      const key = `${horizontal ? 'h' : 'v'}:${fixed}:${Boolean(dashed)}`;
      if (!segments.has(key)) segments.set(key, { horizontal, fixed, dashed, intervals: [] });
      segments.get(key).intervals.push([start, end]);
    }
  }
  const lines = [...segments.values()].flatMap(({ horizontal, fixed, dashed, intervals }) => {
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [start, end] of intervals) {
      const last = merged[merged.length - 1];
      if (last && start <= last[1]) last[1] = Math.max(last[1], end);
      else merged.push([start, end]);
    }
    return merged.map(([start, end]) => `<path class="diagram-line${dashed ? ' diagram-line-dashed' : ''}" d="${horizontal ? `M${start} ${fixed} H${end}` : `M${fixed} ${start} V${end}`}" />`);
  }).join('');
  let trafficPaths = paths.slice(0, 3);
  if (diagram.traffic !== undefined) {
    if (!Array.isArray(diagram.traffic)) throw new Error(`Invalid traffic routes in homelab-diagram "${diagram.title}".`);
    trafficPaths = diagram.traffic.map((route) => {
      if (!Array.isArray(route) || route.length < 2) throw new Error(`Invalid traffic route in homelab-diagram "${diagram.title}".`);
      const segments = route.slice(1).map((to, i) => paths.find((path) => path.from === route[i] && path.to === to));
      if (segments.some((segment) => !segment)) throw new Error(`Traffic route references a missing edge in homelab-diagram "${diagram.title}".`);
      return {
        d: segments.map((segment, index) => index === 0 ? segment.d : segment.d.replace(/^M[^ ]+ [^ ]+\s*/, '')).join(' '),
        length: segments.reduce((total, segment) => total + segment.length, 0),
      };
    });
  }
  const traffic = trafficPaths.map(({ d, length }, index) => {
    const speed = TRAFFIC_SPEED * (maxX - minX) / REFERENCE_WIDTH;
    const duration = (length / speed).toFixed(2), delay = index * 1.5;
    return `<circle class="diagram-traffic" r="3" visibility="hidden"><animate attributeName="visibility" values="visible;visible" dur="${duration}s" begin="${delay}s" repeatCount="indefinite" /><animateMotion dur="${duration}s" begin="${delay}s" repeatCount="indefinite" path="${d}" /></circle>`;
  }).join('');
  const icons = [...nodes.values()].map(({ id, label = id, icon = "box", x, y }) => `<g class="diagram-node" transform="translate(${x} ${y})"><svg x="-12" y="-12" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">${diagramIcons[icon]}</svg><text y="${y >= 200 ? 40 : -26}">${escapeHtml(label)}</text></g>`).join('');
  return `<figure class="homelab-diagram"><svg viewBox="${diagramViewBox}" style="--diagram-label-size: ${labelSize}px" role="img" aria-label="${title}">${lines}${traffic}${icons}</svg></figure>`;
}

export default {
  name: 'homelab-diagrams',
  code(node, context) {
    if (node.lang === 'homelab-diagram') {
      context.replaceNode(node, { type: 'html', value: renderDiagram(node.value) });
    }
  },
};
