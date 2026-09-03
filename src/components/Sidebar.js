import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid,
  FiPieChart,
  FiList,
  FiLogOut,
  FiBell,
  FiFileText,
  FiFlag,
  FiTarget,
  FiUpload,
  FiZap,
  FiSettings,
  FiCreditCard,
  FiCalendar,
  FiRepeat,
} from 'react-icons/fi';
import LogoMark from './LogoMark';

const navItems = [
  { id: 'overview', icon: <FiGrid />, label: 'Overview' },
  { id: 'expenses', icon: <FiList />, label: 'Expenses' },
  { id: 'analytics', icon: <FiPieChart />, label: 'Analytics' },
  { id: 'insights', icon: <FiZap />, label: 'AI Assistant' },
  { id: 'accounts', icon: <FiCreditCard />, label: 'Accounts' },
  { id: 'budgets', icon: <FiFlag />, label: 'Budgets' },
  { id: 'goals', icon: <FiTarget />, label: 'Goals' },
  { id: 'bills', icon: <FiCalendar />, label: 'Bills' },
  { id: 'recurring', icon: <FiRepeat />, label: 'Recurring' },
  { id: 'receipts', icon: <FiUpload />, label: 'Receipts' },
  { id: 'reports', icon: <FiFileText />, label: 'Reports' },
  { id: 'notifications', icon: <FiBell />, label: 'Notifications' },
  { id: 'settings', icon: <FiSettings />, label: 'Settings' },
];

const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const [flashId, setFlashId] = useState(null);
  const flashTimer = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Hover/:focus alone don't reliably reveal the tooltip on click in every
  // browser (Safari in particular doesn't move keyboard focus to a button on
  // mouse click), so briefly flash the tooltip via JS on any click/tap too.
  const flashTooltip = useCallback((id) => {
    setFlashId(id);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashId(null), 1400);
  }, []);

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
    flashTooltip(id);
  };

  return (
    <>
      {/* Backdrop for mobile slide-out sidebar */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo mark only on desktop rail; full lockup shown on mobile via CSS */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <LogoMark size={22} />
          </div>
          <div className="sidebar-logo-text">
            <h2>ExpenseTracker</h2>
            <span>Personal Finance</span>
          </div>
        </div>

        {/* Navigation: icon-only rail on desktop, with hover tooltip; labeled list on mobile */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-link ${activeTab === item.id ? 'active' : ''} ${flashId === item.id ? 'tooltip-flash' : ''}`}
              onClick={() => handleNav(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
              aria-label={item.label}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
              <span className="nav-tooltip" role="tooltip">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User section: avatar + logout, pinned at bottom */}
        <div className="sidebar-user">
          <div className="user-avatar" title={user?.name || 'User'}>
            {getInitials(user?.name)}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
          <button
            className={`logout-btn ${flashId === 'logout' ? 'tooltip-flash' : ''}`}
            onClick={() => { flashTooltip('logout'); logout(); }}
            id="logout-btn"
            aria-label="Log out"
          >
            <FiLogOut />
            <span className="nav-tooltip" role="tooltip">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
