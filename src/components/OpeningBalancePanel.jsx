import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  X,
  Edit,
  Upload,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  Hash
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const OpeningBalancePanel = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [totals, setTotals] = useState({
    total_balance: 0,
    total_records: 0
  });
  const [filters, setFilters] = useState({
    head: '',
    year: '',
    min_balance: '',
    max_balance: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    years: [],
    heads: []
  });

  const [newRecord, setNewRecord] = useState({
    head: '',
    year: '',
    opening_balance: ''
  });

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

  // Helper function for file upload headers
  const getFileUploadHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Helper functions
  const displayNumber = (value) => {
    if (value === null || value === undefined) return '-';
    if (value === 0) return '0';
    return value;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  // Fetch records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: entriesPerPage,
        ...filters
      };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await axios.get(`${API_BASE_URL}/opening-balance/records`, { 
        params, 
        headers: getAuthHeaders() 
      });
      
      if (response.data.success) {
        setRecords(response.data.data || []);
        setTotalRecords(response.data.pagination?.total || 0);
        setLastPage(response.data.pagination?.last_page || 1);
        if (response.data.totals) {
          setTotals(response.data.totals);
        }
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to fetch records');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary and filter options
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/opening-balance/summary`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setTotals(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/opening-balance/filter-options`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchRecords();
    fetchSummary();
    fetchFilterOptions();
  }, [currentPage, entriesPerPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchRecords();
  };

  const clearFilters = () => {
    setFilters({ head: '', year: '', min_balance: '', max_balance: '' });
    setCurrentPage(1);
    setTimeout(() => fetchRecords(), 100);
  };

  // Import Excel file
  const handleImport = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/opening-balance/import`, formData, {
        headers: getFileUploadHeaders()
      });

      if (response.data.success) {
        alert(`Import successful! Imported: ${response.data.imported_count} records`);
        setShowImportModal(false);
        setSelectedFile(null);
        fetchRecords();
        fetchSummary();
        fetchFilterOptions();
      }
    } catch (error) {
      console.error('Error importing:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Import failed');
      }
    } finally {
      setUploading(false);
    }
  };

  // Create new record
  const handleAddRecord = async () => {
    if (!newRecord.head || !newRecord.year || !newRecord.opening_balance) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/opening-balance/records`, {
        head: parseInt(newRecord.head),
        year: parseInt(newRecord.year),
        opening_balance: parseFloat(newRecord.opening_balance)
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        alert('Record added successfully!');
        setNewRecord({ head: '', year: '', opening_balance: '' });
        setShowAddModal(false);
        fetchRecords();
        fetchSummary();
        fetchFilterOptions();
      }
    } catch (error) {
      console.error('Error adding record:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to add record');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update record
  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/opening-balance/records/${editingRecord.id}`, {
        head: editingRecord.head ? parseInt(editingRecord.head) : null,
        year: editingRecord.year ? parseInt(editingRecord.year) : null,
        opening_balance: parseFloat(editingRecord.opening_balance) || 0
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        alert('Record updated successfully!');
        setShowEditModal(false);
        setEditingRecord(null);
        fetchRecords();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error updating record:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to update record');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete selected records
  const handleDelete = async () => {
    if (selectedRows.length === 0) return;
    if (!confirm(`Delete ${selectedRows.length} record(s)?`)) return;

    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/opening-balance/records`, {
        data: { ids: selectedRows },
        headers: getAuthHeaders()
      });
      
      alert(response.data.message);
      setSelectedRows([]);
      fetchRecords();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting records:', error);
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
    if (selectedRows.length === records.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(records.map(record => record.id));
    }
  };

  const handleEdit = (record) => {
    setEditingRecord({ ...record });
    setShowEditModal(true);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {(loading || uploading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{uploading ? 'Uploading...' : 'Processing...'}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Opening Balance Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage opening balances for different budget heads and financial years</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Opening Balance</p>
          <p className="text-2xl font-bold mt-1">Rs.{formatNumber(totals?.total_balance || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Records</p>
          <p className="text-2xl font-bold mt-1">{totalRecords}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Average Balance</p>
          <p className="text-2xl font-bold mt-1">Rs.{formatNumber(totals?.average_balance || 0)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={16} /><span>Add Opening Balance</span>
        </button>
        <button onClick={() => setShowImportModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
          <Upload size={16} /><span>Import Excel</span>
        </button>
        <button onClick={handleDelete} disabled={selectedRows.length === 0} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm ${selectedRows.length > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
          <Trash2 size={16} /><span>Delete ({selectedRows.length})</span>
        </button>
        <button onClick={fetchRecords} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          <RefreshCw size={16} /><span>Refresh</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select name="year" value={filters.year} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Years</option>
            {filterOptions.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <input type="text" name="head" placeholder="Head Code" value={filters.head} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="number" name="min_balance" placeholder="Min Balance" value={filters.min_balance} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="number" name="max_balance" placeholder="Max Balance" value={filters.max_balance} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={applyFilters} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Apply Filters</button>
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700">Clear Filters</button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-8"><input type="checkbox" checked={selectedRows.length === records.length && records.length > 0} onChange={handleSelectAll} className="rounded border-gray-300" /></th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Head Code</th>
                <th className="px-4 py-3 text-left">Financial Year</th>
                <th className="px-4 py-3 text-right">Opening Balance (Rs)</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No records found. Add an opening balance or import Excel.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedRows.includes(record.id)} onChange={() => handleSelectRow(record.id)} className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3">{record.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{displayNumber(record.head)}</td>
                    <td className="px-4 py-3">{record.year || '-'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      {formatNumber(record.opening_balance)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {record.created_at ? new Date(record.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800">
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
            <select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">records</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={16} /></button>
            <span className="text-sm text-gray-600">Page {currentPage} of {lastPage}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))} disabled={currentPage === lastPage} className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Import Excel File</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Upload .xlsx, .xls, or .csv files</p>
            <p className="text-xs text-gray-400 mb-2">Required columns: head, year, opening_balance</p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setSelectedFile(e.target.files[0])} className="w-full border rounded-lg px-3 py-2 mb-4" />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleImport} disabled={!selectedFile} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Opening Balance</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head Code *</label>
                <input type="number" value={newRecord.head} onChange={(e) => setNewRecord({...newRecord, head: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., 101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year *</label>
                <select value={newRecord.year} onChange={(e) => setNewRecord({...newRecord, year: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select Year</option>
                  {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance (Rs) *</label>
                <input type="number" step="0.01" value={newRecord.opening_balance} onChange={(e) => setNewRecord({...newRecord, opening_balance: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="0.00" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleAddRecord} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Opening Balance</h3>
              <button onClick={() => { setShowEditModal(false); setEditingRecord(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head Code</label>
                <input type="number" value={editingRecord.head || ''} onChange={(e) => setEditingRecord({...editingRecord, head: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
                <select value={editingRecord.year || ''} onChange={(e) => setEditingRecord({...editingRecord, year: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select Year</option>
                  {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance (Rs)</label>
                <input type="number" step="0.01" value={editingRecord.opening_balance || 0} onChange={(e) => setEditingRecord({...editingRecord, opening_balance: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowEditModal(false); setEditingRecord(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleUpdateRecord} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpeningBalancePanel;