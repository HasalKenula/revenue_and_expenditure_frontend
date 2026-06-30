// // src/components/MainJournalPanel.jsx
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
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   }
// });

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

// const MainJournalPanel = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [records, setRecords] = useState([]);
//   const [accountTypes, setAccountTypes] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(20);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [lastPage, setLastPage] = useState(1);
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [grandTotals, setGrandTotals] = useState({
//     total_debits: 0,
//     total_credits: 0,
//     balance: 0,
//     balance_side: 'Credit'
//   });
//   const [selectedYear, setSelectedYear] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [selectedTrno, setSelectedTrno] = useState('');

//   const [filters, setFilters] = useState({
//     year: '',
//     month: '',
//     trno: ''
//   });

//   const [appliedFilters, setAppliedFilters] = useState({
//     year: '',
//     month: '',
//     trno: ''
//   });

//   const [filterOptions, setFilterOptions] = useState({
//     years: [],
//     months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
//     trnos: []
//   });

//   const formatNumber = (value) => {
//     if (value === undefined || value === null) return '0.00';
//     return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//   };

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const fetchRecords = async () => {
//     if (!appliedFilters.year || !appliedFilters.month) {
//       setRecords([]);
//       return;
//     }

//     setLoading(true);
//     try {
//       const params = {
//         year: appliedFilters.year,
//         month: appliedFilters.month
//       };
//       if (appliedFilters.trno) {
//         params.trno = appliedFilters.trno;
//       }

//       const response = await apiClient.get('/main-journal/data', { params });

//       if (response.data.success) {
//         setRecords(response.data.data.records || []);
//         setAccountTypes(response.data.data.account_types || {});
//         setGrandTotals(response.data.data.grand_totals || {
//           total_debits: 0,
//           total_credits: 0,
//           balance: 0,
//           balance_side: 'Credit'
//         });
//         setSelectedYear(response.data.data.filters?.year || '');
//         setSelectedMonth(response.data.data.filters?.month || '');
//         setSelectedTrno(response.data.data.filters?.trno || '');

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

//   const fetchFilterOptions = async (year = '', month = '') => {
//     try {
//       const params = {};
//       if (year) params.year = year;
//       if (month) params.month = month;

//       const response = await apiClient.get('/main-journal/filter-options', { params });

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

//   useEffect(() => {
//     if (appliedFilters.year && appliedFilters.month) {
//       fetchRecords();
//     }
//   }, [appliedFilters]);

//   useEffect(() => {
//     if (filters.year && filters.month) {
//       fetchFilterOptions(filters.year, filters.month);
//     }
//   }, [filters.year, filters.month]);

//   useEffect(() => {
//     fetchFilterOptions();
//   }, []);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const applyFilters = () => {
//     if (!filters.year) {
//       alert('Please select a Year');
//       return;
//     }
//     if (!filters.month) {
//       alert('Please select a Month');
//       return;
//     }
//     setAppliedFilters({ ...filters });
//     setShowFilterModal(false);
//   };

//   const clearFilters = () => {
//     setFilters({ year: '', month: '', trno: '' });
//     setAppliedFilters({ year: '', month: '', trno: '' });
//     setRecords([]);
//     setGrandTotals({ total_debits: 0, total_credits: 0, balance: 0, balance_side: 'Credit' });
//     setCurrentPage(1);
//     setTotalRecords(0);
//     setLastPage(1);
//   };

//   const handleExportPDF = () => {
//     if (records.length === 0) {
//       alert('No data to export');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       const doc = new jsPDF({
//         orientation: 'portrait',
//         unit: 'mm',
//         format: 'a4'
//       });

//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       const currentDate = new Date().toLocaleDateString();

//       // Header - PROVINCIAL TREASURY - SOUTHERN PROVINCE
//       doc.setFontSize(14);
//       doc.setFont('helvetica', 'bold');
//       doc.text('PROVINCIAL TREASURY - SOUTHERN PROVINCE', pageWidth / 2, 20, { align: 'center' });
      
//       // Title
//       doc.setFontSize(16);
//       doc.setFont('helvetica', 'bold');
//       doc.text('MAIN JOURNAL', pageWidth / 2, 30, { align: 'center' });
      
//       // Month and Head
//       doc.setFontSize(11);
//       doc.setFont('helvetica', 'normal');
//       const monthText = monthNames[appliedFilters.month] || appliedFilters.month;
//       let filterText = `Month : ${monthText}`;
//       if (appliedFilters.trno) {
//         filterText += `  |  Head : ${appliedFilters.trno}`;
//       }
//       doc.text(filterText, 20, 40);
      
//       // Description
//       doc.setFontSize(10);
//       doc.text('Your Summary of accounts for this month has been posted in Treasury books as follows.', 20, 50);

//       // Get account keys
//       const accountKeys = Object.keys(accountTypes);

//       // Prepare table data - Name, Total Debits, Total Credits
//       const tableHeaders = ['Name', 'Total Debits', 'Total Credits'];
      
//       const tableBody = [];
      
//       // Add each account
//       let grandTotalDebitSum = 0;
//       let grandTotalCreditSum = 0;
      
//       // For first record (if multiple TRNOs, show first one)
//       const record = records[0] || {};
//       const accounts = record.accounts || {};
      
//       accountKeys.forEach((key) => {
//         const account = accounts[key];
//         if (account) {
//           const debit = account.debit || 0;
//           const credit = account.credit || 0;
//           tableBody.push([
//             account.label || key,
//             formatNumber(debit),
//             formatNumber(credit)
//           ]);
//           grandTotalDebitSum += debit;
//           grandTotalCreditSum += credit;
//         }
//       });

//       // Add total row
//       tableBody.push([
//         '',
//         formatNumber(grandTotalDebitSum),
//         formatNumber(grandTotalCreditSum)
//       ]);

//       // Generate table
//       autoTable(doc, {
//         head: [tableHeaders],
//         body: tableBody,
//         startY: 60,
//         theme: 'striped',
//         headStyles: {
//           fillColor: [41, 128, 185],
//           textColor: [255, 255, 255],
//           fontSize: 10,
//           fontStyle: 'bold',
//           halign: 'center',
//           cellPadding: 4
//         },
//         bodyStyles: {
//           fontSize: 10,
//           cellPadding: 4
//         },
//         columnStyles: {
//           0: { cellWidth: 100 },
//           1: { cellWidth: 60, halign: 'right' },
//           2: { cellWidth: 60, halign: 'right' }
//         },
//         alternateRowStyles: { fillColor: [245, 245, 245] },
//         margin: { top: 60, left: 20, right: 20, bottom: 30 },
//         didDrawPage: function(data) {
//           // Add note after table
//           const finalY = data.cursor.y || 200;
          
//           // Grand Total
//           doc.setFontSize(11);
//           doc.setFont('helvetica', 'bold');
//           const grandTotal = grandTotals.total_debits || 0;
//           doc.text(`Grand Total: ${formatNumber(grandTotal)}`, pageWidth - 80, finalY + 15);
          
//           // Confirmation text
//           doc.setFontSize(9);
//           doc.setFont('helvetica', 'normal');
//           doc.text(
//             'Please confirm the correctness of above information in accordance with the departmental books of account',
//             20,
//             finalY + 30
//           );
//           doc.text(
//             'within two weeks time from the date hereof. If no confirmation is received within the time limit,',
//             20,
//             finalY + 37
//           );
//           doc.text(
//             'treasury treat correct & confirmed.',
//             20,
//             finalY + 44
//           );
          
//           // Footer
//           doc.setFontSize(10);
//           doc.setFont('helvetica', 'bold');
//           const footerY = pageHeight - 30;
//           doc.text('Director (Accounts & Payments)', 20, footerY);
//           doc.text('Southern Province.', 20, footerY + 8);
//         }
//       });

//       const fileName = `main_journal_${appliedFilters.year}_${monthText}${appliedFilters.trno ? '_' + appliedFilters.trno : ''}.pdf`;
//       doc.save(fileName);
//       alert('PDF exported successfully!');
      
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       alert('Failed to generate PDF: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

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
//       if (appliedFilters.trno) {
//         params.trno = appliedFilters.trno;
//       }

//       const response = await apiClient.get('/main-journal/export', { params });

//       if (response.data.success) {
//         const csvData = response.data.data;
//         if (csvData.length > 0) {
//           const headers = Object.keys(csvData[0]);
//           const csvRows = [
//             headers.join(','),
//             ...csvData.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
//           ];
//           const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
//           const url = URL.createObjectURL(csvBlob);
//           const a = document.createElement('a');
//           a.href = url;
//           a.download = `main_journal_${appliedFilters.year}_${monthNames[appliedFilters.month]}${appliedFilters.trno ? '_' + appliedFilters.trno : ''}.csv`;
//           a.click();
//           URL.revokeObjectURL(url);
//           alert('Export completed successfully!');
//         }
//       }
//     } catch (error) {
//       console.error('Error exporting data:', error);
//       alert('Error exporting data');
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

//   const paginatedRecords = records.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   // Get account keys
//   const accountKeys = Object.keys(accountTypes);

//   return (
//     <div className="space-y-6">
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
//             <h1 className="text-2xl font-bold text-gray-800">Main Journal</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               Summary of accounts for the selected month
//             </p>
//           </div>
//           {appliedFilters.year && appliedFilters.month && (
//             <div className="bg-blue-50 rounded-lg px-3 py-2">
//               <p className="text-sm text-blue-700">
//                 <span className="font-medium">Month:</span> {monthNames[appliedFilters.month]} | 
//                 <span className="font-medium ml-2">Head:</span> {appliedFilters.trno || 'All'}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
//           <p className="text-sm opacity-90">Total Debits</p>
//           <p className="text-2xl font-bold mt-2">Rs{formatNumber(grandTotals.total_debits)}</p>
//         </div>

//         <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
//           <p className="text-sm opacity-90">Total Credits</p>
//           <p className="text-2xl font-bold mt-2">Rs{formatNumber(grandTotals.total_credits)}</p>
//         </div>

//         <div className={`bg-gradient-to-r rounded-xl p-5 text-white shadow-lg ${
//           grandTotals.balance_side === 'Debit' ? 'from-red-500 to-red-600' : 'from-purple-500 to-purple-600'
//         }`}>
//           <p className="text-sm opacity-90">Balance ({grandTotals.balance_side})</p>
//           <p className="text-2xl font-bold mt-2">Rs{formatNumber(grandTotals.balance)}</p>
//         </div>
//       </div>

//       {/* Filters Display */}
//       {(appliedFilters.year || appliedFilters.month || appliedFilters.trno) && (
//         <div className="bg-blue-50 rounded-lg p-3 flex flex-wrap items-center justify-between">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
//             {appliedFilters.year && (
//               <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
//                 <Calendar size={12} className="mr-1" />
//                 Year: {appliedFilters.year}
//               </span>
//             )}
//             {appliedFilters.month && (
//               <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
//                 Month: {monthNames[appliedFilters.month]}
//               </span>
//             )}
//             {appliedFilters.trno && (
//               <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
//                 Head: {appliedFilters.trno}
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
//                 <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
//                 <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Debits</th>
//                 <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Credits</th>
//               </tr>
//             </thead>
//             <tbody>
//               {!appliedFilters.year || !appliedFilters.month ? (
//                 <tr>
//                   <td colSpan="3" className="text-center py-12 text-gray-500">
//                     <div className="flex flex-col items-center gap-2">
//                       <Filter size={40} className="text-gray-300" />
//                       <p>Please select Year and Month to view data</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : paginatedRecords.length === 0 ? (
//                 <tr>
//                   <td colSpan="3" className="text-center py-12 text-gray-500">
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
//                 (() => {
//                   // Use the first record to display accounts
//                   const record = paginatedRecords[0] || {};
//                   const accounts = record.accounts || {};
//                   let totalDebits = 0;
//                   let totalCredits = 0;
                  
//                   const accountRows = accountKeys.map((key) => {
//                     const account = accounts[key];
//                     if (account) {
//                       totalDebits += account.debit || 0;
//                       totalCredits += account.credit || 0;
//                       return (
//                         <tr key={key} className="border-b border-gray-100 hover:bg-gray-50 transition">
//                           <td className="px-4 py-3 text-gray-700">{account.label || key}</td>
//                           <td className="px-4 py-3 text-right font-medium text-green-600">
//                             Rs{formatNumber(account.debit || 0)}
//                           </td>
//                           <td className="px-4 py-3 text-right font-medium text-red-600">
//                             Rs{formatNumber(account.credit || 0)}
//                           </td>
//                         </tr>
//                       );
//                     }
//                     return null;
//                   });

//                   return (
//                     <>
//                       {accountRows}
//                       {/* Total row */}
//                       <tr className="border-b border-gray-200 bg-gray-50 font-semibold">
//                         <td className="px-4 py-3 text-right"></td>
//                         <td className="px-4 py-3 text-right text-green-700">
//                           Rs{formatNumber(totalDebits)}
//                         </td>
//                         <td className="px-4 py-3 text-right text-red-700">
//                           Rs{formatNumber(totalCredits)}
//                         </td>
//                       </tr>
//                       {/* Grand Total row */}
//                       <tr className="bg-blue-50 font-bold">
//                         <td className="px-4 py-3 text-gray-800">Grand Total</td>
//                         <td className="px-4 py-3 text-right text-blue-700">
//                           Rs{formatNumber(grandTotals.total_debits)}
//                         </td>
//                         <td className="px-4 py-3 text-right text-blue-700">
//                           Rs{formatNumber(grandTotals.total_credits)}
//                         </td>
//                       </tr>
//                     </>
//                   );
//                 })()
//               )}
//             </tbody>
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
//               <h3 className="text-lg font-semibold text-gray-800">Filter Main Journal</h3>
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

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Head (TR No)
//                 </label>
//                 <select
//                   name="trno"
//                   value={filters.trno}
//                   onChange={handleFilterChange}
//                   disabled={!filters.year || !filters.month}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 >
//                   <option value="">All Heads</option>
//                   {filterOptions.trnos.map(trno => (
//                     <option key={trno} value={trno}>{trno}</option>
//                   ))}
//                 </select>
//                 <p className="text-xs text-gray-500 mt-1">Optional - filter by specific Head</p>
//               </div>

//               <div className="bg-blue-50 rounded-lg p-3">
//                 <p className="text-xs text-blue-700">
//                   <strong>Note:</strong> This report shows the summary of accounts for the selected month.
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

// export default MainJournalPanel;






// src/components/MainJournalPanel.jsx
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

const MainJournalPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [accountTypes, setAccountTypes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [grandTotals, setGrandTotals] = useState({
    total_debits: 0,
    total_credits: 0,
    balance_debit: 0,
    balance_credit: 0,
    total_debits_with_balance: 0,
    total_credits_with_balance: 0
  });
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedTrno, setSelectedTrno] = useState('');

  const [filters, setFilters] = useState({
    year: '',
    month: '',
    trno: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    year: '',
    month: '',
    trno: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    years: [],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    trnos: []
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
      setRecords([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        month: appliedFilters.month
      };
      if (appliedFilters.trno) {
        params.trno = appliedFilters.trno;
      }

      const response = await apiClient.get('/main-journal/data', { params });

      if (response.data.success) {
        setRecords(response.data.data.records || []);
        setAccountTypes(response.data.data.account_types || {});
        setGrandTotals(response.data.data.grand_totals || {
          total_debits: 0,
          total_credits: 0,
          balance_debit: 0,
          balance_credit: 0,
          total_debits_with_balance: 0,
          total_credits_with_balance: 0
        });
        setSelectedYear(response.data.data.filters?.year || '');
        setSelectedMonth(response.data.data.filters?.month || '');
        setSelectedTrno(response.data.data.filters?.trno || '');

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

  const fetchFilterOptions = async (year = '', month = '') => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;

      const response = await apiClient.get('/main-journal/filter-options', { params });

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
    if (filters.year && filters.month) {
      fetchFilterOptions(filters.year, filters.month);
    }
  }, [filters.year, filters.month]);

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
    setFilters({ year: '', month: '', trno: '' });
    setAppliedFilters({ year: '', month: '', trno: '' });
    setRecords([]);
    setGrandTotals({
      total_debits: 0,
      total_credits: 0,
      balance_debit: 0,
      balance_credit: 0,
      total_debits_with_balance: 0,
      total_credits_with_balance: 0
    });
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
      const currentDate = new Date().toLocaleDateString();

      // Header - PROVINCIAL TREASURY - SOUTHERN PROVINCE
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROVINCIAL TREASURY - SOUTHERN PROVINCE', pageWidth / 2, 20, { align: 'center' });
      
      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MAIN JOURNAL', pageWidth / 2, 30, { align: 'center' });
      
      // Month and Head
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const monthText = monthNames[appliedFilters.month] || appliedFilters.month;
      let filterText = `Month : ${monthText}`;
      if (appliedFilters.trno) {
        filterText += `  |  Head : ${appliedFilters.trno}`;
      }
      doc.text(filterText, 20, 40);
      
      // Description
      doc.setFontSize(10);
      doc.text('Your Summary of accounts for this month has been posted in Treasury books as follows.', 20, 50);

      // Get account keys
      const accountKeys = Object.keys(accountTypes);

      // Prepare table data
      const tableHeaders = ['Name', 'Total Debits', 'Total Credits'];
      
      const tableBody = [];
      
      const record = records[0] || {};
      const accounts = record.accounts || {};
      
      let totalDebits = 0;
      let totalCredits = 0;
      
      accountKeys.forEach((key) => {
        const account = accounts[key];
        if (account) {
          const debit = account.debit || 0;
          const credit = account.credit || 0;
          tableBody.push([
            account.label || key,
            formatNumber(debit),
            formatNumber(credit)
          ]);
          totalDebits += debit;
          totalCredits += credit;
        }
      });

      // Add Balance row
      const diff = totalDebits - totalCredits;
      const balanceDebit = diff < 0 ? abs(diff) : 0;
      const balanceCredit = diff > 0 ? diff : 0;
      
      tableBody.push([
        'Balance',
        balanceDebit > 0 ? formatNumber(balanceDebit) : '0.00',
        balanceCredit > 0 ? formatNumber(balanceCredit) : '0.00'
      ]);

      // Add Total row (sum of all accounts + balance)
      const totalDebitsWithBalance = totalDebits + balanceDebit;
      const totalCreditsWithBalance = totalCredits + balanceCredit;

      tableBody.push([
        'Total',
        formatNumber(totalDebitsWithBalance),
        formatNumber(totalCreditsWithBalance)
      ]);

      // Generate table
      autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: 60,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 4
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 60, halign: 'right' },
          2: { cellWidth: 60, halign: 'right' }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 60, left: 20, right: 20, bottom: 30 },
        didDrawPage: function(data) {
          const finalY = data.cursor.y || 200;
          
          // Grand Total
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`Grand Total: ${formatNumber(totalDebitsWithBalance)}`, pageWidth - 60, finalY + 15);
          
          // Confirmation text
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(
            'Please confirm the correctness of above information in accordance with the departmental books of account',
            20,
            finalY + 30
          );
          doc.text(
            'within two weeks time from the date hereof. If no confirmation is received within the time limit,',
            20,
            finalY + 37
          );
          doc.text(
            'treasury treat correct & confirmed.',
            20,
            finalY + 44
          );
          
          // Footer
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const footerY = pageHeight - 30;
          doc.text('Director (Accounts & Payments)', 20, footerY);
          doc.text('Southern Province.', 20, footerY + 8);
        }
      });

      const fileName = `main_journal_${appliedFilters.year}_${monthText}${appliedFilters.trno ? '_' + appliedFilters.trno : ''}.pdf`;
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
        month: appliedFilters.month
      };
      if (appliedFilters.trno) {
        params.trno = appliedFilters.trno;
      }

      const response = await apiClient.get('/main-journal/export', { params });

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
          a.download = `main_journal_${appliedFilters.year}_${monthNames[appliedFilters.month]}${appliedFilters.trno ? '_' + appliedFilters.trno : ''}.csv`;
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

  const paginatedRecords = records.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const accountKeys = Object.keys(accountTypes);

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
            <h1 className="text-2xl font-bold text-gray-800">Main Journal</h1>
            <p className="text-sm text-gray-500 mt-1">
              Summary of accounts for the selected month
            </p>
          </div>
          {appliedFilters.year && appliedFilters.month && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Month:</span> {monthNames[appliedFilters.month]} | 
                <span className="font-medium ml-2">Head:</span> {appliedFilters.trno || 'All'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Total Debits</p>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(grandTotals.total_debits)}</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Total Credits</p>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(grandTotals.total_credits)}</p>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Balance (Debit)</p>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(grandTotals.balance_debit)}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Balance (Credit)</p>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(grandTotals.balance_credit)}</p>
        </div>
      </div> */}

      {/* Grand Total with Balance */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Grand Total Debits (with Balance)</p>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(grandTotals.total_debits_with_balance)}</p>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Grand Total Credits (with Balance)</p>
          <p className="text-2xl font-bold mt-2">Rs{formatNumber(grandTotals.total_credits_with_balance)}</p>
        </div>
      </div> */}

      {/* Filters Display */}
      {(appliedFilters.year || appliedFilters.month || appliedFilters.trno) && (
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
            {appliedFilters.trno && (
              <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
                Head: {appliedFilters.trno}
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
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Debits</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Credits</th>
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
                (() => {
                  const record = paginatedRecords[0] || {};
                  const accounts = record.accounts || {};
                  let totalDebits = 0;
                  let totalCredits = 0;
                  
                  const accountRows = accountKeys.map((key) => {
                    const account = accounts[key];
                    if (account) {
                      totalDebits += account.debit || 0;
                      totalCredits += account.credit || 0;
                      return (
                        <tr key={key} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-gray-700">{account.label || key}</td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">
                            Rs{formatNumber(account.debit || 0)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-red-600">
                            Rs{formatNumber(account.credit || 0)}
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  });

                  // Calculate balance
                  const diff = totalDebits - totalCredits;
                  const balanceDebit = diff < 0 ? Math.abs(diff) : 0;
                  const balanceCredit = diff > 0 ? diff : 0;

                  // Calculate totals with balance
                  const totalDebitsWithBalance = totalDebits + balanceDebit;
                  const totalCreditsWithBalance = totalCredits + balanceCredit;

                  return (
                    <>
                      {accountRows}
                      
                      {/* Balance row - shows only if balance > 0 */}
                      {balanceDebit > 0 && (
                        <tr className="border-b border-gray-200 bg-yellow-50">
                          <td className="px-4 py-3 text-gray-700 font-medium">Balance (Debit)</td>
                          <td className="px-4 py-3 text-right font-medium text-green-700">
                            Rs{formatNumber(balanceDebit)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-red-700">
                            Rs0.00
                          </td>
                        </tr>
                      )}
                      {balanceCredit > 0 && (
                        <tr className="border-b border-gray-200 bg-yellow-50">
                          <td className="px-4 py-3 text-gray-700 font-medium">Balance (Credit)</td>
                          <td className="px-4 py-3 text-right font-medium text-green-700">
                            Rs0.00
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-red-700">
                            Rs{formatNumber(balanceCredit)}
                          </td>
                        </tr>
                      )}
                      
                      {/* Total row with balance */}
                      <tr className="border-b border-gray-200 bg-gray-100 font-semibold">
                        <td className="px-4 py-3 text-gray-800">Total</td>
                        <td className="px-4 py-3 text-right text-green-700">
                          Rs{formatNumber(totalDebitsWithBalance)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-700">
                          Rs{formatNumber(totalCreditsWithBalance)}
                        </td>
                      </tr>
                    </>
                  );
                })()
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
              <h3 className="text-lg font-semibold text-gray-800">Filter Main Journal</h3>
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
                  Head (TR No)
                </label>
                <select
                  name="trno"
                  value={filters.trno}
                  onChange={handleFilterChange}
                  disabled={!filters.year || !filters.month}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Heads</option>
                  {filterOptions.trnos.map(trno => (
                    <option key={trno} value={trno}>{trno}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Optional - filter by specific Head</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Balance = Total Debits - Total Credits
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  If balance &gt; 0: Shown in Credit column | If balance &lt; 0: Shown in Debit column
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

export default MainJournalPanel;