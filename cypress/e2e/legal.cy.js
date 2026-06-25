describe('Legal pages', () => {
  it('renders the Terms & Conditions with liability and acceptable-use sections', () => {
    cy.visit('/terms.html');
    cy.contains('h1', 'Terms & Conditions').should('be.visible');
    cy.contains('h2', 'Limitation of Liability').should('be.visible');
    cy.contains('h2', 'Acceptable Use').should('be.visible');
    cy.contains('phishing, social engineering').should('exist');
    cy.contains('a', '← Back to generator').should('have.attr', 'href', '/');
  });

  it('renders the Privacy Policy with the no-storage commitment', () => {
    cy.visit('/privacy.html');
    cy.contains('h1', 'Privacy Policy').should('be.visible');
    cy.contains('Never written to a database, log file, cache, or any persistent storage.').should('exist');
    cy.contains('a', '← Back to generator').should('have.attr', 'href', '/');
  });
});
