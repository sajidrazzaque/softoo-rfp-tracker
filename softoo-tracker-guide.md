# Softoo Tracker — Daily Build & Deploy Guide
### (This file is BOTH the skill and the memory/spec. A Claude task reads it and follows it end-to-end.)

## GOAL
Every run, rebuild the single-page tracker site `index.html` in THIS repo folder with fresh data,
then commit and push it to GitHub. GitHub is linked to Vercel, so the push auto-deploys the live site.
Repo: https://github.com/sajidrazzaque/softoo-rfp-tracker

The page has a top nav with THREE tabs: **RFP Opportunities**, **Funding Signal Leads**, **SLED Intel**.
It is data-driven from three JavaScript arrays inside `index.html`: `RFPS`, `FUND`, `SLED`.
Your job each run = add today's new items to those arrays (newest date first), keep the design intact,
then push. Do NOT redesign the page. Only touch the data arrays and the "Generated <date>" text.

---

## ONE-TIME PREREQUISITES (verify on first run)
- **This run must happen in Claude Code on Sajid's own Windows machine.** The push needs the GitHub
  credential cached in his Windows user session. A cloud or bridged session (Cowork with this folder
  connected) can sweep, edit and commit, but its shell is sandboxed away from the credential store and
  `git push` fails with `could not read Username for 'https://github.com'`. If that happens, commit and
  hand the push back to Sajid. Do not try to work around it, and never ask him for a token.
- This folder is the local clone and contains `index.html`. If `index.html` is missing, STOP and tell
  Sajid, do not invent the whole page from scratch. One exception: if the clone is empty but
  `git ls-remote origin` shows refs, restore it with `git fetch origin && git checkout -B main origin/main`
  and continue from the restored file.
- Git identity is set: `git config user.name "Sajid Razzaque"` and `git config user.email "sajid.razzaque@softoo.co"`
- Node is on PATH, for the syntax gate in Step 2b.

---

## DAILY WORKFLOW (do these in order)

### Step 1 — Gather today's data (web sweep)
If you have web search/fetch tools, run a quick sweep of the sources in the SPEC below and collect
new items for each of the three tabs. Do NOT repeat items already present in `index.html` (dedupe by
name/ID). Be honest: flag anything unverified; never pad; if a source is blocked, skip it and note so.
If you have NO web access this run, skip refreshing and go to Step 2 using the existing arrays (the site
still rebuilds and stays published) — say clearly in your final reply that data was NOT refreshed.

### Step 2 — Update `index.html`
Open `index.html`. Find the three arrays in the `<script>` block: `const RFPS=[...]`, `const FUND=[...]`,
`const SLED=[...]`. For each tab, add a NEW date group at the TOP (newest first) using the exact object
shape already used in that array (copy an existing entry as your template — do not change field names).
**If a group for today already exists** (a second run on the same date, which happens whenever a manual
run and the 19:00 scheduled run land on one day), MERGE today's new rows into that existing group. Never
add a second group with the same date, and never re-add a row already present: enrich the existing row
instead. `verify-tracker.js` fails the run on a duplicate date group, so this is enforced, not advisory.
Update the "Generated <date>" text near the top of the page to today's date.
**Also add a dated paragraph at the TOP of each tab's honest-note box** summarising what that tab gained today,
and demote the previous "Latest delta" heading to a plain date. This is not optional: on 3 Sep 2026 a run added
six SLED rows but no paragraph, and the tab read as stale to Sajid even though the data had moved. The note box is
how a human sees the delta; the arrays alone do not communicate it. `verify-tracker.js` now fails the run if the
newest note date is older than the newest date group. Change nothing else —
keep all CSS, tabs, filters, colour-coding and honest-notes boxes exactly as they are. Save the file.

Object shapes (match these exactly):
- **RFPS**: grouped by `{found:"<date>", rfps:[ {id, title, region, elig, bucket:"green|amber", deadline, status:"live|expired", link, linktxt, primes} ]}`
  `primes` is REQUIRED on every row: it is what Sajid contacts. For a green row write "Not required. Eligibility
  verified Global World-wide, so Softoo can bid direct". For an amber US row, name real firms that plausibly prime
  that category, prefixed "INFERRED: ". For an amber non-US row, "INFERRED: locally registered partner or entity in
  <country> is required", plus a category fit if one applies. Never present an inferred prime as a confirmed bidder.
- **FUND**: grouped by `{found:"<date>", latest:true|false, list:[ {c:company, amt:"$X · Stage", sec:sector, reg:region, src:url|null, ben:"Softoo angle (optional)"} ]}`
- **SLED**: grouped by date, exactly like RFPS: `{found:"<date>", sled:[ {id, title, scope, region, rel:"HIGH|LOW",
  status:"live|closed", deadline, primes, link, linktxt} ]}`. Newest group first. The oldest group is labelled
  "Carried from earlier runs (before 1 Sep 2026)" and holds the rows that came with the original page.
  `SLED_ROWS` (defined right after the array) is the flattened view the stat tiles use; do not remove it.

### Step 2b — Verify before committing (mandatory, do not skip)
The push deploys straight to the live site, so the file is checked before it goes anywhere:
```
node verify-tracker.js
```
It gates on: the script block parsing (`node --check`), one date group per date per array, the three arrays
being present, and all three footers carrying today's date. It warns (does not block) on repeated row IDs,
repeated company names and rows with no link.

Exit 0 means commit. **Exit 1 means DO NOT COMMIT**: fix what it names and run it again. A syntax error
here is a blank page for every visitor, and there is no human in the loop at 19:00 to catch it.
Warnings are judgement calls: fix the ones this run introduced, and leave inherited ones alone unless
Sajid asked for a cleanup.

### Step 3 — Commit & push (straight to main)
```
git add index.html softoo-tracker-guide.md
git commit -m "Daily tracker update <today's date>"
git pull --rebase origin main
git push origin main
```
Stage the guide alongside the page, so any notes Sajid added to this file since the last run go up with the same commit instead of blocking the pull. Commit BEFORE the rebase pull. `git pull --rebase` aborts when the working tree has unstaged changes, so
pulling first would fail on the very file this run just edited. Pulling after the commit still catches a
commit made elsewhere (a web upload, another machine) and keeps it from becoming a divergence. `main` is what Vercel auto-deploys. If the push fails, DO NOT retry blindly: report the exact
error and tell Sajid he can finish it with one `git push` in this folder.

### Step 4 — Report
Reply in 2-3 lines: what you added to each tab, and whether the push succeeded (or the exact error).
Keep tone tight. Timezone: Asia/Karachi.

---

## EDITING THIS GUIDE (Sajid, or a run that learns something)
This file is the memory, so it is meant to be edited. Rules that keep edits safe:
- An edit takes effect on the NEXT run, scheduled or manual. Nothing needs restarting or re-registering.
- Add to the existing sections, do not restructure or renumber the steps. A run looks for Step 1, Step 2,
  Step 2b, Step 3, Step 4 and the SPEC headings by name.
- Leave the edit uncommitted if you like: Step 3 now stages this file too, so the next run carries it up.
  Committing it yourself is fine as well, the run pulls with rebase either way.
- When a run learns something that would have changed its own output (a source that was not listed, a rule
  that was wrong, an eligibility trap), it should write that into the SPEC or HONESTY section in the same
  commit, not just mention it in the reply. A lesson only stated in a chat reply is lost by the next run.
  Worked example: on 1 Sep 2026 a run discovered the Global/Offshore index and recorded it as source 1.

## THE SPEC (memory) — what each tab needs and where to look

### Tab 1 — RFP Opportunities
Open US/global software/AI/IT RFPs & tenders. Every row needs a working link.
**Sources, in this order:** (1) **RFPMart Global/Offshore index** https://www.rfpmart.com/global-rfp-government-contract.html . Check this FIRST every run. The category indexes (software, AI/ML, web design) do not show eligibility, so a run that reads only those will report zero greens even when greens exist. That is exactly what happened on 1 Sep 2026, when the Global index yielded 7 verified greens after a reported 10-run drought. Still open each listing's detail page: index placement is not proof, and at least one listing on the Global index (SW-118310) reads Onshore on its detail page. (2) RFPMart category indexes (software, AI/ML, web design). (3) TendersOnTime, BidDetail, InstantMarkets, BidNet, gov procurement portals.
**Scan the Global index in full, by ID prefix.** It runs to ~100 rows and is mostly non-tech (MRB-, EXTRA-, ANIM-, MRB marketing/strategy work). The biddable tech rows are scattered all the way down it, not clustered at the top. Filter for `SW-`, `WD-`, `AI-`, `ITES-`, `SEO-`, `GIS-` prefixes across the whole table before opening detail pages. The 1 Sep fourth sweep found 3 greens the third sweep had missed (WD-16148, SW-118710, SW-118518) purely because it read past the first rows.
**The Global index lags the category indexes by about a day — so read both.** On 2 Sep 2026 the Global index carried no tech row posted that day (its newest `SW-`/`WD-`/`AI-` rows were still 1 Sep), yet the software category index had ~80 fresh 2 Sep listings, one of which (SW-119011, Switzerland) verified green. The cheap trick: on the category indexes, look for the word **`global` inside the detail-page URL slug** — that is what flags a candidate worth opening. The slug is a candidate signal ONLY, never proof (AI-1235/AI-1236 carry it and read Onshore); the detail page still decides. Net effect: Global index first for anything 2+ days old, category indexes for same-day postings.
**Grep `index.html` for every candidate ID before writing a row, not after.** On 3 Sep 2026 a run re-added SW-118336 as a fresh find when it was already in the 1 Sep group; `verify-tracker.js` caught it as a repeated-id warning and the row had to be pulled and folded back into the existing one. The Global index re-lists the same rows for weeks, so anything it shows that is more than a day old is probably already in the array. One grep of the ID prefixes up front costs nothing and saves the rework.
**The `global`-in-slug trick held up on 3 Sep 2026.** Across ~100 rows posted that day on the category indexes, not one tech row carried `global` in its slug, and six 3 Sep tech detail pages opened anyway (Switzerland AI-1246, UK SW-119089, Texas AI-1247, Ireland WD-16197, Ontario WD-16195) all read Onshore. The day's only green came off the Global index. So the slug filter is a sound way to pick which same-day detail pages to open — it just does not license marking anything green without the detail page.
**Eligibility rule (critical):** the ONLY proof Softoo can bid directly is a detail-page "Eligibility: Global World-wide" → mark `bucket:"green"`. Anything reading "Onshore (<Country> Only)" or unverified → `bucket:"amber"` (needs a local partner/entity). Default unknown to amber. Mark `status:"expired"` if the deadline has passed or is unknown and the listing is 2+ weeks old.
**Re-check rows marked expired only because the deadline was unknown.** That flag is a guess, and it goes stale in the wrong direction — it hides live work. Open the detail page and read the "Expiry Date" line: on 1 Sep the fourth sweep found AI-1208 (a verified-green AI Coding Agents RFI) marked expired while its detail page read "Expiry Date: Monday, 14 September, 2026". Enrich the existing row (correct deadline + `status:"live"`), do not add a new one.
**WebFetch's summariser sometimes asserts a wrong "current" date** (it claimed "we are currently in 2024" and called a 14 Sep 2026 deadline expired). Trust the verbatim date it quotes off the page, never its expiry reasoning; today's date comes from the run context.
**Reality:** live directly-biddable RFPs are rare (9+ straight runs with none). If none surface, keep the recurring index bookmarks and lean on funding.

### Tab 2 — Funding Signal Leads
Recently-funded companies = budget for external dev → direct B2B outreach (no procurement bar). Tag each `ACT FIRST`.
**Sources (fetch clean):** techstartups.com "Startup Funding News Today" (daily) + roundups; **entrackr.com** homepage (daily India feed — added 1 Sep after the fourth sweep found 6 same-day names on it that no other source carried; note its `/exclusive/` posts are rounds *being led*, not closed, so tag them REPORTED); Crunchbase News "Week's 10 Biggest Funding Rounds" (check the stated week — some slugs are stale); startuptalky.com India weekly; todaysstartupnews.com recap (EU/US small rounds the daily feeds miss — these carry older round dates, group them under the date found); entARABI / Arab News "Startup Wrap" (MENA); eu-startups.com article pages; New Market Pitch (cyber).
**Known fetch behaviour:** eu-startups.com index and category pages return HTTP 403 to automated fetch. **Changed 3 Sep 2026: individual ARTICLE URLs now 403 as well**, so the article body is no longer reachable at all. What still works is WebSearch against `allowed_domains:["eu-startups.com"]` — its result snippets carry company, amount, lead investor and city, which is enough for a row. Cite the article URL (it is valid for a human) and say in the row that the detail is snippet-level, so the row is not passed off as fully read. The weekly/roundup sources (Crunchbase, New Market Pitch, StartupTalky) usually have nothing new on a same-day second run — check the stated last-updated date and say "dry" rather than re-listing what is already in the array.
**Two sources that keep coming back empty or wrong (checked again 2 Sep 2026):** the Arab News `startup-wrap` tag has published nothing since 25 Apr 2026, so MENA coverage now has to come from elsewhere; and the Crunchbase `biggest-funding-rounds` *index* URL returns a stale 2023 article to automated fetch. A stale fetch is **not** the same as "no rounds this week" — say the source went unswept rather than reporting it dry, and reach the current week's article via search if it matters.
**For each:** company, amount+stage, sector, region, source link, and a one-line "Softoo angle" (`ben`) — what to sell given the stage (seed → build MVP/first team; Series A/B → dedicated squad / staff aug; Series C+ → managed services / platform hardening / AI-ML delivery).
**Flag health-adjacent names** (mental health, biotech, clinical) as CLIENT build/infra targets only — never clinical work. Keep good regional balance (not all US).

### Tab 3 — SLED Intel
Open US State/Local/Education RFPs plus the SLED market and competitor picture. Softoo cannot bid direct, it
sits behind a US prime.

**READ THIS FIRST: this tab is NOT the pipeline system of record.** Softoo runs a paid bid aggregator that
feeds matched SLED solicitations into the CRM, complete with bid document packages and named buyer contacts.
This tab is a free-public-source sweep. It has no documents and no contacts, and it will always be a subset.
Never present it as complete coverage, and do not pad it to look comprehensive.

**Coverage audit, 2 Sep 2026 (why the scope changed).** This tab held 25 rows, 15 of them Colorado and ZERO
in Michigan, while the CRM feed the same week carried Michigan (Wayne RESA SMART ERP APIs, Macomb Community
College switches, City of Eastpointe, Ypsilanti, Monroe, Traverse City, Detroit Transportation kiosks),
Arizona, Arkansas, Rhode Island, Massachusetts, Florida, Idaho and more. Cause: the old spec called
"BidNet Direct (RMEPS Colorado/Wyoming + NY group)" the system of record, which silently capped every sweep
at those states. RMEPS is the Rocky Mountain group, one regional group among many, not the US.

**Scope: any US state.** Do not anchor on one procurement group.

**Sources, in priority order. Record the outcome of each fetch in the log at the bottom of this section so a
later run does not rediscover the same block.**
1. **BidNet Direct groups, per region, not just RMEPS.** Michigan is `/mitn` (Michigan Intergovernmental
   Trade Network), which is where most of the CRM's Michigan local-agency items live. Colorado and Wyoming
   are `/rmeps`. There are further state and regional groups. Anonymous fetch 403s on all of them, so read
   via proxies, but at least sweep the RIGHT groups.
2. **Free state eProcurement portals** (real documents, no login). Verified 2 Sep 2026: Michigan active
   solicitations are on **SIGMA Vendor Self Service (VSS)**, reached via michigan.gov DTMB Contract Connect.
   NOT michigan.gov/dtmb/procurement/contractconnect/bid-proposals, which is an ARCHIVE of already-awarded
   procurements and says so on the page. Unverified, check on first use and log the result: COMMBUYS (MA),
   Vendor Bid System / MyFloridaMarketPlace (FL), Arizona Procurement Portal (AZ), Ocean State Procures (RI),
   Cal eProcure (CA), VendorNet (WI), MissouriBUYS (MO), ARBuy (AR), NYS Contract Reporter (NY),
   Colorado VSS / BIDS (CO), Idaho's state portal.
3. **Multi-state free boards:** GovCB, InstantMarkets, DemandStar, GovDirections, Starbridge.ai.
4. **rfpmart category indexes** (dates provisional, treat as leads to verify).

**Competitor intel source, new.** That Michigan award archive is worth a visit on its own: it lists awarded
vendor, award date and synopsis PDFs per procurement. Award history is the only public way to see who
actually wins this work, which beats inferring primes. Most states publish an equivalent. Use it to replace
inferred primes with real ones wherever an award record exists.

**Relevance is BINARY in the renderer** (`rel:"HIGH"` or anything else renders as "LOW (non-tech)"). Do not
invent a third band, it would need a design change. Classify:
- `HIGH` = software, IT services, AI, data, cyber, GIS, accessibility, AND tech-adjacent buys whose
  deliverable is substantially software, data or integration work: asset-management and predictive modelling,
  project management for a system replacement, ERP APIs, kiosk hosting, fiber and network installation,
  AV and technology procurement, licensing where implementation is in scope.
- `LOW` = genuinely non-tech, logged only for completeness: drainage design, park expansion, security
  boulders, bill printing, assessor plats, pump station repair. Softoo cannot deliver civil engineering.
  Do NOT inflate HIGH to make the tab look busy.

**Primes are INFERRED** from the RFP category (plan-holder lists are not public pre-award). Always label them
inferred, never a confirmed bidder list, unless an award record gives a real name. Treat rfpmart-only dates
as provisional.

**Source fetch log** (append one line per source per run when the outcome changes):
- 2 Sep 2026: bidnetdirect.com (any group), anonymous fetch 403. Proxy required.
- 2 Sep 2026: michigan.gov DTMB bid-proposals page, fetch OK but it is an award archive, not open bids.
  Active Michigan solicitations are on SIGMA VSS. Archive is useful for competitor and award intel.
- 2 Sep 2026: commbuys.com, fetch not completed (permission prompt timed out). Retry.
- 3 Sep 2026: commbuys.com/bso reached — open-bid browse is behind a login, so MA has no anonymous route.
  Closes the 2 Sep "retry" line: do not spend another run on it without credentials.
- 3 Sep 2026: michigan.gov/dtmb/procurement/contract-connect now returns 403 to anonymous fetch (it was
  readable on 2 Sep), and sigma.michigan.gov `/webapp/PRDVSS2X1/AltSelfService` returns HTTP 500. Michigan
  went UNSWEPT this run — that is a gap, not a dry source.
- 3 Sep 2026: instantmarkets.com search pages return only the page header to fetch (rows are JS-rendered),
  so it yields nothing without a proxy or a rendering fetch.

**Known gap in the page itself (flagged 3 Sep 2026, not changed).** The SLED tab's in-page "Honest notes"
box still reads "System of record is BidNet Direct (RMEPS Colorado/Wyoming + NY group)". The 2 Sep coverage
audit above retired exactly that claim — the system of record is the paid aggregator feeding the CRM, and
RMEPS is one regional group. A run is scoped to data arrays plus the Generated date, so this run did not
rewrite prose. Sajid: one line to approve and a future run can correct that box.

---

## HONESTY RULES (apply to every tab)
- Every specific RFP row must have a working reference URL; if you only have an ID, link the source index and show the ID.
- Never present inferred SLED primes as confirmed bidders.
- Never mark an RFP green without a verified "Global World-wide" detail page.
- Don't pad. If a source is blocked or dry, say so; a short honest list beats a long padded one.
- Keep the design, tabs, filters and honest-notes boxes exactly as they are — only data + the date change.

---

## SCHEDULED (UNATTENDED) RUNS
Set up 1 Sep 2026: weekday evenings, 19:00 Asia/Karachi, pushing straight to `main`.
- **Wrapper:** `run-daily-tracker.cmd` in this folder. Creates `logs\`, pulls, runs Claude Code headless
  against this guide, then records the exit code and the resulting git state.
- **Permissions:** `.claude\settings.json` pre-grants exactly the tools a run needs, with
  `defaultMode: "dontAsk"`, so nothing prompts and anything outside the allow list is denied rather than
  waiting for a human who is not there.
- **Task Scheduler:** one task. Trigger Weekly, Mon to Fri, 19:00. Action:
  `cmd /c "C:\Users\Sajid Razzaque\softoo-rfp-tracker\run-daily-tracker.cmd"`.
  Leave "Run whether user is logged on or not" OFF: the push needs the logged-in session's credential.
- **Stale git locks:** the wrapper sweeps `.git\**\*.lock` files older than 10 minutes before pulling.
  A run killed mid-commit (machine shutdown, crash) leaves `index.lock` behind, and every later `git add`
  then fails with "Unable to create index.lock: File exists". This happened on 3 Sep 2026 and would have
  silently broken that evening's run. If git ever refuses to stage, look for a lock file first.
- **Logs:** `logs\run-<timestamp>.log` per run, gitignored. Exit code 0 means the run completed; anything
  else means it did not, and the log says why.
- Because the push is unreviewed, Step 2b is the only thing between a bad sweep and production.

## IF THE PUSH IS BLOCKED
A blocked push is expected in a sandboxed or bridged session and is NOT a reason to retry in a loop.
Report the exact error. Sajid can finish it in one step: `git push` in this folder, or GitHub, Add file,
Upload files, drag `index.html`, Commit. The site deploys the moment the file lands.
