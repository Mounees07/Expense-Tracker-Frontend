import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ExpenseTable from '../components/ExpenseTable';
import NetWorthCard from '../components/NetWorthCard';
import ActivityFeed from '../components/ActivityFeed';
import BudgetGauge from '../components/BudgetGauge';
import ResourceModule, { AdvancedAnalytics, InsightsPanel } from '../components/FinanceModules';
import SettingsPage from './SettingsPage';
import { useExpenses } from '../context/ExpenseContext';
import { getChartTheme, getTooltipOptions, getScaleOptions } from '../utils/chartTheme';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Analytics = ({ darkMode }) => {
  const { summary } = useExpenses();
  const { monthlyData = [] } = summary;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const theme = getChartTheme(darkMode);

  // Data for Category Breakdown Bar Chart (Filtered by selectedMonth)
  // (reused below for the doughnut/pie category-share chart too)
  const monthCategories = monthlyData.filter(d => d._id === parseInt(selectedMonth)).sort((a,b) => b.total - a.total);

  const categoryBarData = {
    labels: monthCategories.map(d => d.category),
    datasets: [
      {
        label: 'Amount Spent (₹)',
        data: monthCategories.map(d => d.total),
        backgroundColor: theme.seriesColors,
        borderRadius: 4,
      },
    ],
  };

  const categoryBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: getTooltipOptions(theme),
    },
    scales: getScaleOptions(theme),
  };

  // Doughnut chart reusing the same monthCategories aggregation as the bar chart
  const categoryDoughnutData = {
    labels: monthCategories.map(d => d.category),
    datasets: [
      {
        data: monthCategories.map(d => d.total),
        backgroundColor: theme.seriesColors,
        borderColor: theme.isDark ? '#16213e' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const categoryDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: theme.textColor, boxWidth: 10, font: { size: 11 }, padding: 12 } },
      tooltip: getTooltipOptions(theme),
    },
  };

  // Bar Chart Data (Monthly Stacked by Category)

  // Get active months from data
  const activeMonths = [...new Set(monthlyData.map(d => d._id))].sort((a,b) => a - b);
  const labels = activeMonths.map(m => monthNames[m - 1] || m);

  // Get unique categories
  const categories = [...new Set(monthlyData.map(d => d.category))];

  const datasets = categories.map((cat, idx) => {
    return {
      label: cat,
      data: activeMonths.map(m => {
        const record = monthlyData.find(d => d._id === m && d.category === cat);
        return record ? record.total : 0;
      }),
      backgroundColor: theme.seriesColors[idx % theme.seriesColors.length],
      borderRadius: 4,
    };
  });

  const barData = { labels, datasets };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 }, color: theme.textColor } },
      title: { display: false, text: 'Monthly Spending by Category' },
      tooltip: getTooltipOptions(theme),
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: theme.tickColor } },
      y: { stacked: true, beginAtZero: true, grid: { color: theme.gridColor }, ticks: { color: theme.tickColor } },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 8 }}>
          <h3 className="card-title">Category Breakdown</h3>
          <select
            className="form-control"
            style={{ width: '150px', padding: '6px 12px' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Select month for category breakdown"
          >
            {monthNames.map((m, i) => (
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
        </div>
        {monthCategories.length > 0 ? (
          <div className="chart-row">
            <div style={{ height: '300px' }}>
              <Bar data={categoryBarData} options={categoryBarOptions} />
            </div>
            <div style={{ height: '300px' }}>
              <Doughnut data={categoryDoughnutData} options={categoryDoughnutOptions} />
            </div>
          </div>
        ) : (
          <div className="empty-state empty-state-small">
            <div className="empty-state-icon">📊</div>
            <h3>No data for this month</h3>
            <p>Add expenses in {monthNames[selectedMonth - 1]} to see a breakdown here.</p>
          </div>
        )}
      </div>
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Monthly Trends (Stacked)</h3>
        <div style={{ height: '350px' }}>
          {monthlyData.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div className="empty-state empty-state-small">
              <div className="empty-state-icon">📈</div>
              <h3>No data available</h3>
              <p>Trends will appear once you start logging expenses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = ({ darkMode, toggleDark }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <TopBar 
          darkMode={darkMode}
          toggleDark={toggleDark}
          activeTab={activeTab}
          onMobileMenu={() => setMobileOpen(true)}
        />

        <div className="content-area" style={{ padding: '0 24px 24px', flex: 1 }}>
          {activeTab === 'overview' && (
            <div className="fade-in overview-page">
              <NetWorthCard darkMode={darkMode} setActiveTab={setActiveTab} />
              <div className="overview-columns" style={{ marginTop: '20px' }}>
                <ActivityFeed />
                <BudgetGauge />
              </div>
            </div>
          )}
          {activeTab === 'expenses' && (
            <div className="fade-in">
              <ExpenseTable />
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="fade-in">
              <Analytics darkMode={darkMode} />
              <div style={{ marginTop: '24px' }}>
                <AdvancedAnalytics darkMode={darkMode} />
              </div>
            </div>
          )}
          {activeTab === 'insights' && <div className="fade-in"><InsightsPanel darkMode={darkMode} /></div>}
          {activeTab === 'accounts' && <div className="fade-in"><ResourceModule resource="accounts" /></div>}
          {activeTab === 'budgets' && <div className="fade-in"><ResourceModule resource="budgets" darkMode={darkMode} /></div>}
          {activeTab === 'goals' && <div className="fade-in"><ResourceModule resource="goals" /></div>}
          {activeTab === 'bills' && <div className="fade-in"><ResourceModule resource="bills" /></div>}
          {activeTab === 'recurring' && <div className="fade-in"><ResourceModule resource="recurring" /></div>}
          {activeTab === 'receipts' && <div className="fade-in"><ResourceModule resource="receipts" /></div>}
          {activeTab === 'reports' && <div className="fade-in"><ResourceModule resource="reports" /></div>}
          {activeTab === 'notifications' && <div className="fade-in"><ResourceModule resource="notifications" /></div>}
          {activeTab === 'settings' && <div className="fade-in"><SettingsPage /></div>}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
