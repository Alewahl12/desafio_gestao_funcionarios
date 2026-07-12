// Gera um CPF sintaticamente válido (cumpre o algoritmo de dígito verificador),
// diferente a cada execução — assim como o código/descrição, evita colidir
// com "CPF já cadastrado" ao rodar a suíte várias vezes.
function gerarCpfValido() {
  const nove = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));

  const calcularDigito = (digitos) => {
    let soma = 0;
    let peso = digitos.length + 1;
    digitos.forEach((d) => {
      soma += d * peso;
      peso -= 1;
    });
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(nove);
  const d2 = calcularDigito([...nove, d1]);

  const str = [...nove, d1, d2].join('');
  return `${str.slice(0, 3)}.${str.slice(3, 6)}.${str.slice(6, 9)}-${str.slice(9, 11)}`;
}

describe('Funcionários', () => {
  const sufixo = Date.now();
  const nome = `Funcionario Cypress ${sufixo}`;
  const cpf = gerarCpfValido();
  const empresa = `Empresa Cypress ${sufixo}`;
  const matricula = `${sufixo}`.slice(-6);

  const cargoDescricao = `Cargo Cypress Func ${sufixo}`;
  const depDescricao = `Departamento Cypress Func ${sufixo}`;

  before(() => {
    // Cria um Cargo e um Departamento de apoio direto pela API, só pra ter
    // opção disponível no select do vínculo — não é o que estamos testando aqui.
    cy.request('POST', `${Cypress.env('apiUrl')}/cargos`, {
      descricao: cargoDescricao,
      codigo: `CYF${sufixo}`,
    });
    cy.request('POST', `${Cypress.env('apiUrl')}/departamentos`, {
      descricao: depDescricao,
      codigo: `CYF${sufixo}`,
    });
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/funcionarios');
  });

  it('cadastra um novo funcionário com um vínculo', () => {
    cy.contains('button', 'Novo Funcionário').click();
    cy.contains('h1', 'Cadastro de Funcionário').should('be.visible');

    cy.get('input[placeholder="Insira o nome do funcionário"]').type(nome);
    cy.get('input[placeholder="000.000.000-00"]').type(cpf);

    cy.contains('button', 'Novo Vínculo').click();

    // Escopa dentro do modal para não confundir com o Confirmar da tela de fundo
    cy.get('[class*="modalCard"]').within(() => {
      cy.contains('h2', 'Novo Vínculo').should('be.visible');
      cy.get('input[placeholder="Insira o nome da empresa"]').type(empresa);
      cy.get('input[placeholder="0000000000"]').type(matricula);
      cy.contains('fieldset', 'Cargo').find('select').select(cargoDescricao);
      cy.contains('fieldset', 'Departamento').find('select').select(depDescricao);
      cy.contains('button', 'Confirmar').click();
    });

    // Vínculo deve aparecer na tabela "Empresas" do formulário
    cy.contains('td', empresa).should('be.visible');

    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('sucesso');
    });

    cy.contains('button', 'Confirmar').click();

    cy.url().should('include', '/funcionarios');
    cy.get('input[placeholder="Procure pelo funcionário"]').type(nome);
    cy.contains('td', nome).should('be.visible');
  });

  it('pesquisa o funcionário pelo nome', () => {
    cy.get('input[placeholder="Procure pelo funcionário"]').type(nome);
    cy.contains('td', nome).should('be.visible');
  });

  it('pesquisa o funcionário pelo CPF', () => {
    cy.get('input[placeholder="000.000.000-00"]').type(cpf);
    cy.contains('td', nome).should('be.visible');
  });

  it('pesquisa o funcionário pela empresa do vínculo', () => {
    cy.get('input[placeholder="Procure pela empresa"]').type(empresa);
    cy.contains('td', nome).should('be.visible');
  });

  it('pesquisa o funcionário pela matrícula do vínculo', () => {
    cy.get('input[placeholder="0000000000"]').type(matricula);
    cy.contains('td', nome).should('be.visible');
  });

  it('pesquisa o funcionário pelo cargo do vínculo', () => {
    cy.contains('fieldset', 'Cargo').find('select').select(cargoDescricao);
    cy.contains('td', nome).should('be.visible');
  });

  it('pesquisa o funcionário pelo departamento do vínculo', () => {
    cy.contains('fieldset', 'Departamento').find('select').select(depDescricao);
    cy.contains('td', nome).should('be.visible');
  });

  it('exibe os vínculos ao clicar na linha do funcionário', () => {
    cy.get('input[placeholder="Procure pelo funcionário"]').type(nome);
    cy.contains('td', nome).click();

    cy.get('[class*="modalCard"]').within(() => {
      cy.contains('h2', 'Vínculos de Empresa').should('be.visible');
      cy.contains('td', empresa).should('be.visible');
      cy.contains('td', matricula).should('be.visible');
      cy.contains('button', 'Fechar').click();
    });
  });

  it('edita o funcionário cadastrado', () => {
    const novoNome = `${nome} Editado`;

    cy.get('input[placeholder="Procure pelo funcionário"]').type(nome);
    cy.get('table tbody tr').first().find('button').click();

    cy.contains('h1', 'Editar Funcionário').should('be.visible');
    // O vínculo criado no cadastro deve continuar aparecendo na edição
    cy.contains('td', empresa).should('be.visible');

    cy.get('input[placeholder="Insira o nome do funcionário"]')
      .clear()
      .type(novoNome);

    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('sucesso');
    });

    cy.contains('button', 'Salvar').click();

    cy.url().should('include', '/funcionarios');
    cy.get('input[placeholder="Procure pelo funcionário"]').type(novoNome);
    cy.contains('td', novoNome).should('be.visible');
  });

  it('gera o relatório em PDF sem erros', () => {
    cy.contains('button', 'Baixar Relatório').click();

    cy.readFile('cypress/downloads/relatorio_funcionarios.pdf', { timeout: 10000 })
      .should('exist');
  });
});