import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css';
import { IconDownload, IconPlus, IconEdit } from '../components/icons';
// Importando as bibliotecas geradoras de PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DepartamentoList() {
  const [departamentos, setDepartamentos] = useState([]);
  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  const carregarDepartamentos = async () => {
    try {
      const response = await api.get('/departamentos');
      setDepartamentos(response.data);
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
    }
  };

  // Filtro instantâneo: reage a cada tecla digitada, sem botão de pesquisa.
  const listaFiltrada = useMemo(() => {
    return departamentos.filter(dep =>
      dep.descricao.toLowerCase().includes(filtroDescricao.toLowerCase()) &&
      dep.codigo.toLowerCase().includes(filtroCodigo.toLowerCase())
    );
  }, [departamentos, filtroDescricao, filtroCodigo]);

  // Função que constrói e baixa o Relatório em PDF
  const gerarRelatorio = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Departamentos", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Sistema de Gestão - Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    const colunas = ["Código", "Descrição"];
    const linhas = listaFiltrada.map(dep => [dep.codigo, dep.descricao]);

    autoTable(doc, {
      startY: 35,
      head: [colunas],
      body: linhas,
      headStyles: { fillColor: [47, 111, 237] },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save("relatorio_departamentos.pdf");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeaderRow}>
        <div>
          <h1>Departamento</h1>
          <p className={styles.pageSubtitle}>Veja os departamentos cadastrados no sistema.</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnOutline} onClick={gerarRelatorio}>
            <IconDownload /> Baixar Relatório
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/departamentos/novo')}>
            <IconPlus /> Novo Departamento
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardSearchRow}>
          <fieldset className={styles.fieldBox}>
            <legend className={styles.fieldLegend}>Descrição do Departamento</legend>
            <input
              className={styles.fieldInput}
              placeholder="Procure pelo nome do departamento"
              value={filtroDescricao}
              onChange={(e) => setFiltroDescricao(e.target.value)}
            />
          </fieldset>

          <fieldset className={`${styles.fieldBox} ${styles.fieldBoxCodeSearch}`}>
            <legend className={styles.fieldLegend}>Código</legend>
            <input
              className={styles.fieldInput}
              placeholder="Procure pelo código do departamento"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
            />
          </fieldset>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.plainTable}>
            <thead>
              <tr>
                <th className={styles.editCol}>Editar</th>
                <th>Descrição</th>
                <th>Código</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length > 0 ? (
                listaFiltrada.map((dep) => (
                  <tr key={dep.id}>
                    <td>
                      <button
                        className={styles.btnIconEdit}
                        onClick={() => navigate(`/departamentos/editar/${dep.id}`)}
                        title="Editar departamento"
                      >
                        <IconEdit />
                      </button>
                    </td>
                    <td>{dep.descricao}</td>
                    <td>{dep.codigo}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.emptyState}>Nenhum departamento encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DepartamentoList;