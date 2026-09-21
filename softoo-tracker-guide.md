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

### Step 2 — Update the data files (NOT `index.html`)
Since 18 Sep 2026 the data lives outside the page. `index.html` is presentation only: CSS, markup, render
code. **Do not put rows in it.** The gate fails the run if an inline `const RFPS=[` reappears there.

Edit these, each a single assignment whose right-hand side is strict JSON:
```
data/rfps.js    window.RFPS=[ {found:"<date>", rfps:[ … ]} , … ]
data/fund.js    window.FUND=[ {found:"<date>", list:[ … ]} , … ]
data/sled.js    window.SLED=[ {found:"<date>", sled:[ … ]} , … ]
data/refs.js    window.REFS={ "u1":"https://…", … }   shared URLs, referenced from rows as "@u1"
```
Because they are JSON, keys are quoted and there are no trailing commas. A syntax slip is caught by the gate
rather than blanking the page.

Add a NEW date group at the TOP of the relevant file, newest first, copying the field shape of an existing
entry. **If a group for today already exists** (a second run the same day), MERGE into it. Never add a second
group with the same date, and never re-add a row that is already present: enrich the existing row instead.

Links: if a URL is already in `data/refs.js`, reference it as `"@u7"` rather than repeating it. A URL used by
two or more rows belongs in refs. Anything else can be a literal URL.

Then update, in `index.html`: the three "Generated <date>" footers, the reference dates in each tab's lede,
and a new dated paragraph at the top of each tab's note box (see the note-box rule below).

**Field caps are enforced by the gate**, because the page and every future run pay for every character:
`title` 90, `elig` 200 (RFP), `scope` 300 (SLED). The detail belongs on the linked page, which is the point
of carrying the link.

**Old groups roll off automatically.** Groups older than 30 days move to `data/archive/<tab>-<YYYY-MM>.js`
and are listed in `data/archive/index.js`. The page loads them only when the reader presses "Load archive".
Run `node roll-archive.js` as part of Step 2b and commit whatever it moves.

### Step 2b — Verify before committing (mandatory, do not skip)
```
node roll-archive.js      # moves groups older than 30 days into data/archive/
node verify-tracker.js    # exit 0 = commit, exit 1 = DO NOT COMMIT
```
The gate parses the data files as JSON, then checks: one date group per date, field caps, every RFP and SLED
row carries `primes`, no dangling `@refs`, the archive index points at files that exist, `index.html` still
loads all five data files and holds no inline data, the three footers agree with each other and with the
newest group, and each note box has a paragraph for the newest date. Warnings are judgement calls; fix the
ones this run introduced and leave inherited ones alone unless Sajid asked for a cleanup.

A syntax error or a stale footer here is a broken or lying page for every visitor, and there is no human in
the loop at 19:00 to catch it.

### Step 3 — Commit & push (straight to main)
```
git add data index.html softoo-tracker-guide.md
git commit -m "Daily tracker update <today's date>"
git pull --rebase origin main
git push origin main
```
**Stage `data/` first, and do not copy an older version of this command that omits it (corrected 18 Sep 2026).** Since the 18 Sep split the rows live in `data/*.js`, so `git add index.html` alone would push a page whose footers and note boxes claim today while its rows stop at yesterday, and `git pull --rebase` would then abort on the unstaged data files anyway. Stage the guide alongside the page, so any notes Sajid added to this file since the last run go up with the same commit instead of blocking the pull. Commit BEFORE the rebase pull. `git pull --rebase` aborts when the working tree has unstaged changes, so
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
**THE GLOBAL INDEX HAS A BACK-CATALOGUE. OPEN EVERY TECH ROW NOT ALREADY IN THE ARRAY, WHATEVER ITS POSTING DATE.**
Discovered 4 Sep 2026, and it is the most expensive miss found so far. The Global index holds only ~22 tech rows
in total, and on 4 Sep *eight* of them had never been opened by any previous sweep. Opening all eight returned
**five more detail-page-verified "World-Wide Globle" greens — and every one had already expired**, between 25 Aug
and 1 Sep (SW-118407 Virginia CRM, ITES-10859 Illinois managed IT, SEO-2348 California social media, WD-16129 and
WD-16128 Virginia website). The ID-prefix filter from 1 Sep was working correctly; what failed was reading only the
*recently posted* rows near the top of the table. Greens sit in that index for weeks with live deadlines, so the
backlog is exactly where the biddable work was, and five real chances were lost to it. This does NOT contradict the
3 Sep line below about anything old probably already being in the array — that rule is about not RE-ADDING rows.
Both hold together as: grep the ID first, and if the ID is absent, open the page no matter how old the posting is.
The index is ~22 tech rows, so opening every unseen one costs very little.

**THE BACK-CATALOGUE IS NOW CLOSED OUT, AND THE `EXTRA-` PREFIX WAS TESTED AND REJECTED (7 Sep 2026).**
Every tech row on the Global index (~26 of them) has now been opened by a sweep, so the 4 Sep backlog problem is
discharged — from here it is only the new postings that need opening, plus any row whose ID is absent from the array.
The 7 Sep run also spent four fetches testing whether the ID-prefix filter is too narrow, and the answer is no:
three `EXTRA-` rows with tech-sounding titles all read as non-technical consultancy (EXTRA-75339 Colorado
"Development Operations and Database Consultant Services" is actually donor-data QC and fundraising ops, and its
eligibility line reads the self-contradictory "Onshore (World-Wide Global)"; EXTRA-75550 Saint Paul human-centred
design; EXTRA-75548 Charlotte information-management evaluation). One `GIS-` row was also a false positive
(GIS-2043 Austria = pharmaceutical-supply-chain sustainability consultancy). Keep the filter at
`SW- WD- AI- ITES- SEO- GIS-`, do not add `EXTRA-`, and expect the occasional non-tech false positive inside GIS-.

**Weekends and US public holidays are a real gap in the source, not a dry sweep.** On 7 Sep 2026 (a Monday, and US
Labor Day) the Global index and all three category indexes carried NOTHING posted on 6 or 7 Sep; the newest rows
anywhere were 5 Sep. A Monday run is therefore a three-day catch-up over Saturday's postings, and a Monday-after-a-
holiday run may find nothing at all posted that day. Say so in the note box rather than reporting the sweep as dry.

**READ THE AI/ML CATEGORY INDEX AS A FULL TABLE, THE WAY THE GLOBAL INDEX IS READ (9 Sep 2026).** The
back-catalogue lesson from 4 Sep was written about the Global index and was never applied to the category
indexes, and it cost a real listing. **AI-1249** (Washington DC, AI Transcription System) was posted on
**4 September** and was missed by the 4 Sep sweep — which read the AI/ML index that very day and took only
AI-1251 off it — and again by the 7 Sep sweep. It was finally found on 9 Sep, the day it expired. On the
technical merits it was the best-specified build either tab has carried: on-premises Ubuntu with no cloud
dependency, interview audio through **three independent transcription engines** with outputs aligned and
material discrepancies flagged for human review, GPU orchestration inside a 16GB budget, SHA-256 result
manifests. That is verifiable-AI engineering sitting exactly on the AI Audit and Compliance wedge, and it was
lost to a skim. So: on the AI/ML index, do not stop at the newest postings — read the whole table and grep
each `AI-` / `SW-` ID against `index.html`, same as the Global index.

**A BLANK DAY IS NOT ALWAYS A WEEKEND — CHECK WHICH DATES ARE ACTUALLY MISSING BEFORE EXPLAINING THE GAP
(9 Sep 2026).** The 7 Sep run correctly attributed its dry sweep to Saturday, Sunday and US Labor Day. On
9 Sep the Global index and all three category indexes were read in full and the newest rows before that day
were still dated **5 Sep** — meaning **Tuesday 8 September, an ordinary working day, carried nothing at all**.
That is a source outage or a publishing pause, not an absence of solicitations, and it is a different claim
from the weekend one. Name the specific dates that are missing in the note box rather than reaching for the
nearest calendar explanation, and do not describe a catch-up run as covering days the source never published.

**THE AI/ML FULL-TABLE RULE PAID ON ITS FIRST RUN, AND THE 8 SEP BLANK WAS A ONE-DAY OUTAGE (10 Sep 2026).**
Two follow-ups to the 9 Sep entries above. First, the rule written after the AI-1249 miss was applied for the first
time on 10 Sep: every `AI-` row on the AI/ML category index was grepped against `index.html`, eleven were absent, and
four were opened. Three of the four were worth a row, including **AI-1257** (Virginia, LLMs Evaluating Services), a
build for a full LLM benchmarking ecosystem with datasets, scoring scripts, replication documentation and publication
to the agency's GitHub. That is the best product fit either tab has carried, and it would have been invisible to a
newest-rows-only skim. Keep the rule. Second, **8 September turned out to be a genuine one-day source outage, not a
change in the source**: on 10 Sep the Global index carried rows posted 9 and 10 Sep and the software category index
carried roughly 70 rows posted that day. So the 9 Sep instruction to name the specific missing dates was right, and
the right follow-up is to check whether a gap repeats before treating it as anything structural.

**FIVE LIVE GREENS IN ONE RUN, ALL FROM THE GLOBAL INDEX, ALL WITH `global` IN THE SLUG (10 Sep 2026).** The best RFP
day so far: SW-119266 (DC, Microsoft Fabric and Purview), SW-119286 (California, document-AI mail workflow), WD-16213
(New York, CMS site), SW-119268 (DC, ERP) and WD-16214 (California, mobile web RFI), every one verified on its detail
page and every one still open. Two things this confirms rather than changes: the Global index is still where the
greens are even after the back-catalogue close-out, and on a day when the source is publishing normally the slug
signal and the Global index agree. It does not license skipping the detail page, which is what separated these five
from the AI-1235/AI-1236 slug traps.

**THE RFPMART DATE ANOMALY HAS A THIRD VARIANT: A QUESTION DEADLINE BEFORE THE POSTING DATE (10 Sep 2026).** Oregon
SW-119321 was posted 10 September and prints a question deadline of **31 August**, i.e. ten days before it was
published. The 3 Sep (Tennessee SW-119103) and 4 Sep (Cicero CSE-24602) cases both had a question deadline falling
*after* the close; this one runs the other way, and 9 Sep added an eligibility field contradicting the buyer's
country. Generalise the handling rather than cataloguing each shape: **treat every RFPMart date and eligibility field
as unverified metadata.** Quote it exactly as printed, flag the contradiction on the row, say "confirm with the
buyer", and never silently pick the reading that suits the row.

**THE `PM-` PREFIX PRODUCED A REAL ROW, AND THE FULL-TABLE READ IS WHY (11 Sep 2026).** The 7 Sep entry above tested
`EXTRA-` and rejected it, and concluded "keep the filter at `SW- WD- AI- ITES- SEO- GIS-`". That conclusion still holds
as a *filter*, but it is not the whole method. On 11 Sep, **PM-23948** (St. Louis, Missouri, "Print and Mail API
Services") turned out to be genuine API platform engineering: sandbox and production environments behind a RESTful
API, a dynamic template engine with metadata mapping, a mandatory pre-send proofing gate with rendering URLs, and
identity management supporting data-residency compliance and per-department budget tracking. It surfaced only because
RFPMart **cross-categorises** it into Artificial Intelligence and Machine Learning as well as into Software, System and
Application, so it appears on the AI/ML index, and the AI/ML index is now read as a full table. Lesson: do not extend
the prefix list speculatively (the `EXTRA-` test says that wastes fetches), but when a full-table read puts an
unfamiliar prefix in front of you on a *tech* category index, judge it on its title and scope rather than skipping it
on the prefix. The prefix filter is for deciding what to open on the Global index; the category indexes are read whole.

**THE TECHSTARTUPS ROUNDUP FOR DAY N IS PUBLISHED AFTER DAY N'S SWEEP HAS ALREADY RUN (11 Sep 2026).** This is a
scheduling fact with a real cost, and it generalises the 9 Sep "read the roundup as well as the daily" rule. The
10 September VC roundup went up after the 10 Sep sweep had read the 9 September one, and on 11 Sep it supplied FOUR of
the seven funding rows, including Rogo Technologies (the day's best-qualified buyer) and the sector detail that
discharged the blocker on the Graph AI row. So every run should read **the previous day's roundup as well as today's**,
because today's may not exist yet at 19:00 Asia/Karachi and yesterday's certainly did not exist at yesterday's sweep.

**A DRY CYBER SEARCH IS A RESULT, AND IT NEEDS DATE-CHECKING TO BE ONE (11 Sep 2026).** After four runs where the
mandatory cyber search paid for itself (Upwind, then Cylake and QNu Labs, then Bynario), the 11 Sep search returned
nothing new. What made that a usable answer rather than a shrug was date-checking every candidate it surfaced: Onyx
Security ($113M Series B, Bessemer) announced 29 July, Zenity ($125M Series C, Norwest) 3 August, Corma ($60M seed,
Sequoia, Tel Aviv, defensive-cybersecurity foundation models) 10 August, Above Security ($43M Series A) 23 March. A
cyber search will always return *something*, because the category is heavily indexed by listicle sites; without a date
check those look like finds. Date-check before logging, and report the search as dry rather than skipping it.

**A SAME-DAY BLANK ON RFPMART IS A PUBLISHING LAG, NOT AN OUTAGE. RE-READ THE PREVIOUS RUN'S DATE, EVERY RUN
(15 Sep 2026).** This is the most expensive source lesson since the 4 Sep back-catalogue one, and it corrects the
9 Sep and 11 Sep entries above rather than adding to them. The 11 Sep run read the Global index and all three
category indexes in full and reported that RFPMart had published nothing at all that Friday. It was reading the
indexes correctly; the rows simply did not exist yet at 19:00 Asia/Karachi. Re-read on 15 Sep, the same indexes
carry roughly **21 software rows, 6 AI rows, 8 web-design rows and one Global-index row all dated Friday 11
September**. The cost was a green: **ITES-10977** (Maryland, IT systems cybersecurity audit and systems
integration review, "World-Wide Globle" verified verbatim, closes 16 Oct) was posted 11 Sep and went unseen for
four days, and it was the ONLY green in the four-day catch-up. So: **every run must re-read the previous run's
date as well as its own**, which is exactly the habit the funding tab already has for the techstartups roundup.
Do not write "the source published nothing today" as a finding; today's own postings are expected to be
incomplete. This does NOT retract the 8 September outage: 8 Sep was re-read on 10 Sep and again on 15 Sep and
is still genuinely empty, so that one was real. The distinction is the rule: **a blank seen on the day is a lag;
only a blank that persists on a LATER run is an outage.**

**THE LAG RULE PAID ON THE DAY IT WAS WRITTEN, AND THE LAG VARIES BY CATEGORY INDEX (15 Sep 2026, second run).**
The publishing-lag rule above was written by the first 15 Sep run, which reported that nothing anywhere was dated
15 September. A second run the same day, a few hours later, found the software index carrying roughly **57** rows
posted 15 Sep, the AI/ML index five, the web-design index five and the Global index one, including **WD-16231**
(Estonia, verified "World-Wide Globle" green, closes 9 Oct) which was simply not visible earlier. So the rule is
confirmed, and a same-day blank should never be reported as a finding. One refinement it adds: **the lag does not
have one clean front edge across the source, it varies by category index.** On this run the web-design index carried
15 Sep rows while showing NOTHING posted on 14 Sep, even though the software index carried thirteen 14 Sep rows. So
do not infer one index's state from another's, and do not conclude a date is empty until every index has been read
for it on a LATER run.

**WEEKEND QUIET IS NOT RELIABLE FOR THIS SOURCE EITHER (15 Sep 2026).** The 7 Sep entry above treats weekends as
a real gap. On this run, **Saturday 12 September was the busiest of the four days swept**, with 54 software rows,
while Sunday 13 Sep carried only US federal notices and Monday 14 Sep carried 12 rows. Combined with the lag rule
above, the honest position is that RFPMart's publishing rhythm is not predictable from the calendar, so name the
dates actually missing and re-check them rather than explaining a gap with the day of the week.

**THE `global` SLUG CAN BE PART OF THE SYSTEM'S NAME (15 Sep 2026).** A new shape of the slug trap, alongside the
AI-1235/AI-1236 cases. **SW-119468** (Washington DC) is an "RFI for Global Talent Acquisition System" and carries
`global` in its URL slug purely because the word is in the product name; the detail page reads Onshore USA Only.
Read the title before spending the fetch: if `global` sits inside a noun phrase that names the system, it is not
an eligibility signal.

**THE DATE-ANOMALY RULE NOW HAS A FOURTH SHAPE, WHICH IS WHY IT IS A RULE AND NOT A CATALOGUE (15 Sep 2026).**
Three anomalies surfaced in a single run, one in each known shape plus a new one: SW-119454 (Belgium) states a
question deadline **after** the close; SW-119458 (California) states one four days **before** the posting date and
AI-1266 (California) eleven days before; and ITES-10977 (Maryland) states a question deadline **on the posting day
itself**, so the window was shut the moment the listing appeared. The 10 Sep instruction stands unchanged and is
the right one: treat every RFPMart date and eligibility field as unverified metadata, quote it exactly as printed,
flag the contradiction on the row, say "confirm with the buyer", and stop cataloguing new shapes.

**AI GOVERNANCE IS TURNING UP AS A LINE ITEM INSIDE ORDINARY SYSTEM BUYS (15 Sep 2026).** Worth watching as a
market signal rather than as a sourcing rule. Two unrelated US buyers specified human control over AI output in
listings that are not AI solicitations: SW-119468 (DC talent acquisition) requires vendors to confirm whether
resume parsing, candidate matching and skills extraction can be **disabled by the customer** without losing core
functionality, and SW-119399 (Georgia public-safety training) makes administrative review of AI-generated content
**mandatory**. AI-1261 (Florida) writes **model monitoring** and regulatory compliance into a five-year build.
When qualifying a row, check the requirements for this pattern: it is the AI Audit and Compliance wedge appearing
inside a build budget rather than as a separate advisory buy, which is a better place to sell from.

**THE AI-GOVERNANCE SIGNAL HAS A SECOND FACE: BUYERS WRITING AI *OUT* OF A CONTRACT (16 Sep 2026, second run).**
The entry above records public buyers writing AI governance requirements INTO ordinary system buys. The same week
produced the mirror image. A California government authority buying transcription for workplace investigations and
witness interviews (#1173203, closes 30 Sep) states in the listing that "the use of any form of Artificial
Intelligence (AI) tools or equivalent such as GenAI is strictly prohibited for the transcription services pertaining
to this contract due to confidentiality". Both shapes are the same underlying question, whether AI output can be
trusted with sensitive material, and both are worth logging as market signals even when the listing itself carries no
deliverable (this one is human transcription, so it got no row). Watch for the prohibition clause specifically: it
tells you which categories a public buyer currently considers off-limits for automation, which is the boundary any
AI-assurance pitch has to start from.

**AN ATTESTATION LISTING'S PRIME IS A LICENSED FIRM BY NECESSITY, NOT BY PREFERENCE (16 Sep 2026, second run).**
WD-16233 (Tennessee) asks for a SOC 2+ Type I examination of a serverless web application. Softoo cannot issue that
attestation at all: only a licensed CPA firm can. The row is still worth logging, because readiness assessment,
control implementation, evidence collection and artefact production sit either side of the auditor and are real
engineering (serverless breaks the evidence model SOC 2 templates assume, since there is no host to screenshot,
compute is ephemeral and logging is per function). The rule that generalises: when a listing names a regulated
credential (CPA, licensed engineer, chartered surveyor), write the prime as that credential's holders and say on the
row what Softoo can and cannot do, rather than implying the whole scope is biddable through a partner.

**A LISTING CAN BE A JOB ADVERT WEARING AN RFP'S CLOTHES. READ THE DETAIL PAGE FOR THAT LINE (16 Sep 2026).**
RFPMart carries staff-recruitment postings inside its normal category indexes, and they read exactly like a services
solicitation from the index. **WD-16229** (Washington DC, "Website, Digital Fundraising Ecosystem Management,
Measurement and Optimization, Digital Operations Specialist") has a scope any run would log without hesitating,
covering WordPress and Drupal maintenance, donation form configuration, Salesforce Marketing Cloud and CRM
integration, and behaviour analytics, but its detail page classifies it as a **job recruitment posting, not a bid**.
There is nothing to tender for and no prime to sit behind. The earlier example is WD-16190 (Oregon, "Full-Stack
WordPress Developer Service"), which carries `this-is-job-opportunity` in its URL slug; WD-16229 does not, so the slug
is not a reliable filter and only the detail page settles it. Check for the recruitment classification before writing
a row, and drop it with the reason stated rather than logging a vacancy as an opportunity. This is different from the
Ohio licence-supply trap (SW-119508): that one is a real procurement of the wrong thing, this one is not a
procurement at all.

**THE BACK-CATALOGUE CLOSE-OUT WAS NOT TRUE, AND ONE BUY CAN BE TWO LISTINGS (17 Sep 2026).** Two corrections in one
row. First: the 7 Sep entry above declares the Global index back-catalogue closed, meaning every tech row on it had
been opened by some sweep. On 17 Sep every tech row was grepped against `index.html` again and **SW-118811**
(Massachusetts, Utility Bill Management Platform, posted 29 August) had never been opened by anyone. It read Onshore
USA Only, so no green was lost, but the close-out is not a fact and must not be used as a reason to skip the grep.
Keep grepping every tech row on the Global index every run; it is ~30 rows and costs nothing. Second, and new:
**the same procurement can appear under two IDs with different metadata, and the OLDER one may be the only one that
publishes a scope.** SW-118811 (29 Aug) carries the full scope; the same buy re-lists on 16 Sep as **SW-119585**
marked INFO ONLY with no document, same 16 Oct close, and the buyer is described as "Non-profit Foundation" on one
listing and "Government Authority" on the other. So before dropping a fresh row for being INFO ONLY, search the array
and the index for an older listing of the same title and state. This does not soften the INFO ONLY drop rule (Quebec
SW-119571 was dropped the same day precisely because no older twin existed), it just adds the check before it.

**THE GLOBAL INDEX GREP FOUND A SECOND UNOPENED ROW THE VERY NEXT RUN, SO TREAT THE 7 SEP CLOSE-OUT AS RETRACTED
(18 Sep 2026).** Yesterday's entry above found SW-118811 unopened and said the close-out "is not a fact". One run later
the same grep found **WD-16159** (Washington DC, website redesign and rebuild using a CMS, posted 21 August) also
never opened by anyone. It read Onshore and its detail page gave an **expiry date of 21 August, the same day it was
posted**, so nothing was lost, but two unopened rows on consecutive runs is a pattern rather than a straggler. Delete
the close-out from your working assumptions: grep every tech row on the Global index against the array every run, and
open anything absent whatever its posting date. It is ~30 rows and it has now paid twice in two days.

**A ONE-DAY BID WINDOW IS A REAL SHAPE, AND IT IS WHAT THE FREE SWEEP CANNOT COVER (17 Sep 2026).** TELCOM-3035
(Phoenix, Arizona, telecom expense management platform) was the only row anywhere carrying a 17 September index date,
its own detail page dated the posting to 16 September, and it expired on 17 September. Whichever date is right, the
window was at most one day. Log rows like this rather than hiding them, and say plainly on the row that a sweep run
once a day cannot catch a one-day window and the paid aggregator feeding the CRM is the route for that buyer. It is
the most concrete version of the "this tab is always a subset" scope note.

**A ROW A PREVIOUS RUN *DROPPED* IS INVISIBLE TO THE ID GREP, SO YOU WILL RE-OPEN IT (21 Sep 2026).** Dropped
listings are named only in the note-box prose, never in the array, so the grep that protects against re-adding a row
gives no protection against re-spending a fetch on one. On 21 Sep the Texas web-based LiDAR row was opened as
document #1174152 and came back as **SW-119734**, which the 18 Sep run had already opened and dropped as a TopoShare
licence purchase. Two costs to avoid: the wasted fetch, and the worse outcome of logging it as a fresh find. The
category indexes show the document number, the detail page shows the RFPMart ID, and the note box records only the
ID, so before opening a candidate also skim the last two or three note-box "opened and dropped" lists. The same
listing genuinely does re-appear under a second document number, which is the 17 Sep two-IDs-one-buy lesson seen
from the other side.

**THE RFPMART CATEGORY INDEXES ARE PAGINATED, AND ONE FETCH READS PAGE 1 ONLY (21 Sep 2026).** The 9 Sep rule says
to read the AI/ML index "as a full table". Worth knowing what that actually buys: the AI/ML index runs to about 32
pages, and a single fetch returns page 1. That is not a problem in practice, because page 1 reaches back roughly
three weeks (on 21 Sep it ran back to 2 September), which covers every window a daily run can still bid into. So
read page 1 in full and do not chase pagination, but do not describe it as having read the entire index either.

**Re-check `status:"live"` rows whose deadline has simply gone past.** A row is written once and then rots. On
4 Sep, SW-118710 still read "3 Sep — closes TODAY" with `status:"live"`, and the Zambia row SW-118162 still read
`live` with a 2 Sep deadline. Both had to be rolled to expired. Each run should scan the newest two or three groups
for deadline strings that today's date has overtaken, including relative phrases like "closes in 3 days" and
"closes TODAY", which are wrong the moment the date changes. Same for the SLED tab's "nearest close" row.

**Eligibility rule (critical):** the ONLY proof Softoo can bid directly is a detail-page "Eligibility: Global World-wide" → mark `bucket:"green"`. Anything reading "Onshore (<Country> Only)" or unverified → `bucket:"amber"` (needs a local partner/entity). Default unknown to amber. Mark `status:"expired"` if the deadline has passed or is unknown and the listing is 2+ weeks old.
**Re-check rows marked expired only because the deadline was unknown.** That flag is a guess, and it goes stale in the wrong direction — it hides live work. Open the detail page and read the "Expiry Date" line: on 1 Sep the fourth sweep found AI-1208 (a verified-green AI Coding Agents RFI) marked expired while its detail page read "Expiry Date: Monday, 14 September, 2026". Enrich the existing row (correct deadline + `status:"live"`), do not add a new one.
**WebFetch's summariser sometimes asserts a wrong "current" date** (it claimed "we are currently in 2024" and called a 14 Sep 2026 deadline expired). Trust the verbatim date it quotes off the page, never its expiry reasoning; today's date comes from the run context.
**Reality:** live directly-biddable RFPs are rare (9+ straight runs with none). If none surface, keep the recurring index bookmarks and lean on funding.

### Tab 2 — Funding Signal Leads
Recently-funded companies = budget for external dev → direct B2B outreach (no procurement bar). Tag each `ACT FIRST`.
**Sources (fetch clean):** techstartups.com "Startup Funding News Today" (daily) + roundups; **entrackr.com** homepage (daily India feed — added 1 Sep after the fourth sweep found 6 same-day names on it that no other source carried; note its `/exclusive/` posts are rounds *being led*, not closed, so tag them REPORTED); Crunchbase News "Week's 10 Biggest Funding Rounds" (check the stated week — some slugs are stale); startuptalky.com India weekly; todaysstartupnews.com recap (EU/US small rounds the daily feeds miss — these carry older round dates, group them under the date found); entARABI / Arab News "Startup Wrap" (MENA); eu-startups.com article pages; New Market Pitch (cyber).
**Known fetch behaviour:** eu-startups.com index and category pages return HTTP 403 to automated fetch. **Changed 3 Sep 2026: individual ARTICLE URLs now 403 as well**, so the article body is no longer reachable at all. What still works is WebSearch against `allowed_domains:["eu-startups.com"]` — its result snippets carry company, amount, lead investor and city, which is enough for a row. Cite the article URL (it is valid for a human) and say in the row that the detail is snippet-level, so the row is not passed off as fully read. The weekly/roundup sources (Crunchbase, New Market Pitch, StartupTalky) usually have nothing new on a same-day second run — check the stated last-updated date and say "dry" rather than re-listing what is already in the array.
**Two sources that keep coming back empty or wrong (checked again 2 Sep 2026):** the Arab News `startup-wrap` tag has published nothing since 25 Apr 2026, so MENA coverage now has to come from elsewhere; and the Crunchbase `biggest-funding-rounds` *index* URL returns a stale 2023 article to automated fetch. A stale fetch is **not** the same as "no rounds this week" — say the source went unswept rather than reporting it dry, and reach the current week's article via search if it matters.
**Revisit every REPORTED row on later runs and convert it when it closes.** Added 4 Sep 2026, after two converted
in one run: Comet (logged 2 Sep as "₹99 Cr, REPORTED" off an Entrackr `/exclusive/`) closed at **₹100 Cr Series B led
by Verlinvest**, and Ultrahuman (logged 1 Sep as "$60M, REPORTED, Qualcomm Ventures to lead") closed **larger than
reported, at $70M**. Both were already-known names, so no new sweep would have surfaced them — they only turned up
because the Entrackr feed was read for what had *changed*, not just for what was new. A REPORTED row is a lead with
a blocker on it ("confirm before outreach"); converting it discharges the blocker and is often worth more than a
fresh small round. Enrich the existing row in place, never add a second one.

**Read a cyber-specific source every run.** On 3 Sep the sweep read only techstartups and Entrackr and therefore
missed **Guardio** ($40M at a $1.1B valuation, Tel Aviv, past $150M ARR) — a far better-qualified buyer than most of
what that day did log. It was picked up on 4 Sep only via a general WebSearch. New Market Pitch is the listed cyber
source but it is a weekly and often stale, so when it is dry run a WebSearch for the day's cyber rounds instead of
treating the category as covered.

**The cyber-source rule cost a SECOND miss before it was followed (7 Sep 2026).** Upwind Security's **$300M Series C
at a $3.8B valuation** (Tel Aviv, cloud and AI runtime security, Bessemer and TCV leading) was announced 2-3 Sep and
was missed by BOTH the 3 and 4 Sep sweeps — the 4 Sep run wrote the "read a cyber-specific source every run" rule
because of Guardio and then did not apply it to the same week's bigger round. It was found on 7 Sep by a plain
WebSearch for the category. So: the cyber search is not optional and not satisfied by New Market Pitch being stale.
Run `WebSearch` for the week's cyber rounds explicitly, every run, and check the two or three days before the last
run's date as well as today — a round announced on a Wednesday is still news to a Friday sweep that never looked.

**Third REPORTED conversion, and the pattern is now proven (7 Sep 2026).** Mokobara, logged 2 Sep off an Entrackr
`/exclusive/` as "₹99 Cr… set to raise", closed at **₹170 Cr led by Sauce.vc** — nearly double the reported figure.
That is three conversions (Comet, Ultrahuman, Mokobara) in two runs, and in every case the closed round was LARGER
than the exclusive reported. Re-checking the open REPORTED rows is now the highest-yield five minutes of the funding
sweep. Also worth doing properly: a row that is still reported can still be **enriched** — Slice was re-checked on
7 Sep and is still unannounced, but is now corroborated by several outlets, names Neo Wealth as lead, and turns out
to be a ~70% down round by a company that has since turned profitable. Those two facts change how to qualify it,
so they belong on the card even though the REPORTED flag stays.

**An IPO filing is not capital, but an ANCHOR-INVESTOR allocation is (9 Sep 2026).** On 4 Sep, Rentomojo's
₹1,256 Cr IPO RHP filing was correctly skipped on the "a filing is not closed capital" rule. On 9 Sep the same
company appeared with **₹376 Cr raised from anchor investors ahead of the IPO** — money that is committed and
priced, so it qualifies where the filing did not, and it was logged. Keep both halves of the rule: a filing,
a term sheet or a "set to raise" is not a funding signal; an anchor book, a closed round or a converted
REPORTED row is. Pre-IPO companies are also a specific pitch (audit-grade reporting, data, platform hardening)
rather than a generic one.

**Two cyber names in one run, three runs after the rule was written (9 Sep 2026).** The mandatory cyber search
returned **Cylake** ($245M Series B convertible note, Lightspeed/Picture/Redpoint, $290M total, ~40 staff, beta
end-2026) and **QNu Labs** (₹200 Cr Series A1, Bengaluru, quantum-safe crypto). Neither was carried by
techstartups or Entrackr. That is now three consecutive runs where the category search paid for itself
(Upwind, then these two), after two runs where skipping it cost Guardio and Upwind. Treat it as settled.

**THREE CONVERSIONS IN ONE RUN, AND THE FIRST ONE THAT CONVERTED *DOWNWARD* (10 Sep 2026).** Swish, Theater and
DaMENSCH all closed on the same day. Two points worth keeping. First, **Theater converted in ONE day**: it was logged
on 9 Sep off an Entrackr `/exclusive/` with no amount stated at all, and was announced on 10 Sep at ₹75 Cr led by
Niveshaay, above the reported ₹400 Cr valuation. So re-check the open REPORTED rows *every* run, not every few runs,
because the window between exclusive and announcement can be a single day. Second, and this corrects the 7 Sep
entry above: DaMENSCH closed at **₹17.4 Cr**, which is small, and the round is an insider top-up (₹15 Cr from
existing investor A91 Partners plus ₹2.4 Cr from Tancom Electronics) at a flat valuation. The 7 Sep line said the
closed round was LARGER than reported "in every case"; that was true of Comet, Ultrahuman and Mokobara and is now
not a law. **A conversion is a qualification step, not automatically good news.** It can turn a placeholder row into
a deprioritise decision, which is still worth the five minutes because it stops effort going to the wrong name.

**THE CYBER SEARCH HAS NOW PAID FOR ITSELF FOUR RUNS RUNNING (10 Sep 2026).** After Upwind (7 Sep) and Cylake plus
QNu Labs (9 Sep), the 10 Sep search returned **Bynario** (€2.1M pre-seed, Milan, AI vulnerability discovery and
prioritisation, 360 Capital Partners leading). Useful detail on method: Bynario appeared on BOTH the techstartups
daily and eu-startups, which meant it did not have to be marked snippet-level, unlike the eu-startups-only names.
When a European round shows up in a source that fetches cleanly, cite that one, so the card is fully read rather
than snippet-level.

**GREP THE COMPANY NAME BEFORE WRITING A FUNDING ROW, THE WAY THE RFP TAB GREPS THE LISTING ID (15 Sep 2026,
second run).** The RFP tab has had a grep-the-ID-first rule since 3 Sep; this tab had no equivalent, and it cost a
near-miss. **Zeit AI** (Munich, autonomous data engineering) was published by eu-startups on 15 Sep and written up as
a fresh find, when it had already been logged on **3 September** off techstartups. It was caught only by the
duplicate-company check in `verify-tracker.js`, after the row was already in the file. **A round resurfacing on a
second outlet days or weeks later is not a second round**, and the European sources in particular republish rounds
well after the US dailies carry them, so this will recur. Grep the company name against `index.html` before writing,
not after. The re-read is still worth doing rather than skipping the name: the eu-startups version carried the €4.3M
figure, the full backer list (Y Combinator, Oxford's Seed Fund, the Sequoia Scout Fund, ACE Ventures, Hasso Plattner
VC), Palantir-alumni founders and six named industrial customers already in production, none of which the 3 Sep row
had. Enrich in place, exactly as with a REPORTED conversion.

**THE TECHSTARTUPS DAILY IS SUBJECT TO THE SAME LAG AS THE ROUNDUP (15 Sep 2026, second run).** The 11 Sep entry
above established that day N's *roundup* is published after day N's sweep. The same is true of the **daily**. The
first 15 Sep run recorded that no daily had been published on 12, 13 or 15 September; a second run hours later found
a **15 September daily** that supplied the two best items on the tab, **Exein** ($270M at a $1.7B valuation, Rome,
led by Headline) and the full EUCLYD detail that discharged that row's snippet-level flag. So the re-read-the-
previous-date habit applies to the daily as well as the roundup, and "no daily today" is never a finding at 19:00
Asia/Karachi.

**SECURITYWEEK'S FUNDING CATEGORY NOW 403s, SO THE CYBER SEARCH HAS NO CLEAN INDEX (21 Sep 2026).** New source
block worth recording so it is not rediscovered: `securityweek.com/category/cybersecurity-funding-news/` returns
**HTTP 403** to automated fetch, joining eu-startups. That leaves the mandatory cyber sweep with WebSearch only,
which is fine but makes date-checking non-optional, because a plain category search returns years of listicle
results ranked by authority rather than by date. On this run it surfaced Mindgard ($30M Series A, announced
12 August), Oasis Security ($120M Series B, May), Twenty Technologies ($100M Series B) and Ent.AI ($100M seed,
both in Crunchbase's 13 to 18 June week), and every one of them would have read as a find without the date check.
A dry cyber search that has been date-checked is a result; an undated one is noise.

**A round with no citable article URL does not get a row.** On 4 Sep an eu-startups search snippet showed INLEAP
Photonics (€20M seed, Hannover) but no article URL could be resolved for it, so it was dropped rather than linked to
a guess. Also skipped that day: Rentomojo's ₹1,256 Cr IPO RHP filing — a filing is not closed capital, so it is not
a funding signal for this tab.

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

**A BLOCKED STATE PORTAL IS NOT A BLOCKED STATE. CHECK THE RFPMART CATEGORY INDEXES BEFORE DECLARING A STATE
UNSWEPT (discovered 7 Sep 2026).** Michigan had been recorded as a standing gap since 2 Sep — Contract Connect 403s,
SIGMA VSS returns HTTP 500 — and the 4 Sep run went further and said to stop re-testing it without a proxy. On
7 Sep, Michigan produced a row (WD-16203, a state WordPress rebuild with Salesforce and HubSpot integration) off
**RFPMart's web-design category index, in one fetch, with no proxy**. Massachusetts did the same thing: written off
on 3 Sep because COMMBUYS puts open bids behind a login, yet the statewide MyMassGov IDP identity-platform RFI
surfaced on RFPMart. The lesson is about what "unswept" means: the state's own portal being unreachable only blocks
the *documents and buyer contacts*, not the existence of the solicitation. Source 4 (rfpmart category indexes) was
listed last in this section and treated as a leads-only afterthought; on the evidence it is the most reliable
*multi-state* free source available, and it should be read every run for US state/local rows regardless of which
state portals are blocked. Keep logging portal blocks — they are real — but stop reading them as state-level gaps.

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

**ROUTE TO MARKET (`primes`) is required on every row in BOTH the RFP and SLED tabs.** It is the field Sajid
acts on, so it must name firms he can actually contact, not a category. Order of preference:
1. **CONFIRMED**, from a published award notice or framework award. Prefix "CONFIRMED" and set `primesrc` to the
   source URL so the card shows a clickable source. Two verified sources so far:
   - **Ireland:** the OGP publishes named framework suppliers on eu-supply. The Business, Management and ICT
     Consultancy framework (Lots 5 and 11, award notice 12 Sep 2022) names Version 1, Storm Technology, IT Alliance
     Group, BearingPoint Ireland, 4OC, Accenture Ireland, Crowe, Deloitte Ireland, EY, KPMG, PwC, PA Consulting and
     Tata Consultancy Services. https://irl.eu-supply.com/ctm/Supplier/PublicPurchase/206194/1/1
   - **Michigan:** the DTMB award archive lists awarded vendor, award date and synopsis PDFs per procurement.
2. **INFERRED**, real named firms that plausibly prime that category in the buyer's country. Prefix "INFERRED".
   Never present an inferred name as a confirmed bidder.
3. For a green row: "Not required. Eligibility verified Global World-wide, so Softoo can bid direct".
4. For a method note or a framework/feed listing: "n/a" with the reason.

**Where to find real winner names, and what each source did when last fetched:** see `reference/sources.md`. It holds the per-country award-portal table and the dated fetch log. Open it when you need a country's portal or want to know whether a source was reachable last run. Append there, not here, and only when an outcome changes.

**Known gap in the page itself (flagged 3 Sep 2026, not changed).** The SLED tab's in-page "Honest notes"
box still reads "System of record is BidNet Direct (RMEPS Colorado/Wyoming + NY group)". The 2 Sep coverage
audit above retired exactly that claim — the system of record is the paid aggregator feeding the CRM, and
RMEPS is one regional group. A run is scoped to data arrays plus the Generated date, so this run did not
rewrite prose. Sajid: one line to approve and a future run can correct that box.

**Three more hardcoded/stale bits of the page, flagged 4 Sep 2026, NOT changed (all need Sajid's approval).**
A run is scoped to the data arrays, the Generated date and the note boxes, so these were left alone deliberately:
1. **The stat tiles contain hardcoded numbers that no longer move with the data** (in the stats IIFE): the RFP tab
   shows a literal `5` for "Distinct listings LIVE" and `7` for "Sweep dates with RFPs"; the funding tab shows `14`
   for "Fresh (1 Sep, full detail)"; the SLED tab shows a literal `4 Sep` for "Nearest close (Mead)" — which is
   correct today by coincidence and wrong from tomorrow, since Mead closes 4 Sep. These should be computed from the
   arrays like `rt`, `rgreen`, `shigh` and `slive` already are.
2. **"Verified directly biddable" counts `bucket:"green"` regardless of `status`.** That was harmless while greens
   were rare and live; it stopped being harmless on 4 Sep, when five expired backlog greens went in and the tile
   jumped without a single new biddable opportunity. Either count only live greens or relabel the tile. Until then,
   every run that adds an expired green must say so in the note box, as the 4 Sep run did.
3. **The funding tab's filter button still reads "2 Sep only (full detail)"** while it actually filters on
   `latest:true`, which is now the 4 Sep group. The label needs to either track the newest group or lose the date.

---

## WRITING STYLE AND FIELD DISCIPLINE (page content)
- **No dashes as punctuation** anywhere you write, in this file or in the page: no em-dashes, no en-dashes, no
  spaced hyphen as a separator. Use commas, parentheses, colons or separate sentences. Hyphens inside compound
  words are fine. This is a standing preference of Sajid's and it applies to every row you add.
- **`title` is a title, not a description.** Keep it under roughly 90 characters. Several existing rows carry a
  full paragraph in `title`, which on a phone fills the entire screen before any of the useful fields appear.
  Put the detail in `scope` (SLED) or in the eligibility and deadline fields, not in the title.
- **Keep the tab ledes current.** The static lede under each tab title says "Statuses are relative to <date>" or
  "As of the <date> run". Update those to today's date in the same edit as the Generated footer, otherwise the
  page states a stale reference date while showing fresh rows.
- The page is responsive as of 9 Sep 2026 (media queries at 900px, 700px and 380px, verified at 320, 390 and
  768 px wide with no horizontal scroll on any tab). Keep new content inside the existing card and row
  structure so it stays that way. Do not add fixed pixel widths or tables.

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
