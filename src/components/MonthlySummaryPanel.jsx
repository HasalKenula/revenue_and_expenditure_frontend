import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor
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

// Add response interceptor
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

const MonthlySummaryPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [totals, setTotals] = useState({
    x_entry: 0,
    collection: 0,
    total: 0,
    refund: 0,
    net_revenue: 0
  });

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

  const displayNumber = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (value === 0 || value === '0') return '0';
    return value;
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
      setTotals({ x_entry: 0, collection: 0, total: 0, refund: 0, net_revenue: 0 });
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

      const response = await apiClient.get('/monthly-summary/data', { params });

      if (response.data.success) {
        const data = response.data.data;
        setRecords(data.records || []);
        setTotals(data.totals || { x_entry: 0, collection: 0, total: 0, refund: 0, net_revenue: 0 });

        const total = data.records?.length || 0;
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
      const response = await apiClient.get('/monthly-summary/filter-options');

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
    setTotals({ x_entry: 0, collection: 0, total: 0, refund: 0, net_revenue: 0 });
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
  };

  // Generate PDF Report - A3 Landscape
  const handleExportPDF = () => {
    if (records.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);
    
    try {
      // Create PDF in landscape orientation (A3)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Get current date
      const currentDate = new Date().toLocaleString();

      // Add Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Summary Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      
      // Add filter information
      let filterText = `Year: ${appliedFilters.year}`;
      if (appliedFilters.month) {
        filterText += ` | Month: ${monthNames[appliedFilters.month]}`;
      } else {
        filterText += ' | All Months';
      }
      
      doc.setFontSize(9);
      doc.text(filterText, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });

      // Prepare table headers
      const tableHeaders = [
        'Month',
        'X Entry (Rs)',
        'Collection (Rs)',
        'Total (Rs)',
        'Refund (Rs)',
        'Net Revenue (Rs)'
      ];

      // Prepare table data
      const tableBody = records.map(record => {
        return [
          record.month_name,
          formatNumber(record.x_entry || 0),
          formatNumber(record.collection || 0),
          formatNumber(record.total || 0),
          formatNumber(record.refund || 0),
          formatNumber(record.net_revenue || 0)
        ];
      });

      // Add totals row
      const totalRow = [
        'TOTAL',
        formatNumber(totals.x_entry || 0),
        formatNumber(totals.collection || 0),
        formatNumber(totals.total || 0),
        formatNumber(totals.refund || 0),
        formatNumber(totals.net_revenue || 0)
      ];
      tableBody.push(totalRow);

      // Column widths
      const columnStyles = {
        0: { cellWidth: 50, halign: 'left' },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' },
        4: { cellWidth: 40, halign: 'right' },
        5: { cellWidth: 40, halign: 'right' }
      };

      // Generate table
      autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: 35,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 3
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: columnStyles,
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35, left: 23.5, right: 23.5 },
        tableWidth:297,
        rowStyles: {
          [tableBody.length - 1]: {
            fontStyle: 'bold',
            fillColor: [220, 235, 245],
            textColor: [0, 0, 0],
            fontSize: 10
          }
        },
        didDrawPage: function(data) {
          // Footer is added after table generation
        }
      });

      // Add footer to all pages
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

      // Save PDF
      doc.save(`monthly_summary_report_${appliedFilters.year}.pdf`);
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

      const response = await apiClient.get('/monthly-summary/export-csv', { params });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monthly_summary_${appliedFilters.year}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert('CSV exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV: ' + (error.response?.data?.message || error.message));
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

  // Get month display text
  const getMonthDisplay = (month) => {
    if (!month) return '';
    return monthNames[month] || `Month ${month}`;
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
            <h1 className="text-2xl font-bold text-gray-800">Monthly Summary Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              View monthly revenue summary with X Entry, Collection, Total, Refund and Net Revenue
            </p>
          </div>
          {appliedFilters.year && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Selected:</span> {appliedFilters.year}
                {appliedFilters.month && ` - ${getMonthDisplay(appliedFilters.month)}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {appliedFilters.year && records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total X Entry</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.x_entry || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Collection</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.collection || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.total || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Refund</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.refund || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Net Revenue</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.net_revenue || 0)}</p>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(appliedFilters.year || appliedFilters.month) && (
        <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
            {appliedFilters.year && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                Year: {appliedFilters.year}
              </span>
            )}
            {appliedFilters.month && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                <Calendar size={12} className="mr-1" />
                Month: {getMonthDisplay(appliedFilters.month)}
              </span>
            )}
            {!appliedFilters.month && (
              <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm">
                All Months
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
          <span>Export PDF (A3)</span>
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
                <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[120px]">
                  Month
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[120px] bg-blue-50">
                  X Entry (Rs)
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[120px] bg-green-50">
                  Collection (Rs)
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[120px] bg-purple-50">
                  Total (Rs)
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[120px] bg-red-50">
                  Refund (Rs)
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[120px] bg-indigo-50">
                  Net Revenue (Rs)
                </th>
              </tr>
            </thead>
            <tbody>
              {!appliedFilters.year ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={40} className="text-gray-300" />
                      <p>Please select a Year to view data</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
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
                paginatedRecords.map((record, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {record.month_name}
                    </td>
                    <td className="px-4 py-3 text-right text-blue-600 font-medium">
                      {formatNumber(record.x_entry || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      {formatNumber(record.collection || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-purple-600 font-bold">
                      {formatNumber(record.total || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">
                      {formatNumber(record.refund || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-indigo-600 font-bold bg-indigo-50">
                      {formatNumber(record.net_revenue || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {paginatedRecords.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr className="font-semibold">
                  <td className="px-4 py-3 text-right text-gray-700">TOTAL</td>
                  <td className="px-4 py-3 text-right text-blue-700">
                    {formatNumber(totals.x_entry || 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700">
                    {formatNumber(totals.collection || 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-purple-700">
                    {formatNumber(totals.total || 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-700">
                    {formatNumber(totals.refund || 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-indigo-700 bg-indigo-50">
                    {formatNumber(totals.net_revenue || 0)}
                  </td>
                </tr>
              </tfoot>
            )}
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
              <h3 className="text-lg font-semibold text-gray-800">Filter Monthly Summary</h3>
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
                  Month (Optional)
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
                      {monthNames[month]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to show all months, or select a specific month
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>X Entry:</strong> monthly_fincances (dr_cr_code=4000, dr_cr=CR)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>Collection:</strong> treasury (dr_cr_code=4000, dr_cr=CR)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>Total:</strong> X Entry + Collection
                </p>
                <p className="text-xs text-red-700 mt-1">
                  <strong>Refund:</strong> treasury + monthly_fincances (dr_cr_code=5000, dr_cr=DR)
                </p>
                <p className="text-xs text-indigo-700 mt-1">
                  <strong>Net Revenue:</strong> Total - Refund
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

export default MonthlySummaryPanel;