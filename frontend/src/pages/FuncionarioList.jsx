import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css'; // Reaproveitando nosso design system
// 👇 NOVAS IMPORTAÇÕES PARA O PDF 👇
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function FuncionarioList() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [listaFiltrada, setListaFiltrada] = useState([]);
  
  // Estados para os filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroMatricula, setFiltroMatricula] = useState('');
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
      setListaFiltrada(resFunc.data);
      setCargosDisponiveis(resCargos.data);
      setDepartamentosDisponiveis(resDeps.data);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    }
  };

  const handlePesquisar = () => {
    const filtrados = funcionarios.filter(func => {
      const matchNome = func.nome.toLowerCase().includes(filtroNome.toLowerCase());
      const matchCpf = func.cpf.replace(/[.-]/g, '').includes(filtroCpf.replace(/[.-]/g, ''));
      
      if (!func.vinculos || func.vinculos.length === 0) {
        return matchNome && matchCpf && !filtroEmpresa && !filtroMatricula && !filtroCargo && !filtroDepartamento;
      }

      const matchVinculos = func.vinculos.some(v => {
        const matchEmp = filtroEmpresa === '' || v.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase());
        const matchMat = filtroMatricula === '' || v.matricula.includes(filtroMatricula);
        const matchCar = filtroCargo === '' || (v.cargo && String(v.cargo.id) === filtroCargo);
        const matchDep = filtroDepartamento === '' || (v.departamento && String(v.departamento.id) === filtroDepartamento);
        
        return matchEmp && matchMat && matchCar && matchDep;
      });

      return matchNome && matchCpf && matchVinculos;
    });
    setListaFiltrada(filtrados);
  };

  const handleVisualizarVinculos = (func) => {
    setFuncionarioSelecionado(func);
    setIsModalOpen(true);
  };

  // 👇 FUNÇÃO PARA GERAR O RELATÓRIO PDF COM A SINTAXE CORRETA DO VITE 👇
  const gerarRelatorio = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório de Funcionários", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Sistema de Gestão - Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    const colunas = ["Nome", "CPF", "Empresa(s)", "Cargo(s)", "Departamento(s)"];
    
    const linhas = listaFiltrada.map(func => {
      const empresas = func.vinculos?.map(v => v.empresa).join(', ') || '-';
      const cargos = func.vinculos?.map(v => v.cargo?.descricao).join(', ') || '-';
      const deps = func.vinculos?.map(v => v.departamento?.descricao).join(', ') || '-';
      
      return [func.nome, func.cpf, empresas, cargos, deps];
    });

    autoTable(doc, {
      startY: 35,
      head: [colunas],
      body: linhas,
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9, cellPadding: 4 }, 
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save("relatorio_funcionarios.pdf");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>Funcionários</h1>
      </div>

      <div className={styles.searchBar} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        <input className={styles.inputField} placeholder="Nome" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
        <input className={styles.inputField} placeholder="CPF" value={filtroCpf} onChange={(e) => setFiltroCpf(e.target.value)} />
        <input className={styles.inputField} placeholder="Empresa" value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)} />
        <input className={styles.inputField} placeholder="Matrícula" value={filtroMatricula} onChange={(e) => setFiltroMatricula(e.target.value)} />
        
        <select className={styles.inputField} value={filtroCargo} onChange={(e) => setFiltroCargo(e.target.value)}>
          <option value="">Filtrar por Cargo</option>
          {cargosDisponiveis.map(c => <option key={c.id} value={c.id}>{c.descricao}</option>)}
        </select>
        
        <select className={styles.inputField} value={filtroDepartamento} onChange={(e) => setFiltroDepartamento(e.target.value)}>
          <option value="">Filtrar por Departamento</option>
          {departamentosDisponiveis.map(d => <option key={d.id} value={d.id}>{d.descricao}</option>)}
        </select>
        
        <button className={styles.btnSearch} style={{ gridColumn: 'span 3', justifySelf: 'end', marginTop: '5px' }} onClick={handlePesquisar}>
          Pesquisar com Filtros
        </button>
      </div>

      <div className={styles.actionButtons}>
        {/* 👇 BOTÃO LIGADO À FUNÇÃO DE PDF 👇 */}
        <button className={styles.btnOutline} onClick={gerarRelatorio}>
          Baixar Relatório
        </button>
        <button className={styles.btnPrimary} onClick={() => navigate('/funcionarios/novo')}>
          Novo Funcionário
        </button>
      </div>

      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569', fontStyle: 'italic', fontWeight: '500' }}>
        💡 Clique no nome do funcionário para ver os vínculos de empresa do funcionário
      </p>

      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Empresa(s)</th>
            <th>Cargo(s)</th>
            <th>Departamento(s)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {listaFiltrada.length > 0 ? (
            listaFiltrada.map((func) => (
              <tr key={func.id}>
                <td>
                  <span 
                    style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}
                    onClick={() => handleVisualizarVinculos(func)}
                    title="Clique para ver detalhes e vínculos"
                  >
                    {func.nome}
                  </span>
                </td>
                <td>{func.cpf}</td>
                <td>{func.vinculos?.map(v => v.empresa).join(', ') || '-'}</td>
                <td>{func.vinculos?.map(v => v.cargo?.descricao).join(', ') || '-'}</td>
                <td>{func.vinculos?.map(v => v.departamento?.descricao).join(', ') || '-'}</td>
                <td>
                  <button className={styles.btnEdit} onClick={() => navigate(`/funcionarios/editar/${func.id}`)}>
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

      {isViewModalOpen && funcionarioSelecionado && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className={styles.formContainer} style={{ width: '650px', background: 'white', padding: '30px', maxWidth: '90vw' }}>
            <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '5px' }}>Vínculos do Colaborador</h2>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '15px' }}>
              <strong>Nome:</strong> {funcionarioSelecionado.nome} | <strong>CPF:</strong> {funcionarioSelecionado.cpf}
            </p>
            
            <table className={styles.dataTable} style={{ marginBottom: '25px', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
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
                    <td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>Este funcionário não possui vínculos ativos.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className={styles.formActions} style={{ justifyContent: 'flex-end' }}>
              <button type="button" className={styles.btnPrimary} onClick={() => setIsModalOpen(false)}>
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FuncionarioList;