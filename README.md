# Riyadh Sky Watch

Missile and drone risk map for Riyadh and Saudi Arabia. `index.html` is the app; `data.json` is refreshed hourly by an automated monitor. Not an official warning system: real-time warnings come only from Saudi Civil Defense phone alerts.

## Access

The web version asks for a password once per device (stored in the browser after a correct entry). The page holds only a SHA-256 hash of the password (`GATE_HASH` in `index.html`); change the password by replacing that hash. This is a courtesy gate, not security: the repository and `data.json` are public, and the check runs in the visitor's browser.

## Debris record

Incidents with `kind: "debris"` draw a triangle marker. They may carry `points[]`, one entry per place Civil Defense or press reports name as a debris fall site, each either `{ "district": "<Riyadh district name, en or ar>", "note_en", "note_ar" }` (snapped to the district centroid) or `{ "lat", "lng", "label_en", "label_ar", "note_en", "note_ar" }`. Points are approximate by default (`"approx": false` to say otherwise). Interceptions also show a dashed "debris possible" ring for their first 15 minutes, or while their `status` is `active`.
