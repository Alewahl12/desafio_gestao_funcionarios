import DepartamentoList from './pages/DepartamentoList';
import DepartamentoForm from './pages/DepartamentoForm';

function App() {
  return (
    <div className="App" style={{ padding: '20px' }}>
      <h1>Sistema de Gestão</h1>
      <DepartamentoForm />
      <hr />
      <DepartamentoList />
    </div>
  );
}

export default App;