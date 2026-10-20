import S from '../support/selectors';
import { compose } from '../support/pages/compose';
import { mailbox } from '../support/pages/mailbox';
import { hasReceiver, recipientEmail, uniqueSubject } from '../support/data';

describe('Attachments', () => {
  beforeEach(() => {
    cy.task('clearDownloads');
    cy.loginAs('sender');
  });

  it('[ATT-01] attachment is sent, listed by name and downloads byte-identical', () => {
    const subject = uniqueSubject('ATT-01');
    mailbox.goto('inbox');
    compose.open();
    compose.fill({ to: [recipientEmail()], subject, body: 'see attachment' });
    compose.attach('cypress/fixtures/sample-report.txt', 'sample-report.txt');
    compose.send();

    if (hasReceiver()) cy.loginAs('receiver');
    mailbox.waitForMessage('inbox', subject);
    mailbox.open(subject);
    cy.contains(S.message.attachment, 'sample-report.txt').should('be.visible');
    cy.contains(S.message.attachment, 'sample-report.txt').find(S.message.attachmentDownload).click({ force: true });

    const downloaded = `${Cypress.config('downloadsFolder')}/sample-report.txt`;
    cy.readFile('cypress/fixtures/sample-report.txt').then((original) => {
      cy.readFile(downloaded, { timeout: 20000 }).should('eq', original);
    });
  });
});
