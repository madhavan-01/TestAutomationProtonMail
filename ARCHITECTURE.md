# Architecture Note (Cypress / JavaScript)

**Layers.** `cypress/e2e/*.cy.js` (intent, test-case IDs, assertions) -> `cypress/support/pages/*` (mailbox, compose, settings, seed: behaviour functions) -> `cypress/support/selectors.js` (all raw selectors). Specs contain no selectors.

**Sessions.** `cy.loginAs(role)` wraps `cy.session` (cached across specs) so only `auth.cy.js` pays for real logins. Cypress has a single browser tab, so two-account flows switch sessions sequentially (`cy.loginAs('receiver')`) instead of using two parallel contexts. Login and settings live on `account.proton.me`, a different origin, so they run inside `cy.origin()`.

**Optional second account.** `hasReceiver()` decides whether mail is sent to the receiver or to the sender itself (self-loop). Tests that need a different sender (COMP-04, SEARCH-02) are skipped without it, visibly, not silently passed.

**Synchronisation.** Cypress retry-ability for every query/assertion. Eventual delivery uses `mailbox.waitForMessage` (reload, settle, check, bounded poll interval, fixed attempt count). Negative checks call `settled()` first so a loading list cannot produce a false pass. Iframes (composer, message body) go through `cy.iframeBody` / `its('0.contentDocument.body')`.

**Data and cleanup.** `uniqueSubject` / `uniqueToken` isolate runs. `addCleanup()` + global `afterEach` removes folders/filters even when a test fails.

**Reporting.** mochawesome HTML + JSON (embedded screenshots), videos, failure screenshots. 1 retry in run mode only.

**Tags.** `@cypress/grep`: `npm run cy:smoke` runs the 5 `@smoke` tests.

**CI.** GitHub Actions: syntax pre-flight, smoke on PR, full nightly, serial concurrency group (shared mailboxes), secrets as `CYPRESS_*` env vars.

**Trade-offs.** UI seeding is slower than API seeding but needs no undocumented endpoints. Cypress cannot drive two contexts at once and is Chromium/Firefox-first (WebKit experimental), which is why cross-browser is Chrome + Firefox here.
