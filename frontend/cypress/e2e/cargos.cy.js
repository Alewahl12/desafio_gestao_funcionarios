describe('Cargos', () => {
  const sufixo = Date.now();
  const descricao = `Cargo Cypress ${sufixo}`;
  const codigo = `CY${sufixo}`;

  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '**/cargos*').as('loadInicial');
    cy.visit('/cargos');
    cy.wait('@loadInicial');
  });

  it('cadastra um novo cargo', () => {
    cy.contains('button', 'Novo Cargo').click();
    cy.contains('h1', 'Cadastro de Cargo').should('be.visible');

    // Usando delay: 0 em todos os campos de texto
    cy.get('input[placeholder="Insira o nome do cargo"]').type(descricao, { delay: 0 });
    cy.get('input[placeholder="0000000000"]').type(codigo, { delay: 0 });

    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('sucesso');
    });

    cy.contains('button', 'Confirmar').click();

    cy.url().should('include', '/cargos');
    
    cy.intercept('GET', '**/cargos*').as('buscarCargo');
    cy.get('input[placeholder="Procure pelo nome do cargo"]').type(descricao, { delay: 0 });
    cy.wait('@buscarCargo');
    
    cy.contains('td', descricao).should('be.visible');
  });

  it('pesquisa o cargo pela descrição', () => {
    cy.intercept('GET', '**/cargos*').as('buscarCargo');
    cy.get('input[placeholder="Procure pelo nome do cargo"]').type(descricao, { delay: 0 });
    cy.wait('@buscarCargo');

    cy.contains('td', descricao).should('be.visible');
    cy.get('table tbody tr').should('have.length', 1);
  });

  it('pesquisa o cargo pelo código', () => {
    cy.intercept('GET', '**/cargos*').as('buscarCargo');
    cy.get('input[placeholder="Procure pelo código do cargo"]').type(codigo, { delay: 0 });
    cy.wait('@buscarCargo');

    cy.contains('td', codigo).should('be.visible');
  });

  it('edita o cargo cadastrado', () => {
    const novaDescricao = `${descricao} Editado`;

    cy.intercept('GET', '**/cargos*').as('buscarCargo');
    cy.get('input[placeholder="Procure pelo nome do cargo"]').type(descricao, { delay: 0 });
    cy.wait('@buscarCargo');
    
    // Trava para impedir do Cypress clicar enquanto o Debounce está acontecendo
    cy.contains('td', descricao).should('be.visible');
    cy.get('table tbody tr').first().find('button').click();
    
    cy.contains('h1', 'Editar Cargo').should('be.visible');

    cy.get('input[placeholder="Insira o nome do cargo"]')
      .clear()
      .type(novaDescricao, { delay: 0 });

    cy.contains('button', 'Confirmar').click();
    cy.url().should('include', '/cargos');
    
    cy.intercept('GET', '**/cargos*').as('buscarCargoEditado');
    cy.get('input[placeholder="Procure pelo nome do cargo"]').type(novaDescricao, { delay: 0 });
    cy.wait('@buscarCargoEditado');
    
    cy.contains('td', novaDescricao).should('be.visible');
  });

  it('testa a paginação na listagem de cargos', () => {
    for (let i = 1; i <= 11; i++) {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/cargos`,
        body: { codigo: `PG-C-${sufixo}-${i}`, descricao: `Cargo Paginacao ${i}` },
        failOnStatusCode: false
      });
    }

    cy.intercept('GET', '**/cargos*').as('carregarPagina');
    cy.visit('/cargos');
    cy.wait('@carregarPagina');

    cy.contains(/Página 1 de \d+/).should('be.visible');

    cy.contains('button', 'Próxima').should('not.be.disabled').click();
    cy.wait('@carregarPagina');
    cy.contains(/Página 2 de \d+/).should('be.visible');

    cy.contains('button', 'Anterior').should('not.be.disabled').click();
    cy.wait('@carregarPagina');
    cy.contains(/Página 1 de \d+/).should('be.visible');
  });

  it('gera o relatório de cargos em PDF', () => {
    cy.intercept('GET', '**/cargos?*size=10000*').as('gerarRelatorio');
    cy.contains('button', 'Baixar Relatório').click();
    cy.wait('@gerarRelatorio').its('response.statusCode').should('eq', 200);
  });
});