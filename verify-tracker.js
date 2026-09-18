#!/usr/bin/env node
// Structural gate for the tracker. Run from the repo root: node verify-tracker.js
// Exit 0 = safe to commit (warnings may print). Exit 1 = DO NOT COMMIT.
//
// Since 18 Sep 2026 the data lives in data/*.js, not inside index.html. Each file is
// one assignment whose right-hand side is strict JSON, so this gate parses it properly
// instead of regexing a script block.
const fs = require('fs'), path = require('path');
const fail = [], warn = [], info = [];

const TABS = [
  { tab: 'rfp',  file: 'data/rfps.js', v: 'RFPS', key: 'rfps', caps: { title: 90, elig: 200 } },
  { tab: 'fund', file: 'data/fund.js', v: 'FUND', key: 'list', caps: {} },
  { tab: 'sled', file: 'data/sled.js', v: 'SLED', key: 'sled', caps: { title: 90, scope: 300 } },
];

function load(file, v) {
  if (!fs.existsSync(file)) { fail.push('missing data file: ' + file); return null; }
  const raw = fs.readFileSync(file, 'utf8').trim();
  const pre = 'window.' + v + '=';
  if (!raw.startsWith(pre)) { fail.push(file + ' must start with "' + pre + '"'); return null; }
  try { return JSON.parse(raw.slice(pre.length).replace(/;\s*$/, '')); }
  catch (e) { fail.push(file + ' is not valid JSON after the assignment: ' + e.message); return null; }
}

const MON = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
function parse(d) {
  const m = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(String(d).trim());
  if (!m) return null;
  const mo = MON[m[2].slice(0,3).toLowerCase()];
  return mo === undefined ? null : new Date(Date.UTC(+m[3], mo, +m[1]));
}
const dup = a => [...new Set(a.filter((v,i) => a.indexOf(v) !== i))];

let newest = null;
const loaded = {};
for (const t of TABS) {
  const groups = load(t.file, t.v);
  if (!groups) continue;
  loaded[t.tab] = groups;
  if (!Array.isArray(groups)) { fail.push(t.file + ': expected an array of date groups'); continue; }

  // one group per date
  const labels = groups.map(g => g.found);
  const d = dup(labels);
  if (d.length) fail.push(t.file + ': duplicate date group(s): ' + d.join(' | ') +
    ' -- merge new rows into the existing group, never add a second one');

  const dates = labels.map(parse).filter(Boolean).sort((a,b) => b-a);
  if (dates.length && (!newest || dates[0] > newest)) newest = dates[0];

  const rows = groups.flatMap(g => g[t.key] || []);
  if (!rows.length) fail.push(t.file + ': no rows found under key "' + t.key + '"');

  // field caps: these keep the page and the agent's read small
  for (const [f, max] of Object.entries(t.caps)) {
    const over = rows.filter(r => typeof r[f] === 'string' && r[f].length > max);
    if (over.length) fail.push(t.file + ': ' + over.length + ' row(s) exceed the ' + f +
      ' cap of ' + max + ' chars (longest ' + Math.max(...over.map(r => r[f].length)) +
      ') -- shorten them, the detail belongs on the linked page');
  }

  // every RFP and SLED row needs a route to market
  if (t.tab !== 'fund') {
    const missing = rows.filter(r => !r.primes || !String(r.primes).trim()).length;
    if (missing) fail.push(t.file + ': ' + missing + ' row(s) have no primes value -- every row needs a route to market');
    const todo = rows.filter(r => /not yet researched/i.test(r.primes || '')).length;
    if (todo) warn.push(t.file + ': ' + todo + ' row(s) name no firm yet');
    const nolink = rows.filter(r => !r.link).length;
    if (nolink) warn.push(t.file + ': ' + nolink + ' row(s) with no link');
    const ids = dup(rows.map(r => r.id).filter(v => v && v !== '—'));
    if (ids.length) warn.push(t.file + ': repeated id: ' + ids.join(' | '));
  }
  info.push(t.file + ': ' + groups.length + ' groups, ' + rows.length + ' rows, ' +
    (fs.statSync(t.file).size/1024).toFixed(0) + ' KB');
}

// refs map, and no dangling @refs
if (fs.existsSync('data/refs.js')) {
  const refs = load('data/refs.js', 'REFS') || {};
  const used = new Set();
  for (const t of TABS) for (const g of (loaded[t.tab] || [])) for (const r of (g[t.key] || []))
    for (const f of ['link','src','primesrc'])
      if (typeof r[f] === 'string' && r[f].startsWith('@')) used.add(r[f].slice(1));
  const missing = [...used].filter(k => !(k in refs));
  if (missing.length) fail.push('data/refs.js: missing keys referenced by rows: ' + missing.join(', '));
} else fail.push('missing data/refs.js');

// archive index must point at files that exist
if (fs.existsSync('data/archive/index.js')) {
  const arch = load('data/archive/index.js', 'ARCHIVES') || [];
  for (const a of arch) if (!fs.existsSync(a.file)) fail.push('archive index lists a missing file: ' + a.file);
  if (arch.length) info.push('archive: ' + arch.length + ' month file(s)');
} else fail.push('missing data/archive/index.js');

// index.html must stay presentation only
const html = fs.readFileSync('index.html', 'utf8');
if (/\bconst\s+(RFPS|FUND|SLED)\s*=\s*\[/.test(html))
  fail.push('index.html contains an inline data array again -- data belongs in data/*.js');
for (const f of ['data/refs.js','data/rfps.js','data/fund.js','data/sled.js','data/archive/index.js'])
  if (!html.includes('src="' + f + '"')) fail.push('index.html no longer loads ' + f);
info.push('index.html: ' + (html.length/1024).toFixed(0) + ' KB');

// footers agree with each other and with the newest group
const stamps = [...new Set([...html.matchAll(/Generated (\d+ \w+ \d{4})/g)].map(x => x[1]))];
if (stamps.length !== 1) fail.push('footer dates disagree across tabs: ' + stamps.join(' | '));
else if (newest) {
  const f = parse(stamps[0]);
  if (!f) fail.push('cannot parse footer date "' + stamps[0] + '"');
  else if (f.getTime() !== newest.getTime())
    fail.push('footer says "' + stamps[0] + '" but the newest date group is ' +
      newest.toISOString().slice(0,10) + ' -- update the Generated line to match');
}
const todayUTC = (() => {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Karachi', year:'numeric', month:'2-digit', day:'2-digit' })
    .format(new Date()).split('-');
  return new Date(Date.UTC(+p[0], +p[1]-1, +p[2]));
})();
if (newest) {
  if (newest > todayUTC) fail.push('newest date group is in the future: ' + newest.toISOString().slice(0,10));
  else if (newest < todayUTC) info.push('newest date group is ' + newest.toISOString().slice(0,10) +
    ', today is ' + todayUTC.toISOString().slice(0,10) + ' -- no run yet today (not an error)');
}

// each tab's note box must carry a paragraph for the newest group
{
  const noteDates = [...html.matchAll(/<b>(?:Latest delta,?\s*)?(\d+ \w+ \d{4})[.<]/g)]
    .map(x => parse(x[1])).filter(Boolean).sort((a,b) => b-a);
  if (newest && noteDates.length && noteDates[0] < newest)
    fail.push('newest note-box paragraph is ' + noteDates[0].toISOString().slice(0,10) +
      ' but the newest date group is ' + newest.toISOString().slice(0,10) +
      ' -- add a dated paragraph summarising today');
}

info.forEach(i => console.log('INFO  ' + i));
warn.forEach(w => console.log('WARN  ' + w));
fail.forEach(f => console.log('FAIL  ' + f));
console.log(fail.length ? '\nDO NOT COMMIT: ' + fail.length + ' blocking issue(s).'
                        : '\nOK to commit' + (warn.length ? ' (' + warn.length + ' warning(s) above)' : '') + '.');
process.exit(fail.length ? 1 : 0);
