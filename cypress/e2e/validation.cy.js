describe('Form validation and acceptable-use safeguards', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('blocks submission via native validation when SSID is empty', () => {
    cy.intercept('POST', '/api/generate').as('generate');
    cy.get('#password').type('somepassword');
    cy.get('#consent').check();
    cy.get('#generate-btn').click();

    cy.get('#ssid').then(($el) => {
      expect($el[0].validationMessage).to.not.equal('');
    });
    cy.get('@generate.all').should('have.length', 0);
    cy.get('#result').should('have.class', 'hidden');
  });

  it('blocks submission via native validation when consent is not checked', () => {
    cy.intercept('POST', '/api/generate').as('generate');
    cy.get('#ssid').type('MyHomeNetwork');
    cy.get('#password').type('supersecret1');
    cy.get('#generate-btn').click();

    cy.get('#consent').then(($el) => {
      expect($el[0].validationMessage).to.not.equal('');
    });
    cy.get('@generate.all').should('have.length', 0);
    cy.get('#result').should('have.class', 'hidden');
  });

  it('shows a server-side error when a WPA network has no password', () => {
    cy.get('#ssid').type('NeedsPassword');
    cy.get('#consent').check();
    cy.get('#generate-btn').click();

    cy.get('#error').should('not.have.class', 'hidden').and('contain.text', 'Password is required');
    cy.get('#result').should('have.class', 'hidden');
  });

  it('rejects an SSID containing a phishing-style link', () => {
    cy.get('#ssid').type('Free WiFi http://evil.example.com');
    cy.get('#password').type('supersecret1');
    cy.get('#consent').check();
    cy.get('#generate-btn').click();

    cy.get('#error')
      .should('not.have.class', 'hidden')
      .and('contain.text', 'disallowed content');
    cy.get('#result').should('have.class', 'hidden');
  });

  it('rejects a password containing script-like content', () => {
    cy.get('#ssid').type('MyHomeNetwork');
    cy.get('#password').type('<script>alert(1)</script>');
    cy.get('#consent').check();
    cy.get('#generate-btn').click();

    cy.get('#error')
      .should('not.have.class', 'hidden')
      .and('contain.text', 'disallowed content');
    cy.get('#result').should('have.class', 'hidden');
  });

  it('rejects requests when consent is not sent to the server', () => {
    cy.request({
      method: 'POST',
      url: '/api/generate',
      failOnStatusCode: false,
      body: { ssid: 'MyHomeNetwork', password: 'supersecret1', security: 'WPA', hidden: false },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.contain('authorized to share this network');
    });
  });

  it('rejects an SSID longer than 32 characters at the API level', () => {
    cy.request({
      method: 'POST',
      url: '/api/generate',
      failOnStatusCode: false,
      body: {
        ssid: 'A'.repeat(33),
        password: 'supersecret1',
        security: 'WPA',
        hidden: false,
        consent: true,
      },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.contain('32 characters');
    });
  });
});
