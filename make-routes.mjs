import fs from "fs";
import { geoEqualEarth } from "d3-geo";

const W = 1600;
const H = 800;
const projection = geoEqualEarth().fitSize([W, H], { type: "Sphere" });

const cities = {
  Manila: [120.98, 14.6],
  Tokyo: [139.69, 35.69],
  Seoul: [126.98, 37.57],
  Singapore: [103.82, 1.35],
  Delhi: [77.21, 28.61],
  Dubai: [55.27, 25.2],
  Istanbul: [28.98, 41.01],
  London: [-0.13, 51.51],
  Paris: [2.35, 48.86],
  "Cape Town": [18.42, -33.92],
  "New York": [-74.0, 40.71],
  "Los Angeles": [-118.24, 34.05],
  "Mexico City": [-99.13, 19.43],
  Rio: [-43.17, -22.91],
  Sydney: [151.21, -33.87],
};

const routes = [
  ["Manila", "Tokyo"],
  ["Singapore", "Manila"],
  ["Manila", "Sydney"],
  ["Dubai", "Manila"],
  ["Delhi", "Tokyo"],
  ["Seoul", "Singapore"],
  ["London", "Dubai"],
  ["Paris", "Delhi"],
  ["Istanbul", "Cape Town"],
  ["New York", "London"],
  ["Paris", "New York"],
  ["Los Angeles", "New York"],
  ["Mexico City", "Rio"],
  ["Rio", "Cape Town"],
  ["Cape Town", "Dubai"],
  ["Sydney", "Singapore"],
];

const pt = (name) => projection(cities[name]);

// Kurbadong ruta: lumiliko pataas para magmukhang flight path
function curve(a, b) {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  let nx = -dy / dist;
  let ny = dx / dist;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const lift = dist * 0.22;
  const cx = mx + nx * lift;
  const cy = my + ny * lift;
  const f = (n) => n.toFixed(1);
  return `M${f(x1)} ${f(y1)} Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}`;
}

const paths = routes.map(([from, to]) => curve(pt(from), pt(to)));

const lines = paths
  .map(
    (d) =>
      `<path d="${d}" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="1.2" stroke-dasharray="2 6" stroke-linecap="round"/>`,
  )
  .join("\n  ");

const dots = Object.keys(cities)
  .map((name, i) => {
    const [x, y] = pt(name);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="white"/>
  <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="none" stroke="white">
    <animate attributeName="r" values="3;14" dur="3s" begin="-${(i * 0.4).toFixed(1)}s" repeatCount="indefinite"/>
    <animate attributeName="stroke-opacity" values="0.8;0" dur="3s" begin="-${(i * 0.4).toFixed(1)}s" repeatCount="indefinite"/>
  </circle>`;
  })
  .join("\n  ");

const planes = paths
  .map((d, i) => {
    const dur = 9 + ((i * 1.7) % 9);
    const begin = `-${((i * 2.3) % dur).toFixed(1)}s`;
    return `<g opacity="0">
    <path d="M9 0 L-6 -5.5 L-2.5 0 L-6 5.5 Z" fill="white"/>
    <animateMotion dur="${dur.toFixed(1)}s" begin="${begin}" repeatCount="indefinite" rotate="auto" path="${d}"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" dur="${dur.toFixed(1)}s" begin="${begin}" repeatCount="indefinite"/>
  </g>`;
  })
  .join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  ${lines}
  ${dots}
  ${planes}
</svg>`;

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/world-routes.svg", svg);
console.log("Done: public/world-routes.svg");
