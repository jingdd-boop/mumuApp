import { NavLink, Outlet, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/record', label: '记录', icon: '📝' },
  { path: '/learn', label: '知识', icon: '📚' },
  { path: '/mine', label: '我的', icon: '👤' },
];

function isStandalonePath(pathname) {
  return (
    pathname === '/onboarding' ||
    pathname.startsWith('/record-add') ||
    pathname === '/daily-guide' ||
    pathname.startsWith('/learn/') ||
    pathname === '/settings' ||
    pathname.startsWith('/legal/')
  );
}

export function Layout() {
  const location = useLocation();
  const isStandalone = isStandalonePath(location.pathname);

  if (isStandalone) {
    return (
      <div className="main-area" style={{ marginLeft: 0 }}>
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>🌸</span>
          沐沐记
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-area">
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
