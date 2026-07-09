import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DepartamentoList from './pages/DepartamentoList';
import DepartamentoForm from './pages/DepartamentoForm';
import CargoList from './pages/CargoList';
import CargoForm from './pages/CargoForm';
import FuncionarioList from './pages/FuncionarioList';
// Nova importação:
import FuncionarioForm from './pages/FuncionarioForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          {/* Rotas de Funcionário */}
          <Route path="/" element={<FuncionarioList />} />
          <Route path="funcionarios" element={<FuncionarioList />} />
          <Route path="funcionarios/novo" element={<FuncionarioForm />} />
          <Route path="funcionarios/editar/:id" element={<FuncionarioForm />} />
          
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