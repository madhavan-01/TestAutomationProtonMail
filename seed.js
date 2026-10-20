import { mailbox } from './mailbox';
import { compose } from './compose';
import { accounts } from '../data';

/** Deliver a fresh message to the logged-in account's own inbox. */
export const seedInboxMessage = (subject) => {
  mailbox.goto('inbox');
  compose.open();
  compose.fill({ to: [accounts.sender().email], subject, body: 'seed message' });
  compose.send();
  mailbox.waitForMessage('inbox', subject);
};
