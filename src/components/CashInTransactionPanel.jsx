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
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL ;

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

// Default account numbers to be pre-selected
const DEFAULT_ACCOUNTS = [
  '013-2-001-6-0011618',
  '014100170003265',
  '71353540',
  '93324673',
  '95609366',
  '013200130055977'
];

const CashInTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [grandTotals, setGrandTotals] = useState({
    opening_balance: 0,
    revenue_collection: 0,
    revenue_receipt: 0,
    adjustment: 0,
    cash_in_transist: 0
  });
  const [allAccounts, setAllAccounts] = useState([]);

  const [filters, setFilters] = useState({
    year: '',
    selected_accounts: DEFAULT_ACCOUNTS
  });

  const [appliedFilters, setAppliedFilters] = useState({
    year: '',
    selected_accounts: []
  });

  const [filterOptions, setFilterOptions] = useState({
    years: [],
    accounts: []
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
    if (!appliedFilters.year || appliedFilters.selected_accounts.length === 0) {
      setRecords([]);
      setGrandTotals({
        opening_balance: 0,
        revenue_collection: 0,
        revenue_receipt: 0,
        adjustment: 0,
        cash_in_transist: 0
      });
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        selected_accounts: appliedFilters.selected_accounts
      };

      const response = await apiClient.get('/cash-in-transaction/data', { params });

      if (response.data.success) {
        const data = response.data.data;
        setRecords(data.records || []);
        setGrandTotals(data.grand_totals || {
          opening_balance: 0,
          revenue_collection: 0,
          revenue_receipt: 0,
          adjustment: 0,
          cash_in_transist: 0
        });

        const total = data.records?.length || 0;
        setTotalRecords(total);
        setLastPage(Math.ceil(total / entriesPerPage));
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to fetch records: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await apiClient.get('/cash-in-transaction/filter-options');

      if (response.data.success) {
        setFilterOptions(response.data.data);
        setAllAccounts(response.data.data.accounts || []);
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
    if (appliedFilters.year && appliedFilters.selected_accounts.length > 0) {
      fetchRecords();
    }
  }, [appliedFilters]);

  // Initial load - fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Auto-apply filters when filter options are loaded and default accounts exist
  useEffect(() => {
    if (filterOptions.accounts.length > 0 && appliedFilters.selected_accounts.length === 0 && !appliedFilters.year) {
      const availableDefaultAccounts = DEFAULT_ACCOUNTS.filter(account =>
        filterOptions.accounts.includes(account)
      );

      if (availableDefaultAccounts.length > 0) {
        setAppliedFilters(prev => ({
          ...prev,
          selected_accounts: availableDefaultAccounts
        }));

        setFilters(prev => ({
          ...prev,
          selected_accounts: availableDefaultAccounts
        }));
      }
    }
  }, [filterOptions.accounts]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountSelection = (account) => {
    setFilters(prev => {
      const currentAccounts = prev.selected_accounts || [];
      if (currentAccounts.includes(account)) {
        return {
          ...prev,
          selected_accounts: currentAccounts.filter(a => a !== account)
        };
      } else {
        return {
          ...prev,
          selected_accounts: [...currentAccounts, account]
        };
      }
    });
  };

  const handleSelectAllAccounts = () => {
    setFilters(prev => ({
      ...prev,
      selected_accounts: [...allAccounts]
    }));
  };

  const handleClearAllAccounts = () => {
    setFilters(prev => ({
      ...prev,
      selected_accounts: []
    }));
  };

  const applyFilters = () => {
    if (!filters.year) {
      toast.error('Please select a Year');
      return;
    }
    if (!filters.selected_accounts || filters.selected_accounts.length === 0) {
      toast.error('Please select at least one Account');
      return;
    }
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      selected_accounts: DEFAULT_ACCOUNTS
    });
    setAppliedFilters({ year: '', selected_accounts: [] });
    setRecords([]);
    setGrandTotals({
      opening_balance: 0,
      revenue_collection: 0,
      revenue_receipt: 0,
      adjustment: 0,
      cash_in_transist: 0
    });
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
  };

  // Generate PDF Report
  const handleExportPDF = () => {
    if (records.length === 0) {
      toast.error('No data to export');
      return;
    }

    setLoading(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrate',
        unit: 'mm',
        format: 'a4'
      });

      const currentDate = new Date().toLocaleString();

      // Add Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Cash IN Transaction', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`For the Year: ${appliedFilters.year}`, doc.internal.pageSize.getWidth() / 2, 23, { align: 'center' });
      doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 31, { align: 'center' });

      // Table Headers
      const headers = [
        'Account Number',
        'Account Name',
        'Opening Balance (Jan)',
        'Revenue Collection (Total)',
        'Revenue Receipt (Total)',
        'Adjustment (Total Transists)',
        'Cash IN Transist (Dec)'
      ];

      // Table Data
      const tableData = records.map(record => [
        record.account_number,
        record.account_name || '-',
        formatNumber(record.opening_balance),
        formatNumber(record.revenue_collection),
        formatNumber(record.revenue_receipt),
        formatNumber(record.adjustment),
        formatNumber(record.cash_in_transist)
      ]);

      // Add grand total row
      tableData.push([
        'GRAND TOTAL',
        '',
        formatNumber(grandTotals.opening_balance),
        formatNumber(grandTotals.revenue_collection),
        formatNumber(grandTotals.revenue_receipt),
        formatNumber(grandTotals.adjustment),
        formatNumber(grandTotals.cash_in_transist)
      ]);

      // Generate table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
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
          fontStyle: 'normal',
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'left' },
          1: { cellWidth: 40, halign: 'left' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 25, halign: 'right' },
          6: { cellWidth: 25, halign: 'right', fontStyle: 'bold'}
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 40, left: 10, right: 10 },
        tableWidth: 'auto',
        rowStyles: {
          [tableData.length - 1]: {
            fontStyle: 'bold',
            fillColor: [44, 62, 80],
            textColor: [255, 255, 255],
            fontSize: 8
          }
        }
      });

      // Add footer
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

      doc.save(`cash_in_transaction_${appliedFilters.year}.pdf`);
      toast.success('PDF exported successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    if (records.length === 0) {
      toast.error('No data to export');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('year', appliedFilters.year);
      params.append('selected_accounts', JSON.stringify(appliedFilters.selected_accounts));

      const response = await apiClient.get(`/cash-in-transaction/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        toast.error('Error: ' + (errorData.message || 'Export failed'));
        return;
      }

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cash_in_transaction_${appliedFilters.year}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Export completed successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchFilterOptions();
    if (appliedFilters.year && appliedFilters.selected_accounts.length > 0) {
      fetchRecords();
    }
  };

  // Paginated records
  const paginatedRecords = records.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Cash IN Transaction</h1>
              <p className="text-sm text-gray-500 mt-1">
                View cash IN transaction with opening balance, revenue collection, receipts, adjustment, and transists
              </p>
              {appliedFilters.year && appliedFilters.selected_accounts.length > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  Showing {records.length} record(s) for {appliedFilters.year} with {appliedFilters.selected_accounts.length} selected account(s)
                </p>
              )}
            </div>
            {appliedFilters.year && (
              <div className="bg-blue-50 rounded-lg px-3 py-2">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Year:</span> {appliedFilters.year}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {appliedFilters.year && appliedFilters.selected_accounts.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
              {appliedFilters.year && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                  <Calendar size={12} className="mr-1" />
                  Year: {appliedFilters.year}
                </span>
              )}
              {appliedFilters.selected_accounts.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                  {appliedFilters.selected_accounts.length} Account(s) Selected
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${records.length > 0
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${records.length > 0
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
            disabled={!appliedFilters.year || appliedFilters.selected_accounts.length === 0}
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
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[150px]">
                    Account Number
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                    Account Name
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[130px]">
                    Opening Balance (Jan)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[130px]">
                    Revenue Collection (Total)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[130px]">
                    Revenue Receipt (Total)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[130px]">
                    Adjustment (Total Transists)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[130px]">
                    Cash IN Transist (Dec)
                  </th>
                </tr>
              </thead>
              <tbody>
                {!appliedFilters.year || appliedFilters.selected_accounts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Filter size={40} className="text-gray-300" />
                        <p>Please select a Year and Account(s) to view data</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
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
                    const isEven = index % 2 === 0;
                    return (
                      <tr key={index} className={`border-b border-gray-100  transition ${isEven ? 'bg-white' : 'bg-white'}`}>
                        <td className="px-4 py-3 font-medium text-blue-700">
                          {record.account_number}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {record.account_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {formatNumber(record.opening_balance)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {formatNumber(record.revenue_collection)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {formatNumber(record.revenue_receipt)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {formatNumber(record.adjustment)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                          {formatNumber(record.cash_in_transist)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {paginatedRecords.length > 0 && (
                <tfoot className="border-t border-gray-700">
                  <tr>
                    <td className="px-4 py-3 text-right font-bold text-white" colSpan="2">
                      GRAND TOTAL
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray">
                      {formatNumber(grandTotals.opening_balance)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray">
                      {formatNumber(grandTotals.revenue_collection)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray">
                      {formatNumber(grandTotals.revenue_receipt)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray">
                      {formatNumber(grandTotals.adjustment)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray">
                      {formatNumber(grandTotals.cash_in_transist)}
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
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Filter Cash IN Transaction</h3>
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
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Accounts <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAllAccounts}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleClearAllAccounts}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filterOptions.accounts.map((account) => {
                        const isDefault = DEFAULT_ACCOUNTS.includes(account);
                        return (
                          <label
                            key={account}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${isDefault ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                          >
                            <input
                              type="checkbox"
                              checked={(filters.selected_accounts || []).includes(account)}
                              onChange={() => handleAccountSelection(account)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={`text-sm ${isDefault ? 'text-blue-700 font-medium' : 'text-gray-700'} font-mono`}>
                              {account}
                              {isDefault && ' (default)'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {filterOptions.accounts.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No accounts available</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {(filters.selected_accounts || []).length} account(s)
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Default accounts are pre-selected: {DEFAULT_ACCOUNTS.join(', ')}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Report:</strong> Cash IN Transaction
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Columns:</strong> Account Number, Account Name, Opening Balance (Jan), Revenue Collection (Total), Revenue Receipt (Total), Adjustment (Total Transists), Cash IN Transist (Dec)
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Calculations:</strong>
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    • Opening Balance = January's opening balance from previous year
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    • Revenue Collection = Total of all 12 months (Jan-Dec)
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    • Revenue Receipt = Total of all 12 months (Jan-Dec)
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    • Adjustment = Total of all month's Transists (Jan-Dec)
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    • Cash IN Transist = December's closing balance (Opening Balance + Revenue Collection - Revenue Receipt)
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
                  disabled={!filters.year || !filters.selected_accounts || filters.selected_accounts.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CashInTransaction;