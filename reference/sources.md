# Source reference: where winner names live, and what each source did when fetched

Split out of `softoo-tracker-guide.md` on 18 Sep 2026. The guide was 80 KB and every run read all of it.
This file is **reference, not workflow**: open it when you need to know where to look for a country's award
winners, or whether a source was reachable last time. Do not read it top to bottom on a normal run.

Append to the fetch log only when a source's outcome CHANGES (newly blocked, newly reachable, moved).
Repeating an unchanged outcome is what made the guide unreadable.

**Where to find real winner names, by country.** Mine these instead of guessing, and upgrade INFERRED rows to
CONFIRMED as you go:
Ireland eu-supply / OGP · UK Contracts Finder · Switzerland simap.ch · EU and Lithuania TED · Canada: Ontario
Tenders Portal, BC Bid, Alberta Purchasing Connection · South Africa National Treasury eTenders · Philippines
PhilGEPS · Zambia ZPPA · Malaysia ePerolehan · Tanzania PPRA/NeST · USA: the buyer's state award archive.

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
- 4 Sep 2026: Michigan still unswept — Contract Connect 403 and SIGMA VSS HTTP 500 both unchanged from 3 Sep.
  Two runs in a row now. Treat as a standing gap and stop re-testing it every run; it needs a proxy or credentials.
- 4 Sep 2026: rfpmart category indexes fetched clean and yielded five US state/local rows. **Data-quality pattern
  worth knowing:** a stated question deadline falling AFTER the close date has now appeared twice in two days
  (Tennessee SW-119103 on 3 Sep, Cicero CSE-24602 on 4 Sep). It is probably an RFPMart field error rather than a
  buyer error. Log both dates as the listing states them, flag the contradiction in the row, and say "confirm with
  the buyer" — do not silently pick one.
- 4 Sep 2026: eu-startups article pages still 403 to fetch; WebSearch against the domain works but returned nothing
  that was not already logged. Report it as swept-but-dry, which is different from the unswept weekly sources.
- 7 Sep 2026: rfpmart global + software + AI/ML + web-design indexes all fetched clean and yielded four RFP rows and
  five SLED rows in five states, INCLUDING Michigan and Massachusetts, both of which had been written off as
  portal-blocked. See the "a blocked state portal is not a blocked state" rule above. No proxy used.
- 7 Sep 2026: rfpmart indexes carried nothing posted 6 or 7 Sep (Sat/Sun plus US Labor Day). Newest rows were 5 Sep.
- 7 Sep 2026: Michigan Contract Connect and SIGMA VSS NOT re-tested, per the 4 Sep instruction to stop burning a
  fetch on them. Michigan coverage came from rfpmart instead. The portals remain a documents-and-contacts gap.
- 7 Sep 2026: eu-startups article pages still 403; WebSearch against the domain works and DID yield two new names
  today (AI Score, iPronics), so mark those cards snippet-level. techstartups and entrackr both fresh and read full.
- 9 Sep 2026: rfpmart global + software + AI/ML + web-design indexes all fetched clean. NOTHING was posted on
  6, 7 or 8 Sep — the newest rows before 9 Sep were still 5 Sep. Weekend plus Labor Day covers 6 and 7; **8 Sep
  was an ordinary Tuesday and is unexplained**, so log it as a source outage, not a quiet market.
- 9 Sep 2026: the Global index yielded exactly ONE new tech row (AI-1256, verified green). Every other tech row
  on it was already in the array — the 7 Sep back-catalogue close-out is holding, so a single full read of the
  Global index per run is now cheap.
- 9 Sep 2026: **RFPMart eligibility fields can contradict the buyer's country.** SW-119267 is an Alberta
  municipal HRIS/payroll buy whose eligibility line reads verbatim "Onshore (USA Organization Only)". This joins
  the 4 Sep "question deadline after the close date" pattern as an RFPMart data-quality issue. Same handling:
  quote the field as printed, flag the contradiction on the row, say "confirm with the buyer", default to amber.
- 9 Sep 2026: techstartups published an 8 Sep daily, a separate 8 Sep VC roundup and two standalone round
  stories — **the roundup carries names the daily does not** (Forus, Split Pay, Blee were roundup-only). Read
  both, not just the daily. No 9 Sep techstartups daily existed at sweep time.
- 9 Sep 2026: entrackr fresh, read in full. Swish, DaMENSCH and Slice all re-checked and all still unannounced,
  so no REPORTED conversion this run — the first run in three without one. eu-startups article pages still 403;
  WebSearch against the domain yielded one new name (Tellia), marked snippet-level.
- 10 Sep 2026: rfpmart global + software + AI/ML + web-design indexes all fetched clean and the source is publishing
  normally again (roughly 70 software rows posted that day). The 8 Sep blank was a ONE-DAY outage and did not repeat.
  The Global index yielded five new tech rows, all five verified green and all five live.
- 10 Sep 2026: techstartups published a 10 Sep daily, a 9 Sep VC roundup and two standalone round stories (Harvey,
  Cognition AI), all four read in full. Entrackr fresh and read in full, and it carried three REPORTED conversions.
  eu-startups article pages still 403 to fetch; WebSearch against the domain yielded IVEX and Fluencify (both marked
  snippet-level) plus Bynario, which was corroborated by the techstartups daily and so did not need the flag.
- **10 Sep 2026: STEPS 2b AND 3 COULD NOT RUN IN THIS SESSION, and the cause is worth recording so a later run does
  not lose time to it.** Neither `node` NOR `git` is on the Bash tool's PATH, so `node verify-tracker.js` and
  `git status` both fail with "command not found". Both are installed: `C:\Program Files\nodejs\node.exe` and
  `C:\Program Files\Git\cmd\git.exe`. The pre-granted permissions (`Bash(node:*)`, `Bash(git ...)`) match only the
  bare `node` and `git` tokens, so the two obvious workarounds, an absolute path
  (`"/c/Program Files/nodejs/node.exe" verify-tracker.js`) and a PATH prefix (`PATH=... node ...`), are refused by the
  permission layer rather than by the shell. This is an environment problem, not a data problem: the sweep and the
  edits complete fine. Fix it once by adding the nodejs and Git `cmd` directories to the PATH the Bash tool inherits,
  or by allowing the absolute-path form in `.claude\settings.json`. Until then a session in this state has to stop
  after the edits and hand `node verify-tracker.js` plus the Step 3 commands back to Sajid. Do NOT commit unverified.
- **11 Sep 2026: THE 10 SEP PATH PROBLEM IS FIXED, AND THE REMAINING TRAP IS COMMAND CHAINING, NOT THE PATH.** Credit
  where it is due: the 10 Sep entry above diagnosed it correctly and Sajid fixed it in commit `d6793e3` ("fix PATH for
  the headless run", which added the PATH lines to `run-daily-tracker.cmd` and committed the 10 Sep page edits at the
  same time). As of 11 Sep both tools are reachable from the Bash tool with no absolute path and no PATH prefix:
  `node --version` returned v24.14.1 and `git status --short` worked straight away. What can still look like the same
  failure is different and much simpler, and a run should not misread it as a regression. First, the `PowerShell` tool is denied
  outright under `defaultMode: "dontAsk"` (it is not in the `.claude\settings.json` allow list), so anything routed
  through it dies. Second, the allow list matches **command prefixes**, so `Bash(node:*)` and `Bash(git status:*)`
  permit only a call that *starts* with that token. A chained call like `git --version; node --version; git status`
  is refused as a whole, which looks exactly like "command not found" if you do not read the error. **So: issue one
  command per Bash call, starting with the bare `git` or `node` token, and do not reach for PowerShell or an absolute
  path.** No PATH change and no settings change is needed. Verified on 11 Sep by running `node verify-tracker.js` and
  the full Step 3 sequence successfully.
- 11 Sep 2026: rfpmart global + software + AI/ML + web-design indexes all fetched clean, and **NOTHING at all was
  posted on 11 September**, an ordinary working Friday. Newest rows everywhere were 10 Sep. That is the second blank
  in four days after the 8 Sep one-day outage, so check on the next run whether 11 Sep fills in late before treating
  the pattern as structural. The Global index yielded **zero** new tech rows for the first time: all ~26 tech rows on
  it were grepped against `index.html` and every one was already logged or already opened and rejected. The run's
  entire output came from the ~60 non-global 10 Sep software rows the 10 Sep run said it had not opened, which is the
  4 Sep back-catalogue lesson applying to a one-day-old backlog rather than a weeks-old one.
- 11 Sep 2026: **the category-index URLs in the guide's prose do not match the ones the page actually uses**, and two
  fetches were wasted finding that out. The working URLs are the ones in the `REF` object in `index.html`:
  `software-system-and-application-rfp-government-contract.html` and
  `web-design-and-development-rfp-government-contract.html`, plus
  `artificial-intelligence-and-machine-learning-rfp-government-contract.html` for AI/ML. The shorter guesses
  (`software-rfp-...`, `website-design-rfp-...`, `artificial-intelligence-rfp-...`) all resolve to a generic latest
  listings page that returns unrelated federal and non-tech rows, which is easy to mistake for a dry category.
- 11 Sep 2026: techstartups published **no 11 Sep post at all** at sweep time; the 10 Sep VC roundup was read in full
  instead and supplied four rows. Entrackr fresh and read in full, carrying exactly one 11 Sep round (Popo Global).
  eu-startups article pages still 403 to fetch; WebSearch against the domain yielded one new name (Furo, marked
  snippet-level) and confirmed that Cato and Backbone, which the search also surfaced, were already logged.
- 11 Sep 2026: Slice re-checked for the fourth consecutive run and **still not announced**, so the REPORTED flag
  stands. The re-check was still worth it: the $100M includes a **secondary** share sale, and Neo Wealth's own cheque
  is reported at roughly $20M to $40M, so the primary capital actually landing is a fraction of the headline. Add this
  to the 10 Sep "a conversion is a qualification step, not automatically good news" lesson: an *unconverted* row can
  also be qualified downward without ever closing.
- 15 Sep 2026: rfpmart global + software + AI/ML + web-design indexes all fetched clean, covering 12 to 15 Sep.
  **11 September filled in completely, late** (see the publishing-lag rule above). 12 Sep (Saturday) carried 54
  software rows, 13 Sep (Sunday) only US federal notices, 14 Sep 12 rows, and **nothing anywhere is dated 15 Sep**,
  which is the same lag showing at the front of the table. The Global index yielded exactly one new tech row for
  the second run running (ITES-10977, verified green), so the 7 Sep back-catalogue close-out is still holding.
- 15 Sep 2026: the AI/ML full-table read produced four rows. Every `AI-` row was grepped against `index.html`,
  seven were absent (AI-1260 to AI-1266), and five were opened. AI-1264 (a written guide to AI adoption at
  airports) and AI-1265 (Connecticut inpatient pre-bill review, clinical revenue cycle) were judged out of scope
  without a fetch. The rule keeps paying: three of the five opened became rows.
- 15 Sep 2026: **techstartups published no daily on 12, 13 or 15 Sep and no VC roundup at all since 10 Sep.** The
  11 Sep daily (Kinetix AI, AIDIN Robotics, Enigmata, Furo) did not exist at the 11 Sep sweep and was read today,
  supplying two rows. Entrackr fresh and read in full, carrying only two items across four days (UniqYou, Furnishka).
  eu-startups article pages still 403 to fetch; WebSearch against the domain yielded EUCLYD and Zero, both marked
  snippet-level. Weekly sources (Crunchbase, New Market Pitch, StartupTalky, todaysstartupnews) NOT re-read, so
  unswept rather than dry.
- 15 Sep 2026: the mandatory cyber search paid again after the 11 Sep dry run, returning **Fortaegis** ($50M
  Series A, Amsterdam, Serendipity Capital, silicon-rooted key derivation). It was carried by the techstartups
  14 Sep daily, so it did not need a snippet-level flag, which is the 10 Sep "cite the source that fetches cleanly"
  point holding.
- 15 Sep 2026: **Slice re-checked for the FIFTH consecutive run and still not announced.** The re-check still paid:
  Neo Wealth's cheque is now reported at $20M to $25M of the $100M (narrowing the 11 Sep $20M to $40M range) and
  the valuation fall is put at roughly 68% from the $1.4B set in 2021. Five re-checks with no close is itself a
  signal, so the row is now framed as a watch item rather than a live lead. Also worth recording as method:
  **UniqYou appeared on BOTH techstartups and an Entrackr exclusive on the same day**, techstartups carrying the
  amount and Entrackr the valuation, so the two together completed the row and it needed no REPORTED flag. When
  an Entrackr exclusive is corroborated by a source that states the amount, check before flagging it REPORTED.
- 15 Sep 2026 (second run): rfpmart global + software + AI/ML + web-design indexes all re-read a few hours after the
  first run of the day. **15 September filled in completely in the interval** (~57 software rows, 5 AI, 5 web-design,
  1 Global), which confirms the lag rule on the day it was written. The Global index yielded exactly one new tech row
  for the THIRD run running (WD-16231, Estonia, verified green), so the 7 Sep back-catalogue close-out still holds.
  Six US rows went to the SLED tab, including a **Michigan** row (WD-16228) off the web-design index, which is the
  "a blocked state portal is not a blocked state" rule holding for the second time.
- 15 Sep 2026 (second run): opened and rejected, recorded so a later run does not re-open them: SW-119539 (Ireland,
  systematic review platform) is managed SaaS not a build; **SW-119508 (Ohio) is a trap worth naming** because its
  title, "Human Identity API Solution", reads like API platform engineering while the actual scope is the supply of
  500 access-management licences; AI-1263 (California) is SaaS courseware AND a Total Small Business Set-Aside, which
  bars the prime route too; AI-1270 (UK) is research consultancy (methodology document, data collection protocol,
  spreadsheets) despite the AI- prefix.
- 15 Sep 2026 (second run): techstartups **15 Sep daily read in full** plus standalone Exein and EUCLYD articles;
  it did not exist at the first run of the day. Entrackr fresh, one new round (Flam, $40M Series B, QED Investors).
  eu-startups still 403 to fetch, WebSearch against the domain yielded Zeit AI (already logged 3 Sep, see the
  grep-the-company-name rule above), Pharosyn and iPremom. Slice re-checked for the SIXTH consecutive run, still
  reported rather than announced, no new detail, flag stands.
- 16 Sep 2026: rfpmart global + software + AI/ML + web-design indexes all read in full and **NOTHING anywhere is dated
  16 September**. Under the 15 Sep lag rule that is not a finding and was not written up as one, which is the first
  time the rule has been applied to a run's own blank rather than to a correction of an earlier run. The whole output
  came from re-reading **15 September**, and specifically from the ~40 software rows the second 15 Sep run explicitly
  closed by saying it had left unopened. Worth stating for later runs: **this was not a lag catch, it was yesterday's
  declared backlog**, and the two are different claims. Do not describe backlog work as if the source had hidden it.
- 16 Sep 2026: the Global index yielded **zero** new tech rows (all ~26 grepped against `index.html`, every one already
  logged or already rejected) and the AI/ML full-table read produced nothing new either, so the run has **no green**.
  That is the second zero-green day since the back-catalogue close-out and it is a straight report, not a miss.
- 16 Sep 2026: the Ontario/USA eligibility contradiction recurred (SW-119534, an Ontario conferencing buy whose
  eligibility line reads verbatim "Onshore (USA Organization Only)"), joining the 9 Sep Alberta case. Same handling,
  quote as printed and confirm with the buyer. The row was rejected on scope anyway: physical AV installation.
- 16 Sep 2026: techstartups published **no 16 Sep post** at sweep time, and the **15 Sep VC roundup** (which did not
  exist when the second 15 Sep run read the 15 Sep daily) supplied five of eight funding rows including AIUC, the best
  product-fit name this tab has carried. The roundup itself opens by saying the previous day's edition had been
  missed, so **the lag is sometimes the publisher's own**, not just a timing gap against the sweep.
- 16 Sep 2026: **the mandatory cyber search was dry, and the date check caught a real two-run miss.** Everything it
  returned was already logged (Upwind, QNu Labs) or out of date range, except **SCI Semiconductor** (£5M, PXN Ventures
  and Mercia, CHERI memory-safe chips), announced **9 to 10 September** and therefore missed by both the 11 and 15 Sep
  cyber searches. It got no row (hardware, small), but it is evidence for the 7 Sep instruction to check the two or
  three days *before* the last run's date, which is the part of that rule that keeps being skipped.
- 16 Sep 2026 (second run): **the lag rule is now settled and should stop being re-litigated.** The first 16 Sep run
  read all four indexes in full and recorded that nothing anywhere carried today's date. Read again a few hours later,
  the software index carries **more than sixty** rows posted 16 Sep, the AI/ML index five, the web-design index six and
  the Global index seven. That is three consecutive same-day pairs of runs (11 Sep corrected on 15 Sep, 15 Sep morning
  corrected by 15 Sep evening, 16 Sep morning corrected by 16 Sep evening) in which the later run found rows the earlier
  one could not see. Treat a same-day blank as a non-event: do not write it up, do not explain it, just re-read on the
  next run. The Global index yielded **zero** new tech rows for the second run running (all seven of its 16 Sep rows are
  translation, marketing, branding, recruitment, publication and strategy work), so the 7 Sep back-catalogue close-out
  still holds and there was no green today.
- 16 Sep 2026 (second run): **the same lag applies to the techstartups DAILY, confirmed twice now in two days.** The
  first 16 Sep run recorded no 16 Sep post at all; the 16 Sep daily existed hours later and supplied two funding rows
  (CADDi, Noetive). Combined with the 15 Sep second-run entry above, "no daily today" is never a finding at 19:00
  Asia/Karachi on either tab. Entrackr fresh, read in full, and genuinely dry: everything on it for 15 and 16 Sep was
  already logged or already recorded as dropped. eu-startups still 403 to fetch; WebSearch against the domain yielded
  Hackuity, Veridion and Integral, **all three also carried by sources that fetch cleanly** (Tech.eu, TechFundingNews),
  so none needed the snippet-level flag.
- 16 Sep 2026 (second run): **the cyber search paid twice, and the date check is doing the work rather than the search.**
  Hackuity (€16M led by Forgepoint Capital International, Lyon, a vulnerability operations centre normalising findings
  from 130+ tools) is a same-day round. Date-checking the rest of the results then caught **Huskeys** ($27M Series A led
  by Blackstone Innovations Investments, network edge security management, a trillion web requests analysed daily),
  announced **8 September** and missed by five consecutive cyber searches (9, 10, 11, 15 and the first 16 Sep run). That
  is the second run running where the date check produced the find and the search itself did not. The 7 Sep instruction
  to check the days BEFORE the last run's date is the single most-skipped rule in this file.
- 16 Sep 2026 (second run): six US rows off the 16 Sep postings, including **Michigan for the third time in two days**
  (SW-119598, surfaced off the **AI/ML index rather than the software index** because the source cross-categorises it,
  which is the 11 Sep PM-23948 mechanism repeating) and **Massachusetts for the second time** since COMMBUYS was
  confirmed behind a login on 3 Sep. Both portals remain a documents-and-contacts gap; neither state is a coverage gap.
- 17 Sep 2026: rfpmart global + software + AI/ML + web-design indexes all read in full. Exactly ONE row anywhere
  carries a 17 September index date (TELCOM-3035) and its own detail page dates it to 16 September, so under the
  settled lag rule that was not written up. The whole run came from the 16 September rows yesterday's second run
  declared unopened. The Global index yielded zero new tech rows for the THIRD run running, so no green, but the
  full grep of its tech rows found SW-118811 had never been opened at all (see the back-catalogue correction above).
  Nine US rows went to the SLED tab in nine states, including first-ever Maine, Kansas and Arizona rows.
- 17 Sep 2026: opened and rejected, recorded so a later run does not re-open them: AI-1272 (Ontario, responsible-AI
  training curriculum across three levels, courseware not a build, same call as AI-1263); SW-119573 (New Brunswick,
  RFI for ergonomics software, product and licence purchase); SW-119571 (Quebec, supplier collaboration digital
  marketplace, right shape of work but INFO ONLY with no document and, unlike SW-118811/SW-119585, no older twin
  listing publishing the scope).
- 17 Sep 2026: techstartups published **no 17 Sep post** at sweep time (a non-event under the lag rule); the
  **16 Sep VC roundup** had not been read by either 16 Sep run and supplied eight of twelve funding rows, which is the
  11 Sep "day N's roundup lands after day N's sweep" rule holding for the fourth time. Entrackr fresh and read in
  full, one new name for 17 Sep (Enlight Metals). eu-startups still 403 to fetch; WebSearch against the domain
  returned EnforceShield, Veridion, Chift and Isometric, of which only EnforceShield was new, and it is carried by
  Tech.eu as well so it needed no snippet-level flag.
- 17 Sep 2026: **the cyber search itself was useless and the date check produced the find, for the third run running.**
  The search returned almost entirely undated listicle aggregators (leadmagic, vcbacked, growthlist, failory,
  fundraiseinsider, projectstartups). Blocking those domains on the second attempt surfaced SiliconANGLE and
  **Eve Security** ($4.5M seed extension, Austin, Run Ventures, runtime governance for deployed AI agents), announced
  **15 September** and missed by both 16 Sep runs. The same date check correctly excluded Glow's $180M Series A, which
  the listicles present as 2026's largest cyber round: it was announced **22 July**. Practical tip worth reusing:
  pass those aggregator domains in `blocked_domains` on the cyber search, they crowd out dated reporting.
- 7 Sep 2026: ServiceNow publishes its partner tiers, and a listing that requires an "Elite or premier partner"
  therefore hands over a real, checkable prime list. Add that to the CONFIRMED-primes sources: whenever a listing
  names a required vendor certification or partner tier, the vendor's own partner directory IS the prime list.
