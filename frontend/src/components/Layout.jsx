import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Menu Lateral (Sidebar) */}
      <aside style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>Sistema de Gestão</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Home</Link>
          <Link to="/departamentos" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Departamentos</Link>
          <Link to="/funcionarios" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Funcionários</Link>
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