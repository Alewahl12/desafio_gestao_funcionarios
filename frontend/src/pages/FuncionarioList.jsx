import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './shared.module.css';
import { IconDownload, IconPlus, IconEdit, IconChevronDown } from '../components/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function FuncionarioList() {
  const [funcionarios, setFuncionarios] = useState([]);

  // Estados dos filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');
  const [filtroMatricula, setFiltroMatricula] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');

  const [cargosDisponiveis, setCargosDisponiveis] = useState([]);
  const [departamentosDisponiveis, setDepartamentosDisponiveis] = useState([]);

  const [isViewModalOpen, setIsModalOpen] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      const [resFunc, resCargos, resDeps] = await Promise.all([
        api.get('/funcionarios'),
        api.get('/cargos'),
        api.get('/departamentos')
      ]);
      setFuncionarios(resFunc.data);
      setCargosDisponiveis(resCargos.data);
      setDepartamentosDisponiveis(resDeps.data);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    }
  };

  // Filtro instantâneo: reage a cada alteração, sem botão de pesquisa.
  const listaFiltrada = useMemo(() => {
    return funcionarios.filter(func => {
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
  }, [funcionarios, filtroNome, filtroCpf, filtroMatricula, filtroEmpresa, filtroCargo, filtroDepartamento]);

  const handleVisualizarVinculos = (func) => {
    setFuncionarioSelecionado(func);
    setIsModalOpen(true);
  };

  const gerarRelatorio = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Funcionários", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Sistema de Gestão - Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    const colunas = ["Nome", "CPF", "Empresa", "Matrícula", "Cargo", "Departamento"];

    // Uma linha por vínculo — Nome e CPF são mesclados verticalmente (rowSpan)
    // quando o funcionário tem mais de um vínculo, assim cada empresa fica
    // claramente pareada com seu próprio cargo/departamento/matrícula.
    const linhas = [];
    listaFiltrada.forEach(func => {
      const vinculos = func.vinculos && func.vinculos.length > 0 ? func.vinculos : [null];

      vinculos.forEach((v, index) => {
        const linha = [];

        if (index === 0) {
          linha.push({ content: func.nome, rowSpan: vinculos.length, styles: { valign: 'middle' } });
          linha.push({ content: func.cpf, rowSpan: vinculos.length, styles: { valign: 'middle' } });
        }

        linha.push(v ? v.empresa : '-');
        linha.push(v ? v.matricula : '-');
        linha.push(v?.cargo?.descricao || '-');
        linha.push(v?.departamento?.descricao || '-');

        linhas.push(linha);
      });
    });

    autoTable(doc, {
      startY: 35,
      head: [colunas],
      body: linhas,
      headStyles: { fillColor: [47, 111, 237] },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save("relatorio_funcionarios.pdf");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeaderRow}>
        <div>
          <h1>Funcionários</h1>
          <p className={styles.pageSubtitle}>Veja os funcionários cadastrados no sistema.</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnOutline} onClick={gerarRelatorio}>
            <IconDownload /> Baixar Relatório
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/funcionarios/novo')}>
            <IconPlus /> Novo Funcionário
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardSearchRow}>
          <fieldset className={styles.fieldBox}>
            <legend className={styles.fieldLegend}>Nome do Funcionário</legend>
            <input
              className={styles.fieldInput}
              placeholder="Procure pelo funcionário"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
          </fieldset>

          <fieldset className={`${styles.fieldBox} ${styles.fieldBoxTiny}`}>
            <legend className={styles.fieldLegend}>CPF</legend>
            <input
              className={styles.fieldInput}
              placeholder="000.000.000-00"
              value={filtroCpf}
              onChange={(e) => setFiltroCpf(e.target.value)}
            />
          </fieldset>

          <fieldset className={`${styles.fieldBox} ${styles.fieldBoxTiny}`}>
            <legend className={styles.fieldLegend}>Matrícula</legend>
            <input
              className={styles.fieldInput}
              placeholder="0000000000"
              value={filtroMatricula}
              onChange={(e) => setFiltroMatricula(e.target.value)}
            />
          </fieldset>

          <fieldset className={styles.fieldBox}>
            <legend className={styles.fieldLegend}>Empresa</legend>
            <input
              className={styles.fieldInput}
              placeholder="Procure pela empresa"
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value)}
            />
          </fieldset>

          <fieldset className={styles.fieldBox}>
            <legend className={styles.fieldLegend}>Cargo</legend>
            <div className={styles.fieldSelectWrap}>
              <select
                className={styles.fieldSelect}
                value={filtroCargo}
                onChange={(e) => setFiltroCargo(e.target.value)}
              >
                <option value="">Selecione Uma Opção</option>
                {cargosDisponiveis.map(c => (
                  <option key={c.id} value={c.id}>{c.descricao}</option>
                ))}
              </select>
              <IconChevronDown className={styles.selectChevron} />
            </div>
          </fieldset>

          <fieldset className={styles.fieldBox}>
            <legend className={styles.fieldLegend}>Departamento</legend>
            <div className={styles.fieldSelectWrap}>
              <select
                className={styles.fieldSelect}
                value={filtroDepartamento}
                onChange={(e) => setFiltroDepartamento(e.target.value)}
              >
                <option value="">Selecione Uma Opção</option>
                {departamentosDisponiveis.map(d => (
                  <option key={d.id} value={d.id}>{d.descricao}</option>
                ))}
              </select>
              <IconChevronDown className={styles.selectChevron} />
            </div>
          </fieldset>
        </div>

        <p className={styles.cardHint}>Clique para ver os vínculos de empresa do funcionário</p>

        <div className={styles.tableScroll}>
          <table className={styles.plainTable}>
            <thead>
              <tr>
                <th className={styles.editCol}>Editar</th>
                <th>Nome</th>
                <th>CPF</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length > 0 ? (
                listaFiltrada.map((func) => (
                  <tr
                    key={func.id}
                    className={styles.clickableRow}
                    onClick={() => handleVisualizarVinculos(func)}
                  >
                    <td>
                      <button
                        className={styles.btnIconEdit}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/funcionarios/editar/${func.id}`);
                        }}
                        title="Editar funcionário"
                      >
                        <IconEdit />
                      </button>
                    </td>
                    <td>{func.nome}</td>
                    <td>{func.cpf}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.emptyState}>Nenhum funcionário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isViewModalOpen && funcionarioSelecionado && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={`${styles.modalCard} ${styles.modalCardWide}`} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Vínculos de Empresa</h2>

            <table className={styles.plainTable}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Matrícula</th>
                  <th>Cargo</th>
                  <th>Departamento</th>
                </tr>
              </thead>
              <tbody>
                {funcionarioSelecionado.vinculos && funcionarioSelecionado.vinculos.length > 0 ? (
                  funcionarioSelecionado.vinculos.map((v, idx) => (
                    <tr key={idx}>
                      <td>{v.empresa}</td>
                      <td>{v.matricula}</td>
                      <td>{v.cargo?.descricao || '-'}</td>
                      <td>{v.departamento?.descricao || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>Este funcionário não possui vínculos ativos.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className={styles.modalFooterCenter}>
              <button
                type="button"
                className={`${styles.btnOutline} ${styles.btnWide}`}
                onClick={() => setIsModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FuncionarioList;