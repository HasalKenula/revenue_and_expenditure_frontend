// src/components/FinancialDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  BarChart3,
  Building2,
  FileText,
  Clock,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MinusCircle,
  PlusCircle,
  CreditCard,
  Receipt,
  Landmark,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const monthNames = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December'
};

const FinancialDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [filterOptions, setFilterOptions] = useState({
    years: [],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  });

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'Rs 0.00';
    return `Rs ${formatNumber(value)}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        year: filters.year,
        month: filters.month
      };

      const response = await apiClient.get('/dashboard/data', { params });

      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status !== 401) {
        alert('Failed to fetch dashboard data: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await apiClient.get('/dashboard/filter-options');

      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { summary, budget_by_head, budget_by_program, monthly_trend, top_trnos } = dashboardData;
  const summaryData = summary || {};

  // Chart configurations
  const budgetByHeadData = {
    labels: budget_by_head?.map(item => `Head ${item.head}`) || [],
    datasets: [{
      label: 'Budget by Head',
      data: budget_by_head?.map(item => item.total) || [],
      backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA'],
      borderWidth: 1
    }]
  };

  const monthlyTrendData = {
    labels: monthly_trend?.map(item => monthNames[item.month]) || [],
    datasets: [
      {
        label: 'Debit',
        data: monthly_trend?.map(item => item.total_debit) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2
      },
      {
        label: 'Credit',
        data: monthly_trend?.map(item => item.total_credit) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }
    ]
  };

  const topTrnosData = {
    labels: top_trnos?.map(item => `TR ${item.trno}`) || [],
    datasets: [{
      label: 'Top TRNOs by Expenditure',
      data: top_trnos?.map(item => item.total) || [],
      backgroundColor: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3B0764'],
      borderWidth: 1
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Landmark size={28} className="text-blue-600" />
            Financial Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of financial metrics and performance
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterOptions.years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterOptions.months.map(month => (
                <option key={month} value={month}>{monthNames[month]}</option>
              ))}
            </select>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs opacity-90">Total Budget</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(summaryData.total_budget)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs opacity-90">Total Debits</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(summaryData.total_debits)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs opacity-90">Total Credits</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(summaryData.total_credits)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs opacity-90">Net Balance</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(summaryData.net_balance)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs opacity-90">Current Month Debits</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(summaryData.current_month_debits)}</p>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs opacity-90">Current Month Credits</p>
          <p className="text-lg font-bold mt-1">{formatCurrency(summaryData.current_month_credits)}</p>
        </div>
      </div>

      {/* Secondary Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Opening Balance</p>
          <p className="text-lg font-bold text-gray-800">{formatCurrency(summaryData.total_opening_balance)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Supplementary</p>
          <p className="text-lg font-bold text-yellow-600">{formatCurrency(summaryData.total_supplementary)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">FR 66 P</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(summaryData.total_fr66p)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">FR 66 M</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(summaryData.total_fr66m)}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <PieChart size={18} className="text-blue-600" />
            Budget by Head
          </h3>
          <div className="h-64">
            <Pie data={budgetByHeadData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-600" />
            Monthly Trend (Debit vs Credit)
          </h3>
          <div className="h-64">
            <Bar data={monthlyTrendData} options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            Top TRNOs by Expenditure
          </h3>
          <div className="h-64">
            <Bar data={topTrnosData} options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false
                }
              }
            }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            Impress Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600">Total Issued</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(summaryData.total_impress_issued)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600">Total Settled</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(summaryData.total_impress_settled)}</p>
            </div>
            <div className="col-span-2 bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600">Net Impress Balance</p>
              <p className={`text-lg font-bold ${summaryData.net_impress_balance >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                {formatCurrency(summaryData.net_impress_balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Activity size={18} className="text-gray-600" />
          Recent Activities
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-600">TR No</th>
                <th className="px-3 py-2 text-left text-gray-600">Head</th>
                <th className="px-3 py-2 text-left text-gray-600">Subject</th>
                <th className="px-3 py-2 text-center text-gray-600">Type</th>
                <th className="px-3 py-2 text-right text-gray-600">Amount</th>
                <th className="px-3 py-2 text-right text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recent_activities?.map((activity, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{activity.trno || '-'}</td>
                  <td className="px-3 py-2">{activity.head || '-'}</td>
                  <td className="px-3 py-2 max-w-xs truncate">{activity.subject || '-'}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.dr_cr === 'DR' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {activity.dr_cr || '-'}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-right font-medium ${
                    activity.dr_cr === 'DR' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(activity.cash_xe)}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!dashboardData.recent_activities || dashboardData.recent_activities.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-3 py-8 text-center text-gray-500">
                    No recent activities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;