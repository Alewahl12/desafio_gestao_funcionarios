describe('Departamentos', () => {
  const sufixo = Date.now();
  const descricao = `Departamento Cypress ${sufixo}`;
  const codigo = `CY${sufixo}`;

  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '**/departamentos*').as('loadInicial');
    cy.visit('/departamentos');
    cy.wait('@loadInicial');
  });

  it('cadastra um novo departamento', () => {
    cy.contains('button', 'Novo Departamento').click();
    cy.contains('h1', 'Cadastro de Departamento').should('be.visible');

    cy.get('input[placeholder="Insira o nome do departamento"]').type(descricao, { delay: 0 });
    cy.get('input[placeholder="0000000000"]').type(codigo, { delay: 0 });

    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('sucesso');
    });

    cy.contains('button', 'Confirmar').click();
    cy.url().should('include', '/departamentos');

    cy.intercept('GET', '**/departamentos*').as('buscarDep');
    cy.get('input[placeholder="Procure pelo nome do departamento"]').type(descricao, { delay: 0 });
    cy.wait('@buscarDep');

    cy.contains('td', descricao).should('be.visible');
  });

  it('pesquisa o departamento pela descrição', () => {
    cy.intercept('GET', '**/departamentos*').as('buscarDep');
    cy.get('input[placeholder="Procure pelo nome do departamento"]').type(descricao, { delay: 0 });
    cy.wait('@buscarDep');

    cy.contains('td', descricao).should('be.visible');
    cy.get('table tbody tr').should('have.length', 1);
  });

  it('pesquisa o departamento pelo código', () => {
    cy.intercept('GET', '**/departamentos*').as('buscarDep');
    cy.get('input[placeholder="Procure pelo código do departamento"]').type(codigo, { delay: 0 });
    cy.wait('@buscarDep');

    cy.contains('td', codigo).should('be.visible');
  });

  it('edita o departamento cadastrado', () => {
    const novaDescricao = `${descricao} Editado`;

    cy.intercept('GET', '**/departamentos*').as('buscarDep');
    cy.get('input[placeholder="Procure pelo nome do departamento"]').type(descricao, { delay: 0 });
    cy.wait('@buscarDep');

    // Espera obrigatória antes de realizar o click
    cy.contains('td', descricao).should('be.visible');
    cy.get('table tbody tr').first().find('button').click();
    
    cy.contains('h1', 'Editar Departamento').should('be.visible');

    cy.get('input[placeholder="Insira o nome do departamento"]')
      .clear()
      .type(novaDescricao, { delay: 0 });

    cy.contains('button', 'Confirmar').click();
    cy.url().should('include', '/departamentos');

    cy.intercept('GET', '**/departamentos*').as('buscarDepEditado');
    cy.get('input[placeholder="Procure pelo nome do departamento"]').type(novaDescricao, { delay: 0 });
    cy.wait('@buscarDepEditado');

    cy.contains('td', novaDescricao).should('be.visible');
  });

  it('testa a paginação na listagem de departamentos', () => {
    for (let i = 1; i <= 11; i++) {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/departamentos`,
        body: { codigo: `PG-D-${sufixo}-${i}`, descricao: `Departamento Paginacao ${i}` },
        failOnStatusCode: false
      });
    }

    cy.intercept('GET', '**/departamentos*').as('carregarPagina');
    cy.visit('/departamentos');
    cy.wait('@carregarPagina');

    cy.contains(/Página 1 de \d+/).should('be.visible');

    cy.contains('button', 'Próxima').should('not.be.disabled').click();
    cy.wait('@carregarPagina');
    cy.contains(/Página 2 de \d+/).should('be.visible');

    cy.contains('button', 'Anterior').should('not.be.disabled').click();
    cy.wait('@carregarPagina');
    cy.contains(/Página 1 de \d+/).should('be.visible');
  });

  it('gera o relatório de departamentos em PDF', () => {
    cy.intercept('GET', '**/departamentos?*size=10000*').as('gerarRelatorio');
    cy.contains('button', 'Baixar Relatório').click();
    cy.wait('@gerarRelatorio').its('response.statusCode').should('eq', 200);
  });
});