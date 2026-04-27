import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import SummaryCards from '../components/SummaryCards';
import ExpenseTable from '../components/ExpenseTable';
import { useExpenses } from '../context/ExpenseContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const { summary } = useExpenses();
  const { monthlyData = [] } = summary;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Data for Category Breakdown Bar Chart (Filtered by selectedMonth)
  const monthCategories = monthlyData.filter(d => d._id === parseInt(selectedMonth)).sort((a,b) => b.total - a.total);
  
  const categoryBarData = {
    labels: monthCategories.map(d => d.category),
    datasets: [
      {
        label: 'Amount Spent (₹)',
        data: monthCategories.map(d => d.total),
        backgroundColor: [
          '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
          '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', 
          '#14b8a6', '#f43f5e', '#84cc16', '#64748b'
        ],
        borderRadius: 4,
      },
    ],
  };

  const categoryBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Bar Chart Data (Monthly Stacked by Category)
  
  // Get active months from data
  const activeMonths = [...new Set(monthlyData.map(d => d._id))].sort((a,b) => a - b);
  const labels = activeMonths.map(m => monthNames[m - 1] || m);
  
  // Get unique categories
  const categories = [...new Set(monthlyData.map(d => d.category))];
  const chartColors = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', 
    '#14b8a6', '#f43f5e', '#84cc16', '#64748b'
  ];

  const datasets = categories.map((cat, idx) => {
    return {
      label: cat,
      data: activeMonths.map(m => {
        const record = monthlyData.find(d => d._id === m && d.category === cat);
        return record ? record.total : 0;
      }),
      backgroundColor: chartColors[idx % chartColors.length],
      borderRadius: 4,
    };
  });

  const barData = { labels, datasets };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
      title: { display: false, text: 'Monthly Spending by Category' },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="card-title">Category Breakdown (Bar)</h3>
          <select 
            className="form-control" 
            style={{ width: '150px', padding: '6px 12px' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthNames.map((m, i) => (
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
        </div>
        <div style={{ height: '300px' }}>
          {monthCategories.length > 0 ? (
            <Bar data={categoryBarData} options={categoryBarOptions} />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No expense data for this month</p>
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Monthly Trends (Stacked)</h3>
        <div style={{ height: '350px' }}>
          {monthlyData.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = ({ darkMode, toggleDark }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleMobileMenu = () => {
    document.getElementById('mobile-menu-toggle')?.click();
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <TopBar 
          darkMode={darkMode}
          toggleDark={toggleDark}
          activeTab={activeTab}
          onMobileMenu={handleMobileMenu}
        />

        <div className="content-area" style={{ padding: '24px', paddingTop: 'calc(24px + var(--topbar-height))', flex: 1 }}>
          {activeTab === 'overview' && (
            <div className="fade-in">
              <SummaryCards />
              <div style={{ marginTop: '24px' }}>
                <ExpenseTable />
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
              <Analytics />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
