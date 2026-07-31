import { rmSync } from "node:fs";
import { resolve } from "node:path";

const nextDirectory = resolve(process.cwd(), ".next");
rmSync(nextDirectory, { recursive: true, force: true });
console.log("Removed stale Next.js generated cache: .next");
