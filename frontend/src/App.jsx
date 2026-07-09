import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DepartamentoList from './pages/DepartamentoList';
import DepartamentoForm from './pages/DepartamentoForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          <Route path="/" element={<h2 style={{ color: '#1e293b' }}>Bem-vindo ao Sistema</h2>} />
          
          {/* Rotas de Departamento */}
          <Route path="departamentos" element={<DepartamentoList />} />
          <Route path="departamentos/novo" element={<DepartamentoForm />} />
          <Route path="departamentos/editar/:id" element={<DepartamentoForm />} />

          <Route path="funcionarios" element={
            <div>
              <h2 style={{ color: '#1e293b' }}>Página de Funcionários</h2>
              <p>Em construção...</p>
            </div>
          } />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;