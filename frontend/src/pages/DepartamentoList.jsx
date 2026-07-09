import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css'; // Importação do CSS Module

function DepartamentoList() {
  const [departamentos, setDepartamentos] = useState([]);
  const [listaFiltrada, setListaFiltrada] = useState([]);
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescricao, setFiltroDescricao] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  const carregarDepartamentos = async () => {
    try {
      const response = await api.get('/departamentos');
      setDepartamentos(response.data);
      setListaFiltrada(response.data);
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
    }
  };

  const handlePesquisar = () => {
    const filtrados = departamentos.filter(dep => 
      dep.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()) &&
      dep.descricao.toLowerCase().includes(filtroDescricao.toLowerCase())
    );
    setListaFiltrada(filtrados);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>Departamentos</h1>
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
        <button className={styles.btnOutline} onClick={() => alert("Relatório em breve!")}>
          Baixar Relatório
        </button>
        <button className={styles.btnPrimary} onClick={() => navigate('/departamentos/novo')}>
          Novo Departamento
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
            listaFiltrada.map((dep) => (
              <tr key={dep.id}>
                <td>{dep.codigo}</td>
                <td>{dep.descricao}</td>
                <td>
                  <button 
                    className={styles.btnEdit} 
                    onClick={() => navigate(`/departamentos/editar/${dep.id}`)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>Nenhum departamento encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartamentoList;