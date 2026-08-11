
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
  Save,
  DollarSign,
  Calendar,
  Hash,
  Filter,
  FileText,
  Code
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const RevenueOpeningBalances = () => {
  const navigate = useNavigate();
  const [balances, setBalances] = useState([]);
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
  const [editingBalance, setEditingBalance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState(null);
  const [yearWiseSummary, setYearWiseSummary] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [filters, setFilters] = useState({
    account_number_id: '',
    year: '',
    estimate_id: ''
  });

  const [newBalance, setNewBalance] = useState({
    account_number_id: '',
    amount: '',
    year: new Date().getFullYear().toString(),
    estimate_id: ''
  });

  // Helper function to format revenue code from estimate (head-project-object)
  const padNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return '00';
    }
    return String(value).padStart(2, '0');
  };

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
      const response = await axios.get(`${API_BASE_URL}/revenue-opening-balances/revenue-code-options`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setEstimates(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
    }
  };

  // Fetch available years
  const fetchAvailableYears = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/revenue-opening-balances/filter-options`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setAvailableYears(response.data.data.years || []);
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
    }
  };

  // Fetch balances
  const fetchBalances = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: entriesPerPage,
        search: searchTerm,
        ...filters
      };

      const response = await axios.get(`${API_BASE_URL}/revenue-opening-balances`, {
        params,
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setBalances(response.data.data || []);
        setTotalRecords(response.data.pagination?.total || 0);
        setLastPage(response.data.pagination?.last_page || 1);
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to fetch opening balances');
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
      const response = await axios.get(`${API_BASE_URL}/revenue-opening-balances/summary`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Fetch year wise summary
  const fetchYearWiseSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/revenue-opening-balances/year-wise-summary`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setYearWiseSummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching year wise summary:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBalances();
    fetchAccounts();
    fetchSummary();
    fetchYearWiseSummary();
    fetchEstimates();
    fetchAvailableYears();
  }, [currentPage, entriesPerPage, searchTerm, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Handle estimate selection
  const handleEstimateChange = (e) => {
    const estimateId = e.target.value;
    setNewBalance({
      ...newBalance,
      estimate_id: estimateId
    });
  };

  // Create new balance
  const handleAddBalance = async () => {
    if (!newBalance.account_number_id) {
      toast.error('Please select an Account Number');
      return;
    }
    if (!newBalance.estimate_id) {
      toast.error('Please select an Estimate');
      return;
    }
    if (!newBalance.amount || parseFloat(newBalance.amount) <= 0) {
      toast.error('Please enter a valid Amount');
      return;
    }
    if (!newBalance.year) {
      toast.error('Please enter a Year');
      return;
    }
    if (!/^\d{4}$/.test(newBalance.year)) {
      toast.error('Please enter a valid 4-digit Year (e.g., 2024)');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/revenue-opening-balances`, {
        account_number_id: parseInt(newBalance.account_number_id),
        amount: parseFloat(newBalance.amount),
        year: parseInt(newBalance.year),
        estimate_id: parseInt(newBalance.estimate_id)
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        toast.success('Opening balance added successfully!');
        setNewBalance({
          account_number_id: '',
          amount: '',
          year: new Date().getFullYear().toString(),
          estimate_id: ''
        });
        setShowAddModal(false);
        fetchBalances();
        fetchSummary();
        fetchYearWiseSummary();
        fetchAvailableYears();
      }
    } catch (error) {
      console.error('Error adding balance:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add opening balance');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update balance
  const handleUpdateBalance = async () => {
    if (!editingBalance) return;

    if (!editingBalance.account_number_id) {
      toast.error('Please select an Account Number');
      return;
    }
    if (!editingBalance.estimate_id) {
      toast.error('Please select an Estimate');
      return;
    }
    if (!editingBalance.amount || parseFloat(editingBalance.amount) <= 0) {
      toast.error('Please enter a valid Amount');
      return;
    }
    if (!editingBalance.year) {
      toast.error('Please enter a Year');
      return;
    }
    if (!/^\d{4}$/.test(editingBalance.year)) {
      toast.error('Please enter a valid 4-digit Year (e.g., 2024)');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/revenue-opening-balances/${editingBalance.id}`, {
        account_number_id: parseInt(editingBalance.account_number_id),
        amount: parseFloat(editingBalance.amount),
        year: parseInt(editingBalance.year),
        estimate_id: parseInt(editingBalance.estimate_id)
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        toast.success('Opening balance updated successfully!');
        setShowEditModal(false);
        setEditingBalance(null);
        fetchBalances();
        fetchSummary();
        fetchYearWiseSummary();
        fetchAvailableYears();
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update opening balance');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete selected balances
  const handleDelete = async () => {
    if (selectedRows.length === 0) return;
    //if (!confirm(`Delete ${selectedRows.length} record(s)?`)) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/revenue-opening-balances/delete-multiple`, {
        ids: selectedRows
      }, { headers: getAuthHeaders() });

      toast.success(response.data.message);
      setSelectedRows([]);
      fetchBalances();
      fetchSummary();
      fetchYearWiseSummary();
      fetchAvailableYears();
    } catch (error) {
      console.error('Error deleting balances:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to delete records');
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
    if (selectedRows.length === balances.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(balances.map(balance => balance.id));
    }
  };

  const handleEdit = (balance) => {
    setEditingBalance({
      ...balance,
      account_number_id: balance.account_number_id,
      estimate_id: balance.estimate_id || '',
      year: balance.year ? balance.year.toString() : new Date().getFullYear().toString()
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
    setEditingBalance({
      ...editingBalance,
      estimate_id: estimateId
    });
  };

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Revenue Opening Balances</h1>
          <p className="text-sm text-gray-500 mt-1">Manage revenue opening balances by account number, estimate, and year</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus size={16} /><span>Add Opening Balance</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRows.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm ${selectedRows.length > 0
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <Trash2 size={16} /><span>Delete ({selectedRows.length})</span>
          </button>
          <button
            onClick={() => { fetchBalances(); fetchSummary(); fetchYearWiseSummary(); fetchAvailableYears(); }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <RefreshCw size={16} /><span>Refresh</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by account number or year..."
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

        {/* Balances Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === balances.length && balances.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Account Number</th>
                  <th className="px-4 py-3 text-left">Revenue Code</th>
                  <th className="px-4 py-3 text-left">Revenue Code Name</th>
                  <th className="px-4 py-3 text-right">Amount (Rs.)</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-left">Created At</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {balances.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      No opening balances found. Add a new opening balance.
                    </td>
                  </tr>
                ) : (
                  balances.map((balance) => (
                    <tr key={balance.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(balance.id)}
                          onChange={() => handleSelectRow(balance.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">{balance.id}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {balance.account_number?.account_number || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {balance.estimate ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-mono font-semibold">
                            {formatRevenueCode(balance.estimate)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {balance.estimate?.revenue_code_name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        {formatCurrency(balance.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                          {balance.year || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {balance.created_at ? new Date(balance.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEdit(balance)}
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
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Opening Balance</h3>
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
                    value={newBalance.account_number_id}
                    onChange={(e) => setNewBalance({ ...newBalance, account_number_id: e.target.value })}
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
                    value={newBalance.estimate_id}
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
                  {newBalance.estimate_id && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Selected: {estimates.find(e => e.id === parseInt(newBalance.estimate_id))?.revenue_code_name || ''}
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
                      value={newBalance.amount}
                      onChange={(e) => setNewBalance({ ...newBalance, amount: e.target.value })}
                      className="w-full pl-8 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Year Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    value={newBalance.year}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*$/.test(value)) {
                        setNewBalance({ ...newBalance, year: value });
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
                  onClick={handleAddBalance}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Add Balance</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingBalance && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Opening Balance</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBalance(null);
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
                    value={editingBalance.account_number_id || ''}
                    onChange={(e) => setEditingBalance({ ...editingBalance, account_number_id: e.target.value })}
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
                    value={editingBalance.estimate_id || ''}
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
                  {editingBalance.estimate_id && (
                    <div className="mt-1 text-xs text-green-600">
                      ✓ Selected: {estimates.find(e => e.id === parseInt(editingBalance.estimate_id))?.revenue_code_name || ''}
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
                      value={editingBalance.amount || 0}
                      onChange={(e) => setEditingBalance({ ...editingBalance, amount: e.target.value })}
                      className="w-full pl-8 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Year Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    value={editingBalance.year || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*$/.test(value)) {
                        setEditingBalance({ ...editingBalance, year: value });
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
                    setEditingBalance(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleUpdateBalance}
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
    </>
  );
};

export default RevenueOpeningBalances;