import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { FiX, FiRepeat } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useModalA11y from '../hooks/useModalA11y';

const PAYMENT_METHODS = ['Cash', 'GPay', 'PhonePe', 'Paytm', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Wallet', 'SBI', 'KVB', 'Other'];

const defaultForm = {
  fromPaymentMethod: 'SBI',
  toPaymentMethod: 'Cash',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
};

const TransferModal = ({ isOpen, onClose, onSuccess }) => {
  const { createTransfer } = useExpenses();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const modalRef = useModalA11y(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setForm(defaultForm);
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid positive amount';
    if (!form.date) errs.date = 'Date is required';
    if (form.fromPaymentMethod === form.toPaymentMethod) errs.toPaymentMethod = 'From and To accounts must be different';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: null }));
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
      await createTransfer(form);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete transfer');
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
        aria-labelledby="transfer-modal-title"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h3 className="modal-title" id="transfer-modal-title">
            <FiRepeat size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Transfer Between Accounts
          </h3>
          <button id="transfer-modal-close-btn" className="modal-close" onClick={onClose} aria-label="Close dialog">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">From Account *</label>
              <select
                id="transfer-from"
                className="form-control"
                name="fromPaymentMethod"
                value={form.fromPaymentMethod}
                onChange={handleChange}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">To Account *</label>
              <select
                id="transfer-to"
                className="form-control"
                name="toPaymentMethod"
                value={form.toPaymentMethod}
                onChange={handleChange}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.toPaymentMethod && <div className="form-error">⚠ {errors.toPaymentMethod}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                id="transfer-amount"
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
                id="transfer-date"
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

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              id="transfer-notes"
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
              id="transfer-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? (
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                <>
                  <FiRepeat size={14} />
                  Transfer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
