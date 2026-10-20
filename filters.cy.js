import { compose } from '../support/pages/compose';
import { mailbox } from '../support/pages/mailbox';
import { seedInboxMessage } from '../support/pages/seed';
import { settings } from '../support/pages/settings';
import { addCleanup } from '../support/cleanup';
import { accounts, uniqueSubject, uniqueToken } from '../support/data';

describe('Filters', () => {
  beforeEach(() => cy.loginAs('sender'));

  it('[FILTER-01] subject filter archives matching mail and ignores non-matching', () => {
    const name = uniqueSubject('FILTER');
    const token = uniqueToken();
    settings.createSubjectArchiveFilter(name, token);
    addCleanup(() => settings.deleteFilter(name));

    const matching = `${uniqueSubject('FILTER-match')} ${token}`;
    const nonMatching = uniqueSubject('FILTER-nomatch');

    seedInboxMessage(nonMatching); // control: must stay in Inbox
    mailbox.goto('inbox');
    compose.open();
    compose.fill({ to: [accounts.sender().email], subject: matching, body: 'should be archived' });
    compose.send();

    mailbox.waitForMessage('archive', matching);
    mailbox.expectAbsent('inbox', matching);
    mailbox.waitForMessage('inbox', nonMatching);
  });
});
