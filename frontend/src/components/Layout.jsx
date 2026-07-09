import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Menu Lateral (Sidebar) */}
      <aside style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>Sistema de Gestão</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Rota inicial agora aponta para / que será a tela de funcionários */}
          <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>
            Funcionários
          </Link>
          
          <Link to="/cargos" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>
            Cargos
          </Link>
          
          <Link to="/departamentos" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>
            Departamentos
          </Link>
        </nav>
      </aside>

      {/* Área Principal (Onde as telas vão aparecer) */}
      <main style={{ flex: 1, padding: '30px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
        <Outlet /> 
      </main>
      
    </div>
  );
}

export default Layout;