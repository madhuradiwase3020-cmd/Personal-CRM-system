import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Building2, CalendarDays, CheckSquare, ChevronDown, CircleUserRound, LayoutDashboard, LogOut, Menu, NotebookPen, Settings, UsersRound, Waypoints, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Contacts', to: '/contacts', icon: UsersRound },
  { label: 'Companies', to: '/companies', icon: Building2 },
  { label: 'Interactions', to: '/interactions', icon: Waypoints },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Notes', to: '/notes', icon: NotebookPen },
  { label: 'Reports', to: '/reports', icon: Bell }
];

const titles = { '/': 'Overview', '/contacts': 'Your people', '/companies': 'Companies', '/interactions': 'Interactions', '/tasks': 'Tasks & follow-ups', '/calendar': 'Calendar', '/notes': 'Your notes', '/reports': 'Insights & reports', '/settings': 'Settings' };

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const title = location.pathname.startsWith('/contacts/') ? 'Contact profile' : titles[location.pathname] || 'Kindred';
  const signOut = () => { logout(); navigate('/login'); };
  return <div className="app-shell">
    {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Waypoints size={21} /></span><span>kindred<span className="brand-dot">.</span></span><button className="mobile-close icon-button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
      <div className="workspace-label">PERSONAL WORKSPACE</div>
      <nav className="side-nav">
        {navigation.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`} onClick={() => setMenuOpen(false)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Tasks' && <span className="nav-pill">→</span>}</NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><span className="tip-sparkle">✦</span><strong>Small moments matter</strong><p>Thoughtful connections start with remembering the little things.</p></div>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`} onClick={() => setMenuOpen(false)}><Settings size={18} /><span>Settings</span></NavLink>
        <button className="account-switcher" onClick={() => setProfileOpen(!profileOpen)}>
          <span className="avatar avatar-small">{user?.name?.slice(0, 1).toUpperCase() || 'Y'}</span><span className="account-copy"><strong>{user?.name || 'Your account'}</strong><small>Personal workspace</small></span><ChevronDown size={15} />
        </button>
        {profileOpen && <div className="account-menu"><button onClick={() => { navigate('/settings'); setProfileOpen(false); }}><CircleUserRound size={16} /> Account settings</button><button onClick={signOut}><LogOut size={16} /> Sign out</button></div>}
      </div>
    </aside>
    <div className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={21} /></button><div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{title}</strong></div><div className="topbar-actions"><div className="today-label"><span className="status-dot" /> Your relationships, in one place</div><span className="avatar">{user?.name?.slice(0, 1).toUpperCase() || 'Y'}</span></div></header>
      <main className="page-content"><Outlet /></main>
      <footer className="page-footer"><span>Made for meaningful connections</span><span>Kindred <span className="brand-dot">•</span> Personal CRM</span></footer>
    </div>
  </div>;
}
