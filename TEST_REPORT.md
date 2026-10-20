# Test Report

## Live execution: NOT PERFORMED
The authoring environment had no network access, so Cypress could not be installed and nothing was run against
Proton Mail. No pass/fail numbers are reported because none exist.

## Static checks that were actually executed (2026-10-20)
| Check | Result |
|---|---|
| `npm run lint:syntax` (all spec/support JS as ES modules + config) | 19 files checked, 0 failed |
| JSON validity (package.json, env example, fixtures) | OK |
| Test-case ID coverage: IDs referenced in specs | 18 unique (AUTH-01..03, COMP-01..04, DRAFT-01..02, INBOX-01..03, SEARCH-01..02, FILTER-01, ASYNC-01, ATT-01, FOLD-01) |
| Smoke set (`@smoke`) | AUTH-01, COMP-01, DRAFT-01, INBOX-03, ASYNC-01 |

## How to produce the real report
```bash
npm install
cp cypress.env.example.json cypress.env.json   # fill in credentials
npm run cy:run                                  # writes reports/index.html (+ videos, screenshots)
```
Paste totals and a per-test table here, with each failure classified (selector drift / wrong assumption / flake / product defect).
