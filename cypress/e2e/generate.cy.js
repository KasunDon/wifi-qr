describe('QR code generation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('generates a QR code for a WPA network', () => {
    cy.get('#ssid').type('MyHomeNetwork');
    cy.get('#password').type('supersecret1');
    cy.get('#consent').check();
    cy.get('#generate-btn').click();

    cy.get('#result').should('not.have.class', 'hidden');
    cy.get('#qr-image').should('have.attr', 'src').and('match', /^data:image\/png;base64,/);
    cy.get('#download-link').should('have.attr', 'href').and('match', /^data:image\/png;base64,/);
    cy.get('#error').should('have.class', 'hidden');
  });

  it('generates a QR code for an open network without requiring a password', () => {
    cy.get('#ssid').type('Free Public WiFi');
    cy.get('#security').select('None (open network)');
    cy.get('#password').should('be.disabled');
    cy.get('#consent').check();
    cy.get('#generate-btn').click();

    cy.get('#result').should('not.have.class', 'hidden');
    cy.get('#qr-image').should('have.attr', 'src').and('match', /^data:image\/png;base64,/);
  });

  it('generates a QR code for a hidden network', () => {
    cy.get('#ssid').type('SecretNetwork');
    cy.get('#password').type('hiddenpass123');
    cy.get('#hidden').check();
    cy.get('#consent').check();
    cy.get('#generate-btn').click();

    cy.get('#result').should('not.have.class', 'hidden');
  });

  it('toggles password visibility', () => {
    cy.get('#password').type('mypassword');
    cy.get('#password').should('have.attr', 'type', 'password');
    cy.get('#toggle-password').click().should('have.text', 'Hide password');
    cy.get('#password').should('have.attr', 'type', 'text');
    cy.get('#toggle-password').click().should('have.text', 'Show password');
    cy.get('#password').should('have.attr', 'type', 'password');
  });

  it('allows downloading the generated QR code image', () => {
    cy.get('#ssid').type('DownloadTest');
    cy.get('#password').type('downloadpass1');
    cy.get('#consent').check();
    cy.get('#generate-btn').click();

    cy.get('#download-link').should('have.attr', 'download', 'wifi-qr.png');
  });
});
