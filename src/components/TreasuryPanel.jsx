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
  Download,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const TreasuryPanel = () => {
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
    total_cash: 0,
    total_xe: 0,
    total_cash_xe: 0,
    total_records: 0,
    average_cash: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    months: [],
    years: [],
    heads: [],
    programs: [],
    projects: [],
    sub_projects: [],
    objects: [],
    dr_cr: []
  });
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    sub_project: '',
    object: '',
    dr_cr: '',
    min_cash: '',
    max_cash: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [importErrors, setImportErrors] = useState([]);

  // Get current year in 2-digit format
  const currentYear = new Date().getFullYear().toString().slice(-2);

  const [newRecord, setNewRecord] = useState({
    subject: 'S',
    trno: 400,
    month: '',
    sn: '',
    dr_cr_code: '',
    head: '',
    program: '0',
    project: '',
    sub_project: '0',
    object: '',
    item: 0,
    funding: 11,
    dr_cr: '',
    cash_xe: 0,
    head_no: 400,
    year: currentYear,
    cash: 0,
    xe: 0
  });

  const monthsList = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Helper function to get auth headers
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

  const getFileUploadHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const displayNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (value === 0 || value === '0') {
      return '0';
    }
    return value;
  };

  const getMonthName = (month) => {
    const m = monthsList.find(m => m.value === month);
    return m ? m.label : '-';
  };

  const padNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return String(value).padStart(2, '0');
  };

  // Generate SN when add modal opens
  useEffect(() => {
    if (showAddModal) {
      const nextSN = totalRecords + 1;
      setNewRecord(prev => ({
        ...prev,
        sn: String(nextSN).padStart(3, '0')
      }));
    }
  }, [showAddModal, totalRecords]);

  // Fetch records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: entriesPerPage
      };

      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      });

      if (searchTerm) {
        params.sn = searchTerm;
      }

      const response = await axios.get(`${API_BASE_URL}/treasury`, {
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
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to fetch records');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/treasury/filter-options`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/treasury/summary`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setTotals(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchRecords();
    fetchFilterOptions();
    fetchSummary();
  }, [currentPage, entriesPerPage]);

  // Search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage === 1) {
        fetchRecords();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setTimeout(() => fetchRecords(), 100);
  };

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
      month: '',
      year: '',
      sub_project: '',
      object: '',
      dr_cr: '',
      min_cash: '',
      max_cash: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
    setTimeout(() => fetchRecords(), 100);
  };

  // Export data
  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/treasury/export`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const headers = ['Subject', 'TR No', 'Month', 'SN', 'DR/CR Code', 'Head', 'Program', 'Project', 'Sub Project', 'Object', 'Item', 'Funding', 'DR/CR', 'Cash/XE', 'Head No', 'Year', 'Cash', 'XE'];
        const rows = response.data.data.map(record => [
          record.subject || '',
          record.trno !== null && record.trno !== undefined ? record.trno : '',
          record.month !== null && record.month !== undefined ? record.month : '',
          record.sn || '',
          record.dr_cr_code !== null && record.dr_cr_code !== undefined ? record.dr_cr_code : '',
          record.head !== null && record.head !== undefined ? record.head : '',
          record.program !== null && record.program !== undefined ? record.program : '',
          record.project !== null && record.project !== undefined ? record.project : '',
          record.sub_project !== null && record.sub_project !== undefined ? record.sub_project : '',
          record.object !== null && record.object !== undefined ? record.object : '',
          record.item !== null && record.item !== undefined ? record.item : '',
          record.funding !== null && record.funding !== undefined ? record.funding : '',
          record.dr_cr || '',
          record.cash_xe || '',
          record.head_no !== null && record.head_no !== undefined ? record.head_no : '',
          record.year !== null && record.year !== undefined ? record.year : '',
          record.cash || '',
          record.xe || ''
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `treasury_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  // Create new record
  const handleAddRecord = async () => {
    const data = {};

    // Define fields with their default values
    const fieldsWithDefaults = {
      program: 0,
      sub_project: 0,
      year: parseInt(currentYear)
    };

    Object.keys(newRecord).forEach(key => {
      const value = newRecord[key];

      // Handle SN - auto-generate if empty
      if (key === 'sn' && (value === '' || value === null || value === undefined)) {
        const nextSN = totalRecords + 1;
        data.sn = String(nextSN).padStart(3, '0');
        return;
      }

      // Handle fields with defaults
      if (fieldsWithDefaults.hasOwnProperty(key)) {
        if (value === '' || value === null || value === undefined) {
          data[key] = fieldsWithDefaults[key];
        } else {
          if (['cash', 'xe', 'cash_xe'].includes(key)) {
            data[key] = parseFloat(value) || 0;
          } else {
            data[key] = value !== '' ? parseInt(value) : fieldsWithDefaults[key];
          }
        }
        return;
      }

      // Handle other fields
      if (value === null || value === '' || value === undefined) {
        data[key] = null;
      } else {
        if (['cash', 'xe', 'cash_xe'].includes(key)) {
          data[key] = parseFloat(value) || 0;
        } else if (['trno', 'month', 'dr_cr_code', 'head', 'program', 'project', 'sub_project', 'object', 'item', 'funding', 'head_no', 'year'].includes(key)) {
          data[key] = value !== '' ? parseInt(value) : null;
        } else {
          data[key] = value;
        }
      }
    });

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/treasury`, data, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        toast.success('Treasury record added successfully!');
        setNewRecord({
          subject: 'S',
          trno: 400,
          month: '',
          sn: '',
          dr_cr_code: '',
          head: '',
          program: '0',
          project: '',
          sub_project: '0',
          object: '',
          item: 0,
          funding: 11,
          dr_cr: '',
          cash_xe: 0,
          head_no: 400,
          year: currentYear,
          cash: 0,
          xe: 0
        });
        setShowAddModal(false);
        fetchRecords();
        fetchFilterOptions();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error adding record:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        toast.error(`Validation Error:\n${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to add record');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update record
  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    const data = {};
    Object.keys(editingRecord).forEach(key => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        const value = editingRecord[key];
        if (value === null || value === '' || value === undefined) {
          data[key] = null;
        } else {
          if (['cash', 'xe', 'cash_xe'].includes(key)) {
            data[key] = parseFloat(value) || 0;
          } else if (['trno', 'month', 'dr_cr_code', 'head', 'program', 'project', 'sub_project', 'object', 'item', 'funding', 'head_no', 'year'].includes(key)) {
            data[key] = value !== '' ? parseInt(value) : null;
          } else {
            data[key] = value;
          }
        }
      }
    });

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/treasury/${editingRecord.id}`, data, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        toast.success('Treasury record updated successfully!');
        setShowEditModal(false);
        setEditingRecord(null);
        fetchRecords();
        fetchFilterOptions();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error updating record:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        toast.error(`Validation Error:\n${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update record');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete selected records
  const handleDelete = async () => {
    if (selectedRows.length === 0) return;
    //if (!confirm(`Delete ${selectedRows.length} record(s)?`)) return;

    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/treasury/delete-multiple`, {
        data: { ids: selectedRows },
        headers: getAuthHeaders()
      });

      toast.success(response.data.message);
      setSelectedRows([]);
      fetchRecords();
      fetchFilterOptions();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting records:', error);
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

  // Delete single record
  const handleDeleteSingle = async (id) => {
    //if (!confirm(`Delete this record?`)) return;

    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/treasury/${id}`, {
        headers: getAuthHeaders()
      });

      toast.success(response.data.message);
      fetchRecords();
      fetchFilterOptions();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting record:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to delete record');
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

  // Calculate starting ID for current page
  const getStartingId = () => {
    return (currentPage - 1) * entriesPerPage + 1;
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
          <h1 className="text-2xl font-bold text-gray-800">Southern Treasury Revenue Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage treasury transactions and financial records</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
          >
            <Plus size={16} /><span>Add Record</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm transition-colors"
          >
            <Download size={16} /><span>Export</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRows.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${selectedRows.length > 0
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <Trash2 size={16} /><span>Delete ({selectedRows.length})</span>
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchRecords();
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
          >
            <RefreshCw size={16} /><span>Refresh</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by SN..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Months</option>
              {filterOptions.months?.map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {filterOptions.years?.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              name="dr_cr"
              value={filters.dr_cr}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All DR/CR</option>
              <option value="DR">DR</option>
              <option value="CR">CR</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={applyFilters} className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 transition-colors">
              Clear Filters
            </button>
            <span className="text-sm text-gray-500 ml-auto self-center">
              Total Records: {totalRecords}
            </span>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center font-semibold text-gray-700">#</th>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === records.length && records.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Revenue Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Month</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">DR/CR Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">DR/CR</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Cash/XE</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Cash (Rs)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">XE (Rs)</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No records found matching your search.' : 'No records found. Add a record.'}
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => {
                    const rowId = getStartingId() + index;
                    return (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-center text-gray-500">{rowId}</td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(record.id)}
                            onChange={() => handleSelectRow(record.id)}
                            className="rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {displayNumber(record.head)}-{padNumber(record.project)}-{padNumber(record.object)}
                        </td>
                        <td className="px-4 py-3">{getMonthName(record.month)}</td>
                        <td className="px-4 py-3">{displayNumber(record.dr_cr_code)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.dr_cr === 'DR' ? 'bg-red-100 text-red-800' :
                              record.dr_cr === 'CR' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {record.dr_cr || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatNumber(record.cash_xe)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600">
                          {formatNumber(record.cash)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          {formatNumber(record.xe)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSingle(record.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalRecords > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">records</span>
                <span className="text-sm text-gray-400 ml-2">
                  Showing {((currentPage - 1) * entriesPerPage) + 1} - {Math.min(currentPage * entriesPerPage, totalRecords)} of {totalRecords}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600">Page {currentPage} of {lastPage}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                  disabled={currentPage === lastPage}
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Treasury Record</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SN - Auto-generated */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SN</label>
                  <input
                    type="text"
                    value={newRecord.sn || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, sn: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="Auto-generated"
                    disabled={!newRecord.sn}
                  />
                  <p className="text-xs text-gray-400 mt-1">Auto-generated: {String(totalRecords + 1).padStart(3, '0')}</p>
                </div>

                {/* Year - Current Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={newRecord.year}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewRecord({ ...newRecord, year: val === '' ? currentYear : val });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="Year"
                  />
                  <p className="text-xs text-gray-400 mt-1">Default: Current Year ({currentYear})</p>
                </div>

                {/* Revenue Code Combined Row */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Code</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={newRecord.head !== null && newRecord.head !== '' ? newRecord.head : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewRecord({ ...newRecord, head: val === '' ? null : parseInt(val) });
                      }}
                      onWheel={(e) => {
                        e.preventDefault();
                        e.target.blur();
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="1002"
                    />
                    <span className="self-center text-gray-400 font-bold">-</span>
                    <input
                      type="number"
                      value={newRecord.project !== null && newRecord.project !== '' ? newRecord.project : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewRecord({ ...newRecord, project: val === '' ? null : parseInt(val) });
                      }}
                      onWheel={(e) => {
                        e.preventDefault();
                        e.target.blur();
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="04"
                    />
                    <span className="self-center text-gray-400 font-bold">-</span>
                    <input
                      type="number"
                      value={newRecord.object !== null && newRecord.object !== '' ? newRecord.object : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewRecord({ ...newRecord, object: val === '' ? null : parseInt(val) });
                      }}
                      onWheel={(e) => {
                        e.preventDefault();
                        e.target.blur();
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="03"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Format: 1002 - 04 - 03</p>
                </div>

                {/* Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={newRecord.month !== null && newRecord.month !== '' ? newRecord.month : ''}
                    onChange={(e) => setNewRecord({ ...newRecord, month: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Month</option>
                    {monthsList.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>

                {/* DR/CR Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DR/CR Code</label>
                  <input
                    type="number"
                    value={newRecord.dr_cr_code !== null && newRecord.dr_cr_code !== '' ? newRecord.dr_cr_code : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewRecord({ ...newRecord, dr_cr_code: val === '' ? null : parseInt(val) });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="DR/CR code"
                  />
                </div>

                {/* DR/CR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DR/CR</label>
                  <select
                    value={newRecord.dr_cr || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, dr_cr: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select DR/CR</option>
                    <option value="DR">DR (Debit)</option>
                    <option value="CR">CR (Credit)</option>
                  </select>
                </div>

                {/* Cash/XE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cash/XE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRecord.cash_xe !== null && newRecord.cash_xe !== '' ? newRecord.cash_xe : 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewRecord({ ...newRecord, cash_xe: val === '' ? 0 : parseFloat(val) || 0 });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                </div>

                {/* Cash */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cash</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRecord.cash !== null && newRecord.cash !== '' ? newRecord.cash : 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewRecord({ ...newRecord, cash: val === '' ? 0 : parseFloat(val) || 0 });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                </div>

                {/* XE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">XE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRecord.xe !== null && newRecord.xe !== '' ? newRecord.xe : 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewRecord({ ...newRecord, xe: val === '' ? 0 : parseFloat(val) || 0 });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRecord}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingRecord && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Treasury Record</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRecord(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SN - Auto-generated (read-only in edit) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SN</label>
                  <input
                    type="text"
                    value={editingRecord.sn || ''}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    disabled
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={editingRecord.year !== null && editingRecord.year !== undefined && editingRecord.year !== '' ? editingRecord.year : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingRecord({ ...editingRecord, year: val === '' ? null : parseInt(val) });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>

                {/* Revenue Code Combined Row */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Code</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={editingRecord.head !== null && editingRecord.head !== undefined && editingRecord.head !== '' ? editingRecord.head : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingRecord({ ...editingRecord, head: val === '' ? null : parseInt(val) });
                      }}
                      onWheel={(e) => {
                        e.preventDefault();
                        e.target.blur();
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="1002"
                    />
                    <span className="self-center text-gray-400 font-bold">-</span>
                    <input
                      type="number"
                      value={editingRecord.project !== null && editingRecord.project !== undefined && editingRecord.project !== '' ? editingRecord.project : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingRecord({ ...editingRecord, project: val === '' ? null : parseInt(val) });
                      }}
                      onWheel={(e) => {
                        e.preventDefault();
                        e.target.blur();
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="04"
                    />
                    <span className="self-center text-gray-400 font-bold">-</span>
                    <input
                      type="number"
                      value={editingRecord.object !== null && editingRecord.object !== undefined && editingRecord.object !== '' ? editingRecord.object : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingRecord({ ...editingRecord, object: val === '' ? null : parseInt(val) });
                      }}
                      onWheel={(e) => {
                        e.preventDefault();
                        e.target.blur();
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="03"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Format: 1002 - 04 - 03</p>
                </div>

                {/* Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={editingRecord.month !== null && editingRecord.month !== undefined && editingRecord.month !== '' ? editingRecord.month : ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, month: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Month</option>
                    {monthsList.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>

                {/* DR/CR Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DR/CR Code</label>
                  <input
                    type="number"
                    value={editingRecord.dr_cr_code !== null && editingRecord.dr_cr_code !== undefined && editingRecord.dr_cr_code !== '' ? editingRecord.dr_cr_code : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingRecord({ ...editingRecord, dr_cr_code: val === '' ? null : parseInt(val) });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>

                {/* DR/CR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DR/CR</label>
                  <select
                    value={editingRecord.dr_cr || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, dr_cr: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select DR/CR</option>
                    <option value="DR">DR (Debit)</option>
                    <option value="CR">CR (Credit)</option>
                  </select>
                </div>

                {/* Cash/XE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cash/XE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingRecord.cash_xe !== null && editingRecord.cash_xe !== undefined && editingRecord.cash_xe !== '' ? editingRecord.cash_xe : 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingRecord({ ...editingRecord, cash_xe: val === '' ? 0 : parseFloat(val) || 0 });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>

                {/* Cash */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cash</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingRecord.cash !== null && editingRecord.cash !== undefined && editingRecord.cash !== '' ? editingRecord.cash : 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingRecord({ ...editingRecord, cash: val === '' ? 0 : parseFloat(val) || 0 });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>

                {/* XE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">XE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingRecord.xe !== null && editingRecord.xe !== undefined && editingRecord.xe !== '' ? editingRecord.xe : 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingRecord({ ...editingRecord, xe: val === '' ? 0 : parseFloat(val) || 0 });
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.target.blur();
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRecord(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRecord}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TreasuryPanel;