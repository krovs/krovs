// Shared by TopologyOverview.astro (markup) and topology-traffic.ts (animation).
// `check` names a healthchecks badge; nodes without one are illustrative and always shown online.
export interface TopologyNode {
  id: string;
  icon: string;
  x: number;
  y: number;
  check?: string;
  label: { x?: number; y: number; anchor?: 'start' | 'end' };
  led?: { x: number; y: number };
  iconY?: number;
}

export const topologyNodes: TopologyNode[] = [
  { id: 'internet', icon: 'globe', x: 300, y: 34, label: { y: -18 } },
  { id: 'router', icon: 'router', x: 180.375, y: 100, check: 'router', label: { x: -16, y: 5, anchor: 'end' }, led: { x: -5.4, y: 2.1 } },
  { id: 'vps', icon: 'server', x: 430.5, y: 100, check: 'vps', label: { x: 16, y: 5, anchor: 'start' }, led: { x: -4.58, y: -5.83 } },
  { id: 'switch', icon: 'switch', x: 300, y: 129, iconY: -8, label: { x: 16, y: 6, anchor: 'start' }, led: { x: 4, y: 3.2 } },
  { id: 'ap', icon: 'wifi', x: 140.5, y: 240, label: { y: 32 } },
  { id: 'nas', icon: 'nas', x: 238.375, y: 240, check: 'nas', label: { y: 32 }, led: { x: -5.42, y: 3.75 } },
  { id: 'pi', icon: 'pi', x: 361.625, y: 240, check: 'pi', label: { y: 32 }, led: { x: -5.42, y: 2.92 } },
  { id: 'nuc', icon: 'nuc', x: 459.5, y: 240, check: 'nuc', label: { y: 32 }, led: { x: -4.58, y: .42 } },
];

// `broken` is the same edge with a gap where `cross` draws the offline marker.
export const topologyEdges = [
  { from: 'internet', to: 'router', path: 'M300 44.5 V60 H180.375 V100', broken: 'M300 44.5 V60 H180.375 V70 M180.375 86 V100', cross: 'M176.375 74 L184.375 82 M184.375 74 L176.375 82' },
  { from: 'internet', to: 'vps', path: 'M300 44.5 V60 H430.5 V100', broken: 'M300 44.5 V60 H430.5 V70 M430.5 86 V100', cross: 'M426.5 74 L434.5 82 M434.5 74 L426.5 82' },
  { from: 'router', to: 'switch', path: 'M180.375 100 V130 H300', broken: 'M180.375 100 V130 H264 M280 130 H300', cross: 'M268 126 L276 134 M276 126 L268 134' },
  { from: 'switch', to: 'ap', path: 'M300 190 H140.5 V229', broken: 'M300 190 H140.5 V202 M140.5 218 V229', cross: 'M136.5 206 L144.5 214 M144.5 206 L136.5 214' },
  { from: 'switch', to: 'nas', path: 'M300 205 H238.375 V229', broken: 'M300 205 H238.375 V207 M238.375 223 V229', cross: 'M234.375 211 L242.375 219 M242.375 211 L234.375 219' },
  { from: 'switch', to: 'pi', path: 'M300 205 H361.625 V229', broken: 'M300 205 H361.625 V207 M361.625 223 V229', cross: 'M357.625 211 L365.625 219 M365.625 211 L357.625 219' },
  { from: 'switch', to: 'nuc', path: 'M300 190 H459.5 V229', broken: 'M300 190 H459.5 V202 M459.5 218 V229', cross: 'M455.5 206 L463.5 214 M463.5 206 L455.5 214' },
  { from: 'router', to: 'vps', tailnet: true, path: 'M180.375 100 H430.5', broken: 'M180.375 100 H297 M313 100 H430.5', cross: 'M301 96 L309 104 M309 96 L301 104' },
];

type Point = [number, number];
export interface TrafficRoute { nodes: string[]; points: Point[]; outbound?: boolean }

const inbound: TrafficRoute[] = [
  { nodes: ['internet', 'router', 'switch', 'ap'], points: [[300, 44.5], [300, 60], [180.375, 60], [180.375, 130], [300, 130], [300, 190], [140.5, 190], [140.5, 229]] },
  { nodes: ['vps', 'router', 'switch', 'nas'], points: [[430.5, 100], [180.375, 100], [180.375, 130], [300, 130], [300, 205], [238.375, 205], [238.375, 229]] },
  { nodes: ['internet', 'router', 'switch', 'nuc'], points: [[300, 44.5], [300, 60], [180.375, 60], [180.375, 130], [300, 130], [300, 190], [459.5, 190], [459.5, 229]] },
];

export const trafficRoutes: TrafficRoute[] = [
  ...inbound,
  { nodes: ['pi', 'switch', 'ap'], points: [[361.625, 229], [361.625, 205], [300, 205], [300, 190], [140.5, 190], [140.5, 229]] },
  { nodes: ['router', 'vps'], points: [[180.375, 100], [430.5, 100]], outbound: true },
  // Outbound traffic mirrors the inbound routes.
  ...inbound.map((route) => ({ nodes: [...route.nodes].reverse(), points: [...route.points].reverse(), outbound: true })),
];
