import { describe, it, expect } from 'vitest';
import { filtrarPorDescricaoECodigo, filtrarFuncionarios } from './filtros';

describe('filtrarPorDescricaoECodigo', () => {
  const lista = [
    { id: 1, descricao: 'Tecnologia da Informação', codigo: 'TI' },
    { id: 2, descricao: 'Recursos Humanos', codigo: 'RH' },
    { id: 3, descricao: 'Financeiro', codigo: 'FIN' },
  ];

  it('retorna a lista inteira quando os dois filtros estão vazios', () => {
    expect(filtrarPorDescricaoECodigo(lista, '', '')).toHaveLength(3);
  });

  it('filtra por descrição parcial, sem diferenciar maiúsculas/minúsculas', () => {
    const resultado = filtrarPorDescricaoECodigo(lista, 'tecnologia', '');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].codigo).toBe('TI');
  });

  it('filtra por código parcial, sem diferenciar maiúsculas/minúsculas', () => {
    const resultado = filtrarPorDescricaoECodigo(lista, '', 'rh');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].codigo).toBe('RH');
  });

  it('combina os dois filtros (E, não OU)', () => {
    // Existe item com "Recursos Humanos" e item com código "FIN",
    // mas nenhum item satisfaz as duas condições ao mesmo tempo.
    const resultado = filtrarPorDescricaoECodigo(lista, 'Recursos', 'FIN');
    expect(resultado).toHaveLength(0);
  });

  it('retorna lista vazia quando nada corresponde', () => {
    expect(filtrarPorDescricaoECodigo(lista, 'inexistente', '')).toHaveLength(0);
  });
});

describe('filtrarFuncionarios', () => {
  const cargoDev = { id: 1, descricao: 'Desenvolvedor' };
  const depTI = { id: 1, descricao: 'Tecnologia da Informação' };

  const funcionarios = [
    {
      id: 1,
      nome: 'Ana Silva',
      cpf: '123.456.789-00',
      vinculos: [
        { empresa: 'Empresa X', matricula: '111', cargo: cargoDev, departamento: depTI },
      ],
    },
    {
      id: 2,
      nome: 'Bruno Costa',
      cpf: '987.654.321-00',
      vinculos: [], // funcionário sem nenhum vínculo ainda
    },
  ];

  it('retorna todos quando nenhum filtro é informado', () => {
    expect(filtrarFuncionarios(funcionarios, {})).toHaveLength(2);
  });

  it('filtra por nome parcial, sem diferenciar maiúsculas/minúsculas', () => {
    const resultado = filtrarFuncionarios(funcionarios, { filtroNome: 'ana' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe('Ana Silva');
  });

  it('filtra por CPF ignorando pontuação', () => {
    const resultado = filtrarFuncionarios(funcionarios, { filtroCpf: '98765432100' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe('Bruno Costa');
  });

  it('filtra por empresa do vínculo', () => {
    const resultado = filtrarFuncionarios(funcionarios, { filtroEmpresa: 'Empresa X' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe('Ana Silva');
  });

  it('filtra por cargo do vínculo (comparando pelo id)', () => {
    const resultado = filtrarFuncionarios(funcionarios, { filtroCargo: '1' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe('Ana Silva');
  });

  it('exclui funcionário sem vínculos quando um filtro de vínculo é usado', () => {
    // Bruno não tem vínculos, então nenhum filtro de empresa/cargo/departamento/matrícula pode "achar" ele
    const resultado = filtrarFuncionarios(funcionarios, { filtroEmpresa: 'Qualquer' });
    expect(resultado.find(f => f.nome === 'Bruno Costa')).toBeUndefined();
  });

  it('inclui funcionário sem vínculos quando nenhum filtro de vínculo é usado', () => {
    const resultado = filtrarFuncionarios(funcionarios, { filtroNome: 'Bruno' });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe('Bruno Costa');
  });

  it('combina nome e filtro de vínculo (E, não OU)', () => {
    const resultado = filtrarFuncionarios(funcionarios, {
      filtroNome: 'Ana',
      filtroDepartamento: '1',
    });
    expect(resultado).toHaveLength(1);

    const semCombinacao = filtrarFuncionarios(funcionarios, {
      filtroNome: 'Bruno',
      filtroDepartamento: '1',
    });
    expect(semCombinacao).toHaveLength(0);
  });
});