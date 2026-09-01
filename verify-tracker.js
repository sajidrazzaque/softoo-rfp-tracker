#!/usr/bin/env node
// Structural gate for index.html. Run from the repo root: node verify-tracker.js
// Exit 0 = safe to commit (warnings may print). Exit 1 = DO NOT COMMIT.
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');

const html = fs.readFileSync('index.html', 'utf8');
const fail = [], warn = [];

// 1. JS syntax of the whole script block.
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) fail.push('no <script> block found in index.html');
else {
  const tmp = path.join(os.tmpdir(), 'tracker-check-' + process.pid + '.js');
  fs.writeFileSync(tmp, m[1]);
  try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); }
  catch (e) { fail.push('JS syntax error: ' + String(e.stderr || e.message).trim().split('\n')[0]); }
  finally { try { fs.unlinkSync(tmp); } catch (_) {} }
}

function block(name) {
  const r = new RegExp('const ' + name + '=\\[([\\s\\S]*?)\\n\\];');
  const b = html.match(r);
  if (!b) { fail.push('array ' + name + ' not found'); return ''; }
  return b[1];
}
const dup = a => [...new Set(a.filter((v, i) => a.indexOf(v) !== i))];

// 2. One group per date, per array. This is the same-day trap: a second run on a
//    date that already has a group must MERGE into it, never append a new one.
for (const name of ['RFPS', 'FUND']) {
  const dates = [...block(name).matchAll(/\{found:"([^"]+)"/g)].map(x => x[1]);
  const d = dup(dates);
  if (d.length) fail.push(name + ': duplicate date group(s): ' + d.join(' | ') +
    ' -- merge the new rows into the existing group instead of adding a second one');
}

// 3. Duplicate rows (inherited duplicates are warnings, not blockers).
for (const [name, re, label] of [['RFPS', /\{id:"([^"]+)"/g, 'id'],
                                 ['SLED', /\{id:"([^"]+)"/g, 'id'],
                                 ['FUND', /\{c:"([^"]+)"/g, 'company']]) {
  const d = dup([...block(name).matchAll(re)].map(x => x[1]));
  if (d.length) warn.push(name + ': repeated ' + label + ': ' + d.join(' | '));
}

// 4. Every row needs a reference. link:null is allowed only if it is deliberate.
for (const name of ['RFPS', 'SLED']) {
  const n = (block(name).match(/link:null/g) || []).length;
  if (n) warn.push(name + ': ' + n + ' row(s) with no link -- add one or say "no public listing" in the row');
}

// 5. Footer date must be today (Asia/Karachi), matching "1 Sep 2026" style.
const today = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi',
  day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()).replace(/,/g, '');
// Node renders September as "Sept" under en-GB; the page uses 3-letter months.
const norm = s => s.replace(/\bSept\b/, 'Sep').trim();
const stamps = [...new Set([...html.matchAll(/Generated (\d+ \w+ \d{4})/g)].map(x => x[1]))];
if (stamps.length !== 1) fail.push('footer dates disagree: ' + stamps.join(' | '));
else if (norm(stamps[0]) !== norm(today)) fail.push('footer says "' + stamps[0] + '", today is "' + today + '"');

warn.forEach(w => console.log('WARN  ' + w));
fail.forEach(f => console.log('FAIL  ' + f));
console.log(fail.length ? '\nDO NOT COMMIT: ' + fail.length + ' blocking issue(s).'
                        : '\nOK to commit' + (warn.length ? ' (' + warn.length + ' warning(s) above)' : '') + '.');
process.exit(fail.length ? 1 : 0);
