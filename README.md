# cPALSs Project Health

Live: [https://cpalss.github.io/status/](https://cpalss.github.io/status/)  
Repo: [cPALSs/status](https://github.com/cPALSs/status)

Public-scrubbed portfolio dashboard for board members and committee chairs. Overall GREEN / YELLOW / RED / HOLD plus finance, staffing, and critical-path gates — the **signal**, not the work queue.

## Edit / preview / publish

```bash
# From this folder (Operations/Sites/status)
python3 -m http.server 8765
# → http://127.0.0.1:8765

git add -A && git commit -m "Update project health" && git push
```

Push to `main` deploys via `.github/workflows/deploy-pages.yml`.

## Content

| File | What to edit |
|------|----------------|
| `data/projects.json` | Project cards, RAG statuses, critical-path checklists, public links |

Update after **Festival Projects Weekly** or whenever a Core gate flips (venue booked, contract signed, deposit made, Core seat filled, cash gate scored).

### Public scrub checklist

Before push, confirm published JSON/HTML has:

- No bank balances, pledge totals, or exact treasury figures
- No personal emails / phones
- No vault paths, private Sheet URLs, or monorepo relative links
- Public HTTPS links only (event hubs, cpalss.com sites)

## Status vocabulary

| Overall | Meaning |
|---------|---------|
| **green** | Core gates on track → greenlight path |
| **yellow** | At least one Core risk; still recoverable |
| **red** | Hard gate miss or critical mass → no-go review |
| **hold** | Intentionally paused / not pursuing |

Critical-path item statuses: `done` · `in_progress` · `at_risk` · `not_started` · `na`.

Season labor detail (Core / Unlock / Extra queues) stays on each season Event Planning Tracker. This site does not replace those sheets.

## Optional custom domain

On the **cpalss.com** zone:

| Type | Name | Value |
|------|------|--------|
| CNAME | `status` | `cpalss.github.io` |

Then GitHub repo **Settings → Pages** → custom domain `status.cpalss.com` → Enforce HTTPS. Add a `CNAME` file in this repo if you enable it.

## Later

- Ops scheduling may move to [The Schedly](https://theschedly.com/) — this page stays useful as the board-facing health signal.
- Do not auto-sync from season Sheets in v1; keep curated JSON so the teaching vocabulary stays clear.
