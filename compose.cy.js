import S from '../support/selectors';
import { compose } from '../support/pages/compose';
import { mailbox } from '../support/pages/mailbox';
import { accounts, hasReceiver, itTwoAccounts, recipientEmail, uniqueSubject } from '../support/data';
import invalid from '../fixtures/invalid-recipients.json';

describe('Compose & send', () => {
  beforeEach(() => cy.loginAs('sender'));

  it('[COMP-01] message is delivered with correct subject, body and sender', { tags: '@smoke' }, () => {
    const subject = uniqueSubject('COMP-01');
    const body = `Hello from automation ${subject}`;
    mailbox.goto('inbox');
    compose.open();
    compose.fill({ to: [recipientEmail()], subject, body });
    compose.send();
    mailbox.waitForMessage('sent', subject);

    if (hasReceiver()) cy.loginAs('receiver'); // real two-account flow when configured
    mailbox.waitForMessage('inbox', subject);
    mailbox.open(subject);
    mailbox.messageBody().should(($b) => expect($b.text()).to.contain(body));
    mailbox.messageHeader().should('contain.text', accounts.sender().email);
  });

  it('[COMP-02] sending without a recipient is blocked', () => {
    const subject = uniqueSubject('COMP-02');
    mailbox.goto('inbox');
    compose.open();
    compose.fill({ subject, body: 'no recipient' });
    compose.clickSend();
    compose.root().should('be.visible'); // composer stays open
    cy.get(S.toast).contains(/message sent/i).should('not.exist');
    compose.close();
    mailbox.expectAbsent('sent', subject);
  });

  invalid.values.forEach((value) => {
    it(`[COMP-03] invalid recipient "${value}" is rejected`, () => {
      const subject = uniqueSubject('COMP-03');
      mailbox.goto('inbox');
      compose.open();
      compose.fill({ to: [value], subject, body: 'invalid recipient' });
      compose.clickSend();
      compose.root().should('be.visible');
      cy.get(S.toast).contains(/message sent/i).should('not.exist');
      compose.close();
      mailbox.expectAbsent('sent', subject);
    });
  });

  itTwoAccounts()('[COMP-04] To + CC both receive the message (needs 2nd account)', () => {
    const subject = uniqueSubject('COMP-04');
    mailbox.goto('inbox');
    compose.open();
    compose.fill({ to: [accounts.sender().email], cc: [accounts.receiver().email], subject, body: 'cc check' });
    compose.send();
    mailbox.waitForMessage('inbox', subject); // To
    cy.loginAs('receiver');
    mailbox.waitForMessage('inbox', subject); // CC
  });
});
