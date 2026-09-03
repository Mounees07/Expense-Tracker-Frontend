import React, { useEffect, useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import {
  FiSearch, FiShoppingBag, FiTruck, FiFilm, FiHeart, FiBook, FiZap,
  FiHome, FiMapPin, FiUser, FiMoreHorizontal, FiCoffee,
} from 'react-icons/fi';

const RECENT_LIMIT = 15;

const categoryMeta = {
  'Food & Dining': { cls: 'cat-food', icon: <FiCoffee /> },
  Transportation: { cls: 'cat-transport', icon: <FiTruck /> },
  Shopping: { cls: 'cat-shopping', icon: <FiShoppingBag /> },
  Entertainment: { cls: 'cat-entertainment', icon: <FiFilm /> },
  Healthcare: { cls: 'cat-healthcare', icon: <FiHeart /> },
  Education: { cls: 'cat-education', icon: <FiBook /> },
  Utilities: { cls: 'cat-utilities', icon: <FiZap /> },
  Housing: { cls: 'cat-housing', icon: <FiHome /> },
  Travel: { cls: 'cat-travel', icon: <FiMapPin /> },
  'Personal Care': { cls: 'cat-personal', icon: <FiUser /> },
  Other: { cls: 'cat-other', icon: <FiMoreHorizontal /> },
};

const formatAmount = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const formatDateHeader = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

const ActivityFeed = () => {
  const { expenses, pagination, loading, filters, setFilters, fetchExpenses } = useExpenses();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    fetchExpenses({ page: 1, limit: RECENT_LIMIT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search — same pattern as ExpenseTable.js, reusing the shared
  // ExpenseContext filters/search wiring instead of a parallel fetch.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    fetchExpenses({ page: 1, limit: RECENT_LIMIT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const grouped = useMemo(() => {
    const groups = [];
    const byDay = new Map();
    expenses.slice(0, RECENT_LIMIT).forEach((exp) => {
      const dayKey = new Date(exp.date).toDateString();
      if (!byDay.has(dayKey)) {
        const arr = [];
        byDay.set(dayKey, arr);
        groups.push({ key: dayKey, label: formatDateHeader(exp.date), items: arr });
      }
      byDay.get(dayKey).push(exp);
    });
    return groups;
  }, [expenses]);

  return (
    <div className="activity-card">
      <div className="activity-header">
        <div>
          <h3 className="card-title">Activity</h3>
          <p className="card-subtitle">{pagination.total || expenses.length} transactions this month</p>
        </div>
        <div className="search-input-wrapper activity-search-wrap">
          <FiSearch className="search-icon" />
          <input
            className="form-control search-input activity-search-input"
            placeholder="Search transactions..."
            aria-label="Search transactions"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="skeleton-list">
          <span /><span /><span />
        </div>
      ) : grouped.length === 0 ? (
        <div className="empty-state empty-state-small">
          <div className="empty-state-icon">💸</div>
          <h3>No transactions found</h3>
          <p>Try a different search or add a new expense.</p>
        </div>
      ) : (
        <div className="activity-groups">
          {grouped.map((group) => (
            <div className="activity-group" key={group.key}>
              <div className="activity-date-header">{group.label}</div>
              {group.items.map((exp) => {
                const meta = categoryMeta[exp.category] || categoryMeta.Other;
                return (
                  <div className="activity-row" key={exp._id}>
                    <div className={`activity-avatar ${meta.cls}`}>{meta.icon}</div>
                    <div className="activity-row-main">
                      <div className="activity-row-title">{exp.title}</div>
                      <div className="activity-row-sub">{exp.category} · {exp.paymentMethod || 'Cash'}</div>
                    </div>
                    <div className={`activity-row-amount ${exp.type === 'income' ? 'amount-income' : 'amount-expense-neg'}`}>
                      {exp.type === 'income' ? '+' : '−'}{formatAmount(exp.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
