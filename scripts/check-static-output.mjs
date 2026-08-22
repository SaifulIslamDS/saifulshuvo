import { access, readdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "out");
const required = [
  "index.html",
  "404.html",
  "projects/index.html",
  "blog/index.html",
  "contact/index.html",
  "privacy/index.html",
  "robots.txt",
  "sitemap.xml",
  ".htaccess",
];

const failures = [];
for (const item of required) {
  try { await access(path.join(outDir, item)); }
  catch { failures.push(item); }
}

let projectPages = [];
try {
  const entries = await readdir(path.join(outDir, "projects"), { withFileTypes: true });
  projectPages = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
} catch { /* reported above */ }

if (failures.length) {
  console.error("Static export verification failed. Missing:");
  failures.forEach((item) => console.error(` - out/${item}`));
  process.exit(1);
}

console.log("Static export verification passed.");
console.log(`Project detail directories generated: ${projectPages.length}`);
console.log("Ready for preview cPanel deployment after manual QA.");
