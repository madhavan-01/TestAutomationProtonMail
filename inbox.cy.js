import { mailbox } from '../support/pages/mailbox';
import { seedInboxMessage } from '../support/pages/seed';
import { uniqueSubject } from '../support/data';

describe('Inbox & message actions', () => {
  let subject;
  beforeEach(() => {
    subject = uniqueSubject('INBOX');
    cy.loginAs('sender');
    seedInboxMessage(subject);
  });

  it('[INBOX-01] mark unread then opening marks it read', () => {
    mailbox.goto('inbox');
    mailbox.markUnread(subject);
    mailbox.expectUnread(subject);
    mailbox.open(subject);
    mailbox.goto('inbox');
    mailbox.expectRead(subject);
  });

  it('[INBOX-02] star adds to Starred; unstar removes it', () => {
    mailbox.goto('inbox');
    mailbox.star(subject);
    mailbox.waitForMessage('starred', subject);
    mailbox.star(subject);
    mailbox.expectAbsent('starred', subject);
  });

  it('[INBOX-03] trash then restore moves the message between folders', { tags: '@smoke' }, () => {
    mailbox.goto('inbox');
    mailbox.trash(subject);
    mailbox.waitForMessage('trash', subject);
    mailbox.expectAbsent('inbox', subject);
    mailbox.goto('trash');
    mailbox.restoreToInbox(subject);
    mailbox.waitForMessage('inbox', subject);
    mailbox.expectAbsent('trash', subject);
  });
});
