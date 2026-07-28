
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
  Save
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const RevenueAccountData = () => {
  const navigate = useNavigate();
  const [revenues, setRevenues] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [editingRevenue, setEditingRevenue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState(null);
  const [monthWiseSummary, setMonthWiseSummary] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  
  const [filters, setFilters] = useState({
    account_number_id: '',
    month: '',
    year: '',
    estimate_id: ''
  });
  
  const [newRevenue, setNewRevenue] = useState({
    account_number_id: '',
    amount: '',
    month: '',
    year: new Date().getFullYear().toString(), // Default to current year as string
    estimate_id: ''
  });

  // Month options
  const monthOptions = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
  ];

  // Format number with leading zeros (pad to 2 digits)
  const padNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return '00';
    }
    return String(value).padStart(2, '0');
  };

  // Helper function to format revenue code from estimate (head-project-object)
  const formatRevenueCode = (estimate) => {
    if (!estimate) return '-';
    
    const head = padNumber(estimate.head);
    const project = padNumber(estimate.project);
    const object = padNumber(estimate.object);
    
    return `${head}-${project}-${object}`;
  };

  // Helper function to get auth headers with JWT token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return {};
    }
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch estimates for dropdown
  const fetchEstimates = async () => {
    try {
      console.log('Fetching estimates...');
      const response = await axios.get(`${API_BASE_URL}/revenue-account-data/revenue-code-options`, {
        headers: getAuthHeaders()
      });
      console.log('Estimates response:', response.data);
      if (response.data.success) {
        setEstimates(response.data.data || []);
        console.log('Estimates set:', response.data.data);
      } else {
        console.error('API returned error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
      console.error('Error response:', error.response);
    }
  };

  // Fetch available years
  const fetchAvailableYears = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/revenue-account-data/filter-options`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setAvailableYears(response.data.data.years || []);
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
    }
  };

  // Fetch revenues
  const fetchRevenues = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: entriesPerPage,
        search: searchTerm,
        ...filters
      };

      const response = await axios.get(`${API_BASE_URL}/revenue-account-data`, { 
        params, 
        headers: getAuthHeaders() 
      });
      
      if (response.data.success) {
        setRevenues(response.data.data || []);
        setTotalRecords(response.data.pagination?.total || 0);
        setLastPage(response.data.pagination?.last_page || 1);
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
      }
    } catch (error) {
      console.error('Error fetching revenues:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to fetch revenue data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounts for dropdown
  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/account-numbers/all`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setAccounts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/revenue-account-data/summary`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Fetch month wise summary
  const fetchMonthWiseSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/revenue-account-data/month-wise-summary`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setMonthWiseSummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching month wise summary:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchRevenues();
    fetchAccounts();
    fetchSummary();
    fetchMonthWiseSummary();
    fetchEstimates();
    fetchAvailableYears();
  }, [currentPage, entriesPerPage, searchTerm, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Handle estimate selection - auto populate revenue_code_name
  const handleEstimateChange = (e) => {
    const estimateId = e.target.value;
    setNewRevenue({
      ...newRevenue,
      estimate_id: estimateId
    });
  };

  // Create new revenue
  const handleAddRevenue = async () => {
    if (!newRevenue.account_number_id) {
      alert('Please select an Account Number');
      return;
    }
    if (!newRevenue.estimate_id) {
      alert('Please select an Estimate');
      return;
    }
    if (!newRevenue.amount || parseFloat(newRevenue.amount) <= 0) {
      alert('Please enter a valid Amount');
      return;
    }
    if (!newRevenue.month) {
      alert('Please select a Month');
      return;
    }
    if (!newRevenue.year) {
      alert('Please enter a Year');
      return;
    }
    if (!/^\d{4}$/.test(newRevenue.year)) {
      alert('Please enter a valid 4-digit Year (e.g., 2024)');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/revenue-account-data`, {
        account_number_id: parseInt(newRevenue.account_number_id),
        amount: parseFloat(newRevenue.amount),
        month: newRevenue.month,
        year: parseInt(newRevenue.year),
        estimate_id: parseInt(newRevenue.estimate_id)
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        alert('Revenue data added successfully!');
        setNewRevenue({ 
          account_number_id: '', 
          amount: '', 
          month: '',
          year: new Date().getFullYear().toString(),
          estimate_id: ''
        });
        setShowAddModal(false);
        fetchRevenues();
        fetchSummary();
        fetchMonthWiseSummary();
        fetchAvailableYears();
      }
    } catch (error) {
      console.error('Error adding revenue:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to add revenue data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update revenue
  const handleUpdateRevenue = async () => {
    if (!editingRevenue) return;

    if (!editingRevenue.account_number_id) {
      alert('Please select an Account Number');
      return;
    }
    if (!editingRevenue.estimate_id) {
      alert('Please select an Estimate');
      return;
    }
    if (!editingRevenue.amount || parseFloat(editingRevenue.amount) <= 0) {
      alert('Please enter a valid Amount');
      return;
    }
    if (!editingRevenue.month) {
      alert('Please select a Month');
      return;
    }
    if (!editingRevenue.year) {
      alert('Please enter a Year');
      return;
    }
    if (!/^\d{4}$/.test(editingRevenue.year)) {
      alert('Please enter a valid 4-digit Year (e.g., 2024)');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/revenue-account-data/${editingRevenue.id}`, {
        account_number_id: parseInt(editingRevenue.account_number_id),
        amount: parseFloat(editingRevenue.amount),
        month: editingRevenue.month,
        year: parseInt(editingRevenue.year),
        estimate_id: parseInt(editingRevenue.estimate_id)
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        alert('Revenue data updated successfully!');
        setShowEditModal(false);
        setEditingRevenue(null);
        fetchRevenues();
        fetchSummary();
        fetchMonthWiseSummary();
        fetchAvailableYears();
      }
    } catch (error) {
      console.error('Error updating revenue:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to update revenue data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete selected revenues
  const handleDelete = async () => {
    if (selectedRows.length === 0) return;
    if (!confirm(`Delete ${selectedRows.length} record(s)?`)) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/revenue-account-data/delete-multiple`, {
        ids: selectedRows
      }, { headers: getAuthHeaders() });
      
      alert(response.data.message);
      setSelectedRows([]);
      fetchRevenues();
      fetchSummary();
      fetchMonthWiseSummary();
      fetchAvailableYears();
    } catch (error) {
      console.error('Error deleting revenues:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to delete records');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === revenues.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(revenues.map(revenue => revenue.id));
    }
  };

  const handleEdit = (revenue) => {
    setEditingRevenue({ 
      ...revenue,
      account_number_id: revenue.account_number_id,
      estimate_id: revenue.estimate_id || '',
      year: revenue.year ? revenue.year.toString() : new Date().getFullYear().toString()
    });
    setShowEditModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  // Handle Edit Estimate Change
  const handleEditEstimateChange = (e) => {
    const estimateId = e.target.value;
    setEditingRevenue({
      ...editingRevenue,
      estimate_id: estimateId
    });
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing...</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Revenue Account Data Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage revenue data linked to account numbers and estimates</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white">
            <p className="text-sm opacity-90">Total Revenue</p>
            <p className="text-2xl font-bold mt-1">Rs.{formatCurrency(summary.grand_total || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
            <p className="text-sm opacity-90">Total Records</p>
            <p className="text-2xl font-bold mt-1">{totalRecords}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 text-white">
            <p className="text-sm opacity-90">Account Groups</p>
            <p className="text-2xl font-bold mt-1">{summary.data?.length || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-5 text-white">
            <p className="text-sm opacity-90">Average Per Record</p>
            <p className="text-2xl font-bold mt-1">
              Rs.{totalRecords > 0 ? formatCurrency(summary.grand_total / totalRecords) : '0.00'}
            </p>
          </div>
        </div>
      )}

      {/* Month Wise Summary */}
      {monthWiseSummary && monthWiseSummary.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Month Wise Revenue Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {monthWiseSummary.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{item.month} {item.year}</p>
                <p className="text-sm font-bold text-green-600">Rs.{formatCurrency(item.total_amount)}</p>
                <p className="text-xs text-gray-400">{item.total_records} records</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setShowAddModal(true)} 
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={16} /><span>Add Revenue Data</span>
        </button>
        <button 
          onClick={handleDelete} 
          disabled={selectedRows.length === 0} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm ${
            selectedRows.length > 0 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Trash2 size={16} /><span>Delete ({selectedRows.length})</span>
        </button>
        <button 
          onClick={() => { fetchRevenues(); fetchSummary(); fetchMonthWiseSummary(); fetchAvailableYears(); }} 
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <RefreshCw size={16} /><span>Refresh</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by revenue code name or month..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              name="account_number_id"
              value={filters.account_number_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Accounts</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.account_number} - {account.description || 'No Description'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="estimate_id"
              value={filters.estimate_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Estimates</option>
              {estimates.map(estimate => (
                <option key={estimate.id} value={estimate.id}>
                  {estimate.revenue_code_name || `Estimate #${estimate.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Months</option>
              {monthOptions.map((month, index) => (
                <option key={index} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              name="year"
              placeholder="Filter by Year (e.g., 2024)"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength="4"
            />
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input 
                    type="checkbox" 
                    checked={selectedRows.length === revenues.length && revenues.length > 0} 
                    onChange={handleSelectAll} 
                    className="rounded border-gray-300" 
                  />
                </th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Account Number</th>
                <th className="px-4 py-3 text-left">Revenue Code</th>
                <th className="px-4 py-3 text-left">Revenue Code Name</th>
                <th className="px-4 py-3 text-right">Amount(Rs.)</th>
                <th className="px-4 py-3 text-left">Month</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {revenues.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    No revenue data found. Add a new revenue record.
                  </td>
                </tr>
              ) : (
                revenues.map((revenue) => (
                  <tr key={revenue.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedRows.includes(revenue.id)} 
                        onChange={() => handleSelectRow(revenue.id)} 
                        className="rounded border-gray-300" 
                      />
                    </td>
                    <td className="px-4 py-3">{revenue.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {revenue.account_number?.account_number || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {revenue.estimate ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-mono font-semibold">
                          {formatRevenueCode(revenue.estimate)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {revenue.estimate?.revenue_code_name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {formatCurrency(revenue.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        {revenue.month || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        {revenue.year || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {revenue.created_at ? new Date(revenue.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleEdit(revenue)} 
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <select 
              value={entriesPerPage} 
              onChange={(e) => { 
                setEntriesPerPage(Number(e.target.value)); 
                setCurrentPage(1); 
              }} 
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">records</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1} 
              className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {lastPage}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))} 
              disabled={currentPage === lastPage} 
              className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Revenue Data</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Account Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <select
                  value={newRevenue.account_number_id}
                  onChange={(e) => setNewRevenue({...newRevenue, account_number_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Account Number</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.account_number} - {account.description || 'No Description'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimate Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Estimate *
                </label>
                <select
                  value={newRevenue.estimate_id}
                  onChange={handleEstimateChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Estimate</option>
                  {estimates.length === 0 ? (
                    <option value="" disabled>No estimates available</option>
                  ) : (
                    estimates.map((estimate) => (
                      <option key={estimate.id} value={estimate.id}>
                        {estimate.revenue_code_name || `Estimate #${estimate.id}`}
                        {estimate.head && ` (${formatRevenueCode(estimate)})`}
                      </option>
                    ))
                  )}
                </select>
                {estimates.length === 0 && (
                  <div className="mt-1 text-xs text-red-500">
                    No estimates found. Please add estimates first.
                  </div>
                )}
                {newRevenue.estimate_id && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ Selected: {estimates.find(e => e.id === parseInt(newRevenue.estimate_id))?.revenue_code_name || ''}
                  </div>
                )}
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newRevenue.amount}
                    onChange={(e) => setNewRevenue({...newRevenue, amount: e.target.value})}
                    className="w-full pl-8 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Month Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <select
                  value={newRevenue.month}
                  onChange={(e) => setNewRevenue({...newRevenue, month: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Month</option>
                  {monthOptions.map((month, index) => (
                    <option key={index} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Year Field - Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="text"
                  value={newRevenue.year}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers
                    if (value === '' || /^\d*$/.test(value)) {
                      setNewRevenue({...newRevenue, year: value});
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Year (e.g., 2024)"
                  maxLength="4"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a 4-digit year (e.g., 2024, 2030, 2050)</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button 
                onClick={handleAddRevenue} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Add Revenue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRevenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Revenue Data</h3>
              <button 
                onClick={() => { 
                  setShowEditModal(false); 
                  setEditingRevenue(null); 
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Account Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <select
                  value={editingRevenue.account_number_id || ''}
                  onChange={(e) => setEditingRevenue({...editingRevenue, account_number_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Account Number</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.account_number} - {account.description || 'No Description'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimate Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Estimate *
                </label>
                <select
                  value={editingRevenue.estimate_id || ''}
                  onChange={handleEditEstimateChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Estimate</option>
                  {estimates.map((estimate) => (
                    <option key={estimate.id} value={estimate.id}>
                      {estimate.revenue_code_name || `Estimate #${estimate.id}`}
                      {estimate.head && ` (${formatRevenueCode(estimate)})`}
                    </option>
                  ))}
                </select>
                {editingRevenue.estimate_id && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ Selected: {estimates.find(e => e.id === parseInt(editingRevenue.estimate_id))?.revenue_code_name || ''}
                  </div>
                )}
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingRevenue.amount || 0}
                    onChange={(e) => setEditingRevenue({...editingRevenue, amount: e.target.value})}
                    className="w-full pl-8 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Month Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <select
                  value={editingRevenue.month || ''}
                  onChange={(e) => setEditingRevenue({...editingRevenue, month: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Month</option>
                  {monthOptions.map((month, index) => (
                    <option key={index} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Year Field - Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="text"
                  value={editingRevenue.year || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers
                    if (value === '' || /^\d*$/.test(value)) {
                      setEditingRevenue({...editingRevenue, year: value});
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Year (e.g., 2024)"
                  maxLength="4"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a 4-digit year (e.g., 2024, 2030, 2050)</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => { 
                  setShowEditModal(false); 
                  setEditingRevenue(null); 
                }} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button 
                onClick={handleUpdateRevenue} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Update</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAccountData;
