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
  DollarSign
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

const RevenueRefundByTrnoPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [totals, setTotals] = useState({
    total_records: 0,
    total_refund: 0
  });

  const [filters, setFilters] = useState({
    year: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    year: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    years: []
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

  // Format number with leading zeros (pad to 2 digits)
  const padNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return String(value).padStart(2, '0');
  };

  // Format combined code: Head-Program-Project-SubProject-Object with padding
  const formatCombinedCode = (record) => {
    const head = displayNumber(record.head);
    const program = displayNumber(record.program);
    const project = padNumber(record.project);
    const subProject = padNumber(record.sub_project);
    const object = padNumber(record.object);

    return `${head}-${project}-${object}`;
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
      setTotals({ total_records: 0, total_refund: 0 });
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year
      };

      const response = await apiClient.get('/revenue-refund-by-trno/data', { params });

      if (response.data.success) {
        const data = response.data.data;
        setRecords(data.records || []);
        setTotals(data.totals || { total_records: 0, total_refund: 0 });

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
      const response = await apiClient.get('/revenue-refund-by-trno/filter-options');

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
    setFilters({ year: '' });
    setAppliedFilters({ year: '' });
    setRecords([]);
    setTotals({ total_records: 0, total_refund: 0 });
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
  };

  // Generate PDF Report
  const handleExportPDF = () => {
    if (records.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);

    try {
      // Create PDF in landscape orientation (A4)
      const doc = new jsPDF({
        orientation: 'portrate',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;

      // Get current date
      const currentDate = new Date().toLocaleString();

      // Set text color to black for header
      doc.setTextColor(0, 0, 0);
      
      // Add Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Revenue Refund Report (Categorized By Head)', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 22, { align: 'center' });

      doc.setFontSize(9);
      doc.text(`Year: ${appliedFilters.year}`, pageWidth / 2, 29, { align: 'center' });

      // Table Headers
      const tableHeaders = [
        'Head',
        'Revenue Code Name',
        'Revenue Code',
        'Refund Amount (Rs)',
        'Month'
      ];

      // Table Body
      const tableBody = records.map(record => {
        let revenueCode = '';
        if (!record.is_subtotal) {
          revenueCode = formatCombinedCode(record);
        }
        return [
          record.trno || '',
          record.revenue_code_name || '',
          revenueCode || (record.is_subtotal ? '' : '-'),
          formatNumber(record.refund_amount || 0),
          record.month_name || ''
        ];
      });

      // Add Grand Total row
      const tableTotalRow = [
        'GRAND TOTAL',
        '',
        '',
        formatNumber(totals.total_refund || 0),
        ''
      ];
      tableBody.push(tableTotalRow);

      // Column Styles
      const columnStyles = {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 60, halign: 'left' },
        2: { cellWidth: 30, halign: 'left' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'center' }
      };

      // Generate Table with subtotal styling
      autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: 35,
        theme: 'grid',
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
          cellPadding: 2,
          textColor: [0, 0, 0]
        },
        columnStyles: columnStyles,
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35, left: 15, right: 15 },
        tableWidth: 180,
        didParseCell: function(data) {
          // Check if this is a subtotal row (Revenue Code Name is 'SUB TOTAL')
          if (data.section === 'body' && data.row.raw && data.row.raw[1] === 'SUB TOTAL') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontSize = 7;
            if (data.column.index === 0) {
              data.cell.styles.halign = 'center';
            }
            if (data.column.index === 4) {
              data.cell.styles.fontSize = 0;
              data.cell.styles.cellPadding = 0;
            }
          }
          // Check if this is the grand total row
          if (data.section === 'body' && data.row.raw && data.row.raw[0] === 'GRAND TOTAL') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontSize = 8;
          }
        },
        didDrawPage: function(data) {
          // Footer is added after table generation
        }
      });

      // Add footer to Page 1
      const pageCount = 1;
      doc.setPage(1);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page 1 of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Save PDF
      doc.save(`revenue_refund_by_trno_${appliedFilters.year}.pdf`);
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

      const response = await apiClient.get('/revenue-refund-by-trno/export-csv', { params });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue_refund_by_trno_${appliedFilters.year}.csv`;
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
            <h1 className="text-2xl font-bold text-gray-800">Revenue Refund (Categorized by Head) Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              View revenue refund grouped by TRNO with month-wise breakdown and subtotals
            </p>
          </div>
          {appliedFilters.year && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Selected:</span> {appliedFilters.year}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {appliedFilters.year && records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Refund Records</p>
            <p className="text-xl font-bold mt-1">{totals.total_records || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Refund Amount</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.total_refund || 0)}</p>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {appliedFilters.year && (
        <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
            {appliedFilters.year && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                <Calendar size={12} className="mr-1" />
                Year: {appliedFilters.year}
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
                <th className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[80px]">
                  Head
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[150px]">
                  Revenue Code Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                  Revenue Code (Head-Program-Project-SubProject-Object)
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[130px] bg-blue-50">
                  Refund Amount (Rs)
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[100px]">
                  Month
                </th>
              </tr>
            </thead>
            <tbody>
              {!appliedFilters.year ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={40} className="text-gray-300" />
                      <p>Please select a Year to view data</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <p>No records found for the selected year.</p>
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
                  const isSubtotal = record.is_subtotal === true;
                  const isGrandTotal = record.revenue_code_name === 'GRAND TOTAL';
                  
                  return (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 ${
                        isSubtotal ? 'bg-blue-50' : 
                        isGrandTotal ? 'bg-yellow-100' : 
                        'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-4 py-3 text-center font-medium ${
                        isSubtotal || isGrandTotal ? 'font-bold' : 'text-gray-900'
                      }`}>
                        {record.trno || '-'}
                      </td>
                      <td className={`px-4 py-3 ${
                        isSubtotal || isGrandTotal ? 'font-bold text-gray-700' : 'text-gray-600'
                      }`}>
                        {record.revenue_code_name || '-'}
                      </td>
                      <td className={`px-4 py-3 ${
                        isSubtotal || isGrandTotal ? 'font-bold text-gray-700' : 'text-gray-700 font-medium'
                      }`}>
                        {isSubtotal || isGrandTotal ? '-' : formatCombinedCode(record)}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${
                        isSubtotal ? 'text-blue-700 bg-blue-100' : 
                        isGrandTotal ? 'text-green-700 bg-yellow-50' : 
                        'text-blue-600 bg-blue-50'
                      }`}>
                        {formatNumber(record.refund_amount || 0)}
                      </td>
                      <td className={`px-4 py-3 text-center ${
                        isSubtotal || isGrandTotal ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        {record.month_name || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {paginatedRecords.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr className="font-semibold">
                  <td className="px-4 py-3 text-center text-gray-700" colSpan="3">
                    GRAND TOTAL
                  </td>
                  <td className="px-4 py-3 text-right text-green-700 bg-green-50">
                    {formatNumber(totals.total_refund || 0)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    -
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
              <h3 className="text-lg font-semibold text-gray-800">Filter Revenue Refund By TRNO</h3>
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
                <p className="text-xs text-gray-500 mt-1">
                  Shows revenue refund data grouped by TRNO with subtotals
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Data Source:</strong> Monthly Fincances table (dr_cr_code=5000, dr_cr=DR)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>Grouped by:</strong> TRNO with subtotals after each TRNO
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>Revenue Code Format:</strong> Head-Program-Project-SubProject-Object
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

export default RevenueRefundByTrnoPanel;