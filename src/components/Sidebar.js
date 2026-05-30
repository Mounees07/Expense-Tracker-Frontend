import React from 'react';
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
} from 'react-icons/fi';
import LogoMark from './LogoMark';

const navItems = [
  { id: 'overview', icon: <FiGrid />, label: 'Overview' },
  { id: 'expenses', icon: <FiList />, label: 'Expenses' },
  { id: 'analytics', icon: <FiPieChart />, label: 'Analytics' },
  { id: 'insights', icon: <FiZap />, label: 'AI Assistant' },
  { id: 'budgets', icon: <FiFlag />, label: 'Budgets' },
  { id: 'goals', icon: <FiTarget />, label: 'Goals' },
  { id: 'bills', icon: <FiBell />, label: 'Bills' },
  { id: 'receipts', icon: <FiUpload />, label: 'Receipts' },
  { id: 'reports', icon: <FiFileText />, label: 'Reports' },
];

const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Hamburger for mobile (rendered in topbar, but for mobile sidebar toggle) */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <LogoMark size={28} />
          </div>
          <div>
            <h2>ExpenseTracker</h2>
            <span>Personal Finance</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-title">Menu</span>
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="sidebar-user">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout" id="logout-btn">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* Mobile toggle removed, handled via props and DashboardPage */}
    </>
  );
};

export default Sidebar;
