function gerarCpfValido() {
  const nove = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));
  const calcularDigito = (digitos) => {
    let soma = 0;
    let peso = digitos.length + 1;
    digitos.forEach((d) => { soma += d * peso; peso -= 1; });
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = calcularDigito(nove);
  const d2 = calcularDigito([...nove, d1]);
  const str = [...nove, d1, d2].join('');
  return `${str.slice(0, 3)}.${str.slice(3, 6)}.${str.slice(6, 9)}-${str.slice(9, 11)}`;
}

describe('Funcionários', () => {
  before(() => {
    cy.login();
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/cargos`,
      body: { codigo: `C-AUX-${Date.now()}`, descricao: `Cargo Auxiliar` },
      failOnStatusCode: false
    });
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/departamentos`,
      body: { codigo: `D-AUX-${Date.now()}`, descricao: `Dep Auxiliar` },
      failOnStatusCode: false
    });
  });

  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '**/funcionarios*').as('loadInicial');
    cy.intercept('GET', '**/cargos*').as('loadCargos');
    cy.intercept('GET', '**/departamentos*').as('loadDeps');
    cy.visit('/funcionarios');
    cy.wait(['@loadInicial', '@loadCargos', '@loadDeps']);
  });

  it('cadastra um novo funcionário com vínculo', () => {
    const suf = Date.now();
    cy.contains('button', 'Novo Funcionário').click();
    cy.wait(['@loadCargos', '@loadDeps']);

    cy.get('input[placeholder="Insira o nome do funcionário"]').type(`Cadastro ${suf}`, { delay: 0 });
    cy.get('input[placeholder="000.000.000-00"]').type(gerarCpfValido(), { delay: 0 });

    cy.contains('button', 'Novo Vínculo').click();
    cy.get('input[placeholder="Insira o nome da empresa"]').type(`Empresa ${suf}`, { delay: 0 });
    cy.get('input[placeholder="0000000000"]').type(`${suf}`.slice(-6), { delay: 0 });
    cy.get('select').eq(0).select(1);
    cy.get('select').eq(1).select(1);

    cy.get('form').last().contains('button', 'Confirmar').click();
    cy.contains('td', `Empresa ${suf}`).should('be.visible');

    cy.on('window:alert', (texto) => { expect(texto).to.contain('sucesso'); });
    cy.contains('button', 'Confirmar').click();
    cy.url().should('include', '/funcionarios');
  });

  it('pesquisa o funcionário pelo nome', () => {
    const nomeBusca = `Pesquisa ${Date.now()}`;
    cy.request('POST', `${Cypress.env('apiUrl')}/funcionarios`, {
      nome: nomeBusca, cpf: gerarCpfValido(), vinculos: []
    });

    cy.reload();
    cy.intercept('GET', '**/funcionarios*').as('buscarFunc');
    cy.get('input[placeholder="Procure pelo funcionário"]').type(nomeBusca, { delay: 0 });
    cy.wait('@buscarFunc');

    cy.contains('td', nomeBusca).should('be.visible');
  });

  it('visualiza os vínculos do funcionário no modal', () => {
    const nomeVisualizar = `Visualizar ${Date.now()}`;
    cy.request('POST', `${Cypress.env('apiUrl')}/funcionarios`, {
      nome: nomeVisualizar, cpf: gerarCpfValido(), vinculos: []
    });

    cy.reload();
    cy.intercept('GET', '**/funcionarios*').as('buscarFunc');
    cy.get('input[placeholder="Procure pelo funcionário"]').type(nomeVisualizar, { delay: 0 });
    cy.wait('@buscarFunc');

    cy.contains('td', nomeVisualizar).should('be.visible').click();
    
    cy.contains('h2', 'Vínculos de Empresa').should('be.visible');
    cy.contains('button', 'Fechar').click();
  });

  it('edita o funcionário cadastrado', () => {
    const nomeOriginal = `Original ${Date.now()}`;
    const novoNome = `Editado ${Date.now()}`;
    cy.request('POST', `${Cypress.env('apiUrl')}/funcionarios`, {
      nome: nomeOriginal, cpf: gerarCpfValido(), vinculos: []
    });

    cy.reload();
    cy.intercept('GET', '**/funcionarios*').as('buscarFunc');
    cy.get('input[placeholder="Procure pelo funcionário"]').type(nomeOriginal, { delay: 0 });
    cy.wait('@buscarFunc');

    cy.contains('td', nomeOriginal).should('be.visible');
    cy.get('table tbody tr').first().find('button').click();

    cy.get('input[placeholder="Insira o nome do funcionário"]').clear().type(novoNome, { delay: 0 });
    cy.contains('button', 'Salvar').click();

    cy.url().should('include', '/funcionarios');
  });

  it('testa a paginação na listagem de funcionários', () => {
    const suf = Date.now();

    for (let i = 1; i <= 11; i++) {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/funcionarios`,
        body: { nome: `Func Pagina ${suf} ${i}`, cpf: gerarCpfValido(), vinculos: [] }
      });
    }

    cy.visit('/funcionarios');
    cy.wait(1500);

    cy.contains(/Página 1 de \d+/).should('be.visible');
    
    cy.intercept('GET', '**/funcionarios*page=1*').as('pagina2');
    cy.contains('button', 'Próxima').should('not.be.disabled').click({ force: true });
    
    cy.wait('@pagina2');
    cy.contains(/Página 2 de \d+/).should('be.visible');
  });

  it('gera o relatório de funcionários em PDF', () => {
    cy.intercept('GET', '**/funcionarios?*size=10000*').as('gerarRelatorio');
    cy.contains('button', 'Baixar Relatório').click();
    cy.wait('@gerarRelatorio').its('response.statusCode').should('eq', 200);
  });
});