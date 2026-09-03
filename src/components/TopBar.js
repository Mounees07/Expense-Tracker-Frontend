import React from 'react';
import { FiSun, FiMoon, FiMenu, FiDownload, FiPrinter, FiBell } from 'react-icons/fi';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

const titleMap = {
  expenses: <><span className="hidden-mobile">My </span>Expenses</>,
  analytics: <>Analytics <span className="hidden-mobile">& Reports</span></>,
  insights: <>AI <span className="hidden-mobile">Finance </span>Assistant</>,
  accounts: 'Accounts',
  budgets: 'Budget Planning',
  goals: 'Savings Goals',
  bills: 'Bills & Reminders',
  recurring: 'Recurring Transactions',
  receipts: 'Receipt Management',
  reports: 'Reports',
  notifications: 'Notifications',
  settings: 'Settings',
};

const subtitleMap = {
  expenses: 'All your expense records',
  analytics: 'Visual breakdown of your finances',
  insights: 'Automatic insights and finance questions',
  accounts: 'Track banks, wallets, cash and UPI',
  budgets: 'Plan monthly and category-wise limits',
  goals: 'Monitor targets and saving progress',
  bills: 'Never miss due dates again',
  recurring: 'Automate repeating payments',
  receipts: 'Store image and PDF proof',
  reports: 'Generate financial exports',
  notifications: 'Budget, bill and goal alerts',
  settings: 'Manage your account preferences',
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const TopBar = ({ darkMode, toggleDark, activeTab, onMobileMenu }) => {
  const { exportCSV, exportPDF } = useExpenses();
  const { user } = useAuth();

  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();

  const isOverview = activeTab === 'overview';
  const firstName = (user?.name || '').split(' ')[0] || 'there';

  return (
    <div className="topbar">
      <button
        id="mobile-hamburger"
        className="hamburger-btn"
        onClick={onMobileMenu}
        aria-label="Open navigation menu"
      >
        <FiMenu size={22} />
      </button>

      <div className="topbar-left">
        <span className="overview-date">{dateLabel}</span>
        {isOverview ? (
          <h1 className="overview-greeting">{getGreeting()}, {firstName}</h1>
        ) : (
          <>
            <h1 className="overview-greeting">{titleMap[activeTab] || 'Dashboard'}</h1>
            <p className="hidden-mobile topbar-subtitle">{subtitleMap[activeTab] || ''}</p>
          </>
        )}
      </div>

      <div className="topbar-right">
        {(activeTab === 'expenses' || activeTab === 'overview') && (
          <>
            <button
              id="export-pdf-btn"
              className="btn btn-secondary btn-sm"
              onClick={exportPDF}
              title="Print / PDF"
              aria-label="Print or export as PDF"
            >
              <FiPrinter size={16} />
              <span className="hidden-mobile">Print / PDF</span>
            </button>

            <button
              id="export-csv-btn"
              className="btn btn-secondary btn-sm"
              onClick={exportCSV}
              title="Export CSV"
              aria-label="Export as CSV"
            >
              <FiDownload size={16} />
              <span className="hidden-mobile">Export CSV</span>
            </button>
          </>
        )}

        <button className="overview-bell-btn" aria-label="Notifications" title="Notifications">
          <FiBell size={18} />
        </button>

        <div className="topbar-toggle-group">
          <FiSun size={14} color="var(--text-muted)" />
          <button
            id="dark-mode-toggle"
            className={`dark-mode-toggle ${darkMode ? 'active' : ''}`}
            onClick={toggleDark}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={darkMode}
          />
          <FiMoon size={14} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
