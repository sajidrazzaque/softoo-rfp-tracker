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

## ONE-TIME PREREQUISITES (assume done; verify on first run)
- This folder is the local clone of the repo and already contains `index.html`.
- Git identity is set:  `git config user.name "Sajid Razzaque"` and `git config user.email "sajid.razzaque@softoo.co"`
- `git push` works from this folder (credentials cached via GitHub Desktop or the credential manager).
- If `index.html` is missing, STOP and tell Sajid — do not invent the whole page from scratch.

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
Update the "Generated <date>" text near the top of the page to today's date. Change nothing else —
keep all CSS, tabs, filters, colour-coding and honest-notes boxes exactly as they are. Save the file.

Object shapes (match these exactly):
- **RFPS**: grouped by `{found:"<date>", rfps:[ {id, title, region, elig, bucket:"green|amber", deadline, status:"live|expired", link, linktxt} ]}`
- **FUND**: grouped by `{found:"<date>", latest:true|false, list:[ {c:company, amt:"$X · Stage", sec:sector, reg:region, src:url|null, ben:"Softoo angle (optional)"} ]}`
- **SLED**: flat list of `{id, title, scope, region, rel:"HIGH|LOW", status:"live|closed", deadline, primes, link, linktxt}`

### Step 3 — Commit & push
Run in this folder:
```
git add index.html
git commit -m "Daily tracker update <today's date>"
git push
```
If the push fails, DO NOT retry blindly — report the exact error to Sajid and tell him he can push it
himself with one `git push` (or upload `index.html` via GitHub → Add file → Upload files).

### Step 4 — Report
Reply in 2-3 lines: what you added to each tab, and whether the push succeeded (or the exact error).
Keep tone tight. Timezone: Asia/Karachi.

---

## THE SPEC (memory) — what each tab needs and where to look

### Tab 1 — RFP Opportunities
Open US/global software/AI/IT RFPs & tenders. Every row needs a working link.
**Sources:** RFPMart (software + AI/ML + web-design indexes), TendersOnTime, BidDetail, InstantMarkets, BidNet, gov procurement portals.
**Eligibility rule (critical):** the ONLY proof Softoo can bid directly is a detail-page "Eligibility: Global World-wide" → mark `bucket:"green"`. Anything reading "Onshore (<Country> Only)" or unverified → `bucket:"amber"` (needs a local partner/entity). Default unknown to amber. Mark `status:"expired"` if the deadline has passed or is unknown and the listing is 2+ weeks old.
**Reality:** live directly-biddable RFPs are rare (9+ straight runs with none). If none surface, keep the recurring index bookmarks and lean on funding.

### Tab 2 — Funding Signal Leads
Recently-funded companies = budget for external dev → direct B2B outreach (no procurement bar). Tag each `ACT FIRST`.
**Sources (fetch clean):** techstartups.com "Startup Funding News Today" (daily) + roundups; Crunchbase News "Week's 10 Biggest Funding Rounds" (check the stated week — some slugs are stale); startuptalky.com India weekly; todaysstartupnews.com recap (EU names); entARABI / Arab News "Startup Wrap" (MENA); eu-startups.com article pages; New Market Pitch (cyber).
**For each:** company, amount+stage, sector, region, source link, and a one-line "Softoo angle" (`ben`) — what to sell given the stage (seed → build MVP/first team; Series A/B → dedicated squad / staff aug; Series C+ → managed services / platform hardening / AI-ML delivery).
**Flag health-adjacent names** (mental health, biotech, clinical) as CLIENT build/infra targets only — never clinical work. Keep good regional balance (not all US).

### Tab 3 — SLED Intel
Open US State/Local/Education RFPs + the SLED market/competitor picture. Softoo can't bid direct — it sits behind a US prime.
**Sources:** BidNet Direct (RMEPS Colorado/Wyoming + NY group) is the system of record but blocks fetch — read via Starbridge.ai, rfpmart, GovCB, coloradobids, agency PDFs. `rel:"HIGH"` = IT/software/cyber/AI/data/GIS/accessibility; `rel:"LOW"` = non-tech (completeness).
**Primes are INFERRED** from the RFP category (plan-holder lists aren't public pre-award) — always label them inferred, never a confirmed bidder list. Treat rfpmart-only dates as provisional.

---

## HONESTY RULES (apply to every tab)
- Every specific RFP row must have a working reference URL; if you only have an ID, link the source index and show the ID.
- Never present inferred SLED primes as confirmed bidders.
- Never mark an RFP green without a verified "Global World-wide" detail page.
- Don't pad. If a source is blocked or dry, say so; a short honest list beats a long padded one.
- Keep the design, tabs, filters and honest-notes boxes exactly as they are — only data + the date change.

---

## IF THE PUSH IS BLOCKED
If `git push` from this session is blocked by network/egress, that's expected in some setups — it is NOT a reason to
retry in a loop. Report the exact error, and Sajid can finish it in one step (either `git push` in this folder himself,
or GitHub → Add file → Upload files → drag `index.html` → Commit). The site still deploys the moment the file lands.
