
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
  DollarSign
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
  (error) => Promise.reject(error)
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

const NatureOfRevenuePanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);
  const [selectedMonthName, setSelectedMonthName] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [province, setProvince] = useState('Southern');

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

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatNumberCompact = (value) => {
    if (value === undefined || value === null) return '0';
    return parseFloat(value).toLocaleString('en-US');
  };

  const displayNumber = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (value === 0 || value === '0') return '0';
    return value;
  };

  const padNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return String(value).padStart(2, '0');
  };

  const formatCombinedCode = (record) => {
    const head = displayNumber(record.head);
    const project = padNumber(record.project);
    const object = padNumber(record.object);
    return `${head}-${project}-${object}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchRecords = async () => {
    if (!appliedFilters.year || !appliedFilters.month) {
      setRecords([]);
      setGroupedRecords({});
      setGrandTotal(0);
      setSelectedMonthName('');
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        month: appliedFilters.month
      };

      const response = await apiClient.get('/nature-of-revenue/data', { params });

      if (response.data.success) {
        const data = response.data.data;
        setRecords(data.records || []);
        setGroupedRecords(data.grouped_records || {});
        setGrandTotal(data.grand_total || 0);
        setSelectedMonthName(data.month_name || '');
        setSelectedYear(data.year || '');
        setProvince(data.province || 'Southern');

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

  const fetchFilterOptions = async () => {
    try {
      const response = await apiClient.get('/nature-of-revenue/filter-options');

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
    if (!filters.year || !filters.month) {
      alert('Please select both Year and Month');
      return;
    }
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({ year: '', month: '' });
    setAppliedFilters({ year: '', month: '' });
    setRecords([]);
    setGroupedRecords({});
    setGrandTotal(0);
    setSelectedMonthName('');
    setSelectedYear('');
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
  };

  const handleExportPDF = () => {
    if (records.length === 0) {
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

      // ===== HEADER with Decoration =====

      

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('NATURE OF REVENUE REPORT', pageWidth / 2, 30, { align: 'center' });

      // Subtitle
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text('Revenue Grouped by Nature and Category', pageWidth / 2, 38, { align: 'center' });

      // Details
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      const monthText = selectedMonthName || monthNames[appliedFilters.month] || '';
      const yearText = selectedYear || appliedFilters.year || '';
      doc.text(`Year: ${yearText}  |  Month: ${monthText}  |  Province: ${province}`, pageWidth / 2, 45, { align: 'center' });

      // Generation date
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 20, 52, { align: 'right' });

     
      doc.setLineWidth(0.5);
      doc.line(10, 56, pageWidth - 10, 56);

      // ===== TABLE =====

      const tableHeaders = ['Revenue Head', 'Nature of Revenue', 'Amount (RS)'];
      const tableBody = [];

      // Define category colors
      const categoryColors = {
        'Taxes on Local Goods and services': [255, 255, 255],
        'Licence Fees & others': [255, 255, 255],
        'Revenue on Government Assets': [255, 255, 255],
        'Sales and Charges': [255, 255, 255],
        'Sales of Capital Assets': [255, 255, 255]
      };

      // Build table data
      Object.keys(groupedRecords).forEach(category => {
        const categoryData = groupedRecords[category];
        if (!categoryData.items || categoryData.items.length === 0) return;

        const total = categoryData.total || 0;
        const bgColor = categoryColors[category] || [243, 244, 246];

        // Category header row
        tableBody.push([
          { content: category, colSpan: 1, styles: { fontStyle: 'bold', fillColor: bgColor, textColor: [0, 0, 0] } },
          { content: '', styles: { fillColor: bgColor } },
          { content: formatNumberCompact(total), styles: { halign: 'right', fontStyle: 'bold', fillColor: bgColor, textColor: [0, 0, 0] } }
        ]);

        // Items
        categoryData.items.forEach(item => {
          const code = item.code || '';
          const name = item.revenue_code_name || '';
          const netRevenue = item.net_revenue || 0;

          tableBody.push([
            { content: code, styles: { fontSize: 8, textColor: [0, 0, 0] } },
            name,
            { content: formatNumberCompact(netRevenue), styles: { halign: 'right' } }
          ]);
        });

        // Spacing row
        tableBody.push([
          { content: '', styles: {  } },
          { content: '', styles: {  } },
          { content: '', styles: {  } }
        ]);
      });

      // Grand Total row
      tableBody.push([
        { content: 'GRAND TOTAL', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
        { content: formatNumberCompact(grandTotal), styles: { halign: 'right', fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [0, 0, 0] } }
      ]);

      autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: 62,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 4
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 100 },
          2: { cellWidth: 40, halign: 'right' }
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { top: 62, left: 15, right: 15, bottom: 20 },
        didDrawPage: function (data) {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Footer line
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.3);
            doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);

            // Footer text
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(107, 114, 128);
            doc.text(
              'Nature of Revenue Report',
              15,
              pageHeight - 5,
              { align: 'left' }
            );
            doc.text(
              `Page ${i} of ${pageCount}`,
              pageWidth - 15,
              pageHeight - 5,
              { align: 'right' }
            );
          }
        }
      });

      doc.save(`nature_of_revenue_report_${yearText}_${monthText}.pdf`);
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
        month: appliedFilters.month
      };

      const response = await apiClient.get('/nature-of-revenue/export-csv', {
        params,
        responseType: 'blob'
      });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nature_of_revenue_${appliedFilters.year}_${selectedMonthName || monthNames[appliedFilters.month]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
    if (appliedFilters.year && appliedFilters.month) {
      fetchRecords();
    }
  };

  const getMonthDisplay = (month) => {
    if (!month) return '';
    return monthNames[month] || `Month ${month}`;
  };

  // Build flattened records WITH category headers
  const flattenedRecords = [];
  Object.keys(groupedRecords).forEach(category => {
    const categoryData = groupedRecords[category];
    if (categoryData.items && categoryData.items.length > 0) {
      flattenedRecords.push({
        isCategoryHeader: true,
        category: category,
        total: categoryData.total,
        itemsCount: categoryData.items.length
      });

      categoryData.items.forEach(item => {
        flattenedRecords.push({
          ...item,
          isCategoryHeader: false,
          category: category
        });
      });
    }
  });

  const paginatedRecords = flattenedRecords.slice(
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
              <h1 className="text-2xl font-bold text-gray-800">Nature of Revenue Report</h1>
              <p className="text-sm text-gray-500 mt-1">
                Revenue grouped by nature and category
              </p>
            </div>
            {appliedFilters.year && appliedFilters.month && (
              <div className="bg-blue-50 rounded-lg px-3 py-2">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Selected:</span> {getMonthDisplay(appliedFilters.month)} {appliedFilters.year}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {appliedFilters.year && appliedFilters.month && records.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <p className="text-sm opacity-90">Total Categories</p>
              <p className="text-xl font-bold mt-1">{Object.keys(groupedRecords).length}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <p className="text-sm opacity-90">Total Revenue Items</p>
              <p className="text-xl font-bold mt-1">{records.length}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <p className="text-sm opacity-90">Grand Total</p>
              <p className="text-xl font-bold mt-1">Rs{formatNumber(grandTotal)}</p>
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
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Records Table with Category Headers */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-700 min-w-[120px]">
                    Revenue Head
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-700 min-w-[200px]">
                    Nature of Revenue
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-700 min-w-[120px]">
                    Amount (RS)
                  </th>
                </tr>
              </thead>
              <tbody>
                {!appliedFilters.year || !appliedFilters.month ? (
                  <tr>
                    <td colSpan="3" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Filter size={40} className="text-gray-300" />
                        <p>Please select Year and Month to view data</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-12 text-gray-500">
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
                    if (record.isCategoryHeader) {
                      return (
                        <tr key={`header-${index}`} className="bg-blue-50 border-t border-b border-blue-200">
                          <td colSpan="2" className="px-3 py-2.5 font-bold text-blue-800 text-xs">
                            {record.category}
                            <span className="ml-2 font-normal text-blue-600 text-[10px]">
                              ({record.itemsCount} items)
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-blue-800 text-xs">
                            {formatNumberCompact(record.total)}
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={`item-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-3 py-2 font-medium text-gray-900 text-xs">
                            {record.code || '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-600 text-xs">
                            {record.revenue_code_name || '-'}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-gray-700 text-xs">
                            {formatNumberCompact(record.net_revenue)}
                          </td>
                        </tr>
                      );
                    }
                  })
                )}
              </tbody>
              {paginatedRecords.length > 0 && (
                <tfoot className="bg-gray-50 border-t border-gray-200 sticky bottom-0">
                  <tr className="font-semibold">
                    <td className="px-3 py-2.5 text-right text-gray-700">Grand Total</td>
                    <td className="px-3 py-2.5"></td>
                    <td className="px-3 py-2.5 text-right text-blue-700 text-sm">
                      {formatNumberCompact(grandTotal)}
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
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filter Revenue Report</h3>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Shows revenue data for the selected month
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Revenue is grouped by nature and category
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Categories:</strong> Taxes, Licence Fees, Government Assets, Sales and Charges, Capital Assets
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
    </>
  );
};

export default NatureOfRevenuePanel;