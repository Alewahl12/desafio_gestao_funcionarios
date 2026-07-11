import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css'; // Usando o mesmo design system
import { IconDownload, IconPlus, IconEdit } from '../components/icons';
// Importando as bibliotecas geradoras de PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function CargoList() {
  const [cargos, setCargos] = useState([]);
  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    carregarCargos();
  }, []);

  const carregarCargos = async () => {
    try {
      const response = await api.get('/cargos');
      setCargos(response.data);
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
    }
  };

  // Filtro instantâneo: reage a cada tecla digitada, sem botão de pesquisa.
  const listaFiltrada = useMemo(() => {
    return cargos.filter(cargo =>
      cargo.descricao.toLowerCase().includes(filtroDescricao.toLowerCase()) &&
      cargo.codigo.toLowerCase().includes(filtroCodigo.toLowerCase())
    );
  }, [cargos, filtroDescricao, filtroCodigo]);

  // Função que constrói e baixa o Relatório de Cargos em PDF
  const gerarRelatorio = () => {
    const doc = new jsPDF();

    // Configura os Títulos
    doc.setFontSize(18);
    doc.text("Relatório de Cargos", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Sistema de Gestão - Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    // Mapeia os dados usando a lista filtrada
    const colunas = ["Código", "Descrição"];
    const linhas = listaFiltrada.map(cargo => [cargo.codigo, cargo.descricao]);

    autoTable(doc, {
      startY: 35,
      head: [colunas],
      body: linhas,
      headStyles: { fillColor: [47, 111, 237] },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Dispara o download
    doc.save("relatorio_cargos.pdf");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeaderRow}>
        <div>
          <h1>Cargos</h1>
          <p className={styles.pageSubtitle}>Veja os cargos cadastrados no sistema.</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnOutline} onClick={gerarRelatorio}>
            <IconDownload /> Baixar Relatório
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/cargos/novo')}>
            <IconPlus /> Novo Cargo
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardSearchRow}>
          <fieldset className={styles.fieldBox}>
            <legend className={styles.fieldLegend}>Descrição do Cargo</legend>
            <input
              className={styles.fieldInput}
              placeholder="Procure pelo nome do cargo"
              value={filtroDescricao}
              onChange={(e) => setFiltroDescricao(e.target.value)}
            />
          </fieldset>

          <fieldset className={`${styles.fieldBox} ${styles.fieldBoxCodeSearch}`}>
            <legend className={styles.fieldLegend}>Código</legend>
            <input
              className={styles.fieldInput}
              placeholder="Procure pelo código do cargo"
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
                listaFiltrada.map((cargo) => (
                  <tr key={cargo.id}>
                    <td>
                      <button
                        className={styles.btnIconEdit}
                        onClick={() => navigate(`/cargos/editar/${cargo.id}`)}
                        title="Editar cargo"
                      >
                        <IconEdit />
                      </button>
                    </td>
                    <td>{cargo.descricao}</td>
                    <td>{cargo.codigo}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.emptyState}>Nenhum cargo encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CargoList;