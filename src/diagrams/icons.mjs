// Shared SVG shapes for the index topology and Markdown diagrams.
export const diagramIcons = {
  fan: '<path d="M5.643 9.851A2.99 2.99 0 0 0 8.68 10.92c-.61 1.435-1.923 3.3-4.255 4.012a.77.77 0 0 1-.475 0c-1.18-.41-2.278-1.817-2.46-3.43c-.064-.578.508-.965 1.09-.96a6.9 6.9 0 0 0 3.062-.69m5.3-2.438c1.441.615 3.274 1.903 3.986 4.156a.76.76 0 0 1 0 .487c-.421 1.161-1.847 2.241-3.48 2.419c-.581.062-.971-.515-.967-1.1a6.65 6.65 0 0 0-.69-2.976a2.99 2.99 0 0 0 1.15-2.986M8 6a2 2 0 1 1 0 4a2 2 0 0 1 0-4M4.551 1.524c.582-.063.971.515.967 1.1a6.65 6.65 0 0 0 .688 2.974a2.99 2.99 0 0 0-1.149 2.987C3.616 7.97 1.784 6.682 1.072 4.43a.76.76 0 0 1 0-.488c.421-1.16 1.847-2.24 3.48-2.418m7.021-.456a.77.77 0 0 1 .475 0c1.18.41 2.278 1.818 2.46 3.43c.065.579-.507.966-1.089.96a6.9 6.9 0 0 0-3.063.69A2.99 2.99 0 0 0 7.318 5.08c.61-1.435 1.924-3.298 4.255-4.012" />',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18M12 3c-5 5-5 13 0 18"/>',
  router: '<rect x="3" y="12" width="18" height="7" rx="1"/><path d="M7 12V7m10 5V7M6 16h2m3 0h2m3 0h2"/>',
  server: '<rect x="4" y="3" width="16" height="7" rx="1"/><rect x="4" y="14" width="16" height="7" rx="1"/><path d="M7 6.5h2m-2 11h2m5-11h3m-3 11h3"/>',
  nuc: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 9h12M7 14h2m3 0h2m3-1v2"/>',
  switch: '<rect x="3" y="7" width="18" height="10" rx="1"/><path d="M6 11h2m2 0h2m2 0h2m2 0h1M6 14h2m2 0h2m2 0h2"/>',
  wifi: '<path d="M3 9a13 13 0 0 1 18 0" style="opacity:var(--wifi-outer,1)"/><path d="M6 12a9 9 0 0 1 12 0" style="opacity:var(--wifi-middle,1)"/><path d="M9 15a4 4 0 0 1 6 0M12 18v1"/>',
  nas: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 6v12m6-12v12M7 18h.1m10 0h.1"/>',
  pi: '<rect x="3" y="4" width="18" height="16" rx="1"/><rect x="8" y="8" width="7" height="7" rx=".5"/><path d="M6 4V2m3 2V2m3 2V2m3 2V2m3 2V2M3 8H1m2 4H1m2 4H1m20-8h2m-2 4h2m-2 4h2M6 17h2m9-8h2m-2 3h2m-2 3h2"/>',
  network: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v5M5 17v-5h14v5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  git: '<path d="M12 2 22 12 12 22 2 12 12 2Z"/><circle cx="9" cy="8" r="1"/><circle cx="15" cy="14" r="1"/><circle cx="9" cy="16" r="1"/><path d="M9 9v6m1-5 4 3"/>',
  sync: '<path d="M20 8a8 8 0 0 0-14-2L4 8m0-5v5h5M4 16a8 8 0 0 0 14 2l2-2m0 5v-5h-5"/>',
  cluster: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2v7.8M12 14.2V22M2 12h7.8m4.4 0H22M5 5l5.4 5.4m3.2 3.2L19 19M19 5l-5.4 5.4m-3.2 3.2L5 19"/>',
  metrics: '<path d="M3 20h18M5 17V10m5 7V5m5 12v-5m5 5V3"/>',
  logs: '<path d="M5 3h11l3 3v15H5V3Zm10 0v4h4M8 11h8m-8 4h8m-8 4h5"/>',
  shield: '<path d="M12 2 20 5v6c0 5-3 8-8 11-5-3-8-6-8-11V5l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  storage: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 2 4 3 8 3s8-1 8-3V5M4 12v7c0 2 4 3 8 3s8-1 8-3v-7"/>',
  cloud: '<path d="M7 19h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 10a4.5 4.5 0 0 0 1 9Z"/>',
  box: '<path d="M3 7 12 3l9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4m-9 4v10"/>',
};

export const diagramIconSymbols = Object.entries(diagramIcons)
  .map(([name, shape]) => `<symbol id="node-${name}" viewBox="${name === "fan" ? "0 0 16 16" : "0 0 24 24"}">${shape}</symbol>`).join('');
