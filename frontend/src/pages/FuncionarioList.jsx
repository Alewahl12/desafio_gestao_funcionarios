import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css'; // Reaproveitando nosso design system!

function FuncionarioList() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [listaFiltrada, setListaFiltrada] = useState([]);
  
  // Estados para os filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data);
      setListaFiltrada(response.data);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    }
  };

  const handlePesquisar = () => {
    const filtrados = funcionarios.filter(func => {
      const matchNome = func.nome.toLowerCase().includes(filtroNome.toLowerCase());
      const matchCpf = func.cpf.includes(filtroCpf);
      
      // Validação segura caso a empresa venha da lista de vínculos
      const matchEmpresa = filtroEmpresa === '' || 
        (func.vinculos && func.vinculos.some(v => v.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase())));

      return matchNome && matchCpf && matchEmpresa;
    });
    setListaFiltrada(filtrados);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>Funcionários</h1>
      </div>

      {/* Barra de Pesquisa Baseada no Figma */}
      <div className={styles.searchBar}>
        <input 
          className={styles.inputField} 
          placeholder="Nome" 
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <input 
          className={styles.inputField} 
          placeholder="CPF" 
          value={filtroCpf}
          onChange={(e) => setFiltroCpf(e.target.value)}
        />
        <input 
          className={styles.inputField} 
          placeholder="Empresa" 
          value={filtroEmpresa}
          onChange={(e) => setFiltroEmpresa(e.target.value)}
        />
        <button className={styles.btnSearch} onClick={handlePesquisar}>Pesquisar</button>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.btnOutline} onClick={() => alert("Relatório em breve!")}>
          Baixar Relatório
        </button>
        <button className={styles.btnPrimary} onClick={() => navigate('/funcionarios/novo')}>
          Novo Funcionário
        </button>
      </div>

      {/* Tabela de Dados */}
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Empresa</th>
            <th>Cargo</th>
            <th>Departamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {listaFiltrada.length > 0 ? (
            listaFiltrada.map((func) => (
              <tr key={func.id}>
                <td>{func.nome}</td>
                <td>{func.cpf}</td>
                {/* O símbolo ? evita que a tela quebre se vinculos for undefined */}
                <td>{func.vinculos?.map(v => v.empresa).join(', ') || '-'}</td>
                <td>{func.vinculos?.map(v => v.cargo?.descricao).join(', ') || '-'}</td>
                <td>{func.vinculos?.map(v => v.departamento?.descricao).join(', ') || '-'}</td>
                <td>
                  <button 
                    className={styles.btnEdit} 
                    onClick={() => navigate(`/funcionarios/editar/${func.id}`)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>Nenhum funcionário encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default FuncionarioList;