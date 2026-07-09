import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css';

function FuncionarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados do Funcionário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [vinculos, setVinculos] = useState([]);

  // Estados para controlar o Modal de Vínculo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [indexEdicaoVinculo, setIndexEdicaoVinculo] = useState(null); // null = novo, número = editando existente na lista local

  // Estados do formulário de Vínculo (dentro do modal)
  const [empresa, setEmpresa] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('');

  // Listas auxiliares para preencher os selects do modal
  const [cargosDisponiveis, setCargosDisponiveis] = useState([]);
  const [departamentosDisponiveis, setDepartamentosDisponiveis] = useState([]);

  // Carregar dados de Cargo e Departamento ao abrir a tela para usar no select do modal
  useEffect(() => {
    carregarAuxiliares();
    if (id) {
      carregarFuncionario();
    }
  }, [id]);

  const carregarAuxiliares = async () => {
    try {
      const [resCargos, resDeps] = await Promise.all([
        api.get('/cargos'),
        api.get('/departamentos')
      ]);
      setCargosDisponiveis(resCargos.data);
      setDepartamentosDisponiveis(resDeps.data);
    } catch (error) {
      console.error("Erro ao carregar dados auxiliares:", error);
    }
  };

  const carregarFuncionario = async () => {
    try {
      const response = await api.get(`/funcionarios/${id}`);
      setNome(response.data.nome);
      setCpf(response.data.cpf);
      setVinculos(response.data.vinculos || []);
    } catch (error) {
      console.error("Erro ao carregar funcionário:", error);
    }
  };

  // Abre o modal para criar um novo vínculo
  const handleAbrirNovoVinculo = () => {
    setIndexEdicaoVinculo(null);
    setEmpresa('');
    setMatricula('');
    setCargoSelecionado('');
    setDepartamentoSelecionado('');
    setIsModalOpen(true);
  };

  // Abre o modal para editar um vínculo local que já está na tabela
  const handleAbrirEditarVinculo = (index) => {
    const v = vinculos[index];
    setIndexEdicaoVinculo(index);
    setEmpresa(v.empresa);
    setMatricula(v.matricula);
    // Armazena apenas o ID para o select
    setCargoSelecionado(v.cargo?.id || '');
    setDepartamentoSelecionado(v.departamento?.id || '');
    setIsModalOpen(true);
  };

  // Salva o vínculo no estado local (não envia para o backend ainda)
  const handleSalvarVinculoLocal = (e) => {
    e.preventDefault();

    const cargoObj = cargosDisponiveis.find(c => c.id === Number(cargoSelecionado));
    const depObj = departamentosDisponiveis.find(d => d.id === Number(departamentoSelecionado));

    const novoVinculo = {
      empresa,
      matricula,
      cargo: cargoObj,
      departamento: depObj
    };

    if (indexEdicaoVinculo !== null) {
      // Editando um vínculo existente na lista local
      const novosVinculos = [...vinculos];
      novosVinculos[indexEdicaoVinculo] = novoVinculo;
      setVinculos(novosVinculos);
    } else {
      // Adicionando um novo vínculo na lista local
      setVinculos([...vinculos, novoVinculo]);
    }

    setIsModalOpen(false); // Fecha o modal
  };

  const handleRemoverVinculoLocal = (index) => {
    const novosVinculos = vinculos.filter((_, i) => i !== index);
    setVinculos(novosVinculos);
  };

  // Salva o Funcionário Completo no Backend (com todos os seus vínculos acoplados)
  const handleSalvarFuncionarioCompleto = async (e) => {
    e.preventDefault();
    try {
      const dadosParaEnviar = {
        nome,
        cpf,
        vinculos // Envia a lista de vínculos dentro do corpo do funcionário
      };

      if (id) {
        await api.put(`/funcionarios/${id}`, dadosParaEnviar);
        alert('Funcionário atualizado com sucesso!');
      } else {
        await api.post('/funcionarios', dadosParaEnviar);
        alert('Funcionário cadastrado com sucesso!');
      }
      navigate('/funcionarios');
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      alert(error.response?.data || 'Erro ao cadastrar. Verifique se o CPF é duplicado.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>{id ? 'Editar Funcionário' : 'Novo Funcionário'}</h1>
      </div>

      <div className={styles.formContainer} style={{ maxWidth: '100%' }}>
        <form onSubmit={handleSalvarFuncionarioCompleto}>
          {/* Dados Pessoais */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '600' }}>Nome *</label>
              <input 
                className={styles.inputField}
                placeholder="Nome do funcionário" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '600' }}>CPF *</label>
              <input 
                className={styles.inputField}
                placeholder="000.000.000-00" 
                value={cpf} 
                onChange={(e) => setCpf(e.target.value)} 
                required 
              />
            </div>
          </div>

          <hr style={{ border: '0', height: '1px', background: '#e2e8f0', margin: '30px 0' }} />

          {/* Seção de Vínculos */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#1e293b', margin: 0 }}>Vínculos</h2>
            <button type="button" className={styles.btnPrimary} onClick={handleAbrirNovoVinculo}>
              Novo Vínculo
            </button>
          </div>

          <table className={styles.dataTable} style={{ marginBottom: '30px' }}>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Matrícula</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vinculos.length > 0 ? (
                vinculos.map((v, index) => (
                  <tr key={index}>
                    <td>{v.empresa}</td>
                    <td>{v.matricula}</td>
                    <td>{v.cargo?.descricao || '-'}</td>
                    <td>{v.departamento?.descricao || '-'}</td>
                    <td>
                      <button type="button" className={styles.btnEdit} onClick={() => handleAbrirEditarVinculo(index)} style={{ marginRight: '15px' }}>
                        Editar
                      </button>
                      <button type="button" className={styles.btnEdit} onClick={() => handleRemoverVinculoLocal(index)} style={{ color: '#ef4444' }}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>Nenhum vínculo adicionado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Botões do Formulário Principal */}
          <div className={styles.formActions}>
            <button type="button" className={styles.btnOutline} onClick={() => navigate('/funcionarios')}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Salvar Funcionário
            </button>
          </div>
        </form>
      </div>

      {/* ==================================== */}
      {/* MODAL SOBREPOSTO (NOVO/EDITAR VÍNCULO) */}
      {/* ==================================== */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div className={styles.formContainer} style={{ width: '450px', background: 'white', padding: '30px' }}>
            <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '20px' }}>
              {indexEdicaoVinculo !== null ? 'Editar Vínculo' : 'Novo Vínculo'}
            </h2>
            <form onSubmit={handleSalvarVinculoLocal} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#64748b' }}>Empresa *</label>
                <input 
                  className={styles.inputField} 
                  placeholder="Nome da Empresa" 
                  value={empresa} 
                  onChange={(e) => setEmpresa(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#64748b' }}>Matrícula *</label>
                <input 
                  className={styles.inputField} 
                  placeholder="Número de Matrícula" 
                  value={matricula} 
                  onChange={(e) => setMatricula(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#64748b' }}>Cargo *</label>
                <select 
                  className={styles.inputField}
                  value={cargoSelecionado} 
                  onChange={(e) => setCargoSelecionado(e.target.value)}
                  required
                >
                  <option value="">Selecione um Cargo</option>
                  {cargosDisponiveis.map(c => (
                    <option key={c.id} value={c.id}>{c.descricao}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#64748b' }}>Departamento *</label>
                <select 
                  className={styles.inputField}
                  value={departamentoSelecionado} 
                  onChange={(e) => setDepartamentoSelecionado(e.target.value)}
                  required
                >
                  <option value="">Selecione um Departamento</option>
                  {departamentosDisponiveis.map(d => (
                    <option key={d.id} value={d.id}>{d.descricao}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formActions} style={{ marginTop: '15px' }}>
                <button type="button" className={styles.btnOutline} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Salvar Vínculo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FuncionarioForm;