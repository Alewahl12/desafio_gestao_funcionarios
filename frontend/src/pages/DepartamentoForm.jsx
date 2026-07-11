import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css';
import { IconInfo, IconClose, IconCheck, IconSave } from '../components/icons';

function DepartamentoForm() {
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');

  const navigate = useNavigate();
  const { id } = useParams(); // Deteta se há um ID na rota (Edição)

  useEffect(() => {
    if (id) {
      // Se existe ID, busca os dados no Backend para preencher os campos
      api.get(`/departamentos/${id}`)
        .then(response => {
          setCodigo(response.data.codigo);
          setDescricao(response.data.descricao);
        })
        .catch(error => console.error("Erro ao buscar departamento:", error));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // Se tem ID, atualiza (PUT)
        await api.put(`/departamentos/${id}`, { codigo, descricao });
        alert('Departamento atualizado com sucesso!');
      } else {
        // Se não tem, cria um novo (POST)
        await api.post('/departamentos', { codigo, descricao });
        alert('Departamento cadastrado com sucesso!');
      }
      navigate('/departamentos'); // Volta para a tabela
    } catch (error) {
      console.error("Erro ao guardar:", error);
      alert('Erro ao guardar os dados do departamento. Verifique se o código já existe.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeaderRow}>
        <div>
          <h1>{id ? 'Editar Departamento' : 'Cadastro de Departamento'}</h1>
          <p className={styles.pageSubtitle}>
            {id ? 'Altere as informações deste departamento' : 'Adicione as informações do novo departamento'}
          </p>
        </div>
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.formCardTitle}>
          <IconInfo /> Informações Gerais
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <fieldset className={styles.fieldBox}>
              <legend className={styles.fieldLegend}>Descrição do Departamento</legend>
              <input
                className={styles.fieldInput}
                placeholder="Insira o nome do departamento"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </fieldset>

            <fieldset className={`${styles.fieldBox} ${styles.fieldBoxNarrow}`}>
              <legend className={styles.fieldLegend}>Código do Departamento</legend>
              <input
                className={styles.fieldInput}
                placeholder="0000000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
              />
            </fieldset>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnOutline} onClick={() => navigate('/departamentos')}>
              <IconClose /> Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {id ? <><IconSave /> Confirmar</> : <><IconCheck /> Confirmar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepartamentoForm;