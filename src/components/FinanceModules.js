import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { financeService } from '../services/api';
import { useExpenses } from '../context/ExpenseContext';
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
          <div className="module-empty">No records yet. Create the first one to start tracking.</div>
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

const ResourceModule = ({ resource }) => {
  if (resource === 'reports') return <ReportsModule />;
  return <GenericResourceModule resource={resource} />;
};

export const InsightsPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      backgroundColor: ['#10b981', '#ef4444', '#6366f1'],
      borderWidth: 0,
    }],
  }), [data]);

  const trendData = useMemo(() => ({
    labels: ['Income', 'Expenses', 'Savings Rate'],
    datasets: [{
      label: 'Financial Health',
      data: [data?.currentIncome || 0, data?.currentExpense || 0, data?.savingsRate || 0],
      backgroundColor: '#6366f1',
      borderRadius: 6,
    }],
  }), [data]);

  if (loading) {
    return <div className="finance-panel"><div className="skeleton-list"><span /><span /><span /></div></div>;
  }

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
        <div className="insight-list">
          {(data?.insights || []).map((insight) => (
            <div key={insight} className="insight-card">{insight}</div>
          ))}
        </div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel-header">
          <span className="finance-icon"><FiTrendingUp /></span>
          <div>
            <h3>Financial Health</h3>
            <p>Savings rate: {data?.savingsRate || 0}%</p>
          </div>
        </div>
        <div className="analytics-grid">
          <div style={{ height: 240 }}><Doughnut data={chartData} options={{ maintainAspectRatio: false }} /></div>
          <div style={{ height: 240 }}><Bar data={trendData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
        </div>
      </section>
    </div>
  );
};

export const AdvancedAnalytics = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Income', data: [22000, 24000, 25000, 27000, 26000, 30000], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)' },
      { label: 'Expenses', data: [12000, 15500, 14000, 17000, 16000, 18000], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.12)' },
      { label: 'Savings', data: [10000, 8500, 11000, 10000, 10000, 12000], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.12)' },
    ],
  };

  return (
    <div className="finance-panel">
      <div className="finance-panel-header">
        <span className="finance-icon"><FiTrendingUp /></span>
        <div>
          <h3>Advanced Analytics</h3>
          <p>Income vs expense, cash flow, savings growth and budget usage</p>
        </div>
      </div>
      <div style={{ height: 360 }}>
        <Line data={data} options={{ maintainAspectRatio: false, responsive: true }} />
      </div>
    </div>
  );
};

export default ResourceModule;
