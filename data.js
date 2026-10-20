const rand = (n) => Math.random().toString(36).slice(2, 2 + n);

/** Unique, searchable subject so repeated runs never collide in shared mailboxes. */
export const uniqueSubject = (tag) => `AUTO-${tag} ${rand(8)}${Date.now().toString(36).slice(-4)}`;
/** Single alphanumeric token for search tests. */
export const uniqueToken = () => `tok${rand(6)}${Date.now().toString(36).slice(-4)}`;

export const accounts = {
  sender: () => ({
    username: Cypress.env('SENDER_USERNAME'),
    email: Cypress.env('SENDER_EMAIL'),
    password: Cypress.env('SENDER_PASSWORD'),
  }),
  receiver: () => ({
    username: Cypress.env('RECEIVER_USERNAME'),
    email: Cypress.env('RECEIVER_EMAIL'),
    password: Cypress.env('RECEIVER_PASSWORD'),
  }),
};

/** Two-account mode is optional: without receiver credentials, mail is sent to the sender itself. */
export const hasReceiver = () => !!Cypress.env('RECEIVER_EMAIL') && !!Cypress.env('RECEIVER_PASSWORD');
export const recipientEmail = () => (hasReceiver() ? accounts.receiver().email : accounts.sender().email);
/** Mocha helper: run only when a second account is configured. */
export const itTwoAccounts = () => (hasReceiver() ? it : it.skip);
