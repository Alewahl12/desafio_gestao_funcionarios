import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import styles from './Departamento.module.css';

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
      alert('Erro ao guardar os dados do departamento.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>{id ? 'Editar Departamento' : 'Novo Departamento'}</h1>
      </div>
      
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            className={styles.inputField}
            placeholder="Código (Ex: TI)" 
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
            <button type="button" className={styles.btnOutline} onClick={() => navigate('/departamentos')}>
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

export default DepartamentoForm;