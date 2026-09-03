// Central place for Chart.js styling so every chart in the app stays in sync
// with the active light/dark theme instead of hardcoding hex colors per chart.

const getCssVar = (name, fallback) => {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return value && value.trim() ? value.trim() : fallback;
};

/**
 * Returns a Chart.js-ready color palette derived from the app's CSS variables.
 * Pass a `darkMode` boolean if you already know the theme (avoids a DOM read),
 * otherwise it is inferred from `document.documentElement`'s `data-theme` attribute.
 */
export const getChartTheme = (darkMode) => {
  const isDark = typeof darkMode === 'boolean'
    ? darkMode
    : typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  const seriesColors = [
    getCssVar('--chart-series-1', '#6366f1'),
    getCssVar('--chart-series-2', '#10b981'),
    getCssVar('--chart-series-3', '#f59e0b'),
    getCssVar('--chart-series-4', '#ef4444'),
    getCssVar('--chart-series-5', '#8b5cf6'),
    getCssVar('--chart-series-6', '#06b6d4'),
    getCssVar('--chart-series-7', '#f97316'),
    getCssVar('--chart-series-8', '#ec4899'),
    getCssVar('--chart-series-9', '#14b8a6'),
    getCssVar('--chart-series-10', '#f43f5e'),
    getCssVar('--chart-series-11', '#84cc16'),
    getCssVar('--chart-series-12', '#64748b'),
  ];

  return {
    isDark,
    seriesColors,
    gridColor: getCssVar('--chart-grid-color', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'),
    tickColor: getCssVar('--chart-tick-color', isDark ? '#94a3b8' : '#64748b'),
    tooltipBg: getCssVar('--chart-tooltip-bg', isDark ? '#1e1e35' : '#0f172a'),
    tooltipText: getCssVar('--chart-tooltip-text', isDark ? '#f1f5f9' : '#f8fafc'),
    textColor: getCssVar('--text-secondary', isDark ? '#94a3b8' : '#475569'),
    success: getCssVar('--success', '#10b981'),
    danger: getCssVar('--danger', '#ef4444'),
    accent: getCssVar('--accent-primary', '#2dd4bf'),
  };
};

/** Common Chart.js `options.plugins.tooltip` block that follows the theme. */
export const getTooltipOptions = (theme) => ({
  backgroundColor: theme.tooltipBg,
  titleColor: theme.tooltipText,
  bodyColor: theme.tooltipText,
  borderColor: theme.gridColor,
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
});

/** Common Chart.js `options.scales` block for cartesian charts (bar/line). */
export const getScaleOptions = (theme) => ({
  x: {
    grid: { color: theme.gridColor, display: false },
    ticks: { color: theme.tickColor, font: { size: 11 } },
  },
  y: {
    beginAtZero: true,
    grid: { color: theme.gridColor },
    ticks: { color: theme.tickColor, font: { size: 11 } },
  },
});

export default getChartTheme;
