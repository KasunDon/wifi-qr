describe('Home page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the generator with expected heading and form fields', () => {
    cy.contains('h1', 'WiFi QR Code Generator').should('be.visible');
    cy.get('#ssid').should('be.visible');
    cy.get('#security').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('#hidden').should('not.be.checked');
    cy.get('#consent').should('not.be.checked');
    cy.get('#generate-btn').should('contain.text', 'Generate QR Code');
    cy.get('#result').should('have.class', 'hidden');
    cy.get('#error').should('have.class', 'hidden');
  });

  it('links to Terms & Conditions and Privacy Policy', () => {
    cy.get('footer').contains('a', 'Terms & Conditions').should('have.attr', 'href', '/terms.html');
    cy.get('footer').contains('a', 'Privacy Policy').should('have.attr', 'href', '/privacy.html');
  });

  it('navigates to the terms page and back', () => {
    cy.contains('a', 'Terms & Conditions').click();
    cy.url().should('include', '/terms.html');
    cy.contains('h1', 'Terms & Conditions').should('be.visible');
    cy.contains('a', '← Back to generator').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });
});
