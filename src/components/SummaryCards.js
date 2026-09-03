import React, { useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { FiTrendingUp, FiShoppingBag, FiCalendar, FiActivity, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const formatAmount = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const Trend = ({ changePercent, invert }) => {
  if (changePercent === null || changePercent === undefined || Number.isNaN(changePercent)) return null;
  const isUp = changePercent > 0;
  const isFlat = changePercent === 0;
  // For a spend metric, "up" is bad (invert=true) so its color meaning flips.
  const isGood = isFlat ? null : invert ? !isUp : isUp;
  const cls = isFlat ? 'stat-trend-flat' : isGood ? 'stat-trend-up' : 'stat-trend-down';
  return (
    <span className={`stat-trend ${cls}`}>
      {!isFlat && (isUp ? <FiArrowUp /> : <FiArrowDown />)}
      {Math.abs(changePercent)}% vs last month
    </span>
  );
};

const SummaryCards = () => {
  const { summary, loading, insights, fetchInsights } = useExpenses();
  const { totalAmount = 0, totalBalance = 0, totalIncome = 0, accountBalances = {} } = summary;

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const cards = [
    {
      id: 'stat-total',
      icon: '💰',
      label: 'Total Balance',
      value: formatAmount(totalBalance),
      sub: `${formatAmount(totalIncome)} In / ${formatAmount(totalAmount)} Out`,
      className: 'stat-card stat-card-1',
      iconComp: <FiTrendingUp />,
      trend: insights ? <Trend changePercent={insights.expenseChange} invert /> : null,
    },
    {
      id: 'stat-sbi',
      icon: '🏦',
      label: 'SBI Balance',
      value: formatAmount(accountBalances?.['SBI'] || 0),
      sub: 'State Bank of India',
      className: 'stat-card stat-card-2',
      iconComp: <FiCalendar />,
    },
    {
      id: 'stat-kvb',
      icon: '🏛️',
      label: 'KVB Balance',
      value: formatAmount(accountBalances?.['KVB'] || 0),
      sub: 'Karur Vysya Bank',
      className: 'stat-card stat-card-5',
      iconComp: <FiCalendar />,
    },
    {
      id: 'stat-gpay',
      icon: '📱',
      label: 'GPay & Wallet',
      value: formatAmount((accountBalances?.['GPay'] || 0) + (accountBalances?.['Wallet'] || 0) + (accountBalances?.['PhonePe'] || 0) + (accountBalances?.['Paytm'] || 0)),
      sub: 'Digital Wallets & UPI',
      className: 'stat-card stat-card-4',
      iconComp: <FiActivity />,
    },
    {
      id: 'stat-cash',
      icon: '💵',
      label: 'Cash in Hand',
      value: formatAmount(accountBalances?.['Cash'] || 0),
      sub: 'Physical Cash',
      className: 'stat-card stat-card-3',
      iconComp: <FiShoppingBag />,
    },
  ];

  if (loading) {
    return (
      <div className="stat-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card stat-card-skeleton">
            <div className="stat-skeleton-icon" />
            <div className="stat-skeleton-line stat-skeleton-line-lg" />
            <div className="stat-skeleton-line stat-skeleton-line-sm" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stat-grid">
      {cards.map((card) => (
        <div key={card.id} id={card.id} className={card.className}>
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-value">
            {card.value}
          </div>
          <div className="stat-label">{card.label}</div>
          <div className="sub-text">
            {card.sub}
          </div>
          {card.trend}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
