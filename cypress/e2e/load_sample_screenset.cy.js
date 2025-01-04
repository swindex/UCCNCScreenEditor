describe('template spec', () => {
  before('loads page', () => {
    //cy.waitForService('http://localhost:3333/healthcheck');
    cy.waitForService('http://localhost:9999');
  })

  it('Load Default Screenset',()=>{
    cy.visit('http://localhost:9999') // change URL to match your dev URL

    cy.get('[data-cy="onLoadSampleScreensetClicked1"]').click()
    cy.get('.title').should('include.text', 'Warning')
    cy.get('#dialogButtonOk').click()

    // Expand Mains Screen / Control Elements
    cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .children > .tabs > :nth-child(1) > :nth-child(1) > .tab-node > [data-cy="onExpandToggle"] > .fas').click();
    // Click the Tab Layer 2
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > .tab-node > [data-cy="onTabControlSelected"]').click();

    // RUN Not selected
    //cy.get("#mainarea > div > div.UC-control.AS3.TabLayer").eq(0).should().not('have.class','selected');

    cy.get('.box > :nth-child(2) > .fieldrow > input').should('have.value','TabLayer')

    // RUN Now selected
    cy.get("#mainarea > div > div.UC-control.AS3.TabLayer").eq(0).should('have.class','selected');

    // Move to X=55, Y= 25
    cy.get(':nth-child(6) > :nth-child(1) > .fieldrow > input').clear()
    cy.get(':nth-child(6) > :nth-child(1) > .fieldrow > input').type('55')
    cy.get(':nth-child(6) > :nth-child(2) > .fieldrow > input').clear()
    cy.get(':nth-child(6) > :nth-child(2) > .fieldrow > input').type('25')

    cy.get(':nth-child(6) > :nth-child(1) > .fieldrow > input').focus()

    cy.get("#mainarea > div > div.UC-control.AS3.TabLayer").eq(0).should('have.class','selected');

    // Check position
    cy.get("#mainarea > div > div.UC-control.AS3.TabLayer").eq(0).should('have.css','left','55px')
    cy.get("#mainarea > div > div.UC-control.AS3.TabLayer").eq(0).should('have.css','top','25px')

    // Undo 2 actions
    cy.get('[data-cy="onUndoClicked"] > .fas').click()
    cy.get('[data-cy="onUndoClicked"] > .fas').click()
    
    // Check position
    cy.get("#mainarea > div > div.UC-control.AS3.TabLayer").eq(0).should('have.css','left','49px')
    cy.get("#mainarea > div > div.UC-control.AS3.TabLayer").eq(0).should('have.css','top','7px')


  })

  
})