import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { FiX, FiSave, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useModalA11y from '../hooks/useModalA11y';
import { expenseService } from '../services/api';

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Healthcare', 'Education', 'Utilities', 'Housing', 'Travel',
  'Personal Care', 'Other',
];

const PAYMENT_METHODS = ['Cash', 'SBI', 'KVB', 'Wallet'];

const defaultForm = {
  title: '',
  amount: '',
  category: 'Food & Dining',
  paymentMethod: 'Cash',
  type: 'expense',
  date: new Date().toISOString().split('T')[0],
  notes: '',
};

const ExpenseModal = ({ isOpen, onClose, editExpense, onSuccess }) => {
  const { addExpense, updateExpense } = useExpenses();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const modalRef = useModalA11y(isOpen, onClose);

  useEffect(() => {
    if (editExpense) {
      setForm({
        title: editExpense.title || '',
        amount: editExpense.amount || '',
        category: editExpense.category || 'Food & Dining',
        paymentMethod: editExpense.paymentMethod || 'Cash',
        type: editExpense.type || 'expense',
        date: editExpense.date ? new Date(editExpense.date).toISOString().split('T')[0] : defaultForm.date,
        notes: editExpense.notes || '',
      });
      // Editing an existing expense already has a deliberate category — don't auto-override it.
      setCategoryTouched(true);
    } else {
      setForm(defaultForm);
      setCategoryTouched(false);
    }
    setAutoDetected(false);
    setErrors({});
  }, [editExpense, isOpen]);

  // Debounced category auto-suggestion based on the title, for new/untouched expenses only.
  useEffect(() => {
    if (form.type !== 'expense' || categoryTouched || !form.title || form.title.trim().length < 3) {
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await expenseService.suggestCategory(form.title.trim());
        const suggested = res.data?.category;
        if (suggested && !categoryTouched) {
          setForm((f) => ({ ...f, category: suggested }));
          setAutoDetected(true);
        }
      } catch {
        // Best-effort suggestion only — silently ignore failures.
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form.title, form.type, categoryTouched]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.length < 2) errs.title = 'Title must be at least 2 characters';
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid positive amount';
    if (!form.category) errs.category = 'Category is required';
    if (!form.date) errs.date = 'Date is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
    if (name === 'category') {
      setCategoryTouched(true);
      setAutoDetected(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (editExpense) {
        await updateExpense(editExpense._id, form);
      } else {
        await addExpense(form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal slide-up"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-modal-title"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h3 className="modal-title" id="expense-modal-title">
            {editExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}
          </h3>
          <button id="modal-close-btn" className="modal-close" onClick={onClose} aria-label="Close dialog">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, background: 'var(--bg-input)', padding: 6, borderRadius: 'var(--radius-lg)' }}>
            <button
              type="button"
              className={`btn ${form.type === 'expense' ? 'btn-danger' : ''}`}
              style={{ flex: 1, border: 'none', background: form.type === 'expense' ? 'var(--danger)' : 'transparent', color: form.type === 'expense' ? 'white' : 'var(--text-secondary)' }}
              onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
            >
              Expense
            </button>
            <button
              type="button"
              className={`btn ${form.type === 'income' ? 'btn-success' : ''}`}
              style={{ flex: 1, border: 'none', background: form.type === 'income' ? '#10b981' : 'transparent', color: form.type === 'income' ? 'white' : 'var(--text-secondary)' }}
              onClick={() => {
                const incomeMethods = ['Cash', 'SBI', 'KVB', 'Wallet'];
                setForm(f => ({ 
                  ...f, 
                  type: 'income', 
                  category: 'Other',
                  paymentMethod: incomeMethods.includes(f.paymentMethod) ? f.paymentMethod : 'SBI'
                }));
              }}
            >
              Income / Savings
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              id="expense-title"
              className="form-control"
              type="text"
              name="title"
              placeholder={form.type === 'income' ? "e.g. Salary, Pocket Money" : "e.g. Grocery Shopping"}
              value={form.title}
              onChange={handleChange}
              maxLength={100}
            />
            {errors.title && <div className="form-error">⚠ {errors.title}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                id="expense-amount"
                className="form-control"
                type="number"
                name="amount"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
              />
              {errors.amount && <div className="form-error">⚠ {errors.amount}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                id="expense-date"
                className="form-control"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <div className="form-error">⚠ {errors.date}</div>}
            </div>
          </div>

          <div className="form-row">
            {form.type === 'expense' && (
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  id="expense-category"
                  className="form-control"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <div className="form-error">⚠ {errors.category}</div>}
                {autoDetected && !errors.category && (
                  <div className="form-hint auto-detect-hint">
                    <FiZap size={11} /> Auto-detected — change if wrong
                  </div>
                )}
              </div>
            )}

            <div className="form-group" style={{ flex: form.type === 'income' ? 'none' : 1, width: form.type === 'income' ? '100%' : 'auto', gridColumn: form.type === 'income' ? '1 / -1' : 'auto' }}>
              <label className="form-label">Account / Source *</label>
              <select
                id="expense-payment-method"
                className="form-control"
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
              >
                {(form.type === 'income' ? ['SBI', 'KVB', 'Wallet', 'Cash'] : PAYMENT_METHODS).map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              id="expense-notes"
              className="form-control"
              name="notes"
              placeholder="Add any additional notes..."
              value={form.notes}
              onChange={handleChange}
              rows={3}
              maxLength={300}
              style={{ resize: 'vertical', minHeight: 72 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              id="expense-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? (
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                <>
                  <FiSave size={14} />
                  {editExpense ? 'Update Expense' : 'Add Expense'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
