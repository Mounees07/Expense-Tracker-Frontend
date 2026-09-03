import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowUpRight, FiArrowDownLeft, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { useExpenses } from '../context/ExpenseContext';
import { getChartTheme, getTooltipOptions } from '../utils/chartTheme';
import { Line } from 'react-chartjs-2';
import ExpenseModal from './ExpenseModal';

const formatAmount = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Account label/subtitle mapping — mirrors SummaryCards.js's grouping of
// summary.accountBalances into named rows.
const buildAccountRows = (accountBalances = {}) => ([
  { key: 'SBI', name: 'SBI', sub: 'State Bank of India', value: accountBalances['SBI'] || 0 },
  { key: 'KVB', name: 'KVB', sub: 'Karur Vysya Bank', value: accountBalances['KVB'] || 0 },
  {
    key: 'GPay',
    name: 'GPay & Wallet',
    sub: 'Digital Wallets & UPI',
    value: (accountBalances['GPay'] || 0) + (accountBalances['Wallet'] || 0) + (accountBalances['PhonePe'] || 0) + (accountBalances['Paytm'] || 0),
  },
  { key: 'Cash', name: 'Cash in Hand', sub: 'Physical Cash', value: accountBalances['Cash'] || 0 },
]);

const NetWorthCard = ({ darkMode, setActiveTab }) => {
  const { summary, insights, fetchInsights, fetchExpenses } = useExpenses();
  const { totalAmount = 0, totalBalance = 0, totalIncome = 0, accountBalances = {}, monthlyData = [] } = summary;
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const accountRows = useMemo(() => buildAccountRows(accountBalances), [accountBalances]);

  // Derive a running cumulative-balance trend from monthlyData (category totals
  // per month). We don't have per-month income client-side beyond the current
  // filtered period, so this approximates net worth trend as a running sum of
  // (flat monthly baseline - that month's expense total), which is a simplification
  // — it is NOT a true historical net-worth series, just a directionally useful trend line.
  const trend = useMemo(() => {
    const activeMonths = [...new Set(monthlyData.map((d) => d._id))].sort((a, b) => a - b);
    if (activeMonths.length === 0) return { labels: [], data: [] };

    const totalsByMonth = activeMonths.map((m) =>
      monthlyData.filter((d) => d._id === m).reduce((sum, d) => sum + (d.total || 0), 0)
    );
    const avgExpense = totalsByMonth.reduce((a, b) => a + b, 0) / totalsByMonth.length || 0;

    // Walk backward from the current known totalBalance, undoing each month's
    // net (approximated as avgExpense - monthExpense, a rough proxy for savings that month).
    let running = totalBalance;
    const reversed = [...totalsByMonth].reverse();
    const balances = reversed.map((monthTotal) => {
      const value = running;
      running -= (avgExpense - monthTotal);
      return value;
    });
    balances.reverse();

    // Sparse quarterly-ish labels: show first, ~1/3, ~2/3, last.
    const labels = activeMonths.map((m) => MONTH_NAMES[m - 1] || m);

    return { labels, data: balances };
  }, [monthlyData, totalBalance]);

  const theme = getChartTheme(darkMode);

  const chartData = {
    labels: trend.labels,
    datasets: [
      {
        data: trend.data,
        borderColor: theme.accent,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: theme.accent,
        tension: 0.4,
        fill: true,
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'transparent';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(163, 230, 53, 0.32)');
          gradient.addColorStop(1, 'rgba(163, 230, 53, 0)');
          return gradient;
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...getTooltipOptions(theme), callbacks: { label: (c) => formatAmount(c.parsed.y) } },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: theme.tickColor,
          font: { size: 11 },
          maxTicksLimit: 4,
          autoSkip: true,
        },
        border: { display: false },
      },
      y: { display: false, grid: { display: false } },
    },
  };

  const changePercent = insights?.expenseChange;

  return (
    <div className="networth-card">
      <div className="networth-glow" />

      <div className="networth-top">
        <div>
          <div className="networth-label">NET WORTH</div>
          <div className="networth-value-row">
            <span className="networth-value">{formatAmount(totalBalance)}</span>
            {typeof changePercent === 'number' && !Number.isNaN(changePercent) && (
              <span className={`networth-pill ${changePercent <= 0 ? 'up' : 'down'}`}>
                {changePercent <= 0 ? <FiArrowUpRight /> : <FiArrowUpRight style={{ transform: 'rotate(90deg)' }} />}
                {Math.abs(changePercent)}%
              </span>
            )}
          </div>
          <div className="networth-inout">
            <span className="inout-item inout-in">
              <FiArrowDownLeft /> In {formatAmount(totalIncome)}
            </span>
            <span className="inout-item inout-out">
              <FiArrowUpRight /> Out {formatAmount(totalAmount)}
            </span>
          </div>
        </div>

        <button className="btn networth-add-btn" onClick={() => setModalOpen(true)}>
          <FiPlus size={16} /> Add expense
        </button>
      </div>

      <div className="networth-body">
        <div className="networth-chart">
          {trend.data.length > 1 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="networth-chart-empty">
              <FiTrendingUp size={22} />
              <span>Trend will appear once you have a few months of data.</span>
            </div>
          )}
        </div>

        <div className="networth-accounts">
          {accountRows.map((acc) => (
            <div className="account-row" key={acc.key}>
              <div>
                <div className="account-row-name">{acc.name}</div>
                <div className="account-row-sub">{acc.sub}</div>
              </div>
              <div className="account-row-value">{formatAmount(acc.value)}</div>
            </div>
          ))}
          <button
            type="button"
            className="account-row account-row-ghost"
            onClick={() => setActiveTab && setActiveTab('accounts')}
          >
            + Link another account
          </button>
        </div>
      </div>

      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editExpense={null}
        onSuccess={() => fetchExpenses({ page: 1 })}
      />
    </div>
  );
};

export default NetWorthCard;
