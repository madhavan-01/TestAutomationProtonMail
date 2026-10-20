import 'cypress-mochawesome-reporter/register';
import registerCypressGrep from '@cypress/grep';
import './commands';
import { runCleanups } from './cleanup';

registerCypressGrep();

// Teardown for settings objects (filters/folders) runs even when the test body failed.
afterEach(() => {
  runCleanups();
});

// Proton's SPA throws benign errors during navigation; do not fail tests on them.
Cypress.on('uncaught:exception', () => false);
