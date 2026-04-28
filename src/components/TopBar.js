import React from 'react';
import { FiSun, FiMoon, FiMenu, FiDownload, FiPrinter } from 'react-icons/fi';
import { useExpenses } from '../context/ExpenseContext';

const titleMap = {
  overview: 'Dashboard Overview',
  expenses: 'My Expenses',
  analytics: 'Analytics & Reports',
};

const subtitleMap = {
  overview: 'Track and manage your spending',
  expenses: 'All your expense records',
  analytics: 'Visual breakdown of your finances',
};

const TopBar = ({ darkMode, toggleDark, activeTab, onMobileMenu }) => {
  const { exportCSV, exportPDF } = useExpenses();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          id="mobile-hamburger"
          className="hamburger-btn"
          onClick={onMobileMenu}
        >
          <FiMenu size={22} />
        </button>
        <div className="topbar-left">
          <h1>{titleMap[activeTab] || 'Dashboard'}</h1>
          <p className="hidden-mobile">{subtitleMap[activeTab] || ''}</p>
        </div>
      </div>

      <div className="topbar-right">
        <span className="topbar-date" style={{ display: window.innerWidth > 640 ? 'block' : 'none' }}>
          {today}
        </span>

        <button
          id="export-pdf-btn"
          className="btn btn-secondary btn-sm"
          onClick={exportPDF}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          title="Print / PDF"
        >
          <FiPrinter size={16} />
          <span className="hidden-mobile">Print / PDF</span>
        </button>

        <button
          id="export-csv-btn"
          className="btn btn-secondary btn-sm"
          onClick={exportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          title="Export CSV"
        >
          <FiDownload size={16} />
          <span className="hidden-mobile">Export CSV</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiSun size={14} color="var(--text-muted)" />
          <button
            id="dark-mode-toggle"
            className={`dark-mode-toggle ${darkMode ? 'active' : ''}`}
            onClick={toggleDark}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          />
          <FiMoon size={14} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
