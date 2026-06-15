// import React, { useState, useEffect } from 'react';
// import {
//     Plus,
//     Trash2,
//     RefreshCw,
//     FileText,
//     FileSpreadsheet,
//     Upload,
//     X,
//     CheckCircle,
//     Clock,
//     AlertCircle
// } from 'lucide-react';
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';

// const BudgetPanel = ({ onSelectDepartment }) => {
//     const [budgetData, setBudgetData] = useState([]);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [entriesPerPage, setEntriesPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [showAddModal, setShowAddModal] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [dragActive, setDragActive] = useState(false);
//     const [uploadedFile, setUploadedFile] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [uploading, setUploading] = useState(false);
//     const [totalBudget, setTotalBudget] = useState(0);
//     const [totalRecords, setTotalRecords] = useState(0);
//     const [lastPage, setLastPage] = useState(1);
//     const [editingRecord, setEditingRecord] = useState(null);
//     const [allFilteredData, setAllFilteredData] = useState([]);
//     const [filters, setFilters] = useState({
//         head: '',
//         program: '',
//         project: '',
//         objname: '',
//         object: '', // Added object filter
//         min_amount: '',
//         max_amount: ''
//     });

//     const [newRecord, setNewRecord] = useState({
//         head: '',
//         program: '',
//         project: '',
//         subproj: '',
//         object: '',
//         obj_detail: '',
//         funding: '',
//         objname: '',
//         amount: ''
//     });

//     // Helper function to get auth headers with JWT token
//     const getAuthHeaders = () => {
//         const token = localStorage.getItem('token');
//         return {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${token}`
//         };
//     };

//     // Helper function to get file upload headers with JWT token
//     const getFileUploadHeaders = () => {
//         const token = localStorage.getItem('token');
//         return {
//             'Content-Type': 'multipart/form-data',
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${token}`
//         };
//     };

//     // Fetch budget records from API
//     const fetchBudgetRecords = async () => {
//         setLoading(true);
//         try {
//             const params = {
//                 page: currentPage,
//                 per_page: entriesPerPage,
//                 ...filters
//             };
//             // Remove empty filters
//             Object.keys(params).forEach(key => {
//                 if (!params[key]) delete params[key];
//             });

//             const response = await axios.get(`${API_BASE_URL}/budget/records`, {
//                 params,
//                 headers: getAuthHeaders()
//             });

//             if (response.data.success) {
//                 const transformedData = response.data.data.map(record => ({
//                     id: record.id,
//                     departmentCode: record.head ? `DEPT-${record.head}` : record.objname || 'N/A',
//                     departmentName: record.objname || 'Unnamed',
//                     category: record.program ? `Program ${record.program}` : 'General',
//                     budget: parseFloat(record.amount) || 0,
//                     status: record.amount > 1000000 ? 'APPROVED' : 'PENDING',
//                     original: record
//                 }));

//                 setBudgetData(transformedData);
//                 setTotalBudget(response.data.total_budget || 0);
//                 setTotalRecords(response.data.pagination?.total || 0);
//                 setLastPage(response.data.pagination?.last_page || 1);
//             }
//         } catch (error) {
//             console.error('Error fetching budget records:', error);
//             if (error.response?.status === 401) {
//                 alert('Session expired. Please login again.');
//                 window.location.href = '/login';
//             } else {
//                 alert('Failed to fetch budget records. Please check your API connection.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch ALL filtered data for PDF export (without pagination)
//     const fetchAllFilteredData = async () => {
//         try {
//             const params = {
//                 per_page: 999999,
//                 ...filters
//             };
//             Object.keys(params).forEach(key => {
//                 if (!params[key]) delete params[key];
//             });

//             const response = await axios.get(`${API_BASE_URL}/budget/records`, {
//                 params,
//                 headers: getAuthHeaders()
//             });

//             if (response.data.success) {
//                 const transformedData = response.data.data.map(record => ({
//                     id: record.id,
//                     head: record.head ?? 0,
//                     program: record.program ?? 0,
//                     project: record.project ?? 0,
//                     subproj: record.subproj ?? 0,
//                     object: record.object ?? 0,
//                     objname: record.objname || 'Total Amount',
//                     amount: parseFloat(record.amount) || 0,
//                 }));
//                 setAllFilteredData(transformedData);
//                 return transformedData;
//             }
//         } catch (error) {
//             console.error('Error fetching all filtered data:', error);
//             return [];
//         }
//     };

//     // Fetch budget summary
//     const fetchSummary = async () => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/budget/summary`, {
//                 headers: getAuthHeaders()
//             });
//             if (response.data.success) {
//                 setTotalBudget(response.data.data.total_budget || 0);
//             }
//         } catch (error) {
//             console.error('Error fetching summary:', error);
//             if (error.response?.status === 401) {
//                 alert('Session expired. Please login again.');
//                 window.location.href = '/login';
//             }
//         }
//     };

//     // Load data on component mount and when dependencies change
//     useEffect(() => {
//         fetchBudgetRecords();
//         fetchSummary();
//     }, [currentPage, entriesPerPage, filters]);

//     // Handle filter changes
//     const handleFilterChange = (e) => {
//         const { name, value } = e.target;
//         setFilters(prev => ({ ...prev, [name]: value }));
//         setCurrentPage(1);
//     };

//     // Clear all filters
//     const clearFilters = () => {
//         setFilters({
//             head: '',
//             program: '',
//             project: '',
//             objname: '',
//             object: '',
//             min_amount: '',
//             max_amount: ''
//         });
//         setCurrentPage(1);
//     };

//     // Create new budget record
//     const handleAddRecord = async () => {
//         if (!newRecord.objname || !newRecord.amount) {
//             alert('Please fill all required fields (Name and Amount)');
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await axios.post(
//                 `${API_BASE_URL}/budget/records`,
//                 {
//                     head: newRecord.head || null,
//                     program: newRecord.program || null,
//                     project: newRecord.project || null,
//                     subproj: newRecord.subproj || null,
//                     object: newRecord.object || null,
//                     obj_detail: newRecord.obj_detail || null,
//                     funding: newRecord.funding || null,
//                     objname: newRecord.objname,
//                     amount: parseFloat(newRecord.amount)
//                 },
//                 { headers: getAuthHeaders() }
//             );

//             if (response.data.success) {
//                 alert('Record added successfully!');
//                 setNewRecord({
//                     head: '',
//                     program: '',
//                     project: '',
//                     subproj: '',
//                     object: '',
//                     obj_detail: '',
//                     funding: '',
//                     objname: '',
//                     amount: ''
//                 });
//                 setShowAddModal(false);
//                 fetchBudgetRecords();
//                 fetchSummary();
//             }
//         } catch (error) {
//             console.error('Error adding record:', error);
//             if (error.response?.status === 401) {
//                 alert('Session expired. Please login again.');
//                 window.location.href = '/login';
//             } else {
//                 alert(error.response?.data?.message || 'Failed to add record');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Update existing record
//     const handleUpdateRecord = async () => {
//         if (!editingRecord) return;

//         setLoading(true);
//         try {
//             const response = await axios.put(
//                 `${API_BASE_URL}/budget/records/${editingRecord.id}`,
//                 {
//                     head: editingRecord.head,
//                     program: editingRecord.program,
//                     project: editingRecord.project,
//                     subproj: editingRecord.subproj,
//                     object: editingRecord.object,
//                     obj_detail: editingRecord.obj_detail,
//                     funding: editingRecord.funding,
//                     objname: editingRecord.objname,
//                     amount: parseFloat(editingRecord.amount)
//                 },
//                 { headers: getAuthHeaders() }
//             );

//             if (response.data.success) {
//                 alert('Record updated successfully!');
//                 setShowEditModal(false);
//                 setEditingRecord(null);
//                 fetchBudgetRecords();
//                 fetchSummary();
//             }
//         } catch (error) {
//             console.error('Error updating record:', error);
//             if (error.response?.status === 401) {
//                 alert('Session expired. Please login again.');
//                 window.location.href = '/login';
//             } else {
//                 alert(error.response?.data?.message || 'Failed to update record');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Delete selected records
//     const handleDelete = async () => {
//         if (selectedRows.length === 0) return;

//         if (!confirm(`Are you sure you want to delete ${selectedRows.length} record(s)?`)) return;

//         setLoading(true);
//         try {
//             const response = await axios.delete(
//                 `${API_BASE_URL}/budget/records`,
//                 {
//                     data: { ids: selectedRows },
//                     headers: getAuthHeaders()
//                 }
//             );

//             if (response.data.success) {
//                 alert(response.data.message);
//                 setSelectedRows([]);
//                 fetchBudgetRecords();
//                 fetchSummary();
//             }
//         } catch (error) {
//             console.error('Error deleting records:', error);
//             if (error.response?.status === 401) {
//                 alert('Session expired. Please login again.');
//                 window.location.href = '/login';
//             } else {
//                 alert(error.response?.data?.message || 'Failed to delete records');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle file upload (import)
//     const handleFileUpload = async (file) => {
//         if (!file) {
//             alert('Please select a file first');
//             return;
//         }

//         const validTypes = ['.xlsx', '.xls', '.csv'];
//         const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
//         if (!validTypes.includes(fileExtension)) {
//             alert('Please upload .xlsx, .xls, or .csv files only');
//             return;
//         }

//         if (file.size > 50 * 1024 * 1024) {
//             alert('File size must be less than 50MB');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('file', file);

//         setUploading(true);
//         try {
//             const response = await axios.post(
//                 `${API_BASE_URL}/budget/import`,
//                 formData,
//                 { headers: getFileUploadHeaders() }
//             );

//             if (response.data.success) {
//                 alert(`Import successful! Imported: ${response.data.imported_count || '?'} records`);
//                 setUploadedFile(null);
//                 const fileInput = document.getElementById('fileInput');
//                 if (fileInput) fileInput.value = '';
//                 fetchBudgetRecords();
//                 fetchSummary();
//             } else {
//                 throw new Error(response.data.message || 'Import failed');
//             }
//         } catch (error) {
//             console.error('Error uploading file:', error);
//             if (error.response?.status === 401) {
//                 alert('Session expired. Please login again.');
//                 window.location.href = '/login';
//             } else {
//                 alert(error.response?.data?.message || 'Failed to import file. Please check the file format.');
//             }
//         } finally {
//             setUploading(false);
//         }
//     };

//     // Handle file selection from browse button
//     const handleFileSelect = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setUploadedFile(file);
//             handleFileUpload(file);
//         }
//     };

//     // Export to Excel (download as CSV)
//     const handleExportExcel = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(`${API_BASE_URL}/budget/export`, {
//                 headers: getAuthHeaders()
//             });

//             if (response.data.success) {
//                 const records = response.data.data;
//                 const headers = ['ID', 'Head', 'Program', 'Project', 'Sub Project', 'Object', 'Object Name', 'Amount', 'Created At'];
//                 const csvRows = [headers.join(',')];

//                 for (const record of records) {
//                     const values = [
//                         record.id,
//                         record.head || '',
//                         record.program || '',
//                         record.project || '',
//                         record.subproj || '',
//                         record.object || '',
//                         record.objname || '',
//                         record.amount || 0,
//                         record.created_at || ''
//                     ];
//                     csvRows.push(values.join(','));
//                 }

//                 const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
//                 const url = window.URL.createObjectURL(blob);
//                 const a = document.createElement('a');
//                 a.href = url;
//                 a.download = `budget_export_${new Date().toISOString().split('T')[0]}.csv`;
//                 document.body.appendChild(a);
//                 a.click();
//                 document.body.removeChild(a);
//                 window.URL.revokeObjectURL(url);
//             }
//         } catch (error) {
//             console.error('Error exporting data:', error);
//             if (error.response?.status === 401) {
//                 alert('Session expired. Please login again.');
//                 window.location.href = '/login';
//             } else {
//                 alert('Failed to export data');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Export to PDF - Respects Filters
//     const handleExportPDF = async () => {
//         setLoading(true);
//         try {
//             const exportData = await fetchAllFilteredData();
//             const filteredTotal = exportData.reduce((sum, record) => sum + record.amount, 0);
//             const hasFilters = Object.values(filters).some(value => value !== '');
//             const filterText = hasFilters ? '(Filtered Data)' : '(All Data)';

//             const printWindow = window.open('', '_blank');
//             printWindow.document.write(`
//                 <html>
//                     <head>
//                         <title>Budget Report ${filterText}</title>
//                         <style>
//                             body { font-family: Arial, sans-serif; margin: 20px; }
//                             h1 { color: #333; text-align: center; }
//                             .header { text-align: center; margin-bottom: 20px; }
//                             .filter-info { 
//                                 background: #f0f0f0; 
//                                 padding: 10px; 
//                                 margin-bottom: 20px; 
//                                 border-radius: 5px;
//                                 font-size: 12px;
//                             }
//                             table { 
//                                 width: 100%; 
//                                 border-collapse: collapse; 
//                                 margin-top: 20px; 
//                                 font-size: 11px;
//                             }
//                             th, td { 
//                                 border: 1px solid #ddd; 
//                                 padding: 8px; 
//                                 text-align: left; 
//                             }
//                             th { 
//                                 background-color: #4CAF50; 
//                                 color: white;
//                                 font-weight: bold;
//                             }
//                             .text-right { text-align: right; }
//                             tr:nth-child(even) { background-color: #f9f9f9; }
//                             .total { 
//                                 margin-top: 20px; 
//                                 padding: 10px;
//                                 font-size: 16px; 
//                                 font-weight: bold; 
//                                 text-align: right;
//                                 background: #f0f0f0;
//                             }
//                             .footer {
//                                 margin-top: 30px;
//                                 text-align: center;
//                                 font-size: 10px;
//                                 color: #666;
//                             }
//                             @media print {
//                                 button { display: none; }
//                                 .no-print { display: none; }
//                             }
//                         </style>
//                     </head>
//                     <body>
//                         <div class="header">
//                             <h1>Budget Report ${filterText}</h1>
//                             <p>Generated on: ${new Date().toLocaleString()}</p>
//                         </div>
                        
//                         ${hasFilters ? `
//                         <div class="filter-info">
//                             <strong>Applied Filters:</strong><br>
//                             ${filters.head ? `• Head: ${filters.head}<br>` : ''}
//                             ${filters.program ? `• Program: ${filters.program}<br>` : ''}
//                             ${filters.project ? `• Project: ${filters.project}<br>` : ''}
//                             ${filters.object ? `• Object: ${filters.object}<br>` : ''}
//                             ${filters.objname ? `• Object Name: ${filters.objname}<br>` : ''}
//                             ${filters.min_amount ? `• Min Amount: Rs${parseFloat(filters.min_amount).toLocaleString()}<br>` : ''}
//                             ${filters.max_amount ? `• Max Amount: Rs${parseFloat(filters.max_amount).toLocaleString()}<br>` : ''}
//                         </div>
//                         ` : ''}
                        
//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th>ID</th>
//                                     <th>Head</th>
//                                     <th>Program</th>
//                                     <th>Project</th>
//                                     <th>Sub Project</th>
//                                     <th>Object</th>
//                                     <th>Object Name</th>
//                                     <th class="text-right">Amount (Rs)</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 ${exportData.map(record => `
//                                     <tr>
//                                         <td>${record.id}</td>
//                                         <td>${record.head === 0 ? '0' : (record.head || '0')}</td>
//                                         <td>${record.program === 0 ? '0' : (record.program || '0')}</td>
//                                         <td>${record.project === 0 ? '0' : (record.project || '0')}</td>
//                                         <td>${record.subproj === 0 ? '0' : (record.subproj || '0')}</td>
//                                         <td>${record.object === 0 ? '0' : (record.object || '0')}</td>
//                                         <td>${record.objname || '-'}</td>
//                                         <td class="text-right">${record.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
//                                     </tr>
//                                 `).join('')}
//                             </tbody>
//                         </table>
                        
//                         <div class="total">
//                             Total Records: ${exportData.length} | Total Budget: Rs${filteredTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                         </div>
                        
//                         <div class="footer">
//                             This is a computer generated report. No signature required.
//                         </div>
//                     </body>
//                 </html>
//             `);
//             printWindow.document.close();
//             printWindow.print();
//         } catch (error) {
//             console.error('Error generating PDF:', error);
//             alert('Failed to generate PDF. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle edit button click
//     const handleEdit = (record) => {
//         setEditingRecord({
//             id: record.id,
//             head: record.original?.head || '',
//             program: record.original?.program || '',
//             project: record.original?.project || '',
//             subproj: record.original?.subproj || '',
//             object: record.original?.object || '',
//             obj_detail: record.original?.obj_detail || '',
//             funding: record.original?.funding || '',
//             objname: record.original?.objname || '',
//             amount: record.original?.amount || record.budget
//         });
//         setShowEditModal(true);
//     };

//     const handleSelectRow = (id) => {
//         setSelectedRows(prev =>
//             prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
//         );
//     };

//     const handleSelectAll = () => {
//         if (selectedRows.length === budgetData.length) {
//             setSelectedRows([]);
//         } else {
//             setSelectedRows(budgetData.map(record => record.id));
//         }
//     };

//     const handleDrag = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         if (e.type === "dragenter" || e.type === "dragover") {
//             setDragActive(true);
//         } else if (e.type === "dragleave") {
//             setDragActive(false);
//         }
//     };

//     const handleDrop = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(false);
//         const file = e.dataTransfer.files[0];
//         if (file) {
//             const validTypes = ['.xlsx', '.xls', '.csv'];
//             const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
//             if (validTypes.includes(fileExtension)) {
//                 setUploadedFile(file);
//                 handleFileUpload(file);
//             } else {
//                 alert("Please upload .xlsx, .xls, or .csv files only");
//             }
//         }
//     };

//     const getStatusIcon = (status) => {
//         switch (status) {
//             case 'APPROVED': return <CheckCircle size={14} className="text-green-500" />;
//             case 'PENDING': return <Clock size={14} className="text-yellow-500" />;
//             case 'UNDER REVIEW': return <AlertCircle size={14} className="text-blue-500" />;
//             default: return null;
//         }
//     };

//     const getStatusClass = (status) => {
//         switch (status) {
//             case 'APPROVED': return 'bg-green-100 text-green-800';
//             case 'PENDING': return 'bg-yellow-100 text-yellow-800';
//             case 'UNDER REVIEW': return 'bg-blue-100 text-blue-800';
//             default: return 'bg-gray-100 text-gray-800';
//         }
//     };

//     return (
//         <div className="space-y-6">
//             {/* Loading Overlay */}
//             {(loading || uploading) && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg p-6">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                         <p className="mt-4 text-gray-600">{uploading ? 'Uploading file...' : 'Processing...'}</p>
//                     </div>
//                 </div>
//             )}

//             {/* Filter Section */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4">
//                 <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
//                     <input
//                         type="text"
//                         name="head"
//                         placeholder="Head"
//                         value={filters.head}
//                         onChange={handleFilterChange}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                     <input
//                         type="text"
//                         name="program"
//                         placeholder="Program"
//                         value={filters.program}
//                         onChange={handleFilterChange}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                     <input
//                         type="text"
//                         name="project"
//                         placeholder="Project"
//                         value={filters.project}
//                         onChange={handleFilterChange}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                     <input
//                         type="text"
//                         name="object"
//                         placeholder="Object"
//                         value={filters.object}
//                         onChange={handleFilterChange}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                     <input
//                         type="text"
//                         name="objname"
//                         placeholder="Object Name"
//                         value={filters.objname}
//                         onChange={handleFilterChange}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                     <input
//                         type="number"
//                         name="min_amount"
//                         placeholder="Min Amount"
//                         value={filters.min_amount}
//                         onChange={handleFilterChange}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                     <input
//                         type="number"
//                         name="max_amount"
//                         placeholder="Max Amount"
//                         value={filters.max_amount}
//                         onChange={handleFilterChange}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                 </div>
//                 <button
//                     onClick={clearFilters}
//                     className="mt-3 text-sm text-blue-600 hover:text-blue-700"
//                 >
//                     Clear Filters
//                 </button>
//             </div>

//             {/* Drag and Drop Area with Upload Button */}
//             <div
//                 className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
//                     }`}
//                 onDragEnter={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDragOver={handleDrag}
//                 onDrop={handleDrop}
//             >
//                 <Upload className="mx-auto h-10 w-10 text-gray-400" />
//                 <p className="mt-2 text-sm text-gray-600">Drag and drop budget files here</p>
//                 <p className="text-xs text-gray-400 mb-3">Support for .xlsx, .xls, .csv files up to 50MB</p>

//                 <input
//                     type="file"
//                     id="fileInput"
//                     accept=".xlsx,.xls,.csv"
//                     className="hidden"
//                     onChange={handleFileSelect}
//                 />
//                 <button
//                     onClick={() => document.getElementById('fileInput').click()}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
//                     disabled={uploading}
//                 >
//                     {uploading ? 'Uploading...' : 'Browse Files'}
//                 </button>

//                 {uploadedFile && !uploading && (
//                     <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
//                         <FileText size={14} className="text-green-600" />
//                         <span className="text-sm text-green-700">{uploadedFile.name}</span>
//                         <button
//                             onClick={() => {
//                                 setUploadedFile(null);
//                                 const fileInput = document.getElementById('fileInput');
//                                 if (fileInput) fileInput.value = '';
//                             }}
//                             className="text-green-700 hover:text-green-900"
//                         >
//                             <X size={14} />
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-wrap gap-3 items-center justify-between">
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => setShowAddModal(true)}
//                         className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
//                     >
//                         <Plus size={16} />
//                         <span>Add Record</span>
//                     </button>
//                     <button
//                         onClick={handleDelete}
//                         className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm ${selectedRows.length > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                             }`}
//                         disabled={selectedRows.length === 0}
//                     >
//                         <Trash2 size={16} />
//                         <span>Delete ({selectedRows.length})</span>
//                     </button>
//                 </div>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={handleExportPDF}
//                         className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
//                     >
//                         <FileText size={16} />
//                         <span>PDF</span>
//                     </button>
//                     <button
//                         onClick={handleExportExcel}
//                         className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
//                     >
//                         <FileSpreadsheet size={16} />
//                         <span>Export CSV</span>
//                     </button>
//                     <button
//                         onClick={fetchBudgetRecords}
//                         className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
//                     >
//                         <RefreshCw size={16} />
//                         <span>Refresh</span>
//                     </button>
//                 </div>
//             </div>

//             {/* Budget Table */}
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-gray-50 border-b border-gray-200">
//                             <tr>
//                                 <th className="px-4 py-3 w-8">
//                                     <input
//                                         type="checkbox"
//                                         checked={selectedRows.length === budgetData.length && budgetData.length > 0}
//                                         onChange={handleSelectAll}
//                                         className="rounded border-gray-300"
//                                     />
//                                 </th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Head</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Program</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sub Project</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Object</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Object Name</th>
//                                 <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount (Rs)</th>
//                                 <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {budgetData.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="9" className="text-center py-8 text-gray-500">
//                                         No records found. Upload an Excel file or add a record.
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 budgetData.map((record) => (
//                                     <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
//                                         <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedRows.includes(record.id)}
//                                                 onChange={() => handleSelectRow(record.id)}
//                                                 className="rounded border-gray-300"
//                                             />
//                                         </td>
//                                         <td className="px-4 py-3 text-sm text-gray-900">{record.original?.head ?? 0}</td>
//                                         <td className="px-4 py-3 text-sm text-gray-900">{record.original?.program ?? 0}</td>
//                                         <td className="px-4 py-3 text-sm text-gray-900">{record.original?.project ?? 0}</td>
//                                         <td className="px-4 py-3 text-sm text-gray-900">{record.original?.subproj ?? 0}</td>
//                                         <td className="px-4 py-3 text-sm text-gray-900">{record.original?.object ?? 0}</td>
//                                         <td className="px-4 py-3 text-sm text-gray-900">{record.departmentName}</td>
//                                         <td className="px-4 py-3 text-sm text-right font-medium">{record.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
//                                         <td className="px-4 py-3 text-center">
//                                             <button
//                                                 onClick={() => handleEdit(record)}
//                                                 className="text-blue-600 hover:text-blue-800 text-sm"
//                                             >
//                                                 Edit
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Pagination */}
//                 <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
//                     <div className="flex items-center space-x-2">
//                         <span className="text-sm text-gray-600">Show</span>
//                         <select
//                             value={entriesPerPage}
//                             onChange={(e) => {
//                                 const value = e.target.value;
//                                 setEntriesPerPage(value === 'all' ? totalRecords : Number(value));
//                                 setCurrentPage(1);
//                             }}
//                             className="border border-gray-300 rounded-md px-2 py-1 text-sm"
//                         >
//                             <option value={5}>5</option>
//                             <option value={10}>10</option>
//                             <option value={25}>25</option>
//                             <option value={50}>50</option>
//                             <option value="all">All Records</option>
//                         </select>
//                         <span className="text-sm text-gray-600">records</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                         <button
//                             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                             disabled={currentPage === 1}
//                             className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                         >
//                             Previous
//                         </button>
//                         <span className="text-sm text-gray-600">
//                             Page {currentPage} of {lastPage}
//                         </span>
//                         <button
//                             onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
//                             disabled={currentPage === lastPage}
//                             className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Add Record Modal */}
//             {showAddModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
//                         <div className="flex justify-between items-center mb-4">
//                             <h3 className="text-lg font-semibold">Add New Budget Record</h3>
//                             <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
//                                 <X size={20} />
//                             </button>
//                         </div>
//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Object Name *</label>
//                                 <input
//                                     type="text"
//                                     value={newRecord.objname}
//                                     onChange={(e) => setNewRecord({ ...newRecord, objname: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="e.g., Information Technology"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Head Code</label>
//                                 <input
//                                     type="number"
//                                     value={newRecord.head}
//                                     onChange={(e) => setNewRecord({ ...newRecord, head: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="e.g., 101"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
//                                 <input
//                                     type="number"
//                                     value={newRecord.program}
//                                     onChange={(e) => setNewRecord({ ...newRecord, program: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="e.g., 202"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
//                                 <input
//                                     type="number"
//                                     value={newRecord.project}
//                                     onChange={(e) => setNewRecord({ ...newRecord, project: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="e.g., 303"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Object</label>
//                                 <input
//                                     type="number"
//                                     value={newRecord.object}
//                                     onChange={(e) => setNewRecord({ ...newRecord, object: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="e.g., 404"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
//                                 <input
//                                     type="number"
//                                     value={newRecord.amount}
//                                     onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="0.00"
//                                 />
//                             </div>
//                         </div>
//                         <div className="flex justify-end space-x-3 mt-6">
//                             <button
//                                 onClick={() => setShowAddModal(false)}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleAddRecord}
//                                 disabled={loading}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                             >
//                                 {loading ? 'Adding...' : 'Add Record'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Edit Record Modal */}
//             {showEditModal && editingRecord && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
//                         <div className="flex justify-between items-center mb-4">
//                             <h3 className="text-lg font-semibold">Edit Budget Record</h3>
//                             <button onClick={() => {
//                                 setShowEditModal(false);
//                                 setEditingRecord(null);
//                             }} className="text-gray-400 hover:text-gray-600">
//                                 <X size={20} />
//                             </button>
//                         </div>
//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Object Name</label>
//                                 <input
//                                     type="text"
//                                     value={editingRecord.objname}
//                                     onChange={(e) => setEditingRecord({ ...editingRecord, objname: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Head Code</label>
//                                 <input
//                                     type="number"
//                                     value={editingRecord.head}
//                                     onChange={(e) => setEditingRecord({ ...editingRecord, head: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
//                                 <input
//                                     type="number"
//                                     value={editingRecord.program}
//                                     onChange={(e) => setEditingRecord({ ...editingRecord, program: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
//                                 <input
//                                     type="number"
//                                     value={editingRecord.project}
//                                     onChange={(e) => setEditingRecord({ ...editingRecord, project: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Object</label>
//                                 <input
//                                     type="number"
//                                     value={editingRecord.object}
//                                     onChange={(e) => setEditingRecord({ ...editingRecord, object: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
//                                 <input
//                                     type="number"
//                                     value={editingRecord.amount}
//                                     onChange={(e) => setEditingRecord({ ...editingRecord, amount: e.target.value })}
//                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                             </div>
//                         </div>
//                         <div className="flex justify-end space-x-3 mt-6">
//                             <button
//                                 onClick={() => {
//                                     setShowEditModal(false);
//                                     setEditingRecord(null);
//                                 }}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleUpdateRecord}
//                                 disabled={loading}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                             >
//                                 {loading ? 'Updating...' : 'Update Record'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default BudgetPanel;




import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    RefreshCw,
    FileText,
    FileSpreadsheet,
    Upload,
    X,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const BudgetPanel = ({ onSelectDepartment }) => {
    const [budgetData, setBudgetData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [totalBudget, setTotalBudget] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [editingRecord, setEditingRecord] = useState(null);
    const [allFilteredData, setAllFilteredData] = useState([]);
    const [filters, setFilters] = useState({
        head: '',
        program: '',
        project: '',
        subproj: '', // Added subproj filter
        objname: '',
        object: '',
        min_amount: '',
        max_amount: ''
    });

    const [newRecord, setNewRecord] = useState({
        head: '',
        program: '',
        project: '',
        subproj: '',
        object: '',
        obj_detail: '',
        funding: '',
        objname: '',
        amount: ''
    });

    // Helper function to get auth headers with JWT token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Helper function to get file upload headers with JWT token
    const getFileUploadHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Fetch budget records from API
    const fetchBudgetRecords = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: entriesPerPage,
                ...filters
            };
            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await axios.get(`${API_BASE_URL}/budget/records`, {
                params,
                headers: getAuthHeaders()
            });

            if (response.data.success) {
                const transformedData = response.data.data.map(record => ({
                    id: record.id,
                    departmentCode: record.head ? `DEPT-${record.head}` : record.objname || 'N/A',
                    departmentName: record.objname || 'Unnamed',
                    category: record.program ? `Program ${record.program}` : 'General',
                    budget: parseFloat(record.amount) || 0,
                    status: record.amount > 1000000 ? 'APPROVED' : 'PENDING',
                    original: record
                }));

                setBudgetData(transformedData);
                setTotalBudget(response.data.total_budget || 0);
                setTotalRecords(response.data.pagination?.total || 0);
                setLastPage(response.data.pagination?.last_page || 1);
            }
        } catch (error) {
            console.error('Error fetching budget records:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = '/login';
            } else {
                alert('Failed to fetch budget records. Please check your API connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch ALL filtered data for PDF export (without pagination)
    const fetchAllFilteredData = async () => {
        try {
            const params = {
                per_page: 999999,
                ...filters
            };
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await axios.get(`${API_BASE_URL}/budget/records`, {
                params,
                headers: getAuthHeaders()
            });

            if (response.data.success) {
                const transformedData = response.data.data.map(record => ({
                    id: record.id,
                    head: record.head ?? 0,
                    program: record.program ?? 0,
                    project: record.project ?? 0,
                    subproj: record.subproj ?? 0,
                    object: record.object ?? 0,
                    objname: record.objname || 'Total Amount',
                    amount: parseFloat(record.amount) || 0,
                }));
                setAllFilteredData(transformedData);
                return transformedData;
            }
        } catch (error) {
            console.error('Error fetching all filtered data:', error);
            return [];
        }
    };

    // Fetch budget summary
    const fetchSummary = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/budget/summary`, {
                headers: getAuthHeaders()
            });
            if (response.data.success) {
                setTotalBudget(response.data.data.total_budget || 0);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = '/login';
            }
        }
    };

    // Load data on component mount and when dependencies change
    useEffect(() => {
        fetchBudgetRecords();
        fetchSummary();
    }, [currentPage, entriesPerPage, filters]);

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            head: '',
            program: '',
            project: '',
            subproj: '',
            objname: '',
            object: '',
            min_amount: '',
            max_amount: ''
        });
        setCurrentPage(1);
    };

    // Create new budget record
    const handleAddRecord = async () => {
        if (!newRecord.objname || !newRecord.amount) {
            alert('Please fill all required fields (Name and Amount)');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/budget/records`,
                {
                    head: newRecord.head || null,
                    program: newRecord.program || null,
                    project: newRecord.project || null,
                    subproj: newRecord.subproj || null,
                    object: newRecord.object || null,
                    obj_detail: newRecord.obj_detail || null,
                    funding: newRecord.funding || null,
                    objname: newRecord.objname,
                    amount: parseFloat(newRecord.amount)
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                alert('Record added successfully!');
                setNewRecord({
                    head: '',
                    program: '',
                    project: '',
                    subproj: '',
                    object: '',
                    obj_detail: '',
                    funding: '',
                    objname: '',
                    amount: ''
                });
                setShowAddModal(false);
                fetchBudgetRecords();
                fetchSummary();
            }
        } catch (error) {
            console.error('Error adding record:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = '/login';
            } else {
                alert(error.response?.data?.message || 'Failed to add record');
            }
        } finally {
            setLoading(false);
        }
    };

    // Update existing record
    const handleUpdateRecord = async () => {
        if (!editingRecord) return;

        setLoading(true);
        try {
            const response = await axios.put(
                `${API_BASE_URL}/budget/records/${editingRecord.id}`,
                {
                    head: editingRecord.head,
                    program: editingRecord.program,
                    project: editingRecord.project,
                    subproj: editingRecord.subproj,
                    object: editingRecord.object,
                    obj_detail: editingRecord.obj_detail,
                    funding: editingRecord.funding,
                    objname: editingRecord.objname,
                    amount: parseFloat(editingRecord.amount)
                },
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                alert('Record updated successfully!');
                setShowEditModal(false);
                setEditingRecord(null);
                fetchBudgetRecords();
                fetchSummary();
            }
        } catch (error) {
            console.error('Error updating record:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = '/login';
            } else {
                alert(error.response?.data?.message || 'Failed to update record');
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete selected records
    const handleDelete = async () => {
        if (selectedRows.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedRows.length} record(s)?`)) return;

        setLoading(true);
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/budget/records`,
                {
                    data: { ids: selectedRows },
                    headers: getAuthHeaders()
                }
            );

            if (response.data.success) {
                alert(response.data.message);
                setSelectedRows([]);
                fetchBudgetRecords();
                fetchSummary();
            }
        } catch (error) {
            console.error('Error deleting records:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = '/login';
            } else {
                alert(error.response?.data?.message || 'Failed to delete records');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle file upload (import)
    const handleFileUpload = async (file) => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        const validTypes = ['.xlsx', '.xls', '.csv'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!validTypes.includes(fileExtension)) {
            alert('Please upload .xlsx, .xls, or .csv files only');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            alert('File size must be less than 50MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/budget/import`,
                formData,
                { headers: getFileUploadHeaders() }
            );

            if (response.data.success) {
                alert(`Import successful! Imported: ${response.data.imported_count || '?'} records`);
                setUploadedFile(null);
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
                fetchBudgetRecords();
                fetchSummary();
            } else {
                throw new Error(response.data.message || 'Import failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = '/login';
            } else {
                alert(error.response?.data?.message || 'Failed to import file. Please check the file format.');
            }
        } finally {
            setUploading(false);
        }
    };

    // Handle file selection from browse button
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);
            handleFileUpload(file);
        }
    };

    // Export to Excel (download as CSV)
    const handleExportExcel = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/budget/export`, {
                headers: getAuthHeaders()
            });

            if (response.data.success) {
                const records = response.data.data;
                const headers = ['ID', 'Head', 'Program', 'Project', 'Sub Project', 'Object', 'Object Name', 'Amount', 'Created At'];
                const csvRows = [headers.join(',')];

                for (const record of records) {
                    const values = [
                        record.id,
                        record.head || '',
                        record.program || '',
                        record.project || '',
                        record.subproj || '',
                        record.object || '',
                        record.objname || '',
                        record.amount || 0,
                        record.created_at || ''
                    ];
                    csvRows.push(values.join(','));
                }

                const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `budget_export_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
                window.location.href = '/login';
            } else {
                alert('Failed to export data');
            }
        } finally {
            setLoading(false);
        }
    };

    // Export to PDF - Respects Filters
    const handleExportPDF = async () => {
        setLoading(true);
        try {
            const exportData = await fetchAllFilteredData();
            const filteredTotal = exportData.reduce((sum, record) => sum + record.amount, 0);
            const hasFilters = Object.values(filters).some(value => value !== '');
            const filterText = hasFilters ? '(Filtered Data)' : '(All Data)';

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Budget Report ${filterText}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { color: #333; text-align: center; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .filter-info { 
                                background: #f0f0f0; 
                                padding: 10px; 
                                margin-bottom: 20px; 
                                border-radius: 5px;
                                font-size: 12px;
                            }
                            table { 
                                width: 100%; 
                                border-collapse: collapse; 
                                margin-top: 20px; 
                                font-size: 11px;
                            }
                            th, td { 
                                border: 1px solid #ddd; 
                                padding: 8px; 
                                text-align: left; 
                            }
                            th { 
                                background-color: #4CAF50; 
                                color: white;
                                font-weight: bold;
                            }
                            .text-right { text-align: right; }
                            tr:nth-child(even) { background-color: #f9f9f9; }
                            .total { 
                                margin-top: 20px; 
                                padding: 10px;
                                font-size: 16px; 
                                font-weight: bold; 
                                text-align: right;
                                background: #f0f0f0;
                            }
                            .footer {
                                margin-top: 30px;
                                text-align: center;
                                font-size: 10px;
                                color: #666;
                            }
                            @media print {
                                button { display: none; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Budget Report ${filterText}</h1>
                            <p>Generated on: ${new Date().toLocaleString()}</p>
                        </div>
                        
                        ${hasFilters ? `
                        <div class="filter-info">
                            <strong>Applied Filters:</strong><br>
                            ${filters.head ? `• Head: ${filters.head}<br>` : ''}
                            ${filters.program ? `• Program: ${filters.program}<br>` : ''}
                            ${filters.project ? `• Project: ${filters.project}<br>` : ''}
                            ${filters.subproj ? `• Sub Project: ${filters.subproj}<br>` : ''}
                            ${filters.object ? `• Object: ${filters.object}<br>` : ''}
                            ${filters.objname ? `• Object Name: ${filters.objname}<br>` : ''}
                            ${filters.min_amount ? `• Min Amount: Rs${parseFloat(filters.min_amount).toLocaleString()}<br>` : ''}
                            ${filters.max_amount ? `• Max Amount: Rs${parseFloat(filters.max_amount).toLocaleString()}<br>` : ''}
                        </div>
                        ` : ''}
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Head</th>
                                    <th>Program</th>
                                    <th>Project</th>
                                    <th>Sub Project</th>
                                    <th>Object</th>
                                    <th>Object Name</th>
                                    <th class="text-right">Amount (Rs)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${exportData.map(record => `
                                    <tr>
                                        <td>${record.id}</td>
                                        <td>${record.head === 0 ? '0' : (record.head || '0')}</td>
                                        <td>${record.program === 0 ? '0' : (record.program || '0')}</td>
                                        <td>${record.project === 0 ? '0' : (record.project || '0')}</td>
                                        <td>${record.subproj === 0 ? '0' : (record.subproj || '0')}</td>
                                        <td>${record.object === 0 ? '0' : (record.object || '0')}</td>
                                        <td>${record.objname || '-'}</td>
                                        <td class="text-right">${record.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="total">
                            Total Records: ${exportData.length} | Total Budget: Rs${filteredTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        
                        <div class="footer">
                            This is a computer generated report. No signature required.
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit button click
    const handleEdit = (record) => {
        setEditingRecord({
            id: record.id,
            head: record.original?.head || '',
            program: record.original?.program || '',
            project: record.original?.project || '',
            subproj: record.original?.subproj || '',
            object: record.original?.object || '',
            obj_detail: record.original?.obj_detail || '',
            funding: record.original?.funding || '',
            objname: record.original?.objname || '',
            amount: record.original?.amount || record.budget
        });
        setShowEditModal(true);
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedRows.length === budgetData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(budgetData.map(record => record.id));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            const validTypes = ['.xlsx', '.xls', '.csv'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (validTypes.includes(fileExtension)) {
                setUploadedFile(file);
                handleFileUpload(file);
            } else {
                alert("Please upload .xlsx, .xls, or .csv files only");
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle size={14} className="text-green-500" />;
            case 'PENDING': return <Clock size={14} className="text-yellow-500" />;
            case 'UNDER REVIEW': return <AlertCircle size={14} className="text-blue-500" />;
            default: return null;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'UNDER REVIEW': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Loading Overlay */}
            {(loading || uploading) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">{uploading ? 'Uploading file...' : 'Processing...'}</p>
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-3">
                    <input
                        type="text"
                        name="head"
                        placeholder="Head"
                        value={filters.head}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                        type="text"
                        name="program"
                        placeholder="Program"
                        value={filters.program}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                        type="text"
                        name="project"
                        placeholder="Project"
                        value={filters.project}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                        type="text"
                        name="subproj"
                        placeholder="Sub Project"
                        value={filters.subproj}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                        type="text"
                        name="object"
                        placeholder="Object"
                        value={filters.object}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                        type="text"
                        name="objname"
                        placeholder="Object Name"
                        value={filters.objname}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                        type="number"
                        name="min_amount"
                        placeholder="Min Amount"
                        value={filters.min_amount}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                        type="number"
                        name="max_amount"
                        placeholder="Max Amount"
                        value={filters.max_amount}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
                <button
                    onClick={clearFilters}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                    Clear Filters
                </button>
            </div>

            {/* Drag and Drop Area with Upload Button */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Drag and drop budget files here</p>
                <p className="text-xs text-gray-400 mb-3">Support for .xlsx, .xls, .csv files up to 50MB</p>

                <input
                    type="file"
                    id="fileInput"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <button
                    onClick={() => document.getElementById('fileInput').click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Browse Files'}
                </button>

                {uploadedFile && !uploading && (
                    <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                        <FileText size={14} className="text-green-600" />
                        <span className="text-sm text-green-700">{uploadedFile.name}</span>
                        <button
                            onClick={() => {
                                setUploadedFile(null);
                                const fileInput = document.getElementById('fileInput');
                                if (fileInput) fileInput.value = '';
                            }}
                            className="text-green-700 hover:text-green-900"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        <Plus size={16} />
                        <span>Add Record</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm ${selectedRows.length > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        disabled={selectedRows.length === 0}
                    >
                        <Trash2 size={16} />
                        <span>Delete ({selectedRows.length})</span>
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        <FileText size={16} />
                        <span>PDF</span>
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        <FileSpreadsheet size={16} />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={fetchBudgetRecords}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Budget Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 w-8">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === budgetData.length && budgetData.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Head</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Program</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sub Project</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Object</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Object Name</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount (Rs)</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgetData.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-8 text-gray-500">
                                        No records found. Upload an Excel file or add a record.
                                    </td>
                                </tr>
                            ) : (
                                budgetData.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(record.id)}
                                                onChange={() => handleSelectRow(record.id)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{record.original?.head ?? 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{record.original?.program ?? 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{record.original?.project ?? 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{record.original?.subproj ?? 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{record.original?.object ?? 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{record.departmentName}</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium">{record.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Show</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEntriesPerPage(value === 'all' ? totalRecords : Number(value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value="all">All Records</option>
                        </select>
                        <span className="text-sm text-gray-600">records</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {lastPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                            disabled={currentPage === lastPage}
                            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Record Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add New Budget Record</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Object Name *</label>
                                <input
                                    type="text"
                                    value={newRecord.objname}
                                    onChange={(e) => setNewRecord({ ...newRecord, objname: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Information Technology"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Head Code</label>
                                <input
                                    type="number"
                                    value={newRecord.head}
                                    onChange={(e) => setNewRecord({ ...newRecord, head: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                <input
                                    type="number"
                                    value={newRecord.program}
                                    onChange={(e) => setNewRecord({ ...newRecord, program: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 202"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                <input
                                    type="number"
                                    value={newRecord.project}
                                    onChange={(e) => setNewRecord({ ...newRecord, project: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 303"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Project</label>
                                <input
                                    type="number"
                                    value={newRecord.subproj}
                                    onChange={(e) => setNewRecord({ ...newRecord, subproj: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 404"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Object</label>
                                <input
                                    type="number"
                                    value={newRecord.object}
                                    onChange={(e) => setNewRecord({ ...newRecord, object: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 505"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs) *</label>
                                <input
                                    type="number"
                                    value={newRecord.amount}
                                    onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddRecord}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Adding...' : 'Add Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Record Modal */}
            {showEditModal && editingRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Edit Budget Record</h3>
                            <button onClick={() => {
                                setShowEditModal(false);
                                setEditingRecord(null);
                            }} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Object Name</label>
                                <input
                                    type="text"
                                    value={editingRecord.objname}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, objname: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Head Code</label>
                                <input
                                    type="number"
                                    value={editingRecord.head}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, head: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                <input
                                    type="number"
                                    value={editingRecord.program}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, program: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                <input
                                    type="number"
                                    value={editingRecord.project}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, project: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Project</label>
                                <input
                                    type="number"
                                    value={editingRecord.subproj}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, subproj: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Object</label>
                                <input
                                    type="number"
                                    value={editingRecord.object}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, object: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs)</label>
                                <input
                                    type="number"
                                    value={editingRecord.amount}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, amount: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingRecord(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateRecord}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetPanel;