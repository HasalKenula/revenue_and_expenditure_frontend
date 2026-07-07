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
  Search,
  Download,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const EstimatePanel = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [totals, setTotals] = useState({
    total_estimate: 0,
    total_re_estimate: 0,
    total_records: 0,
    average_estimate: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    heads: [],
    programs: [],
    projects: [],
    sub_projects: [],
    objects: []
  });
  const [filters, setFilters] = useState({
    head: '',
    program: '',
    project: '',
    sub_project: '',
    object: '',
    min_estimate: '',
    max_estimate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [importErrors, setImportErrors] = useState([]);

  const [newRecord, setNewRecord] = useState({
    head: '',
    program: '',
    project: '',
    sub_project: '',
    object: '',
    revenue_code_name: '',
    estimate: '',
    re_estimate: ''
  });

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
    if (value === null || value === undefined) return '-';
    if (value === 0) return '0';
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

      if (searchTerm) {
        params.revenue_code_name = searchTerm;
      }

      Object.keys(params).forEach(key => {
        if (!params[key] && params[key] !== 0) delete params[key];
      });

      const response = await axios.get(`${API_BASE_URL}/estimates`, { 
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

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/estimates/filter-options`, {
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
      const response = await axios.get(`${API_BASE_URL}/estimates/summary`, {
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
      head: '',
      program: '',
      project: '',
      sub_project: '',
      object: '',
      min_estimate: '',
      max_estimate: ''
    });
    setSearchTerm('');
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
    setImportErrors([]);
    try {
      const response = await axios.post(`${API_BASE_URL}/estimates/import`, formData, {
        headers: getFileUploadHeaders()
      });

      if (response.data.success) {
        let message = `Import successful! Imported: ${response.data.imported_count} records`;
        if (response.data.skipped_count > 0) {
          message += `, Skipped: ${response.data.skipped_count} records`;
        }
        alert(message);
        
        if (response.data.errors && response.data.errors.length > 0) {
          setImportErrors(response.data.errors);
          console.log('Import errors:', response.data.errors);
        }
        
        setShowImportModal(false);
        setSelectedFile(null);
        fetchRecords();
        fetchFilterOptions();
        fetchSummary();
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

  // Export data
  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/estimates/export`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        // Create CSV content
        const headers = ['Head', 'Program', 'Project', 'Sub Project', 'Object', 'Revenue Code', 'Estimate', 'Re-Estimate'];
        const rows = response.data.data.map(record => [
          record.head || '',
          record.program || '',
          record.project || '',
          record.sub_project || '',
          record.object || '',
          record.revenue_code_name || '',
          record.estimate || '',
          record.re_estimate || ''
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estimates_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  // Create new record
  const handleAddRecord = async () => {
    const data = {};
    Object.keys(newRecord).forEach(key => {
      if (newRecord[key] !== '' && newRecord[key] !== null) {
        if (['estimate', 're_estimate'].includes(key)) {
          data[key] = parseFloat(newRecord[key]);
        } else {
          data[key] = parseInt(newRecord[key]);
        }
      }
    });

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/estimates`, data, { 
        headers: getAuthHeaders() 
      });

      if (response.data.success) {
        alert('Estimate added successfully!');
        setNewRecord({
          head: '',
          program: '',
          project: '',
          sub_project: '',
          object: '',
          revenue_code_name: '',
          estimate: '',
          re_estimate: ''
        });
        setShowAddModal(false);
        fetchRecords();
        fetchFilterOptions();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error adding record:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        alert(`Validation Error:\n${errorMessages}`);
      } else {
        alert(error.response?.data?.message || 'Failed to add estimate');
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
        if (editingRecord[key] !== '' && editingRecord[key] !== null) {
          if (['estimate', 're_estimate'].includes(key)) {
            data[key] = parseFloat(editingRecord[key]);
          } else {
            data[key] = parseInt(editingRecord[key]);
          }
        }
      }
    });

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/estimates/${editingRecord.id}`, data, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        alert('Estimate updated successfully!');
        setShowEditModal(false);
        setEditingRecord(null);
        fetchRecords();
        fetchFilterOptions();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error updating record:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        alert(`Validation Error:\n${errorMessages}`);
      } else {
        alert(error.response?.data?.message || 'Failed to update estimate');
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
      const response = await axios.delete(`${API_BASE_URL}/estimates/delete-multiple`, {
        data: { ids: selectedRows },
        headers: getAuthHeaders()
      });
      
      alert(response.data.message);
      setSelectedRows([]);
      fetchRecords();
      fetchFilterOptions();
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

  // Delete single record
  const handleDeleteSingle = async (id) => {
    if (!confirm(`Delete this record?`)) return;

    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/estimates/${id}`, {
        headers: getAuthHeaders()
      });
      
      alert(response.data.message);
      fetchRecords();
      fetchFilterOptions();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting record:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to delete record');
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
        <h1 className="text-2xl font-bold text-gray-800">Estimate Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage estimates and re-estimates for projects</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Estimates</p>
          <p className="text-2xl font-bold mt-1">Rs{formatNumber(totals?.total_estimate || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Re-Estimates</p>
          <p className="text-2xl font-bold mt-1">Rs{formatNumber(totals?.total_re_estimate || 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Total Records</p>
          <p className="text-2xl font-bold mt-1">{totals?.total_records || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">Average Estimate</p>
          <p className="text-2xl font-bold mt-1">Rs{formatNumber(totals?.average_estimate || 0)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setShowAddModal(true)} 
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
        >
          <Plus size={16} /><span>Add Estimate</span>
        </button>
        <button 
          onClick={() => setShowImportModal(true)} 
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
        >
          <Upload size={16} /><span>Import Excel</span>
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
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedRows.length > 0 
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
              placeholder="Search by revenue code..." 
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
            name="head"
            value={filters.head}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Heads</option>
            {filterOptions.heads?.map(head => (
              <option key={head} value={head}>{head}</option>
            ))}
          </select>
          <select
            name="program"
            value={filters.program}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Programs</option>
            {filterOptions.programs?.map(program => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>
          <select
            name="project"
            value={filters.project}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {filterOptions.projects?.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
          <select
            name="sub_project"
            value={filters.sub_project}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sub Projects</option>
            {filterOptions.sub_projects?.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <select
            name="object"
            value={filters.object}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Objects</option>
            {filterOptions.objects?.map(obj => (
              <option key={obj} value={obj}>{obj}</option>
            ))}
          </select>
          <input
            type="number"
            name="min_estimate"
            placeholder="Min Estimate"
            value={filters.min_estimate}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="max_estimate"
            placeholder="Max Estimate"
            value={filters.max_estimate}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
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
                <th className="px-4 py-3 w-8">
                  <input 
                    type="checkbox" 
                    checked={selectedRows.length === records.length && records.length > 0} 
                    onChange={handleSelectAll} 
                    className="rounded border-gray-300 focus:ring-blue-500" 
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Revenue Code</th>
                {/* <th className="px-4 py-3 text-left font-semibold text-gray-700">Program</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Project</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Sub Project</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Object</th> */}
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Revenue Code</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Estimate (Rs)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Re-Estimate (Rs)</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No records found matching your search.' : 'No records found. Add an estimate or import Excel.'}
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedRows.includes(record.id)} 
                        onChange={() => handleSelectRow(record.id)} 
                        className="rounded border-gray-300 focus:ring-blue-500" 
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{displayNumber(record.head)}-{displayNumber(record.program)}{displayNumber(record.project)}-{displayNumber(record.sub_project)}{displayNumber(record.object)}</td>
                    {/* <td className="px-4 py-3">{displayNumber(record.program)}</td>
                    <td className="px-4 py-3">{displayNumber(record.project)}</td>
                    <td className="px-4 py-3">{displayNumber(record.sub_project)}</td>
                    <td className="px-4 py-3">{displayNumber(record.object)}</td> */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {record.revenue_code_name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      {formatNumber(record.estimate)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {formatNumber(record.re_estimate)}
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
                ))
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Import Excel File</h3>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setImportErrors([]);
                }} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Upload .xlsx, .xls, or .csv files</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold text-gray-700 flex items-center">
                <FileSpreadsheet size={16} className="mr-2" />
                Excel Column Mapping:
              </p>
              <p className="text-gray-600 mt-1">Column A (0) → Head</p>
              <p className="text-gray-600">Column B (1) → Program</p>
              <p className="text-gray-600">Column C (2) → Project</p>
              <p className="text-gray-600">Column D (3) → Sub Project</p>
              <p className="text-gray-600">Column E (4) → Object</p>
              <p className="text-gray-600">Column F (5) → Revenue Code Name</p>
              <p className="text-gray-600">Column G (6) → Estimate</p>
              <p className="text-gray-600">Column H (7) → Re-Estimate</p>
            </div>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={(e) => {
                setSelectedFile(e.target.files[0]);
                setImportErrors([]);
              }} 
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500" 
            />
            
            {/* Import Errors */}
            {importErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle size={18} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Import Warnings:</p>
                    <ul className="text-xs text-red-600 mt-1 max-h-32 overflow-y-auto">
                      {importErrors.slice(0, 5).map((error, index) => (
                        <li key={index} className="mt-0.5">• {error}</li>
                      ))}
                      {importErrors.length > 5 && (
                        <li className="mt-0.5 text-red-500">... and {importErrors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setImportErrors([]);
                }} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleImport} 
                disabled={!selectedFile || uploading} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors"
              >
                {uploading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Estimate</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head</label>
                <input 
                  type="number" 
                  value={newRecord.head} 
                  onChange={(e) => setNewRecord({...newRecord, head: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Head code" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <input 
                  type="number" 
                  value={newRecord.program} 
                  onChange={(e) => setNewRecord({...newRecord, program: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Program code" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <input 
                  type="number" 
                  value={newRecord.project} 
                  onChange={(e) => setNewRecord({...newRecord, project: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Project code" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Project</label>
                <input 
                  type="number" 
                  value={newRecord.sub_project} 
                  onChange={(e) => setNewRecord({...newRecord, sub_project: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Sub project code" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Object</label>
                <input 
                  type="number" 
                  value={newRecord.object} 
                  onChange={(e) => setNewRecord({...newRecord, object: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Object code" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Code Name</label>
                <input 
                  type="text" 
                  value={newRecord.revenue_code_name} 
                  onChange={(e) => setNewRecord({...newRecord, revenue_code_name: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Revenue code name" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimate (Rs)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={newRecord.estimate} 
                  onChange={(e) => setNewRecord({...newRecord, estimate: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Re-Estimate (Rs)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={newRecord.re_estimate} 
                  onChange={(e) => setNewRecord({...newRecord, re_estimate: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
                Add Estimate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Estimate</h3>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head</label>
                <input 
                  type="number" 
                  value={editingRecord.head || ''} 
                  onChange={(e) => setEditingRecord({...editingRecord, head: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <input 
                  type="number" 
                  value={editingRecord.program || ''} 
                  onChange={(e) => setEditingRecord({...editingRecord, program: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <input 
                  type="number" 
                  value={editingRecord.project || ''} 
                  onChange={(e) => setEditingRecord({...editingRecord, project: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Project</label>
                <input 
                  type="number" 
                  value={editingRecord.sub_project || ''} 
                  onChange={(e) => setEditingRecord({...editingRecord, sub_project: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Object</label>
                <input 
                  type="number" 
                  value={editingRecord.object || ''} 
                  onChange={(e) => setEditingRecord({...editingRecord, object: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Code Name</label>
                <input 
                  type="text" 
                  value={editingRecord.revenue_code_name || ''} 
                  onChange={(e) => setEditingRecord({...editingRecord, revenue_code_name: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimate (Rs)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editingRecord.estimate || ''} 
                  onChange={(e) => setEditingRecord({...editingRecord, estimate: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Re-Estimate (Rs)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editingRecord.re_estimate || ''} 
                  onChange={(e) => setEditingRecord({...editingRecord, re_estimate: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
  );
};

export default EstimatePanel;