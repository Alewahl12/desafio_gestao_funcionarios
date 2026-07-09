import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css'; // Reaproveitando o CSS!

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
        <button className={styles.btnOutline} onClick={() => alert("Relatório em breve!")}>
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