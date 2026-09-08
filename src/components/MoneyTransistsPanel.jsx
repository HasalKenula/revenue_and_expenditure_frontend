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

const MoneyTransists = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [grandTotals, setGrandTotals] = useState({
    opening_balance: 0,
    revenue_collection: 0,
    receipts: 0,
    transists: 0
  });
  const [monthList, setMonthList] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [estimateDisplays, setEstimateDisplays] = useState([]);

  // FIXED: Initialize with empty values - NO AUTO-LOAD
  const [filters, setFilters] = useState({
    year: '',  // ← Empty, not current year
    account_number_id: '',
    estimate_id: ''
  });

  // FIXED: Initialize with empty values - NO AUTO-LOAD
  const [appliedFilters, setAppliedFilters] = useState({
    year: '',  // ← Empty, not current year
    account_number_id: '',
    estimate_id: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    years: [],
    accounts: [],
    estimates: []
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
      setGrandTotals({
        opening_balance: 0,
        revenue_collection: 0,
        receipts: 0,
        transists: 0
      });
      setMonthList([]);
      setEstimateDisplays([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        account_number_id: appliedFilters.account_number_id || '',
        estimate_id: appliedFilters.estimate_id || ''
      };

      const response = await apiClient.get('/money-transists/data', { params });

      if (response.data.success) {
        const data = response.data.data;
        setRecords(data.records || []);
        setGrandTotals(data.grand_totals || {
          opening_balance: 0,
          revenue_collection: 0,
          receipts: 0,
          transists: 0
        });
        setMonthList(data.months || []);
        setSelectedAccountId(appliedFilters.account_number_id || null);
        setEstimateDisplays(data.estimate_displays || []);

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
      const response = await apiClient.get('/money-transists/filter-options');

      if (response.data.success) {
        setFilterOptions(response.data.data);
        setAccounts(response.data.data.accounts || []);
        setEstimates(response.data.data.estimates || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  // Auto-fetch when filters change - ONLY if year is selected
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
      toast.error('Please select a Year');
      return;
    }
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      year: '',  // ← Clear to empty
      account_number_id: '',
      estimate_id: ''
    });
    setAppliedFilters({
      year: '',  // ← Clear to empty
      account_number_id: '',
      estimate_id: ''
    });
    setRecords([]);
    setGrandTotals({
      opening_balance: 0,
      revenue_collection: 0,
      receipts: 0,
      transists: 0
    });
    setMonthList([]);
    setEstimateDisplays([]);
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
  };

  // Get aggregated monthly data - FIXED: Properly aggregates all months
  const getMonthlyAggregatedData = () => {
    const months = monthList.length > 0 ? monthList : Object.keys(monthNames).map(Number);
    const monthlyData = {};

    // Initialize all months with zero values
    months.forEach(monthNum => {
      monthlyData[monthNum] = {
        opening_balance: 0,
        revenue_collection: 0,
        receipts: 0,
        transists: 0
      };
    });

    // If no records, return the initialized data
    if (records.length === 0) {
      return monthlyData;
    }

    // If a specific account is selected, show that account's data
    if (selectedAccountId) {
      const accountRecord = records.find(r => r.account_number_id === parseInt(selectedAccountId));
      if (accountRecord) {
        // Get the monthly data for this account
        months.forEach(monthNum => {
          const data = accountRecord.monthly_data[monthNum] || {
            opening_balance: 0,
            revenue_collection: 0,
            receipts: 0,
            transists: 0
          };
          monthlyData[monthNum] = {
            opening_balance: data.opening_balance || 0,
            revenue_collection: data.revenue_collection || 0,
            receipts: data.receipts || 0,
            transists: data.transists || 0
          };
        });
        return monthlyData;
      }
      return monthlyData;
    }

    // Aggregate across all accounts - FIXED: Properly sum all months
    records.forEach(record => {
      months.forEach(monthNum => {
        const data = record.monthly_data[monthNum] || {
          opening_balance: 0,
          revenue_collection: 0,
          receipts: 0,
          transists: 0
        };
        monthlyData[monthNum].opening_balance += data.opening_balance || 0;
        monthlyData[monthNum].revenue_collection += data.revenue_collection || 0;
        monthlyData[monthNum].receipts += data.receipts || 0;
        monthlyData[monthNum].transists += data.transists || 0;
      });
    });

    return monthlyData;
  };

  // Generate PDF Report with Months as Rows
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
      const monthlyData = getMonthlyAggregatedData();
      const months = monthList.length > 0 ? monthList : Object.keys(monthNames).map(Number);

      // Get selected account and estimate details
      const selectedAccount = appliedFilters.account_number_id
        ? accounts.find(a => a.id === parseInt(appliedFilters.account_number_id))
        : null;

      const selectedEstimate = appliedFilters.estimate_id
        ? estimates.find(e => e.id === parseInt(appliedFilters.estimate_id))
        : null;

      // Get revenue code names for the header
      let revenueCodeNames = 'All Estimates';

      if (selectedAccount && !selectedEstimate) {
        if (estimateDisplays && estimateDisplays.length > 0) {
          revenueCodeNames = estimateDisplays.join(', ');
        } else {
          revenueCodeNames = `All Estimates for ${selectedAccount.account_number}`;
        }
      } else if (selectedEstimate) {
        revenueCodeNames = selectedEstimate.display || selectedEstimate.revenue_code_name || `Estimate #${selectedEstimate.id}`;
      }

      // Add Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Money Transists Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      // Year
      doc.text(`Year: ${appliedFilters.year}`, doc.internal.pageSize.getWidth() / 2, 23, { align: 'center' });

      // Account Number
      const accountDisplay = selectedAccount
        ? `${selectedAccount.account_number} - ${selectedAccount.description || 'No Description'}`
        : 'All Accounts';
      doc.text(`Account Number: ${accountDisplay}`, doc.internal.pageSize.getWidth() / 2, 31, { align: 'center' });

      // Estimate (Revenue Code)
      doc.text(`Estimate (Revenue Code): ${revenueCodeNames}`, doc.internal.pageSize.getWidth() / 2, 39, { align: 'center' });

      // Generated on
      doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 47, { align: 'center' });

      // Table Headers
      const headers = ['Month', 'Opening Balance', 'Revenue Collection', 'Receipts', 'Transists'];

      // Table Data
      const tableData = months.map(monthNum => {
        const data = monthlyData[monthNum] || { opening_balance: 0, revenue_collection: 0, receipts: 0, transists: 0 };
        return [
          monthNames[monthNum],
          formatNumber(data.opening_balance),
          formatNumber(data.revenue_collection),
          formatNumber(data.receipts),
          formatNumber(data.transists)
        ];
      });

      // GRAND TOTAL - Calculate sum of all months for Transists
      const totalOpening = grandTotals.opening_balance || 0;
      const totalCollection = grandTotals.revenue_collection || 0;
      const totalReceipts = grandTotals.receipts || 0;

      // Calculate Transists as sum of ALL months (Jan to Dec)
      let totalTransists = 0;
      months.forEach(monthNum => {
        const data = monthlyData[monthNum] || { transists: 0 };
        totalTransists += data.transists || 0;
      });

      // Grand total row - shows totals for all columns
      tableData.push([
        'GRAND TOTAL',
        formatNumber(totalOpening),
        formatNumber(totalCollection),
        formatNumber(totalReceipts),
        formatNumber(totalTransists)
      ]);

      // Generate table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 55,
        theme: 'grid',
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
          cellPadding: 3,
          fontStyle: 'normal',
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 40, halign: 'left' },
          1: { cellWidth: 35, halign: 'right' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' },
          4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 55, left: 15, right: 15 },
        tableWidth: 180,
        rowStyles: {
          [tableData.length - 1]: {
            fontStyle: 'bold',
            textColor: [255, 255, 255],
            fontSize: 10
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

      doc.save(`money_transists_${appliedFilters.year}.pdf`);
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
      params.append('account_number_id', appliedFilters.account_number_id || '');
      params.append('estimate_id', appliedFilters.estimate_id || '');

      const response = await apiClient.get(`/money-transists/export?${params.toString()}`, {
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
      link.download = `money_transists_${appliedFilters.year}.csv`;
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
    if (appliedFilters.year) {
      fetchRecords();
    }
  };

  // Get monthly data for display
  const monthlyData = getMonthlyAggregatedData();
  const displayMonths = monthList.length > 0 ? monthList : Object.keys(monthNames).map(Number);

  // GRAND TOTAL - Calculate sum of all months for Transists
  const totalOpening = grandTotals.opening_balance || 0;
  const totalCollection = grandTotals.revenue_collection || 0;
  const totalReceipts = grandTotals.receipts || 0;

  // Calculate Transists as sum of ALL months (Jan to Dec)
  let totalTransists = 0;
  displayMonths.forEach(monthNum => {
    const data = monthlyData[monthNum] || { transists: 0 };
    totalTransists += data.transists || 0;
  });

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
              <h1 className="text-2xl font-bold text-gray-800">Money Transists Report</h1>
              <p className="text-sm text-gray-500 mt-1">
                View money transists with opening balance, revenue collection, receipts, and transists
              </p>
              {appliedFilters.year && (
                <p className="text-sm text-blue-600 mt-1">
                  Showing data for {appliedFilters.year}
                  {appliedFilters.account_number_id && ` - Account: ${accounts.find(a => a.id === parseInt(appliedFilters.account_number_id))?.account_number || 'Selected'}`}
                  {appliedFilters.estimate_id && ` - Estimate: ${estimates.find(e => e.id === parseInt(appliedFilters.estimate_id))?.display || 'Selected'}`}
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


        {/* Active Filters Display - Only show when filters are applied */}
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
              {appliedFilters.account_number_id && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">

                  Account: {accounts.find(a => a.id === parseInt(appliedFilters.account_number_id))?.account_number || appliedFilters.account_number_id}
                </span>
              )}
              {appliedFilters.estimate_id && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
                  <FileText size={12} className="mr-1" />
                  Estimate: {estimates.find(e => e.id === parseInt(appliedFilters.estimate_id))?.display || appliedFilters.estimate_id}
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
            disabled={!appliedFilters.year}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Records Table - Months as Rows - Only show when year is selected */}
        {appliedFilters.year ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 min-w-[120px]">
                      Month
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700  min-w-[150px]">
                      Opening Balance
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700  min-w-[150px]">
                      Revenue Collection
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700  min-w-[150px]">
                      Receipts
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700  min-w-[150px]">
                      Transists
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-gray-500">
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
                    displayMonths.map((monthNum) => {
                      const data = monthlyData[monthNum] || { opening_balance: 0, revenue_collection: 0, receipts: 0, transists: 0 };
                      const isEven = monthNum % 2 === 0;
                      return (
                        <tr key={monthNum} className={`border-b border-gray-100 hover:bg-gray-50 transition ${isEven ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-3 font-medium text-gray-800">
                            {monthNames[monthNum]}
                          </td>
                          <td className="px-6 py-3 text-right  text-gray-700">
                            {formatNumber(data.opening_balance)}
                          </td>
                          <td className="px-6 py-3 text-right  text-gray-700">
                            {formatNumber(data.revenue_collection)}
                          </td>
                          <td className="px-6 py-3 text-right  text-gray-700">
                            {formatNumber(data.receipts)}
                          </td>
                          <td className="px-6 py-3 text-right  font-bold text-gray-800 bg-gray-50">
                            {formatNumber(data.transists)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {records.length > 0 && (
                  <tfoot className=" border-t border-gray-700">
                    <tr>
                      <td className="px-6 py-3 text-right font-bold text-gray-700">
                        GRAND TOTAL
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-700">
                        {formatNumber(totalOpening)}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-700">
                        {formatNumber(totalCollection)}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-700">
                        {formatNumber(totalReceipts)}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-700">
                        {formatNumber(totalTransists)}
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
        ) : (
          /* Show this message when no year is selected */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="text-center py-16 text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <Filter size={48} className="text-gray-300" />
                <p className="text-lg font-medium">Please select a Year to view data</p>
                <p className="text-sm text-gray-400">Click the Filter button above to select a year</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Filter Money Transists</h3>
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
                    Account Number
                  </label>
                  <select
                    name="account_number_id"
                    value={filters.account_number_id}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Accounts</option>
                    {filterOptions.accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.account_number} - {account.description || 'No Description'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Estimate <span className="text-xs text-gray-500">(Revenue Code)</span>
                  </label>
                  <select
                    name="estimate_id"
                    value={filters.estimate_id}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Estimates</option>
                    {filterOptions.estimates.map(estimate => (
                      <option key={estimate.id} value={estimate.id}>
                        {estimate.display || estimate.revenue_code_name || `Estimate #${estimate.id}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: Revenue Code Name (Head-Project-Object)
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Report:</strong> Money Transists
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Columns:</strong> Month, Opening Balance, Revenue Collection, Receipts, Transists
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Calculation:</strong> Transists = Opening Balance + Revenue Collection - Receipts
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Note:</strong> Opening balance for January is from previous year's closing balance.
                    If no specific estimate is selected, opening balance is the sum of ALL estimates for that account.
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Account Selection:</strong> If an account is selected, shows data for that account only. Otherwise, shows aggregated data across all accounts.
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Grand Total:</strong> Shows sum of all months (January to December) for each column.
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
    </>
  );
};

export default MoneyTransists;