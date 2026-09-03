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

// 5. Date consistency. The footers must agree with each other AND with the newest
//    date group, which is what catches a run that adds today's rows but forgets the
//    footer. Whether that date is TODAY is only informational: running this checker
//    before today's run has happened is normal and must not block.
const MON = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
function parse(d) {
  const m = /^(\d+)\s+([A-Za-z]+)\s+(\d{4})$/.exec(d.trim());
  if (!m) return null;
  const mo = MON[m[2].slice(0, 3).toLowerCase()];
  return mo === undefined ? null : new Date(Date.UTC(+m[3], mo, +m[1]));
}
const stamps = [...new Set([...html.matchAll(/Generated (\d+ \w+ \d{4})/g)].map(x => x[1]))];
if (stamps.length !== 1) fail.push('footer dates disagree across tabs: ' + stamps.join(' | '));

const newest = [...block('RFPS').matchAll(/\{found:"([^"]+)"/g)]
  .map(x => parse(x[1])).filter(Boolean).sort((a, b) => b - a)[0];

if (stamps.length === 1 && newest) {
  const f = parse(stamps[0]);
  if (!f) fail.push('cannot parse footer date "' + stamps[0] + '"');
  else if (f.getTime() !== newest.getTime())
    fail.push('footer says "' + stamps[0] + '" but the newest date group is ' +
      newest.toISOString().slice(0, 10) + ' -- update the Generated line to match the rows');
}

const todayUTC = (() => {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi',
    year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-');
  return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
})();
if (newest) {
  if (newest > todayUTC) fail.push('newest date group is in the future: ' + newest.toISOString().slice(0, 10));
  else if (newest < todayUTC) console.log('INFO  newest date group is ' + newest.toISOString().slice(0, 10) +
    ', today is ' + todayUTC.toISOString().slice(0, 10) + ' -- no run yet today (not an error)');
}

warn.forEach(w => console.log('WARN  ' + w));
fail.forEach(f => console.log('FAIL  ' + f));
console.log(fail.length ? '\nDO NOT COMMIT: ' + fail.length + ' blocking issue(s).'
                        : '\nOK to commit' + (warn.length ? ' (' + warn.length + ' warning(s) above)' : '') + '.');
process.exit(fail.length ? 1 : 0);
