import S from './selectors';
import { accounts } from './data';

/**
 * cy.loginAs('sender' | 'receiver')
 * Real login is done once per role and cached with cy.session (also across specs), so only the
 * auth spec pays the login cost and Proton's rate limiting/human verification is rarely triggered.
 * Login lives on account.proton.me (another origin) -> cy.origin().
 */
Cypress.Commands.add('loginAs', (role = 'sender') => {
  const { username, password } = accounts[role]();
  if (!username || !password) throw new Error(`Missing ${role.toUpperCase()}_USERNAME/PASSWORD in cypress.env.json`);
  cy.session(
    [role, username],
    () => {
      cy.visit('/u/0/inbox');
      cy.origin('https://account.proton.me', { args: { username, password } }, ({ username, password }) => {
        cy.get('#username', { timeout: 30000 }).type(username);
        cy.get('#password').type(password, { log: false });
        cy.get('body').then(($b) => {
          const box = $b.find('input[type="checkbox"]'); // "Keep me signed in"
          if (box.length) cy.wrap(box.first()).check({ force: true });
        });
        cy.get('button[type="submit"]').click();
      });
      cy.get(S.sidebar.compose, { timeout: 60000 }).should('be.visible');
    },
    {
      validate() {
        cy.visit('/u/0/inbox');
        cy.get(S.sidebar.compose, { timeout: 60000 }).should('be.visible');
      },
      cacheAcrossSpecs: true,
    },
  );
});

/** Resolve a toolbar control by data-testid, falling back to the accessible button name. */
Cypress.Commands.add('ctl', (c) =>
  cy.get('body').then(($b) => ($b.find(c.css).length ? cy.get(c.css).first() : cy.contains('button', c.name).first())),
);

/** Body of an iframe (Proton renders the composer and message bodies in iframes). */
Cypress.Commands.add('iframeBody', (selector) =>
  cy.get(selector).its('0.contentDocument.body').should('not.be.empty').then(cy.wrap),
);
