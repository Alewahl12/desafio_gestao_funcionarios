import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DepartamentoList from './pages/DepartamentoList';
import DepartamentoForm from './pages/DepartamentoForm';
import CargoList from './pages/CargoList';
import CargoForm from './pages/CargoForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          {/* 👇 AGORA A PÁGINA INICIAL DA APLICAÇÃO É A DE FUNCIONÁRIOS 👇 */}
          <Route path="/" element={
            <div>
              <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>Funcionários</h2>
              <p>Módulo de Funcionários (Em construção... Pronto para ser o próximo passo!)</p>
            </div>
          } />
          
          {/* Rotas de Departamento */}
          <Route path="departamentos" element={<DepartamentoList />} />
          <Route path="departamentos/novo" element={<DepartamentoForm />} />
          <Route path="departamentos/editar/:id" element={<DepartamentoForm />} />

          {/* Rotas de Cargos */}
          <Route path="cargos" element={<CargoList />} />
          <Route path="cargos/novo" element={<CargoForm />} />
          <Route path="cargos/editar/:id" element={<CargoForm />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;