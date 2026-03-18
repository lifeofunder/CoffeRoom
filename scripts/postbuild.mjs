import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "out");
const noJekyllPath = path.join(outDir, ".nojekyll");

fs.mkdirSync(outDir, { recursive: true });
// GitHub Pages иногда использует Jekyll-пайплайн; .nojekyll отключает его и сохраняет структуру Next export.
fs.writeFileSync(noJekyllPath, "");

console.log(`Created ${path.relative(process.cwd(), noJekyllPath)}`);

