import React, { useState, useEffect, useCallback } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import ExpenseModal from './ExpenseModal';
import BalanceModal from './BalanceModal';
import TransferModal from './TransferModal';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiFilter, FiRepeat,
  FiCopy, FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Healthcare', 'Education', 'Utilities', 'Housing', 'Travel', 'Personal Care', 'Other',
];

const categoryClass = {
  'Food & Dining': 'cat-food', Transportation: 'cat-transport', Shopping: 'cat-shopping',
  Entertainment: 'cat-entertainment', Healthcare: 'cat-healthcare', Education: 'cat-education',
  Utilities: 'cat-utilities', Housing: 'cat-housing', Travel: 'cat-travel',
  'Personal Care': 'cat-personal', Other: 'cat-other',
};

const formatAmount = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const createMonthOptions = () => {
  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
  const now = new Date();

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return {
      label: formatter.format(date),
      value: `${year}-${month}`,
      month,
      year,
    };
  });
};

const MONTH_OPTIONS = createMonthOptions();

const ExpenseTable = () => {
  const {
    expenses, pagination, loading, filters, setFilters, fetchExpenses, deleteExpense,
    bulkDeleteExpenses, bulkRecategorize,
  } = useExpenses();
  const [modalOpen, setModalOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [recategorizeOpen, setRecategorizeOpen] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const doFetch = useCallback((params = {}) => {
    fetchExpenses({ page: currentPage, ...params });
  }, [fetchExpenses, currentPage]);

  useEffect(() => {
    doFetch();
  }, [filters, currentPage]); // eslint-disable-line

  // Clear row selection whenever the underlying list changes (new page/filter/refetch)
  useEffect(() => {
    setSelectedIds([]);
  }, [expenses]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, setFilters]);

  const handleCategoryFilter = (cat) => {
    setFilters((f) => ({ ...f, category: cat }));
    setCurrentPage(1);
  };

  const handleMonthFilter = (value) => {
    const selected = MONTH_OPTIONS.find((option) => option.value === value);
    if (!selected) return;

    setFilters((f) => ({ ...f, month: selected.month, year: selected.year }));
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      doFetch();
    } catch {
      toast.error('Failed to delete expense');
    }
    setDeleteConfirm(null);
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditExpense(null);
    setModalOpen(true);
  };

  const onSuccess = () => { doFetch({ page: 1 }); setCurrentPage(1); };

  const toggleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map((e) => e._id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteExpenses(selectedIds);
      setSelectedIds([]);
      doFetch();
    } catch {
      toast.error('Failed to delete selected expenses');
    }
    setBulkDeleteConfirm(false);
  };

  const handleBulkRecategorize = async (category) => {
    try {
      await bulkRecategorize(selectedIds, category);
      setSelectedIds([]);
      doFetch();
    } catch {
      toast.error('Failed to update selected expenses');
    }
    setRecategorizeOpen(false);
  };

  const pages = Array.from({ length: pagination.pages }, (_, i) => i + 1);
  const selectedMonthValue = `${filters.year}-${filters.month}`;
  const selectedMonthLabel = MONTH_OPTIONS.find((option) => option.value === selectedMonthValue)?.label || 'Selected month';

  return (
    <div>
      {/* Filters Bar */}
      <div className="card expense-filters-card">
        <div className="filters-bar">
          {/* Search */}
          <div className="search-input-wrapper expense-search-wrap">
            <FiSearch className="search-icon" />
            <input
              id="expense-search"
              className="form-control search-input"
              placeholder="Search expenses..."
              aria-label="Search expenses"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="expense-filters-actions">
            {/* Category Filter */}
            <div className="category-filter-wrap">
              <FiFilter size={14} color="var(--text-muted)" />
              <select
                id="category-filter"
                className="category-filter-select"
                value={filters.category}
                onChange={(e) => handleCategoryFilter(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Month/Year filter */}
            <select
              id="month-filter"
              className="form-control filter-select"
              value={selectedMonthValue}
              onChange={(e) => handleMonthFilter(e.target.value)}
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <button id="set-balance-btn" className="btn btn-secondary" onClick={() => setBalanceModalOpen(true)}>
              🏦 Set Balances
            </button>
            <button id="transfer-btn" className="btn btn-secondary" onClick={() => setTransferModalOpen(true)}>
              <FiRepeat size={16} />
              Transfer
            </button>
            <button id="add-expense-btn" className="btn btn-primary" onClick={handleAddNew}>
              <FiPlus size={16} />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div
          className="card"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', marginBottom: 12, gap: 12, flexWrap: 'wrap',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedIds.length} selected</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <button
                id="bulk-recategorize-btn"
                className="btn btn-secondary btn-sm"
                onClick={() => setRecategorizeOpen((o) => !o)}
              >
                Recategorize ▾
              </button>
              {recategorizeOpen && (
                <div
                  className="card"
                  style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 20,
                    minWidth: 180, maxHeight: 260, overflowY: 'auto', padding: 6,
                  }}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <button
                      key={cat}
                      className="btn"
                      style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: '6px 8px' }}
                      onClick={() => handleBulkRecategorize(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              id="bulk-delete-btn"
              className="btn btn-danger btn-sm"
              onClick={() => setBulkDeleteConfirm(true)}
            >
              <FiTrash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">All Expenses</h3>
            <p className="card-subtitle">{selectedMonthLabel} - {pagination.total} record{pagination.total !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <h3>No expenses found</h3>
            <p>Start tracking your spending by adding your first expense.</p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <FiPlus size={16} />
              Add First Expense
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all expenses on this page"
                        checked={expenses.length > 0 && selectedIds.length === expenses.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>#</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp, idx) => (
                    <tr key={exp._id} className="fade-in">
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${exp.title}`}
                          checked={selectedIds.includes(exp._id)}
                          onChange={() => toggleSelectRow(exp._id)}
                        />
                      </td>
                      <td className="table-row-index">
                        {(currentPage - 1) * pagination.limit + idx + 1}
                      </td>
                      <td>
                        <span className="expense-title-text">{exp.title}</span>
                        {exp.isDuplicate && (
                          <span className="anomaly-flag anomaly-duplicate" title="Possible duplicate — a similar expense exists nearby in date, title and amount">
                            <FiCopy size={12} />
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge category-badge ${categoryClass[exp.category] || 'cat-other'}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="table-cell-secondary">{exp.paymentMethod || 'Cash'}</td>
                      <td className="table-cell-secondary">{formatDate(exp.date)}</td>
                      <td>
                        <span className={`amount-text ${exp.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                          {exp.type === 'income' ? '+' : '-'}{formatAmount(exp.amount)}
                        </span>
                        {exp.isUnusualAmount && (
                          <span className="anomaly-flag anomaly-unusual" title="Unusually high for this category compared to your average spend">
                            <FiAlertTriangle size={12} />
                          </span>
                        )}
                      </td>
                      <td className="table-cell-notes">
                        {exp.notes || '—'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            id={`edit-btn-${exp._id}`}
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => handleEdit(exp)}
                            title="Edit"
                            aria-label={`Edit ${exp.title}`}
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            id={`delete-btn-${exp._id}`}
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => setDeleteConfirm(exp._id)}
                            title="Delete"
                            aria-label={`Delete ${exp.title}`}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <FiChevronLeft />
                </button>
                {pages.map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${p === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="page-btn"
                  disabled={currentPage === pagination.pages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditExpense(null); }}
        editExpense={editExpense}
        onSuccess={onSuccess}
      />

      {/* Set Balances Modal */}
      <BalanceModal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        onSuccess={onSuccess}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={onSuccess}
      />

      {/* Bulk Delete Confirm Modal */}
      {bulkDeleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setBulkDeleteConfirm(false)}>
          <div className="modal slide-up delete-confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm delete selected expenses">
            <div className="delete-confirm-body">
              <div className="delete-confirm-icon">🗑️</div>
              <h3 className="delete-confirm-title">Delete {selectedIds.length} Expense{selectedIds.length !== 1 ? 's' : ''}?</h3>
              <p className="delete-confirm-text">
                This action cannot be undone.
              </p>
              <div className="delete-confirm-actions">
                <button className="btn btn-secondary" onClick={() => setBulkDeleteConfirm(false)}>
                  Cancel
                </button>
                <button
                  id="confirm-bulk-delete-btn"
                  className="btn btn-danger delete-confirm-btn"
                  onClick={handleBulkDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal slide-up delete-confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm delete expense">
            <div className="delete-confirm-body">
              <div className="delete-confirm-icon">🗑️</div>
              <h3 className="delete-confirm-title">Delete Expense?</h3>
              <p className="delete-confirm-text">
                This action cannot be undone.
              </p>
              <div className="delete-confirm-actions">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button
                  id="confirm-delete-btn"
                  className="btn btn-danger delete-confirm-btn"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;
