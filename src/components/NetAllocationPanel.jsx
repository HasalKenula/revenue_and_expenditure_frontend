// // src/components/NetAllocationPanel.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   RefreshCw,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   Filter,
//   X,
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   PieChart,
//   BarChart3,
//   Calendar
// } from 'lucide-react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// // Create axios instance with default config
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   }
// });

// // Add request interceptor to always include token
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor to handle 401 errors
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

// const NetAllocationPanel = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [records, setRecords] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(20);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [lastPage, setLastPage] = useState(1);
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [totals, setTotals] = useState({
//     total_allocation: 0,
//     total_fr66p: 0,
//     total_fr66m: 0,
//     total_supplementary: 0,
//     total_net_allocation: 0
//   });

//   const [filters, setFilters] = useState({
//     head: '',
//     program: '',
//     project: '',
//     month: ''
//   });

//   const [appliedFilters, setAppliedFilters] = useState({
//     head: '',
//     program: '',
//     project: '',
//     month: ''
//   });

//   const [filterOptions, setFilterOptions] = useState({
//     heads: [],
//     programs: [],
//     projects: [],
//     months: []
//   });

//   // Format number with commas
//   const formatNumber = (value) => {
//     if (value === undefined || value === null) return '0.00';
//     return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
//     if (!appliedFilters.head) return;

//     setLoading(true);
//     try {
//       const params = { ...appliedFilters };

//       Object.keys(params).forEach(key => {
//         if (!params[key] || params[key] === '') delete params[key];
//       });

//       const response = await apiClient.get('/net-allocation/data', { params });

//       if (response.data.success) {
//         setRecords(response.data.data.records || []);
//         setTotals(response.data.data.totals || {
//           total_allocation: 0,
//           total_fr66p: 0,
//           total_fr66m: 0,
//           total_supplementary: 0,
//           total_net_allocation: 0
//         });

//         const total = response.data.data.records?.length || 0;
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
//   const fetchFilterOptions = async (head = '', program = '', project = '') => {
//     try {
//       const params = {};
//       if (head) params.head = head;
//       if (program) params.program = program;
//       if (project) params.project = project;

//       const response = await apiClient.get('/net-allocation/filter-options', { params });

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

//   // Fetch programs when head changes
//   useEffect(() => {
//     if (filters.head) {
//       fetchFilterOptions(filters.head, filters.program, filters.project);
//     } else {
//       setFilterOptions(prev => ({ ...prev, programs: [], projects: [] }));
//     }
//   }, [filters.head]);

//   // Fetch projects when program changes
//   useEffect(() => {
//     if (filters.program && filters.head) {
//       fetchFilterOptions(filters.head, filters.program, filters.project);
//     } else if (filters.head) {
//       fetchFilterOptions(filters.head);
//     } else {
//       setFilterOptions(prev => ({ ...prev, projects: [] }));
//     }
//   }, [filters.program]);

//   // Initial load - fetch filter options
//   useEffect(() => {
//     fetchFilterOptions();
//   }, []);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => {
//       const newFilters = { ...prev, [name]: value };
//       if (name === 'head') {
//         newFilters.program = '';
//         newFilters.project = '';
//       }
//       if (name === 'program') {
//         newFilters.project = '';
//       }
//       return newFilters;
//     });
//   };

//   const applyFilters = () => {
//     if (!filters.head) {
//       alert('Please select a TR No (Head) to search');
//       return;
//     }
//     setAppliedFilters({ ...filters });
//     setTimeout(() => fetchRecords(), 100);
//     setShowFilterModal(false);
//   };

//   const clearFilters = () => {
//     setFilters({ head: '', program: '', project: '', month: '' });
//     setAppliedFilters({ head: '', program: '', project: '', month: '' });
//     setRecords([]);
//     setTotals({
//       total_allocation: 0,
//       total_fr66p: 0,
//       total_fr66m: 0,
//       total_supplementary: 0,
//       total_net_allocation: 0
//     });
//     setCurrentPage(1);
//     setTotalRecords(0);
//     setLastPage(1);
//   };

 

//   const refreshData = () => {
//     if (appliedFilters.head) {
//       fetchRecords();
//     }
//     fetchFilterOptions();
//   };

//   // Paginated records
//   const paginatedRecords = records.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   // Get month display text
//   const getMonthDisplay = (month) => {
//     if (!month) return '';
//     return monthNames[month] ? `${monthNames[month]} (Cumulative)` : `Month ${month} (Cumulative)`;
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
//             <h1 className="text-2xl font-bold text-gray-800">Net Allocation Report</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               View net allocation after supplementary adjustments (FR66P, FR66M)
//             </p>
//           </div>
//           {appliedFilters.head && (
//             <div className="bg-blue-50 rounded-lg px-3 py-2">
//               <p className="text-sm text-blue-700">
//                 <span className="font-medium">Current TR No:</span> {appliedFilters.head}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//         <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
//           <div className="flex items-center justify-between">
//             <p className="text-sm opacity-90">Total Allocation</p>
//             <DollarSign size={20} className="opacity-80" />
//           </div>
//           <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_allocation)}</p>
//         </div>

//         <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
//           <div className="flex items-center justify-between">
//             <p className="text-sm opacity-90">FR 66 P</p>
//             <TrendingUp size={20} className="opacity-80" />
//           </div>
//           <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_fr66p)}</p>
//         </div>

//         <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
//           <div className="flex items-center justify-between">
//             <p className="text-sm opacity-90">FR 66 M</p>
//             <TrendingDown size={20} className="opacity-80" />
//           </div>
//           <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_fr66m)}</p>
//         </div>

//         <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
//           <div className="flex items-center justify-between">
//             <p className="text-sm opacity-90">Supplementary</p>
//             <PieChart size={20} className="opacity-80" />
//           </div>
//           <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_supplementary)}</p>
//         </div>

//         <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
//           <div className="flex items-center justify-between">
//             <p className="text-sm opacity-90">Net Allocation</p>
//             <BarChart3 size={20} className="opacity-80" />
//           </div>
//           <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_net_allocation)}</p>
//         </div>
//       </div>

//       {/* Active Filters Display */}
//       {(appliedFilters.head || appliedFilters.program || appliedFilters.project || appliedFilters.month) && (
//         <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
//             {appliedFilters.head && (
//               <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
//                 TR No: {appliedFilters.head}
//               </span>
//             )}
//             {appliedFilters.program && (
//               <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
//                 Program: {appliedFilters.program}
//               </span>
//             )}
//             {appliedFilters.project && (
//               <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
//                 Project: {appliedFilters.project}
//               </span>
//             )}
//             {appliedFilters.month && (
//               <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
//                 <Calendar size={12} className="mr-1" />
//                 {getMonthDisplay(appliedFilters.month)}
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
//           onClick={refreshData} 
//           className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm bg-white shadow-sm"
//           disabled={!appliedFilters.head}
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
//                 <th className="px-4 py-3 text-left font-semibold text-gray-700">Object Code</th>
//                 <th className="px-4 py-3 text-left font-semibold text-gray-700">Sub Project</th>
//                 <th className="px-4 py-3 text-left font-semibold text-gray-700">Object Name</th>
//                 <th className="px-4 py-3 text-right font-semibold text-gray-700">Allocation (Rs)</th>
//                 <th className="px-4 py-3 text-right font-semibold text-gray-700">FR 66 P (Rs)</th>
//                 <th className="px-4 py-3 text-right font-semibold text-gray-700">FR 66 M (Rs)</th>
//                 <th className="px-4 py-3 text-right font-semibold text-gray-700">Supplementary (Rs)</th>
//                 <th className="px-4 py-3 text-right font-semibold text-gray-700">Net Allocation (Rs)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {!appliedFilters.head ? (
//                 <tr>
//                   <td colSpan="8" className="text-center py-12 text-gray-500">
//                     <div className="flex flex-col items-center gap-2">
//                       <Filter size={40} className="text-gray-300" />
//                       <p>Please click the Filter button and select a TR No to view data</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : paginatedRecords.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="text-center py-12 text-gray-500">
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
//                     <td className="px-4 py-3 font-medium text-gray-900">{record.object || '-'}</td>
//                     <td className="px-4 py-3 text-gray-600">{record.subproject || '-'}</td>
//                     <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={record.objname}>
//                       {record.objname || '-'}
//                     </td>
//                     <td className="px-4 py-3 text-right text-gray-900">{formatNumber(record.allocation)}</td>
//                     <td className="px-4 py-3 text-right text-green-600 font-medium">{formatNumber(record.fr66p)}</td>
//                     <td className="px-4 py-3 text-right text-red-600 font-medium">{formatNumber(record.fr66m)}</td>
//                     <td className="px-4 py-3 text-right text-yellow-600 font-medium">{formatNumber(record.supplementary)}</td>
//                     <td className="px-4 py-3 text-right font-bold text-purple-600">{formatNumber(record.net_allocation)}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//             {paginatedRecords.length > 0 && (
//               <tfoot className="bg-gray-50 border-t border-gray-200">
//                 <tr className="font-semibold">
//                   <td colSpan="3" className="px-4 py-3 text-right">Total:</td>
//                   <td className="px-4 py-3 text-right text-blue-600">{formatNumber(totals.total_allocation)}</td>
//                   <td className="px-4 py-3 text-right text-green-600">{formatNumber(totals.total_fr66p)}</td>
//                   <td className="px-4 py-3 text-right text-red-600">{formatNumber(totals.total_fr66m)}</td>
//                   <td className="px-4 py-3 text-right text-yellow-600">{formatNumber(totals.total_supplementary)}</td>
//                   <td className="px-4 py-3 text-right font-bold text-purple-600">{formatNumber(totals.total_net_allocation)}</td>
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
//               <h3 className="text-lg font-semibold text-gray-800">Filter Net Allocation</h3>
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
//                   TR No (Head) <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="head"
//                   value={filters.head}
//                   onChange={handleFilterChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select TR No</option>
//                   {filterOptions.heads.map(head => (
//                     <option key={head} value={head}>{head}</option>
//                   ))}
//                 </select>
//                 <p className="text-xs text-gray-500 mt-1">Required field - select to enable other filters</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Program
//                 </label>
//                 <select
//                   name="program"
//                   value={filters.program}
//                   onChange={handleFilterChange}
//                   disabled={!filters.head}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 >
//                   <option value="">All Programs</option>
//                   {filterOptions.programs.map(program => (
//                     <option key={program} value={program}>{program}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Project
//                 </label>
//                 <select
//                   name="project"
//                   value={filters.project}
//                   onChange={handleFilterChange}
//                   disabled={!filters.program}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 >
//                   <option value="">All Projects</option>
//                   {filterOptions.projects.map(project => (
//                     <option key={project} value={project}>{project}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Month (Cumulative)
//                 </label>
//                 <select
//                   name="month"
//                   value={filters.month}
//                   onChange={handleFilterChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Month</option>
//                   {filterOptions.months.map(month => (
//                     <option key={month} value={month}>
//                       {monthNames[month]} (Jan - {monthNames[month]})
//                     </option>
//                   ))}
//                 </select>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Shows cumulative values from January to selected month
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
//                 disabled={!filters.head}
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

// export default NetAllocationPanel;


// src/components/NetAllocationPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Grid,
  Table
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

const NetAllocationPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [viewType, setViewType] = useState('detailed'); // 'detailed' or 'object_wise'
  const [totals, setTotals] = useState({
    total_allocation: 0,
    total_fr66p: 0,
    total_fr66m: 0,
    total_supplementary: 0,
    total_net_allocation: 0
  });

  const [filters, setFilters] = useState({
    head: '',
    program: '',
    project: '',
    month: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    head: '',
    program: '',
    project: '',
    month: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    heads: [],
    programs: [],
    projects: [],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  });

  // Format number with commas
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0.00';
    return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Check if view should be object-wise (only month filter without head/program/project)
  const shouldUseObjectWiseView = (filtersObj) => {
    return filtersObj.month && !filtersObj.head && !filtersObj.program && !filtersObj.project;
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
    setLoading(true);
    try {
      const params = { ...appliedFilters };
      
      // Determine view type
      const isObjectWise = shouldUseObjectWiseView(appliedFilters);
      if (isObjectWise) {
        params.view_type = 'object_wise';
      }

      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '') delete params[key];
      });

      const response = await apiClient.get('/net-allocation/data', { params });

      if (response.data.success) {
        setRecords(response.data.data.records || []);
        setTotals(response.data.data.totals || {
          total_allocation: 0,
          total_fr66p: 0,
          total_fr66m: 0,
          total_supplementary: 0,
          total_net_allocation: 0
        });
        setViewType(response.data.data.view_type || 'detailed');

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
  const fetchFilterOptions = async (head = '', program = '', project = '') => {
    try {
      const params = {};
      if (head) params.head = head;
      if (program) params.program = program;
      if (project) params.project = project;

      const response = await apiClient.get('/net-allocation/filter-options', { params });

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

  // Fetch programs when head changes
  useEffect(() => {
    if (filters.head) {
      fetchFilterOptions(filters.head, filters.program, filters.project);
    } else {
      setFilterOptions(prev => ({ ...prev, programs: [], projects: [] }));
    }
  }, [filters.head]);

  // Fetch projects when program changes
  useEffect(() => {
    if (filters.program && filters.head) {
      fetchFilterOptions(filters.head, filters.program, filters.project);
    } else if (filters.head) {
      fetchFilterOptions(filters.head);
    } else {
      setFilterOptions(prev => ({ ...prev, projects: [] }));
    }
  }, [filters.program]);

  // Auto-fetch when filters change
  useEffect(() => {
    if (appliedFilters.head || appliedFilters.month) {
      fetchRecords();
    }
  }, [appliedFilters]);

  // Initial load - fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'head') {
        newFilters.program = '';
        newFilters.project = '';
      }
      if (name === 'program') {
        newFilters.project = '';
      }
      return newFilters;
    });
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({ head: '', program: '', project: '', month: '' });
    setAppliedFilters({ head: '', program: '', project: '', month: '' });
    setRecords([]);
    setTotals({
      total_allocation: 0,
      total_fr66p: 0,
      total_fr66m: 0,
      total_supplementary: 0,
      total_net_allocation: 0
    });
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
  };

  const handleExport = async () => {
    if (records.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);
    try {
      const params = { ...appliedFilters };
      const isObjectWise = shouldUseObjectWiseView(appliedFilters);
      if (isObjectWise) {
        params.view_type = 'object_wise';
      }
      
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await apiClient.get('/net-allocation/export', { params });

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
          a.download = `net-allocation-${new Date().toISOString().split('T')[0]}.csv`;
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
    if (appliedFilters.head || appliedFilters.month) {
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
    return monthNames[month] ? `${monthNames[month]} (Cumulative)` : `Month ${month} (Cumulative)`;
  };

  // Check if we're in object-wise view
  const isObjectWiseView = viewType === 'object_wise' || shouldUseObjectWiseView(appliedFilters);

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
            <h1 className="text-2xl font-bold text-gray-800">Net Allocation Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isObjectWiseView 
                ? 'Object-wise summary of net allocation after supplementary adjustments' 
                : 'Detailed view of net allocation after supplementary adjustments (FR66P, FR66M)'}
            </p>
          </div>
          {appliedFilters.head && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Current TR No:</span> {appliedFilters.head}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Type Indicator */}
      {isObjectWiseView && appliedFilters.month && !appliedFilters.head && (
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2">
            <Grid size={18} className="text-purple-600" />
            <span className="text-sm text-purple-700">
              <strong>Object-wise Summary View</strong> - Showing data grouped by Object only (excluding Sub Projects)
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Total Allocation</p>
            
          </div>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_allocation)}</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">FR 66 P</p>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_fr66p)}</p>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">FR 66 M</p>
            <TrendingDown size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_fr66m)}</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Supplementary</p>
            <PieChart size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_supplementary)}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-90">Net Allocation</p>
            <BarChart3 size={20} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(totals.total_net_allocation)}</p>
        </div>
      </div>

      {/* Active Filters Display */}
      {(appliedFilters.head || appliedFilters.program || appliedFilters.project || appliedFilters.month) && (
        <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
            {appliedFilters.head && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                TR No: {appliedFilters.head}
              </span>
            )}
            {appliedFilters.program && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                Program: {appliedFilters.program}
              </span>
            )}
            {appliedFilters.project && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                Project: {appliedFilters.project}
              </span>
            )}
            {appliedFilters.month && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                <Calendar size={12} className="mr-1" />
                {getMonthDisplay(appliedFilters.month)}
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
          onClick={handleExport} 
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
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Object Code</th>
                {!isObjectWiseView && (
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Sub Project</th>
                )}
                {/* <th className="px-4 py-3 text-left font-semibold text-gray-700">Object Name</th> */}
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Allocation (Rs)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">FR 66 P (Rs)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">FR 66 M (Rs)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Supplementary (Rs)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Net Allocation (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {!appliedFilters.head && !appliedFilters.month ? (
                <tr>
                  <td colSpan={isObjectWiseView ? 7 : 8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={40} className="text-gray-300" />
                      <p>Please click the Filter button and select a TR No or Month to view data</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={isObjectWiseView ? 7 : 8} className="text-center py-12 text-gray-500">
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
                    <td className="px-4 py-3 font-medium text-gray-900">{record.object}</td>
                    {!isObjectWiseView && (
                      <td className="px-4 py-3 text-gray-600">{record.subproject}</td>
                    )}
                    {/* <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={record.objname}>
                      {record.objname}
                    </td> */}
                    <td className="px-4 py-3 text-right text-gray-900">{formatNumber(record.allocation)}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{formatNumber(record.fr66p)}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">{formatNumber(record.fr66m)}</td>
                    <td className="px-4 py-3 text-right text-yellow-600 font-medium">{formatNumber(record.supplementary)}</td>
                    <td className="px-4 py-3 text-right font-bold text-purple-600">{formatNumber(record.net_allocation)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {paginatedRecords.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr className="font-semibold">
                  <td colSpan={isObjectWiseView ? 1 : 2} className="px-4 py-3 text-right">Total:</td>
                  <td className="px-4 py-3 text-right text-blue-600">{formatNumber(totals.total_allocation)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatNumber(totals.total_fr66p)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatNumber(totals.total_fr66m)}</td>
                  <td className="px-4 py-3 text-right text-yellow-600">{formatNumber(totals.total_supplementary)}</td>
                  <td className="px-4 py-3 text-right font-bold text-purple-600">{formatNumber(totals.total_net_allocation)}</td>
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
              <h3 className="text-lg font-semibold text-gray-800">Filter Net Allocation</h3>
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
                  TR No (Head)
                </label>
                <select
                  name="head"
                  value={filters.head}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select TR No</option>
                  {filterOptions.heads.map(head => (
                    <option key={head} value={head}>{head}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Optional - select to filter by specific TR No</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>
                <select
                  name="program"
                  value={filters.program}
                  onChange={handleFilterChange}
                  disabled={!filters.head}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Programs</option>
                  {filterOptions.programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  name="project"
                  value={filters.project}
                  onChange={handleFilterChange}
                  disabled={!filters.program}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Projects</option>
                  {filterOptions.projects.map(project => (
                    <option key={project} value={project}>{project}</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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

export default NetAllocationPanel;