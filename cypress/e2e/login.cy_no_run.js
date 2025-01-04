describe('template spec', () => {
  before('loads page', () => {
    //cy.waitForService('http://localhost:3333/healthcheck');
    cy.waitForService('http://localhost:9999');
  })

  it('Login',()=>{
    cy.visit('http://localhost:9999') // change URL to match your dev URL

    cy.get('[data-cy="onSignInRegisterClicked"]').click()
    cy.get('.title').should('have.text','Sign In');

    cy.get('.text > .fieldrow > input').type("john.doe@testemail.com");
    cy.get('.password > .fieldrow > input').type("password123");

    cy.get('.popup button').eq(1).click();

    cy.get('.mb-3 > :nth-child(1)').should('include.text','Welcome John');

    cy.get('[data-cy="onLoadScreensetClicked"]').click();
 
    cy.get('.popup .title').should('include.text', 'Please Read!')

  })
})