/**
 * Post-build patch for Cloudflare Pages compatibility.
 *
 * @cloudflare/next-on-pages v1.13.x rejects /_not-found when Next.js 15 outputs
 * it as a Node.js function (instead of edge). Deleting the function dirs lets CF
 * Pages serve public/404.html for unmatched routes instead.
 */

const fs = require("fs");
const path = require("path");

const funcsDir = path.resolve(__dirname, "../.vercel/output/functions");

const toRemove = ["_not-found.func", "_not-found.rsc.func", "_error.func"];

for (const dir of toRemove) {
  const target = path.join(funcsDir, dir);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  }
}
