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
    Wallet,
    MinusCircle,
    Building2,
    PercentCircle,
    TrendingUp as TrendingUpIcon,
    FileText
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

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

const NetExpenditurePercentageReport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [totals, setTotals] = useState({
        total_allocation: 0,
        total_fr66p: 0,
        total_fr66m: 0,
        total_supplementary: 0,
        total_net_allocation: 0,
        total_cumulative_expenditure: 0,
        total_balance: 0,
        total_percentage_with_allocation: 0,
        total_percentage_with_net_allocation: 0,
        total_perfect_percentage_with_allocation: 0,
        total_perfect_percentage_with_net_allocation: 0
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
        months: []
    });

    // Format number with commas
    const formatNumber = (value) => {
        if (value === undefined || value === null) return '0.00';
        return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Format percentage
    const formatPercentage = (value) => {
        if (value === undefined || value === null) return '0.00';
        return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
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
        if (!appliedFilters.head) return;

        setLoading(true);
        try {
            const params = { ...appliedFilters };

            Object.keys(params).forEach(key => {
                if (!params[key] || params[key] === '') delete params[key];
            });

            const response = await apiClient.get('/net-expenditure-percentage/data', { params });

            if (response.data.success) {
                setRecords(response.data.data.records || []);
                setTotals(response.data.data.totals || {
                    total_allocation: 0,
                    total_fr66p: 0,
                    total_fr66m: 0,
                    total_supplementary: 0,
                    total_net_allocation: 0,
                    total_cumulative_expenditure: 0,
                    total_balance: 0,
                    total_percentage_with_allocation: 0,
                    total_percentage_with_net_allocation: 0,
                    total_perfect_percentage_with_allocation: 0,
                    total_perfect_percentage_with_net_allocation: 0
                });

                const total = response.data.data.records?.length || 0;
                setTotalRecords(total);
                setLastPage(Math.ceil(total / entriesPerPage));
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            if (error.response?.status !== 401) {
                toast.error('Failed to fetch records: ' + (error.response?.data?.message || error.message));
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

            const response = await apiClient.get('/net-expenditure-percentage/filter-options', { params });

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
        if (!filters.head) {
            toast.error('Please select a TR No (Head) to search');
            return;
        }
        setAppliedFilters({ ...filters });
        setTimeout(() => fetchRecords(), 100);
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
            total_net_allocation: 0,
            total_cumulative_expenditure: 0,
            total_balance: 0,
            total_percentage_with_allocation: 0,
            total_percentage_with_net_allocation: 0,
            total_perfect_percentage_with_allocation: 0,
            total_perfect_percentage_with_net_allocation: 0
        });
        setCurrentPage(1);
        setTotalRecords(0);
        setLastPage(1);
    };

    // Generate PDF Report
    const handleExportPDF = () => {
        if (records.length === 0) {
            toast.error('No data to export');
            return;
        }

        setLoading(true);

        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a3'
            });

            const currentDate = new Date().toLocaleString();

            // Add Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Net Expenditure with Percentage Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

            let filterText = `Head : ${appliedFilters.head || 'All'}`;
            if (appliedFilters.program) filterText += ` | Program: ${appliedFilters.program}`;
            if (appliedFilters.project) filterText += ` | Project: ${appliedFilters.project}`;
            if (appliedFilters.month) filterText += ` | Month: ${monthNames[appliedFilters.month]} (Cumulative)`;

            doc.setFontSize(9);
            doc.text(filterText, doc.internal.pageSize.getWidth() / 2, 29, { align: 'center' });

            // Prepare table data
            const tableBody = records.map(record => [
                record.object,
                record.subproject || '-',
                formatNumber(record.allocation),
                formatNumber(record.fr66p),
                formatNumber(record.fr66m),
                formatNumber(record.supplementary),
                formatNumber(record.net_allocation),
                formatNumber(record.cumulative_expenditure),
                formatNumber(record.balance),
                formatPercentage(record.percentage_with_allocation),
                formatPercentage(record.percentage_with_net_allocation),
                formatNumber(record.perfect_percentage_with_allocation),
                formatNumber(record.perfect_percentage_with_net_allocation)
            ]);

            // Add totals row
            tableBody.push([
                'TOTAL',
                '',
                formatNumber(totals.total_allocation),
                formatNumber(totals.total_fr66p),
                formatNumber(totals.total_fr66m),
                formatNumber(totals.total_supplementary),
                formatNumber(totals.total_net_allocation),
                formatNumber(totals.total_cumulative_expenditure),
                formatNumber(totals.total_balance),
                formatPercentage(totals.total_percentage_with_allocation),
                formatPercentage(totals.total_percentage_with_net_allocation),
                formatNumber(totals.total_perfect_percentage_with_allocation),
                formatNumber(totals.total_perfect_percentage_with_net_allocation)
            ]);

            // Define table headers
            const tableHeaders = [
                'Object',
                'Sub Project',
                'Allocation',
                'FR66P',
                'FR66M',
                'Supplementary',
                'Net Allocation',
                'Cumulative Exp.',
                'Balance',
                '% with Allocation',
                '% with Net Allocation',
                'Perfect % with Allocation',
                'Perfect % with Net Allocation'
            ];

            // Generate table
            autoTable(doc, {
                head: [tableHeaders],
                body: tableBody,
                startY: 35,
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255],
                    fontSize: 7,
                    fontStyle: 'bold',
                    halign: 'center',
                    cellPadding: 2
                },
                bodyStyles: {
                    fontSize: 6,
                    cellPadding: 2,
                    textColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { cellWidth: 18 },
                    1: { cellWidth: 22 },
                    2: { cellWidth: 24, halign: 'right' },
                    3: { cellWidth: 20, halign: 'right' },
                    4: { cellWidth: 20, halign: 'right' },
                    5: { cellWidth: 24, halign: 'right' },
                    6: { cellWidth: 24, halign: 'right' },
                    7: { cellWidth: 28, halign: 'right' },
                    8: { cellWidth: 22, halign: 'right' },
                    9: { cellWidth: 28, halign: 'right' },
                    10: { cellWidth: 32, halign: 'right' },
                    11: { cellWidth: 34, halign: 'right' },
                    12: { cellWidth: 38, halign: 'right' }
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 35, left: 10, right: 10 },
                didDrawPage: function (data) {
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
                }
            });

            doc.save(`net_expenditure_percentage_${appliedFilters.head}_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("PDF exported successfully!");

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error("Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        if (records.length === 0) {
            toast.error('No data to export');
            return;
        }

        setLoading(true);
        try {
            const params = { ...appliedFilters };
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await apiClient.get('/net-expenditure-percentage/export', { params });

            if (response.data.success) {
                const csvData = response.data.data;
                if (csvData && csvData.length > 0) {
                    const headers = Object.keys(csvData[0]);
                    const csvRows = [
                        headers.join(','),
                        ...csvData.map(row => headers.map(h => {
                            const value = row[h];
                            if (value === null || value === undefined || value === '') {
                                return '""';
                            }
                            if (value === 0) {
                                return '0';
                            }
                            if (typeof value === 'number') {
                                if (Number.isInteger(value)) {
                                    return value.toString();
                                }
                                return value.toFixed(2);
                            }
                            return `"${value.toString().replace(/"/g, '""')}"`;
                        }).join(','))
                    ];

                    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(csvBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `net-expenditure-percentage-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("CSV exported successfully!");
                } else {
                    toast.error("Failed to generate CSV");
                }
            } else {
                toast.error("Failed to generate CSV");
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error("Failed to generate CSV");
        } finally {
            setLoading(false);
        }
    };

    const refreshData = () => {
        if (appliedFilters.head) {
            fetchRecords();
        }
        fetchFilterOptions();
    };

    const paginatedRecords = records.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

    const getMonthDisplay = (month) => {
        if (!month) return '';
        return monthNames[month] ? `${monthNames[month]}` : `Month ${month}`;
    };

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
                            <h1 className="text-2xl font-bold text-gray-800">Net Expenditure with Percentage Report</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                View net allocation with cumulative expenditure and percentage analysis
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
                                    {getMonthDisplay(appliedFilters.month)} (Cumulative)
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
                        disabled={!appliedFilters.head}
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Records Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border border-gray-300">Object</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border border-gray-300">Sub Project</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">Allocation</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">FR66P</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">FR66M</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">Supplementary</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">Net Allocation</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">Cumulative Exp.</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">Balance</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300 bg-blue-50">% with Allocation</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300 bg-green-50">% with Net Allocation</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300 bg-purple-50">Perfect % with Allocation</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300 bg-orange-50">Perfect % with Net Allocation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!appliedFilters.head ? (
                                    <tr>
                                        <td colSpan="13" className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter size={40} className="text-gray-300" />
                                                <p>Please click the Filter button and select a TR No to view data</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="text-center py-12 text-gray-500">
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
                                            <td className="px-2 py-2 font-medium text-gray-900 border border-gray-300">{record.object}</td>
                                            <td className="px-2 py-2 text-gray-600 border border-gray-300">{record.subproject || '-'}</td>
                                            <td className="px-2 py-2 text-right text-gray-900 border border-gray-300">{formatNumber(record.allocation)}</td>
                                            <td className="px-2 py-2 text-right text-gray-600 border border-gray-300">{formatNumber(record.fr66p)}</td>
                                            <td className="px-2 py-2 text-right text-gray-600 border border-gray-300">{formatNumber(record.fr66m)}</td>
                                            <td className="px-2 py-2 text-right text-gray-600 border border-gray-300">{formatNumber(record.supplementary)}</td>
                                            <td className="px-2 py-2 text-right font-bold text-gray-600 border border-gray-300">{formatNumber(record.net_allocation)}</td>
                                            <td className="px-2 py-2 text-right font-bold text-gray-600 border border-gray-300">{formatNumber(record.cumulative_expenditure)}</td>
                                            <td className={`px-2 py-2 text-right font-bold border border-gray-300 ${parseFloat(record.balance) >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
                                                {formatNumber(record.balance)}
                                            </td>
                                            <td className="px-2 py-2 text-right font-bold text-blue-600 border border-gray-300 bg-blue-50">
                                                {formatPercentage(record.percentage_with_allocation)}
                                            </td>
                                            <td className="px-2 py-2 text-right font-bold text-green-600 border border-gray-300 bg-green-50">
                                                {formatPercentage(record.percentage_with_net_allocation)}
                                            </td>
                                            <td className="px-2 py-2 text-right font-bold text-purple-600 border border-gray-300 bg-purple-50">
                                                {formatNumber(record.perfect_percentage_with_allocation)}
                                            </td>
                                            <td className="px-2 py-2 text-right font-bold text-orange-600 border border-gray-300 bg-orange-50">
                                                {formatNumber(record.perfect_percentage_with_net_allocation)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {paginatedRecords.length > 0 && (
                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                    <tr className="font-semibold">
                                        <td colSpan="2" className="px-2 py-2 text-right border border-gray-300">Total:</td>
                                        <td className="px-2 py-2 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_allocation)}</td>
                                        <td className="px-2 py-2 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_fr66p)}</td>
                                        <td className="px-2 py-2 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_fr66m)}</td>
                                        <td className="px-2 py-2 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_supplementary)}</td>
                                        <td className="px-2 py-2 text-right font-bold text-gray-600 border border-gray-300">{formatNumber(totals.total_net_allocation)}</td>
                                        <td className="px-2 py-2 text-right font-bold text-gray-600 border border-gray-300">{formatNumber(totals.total_cumulative_expenditure)}</td>
                                        <td className={`px-2 py-2 text-right font-bold border border-gray-300 ${totals.total_balance >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
                                            {formatNumber(totals.total_balance)}
                                        </td>
                                        <td className="px-2 py-2 text-right font-bold text-blue-600 border border-gray-300 bg-blue-50">
                                            {formatPercentage(totals.total_percentage_with_allocation)}
                                        </td>
                                        <td className="px-2 py-2 text-right font-bold text-green-600 border border-gray-300 bg-green-50">
                                            {formatPercentage(totals.total_percentage_with_net_allocation)}
                                        </td>
                                        <td className="px-2 py-2 text-right font-bold text-purple-600 border border-gray-300 bg-purple-50">
                                            {formatNumber(totals.total_perfect_percentage_with_allocation)}
                                        </td>
                                        <td className="px-2 py-2 text-right font-bold text-orange-600 border border-gray-300 bg-orange-50">
                                            {formatNumber(totals.total_perfect_percentage_with_net_allocation)}
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
                                <h3 className="text-lg font-semibold text-gray-800">Filter Net Expenditure with Percentage</h3>
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
                                        TR No (Head) <span className="text-red-500">*</span>
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
                                    <p className="text-xs text-gray-500 mt-1">Required field - select to enable other filters</p>
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
                                    disabled={!filters.head}
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

export default NetExpenditurePercentageReport;