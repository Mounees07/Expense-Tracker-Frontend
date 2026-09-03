import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { financeService } from '../services/api';
import { useExpenses } from '../context/ExpenseContext';
import { getChartTheme, getTooltipOptions, getScaleOptions } from '../utils/chartTheme';
import toast from 'react-hot-toast';
import {
  FiAlertCircle,
  FiBell,
  FiCalendar,
  FiCreditCard,
  FiDownload,
  FiFileText,
  FiFlag,
  FiRefreshCw,
  FiSave,
  FiTarget,
  FiTrendingUp,
  FiUpload,
  FiZap,
} from 'react-icons/fi';

const money = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

const moduleConfig = {
  accounts: {
    title: 'Account Management',
    subtitle: 'Banks, wallets, cash, UPI and balance tracking',
    icon: FiCreditCard,
    fields: [
      { name: 'name', label: 'Account Name', placeholder: 'SBI Savings' },
      { name: 'type', label: 'Type', type: 'select', options: ['bank', 'wallet', 'cash', 'upi'] },
      { name: 'openingBalance', label: 'Opening Balance', type: 'number', placeholder: '0' },
      { name: 'currentBalance', label: 'Current Balance', type: 'number', placeholder: '0' },
    ],
    summary: (item) => `${item.type} - ${money(item.currentBalance)}`,
  },
  budgets: {
    title: 'Budget Planning',
    subtitle: 'Monthly and category limits with utilization alerts',
    icon: FiFlag,
    fields: [
      { name: 'name', label: 'Budget Name', placeholder: 'Monthly Essentials' },
      { name: 'category', label: 'Category', placeholder: 'Food & Dining' },
      { name: 'month', label: 'Month', type: 'number', placeholder: '5' },
      { name: 'year', label: 'Year', type: 'number', placeholder: '2026' },
      { name: 'amount', label: 'Budget Amount', type: 'number', placeholder: '12000' },
      { name: 'alertThreshold', label: 'Alert %', type: 'number', placeholder: '80' },
      { name: 'rolloverEnabled', label: 'Roll Over Unspent', type: 'select', options: ['false', 'true'] },
    ],
    summary: (item) => `${item.category} - ${money(item.amount)} limit`,
  },
  goals: {
    title: 'Savings Goals',
    subtitle: 'Targets, progress tracking and completion status',
    icon: FiTarget,
    fields: [
      { name: 'name', label: 'Goal Name', placeholder: 'Laptop Fund' },
      { name: 'targetAmount', label: 'Target Amount', type: 'number', placeholder: '70000' },
      { name: 'savedAmount', label: 'Saved Amount', type: 'number', placeholder: '15000' },
      { name: 'targetDate', label: 'Target Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'paused'] },
    ],
    summary: (item) => `${money(item.savedAmount)} saved of ${money(item.targetAmount)}`,
  },
  bills: {
    title: 'Bills & Reminders',
    subtitle: 'Due dates, reminder status and overdue alerts',
    icon: FiBell,
    fields: [
      { name: 'name', label: 'Bill Name', placeholder: 'Internet Bill' },
      { name: 'amount', label: 'Amount', type: 'number', placeholder: '999' },
      { name: 'dueDate', label: 'Due Date', type: 'date' },
      { name: 'reminderStatus', label: 'Status', type: 'select', options: ['pending', 'sent', 'paid', 'overdue'] },
      { name: 'notes', label: 'Notes', placeholder: '3 days before reminder' },
    ],
    summary: (item) => `${money(item.amount)} due on ${item.dueDate}`,
  },
  recurring: {
    title: 'Recurring Transactions',
    subtitle: 'Automate daily, weekly, monthly and yearly entries',
    icon: FiRefreshCw,
    fields: [
      { name: 'title', label: 'Title', placeholder: 'Rent' },
      { name: 'amount', label: 'Amount', type: 'number', placeholder: '15000' },
      { name: 'type', label: 'Type', type: 'select', options: ['expense', 'income'] },
      { name: 'category', label: 'Category', placeholder: 'Housing' },
      { name: 'account', label: 'Account', placeholder: 'SBI' },
      { name: 'frequency', label: 'Frequency', type: 'select', options: ['daily', 'weekly', 'monthly', 'yearly'] },
      { name: 'nextRunDate', label: 'Next Run', type: 'date' },
    ],
    summary: (item) => `${item.frequency} ${item.type} - ${money(item.amount)}`,
  },
  receipts: {
    title: 'Receipt Management',
    subtitle: 'Image/PDF metadata with preview and download URLs',
    icon: FiUpload,
    fields: [
      { name: 'fileName', label: 'File Name', placeholder: 'grocery-receipt.pdf' },
      { name: 'fileUrl', label: 'File URL', placeholder: 'https://...' },
      { name: 'fileType', label: 'File Type', type: 'select', options: ['image', 'pdf'] },
      { name: 'transactionId', label: 'Transaction ID', type: 'number', placeholder: 'Optional' },
    ],
    summary: (item) => `${item.fileType} - ${item.fileName}`,
  },
  reports: {
    title: 'Reports',
    subtitle: 'Download exports for a specific date, month, year or range',
    icon: FiFileText,
    fields: [
      { name: 'title', label: 'Report Title', placeholder: 'May 2026 Report' },
      { name: 'type', label: 'Type', type: 'select', options: ['monthly', 'yearly', 'category', 'income', 'savings'] },
      { name: 'periodStart', label: 'Start Date', type: 'date' },
      { name: 'periodEnd', label: 'End Date', type: 'date' },
      { name: 'format', label: 'Format', type: 'select', options: ['pdf', 'csv', 'excel'] },
    ],
    summary: (item) => `${item.type} report - ${item.format?.toUpperCase()}`,
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Budget, goal, bill and monthly summary alerts',
    icon: FiAlertCircle,
    fields: [
      { name: 'title', label: 'Title', placeholder: 'Budget Alert' },
      { name: 'message', label: 'Message', placeholder: 'Food budget crossed 80%' },
      { name: 'type', label: 'Type', type: 'select', options: ['budget', 'goal', 'bill', 'summary', 'system'] },
    ],
    summary: (item) => `${item.type} - ${item.message}`,
  },
};

const defaultValueFor = (field) => {
  if (field.type === 'select') return field.options[0];
  if (field.type === 'number') return '';
  if (field.type === 'date') return new Date().toISOString().slice(0, 10);
  return '';
};

const buildInitialForm = (fields) =>
  fields.reduce((form, field) => ({ ...form, [field.name]: defaultValueFor(field) }), {});

const today = () => new Date().toISOString().slice(0, 10);

const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthRange = (monthValue) => {
  const [year, month] = monthValue.split('-').map(Number);
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
  return { month, year, startDate: `${monthValue}-01`, endDate };
};

const reportTypeToExpenseType = (type) => {
  if (type === 'income') return 'income';
  if (type === 'savings') return undefined;
  return undefined;
};

const ReportsModule = () => {
  const config = moduleConfig.reports;
  const Icon = config.icon;
  const { exportCSV, exportPDF } = useExpenses();
  const [downloading, setDownloading] = useState('');
  const [form, setForm] = useState({
    title: 'Monthly Report',
    type: 'monthly',
    periodMode: 'month',
    reportDate: today(),
    reportMonth: currentMonthValue(),
    reportYear: new Date().getFullYear(),
    periodStart: today(),
    periodEnd: today(),
    format: 'pdf',
  });

  const buildReportParams = () => {
    if (form.periodMode === 'date') {
      return { startDate: form.reportDate, endDate: form.reportDate };
    }

    if (form.periodMode === 'month') {
      return getMonthRange(form.reportMonth);
    }

    if (form.periodMode === 'year') {
      return { year: form.reportYear };
    }

    return { startDate: form.periodStart, endDate: form.periodEnd };
  };

  const buildReportRecord = () => {
    const params = buildReportParams();
    let periodStart = params.startDate;
    let periodEnd = params.endDate;

    if (form.periodMode === 'year') {
      periodStart = `${form.reportYear}-01-01`;
      periodEnd = `${form.reportYear}-12-31`;
    }

    return {
      title: form.title,
      type: form.type,
      periodStart,
      periodEnd,
      format: form.format,
    };
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await financeService.create('reports', buildReportRecord());
      toast.success('Report saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save report');
    }
  };

  const handleDownload = async (format) => {
    setDownloading(format);
    try {
      const params = {
        ...buildReportParams(),
        type: reportTypeToExpenseType(form.type),
      };
      if (format === 'csv') {
        await exportCSV(params);
      } else {
        await exportPDF(params);
      }
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="finance-grid finance-grid-single">
      <section className="finance-panel">
        <div className="finance-panel-header">
          <span className="finance-icon"><Icon /></span>
          <div>
            <h3>{config.title}</h3>
            <p>{config.subtitle}</p>
          </div>
        </div>

        <form className="finance-form" onSubmit={handleSave}>
          <label className="finance-field">
            <span>Report Title</span>
            <input
              className="form-control"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </label>

          <label className="finance-field">
            <span>Type</span>
            <select
              className="form-control"
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
            >
              {config.fields.find((field) => field.name === 'type').options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="finance-field">
            <span>Download For</span>
            <select
              className="form-control"
              value={form.periodMode}
              onChange={(event) => setForm((current) => ({ ...current, periodMode: event.target.value }))}
            >
              <option value="date">Specific date</option>
              <option value="month">Specific month</option>
              <option value="year">Full year</option>
              <option value="range">Custom range</option>
            </select>
          </label>

          {form.periodMode === 'date' && (
            <label className="finance-field">
              <span>Date</span>
              <input
                className="form-control"
                type="date"
                value={form.reportDate}
                onChange={(event) => setForm((current) => ({ ...current, reportDate: event.target.value }))}
              />
            </label>
          )}

          {form.periodMode === 'month' && (
            <label className="finance-field">
              <span>Month</span>
              <input
                className="form-control"
                type="month"
                value={form.reportMonth}
                onChange={(event) => setForm((current) => ({ ...current, reportMonth: event.target.value }))}
              />
            </label>
          )}

          {form.periodMode === 'year' && (
            <label className="finance-field">
              <span>Year</span>
              <input
                className="form-control"
                type="number"
                min="1970"
                max="2100"
                value={form.reportYear}
                onChange={(event) => setForm((current) => ({ ...current, reportYear: event.target.value }))}
              />
            </label>
          )}

          {form.periodMode === 'range' && (
            <>
              <label className="finance-field">
                <span>Start Date</span>
                <input
                  className="form-control"
                  type="date"
                  value={form.periodStart}
                  onChange={(event) => setForm((current) => ({ ...current, periodStart: event.target.value }))}
                />
              </label>
              <label className="finance-field">
                <span>End Date</span>
                <input
                  className="form-control"
                  type="date"
                  value={form.periodEnd}
                  onChange={(event) => setForm((current) => ({ ...current, periodEnd: event.target.value }))}
                />
              </label>
            </>
          )}

          <button className="btn btn-secondary" type="submit">
            <FiSave size={14} />
            Save Report
          </button>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!!downloading}
            onClick={() => handleDownload('pdf')}
          >
            <FiDownload size={14} />
            {downloading === 'pdf' ? 'Downloading...' : 'Download PDF'}
          </button>
          <button
            className="btn btn-success"
            type="button"
            disabled={!!downloading}
            onClick={() => handleDownload('csv')}
          >
            <FiDownload size={14} />
            {downloading === 'csv' ? 'Downloading...' : 'Download CSV'}
          </button>
        </form>
      </section>
    </div>
  );
};

const GenericResourceModule = ({ resource }) => {
  const config = moduleConfig[resource];
  const Icon = config.icon;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(() => buildInitialForm(config.fields));

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await financeService.list(resource);
      setItems(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to load ${config.title}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [resource]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await financeService.create(resource, form);
      toast.success(`${config.title} item saved`);
      setForm(buildInitialForm(config.fields));
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save item');
    }
  };

  return (
    <div className="finance-grid">
      <section className="finance-panel">
        <div className="finance-panel-header">
          <span className="finance-icon"><Icon /></span>
          <div>
            <h3>{config.title}</h3>
            <p>{config.subtitle}</p>
          </div>
        </div>

        <form className="finance-form" onSubmit={handleSubmit}>
          {config.fields.map((field) => (
            <label key={field.name} className="finance-field">
              <span>{field.label}</span>
              {field.type === 'select' ? (
                <select
                  className="form-control"
                  value={form[field.name] || ''}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                >
                  {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input
                  className="form-control"
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={form[field.name] || ''}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              )}
            </label>
          ))}
          <button className="btn btn-primary" type="submit">
            <FiSave size={14} />
            Save
          </button>
        </form>
      </section>

      <section className="finance-panel">
        <div className="finance-panel-header">
          <span className="finance-icon"><FiCalendar /></span>
          <div>
            <h3>Recent Records</h3>
            <p>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className="skeleton-list">
            <span />
            <span />
            <span />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state empty-state-small">
            <div className="empty-state-icon"><Icon /></div>
            <h3>No records yet</h3>
            <p>Create the first one to start tracking.</p>
          </div>
        ) : (
          <div className="module-list">
            {items.slice(0, 6).map((item) => (
              <article key={item._id || item.id} className="module-list-item">
                <strong>{item.name || item.title || item.fileName}</strong>
                <span>{config.summary(item)}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const BudgetVsActualChart = ({ darkMode }) => {
  const theme = getChartTheme(darkMode);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await financeService.getBudgetSummary();
      setSummary(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load budget summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = useMemo(() => ({
    labels: summary.map((item) => item.category),
    datasets: [
      { label: 'Budget', data: summary.map((item) => item.target), backgroundColor: theme.accent, borderRadius: 6 },
      { label: 'Actual Spend', data: summary.map((item) => item.actual), backgroundColor: theme.danger, borderRadius: 6 },
    ],
  }), [summary, theme.accent, theme.danger]);

  return (
    <section className="finance-panel">
      <div className="finance-panel-header">
        <span className="finance-icon"><FiFlag /></span>
        <div>
          <h3>Budget vs Actual</h3>
          <p>How this month's spending compares to each category's budget</p>
        </div>
      </div>

      {loading ? (
        <div className="skeleton-list"><span /><span /><span /></div>
      ) : summary.length === 0 ? (
        <div className="empty-state empty-state-small">
          <div className="empty-state-icon"><FiFlag /></div>
          <h3>No budgets for this month</h3>
          <p>Create a budget below to see it compared against actual spending.</p>
        </div>
      ) : (
        <div style={{ height: 280 }}>
          <Bar
            data={chartData}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: theme.textColor } }, tooltip: getTooltipOptions(theme) },
              scales: getScaleOptions(theme),
            }}
          />
        </div>
      )}
    </section>
  );
};

const BudgetsModule = ({ darkMode }) => (
  <div className="finance-grid finance-grid-single">
    <BudgetVsActualChart darkMode={darkMode} />
    <GenericResourceModule resource="budgets" />
  </div>
);

const RecurringSuggestionsPanel = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState('');

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const res = await financeService.getRecurringSuggestions();
      setSuggestions(res.data.data || []);
    } catch (err) {
      // Non-critical nudge feature - fail quietly rather than toast-spamming.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const dismiss = (title) => {
    setSuggestions((current) => current.filter((item) => item.title !== title));
  };

  const addAsRecurring = async (suggestion) => {
    setAdding(suggestion.title);
    try {
      await financeService.create('recurring', {
        title: suggestion.title,
        amount: suggestion.amount,
        type: 'expense',
        category: suggestion.category,
        account: 'Cash',
        frequency: suggestion.frequency,
        nextRunDate: suggestion.suggestedNextRunDate,
      });
      toast.success(`${suggestion.title} added as recurring`);
      dismiss(suggestion.title);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to add recurring transaction');
    } finally {
      setAdding('');
    }
  };

  if (loading || suggestions.length === 0) return null;

  return (
    <section className="finance-panel">
      <div className="finance-panel-header">
        <span className="finance-icon"><FiZap /></span>
        <div>
          <h3>Detected Patterns</h3>
          <p>Recurring-looking expenses found in your history</p>
        </div>
      </div>
      <div className="module-list">
        {suggestions.map((suggestion) => (
          <article key={suggestion.title} className="module-list-item">
            <strong>{suggestion.title} &mdash; {money(suggestion.amount)} {suggestion.frequency}</strong>
            <span>Seen {suggestion.occurrences} times &bull; last on {suggestion.lastDate}</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                disabled={adding === suggestion.title}
                onClick={() => addAsRecurring(suggestion)}
              >
                {adding === suggestion.title ? 'Adding...' : 'Add as recurring'}
              </button>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => dismiss(suggestion.title)}>
                Dismiss
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const RecurringModule = () => (
  <div className="finance-grid finance-grid-single">
    <RecurringSuggestionsPanel />
    <GenericResourceModule resource="recurring" />
  </div>
);

const NotificationsModule = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await financeService.list('notifications');
      setItems(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const markAsRead = async (item) => {
    if (item.isRead) return;
    try {
      await financeService.update('notifications', item._id || item.id, { isRead: true });
      setItems((current) =>
        current.map((entry) => ((entry._id || entry.id) === (item._id || item.id) ? { ...entry, isRead: true } : entry))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update notification');
    }
  };

  const config = moduleConfig.notifications;
  const Icon = config.icon;

  return (
    <div className="finance-grid finance-grid-single">
      <section className="finance-panel">
        <div className="finance-panel-header">
          <span className="finance-icon"><Icon /></span>
          <div>
            <h3>{config.title}</h3>
            <p>{config.subtitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="skeleton-list"><span /><span /><span /></div>
        ) : items.length === 0 ? (
          <div className="empty-state empty-state-small">
            <div className="empty-state-icon"><Icon /></div>
            <h3>No notifications yet</h3>
            <p>Budget, bill and goal alerts will show up here automatically.</p>
          </div>
        ) : (
          <div className="module-list">
            {items.map((item) => (
              <article
                key={item._id || item.id}
                className="module-list-item"
                style={{ cursor: item.isRead ? 'default' : 'pointer', opacity: item.isRead ? 0.65 : 1 }}
                onClick={() => markAsRead(item)}
                title={item.isRead ? 'Read' : 'Click to mark as read'}
              >
                <strong>{item.title} {!item.isRead && <span style={{ color: 'var(--danger, #ef4444)' }}>&bull;</span>}</strong>
                <span>{item.message}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ResourceModule = ({ resource, darkMode }) => {
  if (resource === 'reports') return <ReportsModule />;
  if (resource === 'budgets') return <BudgetsModule darkMode={darkMode} />;
  if (resource === 'notifications') return <NotificationsModule />;
  if (resource === 'recurring') return <RecurringModule />;
  return <GenericResourceModule resource={resource} />;
};

export const InsightsPanel = ({ darkMode }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = getChartTheme(darkMode);

  useEffect(() => {
    financeService.insights()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load finance insights'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => ({
    labels: ['Income', 'Expenses', 'Savings'],
    datasets: [{
      data: [data?.currentIncome || 0, data?.currentExpense || 0, Math.max(data?.savings || 0, 0)],
      backgroundColor: [theme.success, theme.danger, theme.accent],
      borderWidth: 0,
    }],
  }), [data, theme.success, theme.danger, theme.accent]);

  const trendData = useMemo(() => ({
    labels: ['Income', 'Expenses', 'Savings Rate'],
    datasets: [{
      label: 'Financial Health',
      data: [data?.currentIncome || 0, data?.currentExpense || 0, data?.savingsRate || 0],
      backgroundColor: theme.accent,
      borderRadius: 6,
    }],
  }), [data, theme.accent]);

  if (loading) {
    return <div className="finance-panel"><div className="skeleton-list"><span /><span /><span /></div></div>;
  }

  const hasInsights = (data?.insights || []).length > 0;
  const hasActivity = (data?.currentIncome || 0) > 0 || (data?.currentExpense || 0) > 0;

  return (
    <div className="finance-grid">
      <section className="finance-panel">
        <div className="finance-panel-header">
          <span className="finance-icon"><FiZap /></span>
          <div>
            <h3>AI Finance Assistant</h3>
            <p>Rule-based insights ready for AI integration</p>
          </div>
        </div>
        {hasInsights ? (
          <div className="insight-list">
            {(data?.insights || []).map((insight) => (
              <div key={insight} className="insight-card">{insight}</div>
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state-small">
            <div className="empty-state-icon"><FiZap /></div>
            <h3>No insights yet</h3>
            <p>Add a few expenses this month and insights will show up here.</p>
          </div>
        )}
      </section>

      <section className="finance-panel">
        <div className="finance-panel-header">
          <span className="finance-icon"><FiTrendingUp /></span>
          <div>
            <h3>Financial Health</h3>
            <p>Savings rate: {data?.savingsRate || 0}%</p>
          </div>
        </div>
        {hasActivity ? (
          <div className="analytics-grid">
            <div style={{ height: 240 }}>
              <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: theme.textColor } }, tooltip: getTooltipOptions(theme) } }} />
            </div>
            <div style={{ height: 240 }}>
              <Bar data={trendData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: getTooltipOptions(theme) }, scales: getScaleOptions(theme) }} />
            </div>
          </div>
        ) : (
          <div className="empty-state empty-state-small">
            <div className="empty-state-icon"><FiTrendingUp /></div>
            <h3>Nothing to show</h3>
            <p>Once you log income or expenses, your financial health chart appears here.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const ForecastPanel = ({ darkMode }) => {
  const theme = getChartTheme(darkMode);
  const [days, setDays] = useState(30);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financeService.getForecast(days)
      .then((res) => setForecast(res.data.data))
      .catch(() => toast.error('Failed to load cash-flow forecast'))
      .finally(() => setLoading(false));
  }, [days]);

  const chartData = useMemo(() => ({
    labels: (forecast?.points || []).map((point) => point.date),
    datasets: [
      {
        label: 'Projected Balance',
        data: (forecast?.points || []).map((point) => point.projectedBalance),
        borderColor: theme.accent,
        backgroundColor: 'color-mix(in srgb, ' + theme.accent + ' 12%, transparent)',
        fill: true,
        tension: 0.3,
      },
    ],
  }), [forecast, theme.accent]);

  return (
    <div className="finance-panel">
      <div className="finance-panel-header">
        <span className="finance-icon"><FiTrendingUp /></span>
        <div>
          <h3>Cash-Flow Forecast</h3>
          <p>Projected balance from scheduled recurring transactions, bills and your daily spending run-rate</p>
        </div>
        <select
          className="form-control"
          style={{ maxWidth: 120, marginLeft: 'auto' }}
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
        >
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="skeleton-list"><span /><span /><span /></div>
      ) : (
        <>
          <p style={{ marginBottom: 12 }}>
            Current balance: <strong>{money(forecast?.currentBalance)}</strong>
            {' '}&rarr; Projected in {days} days: <strong>{money(forecast?.endingBalance)}</strong>
          </p>
          <div style={{ height: 300 }}>
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: { legend: { labels: { color: theme.textColor } }, tooltip: getTooltipOptions(theme) },
                scales: getScaleOptions(theme),
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export const AdvancedAnalytics = ({ darkMode }) => {
  const theme = getChartTheme(darkMode);
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Income', data: [22000, 24000, 25000, 27000, 26000, 30000], borderColor: theme.success, backgroundColor: 'color-mix(in srgb, ' + theme.success + ' 12%, transparent)' },
      { label: 'Expenses', data: [12000, 15500, 14000, 17000, 16000, 18000], borderColor: theme.danger, backgroundColor: 'color-mix(in srgb, ' + theme.danger + ' 12%, transparent)' },
      { label: 'Savings', data: [10000, 8500, 11000, 10000, 10000, 12000], borderColor: theme.accent, backgroundColor: 'color-mix(in srgb, ' + theme.accent + ' 12%, transparent)' },
    ],
  };

  return (
    <div className="finance-grid finance-grid-single">
      <div className="finance-panel">
        <div className="finance-panel-header">
          <span className="finance-icon"><FiTrendingUp /></span>
          <div>
            <h3>Advanced Analytics</h3>
            <p>Income vs expense, cash flow, savings growth and budget usage</p>
          </div>
        </div>
        <div style={{ height: 360 }}>
          <Line
            data={data}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: { legend: { labels: { color: theme.textColor } }, tooltip: getTooltipOptions(theme) },
              scales: getScaleOptions(theme),
            }}
          />
        </div>
      </div>
      <ForecastPanel darkMode={darkMode} />
    </div>
  );
};

export default ResourceModule;
