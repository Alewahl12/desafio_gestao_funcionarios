/**
 * Funções puras de filtro, usadas pelas telas de listagem (Departamento, Cargo
 * e Funcionário). Ficam separadas dos componentes justamente para poderem ser
 * testadas como unidade, sem precisar renderizar nenhuma tela.
 */

// Usado por Departamento e Cargo — ambos filtram por "descrição" + "código".
export function filtrarPorDescricaoECodigo(lista, filtroDescricao, filtroCodigo) {
  return lista.filter(item =>
    item.descricao.toLowerCase().includes(filtroDescricao.toLowerCase()) &&
    item.codigo.toLowerCase().includes(filtroCodigo.toLowerCase())
  );
}

// Usado pela lista de Funcionários — filtra por nome/CPF do funcionário e,
// quando informado, também pelos campos de cada vínculo (matrícula, empresa,
// cargo, departamento).
export function filtrarFuncionarios(lista, filtros) {
  const {
    filtroNome = '',
    filtroCpf = '',
    filtroMatricula = '',
    filtroEmpresa = '',
    filtroCargo = '',
    filtroDepartamento = '',
  } = filtros;

  return lista.filter(func => {
    const matchNome = func.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const matchCpf = func.cpf.replace(/[.-]/g, '').includes(filtroCpf.replace(/[.-]/g, ''));

    if (!func.vinculos || func.vinculos.length === 0) {
      return matchNome && matchCpf && !filtroMatricula && !filtroEmpresa && !filtroCargo && !filtroDepartamento;
    }

    const matchVinculos = func.vinculos.some(v => {
      const matchMat = filtroMatricula === '' || v.matricula.includes(filtroMatricula);
      const matchEmp = filtroEmpresa === '' || v.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase());
      const matchCar = filtroCargo === '' || (v.cargo && String(v.cargo.id) === filtroCargo);
      const matchDep = filtroDepartamento === '' || (v.departamento && String(v.departamento.id) === filtroDepartamento);

      return matchMat && matchEmp && matchCar && matchDep;
    });

    return matchNome && matchCpf && matchVinculos;
  });
}