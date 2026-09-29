import React, { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Search,
    User,
    Activity,
    LogIn,
    LogOut,
    Shield,
    Calendar,
    Eye,
    Users,
    Monitor,
    Smartphone,
    Tablet
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

const SystemLogsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState({});
    const [recentActivities, setRecentActivities] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filterOptions, setFilterOptions] = useState({
        users: [],
        actions: [],
        statuses: []
    });

    const [filters, setFilters] = useState({
        user_id: '',
        action: '',
        status: '',
        date_from: '',
        date_to: '',
        search: ''
    });

    const [appliedFilters, setAppliedFilters] = useState({
        user_id: '',
        action: '',
        status: '',
        date_from: '',
        date_to: '',
        search: ''
    });

    const formatDate = (date) => {
        if (!date) return '-';
        return format(new Date(date), 'dd/MM/yyyy HH:mm:ss');
    };

    const formatDuration = (seconds) => {
        const totalSeconds = Math.abs(parseInt(seconds));
        if (isNaN(totalSeconds) || totalSeconds === 0) return '-';

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    const getActionBadge = (action) => {
        const colors = {
            login: 'bg-green-100 text-green-700',
            logout: 'bg-red-100 text-red-700',
            failed_login: 'bg-yellow-100 text-yellow-700'
        };
        return colors[action] || 'bg-gray-100 text-gray-700';
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-700',
            ended: 'bg-blue-100 text-blue-700',
            expired: 'bg-yellow-100 text-yellow-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getDeviceIcon = (device) => {
        switch (device) {
            case 'Desktop': return <Monitor size={16} className="text-gray-500" />;
            case 'Mobile': return <Smartphone size={16} className="text-gray-500" />;
            case 'Tablet': return <Tablet size={16} className="text-gray-500" />;
            default: return <Monitor size={16} className="text-gray-500" />;
        }
    };

    // ---- FIXED FETCHING LOGIC USING useCallback ----
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: entriesPerPage,
                ...appliedFilters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (!params[key] || params[key] === '') delete params[key];
            });

            const response = await apiClient.get('/system-logs', { params });

            if (response.data.success) {
                setLogs(response.data.data || []);
                setTotalRecords(response.data.pagination?.total || 0);
                setLastPage(response.data.pagination?.last_page || 1);
                setSummary(response.data.summary || {});
                setRecentActivities(response.data.recent_activities || []);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to fetch system logs');
        } finally {
            setLoading(false);
        }
    }, [currentPage, entriesPerPage, appliedFilters]);

    const fetchFilterOptions = async () => {
        try {
            const response = await apiClient.get('/system-logs/filter-options');
            if (response.data.success) {
                setFilterOptions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    // Initial Load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchFilterOptions();
        fetchLogs();
    }, [fetchLogs, navigate]); // Dependency on fetchLogs is crucial

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setCurrentPage(1); // Reset to page 1
        setAppliedFilters({ ...filters }); // THIS TRIGGERS THE fetchLogs useCallback
        setShowFilterModal(false);
    };

    const clearFilters = () => {
        const emptyFilters = {
            user_id: '',
            action: '',
            status: '',
            date_from: '',
            date_to: '',
            search: ''
        };
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, search: value }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setAppliedFilters({ ...filters });
    };

    const refreshData = () => {
        fetchLogs();
        toast.success('Data refreshed!');
    };

    const viewDetails = (log) => {
        setSelectedLog(log);
        setShowDetailModal(true);
    };

    const summaryCards = [
        {
            title: 'Total Logs',
            value: summary.total_logs || 0,
            icon: <Activity className="w-6 h-6 text-blue-600" />,
            color: 'bg-blue-50 border-blue-100'
        },
        {
            title: 'Total Logins',
            value: summary.total_logins || 0,
            icon: <LogIn className="w-6 h-6 text-green-600" />,
            color: 'bg-green-50 border-green-100'
        },
        {
            title: 'Total Logouts',
            value: summary.total_logouts || 0,
            icon: <LogOut className="w-6 h-6 text-red-600" />,
            color: 'bg-red-50 border-red-100'
        },
        {
            title: 'Active Sessions',
            value: summary.active_sessions || 0,
            icon: <Users className="w-6 h-6 text-purple-600" />,
            color: 'bg-purple-50 border-purple-100'
        },
        {
            title: 'Today\'s Logins',
            value: summary.today_logins || 0,
            icon: <Calendar className="w-6 h-6 text-orange-600" />,
            color: 'bg-orange-50 border-orange-100'
        }
    ];

    return (
        <>
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
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Shield className="w-7 h-7 text-blue-600" />
                                System Logs
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Track user activities including login and logout times
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {summaryCards.map((card, index) => (
                        <div key={index} className={`rounded-xl border ${card.color} p-3 shadow-sm transition-all duration-300 hover:shadow-md`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600">{card.title}</p>
                                    <p className="text-lg font-bold text-gray-800 mt-1">{card.value}</p>
                                </div>
                                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    ))}
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
                        onClick={refreshData}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm bg-white shadow-sm"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={clearFilters}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm bg-white shadow-sm"
                    >
                        <X size={16} />
                        <span>Clear Filters</span>
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by user name, email, or IP..."
                            value={filters.search}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                        Search
                    </button>
                </form>

                {/* Active Filters Display */}
                {(appliedFilters.user_id || appliedFilters.action || appliedFilters.status || appliedFilters.date_from || appliedFilters.date_to) && (
                    <div className="bg-blue-50 rounded-lg p-3 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
                        {appliedFilters.user_id && filterOptions.users.find(u => u.id == appliedFilters.user_id) && (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                                <User size={12} className="mr-1" />
                                User: {filterOptions.users.find(u => u.id == appliedFilters.user_id)?.name}
                            </span>
                        )}
                        {appliedFilters.action && (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                                Action: {appliedFilters.action}
                            </span>
                        )}
                        {appliedFilters.status && (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                                Status: {appliedFilters.status}
                            </span>
                        )}
                        {appliedFilters.date_from && (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                                From: {formatDate(appliedFilters.date_from)}
                            </span>
                        )}
                        {appliedFilters.date_to && (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                                To: {formatDate(appliedFilters.date_to)}
                            </span>
                        )}
                        <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                            <X size={14} /> Clear All
                        </button>
                    </div>
                )}

                {/* Logs Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 text-left font-semibold text-gray-700">User</th>
                                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Action</th>
                                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Device</th>
                                    <th className="px-3 py-3 text-left font-semibold text-gray-700">IP Address</th>
                                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Login Time</th>
                                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Logout Time</th>
                                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Duration</th>
                                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Status</th>
                                    <th className="px-3 py-3 text-center font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Activity size={40} className="text-gray-300" />
                                                <p>No logs found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-3 py-2">
                                                <div>
                                                    <p className="font-medium text-gray-800">{log.user_name}</p>
                                                    <p className="text-xs text-gray-500">{log.user_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1.5">
                                                    {getDeviceIcon(log.device_type)}
                                                    <span className="text-xs">{log.device_type || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs">{log.ip_address || '-'}</td>
                                            <td className="px-3 py-2 text-xs">{log.login_time ? formatDate(log.login_time) : '-'}</td>
                                            <td className="px-3 py-2 text-xs">{log.logout_time ? formatDate(log.logout_time) : '-'}</td>
                                            <td className="px-3 py-2 text-xs font-medium">{formatDuration(log.session_duration)}</td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    onClick={() => viewDetails(log)}
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
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

                {/* Filter Modal */}
                {showFilterModal && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Filter Logs</h3>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                    <select
                                        name="user_id"
                                        value={filters.user_id}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Users</option>
                                        {filterOptions.users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                                    <select
                                        name="action"
                                        value={filters.action}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Actions</option>
                                        {filterOptions.actions?.map(action => (
                                            <option key={action} value={action}>{action}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Statuses</option>
                                        {filterOptions.statuses?.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                                        <input
                                            type="date"
                                            name="date_from"
                                            value={filters.date_from}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                                        <input
                                            type="date"
                                            name="date_to"
                                            value={filters.date_to}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
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

                {/* Detail Modal */}
                {showDetailModal && selectedLog && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Log Details</h3>
                                <button
                                    onClick={() => { setShowDetailModal(false); setSelectedLog(null); }}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">User</p>
                                        <p className="text-sm font-medium text-gray-800">{selectedLog.user_name}</p>
                                        <p className="text-xs text-gray-500">{selectedLog.user_email}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Role</p>
                                        <p className="text-sm font-medium text-gray-800">{selectedLog.user_role}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Action</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(selectedLog.action)}`}>
                                            {selectedLog.action}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Status</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedLog.status)}`}>
                                            {selectedLog.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">IP Address</p>
                                    <p className="text-sm font-medium text-gray-800">{selectedLog.ip_address || '-'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Login Time</p>
                                        <p className="text-sm font-medium text-gray-800">{formatDate(selectedLog.login_time)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Logout Time</p>
                                        <p className="text-sm font-medium text-gray-800">{formatDate(selectedLog.logout_time)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Session Duration</p>
                                        <p className="text-sm font-medium text-gray-800">{formatDuration(selectedLog.session_duration)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Device</p>
                                        <p className="text-sm font-medium text-gray-800">{selectedLog.device_type || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Browser</p>
                                        <p className="text-sm font-medium text-gray-800">{selectedLog.browser || '-'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Platform</p>
                                    <p className="text-sm font-medium text-gray-800">{selectedLog.platform || '-'}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => { setShowDetailModal(false); setSelectedLog(null); }}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SystemLogsPage;