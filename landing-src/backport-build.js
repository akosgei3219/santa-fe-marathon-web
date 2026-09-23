const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = __dirname;
// PARAMETERISED COPY OF build.js -- back-port verification only.
// usage: node backport-build.js <in.src.html> <out.prod.html>
// Writes ONLY to the path given, never to either canonical prod artifact.
const SRC = path.resolve(process.argv[2]);
const OUTFILE = path.resolve(process.argv[3]);

const html = fs.readFileSync(SRC, "utf8");

// -- extract pieces from the current page (copy/design source of truth) --
const styleM = html.match(/<style>([\s\S]*?)<\/style>/);
if (!styleM) throw new Error("style block not found");
const customCss = styleM[1];

const scriptM = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
if (!scriptM) throw new Error("babel script not found");
let body = scriptM[1];
const cut = body.indexOf("const RACE_START");
if (cut < 0) throw new Error("RACE_START marker not found");
body = body.slice(cut);
body = body.replace(
  'ReactDOM.createRoot(document.getElementById("root")).render(<App/>);',
  'createRoot(document.getElementById("root")).render(<App/>);'
);
if (body.includes("ReactDOM")) throw new Error("unexpected ReactDOM reference remains");

const header = `import React, {useState, useEffect, useMemo, useRef} from "react";
import {createRoot} from "react-dom/client";
import {Award, Shirt, Soup, Timer, Camera, Backpack, Mountain, Menu, X, ChevronDown, ChevronRight, Accessibility, Facebook, Instagram, Twitter} from "lucide-react";
const ICONS = {Award, Shirt, Soup, Timer, Camera, Backpack, Mountain, Menu, X, ChevronDown, ChevronRight, Accessibility, Facebook, Instagram, Twitter};
function Ic({name, size = 22, color}) {
  const C = ICONS[name];
  if (C) return <C size={size} strokeWidth={2} color={color || "currentColor"} aria-hidden="true"/>;
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>;
}
`;
fs.mkdirSync(path.join(ROOT, "src"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "src", "app.jsx"), header + body);

// -- shims so react/react-dom resolve to the CDN globals (kept external) --
fs.mkdirSync(path.join(ROOT, "shim"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "shim", "react.js"), "module.exports = window.React;\n");
fs.writeFileSync(path.join(ROOT, "shim", "react-dom-client.js"),
  "module.exports = { createRoot: (el) => window.ReactDOM.createRoot(el) };\n");

// -- bundle app + used lucide icons only --
execSync('npx esbuild src/app.jsx --bundle --minify --loader:.jsx=jsx ' +
  '--alias:react=./shim/react.js --alias:react-dom/client=./shim/react-dom-client.js ' +
  '--outfile=dist-bundle.js', { cwd: ROOT, stdio: "inherit" });

// -- compile tailwind statically from the classes the app actually uses --
fs.writeFileSync(path.join(ROOT, "tailwind.config.js"),
  "module.exports = { content: ['./src/app.jsx'], corePlugins: { preflight: true } };\n");
fs.writeFileSync(path.join(ROOT, "tw-input.css"), "@tailwind base;\n@tailwind utilities;\n");
execSync("npx tailwindcss -c tailwind.config.js -i tw-input.css -o dist-tailwind.css --minify", { cwd: ROOT, stdio: "inherit" });

// -- assemble the production page (tokens kept for the two variants) --
const bundle = fs.readFileSync(path.join(ROOT, "dist-bundle.js"), "utf8");
const tw = fs.readFileSync(path.join(ROOT, "dist-tailwind.css"), "utf8");
// minify the hand-written css block too (identical rules, fewer bytes)
fs.writeFileSync(path.join(ROOT, "custom.css"), customCss);
execSync("npx esbuild custom.css --minify --outfile=dist-custom.css", { cwd: ROOT, stdio: "inherit" });
const customMin = fs.readFileSync(path.join(ROOT, "dist-custom.css"), "utf8");
// carry the JSON-LD structured-data block through from the source file
const ldA = html.indexOf('<script type="application/ld+json">');
const ldB = html.indexOf('</scr' + 'ipt>', ldA);
const LDJSON = ldA > -1 ? html.slice(ldA, ldB + 9) + "\n" : "";
const out = `<title>Run Santa Fe 2026</title>
${LDJSON}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Martian+Mono:wght@400;700&display=swap">
<style>${tw}</style>
<style>${customMin}</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>${bundle}</script>
`;
fs.writeFileSync(OUTFILE, out);
console.log("prod src assembled:", Math.round(out.length / 1024) + " KB",
  "| bundle:", Math.round(bundle.length / 1024) + " KB",
  "| tailwind css:", Math.round(tw.length / 1024) + " KB");
