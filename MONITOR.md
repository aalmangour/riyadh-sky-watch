# Riyadh Sky Watch — cloud monitor loop

This file is the full instruction set for running the Sky Watch monitor inside a
**Claude Code cloud session** (so it draws on the cloud-session credit instead of
the plan's weekly limit). Start the session on this repository and say:

> Run the Sky Watch monitor loop as described in MONITOR.md.

The session then repeats one *run* roughly every 30 minutes until Ahmed stops it.

## Who this is for

The map shows missile/drone risk around Riyadh and Saudi Arabia for Ahmed (lives in
Riyadh, timezone Asia/Riyadh, UTC+3) and the people he shares it with. It is served
from GitHub Pages: https://aalmangour.github.io/riyadh-sky-watch/ — the file that
matters is `data.json` on branch `main` of this repository. A second copy lives in a
Claude artifact (https://claude.ai/artifact/KFcauLvu7nHzb5kxbk5HeW); update it only
if an `Artifact` tool is available in the session, otherwise skip it and say so.

## The loop

Repeat forever:

1. Do one **run** (below).
2. Wait ~30 minutes, then go to 1. Use `ScheduleWakeup` / the `/loop` mechanism if
   the session offers it (delay 1800 s, `noop: true` when nothing changed). If it
   does not, wait with the shell in chunks: `sleep 600` three times (each shell call
   is limited to 10 minutes). Never wait longer than 35 minutes between runs.
3. If any run fails, note the failure in `data.json` → `monitor.note_en` on the next
   run and keep looping. Never stop the loop on your own; only Ahmed stops it.

Keep each run to roughly 14–20 tool calls so the session lasts for days. Do not
re-read this file or the whole page every run; the schema is in `data.json` itself.

## One run

**SPEED MATTERS.** Saudi ARABIC sources publish Civil Defense alerts and coalition
statements within minutes; English wires lag by 1–3 hours. Always search Arabic first.
Never invent facts; if nothing new happened, say so and still stamp the data.

### Step 1 — Sync the repo
`git pull --ff-only` in the repository root (the working directory). If it fails, run
`git fetch origin && git reset --hard origin/main` and continue.

### Step 2 — Read the current data
Read `data.json`. Note `generated_at` (last run time) and the newest incident ids/times.

### Step 3 — Research, Arabic first (6–10 calls)
Get today's date in Riyadh time and use it in the queries. Run these WebSearch
queries with mode "extended":

- (a) `"الدفاع المدني" "الرياض" إنذار OR "زوال الخطر" <today's date, e.g. 14 أكتوبر 2026>`
- (b) `"التحالف" "اعتراض وتدمير" الرياض OR الخرج OR الشرقية OR الظهران <today's date>`
- (c) `"الدفاع المدني" إنذار OR "زوال الخطر" الشرقية OR الدمام OR جازان OR عسير OR خميس مشيط <today's date>`
- (d) `Saudi Civil Defense alert Riyadh` / `Houthi missile Saudi intercepted <today's date>` (English, mode standard)

Then WebFetch the 3–5 most recent Arabic items (sabq.org, al-jazirahonline.com,
alraimedia.com, aawsat.com, alarabiya.net, slaati.com, akhbaar24, spa.gov.sa) and ask
each fetch for the exact publication timestamp with time zone and the Arabic statement
text. The newest Civil Defense announcement (إنذار / زوال الخطر) and coalition
statements (اعتراض وتدمير …) are the primary facts. Convert all times to Asia/Riyadh
(+03:00). Only consider items newer than `generated_at`, plus corrections to existing
incidents (casualty updates; the coalition later naming what was intercepted during an
alert already on the map → UPDATE that incident's note/weapon/kind, don't add a new one).

### Step 4 — Write the new data.json (keep the exact schema of the existing file)

- **incidents[]**: append new events. `id` = `YYYY-MM-DD-<place-slug>-<kind>`; fields:
  `time`, `tprec` ("exact"|"approx"|"day"), `kind` ("impact"|"intercept"|"alert"|
  "all_clear"|"attempt"|"debris"), `weapon` ("ballistic"|"cruise"|"drone"|"unknown"),
  `severity` (impact 4; intercept/attempt/debris 3; alert 3; all_clear 1), `radius_km`
  (impact 5; intercept 12–15; drone 8; city-wide alert 35; Eastern Province alert 40),
  `status` ("active" for a Civil Defense alert with no all-clear yet, or an attack
  reported in the last 60 minutes with no resolution; otherwise "past"), `lat`, `lng`,
  `place_en`, `place_ar`, `note_en`, `note_ar` (2–3 sentences, proper Arabic, include
  the clock time), `casualties_en`, `casualties_ar`, `source {title, url}`.
  Dedupe: same place, same kind, same day = same incident; update it instead of
  duplicating. When an all-clear arrives, set the matching alert's status to "past" and
  mention the all-clear time in its note. Drop incidents older than 30 days; keep at
  most 150.
- **sites[]**: for any site struck, targeted or alerted, append to its `history`
  `{date, kind, note_en, note_ar}`. If a new explicit threat names a site, set its
  `threat {date, note_en, note_ar}`. Re-rate EVERY site's `prediction`: `level`
  ("high"|"medium"|"low"), `confidence` ("high"|"medium"|"low"), `assessed_at` (now),
  `why_en[]` and `why_ar[]` (2–3 short reasons each), based on strikes and
  interceptions in the last 7 days, explicit threats in the last 14 days, strategic
  value and the current campaign pattern. Change ratings only for a reason you can
  state. Never remove a site; you may add one if a new place is struck or named
  (fields: id, en, ar, type "airport"|"airbase"|"oil"|"gov"|"military", lat, lng,
  approx, region "Riyadh"|"Eastern"|"South"|"West"|"North", value 1–5, core_km,
  history, threat, prediction).
- **summary {en, ar}**: 2–3 sentences on the last 24–48 hours, Riyadh first, newest
  event first, with clock times.
- **riyadh_level**: 0–4 (0 nothing, 1 low, 2 elevated, 3 high: attacks or alerts on
  Riyadh within 24 h or an active threat, 4 critical: an alert in force or a strike in
  the last 2 h).
- **generated_at** and **monitor.last_run**: now, ISO with +03:00. `monitor.status`
  "ok" (or "degraded" if sources were unreachable). `monitor.note_en` / `note_ar`: one
  line on what changed this run. Keep `monitor.cadence_en` / `cadence_ar` as they are.
- **sources[]**: the 6–8 most relevant links used, newest first.

Coordinates: use the site coordinates already in the file; cities: Riyadh centre
24.7136,46.6753; King Khalid Int'l Airport 24.9578,46.6989; Al Kharj 24.1554,47.312;
Prince Sultan Air Base 24.0627,47.5805; Riyadh refinery 24.5257,46.8726; Al Sulayyil
20.46,45.57; Wadi Ad Dawasir 20.4697,44.783; Dammam 26.4344,50.1033; Dhahran/Aramco HQ
26.2886,50.1142; Al Khobar 26.2172,50.1971; King Fahd Int'l Airport 26.4712,49.7979;
Jubail 27.0046,49.65; Ras Tanura 26.644,50.158; Abqaiq 25.938,49.665; Al Ahsa
25.3957,49.6163; Haradh 24.14,49.07; Abha 18.2167,42.5; Abha airport 18.2404,42.6566;
Khamis Mushait / King Khalid AB 18.2973,42.8035; Jazan 16.8967,42.5536; Najran
17.5409,44.2664; Jeddah 21.4882,39.1809; Jeddah airport 21.6796,39.1565; Taif
21.4373,40.5127; Makkah 21.4272,39.8435; Madinah 24.4706,39.6078; Yanbu
24.0939,38.0634; Tabuk 28.4146,36.5339; Hail 27.5305,41.6973; Hafr Al-Batin
28.4375,45.9805; Sharurah 17.4998,47.1886; AlUla 26.6348,37.9099; Farasan
16.7091,42.1269; Baish 17.37,42.54. For any other place, WebSearch its coordinates.

Validate before publishing: `python3 -c "import json;json.load(open('data.json'))"`.

### Step 5 — Push to GitHub (mandatory)
```
git add data.json && git -c user.name="Sky Watch monitor" -c user.email="noreply@anthropic.com" commit -m "monitor: data <generated_at>" && git push origin main
```
Set `monitor.github_en` in data.json to one line describing the result
("push ok <short sha> at <HH:MM>" or "push FAILED: <error, max 300 chars>") — amend
the commit if needed so the pushed file carries it. If the push failed, retry once at
most; if it still fails, say so in the run summary.

### Step 6 — Artifact copy (only if an `Artifact` tool exists)
Read https://claude.ai/artifact/KFcauLvu7nHzb5kxbk5HeW (no path) to get the saved page
file, then publish with that page file unchanged and `files {"data.json": "data.json"}`.
If no Artifact tool is available, skip this step and note "artifact: skipped" in the
summary.

### Step 7 — Notify only if needed
If this run added or changed an incident that is (a) within 60 km of Riyadh centre,
(b) a Civil Defense alert for Riyadh or Al Kharj, or (c) a strike anywhere in Saudi
Arabia with casualties: send ONE `PushNotification` if that tool exists (status
"proactive"), one line under 200 characters with the clock time, e.g.
"Sky Watch 09:55: alert for Riyadh & Al Kharj, explosions heard, all-clear 10:08. Map
updated." If no notification tool exists, write the same line as the first line of the
run summary prefixed "ALERT:". Otherwise do not notify.

### Step 8 — Run summary (one line)
"ALERT: <key fact>" if step 7 fired; otherwise "No new events. Data stamped <HH:MM
Riyadh>." Append " · GitHub: ok" or " · GitHub: FAILED (<reason>)" and
" · artifact: ok|skipped". Then go back to the loop and wait.
