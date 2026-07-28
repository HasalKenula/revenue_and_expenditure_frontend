
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
    DollarSign
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// Default account numbers to be pre-selected
const DEFAULT_ACCOUNTS = [
    '013-2-001-6-0011618',
    '014100170003265',
    '71353540',
    '93324673',
    '95609366',
    '013200130055977'
];

const RevenueReceiptsInCashSummary = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [grandTotalOverall, setGrandTotalOverall] = useState(0);
    const [allAccounts, setAllAccounts] = useState([]);

    const [filters, setFilters] = useState({
        year: '',
        selected_accounts: DEFAULT_ACCOUNTS
    });

    const [appliedFilters, setAppliedFilters] = useState({
        year: '',
        selected_accounts: []
    });

    const [filterOptions, setFilterOptions] = useState({
        years: [],
        accounts: []
    });

    // Format number with commas
    const formatNumber = (value) => {
        if (value === undefined || value === null) return '0.00';
        return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        if (!appliedFilters.year || appliedFilters.selected_accounts.length === 0) {
            setRecords([]);
            setGrandTotalOverall(0);
            return;
        }

        setLoading(true);
        try {
            const params = {
                year: appliedFilters.year,
                selected_accounts: appliedFilters.selected_accounts
            };

            const response = await apiClient.get('/revenue-receipts-in-cash-summary/data', { params });

            if (response.data.success) {
                const data = response.data.data;
                setRecords(data.records || []);
                setGrandTotalOverall(data.grand_total_overall || 0);

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
            const response = await apiClient.get('/revenue-receipts-in-cash-summary/filter-options');

            if (response.data.success) {
                setFilterOptions(response.data.data);
                setAllAccounts(response.data.data.accounts || []);
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
        if (appliedFilters.year && appliedFilters.selected_accounts.length > 0) {
            fetchRecords();
        }
    }, [appliedFilters]);

    // Initial load - fetch filter options
    useEffect(() => {
        fetchFilterOptions();
    }, []);

    // Auto-apply filters when filter options are loaded and default accounts exist
    useEffect(() => {
        if (filterOptions.accounts.length > 0 && appliedFilters.selected_accounts.length === 0 && !appliedFilters.year) {
            const availableDefaultAccounts = DEFAULT_ACCOUNTS.filter(account =>
                filterOptions.accounts.includes(account)
            );

            if (availableDefaultAccounts.length > 0) {
                setAppliedFilters(prev => ({
                    ...prev,
                    selected_accounts: availableDefaultAccounts
                }));

                setFilters(prev => ({
                    ...prev,
                    selected_accounts: availableDefaultAccounts
                }));
            }
        }
    }, [filterOptions.accounts]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAccountSelection = (account) => {
        setFilters(prev => {
            const currentAccounts = prev.selected_accounts || [];
            if (currentAccounts.includes(account)) {
                return {
                    ...prev,
                    selected_accounts: currentAccounts.filter(a => a !== account)
                };
            } else {
                return {
                    ...prev,
                    selected_accounts: [...currentAccounts, account]
                };
            }
        });
    };

    const handleSelectAllAccounts = () => {
        setFilters(prev => ({
            ...prev,
            selected_accounts: [...allAccounts]
        }));
    };

    const handleClearAllAccounts = () => {
        setFilters(prev => ({
            ...prev,
            selected_accounts: []
        }));
    };

    const applyFilters = () => {
        if (!filters.year) {
            alert('Please select a Year');
            return;
        }
        if (!filters.selected_accounts || filters.selected_accounts.length === 0) {
            alert('Please select at least one Account');
            return;
        }
        setAppliedFilters({ ...filters });
        setShowFilterModal(false);
    };

    const clearFilters = () => {
        setFilters({
            year: '',
            selected_accounts: DEFAULT_ACCOUNTS
        });
        setAppliedFilters({ year: '', selected_accounts: [] });
        setRecords([]);
        setGrandTotalOverall(0);
        setCurrentPage(1);
        setTotalRecords(0);
        setLastPage(1);
    };

    // Generate PDF Report with Account Number and Total
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

            const currentDate = new Date().toLocaleString();

            // Add Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Revenue Receipts In Cash Summary', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Year: ${appliedFilters.year}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
            doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });

            // Table Headers
            const headers = ['Account Number', 'Total (All 12 Months)'];

            // Table Data
            const tableData = records.map(record => {
                return [record.account_number, formatNumber(record.total)];
            });

            // Add grand total row
            tableData.push(['GRAND TOTAL', formatNumber(grandTotalOverall)]);

            // Generate table
            autoTable(doc, {
                head: [headers],
                body: tableData,
                startY: 37,
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center',
                    cellPadding: 3
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 3,
                    fontStyle: 'normal',
                    textColor: [0, 0, 0],
                },
                columnStyles: {
                    0: { cellWidth: 100, halign: 'left' },
                    1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 37, left: 20, right: 20 },
                tableWidth: 170,
                rowStyles: {
                    [tableData.length - 1]: {
                        fontStyle: 'bold',
                        fillColor: [44, 62, 80],
                        textColor: [255, 255, 255],
                        fontSize: 10
                    }
                }
            });

            // Add footer
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

            doc.save(`revenue_receipts_in_cash_summary_${appliedFilters.year}.pdf`);
            alert('PDF exported successfully!');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Export CSV - Direct Download
    const handleExportCSV = async () => {
        if (records.length === 0) {
            alert('No data to export');
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('year', appliedFilters.year);
            params.append('selected_accounts', JSON.stringify(appliedFilters.selected_accounts));

            const response = await apiClient.get(`/revenue-receipts-in-cash-summary/export?${params.toString()}`, {
                responseType: 'blob'
            });

            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/json')) {
                const text = await response.data.text();
                const errorData = JSON.parse(text);
                alert('Error: ' + (errorData.message || 'Export failed'));
                return;
            }

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `revenue_receipts_in_cash_summary_${appliedFilters.year}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert('Export completed successfully!');
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error exporting data: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const refreshData = () => {
        fetchFilterOptions();
        if (appliedFilters.year && appliedFilters.selected_accounts.length > 0) {
            fetchRecords();
        }
    };

    // Paginated records
    const paginatedRecords = records.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

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
                        <h1 className="text-2xl font-bold text-gray-800">Revenue Receipts In Cash Summary</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View revenue receipts summary with account number and total amount
                        </p>
                        {appliedFilters.year && appliedFilters.selected_accounts.length > 0 && (
                            <p className="text-sm text-blue-600 mt-1">
                                Showing {records.length} record(s) for {appliedFilters.year} with {appliedFilters.selected_accounts.length} selected account(s)
                            </p>
                        )}
                    </div>
                    {appliedFilters.year && (
                        <div className="bg-blue-50 rounded-lg px-3 py-2">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Year:</span> {appliedFilters.year}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {appliedFilters.year && records.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                        <p className="text-sm opacity-90">Total Records</p>
                        <p className="text-xl font-bold mt-1">{records.length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                        <p className="text-sm opacity-90">Total Revenue</p>
                        <p className="text-xl font-bold mt-1">Rs{formatNumber(grandTotalOverall)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                        <p className="text-sm opacity-90">Selected Accounts</p>
                        <p className="text-xl font-bold mt-1">{appliedFilters.selected_accounts.length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
                        <p className="text-sm opacity-90">Average per Record</p>
                        <p className="text-xl font-bold mt-1">Rs{records.length > 0 ? formatNumber(grandTotalOverall / records.length) : '0.00'}</p>
                    </div>
                </div>
            )}

            {/* Active Filters Display */}
            {appliedFilters.year && appliedFilters.selected_accounts.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
                        {appliedFilters.year && (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                                <Calendar size={12} className="mr-1" />
                                Year: {appliedFilters.year}
                            </span>
                        )}
                        {appliedFilters.selected_accounts.length > 0 && (
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                              
                                {appliedFilters.selected_accounts.length} Account(s) Selected
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
                    disabled={!appliedFilters.year || appliedFilters.selected_accounts.length === 0}
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
                                <th className="px-6 py-3 text-left font-semibold text-gray-700 min-w-[300px]">
                                    Account Number
                                </th>
                                <th className="px-6 py-3 text-right font-semibold min-w-[150px]">
                                    Total (All 12 Months)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {!appliedFilters.year || appliedFilters.selected_accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Filter size={40} className="text-gray-300" />
                                            <p>Please select a Year and Account(s) to view data</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="text-center py-12 text-gray-500">
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
                                    const isOther = record.account_number === 'Repop & Fixed';
                                    const bgColor = isOther ? 'bg-yellow-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50');

                                    return (
                                        <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 transition ${bgColor}`}>
                                            <td className={`px-6 py-3 font-medium ${isOther ? 'text-orange-700' : 'text-blue-700'}`}>
                                                {record.account_number}
                                            </td>
                                            <td className={`px-6 py-3 text-right font-bold`}>
                                                {formatNumber(record.total)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {paginatedRecords.length > 0 && (
                            <tfoot className=" border-t border-gray-700">
                                <tr>
                                    <td className="px-6 py-3 text-right font-bold ">
                                        GRAND TOTAL
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold ">
                                        {formatNumber(grandTotalOverall)}
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
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Filter Revenue Receipts Summary</h3>
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
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select Accounts <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSelectAllAccounts}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={handleClearAllAccounts}
                                            className="text-xs text-red-600 hover:text-red-800"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                                <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {filterOptions.accounts.map((account) => {
                                            const isDefault = DEFAULT_ACCOUNTS.includes(account);
                                            return (
                                                <label
                                                    key={account}
                                                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${isDefault ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={(filters.selected_accounts || []).includes(account)}
                                                        onChange={() => handleAccountSelection(account)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className={`text-sm ${isDefault ? 'text-blue-700 font-medium' : 'text-gray-700'} font-mono`}>
                                                        {account}
                                                        {isDefault && ' (default)'}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {filterOptions.accounts.length === 0 && (
                                        <p className="text-center text-gray-500 py-4">No accounts available</p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Selected: {(filters.selected_accounts || []).length} account(s)
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Default accounts are pre-selected: {DEFAULT_ACCOUNTS.join(', ')}
                                </p>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-blue-700">
                                    <strong>Report:</strong> Revenue Receipts In Cash Summary
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    <strong>Columns:</strong> Account Number, Total (All 12 Months)
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    <strong>Note:</strong> "Repop & Fixed" row shows total of all other accounts not selected
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
                                disabled={!filters.year || !filters.selected_accounts || filters.selected_accounts.length === 0}
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

export default RevenueReceiptsInCashSummary;