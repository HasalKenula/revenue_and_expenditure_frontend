import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  X,
  Edit,
  Upload,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const MonthlyFinancePanel = () => {
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
    cash: 0,
    xe: 0,
    cash_xe: 0
  });
  const [filters, setFilters] = useState({
    subject: '',
    trno: '',
    month: '',
    year: '',
    head: '',
    program: '',
    project: '',
    dr_cr: '',
    min_amount: '',
    max_amount: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    subjects: [],
    months: [],
    years: [],
    heads: [],
    programs: [],
    projects: [],
    dr_cr: ['Dr', 'Cr']
  });

  const [newRecord, setNewRecord] = useState({
    subject: '',
    trno: '',
    month: '',
    year: '',
    head: '',
    program: '',
    project: '',
    sub_project: '',
    object: '',
    item: '',
    funding: '',
    dr_cr: '',
    cash: '',
    xe: '',
    sn: '',
    dr_cr_code: '',
    head_no: ''
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

  // Helper function to display value (show 0 instead of - for numbers)
  const displayValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'number') {
      return value;
    }
    return value;
  };

  // Helper function to display number (always show 0 for zero)
  const displayNumber = (value) => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (value === 0) {
      return '0';
    }
    return value;
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

      const response = await axios.get(`${API_BASE_URL}/monthly-finance/records`, { 
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
      const response = await axios.get(`${API_BASE_URL}/monthly-finance/summary`, {
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
      const response = await axios.get(`${API_BASE_URL}/monthly-finance/filter-options`, {
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
    setFilters({
      subject: '',
      trno: '',
      month: '',
      year: '',
      head: '',
      program: '',
      project: '',
      dr_cr: '',
      min_amount: '',
      max_amount: ''
    });
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
      const response = await axios.post(`${API_BASE_URL}/monthly-finance/import`, formData, {
        headers: getFileUploadHeaders()
      });

      if (response.data.success) {
        alert(`Import successful! Imported`);
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
    if (!newRecord.subject) {
      alert('Please fill Subject');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/monthly-finance/records`, {
        subject: newRecord.subject,
        trno: newRecord.trno ? parseInt(newRecord.trno) : null,
        month: newRecord.month ? parseInt(newRecord.month) : null,
        year: newRecord.year ? parseInt(newRecord.year) : null,
        head: newRecord.head ? parseInt(newRecord.head) : null,
        program: newRecord.program ? parseInt(newRecord.program) : null,
        project: newRecord.project ? parseInt(newRecord.project) : null,
        sub_project: newRecord.sub_project ? parseInt(newRecord.sub_project) : null,
        object: newRecord.object ? parseInt(newRecord.object) : null,
        item: newRecord.item ? parseInt(newRecord.item) : null,
        funding: newRecord.funding ? parseInt(newRecord.funding) : null,
        dr_cr: newRecord.dr_cr,
        cash: parseFloat(newRecord.cash) || 0,
        xe: parseFloat(newRecord.xe) || 0,
        sn: newRecord.sn,
        dr_cr_code: newRecord.dr_cr_code ? parseInt(newRecord.dr_cr_code) : null,
        head_no: newRecord.head_no ? parseInt(newRecord.head_no) : null
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        alert('Record added successfully!');
        setNewRecord({
          subject: '', trno: '', month: '', year: '', head: '', program: '',
          project: '', sub_project: '', object: '', item: '', funding: '',
          dr_cr: '', cash: '', xe: '', sn: '', dr_cr_code: '', head_no: ''
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
      const response = await axios.put(`${API_BASE_URL}/monthly-finance/records/${editingRecord.id}`, {
        subject: editingRecord.subject,
        trno: editingRecord.trno ? parseInt(editingRecord.trno) : null,
        month: editingRecord.month ? parseInt(editingRecord.month) : null,
        year: editingRecord.year ? parseInt(editingRecord.year) : null,
        head: editingRecord.head ? parseInt(editingRecord.head) : null,
        program: editingRecord.program ? parseInt(editingRecord.program) : null,
        project: editingRecord.project ? parseInt(editingRecord.project) : null,
        sub_project: editingRecord.sub_project ? parseInt(editingRecord.sub_project) : null,
        object: editingRecord.object ? parseInt(editingRecord.object) : null,
        item: editingRecord.item ? parseInt(editingRecord.item) : null,
        funding: editingRecord.funding ? parseInt(editingRecord.funding) : null,
        dr_cr: editingRecord.dr_cr,
        cash: parseFloat(editingRecord.cash) || 0,
        xe: parseFloat(editingRecord.xe) || 0,
        sn: editingRecord.sn,
        dr_cr_code: editingRecord.dr_cr_code ? parseInt(editingRecord.dr_cr_code) : null,
        head_no: editingRecord.head_no ? parseInt(editingRecord.head_no) : null
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
      const response = await axios.delete(`${API_BASE_URL}/monthly-finance/records`, {
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

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Monthly Finance Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage monthly financial transactions and records</p>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Cash</p>
          <p className="text-2xl font-bold mt-1">Rs{formatNumber(totals?.cash || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total XE</p>
          <p className="text-2xl font-bold mt-1">Rs{formatNumber(totals?.xe || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Cash + XE</p>
          <p className="text-2xl font-bold mt-1">Rs{formatNumber(totals?.cash_xe || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Records</p>
          <p className="text-2xl font-bold mt-1">{totalRecords}</p>
        </div>
      </div> */}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={16} /><span>Add Record</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <input type="text" name="subject" placeholder="Subject" value={filters.subject} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="text" name="trno" placeholder="TR No" value={filters.trno} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <select name="month" value={filters.month} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Months</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select name="year" value={filters.year} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select name="dr_cr" value={filters.dr_cr} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Dr/Cr</option>
            <option value="Dr">Dr</option>
            <option value="Cr">Cr</option>
          </select>
          <input type="number" name="min_amount" placeholder="Min Amount" value={filters.min_amount} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="number" name="max_amount" placeholder="Max Amount" value={filters.max_amount} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={applyFilters} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Apply Filters</button>
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700">Clear Filters</button>
        </div>
      </div>

      {/* Records Table - Showing ALL Columns */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-3 w-8"><input type="checkbox" checked={selectedRows.length === records.length && records.length > 0} onChange={handleSelectAll} className="rounded border-gray-300" /></th>
                {/* <th className="px-2 py-3 text-left">ID</th> */}
                <th className="px-2 py-3 text-left">Subject</th>
                <th className="px-2 py-3 text-left">TR No</th>
                <th className="px-2 py-3 text-left">SN</th>
                <th className="px-2 py-3 text-left">Dr/Cr Code</th>
                <th className="px-2 py-3 text-left">Head</th>
                <th className="px-2 py-3 text-left">Program</th>
                <th className="px-2 py-3 text-left">Project</th>
                <th className="px-2 py-3 text-left">Sub Project</th>
                <th className="px-2 py-3 text-left">Object</th>
                <th className="px-2 py-3 text-left">Item</th>
                <th className="px-2 py-3 text-left">Funding</th>
                <th className="px-2 py-3 text-left">Dr/Cr</th>
                <th className="px-2 py-3 text-left">Head No</th>
                <th className="px-2 py-3 text-left">Year</th>
                <th className="px-2 py-3 text-left">Month</th>
                <th className="px-2 py-3 text-right">Cash (Rs)</th>
                <th className="px-2 py-3 text-right">XE (Rs)</th>
                <th className="px-2 py-3 text-right">Cash + XE (Rs)</th>
                <th className="px-2 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="21" className="text-center py-8 text-gray-500">
                    No records found. Add a record or import Excel.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <input type="checkbox" checked={selectedRows.includes(record.id)} onChange={() => handleSelectRow(record.id)} className="rounded border-gray-300" />
                    </td>
                    {/* <td className="px-2 py-2">{record.id}</td> */}
                    <td className="px-2 py-2 max-w-xs truncate">{record.subject || '-'}</td>
                    <td className="px-2 py-2">{displayNumber(record.trno)}</td>
                    <td className="px-2 py-2">{displayValue(record.sn)}</td>
                    <td className="px-2 py-2">{displayNumber(record.dr_cr_code)}</td>
                    <td className="px-2 py-2">{displayNumber(record.head)}</td>
                    <td className="px-2 py-2">{displayNumber(record.program)}</td>
                    <td className="px-2 py-2">{displayNumber(record.project)}</td>
                    <td className="px-2 py-2">{displayNumber(record.sub_project)}</td>
                    <td className="px-2 py-2">{displayNumber(record.object)}</td>
                    <td className="px-2 py-2">{displayNumber(record.item)}</td>
                    <td className="px-2 py-2">{displayNumber(record.funding)}</td>
                    <td className="px-2 py-2">{displayValue(record.dr_cr)}</td>
                    <td className="px-2 py-2">{displayNumber(record.head_no)}</td>
                    <td className="px-2 py-2">{record.year || '-'}</td>
                    <td className="px-2 py-2">{record.month ? months.find(m => m.value === record.month)?.label : '-'}</td>
                    <td className="px-2 py-2 text-right">Rs{formatNumber(record.cash)}</td>
                    <td className="px-2 py-2 text-right">Rs{formatNumber(record.xe)}</td>
                    <td className="px-2 py-2 text-right font-semibold text-blue-600">Rs{formatNumber(record.cash_xe)}</td>
                    <td className="px-2 py-2 text-center">
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
          <div className="bg-white rounded-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Monthly Finance Record</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Subject *</label><input type="text" value={newRecord.subject} onChange={(e) => setNewRecord({...newRecord, subject: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">TR No</label><input type="number" value={newRecord.trno} onChange={(e) => setNewRecord({...newRecord, trno: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">SN</label><input type="text" value={newRecord.sn} onChange={(e) => setNewRecord({...newRecord, sn: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Dr/Cr Code</label><input type="number" value={newRecord.dr_cr_code} onChange={(e) => setNewRecord({...newRecord, dr_cr_code: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Head</label><input type="number" value={newRecord.head} onChange={(e) => setNewRecord({...newRecord, head: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Program</label><input type="number" value={newRecord.program} onChange={(e) => setNewRecord({...newRecord, program: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Project</label><input type="number" value={newRecord.project} onChange={(e) => setNewRecord({...newRecord, project: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Sub Project</label><input type="number" value={newRecord.sub_project} onChange={(e) => setNewRecord({...newRecord, sub_project: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Object</label><input type="number" value={newRecord.object} onChange={(e) => setNewRecord({...newRecord, object: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Item</label><input type="number" value={newRecord.item} onChange={(e) => setNewRecord({...newRecord, item: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Funding</label><input type="number" value={newRecord.funding} onChange={(e) => setNewRecord({...newRecord, funding: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Dr/Cr</label><select value={newRecord.dr_cr} onChange={(e) => setNewRecord({...newRecord, dr_cr: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="">Select</option><option value="Dr">Dr</option><option value="Cr">Cr</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Head No</label><input type="number" value={newRecord.head_no} onChange={(e) => setNewRecord({...newRecord, head_no: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Year</label><select value={newRecord.year} onChange={(e) => setNewRecord({...newRecord, year: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="">Select</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Month</label><select value={newRecord.month} onChange={(e) => setNewRecord({...newRecord, month: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="">Select</option>{months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Cash (Rs)</label><input type="number" step="0.01" value={newRecord.cash} onChange={(e) => setNewRecord({...newRecord, cash: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">XE (Rs)</label><input type="number" step="0.01" value={newRecord.xe} onChange={(e) => setNewRecord({...newRecord, xe: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
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
          <div className="bg-white rounded-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Record</h3>
              <button onClick={() => { setShowEditModal(false); setEditingRecord(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label>Subject</label><input type="text" value={editingRecord.subject || ''} onChange={(e) => setEditingRecord({...editingRecord, subject: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label>TR No</label><input type="number" value={editingRecord.trno || ''} onChange={(e) => setEditingRecord({...editingRecord, trno: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label>Head</label><input type="number" value={editingRecord.head || ''} onChange={(e) => setEditingRecord({...editingRecord, head: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label>Program</label><input type="number" value={editingRecord.program || ''} onChange={(e) => setEditingRecord({...editingRecord, program: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label>Project</label><input type="number" value={editingRecord.project || ''} onChange={(e) => setEditingRecord({...editingRecord, project: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label>Cash (Rs)</label><input type="number" step="0.01" value={editingRecord.cash || 0} onChange={(e) => setEditingRecord({...editingRecord, cash: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label>XE (Rs)</label><input type="number" step="0.01" value={editingRecord.xe || 0} onChange={(e) => setEditingRecord({...editingRecord, xe: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label>Dr/Cr</label><select value={editingRecord.dr_cr || ''} onChange={(e) => setEditingRecord({...editingRecord, dr_cr: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="">Select</option><option value="Dr">Dr</option><option value="Cr">Cr</option></select></div>
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

export default MonthlyFinancePanel;