const USUARIO_TESTE = {
  login: 'cypress.teste',
  senha: 'senha123456',
};

/**
 * Garante uma sessão autenticada antes de cada teste, sem precisar passar
 * pela UI de login toda vez (isso é testado à parte, em auth.cy.js).
 * Usa cy.session para reaproveitar a sessão entre testes do mesmo arquivo,
 * o que deixa a suíte inteira bem mais rápida.
 */
Cypress.Commands.add('login', () => {
  cy.session('sessao-cypress', () => {
    // Cria o usuário se ainda não existir (ignora 400 de "já cadastrado")
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/registrar`,
      body: USUARIO_TESTE,
      failOnStatusCode: false,
    });

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      body: USUARIO_TESTE,
    }).then((resposta) => {
      cy.visit('/login');
      cy.window().then((win) => {
        win.localStorage.setItem('gf_autenticado', 'true');
        win.localStorage.setItem('gf_usuario', resposta.body.login);
      });
    });
  });
});