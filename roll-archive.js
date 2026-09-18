#!/usr/bin/env node
// Moves date groups older than LIVE_WINDOW_DAYS out of the live data files and into
// data/archive/<tab>-<YYYY-MM>.js, then rebuilds data/archive/index.js.
// Safe to run repeatedly: it only ever moves groups that are past the window.
// Undated groups (method notes, "carried from earlier runs") always stay live.
const fs = require('fs'), path = require('path');
const LIVE_WINDOW_DAYS = 30;

const TABS = [
  { tab:'rfps', file:'data/rfps.js', v:'RFPS', key:'rfps' },
  { tab:'fund', file:'data/fund.js', v:'FUND', key:'list' },
  { tab:'sled', file:'data/sled.js', v:'SLED', key:'sled' },
];
const MON = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
const parse = d => {
  const m = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(String(d).trim());
  if (!m) return null;
  const mo = MON[m[2].slice(0,3).toLowerCase()];
  return mo === undefined ? null : new Date(Date.UTC(+m[3], mo, +m[1]));
};
const readAssign = (file, v) => {
  const raw = fs.readFileSync(file,'utf8').trim(), pre = 'window.'+v+'=';
  if (!raw.startsWith(pre)) throw new Error(file+' does not start with '+pre);
  return JSON.parse(raw.slice(pre.length).replace(/;\s*$/,''));
};
const today = (() => {
  const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'})
    .format(new Date()).split('-');
  return new Date(Date.UTC(+p[0], +p[1]-1, +p[2]));
})();

fs.mkdirSync('data/archive', { recursive: true });
let movedTotal = 0;

for (const t of TABS) {
  const groups = readAssign(t.file, t.v);
  const keep = [], out = [];
  for (const g of groups) {
    const d = parse(g.found);
    if (d && (today - d) / 86400000 > LIVE_WINDOW_DAYS) out.push([g, d]); else keep.push(g);
  }
  if (!out.length) continue;

  const byMonth = {};
  for (const [g, d] of out) {
    const m = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
    (byMonth[m] = byMonth[m] || []).push(g);
  }
  for (const [month, gs] of Object.entries(byMonth)) {
    const file = `data/archive/${t.tab}-${month}.js`;
    let existing = [];
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file,'utf8').trim();
      const i = raw.indexOf('],['), j = raw.indexOf(',[');       // payload is the 3rd arg
      const m = /^window\.registerArchive\("[^"]+","[^"]+",([\s\S]*)\);\s*$/.exec(raw);
      if (m) existing = JSON.parse(m[1]);
    }
    const seen = new Set(existing.map(g => g.found));
    const merged = existing.concat(gs.filter(g => !seen.has(g.found)));
    merged.sort((a,b) => parse(b.found) - parse(a.found));
    fs.writeFileSync(file, `window.registerArchive(${JSON.stringify(t.tab)},${JSON.stringify(month)},`
      + JSON.stringify(merged) + ');\n');
    console.log(`archived ${gs.length} group(s) -> ${file}`);
    movedTotal += gs.length;
  }
  fs.writeFileSync(t.file, `window.${t.v}=` + JSON.stringify(keep) + ';\n');
}

// rebuild the index from whatever is actually on disk
const index = [];
for (const f of fs.readdirSync('data/archive').filter(f => /^(rfps|fund|sled)-\d{4}-\d{2}\.js$/.test(f))) {
  const m = /^(\w+)-(\d{4}-\d{2})\.js$/.exec(f);
  const tab = m[1], month = m[2];
  const key = TABS.find(t => t.tab === tab).key;
  const raw = fs.readFileSync('data/archive/'+f,'utf8').trim();
  const mm = /^window\.registerArchive\("[^"]+","[^"]+",([\s\S]*)\);\s*$/.exec(raw);
  const groups = mm ? JSON.parse(mm[1]) : [];
  index.push({ tab, month, file:'data/archive/'+f, groups:groups.length,
               rows: groups.reduce((a,g) => a + (g[key]||[]).length, 0) });
}
index.sort((a,b) => a.tab === b.tab ? b.month.localeCompare(a.month) : a.tab.localeCompare(b.tab));
fs.writeFileSync('data/archive/index.js', 'window.ARCHIVES=' + JSON.stringify(index) + ';\n');

console.log(movedTotal ? `rolled ${movedTotal} group(s); archive index now lists ${index.length} file(s)`
                       : `nothing older than ${LIVE_WINDOW_DAYS} days; archive index lists ${index.length} file(s)`);
