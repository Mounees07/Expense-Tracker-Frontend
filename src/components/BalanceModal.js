import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BalanceModal = ({ isOpen, onClose, onSuccess }) => {
  const { addExpense } = useExpenses();
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState({
    'SBI': '',
    'KVB': '',
    'Cash': '',
  });

  const handleChange = (e) => {
    setBalances({ ...balances, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create income transactions for any entered balances
      if (balances['SBI']) {
        await addExpense({ title: 'Initial Balance Update', amount: balances['SBI'], category: 'Other', paymentMethod: 'SBI', type: 'income', date: new Date().toISOString().split('T')[0] });
      }
      if (balances['KVB']) {
        await addExpense({ title: 'Initial Balance Update', amount: balances['KVB'], category: 'Other', paymentMethod: 'KVB', type: 'income', date: new Date().toISOString().split('T')[0] });
      }
      if (balances['Cash']) {
        await addExpense({ title: 'Initial Balance Update', amount: balances['Cash'], category: 'Other', paymentMethod: 'Cash', type: 'income', date: new Date().toISOString().split('T')[0] });
      }

      toast.success('In-hand balances updated!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to update balances');
    } finally {
      setLoading(false);
      setBalances({ 'SBI': '', 'KVB': '', 'Cash': '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal slide-up" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3 className="modal-title">🏦 Set In-Hand Balances</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div style={{ marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Quickly add your current in-hand amounts. This will add income records to your tracker so your total balances remain accurate.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Bank - SBI (₹)</label>
            <input
              className="form-control"
              type="number"
              name="SBI"
              placeholder="e.g. 50000"
              value={balances['SBI']}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bank - KVB (₹)</label>
            <input
              className="form-control"
              type="number"
              name="KVB"
              placeholder="e.g. 25000"
              value={balances['KVB']}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Wallet - Cash Amount (₹)</label>
            <input
              className="form-control"
              type="number"
              name="Cash"
              placeholder="e.g. 2000"
              value={balances['Cash']}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={loading} style={{ flex: 2, background: '#10b981', color: '#fff', border: 'none' }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><FiCheck /> Update Balances</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BalanceModal;
