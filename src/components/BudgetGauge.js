import React, { useEffect, useMemo, useState } from 'react';
import { financeService } from '../services/api';
import { useExpenses } from '../context/ExpenseContext';
import toast from 'react-hot-toast';

const formatAmount = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

const CATEGORY_COLOR_VAR = {
  'Food & Dining': '--cat-food-color',
  Transportation: '--cat-transport-color',
  Shopping: '--cat-shopping-color',
  Entertainment: '--cat-entertainment-color',
  Healthcare: '--cat-healthcare-color',
  Education: '--cat-education-color',
  Utilities: '--cat-utilities-color',
  Housing: '--cat-housing-color',
  Travel: '--cat-travel-color',
  'Personal Care': '--cat-personal-color',
  Other: '--cat-other-color',
};

const RADIUS = 70;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const BudgetGauge = () => {
  const { filters } = useExpenses();
  const [targetData, setTargetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Month-scoped breakdown from the target endpoint, not the all-time
  // summary — so the category list matches the gauge's selected month.
  const categoryBreakdown = targetData?.categoryBreakdown || {};

  const month = Number(filters.month || new Date().getMonth() + 1);
  const year = Number(filters.year || new Date().getFullYear());

  const monthLabel = useMemo(() => {
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date);
  }, [month, year]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    financeService.getMonthlyExpenseTarget({ month, year })
      .then((res) => { if (!cancelled) setTargetData(res.data.data); })
      .catch((err) => { if (!cancelled) toast.error(err.response?.data?.message || 'Failed to load monthly target'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [month, year]);

  const utilization = Math.max(0, Math.min(targetData?.utilization || 0, 100));
  const exceeded = targetData?.exceeded;
  const hasTarget = Boolean(targetData?.target);
  const dashOffset = CIRCUMFERENCE - (CIRCUMFERENCE * utilization) / 100;

  const topCategories = useMemo(() => {
    const total = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        share: (amount / total) * 100,
        colorVar: CATEGORY_COLOR_VAR[category] || '--cat-other-color',
      }));
  }, [categoryBreakdown]);

  return (
    <div className="budget-gauge-card">
      <div className="budget-gauge-header">
        <div>
          <h3 className="card-title">Monthly target</h3>
          <p className="card-subtitle">{monthLabel}</p>
        </div>
        {hasTarget && (
          <span className={`budget-gauge-pill ${exceeded ? 'danger' : 'ok'}`}>
            {exceeded ? 'Over budget' : 'On track'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="skeleton-list"><span /><span /></div>
      ) : (
        <>
          <div className="budget-gauge-ring-wrap">
            <svg width="180" height="180" viewBox="0 0 180 180" className="budget-gauge-svg">
              <circle
                cx="90" cy="90" r={RADIUS}
                fill="none"
                stroke="var(--border-color)"
                strokeWidth={STROKE}
              />
              {hasTarget && (
                <circle
                  cx="90" cy="90" r={RADIUS}
                  fill="none"
                  stroke={exceeded ? 'var(--danger)' : 'var(--accent-primary)'}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 90 90)"
                  className="budget-gauge-progress"
                />
              )}
            </svg>
            <div className="budget-gauge-center">
              <div className={`budget-gauge-percent ${exceeded ? 'danger' : ''}`}>
                {hasTarget ? `${utilization}%` : '—'}
              </div>
              <div className="budget-gauge-sub">
                {hasTarget ? `of ${formatAmount(targetData?.target)}` : 'No target set'}
              </div>
            </div>
          </div>

          <div className="budget-gauge-categories">
            {topCategories.length === 0 ? (
              <p className="budget-gauge-empty">No category spend yet this month.</p>
            ) : (
              topCategories.map((cat) => (
                <div className="budget-cat-row" key={cat.category}>
                  <div className="budget-cat-row-top">
                    <span>{cat.category}</span>
                    <span>{formatAmount(cat.amount)}</span>
                  </div>
                  <div className="budget-cat-bar-track">
                    <div
                      className="budget-cat-bar-fill"
                      style={{ width: `${Math.min(cat.share, 100)}%`, background: `var(${cat.colorVar})` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetGauge;
