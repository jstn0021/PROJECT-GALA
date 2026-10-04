import fs from "fs";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";

const topo = JSON.parse(
  fs.readFileSync("node_modules/world-atlas/countries-110m.json", "utf8"),
);

const countries = feature(topo, topo.objects.countries);
const borders = mesh(topo, topo.objects.countries, (a, b) => a !== b);

const W = 1600;
const H = 800;
const projection = geoEqualEarth().fitSize([W, H], { type: "Sphere" });
const path = geoPath(projection);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <path d="${path(countries)}" fill="rgba(255,255,255,0.55)" />
  <path d="${path(borders)}" fill="none" stroke="rgba(11,31,51,0.55)" stroke-width="0.6" />
</svg>`;

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/world-map.svg", svg);
console.log("Done: public/world-map.svg");
