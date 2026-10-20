import S from '../support/selectors';
import { accounts } from '../support/data';

// Real logins are limited to these three tests (others reuse cached sessions via cy.loginAs).
const submitCredentials = (username, password) => {
  cy.visit('/u/0/inbox');
  cy.origin('https://account.proton.me', { args: { username, password } }, ({ username, password }) => {
    cy.get('#username', { timeout: 30000 }).type(username);
    cy.get('#password').type(password, { log: false });
    cy.get('button[type="submit"]').click();
  });
};

describe('Authentication & session', () => {
  it('[AUTH-01] valid credentials reach the inbox', { tags: '@smoke' }, () => {
    const { username, password } = accounts.sender();
    submitCredentials(username, password);
    cy.get(S.sidebar.compose, { timeout: 60000 }).should('be.visible');
    cy.location('hostname').should('eq', 'mail.proton.me');
  });

  it('[AUTH-02] wrong password shows an error and does not create a session', () => {
    const { username, password } = accounts.sender();
    cy.visit('/u/0/inbox');
    cy.origin('https://account.proton.me', { args: { username, password } }, ({ username, password }) => {
      cy.get('#username', { timeout: 30000 }).type(username);
      cy.get('#password').type(`${password}-wrong`, { log: false });
      cy.get('button[type="submit"]').click();
      cy.contains(/incorrect login credentials|wrong password|invalid/i).should('be.visible');
      cy.get('#username').should('be.visible'); // still on the login form
    });
  });

  it('[AUTH-03] after logout, Back does not expose the mailbox', () => {
    cy.loginAs('sender');
    cy.visit('/u/0/inbox');
    cy.get(S.userMenu.button, { timeout: 60000 }).click();
    cy.get(S.userMenu.signOut).click();
    cy.origin('https://account.proton.me', () => {
      cy.get('#username', { timeout: 30000 }).should('be.visible');
    });
    cy.go('back');
    cy.origin('https://account.proton.me', () => {
      cy.get('#username', { timeout: 30000 }).should('be.visible'); // login, not mailbox
    });
  });
});
