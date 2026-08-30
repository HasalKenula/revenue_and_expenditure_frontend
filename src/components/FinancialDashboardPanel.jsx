
import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Wallet,
  FileText,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Home,
  Layers,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  (error) => Promise.reject(error)
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

const FinancialDashboardPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Format number with commas
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/dashboard');

      if (response.data.success) {
        setDashboardData(response.data.data);
        setLastUpdated(new Date());
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed!');
  };

  // Get color for growth indicator
  const getGrowthColor = (value) => {
    if (value === undefined || value === null) return 'text-gray-500';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value) => {
    if (value === undefined || value === null) return null;
    return value >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />;
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Rs ' + context.parsed.y.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'Rs ' + value.toLocaleString();
          }
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'top'
      }
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const data = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Home className="w-7 h-7 text-blue-600" />
              Financial Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Comprehensive financial overview and analytics
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: 'Total Budget',
            value: data.summary_cards?.total_budget || 0,
            icon: <Wallet className="w-6 h-6 text-blue-600" />,
            color: 'bg-blue-50 border-blue-100',
          },
        
          {
            title: 'Net Revenue',
            value: data.summary_cards?.net_revenue || 0,
            icon: <Wallet className="w-6 h-6 text-purple-600" />,
            color: 'bg-purple-50 border-purple-100',
          },
         
        ].map((card, index) => (
          <div
            key={index}
            className={`rounded-xl border ${card.color} p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                  Rs {formatNumber(card.value)}
                </p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

    
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Revenue Trends (All Years)
          </h3>
          <div className="h-64">
            {data.revenue_chart && (
              <Line
                data={{
                  labels: data.revenue_chart.labels,
                  datasets: [
                    {
                      label: 'Revenue',
                      data: data.revenue_chart.revenue,
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      fill: true,
                      tension: 0.4
                    },
                    {
                      label: 'Refund',
                      data: data.revenue_chart.refund,
                      borderColor: '#EF4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      fill: true,
                      tension: 0.4
                    },
                    {
                      label: 'Net Revenue',
                      data: data.revenue_chart.net,
                      borderColor: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      fill: true,
                      tension: 0.4
                    }
                  ]
                }}
                options={lineChartOptions}
              />
            )}
          </div>
        </div>

        {/* Budget Allocation */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Budget Allocation by Head
          </h3>
          <div className="h-64">
            {data.budget_allocation && (
              <Doughnut
                data={{
                  labels: data.budget_allocation.labels,
                  datasets: [{
                    data: data.budget_allocation.values,
                    backgroundColor: data.budget_allocation.colors || [
                      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
                      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
                      '#6366F1', '#84CC16'
                    ],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        usePointStyle: true,
                        padding: 10,
                        font: {
                          size: 10
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return 'Rs ' + context.parsed.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          });
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      
      {/* Supplementary Summary */}
      {data.supplementary_summary && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
          <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            Supplementary Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <p className="text-xs text-gray-500">Total FR66P</p>
              <p className="text-lg font-bold text-blue-600">Rs {formatNumber(data.supplementary_summary.total_fr66p)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <p className="text-xs text-gray-500">Total FR66M</p>
              <p className="text-lg font-bold text-green-600">Rs {formatNumber(data.supplementary_summary.total_fr66m)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
              <p className="text-xs text-gray-500">Total Supplementary</p>
              <p className="text-lg font-bold text-purple-600">Rs {formatNumber(data.supplementary_summary.total_supplementary)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <p className="text-xs text-gray-500">Total Records</p>
              <p className="text-lg font-bold text-gray-600">{data.supplementary_summary.total_records}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinancialDashboardPanel;