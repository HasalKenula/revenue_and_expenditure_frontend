// src/components/RCExpenditurePanel.jsx
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
  Info,
  Building2,
  PieChart,
  BarChart3,
  LineChart
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

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

const RCExpenditurePanel = () => {
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
  const [viewType, setViewType] = useState('cumulative');
  const [objectRanges, setObjectRanges] = useState({});

  const [filters, setFilters] = useState({
    year: '',
    month: '',
    view_type: 'cumulative'
  });

  const [appliedFilters, setAppliedFilters] = useState({
    year: '',
    month: '',
    view_type: 'cumulative'
  });

  const [filterOptions, setFilterOptions] = useState({
    years: [],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  });

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchRecords = async () => {
    if (!appliedFilters.year) {
      setRecords([]);
      return;
    }

    setLoading(true);
    try {
      const params = { 
        year: appliedFilters.year,
        view_type: appliedFilters.view_type || 'cumulative'
      };
      if (appliedFilters.month) {
        params.month = appliedFilters.month;
      }

      const response = await apiClient.get('/rc-expenditure/data', { params });

      if (response.data.success) {
        setRecords(response.data.data.records || []);
        setMonths(response.data.data.months || []);
        setMonthNamesList(response.data.data.month_names || {});
        setSelectedYear(response.data.data.year || '');
        setSelectedMonth(response.data.data.selected_month || '');
        setViewType(response.data.data.view_type || 'cumulative');
        setObjectRanges(response.data.data.object_ranges || {});

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

  const fetchFilterOptions = async () => {
    try {
      const response = await apiClient.get('/rc-expenditure/filter-options');

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

  useEffect(() => {
    if (appliedFilters.year) {
      fetchRecords();
    }
  }, [appliedFilters]);

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
    setFilters({ year: '', month: '', view_type: 'cumulative' });
    setAppliedFilters({ year: '', month: '', view_type: 'cumulative' });
    setRecords([]);
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
    setMonths([]);
    setMonthNamesList({});
  };

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

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Recurrent & Capital Expenditure Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      
      let filterText = `Year: ${appliedFilters.year}`;
      if (appliedFilters.month) {
        if (appliedFilters.view_type === 'cumulative') {
          filterText += ` | Cumulative: Jan - ${monthNames[appliedFilters.month]}`;
        } else {
          filterText += ` | Month: ${monthNames[appliedFilters.month]}`;
        }
      }
      doc.setFontSize(9);
      doc.text(filterText, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });

      const categoryLabels = Object.values(objectRanges).length > 0
        ? Object.values(objectRanges).map(range => range.label)
        : [
            'Personal Emolument', 'Travelling Expenses', 'Supplies',
            'Maintenance Expenditure', 'Contractual Services', 'Transfers and Grants',
            'Interest Payment', 'Other Recurrent Expenditure',
            'Rehabilitation and Improvement of Capital Assets',
            'Acquisition of Capital Assets', 'Capital Transfers',
            'Human Resource', 'Other Capital Expenditure'
          ];

      const tableHeaders = ['Head', ...categoryLabels];

      const tableBody = records.map(record => {
        const row = [];
        if (record.head) {
          row.push(record.head);
        } else {
          row.push(record.head_name || 'TOTAL');
        }
        
        const categoryKeys = Object.keys(objectRanges).length > 0 
          ? Object.keys(objectRanges)
          : [
              'personal_emolument', 'travelling_expenses', 'supplies',
              'maintenance_expenditure', 'contractual_services', 'transfers_grants',
              'interest_payment', 'other_recurrent', 'rehabilitation_capital',
              'acquisition_capital', 'capital_transfers', 'human_resource', 'other_capital'
            ];

        categoryKeys.forEach(key => {
          const totalKey = `${key}_total`;
          row.push(record[totalKey] !== undefined ? formatNumber(record[totalKey]) : '0.00');
        });
        
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
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 2
        },
        bodyStyles: {
          fontSize: 6,
          cellPadding: 2
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 30, left: 8, right: 8 },
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

      const fileName = `rc_expenditure_${appliedFilters.year}${appliedFilters.month ? '_' + (appliedFilters.view_type === 'cumulative' ? 'cumulative' : 'month') + '_' + monthNames[appliedFilters.month] : ''}.pdf`;
      doc.save(fileName);
      alert('PDF exported successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (records.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);
    try {
      const params = { 
        year: appliedFilters.year,
        view_type: appliedFilters.view_type || 'cumulative'
      };
      if (appliedFilters.month) {
        params.month = appliedFilters.month;
      }

      const response = await apiClient.get('/rc-expenditure/export', { params });

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
          a.download = `rc_expenditure_${appliedFilters.year}${appliedFilters.month ? '_' + (appliedFilters.view_type === 'cumulative' ? 'cumulative' : 'month') + '_' + monthNames[appliedFilters.month] : ''}.csv`;
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

  const paginatedRecords = records.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const getMonthRangeDisplay = () => {
    if (!appliedFilters.month) return 'All Months';
    if (appliedFilters.view_type === 'cumulative') {
      return `January - ${monthNames[appliedFilters.month]} (Cumulative)`;
    }
    return monthNames[appliedFilters.month] + ' (Monthly)';
  };

  const categoryKeys = Object.keys(objectRanges).length > 0 
    ? Object.keys(objectRanges)
    : [
        'personal_emolument', 'travelling_expenses', 'supplies',
        'maintenance_expenditure', 'contractual_services', 'transfers_grants',
        'interest_payment', 'other_recurrent', 'rehabilitation_capital',
        'acquisition_capital', 'capital_transfers', 'human_resource', 'other_capital'
      ];

  const categoryLabels = Object.values(objectRanges).length > 0
    ? Object.values(objectRanges).map(range => range.label)
    : [
        'Personal Emolument', 'Travelling Expenses', 'Supplies',
        'Maintenance Expenditure', 'Contractual Services', 'Transfers and Grants',
        'Interest Payment', 'Other Recurrent Expenditure',
        'Rehabilitation and Improvement of Capital Assets',
        'Acquisition of Capital Assets', 'Capital Transfers',
        'Human Resource', 'Other Capital Expenditure'
      ];

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-800">Recurrent & Capital Expenditure</h1>
            <p className="text-sm text-gray-500 mt-1">
              Classification of expenditure by object categories (Heads 300-325)
            </p>
          </div>
          {appliedFilters.year && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Year:</span> {appliedFilters.year}
                {appliedFilters.month && (
                  <span className="ml-2">
                    <span className="font-medium">| View:</span> 
                    {appliedFilters.view_type === 'cumulative' 
                      ? ` Cumulative (Jan - ${monthNames[appliedFilters.month]})` 
                      : ` Monthly (${monthNames[appliedFilters.month]})`}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Type Indicator */}
      {appliedFilters.month && (
        <div className={`rounded-lg p-3 border ${appliedFilters.view_type === 'cumulative' ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center gap-2">
            {appliedFilters.view_type === 'cumulative' ? (
              <LineChart size={18} className="text-purple-600" />
            ) : (
              <BarChart3 size={18} className="text-orange-600" />
            )}
            <span className={`text-sm ${appliedFilters.view_type === 'cumulative' ? 'text-purple-700' : 'text-orange-700'}`}>
              <strong>View Type:</strong> {appliedFilters.view_type === 'cumulative' ? 'Cumulative (Jan to selected month)' : 'Monthly (Selected month only)'}
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Total Heads</p>
            <Building2 size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">{records.filter(r => r.head).length}</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Categories</p>
            <PieChart size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">{categoryLabels.length}</p>
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
            <p className="text-sm opacity-90">View</p>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">
            {selectedMonth ? monthNames[selectedMonth] : 'All'}
          </p>
        </div>
      </div>

      {/* Filters Display */}
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
                {appliedFilters.view_type === 'cumulative' ? 'Cumulative' : 'Monthly'}: {monthNames[appliedFilters.month]}
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
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 min-w-[60px]">Head</th>
                {categoryLabels.map((label, index) => (
                  <th key={index} className="px-2 py-3 text-right font-semibold text-gray-700 min-w-[100px]">
                    <span className="block text-[10px] leading-tight">{label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!appliedFilters.year ? (
                <tr>
                  <td colSpan={categoryLabels.length + 1} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={40} className="text-gray-300" />
                      <p>Please select a Year to view data</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={categoryLabels.length + 1} className="text-center py-12 text-gray-500">
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
                  const isTotalRow = !record.head;
                  return (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                        isTotalRow ? 'bg-gray-100 font-bold' : ''
                      }`}
                    >
                      <td className={`px-2 py-2 font-medium sticky left-0 bg-white ${isTotalRow ? 'bg-gray-100' : ''}`}>
                        {record.head || record.head_name || '-'}
                      </td>
                      {categoryKeys.map((key) => {
                        const totalKey = `${key}_total`;
                        const value = record[totalKey] || 0;
                        return (
                          <td key={key} className={`px-2 py-2 text-right ${isTotalRow ? 'text-blue-600' : 'text-gray-900'}`}>
                            {formatNumber(value)}
                          </td>
                        );
                      })}
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
                  Month
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View Type
                </label>
                <select
                  name="view_type"
                  value={filters.view_type}
                  onChange={handleFilterChange}
                  disabled={!filters.month}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="cumulative">Cumulative (Jan - Month)</option>
                  <option value="monthly">Monthly (Month only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {filters.view_type === 'cumulative' 
                    ? 'Shows cumulative data from January to selected month' 
                    : 'Shows data for the selected month only'}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> This report shows expenditure by object categories for heads <strong>300-325</strong>
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

export default RCExpenditurePanel;