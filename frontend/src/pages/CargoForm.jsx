import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css';

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
      <div className={styles.pageHeader}>
        <h1>{id ? 'Editar Cargo' : 'Novo Cargo'}</h1>
      </div>
      
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            className={styles.inputField}
            placeholder="Código (Ex: DEV)" 
            value={codigo} 
            onChange={(e) => setCodigo(e.target.value)} 
            required 
          />
          <input 
            className={styles.inputField}
            placeholder="Descrição" 
            value={descricao} 
            onChange={(e) => setDescricao(e.target.value)} 
            required 
          />
          <div className={styles.formActions}>
            <button type="button" className={styles.btnOutline} onClick={() => navigate('/cargos')}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CargoForm;