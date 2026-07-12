import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import styles from './shared.module.css';
import { cpf as validadorCpf } from 'cpf-cnpj-validator';
import { IconInfo, IconClose, IconCheck, IconSave, IconPlus, IconEdit, IconChevronDown } from '../components/icons';

function FuncionarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados do Funcionário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [vinculos, setVinculos] = useState([]);

  // Estados para controlar o Modal de Vínculo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [indexEdicaoVinculo, setIndexEdicaoVinculo] = useState(null);

  // Estados do formulário de Vínculo (dentro do modal)
  const [empresa, setEmpresa] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('');

  // Listas auxiliares para preencher os selects do modal
  const [cargosDisponiveis, setCargosDisponiveis] = useState([]);
  const [departamentosDisponiveis, setDepartamentosDisponiveis] = useState([]);

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

  const handleAbrirNovoVinculo = () => {
    setIndexEdicaoVinculo(null);
    setEmpresa('');
    setMatricula('');
    setCargoSelecionado('');
    setDepartamentoSelecionado('');
    setIsModalOpen(true);
  };

  const handleAbrirEditarVinculo = (index) => {
    const v = vinculos[index];
    setIndexEdicaoVinculo(index);
    setEmpresa(v.empresa);
    setMatricula(v.matricula);
    setCargoSelecionado(v.cargo?.id || '');
    setDepartamentoSelecionado(v.departamento?.id || '');
    setIsModalOpen(true);
  };

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
      const novosVinculos = [...vinculos];
      novosVinculos[indexEdicaoVinculo] = novoVinculo;
      setVinculos(novosVinculos);
    } else {
      setVinculos([...vinculos, novoVinculo]);
    }

    setIsModalOpen(false);
  };

  const handleSalvarFuncionarioCompleto = async (e) => {
    e.preventDefault();

    if (!validadorCpf.isValid(cpf)) {
      alert("Erro: O CPF informado é inválido. Verifique o número e tente novamente.");
      return;
    }

    const cpfPadronizado = validadorCpf.format(cpf);

    try {
      const dadosParaEnviar = {
        nome,
        cpf: cpfPadronizado,
        vinculos
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
      <div className={styles.pageHeaderRow}>
        <div>
          <h1>{id ? 'Editar Funcionário' : 'Cadastro de Funcionário'}</h1>
          <p className={styles.pageSubtitle}>
            {id ? 'Altere as informações deste funcionário' : 'Adicione as informações do novo funcionário'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSalvarFuncionarioCompleto}>
        <div className={styles.formCard}>
          <h2 className={styles.formCardTitle}>
            <IconInfo /> Informações Gerais
          </h2>

          <div className={styles.formRow}>
            <fieldset className={styles.fieldBox}>
              <legend className={styles.fieldLegend}>Nome do Funcionário</legend>
              <input
                className={styles.fieldInput}
                placeholder="Insira o nome do funcionário"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </fieldset>

            <fieldset className={`${styles.fieldBox} ${styles.fieldBoxNarrow}`}>
              <legend className={styles.fieldLegend}>CPF</legend>
              <input
                className={styles.fieldInput}
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </fieldset>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>Empresas</h2>
            <button
              type="button"
              className={`${styles.btnOutline} ${styles.btnPill}`}
              onClick={handleAbrirNovoVinculo}
            >
              <IconPlus /> Novo Vínculo
            </button>
          </div>

          <div className={styles.tableScroll}>
            <table className={styles.plainTable}>
              <thead>
                <tr>
                  <th className={styles.editCol}>Editar</th>
                  <th>Empresa</th>
                  <th>Matrícula</th>
                  <th>Cargo</th>
                  <th>Departamento</th>
                </tr>
              </thead>
              <tbody>
                {vinculos.length > 0 ? (
                  vinculos.map((v, index) => (
                    <tr key={index}>
                      <td>
                        <button
                          type="button"
                          className={styles.btnIconEdit}
                          onClick={() => handleAbrirEditarVinculo(index)}
                          title="Editar vínculo"
                        >
                          <IconEdit />
                        </button>
                      </td>
                      <td>{v.empresa}</td>
                      <td>{v.matricula}</td>
                      <td>{v.cargo?.descricao || '-'}</td>
                      <td>{v.departamento?.descricao || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>Nenhum vínculo adicionado ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.btnOutline} onClick={() => navigate('/funcionarios')}>
            <IconClose /> Cancelar
          </button>
          <button type="submit" className={styles.btnPrimary}>
            {id ? <><IconSave /> Salvar</> : <><IconCheck /> Confirmar</>}
          </button>
        </div>
      </form>

      {/* MODAL SOBREPOSTO (NOVO/EDITAR VÍNCULO) */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {indexEdicaoVinculo !== null ? 'Editar Vínculo' : 'Novo Vínculo'}
            </h2>

            <form onSubmit={handleSalvarVinculoLocal}>
              <div className={styles.modalFormRow}>
                <fieldset className={styles.fieldBox}>
                  <legend className={styles.fieldLegend}>Nome da Empresa</legend>
                  <input
                    className={styles.fieldInput}
                    placeholder="Insira o nome da empresa"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    required
                  />
                </fieldset>

                <fieldset className={`${styles.fieldBox} ${styles.fieldBoxNarrow}`}>
                  <legend className={styles.fieldLegend}>Matrícula</legend>
                  <input
                    className={styles.fieldInput}
                    placeholder="0000000000"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    required
                  />
                </fieldset>
              </div>

              <div className={styles.modalFormRow}>
                <fieldset className={styles.fieldBox}>
                  <legend className={styles.fieldLegend}>Cargo</legend>
                  <div className={styles.fieldSelectWrap}>
                    <select
                      className={styles.fieldSelect}
                      value={cargoSelecionado}
                      onChange={(e) => setCargoSelecionado(e.target.value)}
                      required
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
                      value={departamentoSelecionado}
                      onChange={(e) => setDepartamentoSelecionado(e.target.value)}
                      required
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

              <div className={styles.modalActionsLeft}>
                <button type="button" className={styles.btnOutline} onClick={() => setIsModalOpen(false)}>
                  <IconClose /> Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  <IconCheck /> Confirmar
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