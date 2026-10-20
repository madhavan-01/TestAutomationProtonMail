# Proton Mail Web - Cypress (JavaScript) Automation Suite

18 automated scenarios (20 executions) for https://proton.me/mail (mail.proton.me): auth, compose, drafts, inbox
actions, search, filters, async (undo send), attachments, folders.

## First run
Before the first full run, open `npm run cy:open` and confirm the entries in `cypress/support/selectors.js` against the live UI (Selector Playground). Proton can change its markup between releases; this is the only file that normally needs updating.

## Prerequisites
- Node.js 18+ and Chrome (Firefox optional)
- One Proton test account (free tier OK, **2FA off**, nothing important in it). A second account is optional:
  it enables true sender -> receiver flows and un-skips COMP-04 and SEARCH-02.
- Undo Send enabled (default).

## Setup
```bash
npm install
cp cypress.env.example.json cypress.env.json    # fill in credentials (file is git-ignored)
npm run lint:syntax                             # sanity check, works without Cypress
```
`SENDER_EMAIL` must be the full address (e.g. `username@proton.me`; confirm your domain). Do not commit credentials;
in CI use secrets exposed as `CYPRESS_SENDER_PASSWORD` etc.

## Run
| Command | Purpose |
|---|---|
| `npm run cy:open` | Interactive runner, Selector Playground (use this first to verify selectors) |
| `npm run cy:run` | Full suite, headless Chrome |
| `npm run cy:smoke` | 5 `@smoke` tests (PR set) |
| `npm run cy:run:firefox` | Firefox |
| `npm run cy:spec -- cypress/e2e/search.cy.js` | One spec |

Outputs: `reports/index.html` (mochawesome, embedded screenshots), `reports/*.json`, `cypress/videos/`, `cypress/screenshots/`.

## Structure
```
cypress/e2e/*.cy.js            specs, titles carry test-case IDs
cypress/support/commands.js    cy.loginAs (cy.session + cy.origin), cy.ctl, cy.iframeBody
cypress/support/pages/         mailbox, compose, settings, seed
cypress/support/selectors.js   every raw selector
cypress/support/data.js        unique data, account/2nd-account helpers
cypress/fixtures/              attachment file, invalid recipients
docs/                          strategy, test cases (md+csv), architecture, test + defect reports, video script
```

## Design decisions
- Login once per role (`cy.session`, cached across specs); only 3 tests do a real login.
- `cy.origin` for account.proton.me (login and settings are on another origin).
- No blind sleeps: retry-able assertions; `waitForMessage` polls with a bounded interval for eventual delivery; undo-send syncs on the toast/Undo button.
- Unique data per test; `addCleanup` removes folders/filters even on failure.
- One retry in run mode; retried passes are marked flaky in the report, not hidden.
- Optional second account; tests that need it are skipped visibly.

## Assumptions and limitations
- Cypress runs one tab: two-account flows switch sessions sequentially.
- Signing out in AUTH-03 invalidates the cached session; `cy.session` re-logs in on the next test (extra login).
- Advanced search uses URL hash keys `keyword`/`from` (assumption).
- Filter/folder creation wizards are the least certain flows (free tier: 1 filter, 3 folders/labels).
- No API cleanup: purge `AUTO-` mail periodically (backlog item).
- Manual only: scheduled delivery, password-protected mail, BCC privacy, HTML sanitisation, CAPTCHA/rate-limit behaviour.

## Troubleshooting
- *Missing credentials* - check `cypress.env.json`.
- *Stuck on login / human verification* - log in manually once from the same IP, then re-run; avoid repeated runs.
- *Element not found* - open the failure screenshot/video, fix the entry in `selectors.js` using the Selector Playground.
- *cy.origin errors* - Cypress >= 12 required; confirm the page really navigated to account.proton.me.
- *Message not found after send* - check Sent; if present, delivery is slow: raise `attempts` in `waitForMessage`.

## Automation quality review
**1. Not automated (and why).** Scheduled-send delivery (server clock; Cypress `cy.clock` cannot advance it), password-protected mail (external recipient, crypto UI), BCC privacy (third mailbox), HTML/script sanitisation (crafted mail + judgement), CAPTCHA/rate limits (changes, can lock accounts), large-attachment limits (slow, plan-dependent), autocomplete popovers and rich-text rendering (brittle, low risk), date-range search (needs back-dated data).

**2. PR vs nightly.** Per PR (`@smoke`, ~5-8 min): AUTH-01, COMP-01, DRAFT-01, INBOX-03, ASYNC-01 - main journeys and highest-risk state transitions. Nightly: everything, plus Firefox - slower, rate-limit-prone, and touches account settings, so a failure deserves morning triage but should not block merges.

**3. Passes locally, flaky in CI.** Inspect video/screenshot of the failed attempt, then compare timing (slower runner), network/IP (CI triggering human verification), and data (leftover mail or a concurrent run on the same account - hence the concurrency lock). Reproduce with the same browser/viewport in Docker, run the spec repeatedly, and check whether the failing wait is state-based. Fix the cause (missing sync, shared state), not the timeout or retry count.

**4. Frequent UI changes.** Test-ids/accessible names over CSS paths, one selector file, behaviour-level page functions (`mailbox.trash(subject)`), assertions on state (folder contents) not transient UI, and a scheduled smoke run to catch drift early. Quarantine with a ticket; no blanket retries.

**5. Scaling to 200+ tests.** Keep layers strict; add component modules (message list, composer, toast); API-assisted seeding/cleanup; a generated account per worker for true parallelism; spec sharding (Cypress Cloud or `--spec` splits in CI); tags per area; test-case IDs in titles; a flaky-test dashboard from the JSON reports; per-area ownership and a PR checklist (unique data, no sleeps, state assertions).
