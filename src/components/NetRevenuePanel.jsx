// import React, { useState, useEffect } from 'react';
// import {
//   RefreshCw,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   Filter,
//   X,
//   Calendar,
//   FileText
// } from 'lucide-react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // Create axios instance
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   }
// });

// // Add request interceptor
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Add response interceptor
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// const monthNames = {
//   1: 'January',
//   2: 'February',
//   3: 'March',
//   4: 'April',
//   5: 'May',
//   6: 'June',
//   7: 'July',
//   8: 'August',
//   9: 'September',
//   10: 'October',
//   11: 'November',
//   12: 'December'
// };

// const NetRevenuePanel = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [records, setRecords] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(20);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [lastPage, setLastPage] = useState(1);
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [totals, setTotals] = useState({
//     estimate: 0,
//     re_estimate: 0,
//     months: {}
//   });
//   const [monthColumns, setMonthColumns] = useState([]);
//   const [monthNamesData, setMonthNamesData] = useState({});

//   const [filters, setFilters] = useState({
//     year: '',
//     month: ''
//   });

//   const [appliedFilters, setAppliedFilters] = useState({
//     year: '',
//     month: ''
//   });

//   const [filterOptions, setFilterOptions] = useState({
//     years: [],
//     months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
//   });

//   // Format number with commas
//   const formatNumber = (value) => {
//     if (value === undefined || value === null) return '0.00';
//     return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   };

//   const displayNumber = (value) => {
//     if (value === null || value === undefined || value === '') return '-';
//     if (value === 0 || value === '0') return '0';
//     return value;
//   };

//   // Check authentication on mount
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/login');
//     }
//   }, [navigate]);

//   // Fetch records
//   const fetchRecords = async () => {
//     if (!appliedFilters.year || !appliedFilters.month) {
//       setRecords([]);
//       setTotals({ estimate: 0, re_estimate: 0, months: {} });
//       setMonthColumns([]);
//       return;
//     }

//     setLoading(true);
//     try {
//       const params = {
//         year: appliedFilters.year,
//         month: appliedFilters.month
//       };

//       const response = await apiClient.get('/net-revenue/data', { params });

//       if (response.data.success) {
//         const data = response.data.data;
//         setRecords(data.records || []);
//         setTotals(data.totals || { estimate: 0, re_estimate: 0, months: {} });
//         setMonthColumns(data.months || []);
//         setMonthNamesData(data.month_names || {});

//         const total = data.records?.length || 0;
//         setTotalRecords(total);
//         setLastPage(Math.ceil(total / entriesPerPage));
//         setCurrentPage(1);
//       }
//     } catch (error) {
//       console.error('Error fetching records:', error);
//       if (error.response?.status !== 401) {
//         alert('Failed to fetch records: ' + (error.response?.data?.message || error.message));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch filter options
//   const fetchFilterOptions = async () => {
//     try {
//       const response = await apiClient.get('/net-revenue/filter-options');

//       if (response.data.success) {
//         setFilterOptions(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching filter options:', error);
//       if (error.response?.status === 401) {
//         navigate('/login');
//       }
//     }
//   };

//   // Auto-fetch when filters change
//   useEffect(() => {
//     if (appliedFilters.year && appliedFilters.month) {
//       fetchRecords();
//     }
//   }, [appliedFilters]);

//   // Initial load - fetch filter options
//   useEffect(() => {
//     fetchFilterOptions();
//   }, []);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const applyFilters = () => {
//     if (!filters.year || !filters.month) {
//       alert('Please select both Year and Month');
//       return;
//     }
//     setAppliedFilters({ ...filters });
//     setShowFilterModal(false);
//   };

//   const clearFilters = () => {
//     setFilters({ year: '', month: '' });
//     setAppliedFilters({ year: '', month: '' });
//     setRecords([]);
//     setTotals({ estimate: 0, re_estimate: 0, months: {} });
//     setMonthColumns([]);
//     setCurrentPage(1);
//     setTotalRecords(0);
//     setLastPage(1);
//   };

//   // Export PDF using html2pdf
//   const handleExportPDF = async () => {
//     if (records.length === 0) {
//       alert('No data to export');
//       return;
//     }

//     setLoading(true);
//     try {
//       const params = {
//         year: appliedFilters.year,
//         month: appliedFilters.month
//       };

//       const response = await apiClient.get('/net-revenue/export-pdf', { params });

//       if (response.data.success) {
//         // Load html2pdf library dynamically
//         const script = document.createElement('script');
//         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
//         document.head.appendChild(script);

//         script.onload = () => {
//           const htmlContent = response.data.html;
          
//           // Create a temporary div with the HTML content
//           const tempDiv = document.createElement('div');
//           tempDiv.innerHTML = htmlContent;
//           tempDiv.style.padding = '20px';
//           tempDiv.style.background = 'white';
//           document.body.appendChild(tempDiv);

//           // Generate PDF
//           const opt = {
//             margin: 10,
//             filename: `${response.data.title}.pdf`,
//             image: { type: 'jpeg', quality: 0.98 },
//             html2canvas: { scale: 2, useCORS: true },
//             jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
//           };

//           html2pdf()
//             .set(opt)
//             .from(tempDiv)
//             .save()
//             .then(() => {
//               document.body.removeChild(tempDiv);
//               alert('PDF exported successfully!');
//             })
//             .catch((error) => {
//               console.error('Error generating PDF:', error);
//               document.body.removeChild(tempDiv);
//               alert('Failed to generate PDF: ' + error.message);
//             });
//         };

//         script.onerror = () => {
//           alert('Failed to load PDF library. Please check your internet connection.');
//         };
//       }
//     } catch (error) {
//       console.error('Error exporting PDF:', error);
//       alert('Failed to export PDF: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Export CSV
//   const handleExportCSV = async () => {
//     if (records.length === 0) {
//       alert('No data to export');
//       return;
//     }

//     setLoading(true);
//     try {
//       const params = {
//         year: appliedFilters.year,
//         month: appliedFilters.month
//       };

//       const response = await apiClient.get('/net-revenue/export-csv', { params });

//       if (response.status === 200) {
//         // Create download link
//         const blob = new Blob([response.data], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `net_revenue_${appliedFilters.year}_${appliedFilters.month}.csv`;
//         a.click();
//         window.URL.revokeObjectURL(url);
//         alert('CSV exported successfully!');
//       }
//     } catch (error) {
//       console.error('Error exporting CSV:', error);
//       alert('Failed to export CSV: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshData = () => {
//     fetchFilterOptions();
//     if (appliedFilters.year && appliedFilters.month) {
//       fetchRecords();
//     }
//   };

//   // Paginated records
//   const paginatedRecords = records.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   // Get month display text
//   const getMonthDisplay = (month) => {
//     if (!month) return '';
//     return monthNames[month] || `Month ${month}`;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Loading Overlay */}
//       {loading && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading...</p>
//           </div>
//         </div>
//       )}

//       {/* Page Header */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Net Revenue Report</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               View revenue data with cumulative monthly columns
//             </p>
//           </div>
//           {appliedFilters.year && appliedFilters.month && (
//             <div className="bg-blue-50 rounded-lg px-3 py-2">
//               <p className="text-sm text-blue-700">
//                 <span className="font-medium">Selected:</span> {getMonthDisplay(appliedFilters.month)} {appliedFilters.year}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Summary Cards */}
//       {appliedFilters.year && appliedFilters.month && records.length > 0 && (
//         <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
//           <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
//             <p className="text-sm opacity-90">Total Estimate</p>
//             <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.estimate || 0)}</p>
//           </div>
//           <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
//             <p className="text-sm opacity-90">Total Re-Estimate</p>
//             <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.re_estimate || 0)}</p>
//           </div>
//           <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
//             <p className="text-sm opacity-90">Total Records</p>
//             <p className="text-xl font-bold mt-1">{totalRecords}</p>
//           </div>
//           <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
//             <p className="text-sm opacity-90">Months Displayed</p>
//             <p className="text-xl font-bold mt-1">{monthColumns.length}</p>
//           </div>
//         </div>
//       )}

//       {/* Active Filters Display */}
//       {(appliedFilters.year || appliedFilters.month) && (
//         <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
//             {appliedFilters.year && (
//               <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
//                 Year: {appliedFilters.year}
//               </span>
//             )}
//             {appliedFilters.month && (
//               <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
//                 <Calendar size={12} className="mr-1" />
//                 Month: {getMonthDisplay(appliedFilters.month)}
//               </span>
//             )}
//           </div>
//           <button 
//             onClick={clearFilters} 
//             className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
//           >
//             <X size={14} /> Clear All
//           </button>
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex flex-wrap gap-3">
//         <button 
//           onClick={() => setShowFilterModal(true)} 
//           className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm shadow-sm"
//         >
//           <Filter size={16} />
//           <span>Filter</span>
//         </button>
//         <button 
//           onClick={handleExportPDF} 
//           disabled={records.length === 0} 
//           className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${
//             records.length > 0 
//               ? 'bg-red-600 text-white hover:bg-red-700' 
//               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//           }`}
//         >
//           <FileText size={16} />
//           <span>Export PDF</span>
//         </button>
//         <button 
//           onClick={handleExportCSV} 
//           disabled={records.length === 0} 
//           className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${
//             records.length > 0 
//               ? 'bg-green-600 text-white hover:bg-green-700' 
//               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//           }`}
//         >
//           <Download size={16} />
//           <span>Export CSV</span>
//         </button>
//         <button 
//           onClick={refreshData} 
//           className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm bg-white shadow-sm"
//         >
//           <RefreshCw size={16} />
//           <span>Refresh</span>
//         </button>
//       </div>

//       {/* Records Table */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-3 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
//                   Head-Program-Project-SubProject-Object
//                 </th>
//                 <th className="px-3 py-3 text-left font-semibold text-gray-700 min-w-[120px]">
//                   Revenue Code
//                 </th>
//                 <th className="px-3 py-3 text-right font-semibold text-gray-700 min-w-[100px]">
//                   Estimate
//                 </th>
//                 <th className="px-3 py-3 text-right font-semibold text-gray-700 min-w-[100px]">
//                   Re-Estimate
//                 </th>
//                 {monthColumns.map((month) => (
//                   <th key={month} className="px-3 py-3 text-right font-semibold text-gray-700 min-w-[100px]">
//                     {monthNamesData[month] || `Month ${month}`}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {!appliedFilters.year || !appliedFilters.month ? (
//                 <tr>
//                   <td colSpan={4 + monthColumns.length} className="text-center py-12 text-gray-500">
//                     <div className="flex flex-col items-center gap-2">
//                       <Filter size={40} className="text-gray-300" />
//                       <p>Please select Year and Month to view data</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : paginatedRecords.length === 0 ? (
//                 <tr>
//                   <td colSpan={4 + monthColumns.length} className="text-center py-12 text-gray-500">
//                     <div className="flex flex-col items-center gap-2">
//                       <p>No records found for the selected filters.</p>
//                       <button 
//                         onClick={clearFilters} 
//                         className="text-blue-600 hover:text-blue-800 text-sm"
//                       >
//                         Clear filters and try again
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedRecords.map((record, index) => (
//                   <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
//                     <td className="px-3 py-3 font-medium text-gray-900 text-xs">
//                       {displayNumber(record.head)}-{displayNumber(record.program)}
//                       {displayNumber(record.project)}-{displayNumber(record.sub_project)}
//                       {displayNumber(record.object)}
//                     </td>
//                     <td className="px-3 py-3 text-gray-600 text-xs">
//                       {record.revenue_code_name || '-'}
//                     </td>
//                     <td className="px-3 py-3 text-right text-blue-600 font-medium text-xs">
//                       {formatNumber(record.estimate || 0)}
//                     </td>
//                     <td className="px-3 py-3 text-right text-green-600 font-medium text-xs">
//                       {formatNumber(record.re_estimate || 0)}
//                     </td>
//                     {monthColumns.map((month) => (
//                       <td key={month} className="px-3 py-3 text-right text-gray-700 font-medium text-xs">
//                         {formatNumber(record.months?.[month] || 0)}
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               )}
//             </tbody>
//             {paginatedRecords.length > 0 && (
//               <tfoot className="bg-gray-50 border-t border-gray-200">
//                 <tr className="font-semibold">
//                   <td className="px-3 py-3 text-right text-gray-700">TOTAL</td>
//                   <td className="px-3 py-3"></td>
//                   <td className="px-3 py-3 text-right text-blue-700">
//                     {formatNumber(totals.estimate || 0)}
//                   </td>
//                   <td className="px-3 py-3 text-right text-green-700">
//                     {formatNumber(totals.re_estimate || 0)}
//                   </td>
//                   {monthColumns.map((month) => (
//                     <td key={month} className="px-3 py-3 text-right text-gray-700">
//                       {formatNumber(totals.months?.[month] || 0)}
//                     </td>
//                   ))}
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         </div>

//         {/* Pagination */}
//         {records.length > 0 && (
//           <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600">Show</span>
//               <select 
//                 value={entriesPerPage} 
//                 onChange={(e) => { 
//                   setEntriesPerPage(Number(e.target.value)); 
//                   setCurrentPage(1); 
//                 }} 
//                 className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//               </select>
//               <span className="text-sm text-gray-600">entries</span>
//               <span className="text-sm text-gray-500 ml-2">
//                 Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, totalRecords)} of {totalRecords}
//               </span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <button 
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
//                 disabled={currentPage === 1} 
//                 className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
//               >
//                 <ChevronLeft size={16} />
//               </button>
//               <span className="text-sm text-gray-600">
//                 Page {currentPage} of {lastPage || 1}
//               </span>
//               <button 
//                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))} 
//                 disabled={currentPage === lastPage || lastPage === 0} 
//                 className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
//               >
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Filter Modal */}
//       {showFilterModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-gray-800">Filter Net Revenue Report</h3>
//               <button 
//                 onClick={() => setShowFilterModal(false)} 
//                 className="text-gray-400 hover:text-gray-600 transition"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Year <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="year"
//                   value={filters.year}
//                   onChange={handleFilterChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select Year</option>
//                   {filterOptions.years.map(year => (
//                     <option key={year} value={year}>{year}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Month <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="month"
//                   value={filters.month}
//                   onChange={handleFilterChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select Month</option>
//                   {filterOptions.months.map(month => (
//                     <option key={month} value={month}>
//                       {monthNames[month]}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="bg-blue-50 rounded-lg p-3">
//                 <p className="text-xs text-blue-700">
//                   <strong>Note:</strong> This report shows revenue data from January to selected month
//                 </p>
//                 <p className="text-xs text-blue-700 mt-1">
//                   <strong>Filter:</strong> Year from created_at, Month from month field
//                 </p>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
//               <button 
//                 onClick={() => setShowFilterModal(false)} 
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={applyFilters} 
//                 disabled={!filters.year || !filters.month}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NetRevenuePanel;



import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Calendar,
  FileText
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

const NetRevenuePanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [totals, setTotals] = useState({
    estimate: 0,
    re_estimate: 0,
    months: {},
    refund_months: {},
    total_revenue: 0,
    revenue_refund: 0,
    net_revenue: 0
  });
  const [monthColumns, setMonthColumns] = useState([]);
  const [monthNamesData, setMonthNamesData] = useState({});

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
    if (!appliedFilters.year || !appliedFilters.month) {
      setRecords([]);
      setTotals({ estimate: 0, re_estimate: 0, months: {}, refund_months: {}, total_revenue: 0, revenue_refund: 0, net_revenue: 0 });
      setMonthColumns([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        month: appliedFilters.month
      };

      const response = await apiClient.get('/net-revenue/data', { params });

      if (response.data.success) {
        const data = response.data.data;
        setRecords(data.records || []);
        setTotals(data.totals || { estimate: 0, re_estimate: 0, months: {}, refund_months: {}, total_revenue: 0, revenue_refund: 0, net_revenue: 0 });
        setMonthColumns(data.months || []);
        setMonthNamesData(data.month_names || {});

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
      const response = await apiClient.get('/net-revenue/filter-options');

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
    if (appliedFilters.year && appliedFilters.month) {
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
    setTotals({ estimate: 0, re_estimate: 0, months: {}, refund_months: {}, total_revenue: 0, revenue_refund: 0, net_revenue: 0 });
    setMonthColumns([]);
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
  };

  // Generate PDF Report - A3 Landscape
  // const handleExportPDF = () => {
  //   if (records.length === 0) {
  //     alert('No data to export');
  //     return;
  //   }

  //   setLoading(true);
    
  //   try {
  //     // Create PDF in landscape orientation (A3)
  //     const doc = new jsPDF({
  //       orientation: 'landscape',
  //       unit: 'mm',
  //       format: 'a3'
  //     });

  //     // Get current date
  //     const currentDate = new Date().toLocaleString();

  //     // Add Header
  //     doc.setFontSize(16);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('Net Revenue Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
  //     doc.setFontSize(10);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      
  //     // Add filter information
  //     const monthName = monthNames[appliedFilters.month] || appliedFilters.month;
  //     let filterText = `Year: ${appliedFilters.year} | Month: ${monthName} (Cumulative)`;
      
  //     doc.setFontSize(9);
  //     doc.text(filterText, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });

  //     // Prepare table headers
  //     const tableHeaders = [
  //       'Revenue Code',
  //       'Revenue Category',
  //       'Original Estimate',
  //       'Revised Estimate'
  //     ];

  //     // Add month headers
  //     monthColumns.forEach(m => {
  //       tableHeaders.push(monthNamesData[m] || `Month ${m}`);
  //     });

  //     tableHeaders.push('Total Revenue');
  //     tableHeaders.push('Revenue Refund');
  //     tableHeaders.push('Net Revenue');

  //     // Prepare table data
  //     const tableBody = records.map(record => {
  //       const row = [
  //         formatCombinedCode(record),
  //         record.revenue_code_name || '',
  //         formatNumber(record.estimate || 0),
  //         formatNumber(record.re_estimate || 0)
  //       ];

  //       monthColumns.forEach(m => {
  //         row.push(formatNumber(record.months?.[m] || 0));
  //       });

  //       row.push(formatNumber(record.total_revenue || 0));
  //       row.push(formatNumber(record.revenue_refund || 0));
  //       row.push(formatNumber(record.net_revenue || 0));

  //       return row;
  //     });

  //     // Add totals row
  //     const totalRow = ['TOTAL', '', formatNumber(totals.estimate || 0), formatNumber(totals.re_estimate || 0)];
  //     monthColumns.forEach(m => {
  //       totalRow.push(formatNumber(totals.months?.[m] || 0));
  //     });
  //     totalRow.push(formatNumber(totals.total_revenue || 0));
  //     totalRow.push(formatNumber(totals.revenue_refund || 0));
  //     totalRow.push(formatNumber(totals.net_revenue || 0));
  //     tableBody.push(totalRow);

  //     // Define column widths - A3 landscape has more space
  //     const totalMonths = monthColumns.length;
  //     const monthWidth = totalMonths > 0 ? Math.min(30, 400 / totalMonths) : 20;

  //     // Generate table
  //     autoTable(doc, {
  //       head: [tableHeaders],
  //       body: tableBody,
  //       startY: 35,
  //       theme: 'striped',
  //       headStyles: {
  //         fillColor: [41, 128, 185],
  //         textColor: [255, 255, 255],
  //         fontSize: 8,
  //         fontStyle: 'bold',
  //         halign: 'center',
  //         cellPadding: 2
  //       },
  //       bodyStyles: {
  //         fontSize: 7,
  //         cellPadding: 2
  //       },
  //       columnStyles: {
  //         0: { cellWidth: 45, halign: 'left' },
  //         1: { cellWidth: 25, halign: 'left' },
  //         2: { cellWidth: 20, halign: 'right' },
  //         3: { cellWidth: 20, halign: 'right' },
  //         // Dynamic month columns
  //         ...Object.fromEntries(
  //           Array.from({ length: totalMonths }, (_, i) => {
  //             const colIndex = i + 4;
  //             return [colIndex, { cellWidth: monthWidth, halign: 'right' }];
  //           })
  //         ),
  //         // Total Revenue, Revenue Refund, Net Revenue
  //         [4 + totalMonths]: { cellWidth: 22, halign: 'right' },
  //         [5 + totalMonths]: { cellWidth: 22, halign: 'right' },
  //         [6 + totalMonths]: { cellWidth: 22, halign: 'right' }
  //       },
  //       alternateRowStyles: { fillColor: [245, 245, 245] },
  //       margin: { top: 35, left: 10, right: 10 },
  //       didDrawPage: function(data) {
  //         // Footer is added after table generation
  //       }
  //     });

  //     // Add footer to all pages
  //     const pageCount = doc.internal.getNumberOfPages();
  //     for (let i = 1; i <= pageCount; i++) {
  //       doc.setPage(i);
  //       doc.setFontSize(8);
  //       doc.setTextColor(128, 128, 128);
  //       doc.text(
  //         `Page ${i} of ${pageCount}`,
  //         doc.internal.pageSize.getWidth() / 2,
  //         doc.internal.pageSize.getHeight() - 10,
  //         { align: 'center' }
  //       );
  //     }

  //     // Save PDF
  //     doc.save(`net_revenue_report_${appliedFilters.year}_${appliedFilters.month}.pdf`);
  //     alert('PDF exported successfully!');
      
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //     alert('Failed to generate PDF: ' + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      format: 'a3'
    });

    // Get current date
    const currentDate = new Date().toLocaleString();

    // Add Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Revenue Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    
    // Add filter information
    const monthName = monthNames[appliedFilters.month] || appliedFilters.month;
    let filterText = `Year: ${appliedFilters.year} | Month: ${monthName} (Cumulative)`;
    
    doc.setFontSize(9);
    doc.text(filterText, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });

    // Prepare table headers
    const tableHeaders = [
      'Revenue Code',
      'Revenue Category',
      'Original Estimate',
      'Revised Estimate'
    ];

    // Add month headers - ALL months from January to selected month
    monthColumns.forEach(m => {
      tableHeaders.push(monthNamesData[m] || `Month ${m}`);
    });

    tableHeaders.push('Total Revenue');
    tableHeaders.push('Revenue Refund');
    tableHeaders.push('Net Revenue');

    // Prepare table data
    const tableBody = records.map(record => {
      const row = [
        formatCombinedCode(record),
        record.revenue_code_name || '',
        formatNumber(record.estimate || 0),
        formatNumber(record.re_estimate || 0)
      ];

      // Add ALL month values
      monthColumns.forEach(m => {
        row.push(formatNumber(record.months?.[m] || 0));
      });

      row.push(formatNumber(record.total_revenue || 0));
      row.push(formatNumber(record.revenue_refund || 0));
      row.push(formatNumber(record.net_revenue || 0));

      return row;
    });

    // Add totals row
    const totalRow = ['TOTAL', '', formatNumber(totals.estimate || 0), formatNumber(totals.re_estimate || 0)];
    monthColumns.forEach(m => {
      totalRow.push(formatNumber(totals.months?.[m] || 0));
    });
    totalRow.push(formatNumber(totals.total_revenue || 0));
    totalRow.push(formatNumber(totals.revenue_refund || 0));
    totalRow.push(formatNumber(totals.net_revenue || 0));
    tableBody.push(totalRow);

    // Calculate dynamic column widths based on number of months
    const totalMonths = monthColumns.length;
    
    // Fixed columns: Revenue Code, Revenue Category, Original Estimate, Revised Estimate
    // These are 4 fixed columns
    const fixedColumns = 4;
    // Total columns: fixed + months + 3 (Total Revenue, Revenue Refund, Net Revenue)
    const totalColumns = fixedColumns + totalMonths + 3;
    
    // A3 landscape width is 420mm, with margins (10mm each side) usable width is 400mm
    const usableWidth = 400;
    
    // Calculate widths
    let monthWidth = 0;
    let fixedWidth = 0;
    
    if (totalMonths <= 3) {
      // Few months - give more space to each
      monthWidth = 45;
      fixedWidth = 35;
    } else if (totalMonths <= 6) {
      // Medium months
      monthWidth = 40;
      fixedWidth = 30;
    } else if (totalMonths <= 9) {
      // Many months
      monthWidth = 25;
      fixedWidth = 25;
    } else {
      // Lots of months (up to 12)
      monthWidth = 23;
      fixedWidth = 25;
    }
    
    // Calculate total width used
    const totalFixedWidth = fixedWidth * fixedColumns;
    const totalMonthWidth = monthWidth * totalMonths;
    const totalExtraWidth = 22 * 3; // Total Revenue, Revenue Refund, Net Revenue
    
    const totalUsedWidth = totalFixedWidth + totalMonthWidth + totalExtraWidth;
    
    // If total used width exceeds usable width, scale down
    if (totalUsedWidth > usableWidth) {
      const scale = usableWidth / totalUsedWidth;
      fixedWidth = fixedWidth * scale;
      monthWidth = monthWidth * scale;
    }

    // Build column styles dynamically
    const columnStyles = {};
    
    // Fixed columns
    columnStyles[0] = { cellWidth: fixedWidth, halign: 'left' };
    columnStyles[1] = { cellWidth: fixedWidth, halign: 'left' };
    columnStyles[2] = { cellWidth: fixedWidth * 1.1, halign: 'right' };
    columnStyles[3] = { cellWidth: fixedWidth * 1.1, halign: 'right' };
    
    // Month columns
    for (let i = 0; i < totalMonths; i++) {
      const colIndex = i + 4;
      columnStyles[colIndex] = { cellWidth: monthWidth, halign: 'right' };
    }
    
    // Total Revenue, Revenue Refund, Net Revenue
    const extraStartIndex = 4 + totalMonths;
    columnStyles[extraStartIndex] = { cellWidth: 25, halign: 'right' };
    columnStyles[extraStartIndex + 1] = { cellWidth: 23, halign: 'right' };
    columnStyles[extraStartIndex + 2] = { cellWidth: 25, halign: 'right' };

    // Generate table
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
      columnStyles: columnStyles,
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35, left: 1, right: 1 },
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
    doc.save(`net_revenue_report_${appliedFilters.year}_${appliedFilters.month}.pdf`);
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
        year: appliedFilters.year,
        month: appliedFilters.month
      };

      const response = await apiClient.get('/net-revenue/export-csv', { params });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `net_revenue_${appliedFilters.year}_${appliedFilters.month}.csv`;
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
    if (appliedFilters.year && appliedFilters.month) {
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
            <h1 className="text-2xl font-bold text-gray-800">Net Revenue Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              View revenue data with cumulative monthly columns
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
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Estimate</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.estimate || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Re-Estimate</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.re_estimate || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Revenue</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.total_revenue || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Revenue Refund</p>
            <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.revenue_refund || 0)}</p>
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
                Month: {getMonthDisplay(appliedFilters.month)} (Cumulative)
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
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 min-w-[180px]">
                  Revenue Code
                </th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 min-w-[100px]">
                  Revenue Category
                </th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[80px]">
                  Original Estimate
                </th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[80px]">
                  Revised Estimate
                </th>
                {monthColumns.map((month) => (
                  <th key={month} className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[70px]">
                    {monthNamesData[month] || `Month ${month}`}
                  </th>
                ))}
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[90px] bg-blue-50">
                  Total Revenue
                </th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[90px] bg-red-50">
                  Revenue Refund
                </th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[90px] bg-indigo-50">
                  Net Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {!appliedFilters.year || !appliedFilters.month ? (
                <tr>
                  <td colSpan={7 + monthColumns.length} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={40} className="text-gray-300" />
                      <p>Please select Year and Month to view data</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7 + monthColumns.length} className="text-center py-12 text-gray-500">
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
                    <td className="px-2 py-2 font-medium text-gray-900 text-xs">
                      {formatCombinedCode(record)}
                    </td>
                    <td className="px-2 py-2 text-gray-600 text-xs">
                      {record.revenue_code_name || '-'}
                    </td>
                    <td className="px-2 py-2 text-right text-blue-600 font-medium text-xs">
                      {formatNumber(record.estimate || 0)}
                    </td>
                    <td className="px-2 py-2 text-right text-green-600 font-medium text-xs">
                      {formatNumber(record.re_estimate || 0)}
                    </td>
                    {monthColumns.map((month) => (
                      <td key={month} className="px-2 py-2 text-right text-gray-700 font-medium text-xs">
                        {formatNumber(record.months?.[month] || 0)}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-right text-blue-600 font-bold text-xs bg-blue-50">
                      {formatNumber(record.total_revenue || 0)}
                    </td>
                    <td className="px-2 py-2 text-right text-red-600 font-bold text-xs bg-red-50">
                      {formatNumber(record.revenue_refund || 0)}
                    </td>
                    <td className="px-2 py-2 text-right text-indigo-600 font-bold text-xs bg-indigo-50">
                      {formatNumber(record.net_revenue || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {paginatedRecords.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr className="font-semibold">
                  <td className="px-2 py-2 text-right text-gray-700">TOTAL</td>
                  <td className="px-2 py-2"></td>
                  <td className="px-2 py-2 text-right text-blue-700">
                    {formatNumber(totals.estimate || 0)}
                  </td>
                  <td className="px-2 py-2 text-right text-green-700">
                    {formatNumber(totals.re_estimate || 0)}
                  </td>
                  {monthColumns.map((month) => (
                    <td key={month} className="px-2 py-2 text-right text-gray-700">
                      {formatNumber(totals.months?.[month] || 0)}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right text-blue-700 bg-blue-50">
                    {formatNumber(totals.total_revenue || 0)}
                  </td>
                  <td className="px-2 py-2 text-right text-red-700 bg-red-50">
                    {formatNumber(totals.revenue_refund || 0)}
                  </td>
                  <td className="px-2 py-2 text-right text-indigo-700 bg-indigo-50">
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
              <h3 className="text-lg font-semibold text-gray-800">Filter Net Revenue Report</h3>
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
                      {monthNames[month]} (Jan - {monthNames[month]})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Shows cumulative values from January to selected month
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Total Revenue:</strong> Sum of months (dr_cr_code=4000, dr_cr=CR)
                </p>
                <p className="text-xs text-red-700 mt-1">
                  <strong>Revenue Refund:</strong> Sum of months (dr_cr_code=5000, dr_cr=DR)
                </p>
                <p className="text-xs text-indigo-700 mt-1">
                  <strong>Net Revenue:</strong> Total Revenue - Revenue Refund
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

export default NetRevenuePanel;