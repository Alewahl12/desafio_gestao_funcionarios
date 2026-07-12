describe('Cargos', () => {
  // Sufixo único por execução, para não colidir com "código duplicado"
  // ao rodar a suíte várias vezes contra o mesmo banco.
  const sufixo = Date.now();
  const descricao = `Cargo Cypress ${sufixo}`;
  const codigo = `CY${sufixo}`;

  beforeEach(() => {
    cy.login();
    cy.visit('/cargos');
  });

  it('cadastra um novo cargo', () => {
    cy.contains('button', 'Novo Cargo').click();
    cy.contains('h1', 'Cadastro de Cargo').should('be.visible');

    cy.get('input[placeholder="Insira o nome do cargo"]').type(descricao);
    cy.get('input[placeholder="0000000000"]').type(codigo);

    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('sucesso');
    });

    cy.contains('button', 'Confirmar').click();

    cy.url().should('include', '/cargos');
    cy.get('input[placeholder="Procure pelo nome do cargo"]').type(descricao);
    cy.contains('td', descricao).should('be.visible');
  });

  it('pesquisa o cargo pela descrição', () => {
    cy.get('input[placeholder="Procure pelo nome do cargo"]').type(descricao);

    cy.contains('td', descricao).should('be.visible');
    cy.get('table tbody tr').should('have.length', 1);
  });

  it('pesquisa o cargo pelo código', () => {
    cy.get('input[placeholder="Procure pelo código do cargo"]').type(codigo);

    cy.contains('td', codigo).should('be.visible');
  });

  it('edita o cargo cadastrado', () => {
    const novaDescricao = `${descricao} Editado`;

    cy.get('input[placeholder="Procure pelo nome do cargo"]').type(descricao);
    cy.get('table tbody tr').first().find('button').click();

    cy.contains('h1', 'Editar Cargo').should('be.visible');

    cy.get('input[placeholder="Insira o nome do cargo"]')
      .clear()
      .type(novaDescricao);

    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('sucesso');
    });

    cy.contains('button', 'Confirmar').click();

    cy.url().should('include', '/cargos');
    cy.get('input[placeholder="Procure pelo nome do cargo"]').type(novaDescricao);
    cy.contains('td', novaDescricao).should('be.visible');
  });

  it('gera o relatório em PDF sem erros', () => {
    cy.contains('button', 'Baixar Relatório').click();

    cy.readFile('cypress/downloads/relatorio_cargos.pdf', { timeout: 10000 })
      .should('exist');
  });
});