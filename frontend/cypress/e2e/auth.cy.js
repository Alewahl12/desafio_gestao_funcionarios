describe('Autenticação', () => {
  const sufixo = Date.now();
  const usuario = { login: `cypress.novo.${sufixo}`, senha: 'senha123456' };

  it('bloqueia o acesso ao sistema sem estar logado', () => {
    cy.visit('/departamentos');
    cy.url().should('include', '/login');
  });

  it('cria uma nova conta pela tela de cadastro', () => {
    cy.visit('/login');
    cy.contains('button', 'Criar conta').click();
    cy.contains('h1', 'Criar Conta').should('be.visible');

    cy.get('input[placeholder="Insira seu login"]').type(usuario.login);
    cy.get('input[placeholder="Insira sua senha"]').type(usuario.senha);
    cy.get('input[placeholder="Repita sua senha"]').type(usuario.senha);

    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('sucesso');
    });

    cy.contains('button', 'Confirmar').click();

    // Depois de cadastrar, a tela volta para o modo de login
    cy.contains('h1', 'Entrar').should('be.visible');
  });

  it('mostra erro ao tentar logar com senha errada', () => {
    cy.visit('/login');
    cy.get('input[placeholder="Insira seu login"]').type(usuario.login);
    cy.get('input[placeholder="Insira sua senha"]').type('senhaErrada123');
    cy.contains('button', 'Entrar').click();

    cy.contains('Login ou senha inválidos').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('loga com sucesso e acessa o sistema', () => {
    cy.visit('/login');
    cy.get('input[placeholder="Insira seu login"]').type(usuario.login);
    cy.get('input[placeholder="Insira sua senha"]').type(usuario.senha);
    cy.contains('button', 'Entrar').click();

    cy.url().should('not.include', '/login');
    cy.contains('Funcionários').should('be.visible');
  });

  it('desloga pelo botão Sair e volta para o login', () => {
    cy.login();
    cy.visit('/');

    cy.contains('button', 'Sair').click();

    cy.url().should('include', '/login');

    // Confirma que a rota protegida volta a ficar bloqueada
    cy.visit('/departamentos');
    cy.url().should('include', '/login');
  });
});