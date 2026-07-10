import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css'; // Usando o mesmo CSS
// Importando as bibliotecas geradoras de PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function CargoList() {
  const [cargos, setCargos] = useState([]);
  const [listaFiltrada, setListaFiltrada] = useState([]);
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescricao, setFiltroDescricao] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    carregarCargos();
  }, []);

  const carregarCargos = async () => {
    try {
      const response = await api.get('/cargos');
      setCargos(response.data);
      setListaFiltrada(response.data);
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
    }
  };

  const handlePesquisar = () => {
    const filtrados = cargos.filter(cargo => 
      cargo.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()) &&
      cargo.descricao.toLowerCase().includes(filtroDescricao.toLowerCase())
    );
    setListaFiltrada(filtrados);
  };

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

    // Desenha a tabela com a nova sintaxe corrigida para o Vite
    autoTable(doc, {
      startY: 35,
      head: [colunas],
      body: linhas,
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Dispara o download
    doc.save("relatorio_cargos.pdf");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>Cargos</h1>
      </div>

      <div className={styles.searchBar}>
        <input 
          className={styles.inputField} 
          placeholder="Código" 
          value={filtroCodigo}
          onChange={(e) => setFiltroCodigo(e.target.value)}
        />
        <input 
          className={styles.inputField} 
          placeholder="Descrição" 
          value={filtroDescricao}
          onChange={(e) => setFiltroDescricao(e.target.value)}
        />
        <button className={styles.btnSearch} onClick={handlePesquisar}>Pesquisar</button>
      </div>

      <div className={styles.actionButtons}>
        {/* 👇 Botão atualizado chamando a função de relatório 👇 */}
        <button className={styles.btnOutline} onClick={gerarRelatorio}>
          Baixar Relatório
        </button>
        <button className={styles.btnPrimary} onClick={() => navigate('/cargos/novo')}>
          Novo Cargo
        </button>
      </div>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {listaFiltrada.length > 0 ? (
            listaFiltrada.map((cargo) => (
              <tr key={cargo.id}>
                <td>{cargo.codigo}</td>
                <td>{cargo.descricao}</td>
                <td>
                  <button 
                    className={styles.btnEdit} 
                    onClick={() => navigate(`/cargos/editar/${cargo.id}`)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>Nenhum cargo encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CargoList;