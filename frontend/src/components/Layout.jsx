import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { IconUser, IconIdCard, IconBuilding, IconLogout } from './icons';
import { logout } from '../services/auth';
import styles from './Layout.module.css';

const navItems = [
  { to: '/funcionarios', label: 'Funcionário', Icon: IconUser },
  { to: '/cargos', label: 'Cargo', Icon: IconIdCard },
  { to: '/departamentos', label: 'Departamento', Icon: IconBuilding },
];

function Layout() {
  const navigate = useNavigate();

  const handleSair = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>X</div>

        <nav className={styles.nav}>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.spacer} />

        <button type="button" className={styles.logoutItem} onClick={handleSair}>
          <IconLogout size={22} />
          <span>Sair</span>
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;