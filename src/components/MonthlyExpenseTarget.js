import React, { useEffect, useMemo, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiEdit2, FiTarget, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { financeService } from '../services/api';
import { useExpenses } from '../context/ExpenseContext';

const formatAmount = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

const MonthlyExpenseTarget = () => {
  const { filters } = useExpenses();
  const [targetData, setTargetData] = useState(null);
  const [amount, setAmount] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const month = Number(filters.month || new Date().getMonth() + 1);
  const year = Number(filters.year || new Date().getFullYear());

  const monthLabel = useMemo(() => {
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date);
  }, [month, year]);

  const loadTarget = async () => {
    setLoading(true);
    try {
      const res = await financeService.getMonthlyExpenseTarget({ month, year });
      setTargetData(res.data.data);
      setAmount(res.data.data.target ? String(Math.round(res.data.data.target)) : '');
      setEditing(!res.data.data.target);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load monthly target');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTarget();
  }, [month, year]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await financeService.setMonthlyExpenseTarget({ month, year, amount });
      toast.success('Monthly expense target saved');
      setEditing(false);
      loadTarget();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save target');
    } finally {
      setSaving(false);
    }
  };

  const utilization = targetData?.utilization || 0;
  const progress = Math.min(utilization, 100);
  const exceeded = targetData?.exceeded;
  const hasTarget = Boolean(targetData?.target);

  const handleEdit = () => {
    setAmount(hasTarget ? String(Math.round(targetData.target)) : '');
    setEditing(true);
  };

  const handleCancel = () => {
    setAmount(hasTarget ? String(Math.round(targetData.target)) : '');
    setEditing(false);
  };

  return (
    <section className="monthly-target-card">
      <div className="monthly-target-header">
        <span className="monthly-target-icon"><FiTarget /></span>
        <div>
          <h3>Monthly Expenses Target</h3>
          <p>{monthLabel}</p>
        </div>
      </div>

      {loading ? (
        <div className="skeleton-list"><span /><span /></div>
      ) : (
        <>
          <div className="monthly-target-metrics">
            <div>
              <span>Target</span>
              <strong>{formatAmount(targetData?.target)}</strong>
            </div>
            <div>
              <span>Spent</span>
              <strong>{formatAmount(targetData?.spent)}</strong>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{formatAmount(targetData?.remaining)}</strong>
            </div>
          </div>

          <div className="target-progress-track">
            <div
              className={`target-progress-fill ${exceeded ? 'exceeded' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className={`target-status ${exceeded ? 'danger' : 'ok'}`}>
            {exceeded ? <FiAlertTriangle /> : <FiCheckCircle />}
            <span>{targetData?.target ? `${utilization}% used` : 'Set a target to start tracking monthly spending'}</span>
          </div>

          {editing ? (
            <form className="monthly-target-form" onSubmit={handleSubmit}>
              <input
                className="form-control"
                type="number"
                min="1"
                step="1"
                placeholder="Set monthly expenses target"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                autoFocus
              />
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : hasTarget ? 'Update Target' : 'Save Target'}
              </button>
              {hasTarget && (
                <button className="btn btn-secondary" type="button" onClick={handleCancel} disabled={saving}>
                  <FiX size={14} />
                  Cancel
                </button>
              )}
            </form>
          ) : (
            <div className="monthly-target-actions">
              <button className="btn btn-secondary" type="button" onClick={handleEdit}>
                <FiEdit2 size={14} />
                Edit Target
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default MonthlyExpenseTarget;
