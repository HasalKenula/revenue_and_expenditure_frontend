// src/components/UpkeepPanel.jsx
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
  LineChart,
  Table as TableIcon,
  Wallet
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

const UpkeepPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [upkeepData, setUpkeepData] = useState([]);
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
  const [totals, setTotals] = useState({
    total_allocation: 0,
    total_expenditure: 0,
    total_balance: 0
  });

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
    if (!appliedFilters.year || !appliedFilters.month) {
      setUpkeepData([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        month: appliedFilters.month,
        view_type: appliedFilters.view_type || 'cumulative'
      };

      const response = await apiClient.get('/upkeep/data', { params });

      if (response.data.success) {
        const data = response.data.data.upkeep_report || [];
        
        setUpkeepData(data);
        setMonths(response.data.data.months || []);
        setMonthNamesList(response.data.data.month_names || {});
        setSelectedYear(response.data.data.filters?.year || '');
        setSelectedMonth(response.data.data.filters?.month || '');
        setViewType(response.data.data.filters?.view_type || 'cumulative');

        // Calculate totals
        let totalAllocation = 0;
        let totalExpenditure = 0;
        let totalBalance = 0;

        data.forEach(record => {
          if (record.subject_name !== 'Total') {
            totalAllocation += record.allocation || 0;
            totalExpenditure += record.expenditure || 0;
            totalBalance += record.balance || 0;
          }
        });

        setTotals({
          total_allocation: totalAllocation,
          total_expenditure: totalExpenditure,
          total_balance: totalBalance
        });

        const total = data.length || 0;
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
      const response = await apiClient.get('/upkeep/filter-options');

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
    if (appliedFilters.year && appliedFilters.month) {
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
    if (!filters.month) {
      alert('Please select a Month');
      return;
    }
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({ year: '', month: '', view_type: 'cumulative' });
    setAppliedFilters({ year: '', month: '', view_type: 'cumulative' });
    setUpkeepData([]);
    setTotals({ total_allocation: 0, total_expenditure: 0, total_balance: 0 });
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
    setMonths([]);
    setMonthNamesList({});
  };

  const handleExportPDF = () => {
    if (upkeepData.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const currentDate = new Date().toLocaleString();

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Upkeep Report (Education)', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 28, { align: 'center' });

      const monthText = monthNames[appliedFilters.month] || appliedFilters.month;
      let filterText = `Year: ${appliedFilters.year} | Month: ${monthText}`;
      if (appliedFilters.view_type === 'cumulative') {
        filterText += ` | View: Cumulative (Jan - ${monthText})`;
      } else {
        filterText += ` | View: Monthly (${monthText})`;
      }
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(filterText, pageWidth / 2, 36, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.line(15, 40, pageWidth - 15, 40);

      const tableHeaders = ['TR No', 'Program', 'Project', 'Sub Project', 'Object', 'Subject Name', 'Allocation', 'Expenditure', 'Balance'];

      const tableBody = upkeepData.map(record => [
        record.trno || '-',
        record.program || '-',
        record.project || '-',
        record.sub_project || '-',
        record.object || '-',
        record.subject_name || '-',
        formatNumber(record.allocation),
        formatNumber(record.expenditure),
        formatNumber(record.balance)
      ]);

      autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: 45,
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
          fontSize: 7,
          cellPadding: 2,
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 16, halign: 'center' },
          1: { cellWidth: 16, halign: 'center' },
          2: { cellWidth: 16, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 16, halign: 'center' },
          5: { cellWidth: 28, halign: 'left' },
          6: { cellWidth: 22, halign: 'right' },
          7: { cellWidth: 24, halign: 'right' },
          8: { cellWidth: 24, halign: 'right' }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 45, left: 10, right: 10, bottom: 20 },
        tableWidth: 'auto',
        didParseCell: function(data) {
          if (data.row.index === 0) return;
          if (data.row.index === upkeepData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [220, 220, 220];
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.lineWidth = 0.5;
            data.cell.styles.lineColor = [100, 100, 100];
          }
          if (data.column.index === 8) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = data.row.index === upkeepData.length - 1 ? [0, 0, 0] : [142, 68, 173];
          }
        },
        didDrawPage: function(data) {
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(200, 200, 200);
            doc.line(12, pageHeight - 12, pageWidth - 12, pageHeight - 12);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
              `Page ${i} of ${pageCount}`,
              pageWidth / 2,
              pageHeight - 5,
              { align: 'center' }
            );
          }
        }
      });

      const viewText = appliedFilters.view_type === 'cumulative' ? 'cumulative' : 'monthly';
      const fileName = `upkeep_report_${viewText}_${appliedFilters.year}_${monthText}.pdf`;
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
    if (upkeepData.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        month: appliedFilters.month,
        view_type: appliedFilters.view_type || 'cumulative'
      };

      const response = await apiClient.get('/upkeep/export', { params });

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
          a.download = `upkeep_report_${appliedFilters.view_type}_${appliedFilters.year}_${monthNames[appliedFilters.month]}.csv`;
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
    if (appliedFilters.year && appliedFilters.month) {
      fetchRecords();
    }
  };

  const getMonthRangeDisplay = () => {
    if (!appliedFilters.month) return 'All Months';
    if (appliedFilters.view_type === 'cumulative') {
      return `January - ${monthNames[appliedFilters.month]} (Cumulative)`;
    }
    return monthNames[appliedFilters.month] + ' (Monthly)';
  };

  const paginatedData = upkeepData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

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
            <h1 className="text-2xl font-bold text-gray-800">Upkeep Report (Education)</h1>
            <p className="text-sm text-gray-500 mt-1">
              Allocation, expenditure and balance summary by program, project, sub project and object
            </p>
          </div>
          {appliedFilters.year && appliedFilters.month && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Year:</span> {appliedFilters.year} | 
                <span className="font-medium ml-2">Month:</span> {monthNames[appliedFilters.month]}
                <span className="font-medium ml-2">| View:</span> {appliedFilters.view_type === 'cumulative' ? 'Cumulative' : 'Monthly'}
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
              <TableIcon size={18} className="text-orange-600" />
            )}
            <span className={`text-sm ${appliedFilters.view_type === 'cumulative' ? 'text-purple-700' : 'text-orange-700'}`}>
              <strong>View Type:</strong> {getMonthRangeDisplay()}
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Total Allocation</p>
            <Wallet size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_allocation)}</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Total Expenditure</p>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_expenditure)}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Total Balance</p>
            <TrendingDown size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_balance)}</p>
        </div>
      </div>

      {/* Filters Display */}
      {(appliedFilters.year || appliedFilters.month) && (
        <div className="bg-blue-50 rounded-lg p-3 flex flex-wrap items-center justify-between">
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
                Month: {monthNames[appliedFilters.month]}
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
          disabled={upkeepData.length === 0} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${
            upkeepData.length > 0 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FileText size={16} />
          <span>Export PDF</span>
        </button>
        <button 
          onClick={handleExportCSV} 
          disabled={upkeepData.length === 0} 
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${
            upkeepData.length > 0 
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
                <th className="px-3 py-3 text-left font-semibold text-gray-700">TR No</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700">Program</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700">Project</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700">Sub Project</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700">Object</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700">Subject Name</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-700">Allocation</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-700">Expenditure</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-700 bg-purple-50">Balance</th>
              </tr>
            </thead>
            <tbody>
              {!appliedFilters.year || !appliedFilters.month ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={40} className="text-gray-300" />
                      <p>Please select Year and Month to view data</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-500">
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
                paginatedData.map((record, index) => {
                  const isTotal = record.subject_name === 'Total';
                  return (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                        isTotal ? 'bg-gray-100 font-bold' : ''
                      }`}
                    >
                      <td className={`px-3 py-3 ${isTotal ? 'text-blue-700' : 'text-gray-700'}`}>
                        {record.trno || '-'}
                      </td>
                      <td className="px-3 py-3 text-gray-700">{record.program || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{record.project || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{record.sub_project || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{record.object || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{record.subject_name || '-'}</td>
                      <td className="px-3 py-3 text-right text-gray-900">
                        Rs{formatNumber(record.allocation)}
                      </td>
                      <td className="px-3 py-3 text-right text-green-600">
                        Rs{formatNumber(record.expenditure)}
                      </td>
                      <td className={`px-3 py-3 text-right font-medium ${
                        parseFloat(record.balance) >= 0 ? 'text-purple-600' : 'text-red-600'
                      } ${isTotal ? 'bg-purple-50' : ''}`}>
                        Rs{formatNumber(record.balance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {upkeepData.length > 0 && (
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
              <h3 className="text-lg font-semibold text-gray-800">Filter Upkeep Report</h3>
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
                  Month <span className="text-red-500">*</span>
                </label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Month</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cumulative">Cumulative (Jan - Month)</option>
                  <option value="monthly">Monthly (Month only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {filters.view_type === 'cumulative' 
                    ? 'Shows cumulative expenditure from January to selected month' 
                    : 'Shows expenditure for the selected month only'}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> This report shows allocation, expenditure and balance for Education (Upkeep).
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>Allocation:</strong> From Budget table | <strong>Expenditure:</strong> DR(1000) - CR(2000)
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
                disabled={!filters.year || !filters.month}
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

export default UpkeepPanel;