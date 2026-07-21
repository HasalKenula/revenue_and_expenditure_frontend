
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
    Users,
    CheckCircle,
    AlertCircle,
    UserCheck,
    UserX,
    FileSpreadsheet,
    Trash2,
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

const ExpenditureManagerApproval = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [userSummary, setUserSummary] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [processing, setProcessing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUsername, setSelectedUsername] = useState(null);
    const [totals, setTotals] = useState({
        total_records: 0,
        pending_count: 0,
        approved_count: 0,
    });

    // Delete modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState('unapproved');
    const [deleting, setDeleting] = useState(false);

    const [filters, setFilters] = useState({
        username: '',
        month: '',
        year: '',
        is_approved: '',
    });

    const [appliedFilters, setAppliedFilters] = useState({
        username: '',
        month: '',
        year: '',
        is_approved: '',
    });

    const [filterOptions, setFilterOptions] = useState({
        users: [],
        months: [],
        years: [],
        statuses: [
            { value: '', label: 'All Status' },
            { value: '0', label: 'Pending' },
            { value: '1', label: 'Approved' }
        ]
    });

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
        fetchFilterOptions();
    }, []);

    const fetchFilterOptions = async () => {
        try {
            const response = await apiClient.get('/user-monthly-finance/filter-options');
            if (response.data.success) {
                setFilterOptions({
                    users: response.data.data.users || [],
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
            setFilterOptions(prev => ({
                ...prev,
                years: [new Date().getFullYear()],
                months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            }));
        }
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: entriesPerPage,
            };

            if (selectedUsername) {
                params.username = selectedUsername;
            } else if (appliedFilters.username) {
                params.username = appliedFilters.username;
            }

            if (appliedFilters.month) params.month = appliedFilters.month;
            if (appliedFilters.year) params.year = appliedFilters.year;
            if (appliedFilters.is_approved !== '') params.is_approved = appliedFilters.is_approved;

            const response = await apiClient.get('/user-monthly-finance/all-users-data', { params });

            if (response.data.success) {
                setRecords(response.data.data);
                setTotalRecords(response.data.pagination.total);
                setLastPage(response.data.pagination.last_page);
                setTotals(response.data.totals || {
                    total_records: 0,
                    pending_count: 0,
                    approved_count: 0,
                });
                setUserSummary(response.data.user_summary || []);
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
        fetchRecords();
    }, [currentPage, entriesPerPage, appliedFilters, selectedUsername]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters({ ...filters });
        setSelectedUsername(null);
        setShowFilterModal(false);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        // Reset all filters
        setFilters({ username: '', month: '', year: '', is_approved: '' });
        setAppliedFilters({ username: '', month: '', year: '', is_approved: '' });
        setSelectedUsername(null);
        setCurrentPage(1);
        setSelectedIds([]);
        // Fetch records after clearing filters
        fetchRecords();
    };

    const clearUserFilter = () => {
        setSelectedUsername(null);
        setAppliedFilters(prev => ({ ...prev, username: '' }));
        setCurrentPage(1);
        setSelectedIds([]);
        fetchRecords();
    };

    const handleUserCardClick = (user) => {
        if (selectedUsername === user.username) {
            clearUserFilter();
        } else {
            setSelectedUsername(user.username);
            // Clear other filters when selecting from card
            setAppliedFilters(prev => ({ ...prev, username: user.username }));
            setCurrentPage(1);
            setSelectedIds([]);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this record?')) return;

        setProcessing(true);
        try {
            const response = await apiClient.post(`/user-monthly-finance/approve/${id}`);
            if (response.data.success) {
                setMessage('Record approved successfully!');
                setMessageType('success');
                fetchRecords();
                setSelectedIds([]);
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Approval error:', error);
            setMessage(error.response?.data?.message || 'Approval failed');
            setMessageType('error');
        } finally {
            setProcessing(false);
        }
    };

    const handleApproveSelected = async () => {
        if (selectedIds.length === 0) {
            setMessage('Please select at least one record to approve');
            setMessageType('error');
            return;
        }

        if (!window.confirm(`Are you sure you want to approve ${selectedIds.length} record(s)?`)) return;

        setProcessing(true);
        try {
            const response = await apiClient.post('/user-monthly-finance/approve-multiple', {
                ids: selectedIds
            });

            if (response.data.success) {
                setMessage(response.data.message);
                setMessageType('success');
                fetchRecords();
                setSelectedIds([]);
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Approval error:', error);
            setMessage(error.response?.data?.message || 'Approval failed');
            setMessageType('error');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteUserData = async (userId, type = 'unapproved') => {
        const confirmMessage = type === 'all'
            ? `Are you sure you want to delete ALL data for User ${userId}? This includes both approved and unapproved records.`
            : `Are you sure you want to delete ALL UNAPPROVED data for User ${userId}?`;

        if (!window.confirm(confirmMessage)) return;

        setDeleting(true);
        try {
            const endpoint = type === 'all'
                ? `/user-monthly-finance/delete-user-data/${userId}`
                : `/user-monthly-finance/delete-unapproved-user-data/${userId}`;

            const response = await apiClient.delete(endpoint);

            if (response.data.success) {
                setMessage(response.data.message);
                setMessageType('success');
                setShowDeleteModal(false);
                setUserToDelete(null);
                fetchRecords();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Delete error:', error);
            setMessage(error.response?.data?.message || 'Delete failed');
            setMessageType('error');
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectAll = (e) => {
        const pendingRecords = records.filter(r => !r.is_approved);
        if (e.target.checked) {
            setSelectedIds(pendingRecords.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
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
            doc.setTextColor(142, 68, 173);
            doc.text('Expenditure Manager - User Finance Report', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 28, { align: 'center' });
            doc.text(`Manager: ${userName} (${userRole})`, pageWidth / 2, 36, { align: 'center' });
            if (selectedUsername) {
                doc.text(`Filtered by User: ${selectedUsername}`, pageWidth / 2, 44, { align: 'center' });
            }

            doc.setDrawColor(200, 200, 200);
            doc.line(15, 50, pageWidth - 15, 50);

            const tableHeaders = ['#', 'User', 'Subject', 'TRNO', 'Month', 'Cash', 'XE', 'Total', 'Status'];

            const tableBody = records.map((record, index) => [
                (currentPage - 1) * entriesPerPage + index + 1,
                record.username || `User ${record.user_id}`,
                record.subject || '-',
                record.trno || '-',
                record.month ? monthNames[record.month] || record.month : '-',
                formatNumber(record.cash),
                formatNumber(record.xe),
                formatNumber(record.cash_xe),
                record.is_approved ? 'Approved' : 'Pending'
            ]);

            autoTable(doc, {
                head: [tableHeaders],
                body: tableBody,
                startY: 55,
                theme: 'striped',
                headStyles: {
                    fillColor: [142, 68, 173],
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

            const fileName = `expenditure_manager_approval_report${selectedUsername ? '_user_' + selectedUsername : ''}.pdf`;
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className=" rounded-xl shadow-lg p-6 ">
                <div className="flex justify-between items-start flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Users size={24} />
                            Expenditure Manager - Approval Dashboard
                        </h1>
                       
                        {selectedUsername && (
                            <p className="text-yellow-700 text-sm mt-1">
                                Filtering by User: {selectedUsername}
                                <button
                                    onClick={clearUserFilter}
                                    className="ml-2 text-white underline hover:text-yellow-200"
                                >
                                    Clear Filter
                                </button>
                            </p>
                        )}
                    </div>
                    {appliedFilters.username || appliedFilters.month || appliedFilters.year || appliedFilters.is_approved !== '' ? (
                        <div className="bg-purple-200 rounded-lg px-3 py-2">
                            <p className="text-sm ">
                                {appliedFilters.username && <span>User: {appliedFilters.username}</span>}
                                {appliedFilters.month && <span className="ml-2">Month: {monthNames[appliedFilters.month]}</span>}
                                {appliedFilters.year && <span className="ml-2">Year: {appliedFilters.year}</span>}
                                {appliedFilters.is_approved !== '' && <span className="ml-2">Status: {appliedFilters.is_approved === '0' ? 'Pending' : 'Approved'}</span>}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-purple-200 rounded-lg px-3 py-2">
                            <p className="text-sm ">Showing {selectedUsername ? `records for User ${selectedUsername}` : 'all records'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`p-4 rounded-lg flex items-start space-x-3 ${messageType === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    {messageType === 'success' ? (
                        <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm">{message}</span>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Total Records</p>
                    <p className="text-xl font-bold text-blue-600">{totals.total_records}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Pending Approval</p>
                    <p className="text-xl font-bold text-yellow-600">{totals.pending_count}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Approved</p>
                    <p className="text-xl font-bold text-green-600">{totals.total_records - totals.pending_count}</p>
                </div>
            </div>

            {/* User Summary Cards - Clickable */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userSummary.length === 0 ? (
                    <div className="col-span-full text-center py-4 text-gray-500">
                        No user data available
                    </div>
                ) : (
                    userSummary.map((user) => (
                        <div
                            key={user.user_id}
                            className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition ${selectedUsername === user.username
                                ? 'border-purple-500 shadow-lg ring-2 ring-purple-300'
                                : 'border-gray-200'
                                }`}
                        >
                            <div
                                onClick={() => handleUserCardClick(user)}
                                className="cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                            {user.username ? user.username : `User ${user.user_id}`}
                                        </p>
                                        <p className="text-xs text-gray-500">Total: {user.total}</p>
                                        <p className="text-xs text-gray-500">Pending: {user.pending} | Approved: {user.approved}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs ${user.pending > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.pending > 0 ? `${user.pending} pending` : 'All approved'}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Approved: {user.approved}</span>
                                    <span className="text-gray-500">Cash: Rs {formatNumber(user.total_cash || 0)}</span>
                                </div>
                                {selectedUsername === user.username && (
                                    <div className="mt-2 text-center">
                                        <span className="text-xs text-purple-600 font-medium">✓ Selected</span>
                                    </div>
                                )}
                            </div>
                            {/* Delete Buttons */}
                            <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2">
                                <button
                                    onClick={() => {
                                        setUserToDelete(user);
                                        setDeleteType('unapproved');
                                        setShowDeleteModal(true);
                                    }}
                                    disabled={user.pending === 0}
                                    className={`flex-1 text-xs px-2 py-1 rounded ${user.pending > 0
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        } transition`}
                                >
                                    Delete Pending
                                </button>
                                <button
                                    onClick={() => {
                                        setUserToDelete(user);
                                        setDeleteType('all');
                                        setShowDeleteModal(true);
                                    }}
                                    className="flex-1 text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
                                >
                                    Monthly access
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm shadow-sm"
                >
                    <Filter size={16} />
                    <span>Filter</span>
                </button>
                {selectedUsername && (
                    <button
                        onClick={clearUserFilter}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm shadow-sm"
                    >
                        <X size={16} />
                        <span>Clear User Filter</span>
                    </button>
                )}
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleApproveSelected}
                        disabled={processing}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm shadow-sm disabled:opacity-50"
                    >
                        <UserCheck size={16} />
                        <span>Approve Selected ({selectedIds.length})</span>
                    </button>
                )}
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
                    onClick={() => { fetchRecords(); fetchFilterOptions(); }}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm bg-white shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
                <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm shadow-sm"
                >
                    <X size={16} />
                    <span>Clear All Filters</span>
                </button>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-3 text-center w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === records.filter(r => !r.is_approved).length && records.filter(r => !r.is_approved).length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        disabled={records.filter(r => !r.is_approved).length === 0}
                                    />
                                </th>
                                <th className="px-3 py-3 text-left font-semibold text-gray-700">#</th>
                                <th className="px-3 py-3 text-left font-semibold text-gray-700">User</th>
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
                                <th className="px-3 py-3 text-center font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileSpreadsheet size={40} className="text-gray-300" />
                                            <p>No records found</p>
                                            {selectedUsername && (
                                                <p className="text-sm text-gray-400">
                                                    No records found for User {selectedUsername}
                                                    <button
                                                        onClick={clearUserFilter}
                                                        className="ml-2 text-purple-600 underline"
                                                    >
                                                        Clear filter
                                                    </button>
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((record, index) => (
                                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-3 py-3 text-center">
                                            {!record.is_approved && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(record.id)}
                                                    onChange={() => handleSelectRow(record.id)}
                                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                />
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-gray-500">
                                            {(currentPage - 1) * entriesPerPage + index + 1}
                                        </td>
                                        <td className="px-3 py-3 text-gray-700 font-medium">
                                            {record.username || `User ${record.user_id}`}
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
                                        <td className="px-3 py-3 text-center">
                                            {!record.is_approved ? (
                                                <button
                                                    onClick={() => handleApprove(record.id)}
                                                    disabled={processing}
                                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                            ): (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-yellow-800">
                                                    <AlertCircle size={12} className="mr-1" />
                                                    Done
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
                                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Allow To Upload the Summary</h3>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className={`border rounded-lg p-4 ${deleteType === 'all'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-yellow-50 border-yellow-200'
                                }`}>
                                <p className={`text-sm ${deleteType === 'all' ? 'text-red-700' : 'text-yellow-700'
                                    }`}>
                                    <strong>Warning:</strong> You are about to  {deleteType === 'all' ? 'give access to Upload next month' : 'delete ALL UNAPPROVED data and give access to Upload data again'} data for
                                </p>
                                <p className={`text-sm font-bold mt-1 ${deleteType === 'all' ? 'text-red-800' : 'text-yellow-800'
                                    }`}>
                                    {userToDelete.username ? userToDelete.username : `User ${userToDelete.user_id}`}
                                </p>
                                {deleteType === 'all' && userToDelete.approved > 0 && (
                                    <p className="text-xs text-red-600 mt-2">
                                        This user has {userToDelete.approved} approved record(s). They will also be DELETED.
                                    </p>
                                )}
                                {deleteType === 'unapproved' && userToDelete.approved > 0 && (
                                    <p className="text-xs text-yellow-600 mt-2">
                                        This user has {userToDelete.approved} approved record(s). They will NOT be deleted.
                                        Only unapproved records will be removed.
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600">
                                    <strong>Records to delete:</strong> {deleteType === 'all' ? userToDelete.total : userToDelete.pending} record(s)
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    <strong>User ID:</strong> {userToDelete.user_id}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    <strong>Username:</strong> {userToDelete.username || 'N/A'}
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setUserToDelete(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteUserData(userToDelete.user_id, deleteType)}
                                    disabled={deleting}
                                    className={`px-4 py-2 rounded-lg transition disabled:opacity-50 ${deleteType === 'all'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                        }`}
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Confirm Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                <select
                                    name="username"
                                    value={filters.username}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">All Users</option>
                                    {filterOptions.users.map((user) => (
                                        <option key={user.value} value={user.value}>
                                            {user.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                <select
                                    name="month"
                                    value={filters.month}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {filterOptions.statuses.map((status) => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-xs text-purple-700">
                                    <strong>Note:</strong> Apply filters to narrow down records by user, month, year, or status.
                                    You can also click on user cards to filter by specific user.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                            <button onClick={() => setShowFilterModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Reset filters without applying
                                    setFilters({ username: '', month: '', year: '', is_approved: '' });
                                    setShowFilterModal(false);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Reset
                            </button>
                            <button onClick={applyFilters} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenditureManagerApproval;