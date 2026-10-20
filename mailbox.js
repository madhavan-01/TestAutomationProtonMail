import S from '../selectors';

export const mailbox = {
  goto(folder = 'inbox') {
    cy.visit(`/u/0/${folder}`);
    cy.get(S.sidebar.compose, { timeout: 60000 }).should('be.visible');
  },

  /** Either rows or the empty state exists once loading finished. Required before negative checks. */
  settled() {
    cy.get(`${S.list.row}, ${S.list.empty}`, { timeout: 30000 }).should('exist');
  },

  row(subject) {
    return cy.contains(S.list.row, subject, { timeout: 15000 });
  },

  /**
   * Eventual delivery/indexing: reload and look, with a short poll interval between attempts.
   * The cy.wait here is a bounded POLL interval (not a blind sleep before an assertion).
   */
  waitForMessage(folder, subject, attempts = 12) {
    mailbox.goto(folder);
    mailbox.settled();
    cy.get('body').then(($b) => {
      const found = $b.find(S.list.row).filter((_, el) => el.innerText.includes(subject)).length > 0;
      if (found) return;
      if (attempts <= 1) throw new Error(`Message "${subject}" did not appear in "${folder}" in time`);
      cy.wait(5000); // poll interval
      mailbox.waitForMessage(folder, subject, attempts - 1);
    });
  },

  expectAbsent(folder, subject) {
    mailbox.goto(folder);
    mailbox.settled();
    cy.contains(S.list.row, subject).should('not.exist');
  },

  selectRow(subject) {
    mailbox.row(subject).find(S.list.checkbox).first().check({ force: true });
  },

  open(subject) {
    mailbox.row(subject).click();
    cy.get(S.message.view, { timeout: 15000 }).should('be.visible');
  },

  /** In Drafts a row click re-opens the composer. */
  openDraft(subject) {
    mailbox.row(subject).click();
    cy.get(S.composer.root).last().should('be.visible');
  },

  markUnread(subject) {
    mailbox.selectRow(subject);
    cy.ctl(S.toolbar.more).click();
    cy.contains(/mark as unread/i).click();
  },
  expectUnread(subject) {
    mailbox.row(subject).invoke('attr', 'class').should('match', S.list.unreadClass);
  },
  expectRead(subject) {
    mailbox.row(subject).invoke('attr', 'class').should('not.match', S.list.unreadClass);
  },

  star(subject) {
    mailbox.row(subject).find(S.list.star).first().click({ force: true });
  },

  trash(subject) {
    mailbox.selectRow(subject);
    cy.ctl(S.toolbar.trash).click();
    cy.contains(S.list.row, subject).should('not.exist');
  },
  restoreToInbox(subject) {
    mailbox.selectRow(subject);
    cy.ctl(S.toolbar.moveToInbox).click();
    cy.contains(S.list.row, subject).should('not.exist');
  },

  moveToFolder(subject, folderName) {
    mailbox.selectRow(subject);
    cy.ctl(S.toolbar.moveTo).click();
    cy.get(S.toolbar.dropdown).contains(new RegExp(`^${folderName}$`)).click();
    cy.contains(S.list.row, subject).should('not.exist');
  },
  openCustomFolder(name) {
    cy.contains('a', name).first().click();
    mailbox.settled();
  },

  search(keyword) {
    cy.get('body').then(($b) => {
      if (!$b.find(S.search.input).filter(':visible').length) cy.ctl(S.search.open).click();
    });
    cy.get(S.search.input).first().clear().type(`${keyword}{enter}`);
    mailbox.settled();
  },

  /** Multi-condition search through URL hash filters. ASSUMPTION: keys keyword/from are honoured. */
  advancedSearch({ keyword, from, folder = 'all-mail' }) {
    const q = new URLSearchParams();
    if (keyword) q.set('keyword', keyword);
    if (from) q.set('from', from);
    cy.visit(`/u/0/${folder}#${q.toString()}`);
    cy.get(S.sidebar.compose, { timeout: 60000 }).should('be.visible');
    mailbox.settled();
  },

  messageBody() {
    return cy.iframeBody(S.message.bodyFrame);
  },
  messageHeader() {
    return cy.get(S.message.header).first();
  },
};
