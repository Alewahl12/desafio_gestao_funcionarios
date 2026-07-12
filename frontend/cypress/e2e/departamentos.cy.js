describe('Departamentos', () => {
  // Sufixo único por execução, para não colidir com "código duplicado"
  // ao rodar a suíte várias vezes contra o mesmo banco.
  const sufixo = Date.now();
  const descricao = `Departamento Cypress ${sufixo}`;
  const codigo = `CY${sufixo}`;

  beforeEach(() => {
    cy.login();
    cy.visit('/departamentos');
  });

  it('cadastra um novo departamento', () => {
    cy.contains('button', 'Novo Departamento').click();
    cy.contains('h1', 'Cadastro de Departamento').should('be.visible');

    cy.get('input[placeholder="Insira o nome do departamento"]').type(descricao);
    cy.get('input[placeholder="0000000000"]').type(codigo);

    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('sucesso');
    });

    cy.contains('button', 'Confirmar').click();

    cy.url().should('include', '/departamentos');
    cy.get('input[placeholder="Procure pelo nome do departamento"]').type(descricao);
    cy.contains('td', descricao).should('be.visible');
  });

  it('pesquisa o departamento pela descrição', () => {
    cy.get('input[placeholder="Procure pelo nome do departamento"]').type(descricao);

    cy.contains('td', descricao).should('be.visible');
    cy.get('table tbody tr').should('have.length', 1);
  });

  it('pesquisa o departamento pelo código', () => {
    cy.get('input[placeholder="Procure pelo código do departamento"]').type(codigo);

    cy.contains('td', codigo).should('be.visible');
  });

  it('edita o departamento cadastrado', () => {
    const novaDescricao = `${descricao} Editado`;

    cy.get('input[placeholder="Procure pelo nome do departamento"]').type(descricao);
    cy.get('table tbody tr').first().find('button').click();

    cy.contains('h1', 'Editar Departamento').should('be.visible');

    cy.get('input[placeholder="Insira o nome do departamento"]')
      .clear()
      .type(novaDescricao);

    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('sucesso');
    });

    cy.contains('button', 'Confirmar').click();

    cy.url().should('include', '/departamentos');
    cy.get('input[placeholder="Procure pelo nome do departamento"]').type(novaDescricao);
    cy.contains('td', novaDescricao).should('be.visible');
  });

  it('gera o relatório em PDF sem erros', () => {
    cy.contains('button', 'Baixar Relatório').click();

    cy.readFile('cypress/downloads/relatorio_departamentos.pdf', { timeout: 10000 })
      .should('exist');
  });
});