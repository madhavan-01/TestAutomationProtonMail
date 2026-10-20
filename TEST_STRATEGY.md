# Test Strategy - Proton Mail Web

**Scope.** Authentication/session, compose/send, drafts, inbox actions, folders, search, filters, attachments, one async workflow (undo send). Web client only, Chromium primary.

**Out of scope / exclusions.** Encryption correctness, mobile apps, calendar/drive/VPN, billing, performance/load, account recovery, accessibility audits.

**Assumptions.** One dedicated account minimum (second account optional, enables true two-account flows), 2FA off, Undo Send on. Live app is the system under test; no vendor test environment. Documentation may differ from behaviour - differences are logged as findings.

**Risks and mitigations.**
| Risk | Mitigation |
|---|---|
| CAPTCHA / rate limiting on login and send | Login once per role with cy.session; only 3 real logins; 1 CI retry; concurrency lock |
| E2E-encrypted, dynamic UI; editor in iframe | Cypress retry-ability, iframe helper command, centralised selectors |
| Async delivery / indexing | `waitForMessage` with reload + bounded poll; state-based asserts; no sleeps |
| Shared mailboxes cause collisions | Unique subjects/tokens, teardown for settings objects |
| Free-tier limits (1 filter, 3 folders) | Create/delete within the test; cleanup fixture |
| UI changes without notice | Selector file, smoke job per PR, weekly drift check |

**Prioritisation.** P0 journeys that block use (login, send/receive, draft persistence, trash/restore, undo send); P1 core features (search, filters, attachments, folders, CC); P2/P3 edge and cosmetic.

**Test levels.** UI end-to-end for user journeys (this suite). Where available, API/direct setup would replace UI seeding (backlog). Unit/contract levels belong to the vendor.

**Automation approach.** Cypress (JavaScript), page-object modules, cy.session for per-role login, @cypress/grep tags for the smoke set. Automate stable, repeatable, high-value paths; keep time-dependent, external and judgement-heavy checks manual (see TEST_CASES.md).

**Coverage rationale.** Each area has at least one P0/P1 positive path and, where cheap, a negative path (wrong password, no recipient, invalid recipients, no-result search, non-matching filter). Two-account flows validate real delivery, not just UI state. Assertions check folder membership, message state, file bytes and restored composer content.

**Exit criteria.** All P0 automated tests green on two consecutive runs; any failure triaged as defect, assumption or flake with evidence.
