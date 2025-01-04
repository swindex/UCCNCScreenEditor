// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// cypress/support/commands.js
Cypress.Commands.add('waitForService', (url, timeout = 10000) => {
    cy.log(`Waiting for service at ${url}`);
    cy.request({
        url,
        failOnStatusCode: false,
        timeout,
    }).then((response) => {
        if (response.status !== 200) {
        cy.wait(1000); // Wait 1 second before retrying
        cy.waitForService(url, timeout - 1000); // Recursive retry
        }
    });
});
  