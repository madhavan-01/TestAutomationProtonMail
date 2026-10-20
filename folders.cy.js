import { mailbox } from '../support/pages/mailbox';
import { seedInboxMessage } from '../support/pages/seed';
import { settings } from '../support/pages/settings';
import { addCleanup } from '../support/cleanup';
import { uniqueSubject, uniqueToken } from '../support/data';

describe('Folders', () => {
  it('[FOLD-01] message moved to a custom folder leaves the inbox and appears in the folder', () => {
    const subject = uniqueSubject('FOLD-01');
    const folder = `auto${uniqueToken().slice(0, 8)}`;
    cy.loginAs('sender');
    seedInboxMessage(subject);

    settings.createFolder(folder);
    addCleanup(() => settings.deleteFolder(folder));

    mailbox.goto('inbox');
    mailbox.moveToFolder(subject, folder);
    mailbox.expectAbsent('inbox', subject);
    mailbox.goto('inbox');
    mailbox.openCustomFolder(folder);
    mailbox.row(subject).should('be.visible');
  });
});
