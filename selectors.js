/** All raw selectors live here so a Proton UI change is a one-file fix. */
const S = {
  sidebar: { compose: '[data-testid="sidebar:compose"]' },
  userMenu: {
    button: '[data-testid="heading:userdropdown"]',
    signOut: '[data-testid="userdropdown:button:logout"]',
  },
  list: {
    row: '[data-shortcut-target="item-container"]',
    empty: '[data-testid="empty-view"]',
    checkbox: 'input[type="checkbox"]',
    star: '[data-testid="item-star"]',
    unreadClass: /unread/i,
  },
  toolbar: {
    trash: { css: '[data-testid="toolbar:movetotrash"]', name: /move to trash/i },
    moveToInbox: { css: '[data-testid="toolbar:movetoinbox"]', name: /move to inbox/i },
    moveTo: { css: '[data-testid="toolbar:moveto"]', name: /move to/i },
    more: { css: '[data-testid="toolbar:more"]', name: /^more$/i },
    dropdown: '.dropdown',
  },
  search: {
    open: { css: '[data-testid="search-keyword"]', name: /search/i },
    input: 'input[type="search"], input[placeholder*="earch" i]',
  },
  composer: {
    root: '.composer',
    to: '[data-testid="composer:to"]',
    cc: '[data-testid="composer:cc"]',
    bcc: '[data-testid="composer:bcc"]',
    ccBccToggle: '[data-testid="composer:show-cc-bcc"]',
    subject: '[data-testid="composer:subject"]',
    send: '[data-testid="composer:send-button"]',
    close: '[data-testid="composer:close-button"]',
    bodyFrame: '[data-testid="rooster-iframe"]',
    fileInput: 'input[type="file"]',
  },
  message: {
    view: '[data-testid^="message-view"]',
    bodyFrame: '[data-testid="content-iframe"]',
    header: '[data-testid="message-header-expanded:from"], [data-testid^="message-header"]',
    attachment: '[data-testid="attachment-item"]',
    attachmentDownload: '[data-testid="attachment-item:download"]',
  },
  toast: '.notifications-container',
};

export default S;
