const SETTINGS = 'https://account.proton.me/u/0/mail';
// Settings live on account.proton.me (cross-origin) -> every settings action runs inside cy.origin.

const inSettings = (section, args, fn) => {
  cy.origin('https://account.proton.me', { args: { section, ...args } }, fn);
};

export const settings = {
  createFolder(name) {
    cy.visit(`${SETTINGS}/folders-labels`);
    inSettings('folders-labels', { name }, ({ name }) => {
      cy.contains('button', /add folder/i).click();
      cy.get('[role="dialog"]').find('input[type="text"], input:not([type])').first().type(name);
      cy.get('[role="dialog"]').contains('button', /^save$/i).click();
      cy.contains(name).should('be.visible');
    });
  },

  deleteFolder(name) {
    cy.visit(`${SETTINGS}/folders-labels`);
    inSettings('folders-labels', { name }, ({ name }) => {
      cy.contains('tr', name).contains('button', /actions|more|options/i).click();
      cy.contains(/^delete$/i).click();
      cy.get('[role="dialog"]').contains('button', /delete/i).click();
      cy.contains('tr', name).should('not.exist');
    });
  },

  /** Filter: subject contains <keyword> -> archive. Wizard: name, condition, action, save. */
  createSubjectArchiveFilter(name, keyword) {
    cy.visit(`${SETTINGS}/filters`);
    inSettings('filters', { name, keyword }, ({ name, keyword }) => {
      cy.contains('button', /add filter/i).click();
      const dialog = () => cy.get('[role="dialog"]');
      dialog().find('input').first().type(name);
      dialog().contains('button', /next/i).click();
      dialog().contains('button', /add condition/i).click();
      dialog().contains(/the subject/i).click();
      dialog().find('input').last().type(keyword);
      dialog().contains('button', /next/i).click();
      dialog().contains(/archive/i).click();
      dialog().contains('button', /next|save/i).last().click();
      cy.contains('tr', name).should('be.visible');
    });
  },

  deleteFilter(name) {
    cy.visit(`${SETTINGS}/filters`);
    inSettings('filters', { name }, ({ name }) => {
      cy.contains('tr', name).contains('button', /actions|more|options/i).click();
      cy.contains(/^delete$/i).click();
      cy.get('[role="dialog"]').contains('button', /delete/i).click();
      cy.contains('tr', name).should('not.exist');
    });
  },
};
