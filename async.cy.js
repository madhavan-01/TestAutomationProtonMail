import S from '../support/selectors';
import { compose } from '../support/pages/compose';
import { mailbox } from '../support/pages/mailbox';
import { recipientEmail, uniqueSubject } from '../support/data';

describe('Asynchronous workflows', () => {
  beforeEach(() => cy.loginAs('sender'));

  /**
   * Undo send. ASSUMES Undo Send is enabled (default). Synchronises on the toast / Undo button
   * appearing and disappearing - no fixed sleeps.
   */
  it('[ASYNC-01] undo send restores the draft; a second send is delivered', { tags: '@smoke' }, () => {
    const subject = uniqueSubject('ASYNC-01');
    const body = `undo send ${subject}`;

    mailbox.goto('inbox');
    compose.open();
    compose.fill({ to: [recipientEmail()], subject, body });
    compose.clickSend();

    // Transient state: undo window is open
    compose.undoButton().should('be.visible').click();

    // Composer returns with content intact; nothing was sent
    compose.expectValues({ to: [recipientEmail()], subject, body });
    compose.close();
    mailbox.expectAbsent('sent', subject);

    // Final state: send for real, wait for the undo window to lapse, verify delivery
    mailbox.openDraft(subject);
    compose.clickSend();
    compose.undoButton().should('be.visible');
    cy.get(S.toast).contains('button', /undo/i, { timeout: 30000 }).should('not.exist');
    mailbox.waitForMessage('sent', subject);
    mailbox.waitForMessage('inbox', subject);
  });
});
