import S from '../support/selectors';
import { compose } from '../support/pages/compose';
import { mailbox } from '../support/pages/mailbox';
import { seedInboxMessage } from '../support/pages/seed';
import { accounts, itTwoAccounts, uniqueSubject, uniqueToken } from '../support/data';

describe('Search', () => {
  beforeEach(() => cy.loginAs('sender'));

  it('[SEARCH-01] keyword finds the message; unknown keyword shows empty state', () => {
    const subject = uniqueSubject('SEARCH-01');
    seedInboxMessage(subject);
    mailbox.goto('inbox');
    mailbox.search(subject);
    mailbox.row(subject).should('be.visible');
    mailbox.search(uniqueToken()); // guaranteed no match
    cy.get(S.list.row).should('not.exist');
  });

  itTwoAccounts()('[SEARCH-02] keyword + sender narrows results (needs 2nd account)', () => {
    const token = uniqueToken();
    const fromReceiver = `${uniqueSubject('SEARCH-02-A')} ${token}`;
    const fromSelf = `${uniqueSubject('SEARCH-02-B')} ${token}`;

    cy.loginAs('receiver');
    mailbox.goto('inbox');
    compose.open();
    compose.fill({ to: [accounts.sender().email], subject: fromReceiver, body: 'a' });
    compose.send();

    cy.loginAs('sender');
    seedInboxMessage(fromSelf);
    mailbox.waitForMessage('inbox', fromReceiver);

    mailbox.advancedSearch({ keyword: token, from: accounts.receiver().email });
    mailbox.row(fromReceiver).should('be.visible');
    cy.contains(S.list.row, fromSelf).should('not.exist');
  });
});
