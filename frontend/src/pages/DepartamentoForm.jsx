import { useState } from 'react';
import api from '../services/api';

function DepartamentoForm() {
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Fazendo a requisição POST para o seu backend Java
      await api.post('/departamentos', { codigo, descricao });
      
      alert('Departamento cadastrado com sucesso!');
      
      // Limpa os campos após salvar
      setCodigo('');
      setDescricao('');
      
      // Recarrega a página para atualizar a lista (solução simples para o momento)
      window.location.reload(); 
    } catch (error) {
      console.error("Erro ao salvar departamento:", error);
      alert('Erro ao cadastrar. Verifique o console.');
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h2>Novo Departamento</h2>
      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Código (Ex: TI)" 
          value={codigo} 
          onChange={(e) => setCodigo(e.target.value)} 
          required 
        />
        <input 
          placeholder="Descrição" 
          value={descricao} 
          onChange={(e) => setDescricao(e.target.value)} 
          required 
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default DepartamentoForm;