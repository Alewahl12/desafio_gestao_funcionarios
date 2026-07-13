import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './shared.module.css';
import { IconDownload, IconPlus, IconEdit } from '../components/icons';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
// Importando as bibliotecas geradoras de PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TAMANHO_PAGINA = 10;

function DepartamentoList() {
  const [departamentos, setDepartamentos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');

  // Só dispara a busca depois que o usuário parar de digitar por um instante
  const descricaoComAtraso = useDebouncedValue(filtroDescricao);
  const codigoComAtraso = useDebouncedValue(filtroCodigo);

  const navigate = useNavigate();

  // Sempre que o filtro (já com o atraso) mudar, volta pra primeira página
  useEffect(() => {
    setPagina(0);
  }, [descricaoComAtraso, codigoComAtraso]);

  useEffect(() => {
    carregarDepartamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, descricaoComAtraso, codigoComAtraso]);

  const carregarDepartamentos = async () => {
    try {
      const response = await api.get('/departamentos', {
        params: {
          descricao: descricaoComAtraso,
          codigo: codigoComAtraso,
          page: pagina,
          size: TAMANHO_PAGINA,
        },
      });
      setDepartamentos(response.data.content);
      setTotalPaginas(response.data.totalPages);
      setTotalElementos(response.data.totalElements);
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
    }
  };

  // Função que constrói e baixa o Relatório em PDF — busca TODOS os registros
  // que batem com o filtro atual, não só a página que está sendo exibida.
  const gerarRelatorio = async () => {
    try {
      const response = await api.get('/departamentos', {
        params: {
          descricao: descricaoComAtraso,
          codigo: codigoComAtraso,
          page: 0,
          size: 10000,
        },
      });
      const todos = response.data.content;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Relatório de Departamentos", 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Sistema de Gestão - Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

      const colunas = ["Código", "Descrição"];
      const linhas = todos.map(dep => [dep.codigo, dep.descricao]);

      autoTable(doc, {
        startY: 35,
        head: [colunas],
        body: linhas,
        headStyles: { fillColor: [47, 111, 237] },
        styles: { fontSize: 10, cellPadding: 5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      doc.save("relatorio_departamentos.pdf");
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    }
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
              {departamentos.length > 0 ? (
                departamentos.map((dep) => (
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

        <div className={styles.paginationRow}>
          <span className={styles.paginationInfo}>
            {totalElementos} {totalElementos === 1 ? 'registro' : 'registros'}
          </span>

          <div className={styles.paginationButtons}>
            <button
              className={styles.btnOutline}
              onClick={() => setPagina((p) => Math.max(p - 1, 0))}
              disabled={pagina === 0}
            >
              Anterior
            </button>
            <span className={styles.paginationPage}>
              Página {totalPaginas === 0 ? 0 : pagina + 1} de {totalPaginas}
            </span>
            <button
              className={styles.btnOutline}
              onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas - 1))}
              disabled={pagina >= totalPaginas - 1}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepartamentoList;