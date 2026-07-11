import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css';
import { IconInfo, IconClose, IconCheck, IconSave } from '../components/icons';

function CargoForm() {
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      api.get(`/cargos/${id}`)
        .then(response => {
          setCodigo(response.data.codigo);
          setDescricao(response.data.descricao);
        })
        .catch(error => console.error("Erro ao buscar cargo:", error));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/cargos/${id}`, { codigo, descricao });
        alert('Cargo atualizado com sucesso!');
      } else {
        await api.post('/cargos', { codigo, descricao });
        alert('Cargo cadastrado com sucesso!');
      }
      navigate('/cargos');
    } catch (error) {
      console.error("Erro ao guardar:", error);
      alert('Erro ao guardar os dados do cargo. Verifique se o código já existe.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeaderRow}>
        <div>
          <h1>{id ? 'Editar Cargo' : 'Cadastro de Cargo'}</h1>
          <p className={styles.pageSubtitle}>
            {id ? 'Altere as informações deste cargo' : 'Adicione as informações do novo cargo'}
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
              <legend className={styles.fieldLegend}>Descrição do Cargo</legend>
              <input
                className={styles.fieldInput}
                placeholder="Insira o nome do cargo"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </fieldset>

            <fieldset className={`${styles.fieldBox} ${styles.fieldBoxNarrow}`}>
              <legend className={styles.fieldLegend}>Código do Cargo</legend>
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
            <button type="button" className={styles.btnOutline} onClick={() => navigate('/cargos')}>
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

export default CargoForm;