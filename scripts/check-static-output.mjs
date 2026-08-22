import { access, readdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "out");
const emptyBlogBuildSlug = "__saifulshuvo_no_published_posts__";
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
  try {
    await access(path.join(outDir, item));
  } catch {
    failures.push(item);
  }
}

try {
  await access(path.join(outDir, "blog", emptyBlogBuildSlug));
  failures.push(`blog/${emptyBlogBuildSlug} (build-only sentinel must not be deployed)`);
} catch {
  // Correct: sentinel does not exist in final artifact.
}

let projectPages = [];
try {
  const entries = await readdir(path.join(outDir, "projects"), { withFileTypes: true });
  projectPages = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
} catch {
  // Missing projects directory is reported above.
}

if (failures.length) {
  console.error("Static export verification failed. Missing/invalid:");
  failures.forEach((item) => console.error(` - out/${item}`));
  process.exit(1);
}

console.log("Static export verification passed.");
console.log(`Project detail directories generated: ${projectPages.length}`);
console.log("Build-only empty-blog sentinel is absent from deployment output.");
console.log("Ready for cPanel deployment after manual QA.");
