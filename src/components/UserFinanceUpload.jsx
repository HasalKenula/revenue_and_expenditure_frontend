

// components/UserFinanceUpload.jsx
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
    DollarSign,
    Upload,
    FileSpreadsheet,
    CheckCircle,
    AlertCircle,
    Trash2,
    Eye,
    BarChart3,
    Users,
    Lock
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
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const UserFinanceUpload = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [records, setRecords] = useState([]);
    const [file, setFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [uploadBlocked, setUploadBlocked] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({
        has_uploads: false,
        pending_count: 0,
        approved_count: 0,
        total_count: 0
    });
    const [totals, setTotals] = useState({
        total_records: 0,
        pending_count: 0,
        approved_count: 0,
        total_cash: 0,
        total_xe: 0,
        total_cash_xe: 0,
    });

    const [filters, setFilters] = useState({
        month: '',
        year: '',
        is_approved: '',
    });

    const [appliedFilters, setAppliedFilters] = useState({
        month: '',
        year: '',
        is_approved: '',
    });

    const [filterOptions, setFilterOptions] = useState({
        months: [],
        years: [],
        statuses: [
            { value: '', label: 'All Status' },
            { value: '0', label: 'Pending' },
            { value: '1', label: 'Approved' }
        ]
    });

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

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

    useEffect(() => {
        checkUploadStatus();
        fetchFilterOptions();
    }, []);

    const checkUploadStatus = async () => {
        try {
            const response = await apiClient.get('/user-monthly-finance/check-uploads');
            if (response.data.success) {
                setUploadStatus(response.data.data);
                setUploadBlocked(response.data.data.has_uploads);
            }
        } catch (error) {
            console.error('Error checking upload status:', error);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const response = await apiClient.get('/user-monthly-finance/filter-options');
            if (response.data.success) {
                setFilterOptions({
                    months: response.data.data.months || [],
                    years: response.data.data.years || [],
                    statuses: response.data.data.statuses || [
                        { value: '', label: 'All Status' },
                        { value: '0', label: 'Pending' },
                        { value: '1', label: 'Approved' }
                    ]
                });
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: entriesPerPage,
            };

            if (appliedFilters.month) params.month = appliedFilters.month;
            if (appliedFilters.year) params.year = appliedFilters.year;
            if (appliedFilters.is_approved !== '') params.is_approved = appliedFilters.is_approved;

            const response = await apiClient.get('/user-monthly-finance/my-data', { params });

            if (response.data.success) {
                setRecords(response.data.data);
                setTotalRecords(response.data.pagination.total);
                setLastPage(response.data.pagination.last_page);
                setTotals(response.data.totals || {
                    total_records: 0,
                    pending_count: 0,
                    approved_count: 0,
                    total_cash: 0,
                    total_xe: 0,
                    total_cash_xe: 0,
                });
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            setMessage('Failed to fetch records');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (uploadStatus.has_uploads) {
            fetchRecords();
        }
    }, [currentPage, entriesPerPage, appliedFilters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters({ ...filters });
        setShowFilterModal(false);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ month: '', year: '', is_approved: '' });
        setAppliedFilters({ month: '', year: '', is_approved: '' });
        setCurrentPage(1);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv'];
            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
                setMessage('Please upload a valid Excel or CSV file');
                setMessageType('error');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file to upload');
            setMessageType('error');
            return;
        }

        if (uploadBlocked) {
            setMessage('You already have uploaded data. Please contact the expenditure manager to delete your previous data before uploading again.');
            setMessageType('error');
            return;
        }

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/user-monthly-finance/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setMessage(`File uploaded successfully! ${response.data.imported_count} records imported. Waiting for approval.`);
                setMessageType('success');
                setFile(null);
                document.getElementById('fileInput').value = '';
                checkUploadStatus();
                fetchRecords();
                fetchFilterOptions();
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage(error.response?.data?.message || 'Upload failed');
            setMessageType('error');
        } finally {
            setUploading(false);
        }
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

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const currentDate = new Date().toLocaleString();

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(41, 128, 185);
            doc.text('User Monthly Finance Report', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 28, { align: 'center' });
            doc.text(`User: ${userName} (ID: ${userId})`, pageWidth / 2, 36, { align: 'center' });

            doc.setDrawColor(200, 200, 200);
            doc.line(15, 42, pageWidth - 15, 42);

            const tableHeaders = ['#', 'Subject', 'TRNO', 'Month', 'Head', 'Cash', 'XE', 'Total', 'Status'];

            const tableBody = records.map((record, index) => [
                (currentPage - 1) * entriesPerPage + index + 1,
                record.subject || '-',
                record.trno || '-',
                record.month ? monthNames[record.month] || record.month : '-',
                record.head || '-',
                formatNumber(record.cash),
                formatNumber(record.xe),
                formatNumber(record.cash_xe),
                record.is_approved ? 'Approved' : 'Pending'
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableBody,
                startY: 48,
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
                    cellPadding: 2,
                    textColor: [0, 0, 0]
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { left: 10, right: 10 },
                didDrawPage: function (data) {
                    const pageCount = doc.internal.getNumberOfPages();
                    for (let i = 1; i <= pageCount; i++) {
                        doc.setPage(i);
                        doc.setFontSize(8);
                        doc.setTextColor(128, 128, 128);
                        doc.text(
                            `Page ${i} of ${pageCount}`,
                            pageWidth / 2,
                            pageHeight - 10,
                            { align: 'center' }
                        );
                    }
                }
            });

            const fileName = `user_finance_report_${userId}.pdf`;
            doc.save(fileName);
            alert('PDF exported successfully!');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const paginatedRecords = records;

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
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
            <div className=" rounded-xl shadow-lg p-6 ">
                <div className="flex justify-between items-start flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold">Finance Uploads</h1>

                    </div>
                    {uploadBlocked ? (
                        <div className="bg-yellow-500/30 rounded-lg px-3 py-2 border border-yellow-400">
                            <p className="text-sm  flex items-center gap-2">
                                <Lock size={16} />
                                Upload Locked - Data exists ({uploadStatus.total_count} records)
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-500/30 rounded-lg px-3 py-2 border border-green-400">
                            <p className="text-sm ">Ready to upload</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Status Banner */}
            {uploadBlocked && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Upload Blocked</p>
                            <p className="text-sm text-yellow-700">
                                You already have {uploadStatus.total_count} record(s) uploaded
                                ({uploadStatus.pending_count} pending, {uploadStatus.approved_count} approved).
                                Please contact the expenditure manager to delete your previous data before uploading again.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Total Records</p>
                    <p className="text-xl font-bold text-blue-600">{totals.total_records}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-xl font-bold text-yellow-600">{totals.pending_count}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Approved</p>
                    <p className="text-xl font-bold text-green-600">{totals.total_records - totals.pending_count}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Total Cash</p>
                    <p className="text-xl font-bold text-green-600">Rs {formatNumber(totals.total_cash)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Total XE</p>
                    <p className="text-xl font-bold text-blue-600">Rs {formatNumber(totals.total_xe)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Total Cash+XE</p>
                    <p className="text-xl font-bold text-purple-600">Rs {formatNumber(totals.total_cash_xe)}</p>
                </div>
            </div>

            {/* Upload Section */}
            <div className={`bg-white rounded-xl shadow-sm border ${uploadBlocked ? 'border-yellow-300 bg-yellow-50/50' : 'border-gray-200'} p-6`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Upload size={20} className={uploadBlocked ? 'text-yellow-600' : 'text-blue-600'} />
                    Upload Excel File
                    {uploadBlocked && <span className="text-xs text-yellow-600 ml-2">(Locked - Delete existing data first)</span>}
                </h3>

                <div className={`border-2 border-dashed ${uploadBlocked ? 'border-yellow-300 bg-yellow-100/50' : 'border-gray-300'} rounded-lg p-6 text-center ${uploadBlocked ? 'cursor-not-allowed opacity-60' : 'hover:border-blue-400 transition-colors'}`}>
                    <input
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        disabled={uploadBlocked}
                    />
                    <label htmlFor="fileInput" className={`cursor-pointer flex flex-col items-center ${uploadBlocked ? 'cursor-not-allowed' : ''}`}>
                        <FileSpreadsheet size={48} className={uploadBlocked ? 'text-yellow-400' : 'text-gray-400'} />
                        <p className="text-sm text-gray-600">
                            {uploadBlocked ? 'Upload is locked. Please delete existing data first.' : (file ? file.name : 'Click to select or drag and drop your Excel file')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Supported formats: .xlsx, .xls, .csv
                        </p>
                    </label>
                </div>

                {file && !uploadBlocked && (
                    <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet size={20} className="text-green-600" />
                            <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <button onClick={() => { setFile(null); document.getElementById('fileInput').value = ''; }} className="text-red-500 hover:text-red-700">
                            <X size={20} />
                        </button>
                    </div>
                )}

                {message && (
                    <div className={`mt-4 p-3 rounded-lg flex items-start space-x-2 ${messageType === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {messageType === 'success' ? <CheckCircle size={20} className="flex-shrink-0" /> : <AlertCircle size={20} className="flex-shrink-0" />}
                        <span className="text-sm">{message}</span>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading || uploadBlocked}
                    className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    {uploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            <span>{uploadBlocked ? 'Upload Locked' : 'Upload File'}</span>
                        </>
                    )}
                </button>
            </div>

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
                    onClick={() => { fetchRecords(); checkUploadStatus(); fetchFilterOptions(); }}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm bg-white shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Records Table - NO DELETE BUTTON */}
            {uploadBlocked && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 text-left font-semibold text-gray-700">#</th>
                                    <th className="px-2 py-3 text-left">Subject</th>
                                    <th className="px-2 py-3 text-left">TR No</th>
                                    <th className="px-2 py-3 text-left">SN</th>
                                    <th className="px-2 py-3 text-left">Dr/Cr Code</th>
                                    <th className="px-2 py-3 text-left">Head</th>
                                    <th className="px-2 py-3 text-left">Program</th>
                                    <th className="px-2 py-3 text-left">Project</th>
                                    <th className="px-2 py-3 text-left">Sub Project</th>
                                    <th className="px-2 py-3 text-left">Object</th>
                                    <th className="px-2 py-3 text-left">Item</th>
                                    <th className="px-2 py-3 text-left">Funding</th>
                                    <th className="px-2 py-3 text-left">Dr/Cr</th>
                                    <th className="px-2 py-3 text-left">Head No</th>
                                    <th className="px-2 py-3 text-left">Year</th>
                                    <th className="px-2 py-3 text-left">Month</th>
                                    <th className="px-2 py-3 text-right">Cash (Rs)</th>
                                    <th className="px-2 py-3 text-right">XE (Rs)</th>
                                    <th className="px-2 py-3 text-right">Total (Rs)</th>

                                    <th className="px-3 py-3 text-center font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileSpreadsheet size={40} className="text-gray-300" />
                                                <p>No records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRecords.map((record, index) => (
                                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-3 py-3 text-gray-500">
                                                {(currentPage - 1) * entriesPerPage + index + 1}
                                            </td>
                                            <td className="px-2 py-2 max-w-xs truncate">{record.subject || '-'}</td>
                                            <td className="px-2 py-2">{(record.trno)}</td>
                                            <td className="px-2 py-2">{(record.sn)}</td>
                                            <td className="px-2 py-2">{(record.dr_cr_code)}</td>
                                            <td className="px-2 py-2">{(record.head)}</td>
                                            <td className="px-2 py-2">{(record.program)}</td>
                                            <td className="px-2 py-2">{(record.project)}</td>
                                            <td className="px-2 py-2">{(record.sub_project)}</td>
                                            <td className="px-2 py-2">{(record.object)}</td>
                                            <td className="px-2 py-2">{(record.item)}</td>
                                            <td className="px-2 py-2">{(record.funding)}</td>
                                            <td className="px-2 py-2">{(record.dr_cr)}</td>
                                            <td className="px-2 py-2">{(record.head_no)}</td>
                                            <td className="px-2 py-2">{record.year || '-'}</td>
                                            <td className="px-3 py-3 text-gray-700">
                                                {record.month ? monthNames[record.month] || '-' : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-right">{formatNumber(record.cash)}</td>
                                            <td className="px-2 py-2 text-right">{formatNumber(record.xe)}</td>
                                            <td className="px-2 py-2 text-right font-semibold text-blue-600">{formatNumber(record.cash_xe)}</td>
                                            <td className="px-3 py-3 text-center">
                                                {record.is_approved ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle size={12} className="mr-1" />
                                                        Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <AlertCircle size={12} className="mr-1" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalRecords > 0 && (
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
            )}

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Filter Records</h3>
                            <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                <select
                                    name="month"
                                    value={filters.month}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Months</option>
                                    {filterOptions.months.map(month => (
                                        <option key={month} value={month}>{monthNames[month]}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <select
                                    name="year"
                                    value={filters.year}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Years</option>
                                    {filterOptions.years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="is_approved"
                                    value={filters.is_approved}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {filterOptions.statuses.map((status) => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-blue-700">
                                    <strong>Note:</strong> Apply filters to narrow down your records.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                            <button onClick={() => setShowFilterModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserFinanceUpload;