import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor - attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateTheme: (themePreference) => API.patch('/auth/theme', { themePreference }),
  updateStatementSettings: (statementSchedule) => API.patch('/auth/statement-settings', { statementSchedule }),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
};

// Expense services
export const expenseService = {
  // `signal` (an AbortController's signal) lets callers cancel a stale, still
  // in-flight request when a newer one starts, preventing out-of-order
  // responses from overwriting fresher results.
  getAll: (params, signal) => API.get('/expenses', { params, signal }),
  create: (data) => API.post('/expenses', data),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
  exportCSV: (params) =>
    API.get('/expenses/export', { responseType: 'blob', params }),
  bulkDelete: (ids) => API.delete('/expenses/bulk', { data: { ids } }),
  bulkUpdateCategory: (ids, category) => API.patch('/expenses/bulk-category', { ids, category }),
  transfer: (data) => API.post('/expenses/transfer', data),
  suggestCategory: (title) => API.get('/expenses/suggest-category', { params: { title } }),
};

export const financeService = {
  list: (resource, params) => API.get(`/finance/${resource}`, { params }),
  create: (resource, data) => API.post(`/finance/${resource}`, data),
  update: (resource, id, data) => API.put(`/finance/${resource}/${id}`, data),
  delete: (resource, id) => API.delete(`/finance/${resource}/${id}`),
  insights: () => API.get('/finance/insights'),
  getMonthlyExpenseTarget: (params) => API.get('/finance/budget-target/monthly', { params }),
  setMonthlyExpenseTarget: (data) => API.put('/finance/budget-target/monthly', data),
  getBudgetSummary: (params) => API.get('/finance/budgets/summary', { params }),
  getRecurringSuggestions: () => API.get('/finance/recurring/suggestions'),
  getForecast: (days) => API.get('/finance/forecast', { params: { days } }),
};

export default API;
