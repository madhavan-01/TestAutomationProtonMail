import S from '../selectors';

const root = () => cy.get(S.composer.root).last();

export const compose = {
  root,
  toast: () => cy.get(S.toast),
  undoButton: () => cy.get(S.toast).contains('button', /undo/i),

  open() {
    cy.get(S.sidebar.compose).click();
    root().find(S.composer.to).should('be.visible');
  },

  addRecipients(field, addresses) {
    addresses.forEach((a) => root().find(S.composer[field]).type(`${a}{enter}`));
  },

  fill({ to = [], cc = [], bcc = [], subject, body } = {}) {
    if (to.length) compose.addRecipients('to', to);
    if (cc.length || bcc.length) {
      root().then(($r) => {
        const toggle = $r.find(S.composer.ccBccToggle);
        if (toggle.length) cy.wrap(toggle.first()).click();
        else cy.wrap($r).contains('button', /cc.*bcc|^cc$/i).click();
      });
      if (cc.length) compose.addRecipients('cc', cc);
      if (bcc.length) compose.addRecipients('bcc', bcc);
    }
    if (subject !== undefined) root().find(S.composer.subject).clear().type(subject, { delay: 0 });
    if (body !== undefined) compose.typeBody(body);
  },

  typeBody(text) {
    root()
      .find(S.composer.bodyFrame)
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(($body) => {
        const $el = $body.is('[contenteditable="true"]') ? $body : $body.find('[contenteditable="true"]').first();
        cy.wrap($el).click().type(text, { delay: 0 });
      });
  },

  clickSend() {
    root().find(S.composer.send).click();
  },
  /** Send and wait for the confirmation toast (state-based). */
  send() {
    compose.clickSend();
    cy.get(S.toast).contains(/message sent/i, { timeout: 30000 }).should('be.visible');
  },

  /** Closing the composer triggers draft auto-save. */
  close() {
    root().find(S.composer.close).click();
    cy.get(S.composer.root).should('not.exist');
  },

  attach(fixturePath, fileName) {
    root().find(S.composer.fileInput).first().selectFile(fixturePath, { force: true });
    root().contains(fileName, { timeout: 30000 }).should('be.visible');
  },

  expectValues({ to = [], subject, body } = {}) {
    to.forEach((a) => root().contains(a).should('be.visible'));
    if (subject !== undefined) root().find(S.composer.subject).should('have.value', subject);
    if (body !== undefined) {
      root()
        .find(S.composer.bodyFrame)
        .its('0.contentDocument.body')
        .should(($b) => expect($b.text()).to.contain(body));
    }
  },
};
