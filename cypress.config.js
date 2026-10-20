const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://mail.proton.me',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,
    requestTimeout: 30000,
    video: true,
    screenshotOnRunFailure: true,
    downloadsFolder: 'cypress/downloads',
    // One retry in run mode only; retried passes show up as flaky in the report.
    retries: { runMode: 1, openMode: 0 },
    testIsolation: true,
    experimentalOriginDependencies: false,
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'reports',
      reportFilename: 'index',
      charts: true,
      embeddedScreenshots: true,
      inlineAssets: true,
      saveJson: true,
    },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      require('@cypress/grep/src/plugin')(config);
      on('task', {
        clearDownloads() {
          const dir = path.resolve(config.downloadsFolder);
          if (fs.existsSync(dir)) fs.readdirSync(dir).forEach((f) => fs.rmSync(path.join(dir, f), { force: true }));
          return null;
        },
      });
      return config;
    },
  },
});
