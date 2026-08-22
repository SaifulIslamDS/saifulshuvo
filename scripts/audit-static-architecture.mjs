import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "src");
const forbidden = [
  "@supabase/",
  "@/lib/supabase",
  '"use server"',
  "from \"next/headers\"",
  "from 'next/headers'",
  "revalidatePath(",
  "revalidateTag(",
];

const files = [];
async function walk(dir) {
  for (const name of await readdir(dir)) {
    const file = path.join(dir, name);
    const info = await stat(file);
    if (info.isDirectory()) await walk(file);
    else if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(name)) files.push(file);
  }
}
await walk(src);

const failures = [];
for (const file of files) {
  const text = await readFile(file, "utf8");
  for (const token of forbidden) {
    if (text.includes(token)) failures.push(`${path.relative(root, file)} contains ${token}`);
  }
}

for (const forbiddenPath of ["src/app/admin", "src/app/api", "src/app/auth", "src/lib/supabase", "supabase", "netlify.toml"]) {
  try { await stat(path.join(root, forbiddenPath)); failures.push(`${forbiddenPath} still exists`); }
  catch { /* expected */ }
}

for (const dynamicPage of [
  "src/app/projects/[slug]/page.tsx",
  "src/app/blog/[slug]/page.tsx",
  "src/app/blog/category/[slug]/page.tsx",
  "src/app/blog/tag/[slug]/page.tsx",
]) {
  const text = await readFile(path.join(root, dynamicPage), "utf8");
  if (!text.includes("generateStaticParams")) failures.push(`${dynamicPage} has no generateStaticParams()`);
  if (!text.includes("dynamicParams = false")) failures.push(`${dynamicPage} does not disable unknown runtime params`);
}

if (failures.length) {
  console.error("Static architecture audit failed:");
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}
console.log(`Static architecture audit passed (${files.length} source files scanned).`);
