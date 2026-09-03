import React, { useState } from 'react';
import { FiMail, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const SCHEDULE_OPTIONS = [
  { value: 'off', label: 'Off', description: 'No scheduled statement emails' },
  { value: 'daily', label: 'Daily', description: 'Sent every day covering the last 24 hours' },
  { value: 'weekly', label: 'Weekly', description: 'Sent every week covering the last 7 days' },
  { value: 'monthly', label: 'Monthly', description: 'Sent every month covering the previous calendar month' },
];

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const [statementSchedule, setStatementSchedule] = useState(user?.statementSchedule || 'off');
  const [saving, setSaving] = useState(false);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateStatementSettings(statementSchedule);
      const updatedUser = res.data.user;

      if (typeof setUser === 'function') {
        setUser(updatedUser);
      }

      const existing = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...existing, ...updatedUser }));

      toast.success('Statement email preference saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save statement settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: 640 }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <FiMail size={18} />
          <h3 className="card-title" style={{ margin: 0 }}>Statement Emails</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, marginBottom: 16 }}>
          Get a PDF summary of your income and expenses emailed to you automatically.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {SCHEDULE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                htmlFor={`statement-schedule-${opt.value}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${statementSchedule === opt.value ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                }}
              >
                <input
                  id={`statement-schedule-${opt.value}`}
                  type="radio"
                  name="statementSchedule"
                  value={opt.value}
                  checked={statementSchedule === opt.value}
                  onChange={() => setStatementSchedule(opt.value)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  <strong style={{ display: 'block', fontSize: 14 }}>{opt.label}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.description}</span>
                </span>
              </label>
            ))}
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>
            <FiSave size={14} />
            {saving ? 'Saving...' : 'Save Preference'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
