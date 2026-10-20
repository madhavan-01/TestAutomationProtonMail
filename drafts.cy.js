import { compose } from '../support/pages/compose';
import { mailbox } from '../support/pages/mailbox';
import { recipientEmail, uniqueSubject } from '../support/data';

describe('Drafts & persistence', () => {
  beforeEach(() => cy.loginAs('sender'));

  it('[DRAFT-01] draft auto-saves and survives reload/reopen', { tags: '@smoke' }, () => {
    const subject = uniqueSubject('DRAFT-01');
    const body = `draft body ${subject}`;
    mailbox.goto('inbox');
    compose.open();
    compose.fill({ to: [recipientEmail()], subject, body });
    compose.close();
    mailbox.waitForMessage('drafts', subject); // state-based, not an indicator
    cy.reload();
    mailbox.settled();
    mailbox.openDraft(subject);
    compose.expectValues({ to: [recipientEmail()], subject, body });
  });

  it('[DRAFT-02] sending a draft moves it from Drafts to Sent', () => {
    const subject = uniqueSubject('DRAFT-02');
    mailbox.goto('inbox');
    compose.open();
    compose.fill({ subject, body: 'draft then send' });
    compose.close();
    mailbox.waitForMessage('drafts', subject);
    mailbox.openDraft(subject);
    compose.fill({ to: [recipientEmail()] });
    compose.send();
    mailbox.waitForMessage('sent', subject);
    mailbox.expectAbsent('drafts', subject);
  });
});
