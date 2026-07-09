import { useEffect, useState } from 'react';
import api from '../services/api';

function DepartamentoList() {
  const [departamentos, setDepartamentos] = useState([]);

  useEffect(() => {
    // Buscando os dados da sua API Java
    api.get('/departamentos')
      .then(response => {
        setDepartamentos(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar departamentos:", error);
      });
  }, []);

  return (
    <div>
      <h1>Lista de Departamentos</h1>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {departamentos.length > 0 ? (
            departamentos.map((dep) => (
              <tr key={dep.id}>
                <td>{dep.codigo}</td>
                <td>{dep.descricao}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" style={{ textAlign: 'center' }}>
                Nenhum departamento cadastrado no momento.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartamentoList;