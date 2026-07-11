import { NavLink, Outlet } from 'react-router-dom';
import { IconUser, IconIdCard, IconBuilding } from './icons';
import styles from './Layout.module.css';

const navItems = [
  { to: '/funcionarios', label: 'Funcionário', Icon: IconUser },
  { to: '/cargos', label: 'Cargo', Icon: IconIdCard },
  { to: '/departamentos', label: 'Departamento', Icon: IconBuilding },
];

function Layout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>A</div>

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
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;