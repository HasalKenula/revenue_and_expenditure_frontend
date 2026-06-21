// src/components/COEOWPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to always include token
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

// Add response interceptor to handle 401 errors
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

const COEOWPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [months, setMonths] = useState([]);
  const [monthNamesList, setMonthNamesList] = useState({});
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [filters, setFilters] = useState({
    year: '',
    month: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    year: '',
    month: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    years: [],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  });

  // Format number with commas
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch records
  const fetchRecords = async () => {
    if (!appliedFilters.year) {
      setRecords([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year
      };
      
      // Add month filter if selected
      if (appliedFilters.month) {
        params.month = appliedFilters.month;
      }

      const response = await apiClient.get('/coeow/data', { params });

      if (response.data.success) {
        setRecords(response.data.data.records || []);
        setMonths(response.data.data.months || []);
        setMonthNamesList(response.data.data.month_names || {});
        setSelectedYear(response.data.data.year || '');
        setSelectedMonth(response.data.data.selected_month || '');

        const total = response.data.data.records?.length || 0;
        setTotalRecords(total);
        setLastPage(Math.ceil(total / entriesPerPage));
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      if (error.response?.status !== 401) {
        alert('Failed to fetch records: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await apiClient.get('/coeow/filter-options');

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

  // Auto-fetch when filters change
  useEffect(() => {
    if (appliedFilters.year) {
      fetchRecords();
    }
  }, [appliedFilters]);

  // Initial load - fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    if (!filters.year) {
      alert('Please select a Year');
      return;
    }
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({ year: '', month: '' });
    setAppliedFilters({ year: '', month: '' });
    setRecords([]);
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
    setMonths([]);
    setMonthNamesList({});
  };

  // Generate PDF Report
  const handleExportPDF = () => {
    if (records.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const currentDate = new Date().toLocaleString();

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Classification of Expenditure - Object Wise', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      
      // Filter information
      let filterText = `Year: ${appliedFilters.year}`;
      if (appliedFilters.month) {
        filterText += ` | Up to: ${monthNames[appliedFilters.month]}`;
      }
      doc.setFontSize(9);
      doc.text(filterText, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });

      // Prepare table headers
      const tableHeaders = ['Object'];
      const monthKeys = [];
      
      months.forEach(month => {
        tableHeaders.push(monthNamesList[month] || `Month ${month}`);
        monthKeys.push(`month_${month}`);
      });
      tableHeaders.push('Total');

      // Prepare table body
      const tableBody = records.map(record => {
        const row = [];
        if (record.object) {
          row.push(record.object);
        } else {
          row.push(record.object_name || 'TOTAL');
        }
        
        months.forEach(month => {
          const key = `month_${month}`;
          row.push(record[key] !== undefined ? formatNumber(record[key]) : '0.00');
        });
        
        row.push(record.total !== undefined ? formatNumber(record.total) : '0.00');
        
        return row;
      });

      autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: 35,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 2
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 2
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 30, left: 10, right: 10 },
        didDrawPage: function(data) {
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
              `Page ${i} of ${pageCount}`,
              doc.internal.pageSize.getWidth() / 2,
              doc.internal.pageSize.getHeight() - 10,
              { align: 'center' }
            );
          }
        }
      });

      const fileName = `coeow_report_${appliedFilters.year}${appliedFilters.month ? '_upto_' + monthNames[appliedFilters.month] : ''}.pdf`;
      doc.save(fileName);
      alert('PDF exported successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    if (records.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year
      };
      if (appliedFilters.month) {
        params.month = appliedFilters.month;
      }

      const response = await apiClient.get('/coeow/export', { params });

      if (response.data.success) {
        const csvData = response.data.data;
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const csvRows = [
            headers.join(','),
            ...csvData.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
          ];
          const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(csvBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `coeow_report_${appliedFilters.year}${appliedFilters.month ? '_upto_' + monthNames[appliedFilters.month] : ''}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          alert('Export completed successfully!');
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchFilterOptions();
    if (appliedFilters.year) {
      fetchRecords();
    }
  };

  // Paginated records
  const paginatedRecords = records.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Get month display text with range
  const getMonthRangeDisplay = () => {
    if (!appliedFilters.month) return 'All Months';
    return `January - ${monthNames[appliedFilters.month]}`;
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Classification of Expenditure - Object Wise</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monthly expenditure summary by object code (1000-3000)
            </p>
          </div>
          {appliedFilters.year && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Year:</span> {appliedFilters.year}
                {appliedFilters.month && (
                  <span className="ml-2">
                    <span className="font-medium">| Month:</span> {monthNames[appliedFilters.month]}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Month Range Indicator */}
      {appliedFilters.year && (
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-green-600" />
            <span className="text-sm text-green-700">
              <strong>Showing:</strong> {getMonthRangeDisplay()}
              {appliedFilters.month && (
                <span className="ml-2 text-xs text-green-600">
                  (Cumulative from January to {monthNames[appliedFilters.month]})
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Total Objects</p>
            <BarChart3 size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">{records.filter(r => r.object).length}</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Total Records</p>
            <DollarSign size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">{records.length}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Year</p>
            <Calendar size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">{selectedYear || '-'}</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Months</p>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">
            {appliedFilters.month ? monthNames[appliedFilters.month] : 'All'}
          </p>
        </div>
      </div>

      {/* Active Filters Display */}
      {(appliedFilters.year || appliedFilters.month) && (
        <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
            {appliedFilters.year && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                <Calendar size={12} className="mr-1" />
                Year: {appliedFilters.year}
              </span>
            )}
            {appliedFilters.month && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                Up to: {monthNames[appliedFilters.month]}
              </span>
            )}
          </div>
          <button 
            onClick={clearFilters} 
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            <X size={14} /> Clear All
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setShowFilterModal(true)} 
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm shadow-sm"
        >
          <Filter size={16} />
          <span>Filter</span>
        </button>
        <button 
          onClick={handleExportPDF} 
          disabled={records.length === 0} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${
            records.length > 0 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FileText size={16} />
          <span>Export PDF</span>
        </button>
        <button 
          onClick={handleExportCSV} 
          disabled={records.length === 0} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${
            records.length > 0 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
        <button 
          onClick={refreshData} 
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm bg-white shadow-sm"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50">Object</th>
                {months.map(month => (
                  <th key={month} className="px-3 py-3 text-right font-semibold text-gray-700">
                    {monthNamesList[month] || `Month ${month}`}
                  </th>
                ))}
                <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-100">
                  Total
                  {selectedMonth && <span className="block text-xs font-normal">(Cumulative)</span>}
                </th>
              </tr>
            </thead>
            <tbody>
              {!appliedFilters.year ? (
                <tr>
                  <td colSpan={months.length + 2} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={40} className="text-gray-300" />
                      <p>Please select a Year to view data</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={months.length + 2} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <p>No records found for the selected filters.</p>
                      <button 
                        onClick={clearFilters} 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Clear filters and try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, index) => {
                  const isTotalRow = !record.object;
                  return (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                        isTotalRow ? 'bg-gray-100 font-bold' : ''
                      }`}
                    >
                      <td className={`px-3 py-3 font-medium sticky left-0 bg-white ${isTotalRow ? 'bg-gray-100' : ''}`}>
                        {record.object || record.object_name || '-'}
                      </td>
                      {months.map(month => {
                        const key = `month_${month}`;
                        const value = record[key] || 0;
                        return (
                          <td key={month} className={`px-3 py-3 text-right ${isTotalRow ? 'text-blue-600' : 'text-gray-900'}`}>
                            {formatNumber(value)}
                          </td>
                        );
                      })}
                      <td className={`px-3 py-3 text-right font-bold ${isTotalRow ? 'text-purple-600 bg-gray-100' : 'text-gray-900'}`}>
                        {formatNumber(record.total || 0)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {records.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show</span>
              <select 
                value={entriesPerPage} 
                onChange={(e) => { 
                  setEntriesPerPage(Number(e.target.value)); 
                  setCurrentPage(1); 
                }} 
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
              <span className="text-sm text-gray-500 ml-2">
                Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, totalRecords)} of {totalRecords}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1} 
                className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {lastPage || 1}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))} 
                disabled={currentPage === lastPage || lastPage === 0} 
                className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter Report</h3>
              <button 
                onClick={() => setShowFilterModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Year</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month (Cumulative)
                </label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Months</option>
                  {filterOptions.months.map(month => (
                    <option key={month} value={month}>
                      {monthNames[month]} (Jan - {monthNames[month]})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Shows cumulative data from January to selected month
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> This report shows monthly expenditure by object code (1000-3000)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>DR (1000):</strong> Adds to expenditure | <strong>CR (2000):</strong> Reduces from expenditure
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setShowFilterModal(false)} 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={applyFilters} 
                disabled={!filters.year}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default COEOWPanel;