import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  X,
  Edit,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const SupplementaryPanel = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState(null);
  const [totals, setTotals] = useState({
    fr66p: 0,
    fr66m: 0,
    supplementary: 0,
    total_records: 0
  });
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    head: '',
    program: ''
  });

  const [newRecord, setNewRecord] = useState({
    order_number: '',
    year: '',
    month: '',
    head: '',
    program: '',
    project: '',
    subproject: '',
    object: '',
    subobject: '',
    fr66p: '',
    fr66m: '',
    supplementary_amount: ''
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

  // Fetch records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: entriesPerPage,
      };
      
      if (filters.year) params.year = filters.year;
      if (filters.month) params.month = filters.month;
      if (filters.head) params.head = filters.head;
      if (filters.program) params.program = filters.program;

      const response = await axios.get(`${API_BASE_URL}/supplementary/records`, { 
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

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/supplementary/summary`, {
        headers: getAuthHeaders()
      });
      if (response.data.success && response.data.data) {
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchRecords();
    fetchSummary();
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
    setFilters({ year: '', month: '', head: '', program: '' });
    setCurrentPage(1);
    setTimeout(() => fetchRecords(), 100);
  };

  // Create new record
  const handleAddRecord = async () => {
    if (!newRecord.order_number) {
      alert('Please fill Order Number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/supplementary/records`, {
        order_number: newRecord.order_number,
        year: newRecord.year ? parseInt(newRecord.year) : null,
        month: newRecord.month ? parseInt(newRecord.month) : null,
        head: newRecord.head ? parseInt(newRecord.head) : null,
        program: newRecord.program ? parseInt(newRecord.program) : null,
        project: newRecord.project ? parseInt(newRecord.project) : null,
        subproject: newRecord.subproject ? parseInt(newRecord.subproject) : null,
        object: newRecord.object ? parseInt(newRecord.object) : null,
        subobject: newRecord.subobject ? parseInt(newRecord.subobject) : null,
        fr66p: parseFloat(newRecord.fr66p) || 0,
        fr66m: parseFloat(newRecord.fr66m) || 0,
        supplementary_amount: parseFloat(newRecord.supplementary_amount) || 0
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        alert('Record added successfully!');
        setNewRecord({
          order_number: '',
          year: '',
          month: '',
          head: '',
          program: '',
          project: '',
          subproject: '',
          object: '',
          subobject: '',
          fr66p: '',
          fr66m: '',
          supplementary_amount: ''
        });
        setShowAddModal(false);
        fetchRecords();
        fetchSummary();
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
      const response = await axios.put(`${API_BASE_URL}/supplementary/records/${editingRecord.id}`, {
        order_number: editingRecord.order_number,
        year: editingRecord.year ? parseInt(editingRecord.year) : null,
        month: editingRecord.month ? parseInt(editingRecord.month) : null,
        head: editingRecord.head ? parseInt(editingRecord.head) : null,
        program: editingRecord.program ? parseInt(editingRecord.program) : null,
        project: editingRecord.project ? parseInt(editingRecord.project) : null,
        subproject: editingRecord.subproject ? parseInt(editingRecord.subproject) : null,
        object: editingRecord.object ? parseInt(editingRecord.object) : null,
        subobject: editingRecord.subobject ? parseInt(editingRecord.subobject) : null,
        fr66p: parseFloat(editingRecord.fr66p) || 0,
        fr66m: parseFloat(editingRecord.fr66m) || 0,
        supplementary_amount: parseFloat(editingRecord.supplementary_amount) || 0
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
      for (const id of selectedRows) {
        await axios.delete(`${API_BASE_URL}/supplementary/records/${id}`, {
          headers: getAuthHeaders()
        });
      }
      alert(`${selectedRows.length} record(s) deleted successfully`);
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

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Safe number formatting function
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 });
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
        <h1 className="text-2xl font-bold text-gray-800">Supplementary Budget Management</h1>
        <p className="text-sm text-gray-500 mt-1">Record and manage supplementary budget allocations (FR66P/FR66M)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total FR66P</p>
          <p className="text-2xl font-bold mt-1">Rs{formatNumber(totals?.fr66p || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total FR66M</p>
          <p className="text-2xl font-bold mt-1">Rs{formatNumber(totals?.fr66m || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Supplementary</p>
          <p className="text-2xl font-bold mt-1">Rs{formatNumber(totals?.supplementary || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Records</p>
          <p className="text-2xl font-bold mt-1">{totalRecords}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={16} />
          <span>Add Supplementary Record</span>
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
          <Trash2 size={16} />
          <span>Delete ({selectedRows.length})</span>
        </button>
        <button
          onClick={fetchRecords}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Months</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <input
            type="text"
            name="head"
            placeholder="Head Code"
            value={filters.head}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            name="program"
            placeholder="Program Code"
            value={filters.program}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={applyFilters} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            Apply Filters
          </button>
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === records.length && records.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Year/Month</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Head</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Program</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Object</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">FR30P</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">FR30M</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Supplementary</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    No records found. Add a supplementary record.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(record.id)}
                        onChange={() => handleSelectRow(record.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.order_number || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {months.find(m => m.value === record.month)?.label || record.month} {record.year}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.head || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.program || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.project || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.object || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">Rs{formatNumber(record.fr66p)}</td>
                    <td className="px-4 py-3 text-sm text-right">Rs{formatNumber(record.fr66m)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">
                      Rs{formatNumber(record.supplementary_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(record)}
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">records</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {lastPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
              disabled={currentPage === lastPage}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Supplementary Record</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Add Modal Fields - Same as before */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
                <input
                  type="text"
                  value={newRecord.order_number}
                  onChange={(e) => setNewRecord({...newRecord, order_number: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={newRecord.year}
                  onChange={(e) => setNewRecord({...newRecord, year: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={newRecord.month}
                  onChange={(e) => setNewRecord({...newRecord, month: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head Code</label>
                <input
                  type="number"
                  value={newRecord.head}
                  onChange={(e) => setNewRecord({...newRecord, head: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Code</label>
                <input
                  type="number"
                  value={newRecord.program}
                  onChange={(e) => setNewRecord({...newRecord, program: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
                <input
                  type="number"
                  value={newRecord.project}
                  onChange={(e) => setNewRecord({...newRecord, project: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subproject Code</label>
                <input
                  type="number"
                  value={newRecord.subproject}
                  onChange={(e) => setNewRecord({...newRecord, subproject: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Object Code</label>
                <input
                  type="number"
                  value={newRecord.object}
                  onChange={(e) => setNewRecord({...newRecord, object: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subobject Code</label>
                <input
                  type="number"
                  value={newRecord.subobject}
                  onChange={(e) => setNewRecord({...newRecord, subobject: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FR30P (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRecord.fr66p}
                  onChange={(e) => setNewRecord({...newRecord, fr66p: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FR30M (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRecord.fr66m}
                  onChange={(e) => setNewRecord({...newRecord, fr66m: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplementary Amount (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRecord.supplementary_amount}
                  onChange={(e) => setNewRecord({...newRecord, supplementary_amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Supplementary Record</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRecord(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                <input
                  type="text"
                  value={editingRecord.order_number || ''}
                  onChange={(e) => setEditingRecord({...editingRecord, order_number: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={editingRecord.year || ''}
                  onChange={(e) => setEditingRecord({...editingRecord, year: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={editingRecord.month || ''}
                  onChange={(e) => setEditingRecord({...editingRecord, month: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head Code</label>
                <input
                  type="number"
                  value={editingRecord.head || ''}
                  onChange={(e) => setEditingRecord({...editingRecord, head: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Code</label>
                <input
                  type="number"
                  value={editingRecord.program || ''}
                  onChange={(e) => setEditingRecord({...editingRecord, program: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FR30P (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingRecord.fr66p || 0}
                  onChange={(e) => setEditingRecord({...editingRecord, fr66p: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FR30M (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingRecord.fr66m || 0}
                  onChange={(e) => setEditingRecord({...editingRecord, fr66m: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplementary Amount (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingRecord.supplementary_amount || 0}
                  onChange={(e) => setEditingRecord({...editingRecord, supplementary_amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRecord(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRecord}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplementaryPanel;