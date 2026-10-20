// Syntax-checks every ES-module JS file without needing Cypress installed (CI pre-flight).
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === 'node_modules' ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);

const files = walk('cypress').filter((f) => f.endsWith('.js'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'syn-'));
let failed = 0;
for (const f of files) {
  const t = path.join(tmp, `${path.basename(f)}.mjs`);
  fs.copyFileSync(f, t);
  try { execFileSync(process.execPath, ['--check', t], { stdio: 'pipe' }); }
  catch (e) { failed++; console.error(`SYNTAX ERROR in ${f}\n${e.stderr}`); }
}
try { execFileSync(process.execPath, ['--check', 'cypress.config.js'], { stdio: 'pipe' }); }
catch (e) { failed++; console.error(`SYNTAX ERROR in cypress.config.js\n${e.stderr}`); }
console.log(`${files.length + 1} files checked, ${failed} failed`);
process.exit(failed ? 1 : 0);
