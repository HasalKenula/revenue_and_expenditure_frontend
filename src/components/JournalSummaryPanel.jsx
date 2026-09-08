// src/components/JournalSummaryPanel.jsx
import React, { useState, useEffect } from 'react';
import {
    RefreshCw,
    Download,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Calendar,
    DollarSign,
    FileText,
    TrendingUp,
    Table,
    Info,
    BookOpen,
    Wallet,
    TrendingDown,
    Building2,
    Briefcase,
    CreditCard,
    PiggyBank,
    Calculator,
    AlertCircle,
    BarChart3,
    MinusCircle
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL ;

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

const JournalSummaryPanel = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [totals, setTotals] = useState({
        total_expenditure: 0,
        total_refund_revenue: 0,
        total_deposit_dr: 0,
        total_commercial_dr: 0,
        total_advance_dr: 0,
        total_prov_fund_dr: 0,
        total_surcharge_cr: 0,
        total_revenue_cr: 0,
        total_deposit_cr: 0,
        total_commercial_cr: 0,
        total_advance_cr: 0,
        total_prov_fund_cr: 0,
        total_debit: 0,
        total_credit: 0,
        total_expenditure_dr_cr: 0,
        total_records: 0
    });
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

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

            const response = await apiClient.get('/journal-summary/data', { params });

            if (response.data.success) {
                setRecords(response.data.data.records || []);
                setTotals(response.data.data.totals || {
                    total_expenditure: 0,
                    total_refund_revenue: 0,
                    total_deposit_dr: 0,
                    total_commercial_dr: 0,
                    total_advance_dr: 0,
                    total_prov_fund_dr: 0,
                    total_surcharge_cr: 0,
                    total_revenue_cr: 0,
                    total_deposit_cr: 0,
                    total_commercial_cr: 0,
                    total_advance_cr: 0,
                    total_prov_fund_cr: 0,
                    total_debit: 0,
                    total_credit: 0,
                    total_expenditure_dr_cr: 0,
                    total_records: 0
                });
                setSelectedYear(response.data.data.filters?.year || '');
                setSelectedMonth(response.data.data.filters?.month || '');

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

    const fetchFilterOptions = async () => {
        try {
            const response = await apiClient.get('/journal-summary/filter-options');

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
        if (!filters.year) {
            toast.error('Please select a Year');
            return;
        }
        if (!filters.month) {
            toast.error('Please select a Month');
            return;
        }
        setAppliedFilters({ ...filters });
        setShowFilterModal(false);
    };

    const clearFilters = () => {
        setFilters({ year: '', month: '' });
        setAppliedFilters({ year: '', month: '' });
        setRecords([]);
        setTotals({
            total_expenditure: 0,
            total_refund_revenue: 0,
            total_deposit_dr: 0,
            total_commercial_dr: 0,
            total_advance_dr: 0,
            total_prov_fund_dr: 0,
            total_surcharge_cr: 0,
            total_revenue_cr: 0,
            total_deposit_cr: 0,
            total_commercial_cr: 0,
            total_advance_cr: 0,
            total_prov_fund_cr: 0,
            total_debit: 0,
            total_credit: 0,
            total_expenditure_dr_cr: 0,
            total_records: 0
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
            // Create PDF in landscape orientation (A3)
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a3'
            });

            // Get page dimensions
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            const currentDate = new Date().toLocaleString();

            // Add Header - Centered
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Journal Summary Report', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 28, { align: 'center' });

            doc.setFontSize(10);
            doc.text(`Year: ${appliedFilters.year} | Month: ${monthNames[appliedFilters.month]}`, pageWidth / 2, 36, { align: 'center' });

            // Add a line separator
            doc.setDrawColor(200, 200, 200);
            doc.line(15, 40, pageWidth - 15, 40);

            // Table headers - Full width with proper spacing
            const tableHeaders = [
                { title: 'TR No', dataKey: 'trno' },
                { title: 'Exp (DR)', dataKey: 'expenditure' },
                { title: 'Ref Rev (DR)', dataKey: 'refund_revenue' },
                { title: 'Dep (DR)', dataKey: 'deposit_dr' },
                { title: 'Com (DR)', dataKey: 'commercial_dr' },
                { title: 'Adv (DR)', dataKey: 'advance_dr' },
                { title: 'PF (DR)', dataKey: 'prov_fund_dr' },
                { title: 'Sur (CR)', dataKey: 'surcharge_cr' },
                { title: 'Rev (CR)', dataKey: 'revenue_cr' },
                { title: 'Dep (CR)', dataKey: 'deposit_cr' },
                { title: 'Com (CR)', dataKey: 'commercial_cr' },
                { title: 'Adv (CR)', dataKey: 'advance_cr' },
                { title: 'PF (CR)', dataKey: 'prov_fund_cr' },
                { title: 'Total Debit', dataKey: 'total_debit' },
                { title: 'Total Credit', dataKey: 'total_credit' },
                { title: 'Exp (DR-CR)', dataKey: 'expenditure_dr_cr' }
            ];

            // Prepare table data
            const tableBody = records.map(record => [
                record.trno || '-',
                formatNumber(record.expenditure),
                formatNumber(record.refund_revenue),
                formatNumber(record.deposit_dr),
                formatNumber(record.commercial_dr),
                formatNumber(record.advance_dr),
                formatNumber(record.prov_fund_dr),
                formatNumber(record.surcharge_cr),
                formatNumber(record.revenue_cr),
                formatNumber(record.deposit_cr),
                formatNumber(record.commercial_cr),
                formatNumber(record.advance_cr),
                formatNumber(record.prov_fund_cr),
                formatNumber(record.total_debit),
                formatNumber(record.total_credit),
                formatNumber(record.expenditure_dr_cr)
            ]);

            // Add totals row
            tableBody.push([
                'TOTAL',
                formatNumber(totals.total_expenditure),
                formatNumber(totals.total_refund_revenue),
                formatNumber(totals.total_deposit_dr),
                formatNumber(totals.total_commercial_dr),
                formatNumber(totals.total_advance_dr),
                formatNumber(totals.total_prov_fund_dr),
                formatNumber(totals.total_surcharge_cr),
                formatNumber(totals.total_revenue_cr),
                formatNumber(totals.total_deposit_cr),
                formatNumber(totals.total_commercial_cr),
                formatNumber(totals.total_advance_cr),
                formatNumber(totals.total_prov_fund_cr),
                formatNumber(totals.total_debit),
                formatNumber(totals.total_credit),
                formatNumber(totals.total_expenditure_dr_cr)
            ]);

            // Generate table - using FULL A3 sheet width and height
            autoTable(doc, {
                head: [tableHeaders.map(h => h.title)],
                body: tableBody,
                startY: 45,
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255],
                    fontSize: 8,
                    fontStyle: 'bold',
                    halign: 'center',
                    cellPadding: 2.5,
                    minCellHeight: 10
                },
                bodyStyles: {
                    fontSize: 7.5,
                    cellPadding: 2.5,
                    minCellHeight: 8,
                    textColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { cellWidth: 22, halign: 'center' },  // TR No
                    1: { cellWidth: 26, halign: 'right' },   // Exp (DR)
                    2: { cellWidth: 24, halign: 'right' },   // Ref Rev (DR)
                    3: { cellWidth: 26, halign: 'right' },   // Dep (DR)
                    4: { cellWidth: 24, halign: 'right' },   // Com (DR)
                    5: { cellWidth: 24, halign: 'right' },   // Adv (DR)
                    6: { cellWidth: 24, halign: 'right' },   // PF (DR)
                    7: { cellWidth: 24, halign: 'right' },   // Sur (CR)
                    8: { cellWidth: 26, halign: 'right' },   // Rev (CR)
                    9: { cellWidth: 24, halign: 'right' },   // Dep (CR)
                    10: { cellWidth: 24, halign: 'right' },  // Com (CR)
                    11: { cellWidth: 26, halign: 'right' },  // Adv (CR)
                    12: { cellWidth: 26, halign: 'right' },  // PF (CR)
                    13: { cellWidth: 28, halign: 'right' },  // Total Debit
                    14: { cellWidth: 28, halign: 'right' },  // Total Credit
                    15: { cellWidth: 28, halign: 'right' }   // Exp (DR-CR)
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: {
                    top: 45,
                    left: 12,
                    right: 12,
                    bottom: 15
                },
                tableWidth: 'auto',
                // Use full width of the page
                pageBreak: 'auto',
                rowPageBreak: 'auto',
                showHead: 'everyPage',
                showFoot: 'lastPage',
                footStyles: {
                    fillColor: [220, 220, 220],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    fontSize: 8,
                    minCellHeight: 10
                },
                didDrawPage: function (data) {
                    // Add footer to each page with full width
                    const pageCount = doc.internal.getNumberOfPages();
                    for (let i = 1; i <= pageCount; i++) {
                        doc.setPage(i);

                        // Add separator line
                        doc.setDrawColor(200, 200, 200);
                        doc.line(12, pageHeight - 15, pageWidth - 12, pageHeight - 15);

                        // Add footer text centered
                        doc.setFontSize(8);
                        doc.setTextColor(128, 128, 128);
                        doc.text(
                            `Page ${i} of ${pageCount}`,
                            pageWidth / 2,
                            pageHeight - 5,
                            { align: 'center' }
                        );
                    }
                }
            });

            // Save PDF
            const fileName = `journal_summary_${appliedFilters.year}_${monthNames[appliedFilters.month]}.pdf`;
            doc.save(fileName);
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
            const params = {
                year: appliedFilters.year,
                month: appliedFilters.month
            };

            const response = await apiClient.get('/journal-summary/export', { params });

            if (response.data.success) {
                const csvData = response.data.data;
                if (csvData.length > 0) {
                    const headers = Object.keys(csvData[0]);

                    // Identify numeric headers (amount fields)
                    const numericKeywords = ['amount', 'total', 'balance', 'debit', 'credit', 'dr', 'cr', 'sum', 'net'];
                    const numericHeaders = headers.filter(h =>
                        numericKeywords.some(keyword => h.toLowerCase().includes(keyword))
                    );

                    const csvRows = [
                        headers.join(','),
                        ...csvData.map(row => headers.map(h => {
                            const value = row[h];

                            // Handle null/undefined
                            if (value === null || value === undefined) {
                                // If it's a numeric header, return 0
                                if (numericHeaders.includes(h)) {
                                    return '0';
                                }
                                return '""';
                            }

                            // Handle numeric values
                            if (typeof value === 'number') {
                                // Format with 2 decimal places for currency/amount fields
                                if (numericHeaders.includes(h)) {
                                    return value.toFixed(2);
                                }
                                return value.toString();
                            }

                            // Handle string values
                            if (typeof value === 'string') {
                                // Check if it's a numeric string
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue) && numericHeaders.includes(h)) {
                                    return numValue.toFixed(2);
                                }
                                // Escape quotes and wrap in quotes
                                return `"${value.replace(/"/g, '""')}"`;
                            }

                            // Handle boolean or other types
                            return String(value);
                        }).join(','))
                    ];

                    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(csvBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `journal_summary_${appliedFilters.year}_${monthNames[appliedFilters.month]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("CSV exported successfully!");
                }
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error("Failed to generate CSV");
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
                            <h1 className="text-2xl font-bold text-gray-800">Journal Summary</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                TR No wise summary of all DR and CR transactions with Net Expenditure
                            </p>
                        </div>
                        {appliedFilters.year && appliedFilters.month && (
                            <div className="bg-blue-50 rounded-lg px-3 py-2">
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">Year:</span> {appliedFilters.year} |
                                    <span className="font-medium ml-2">Month:</span> {monthNames[appliedFilters.month]}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center gap-2">
                        <BookOpen size={18} className="text-amber-600" />
                        <span className="text-sm text-amber-700">
                            <strong>DR Codes:</strong> Exp(1000) | Ref Rev(5000) | Dep(6000) | Com(7000) | Adv(8493) | PF(8098) |
                            <strong>CR Codes:</strong> Sur(2000) | Rev(4000) | Dep(6000) | Com(7000) | Adv(8493) | PF(8098)
                        </span>
                    </div>
                </div>

                {/* Filters Display */}
                {(appliedFilters.year || appliedFilters.month) && (
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

                {/* Records Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[8px] border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-1 py-1.5 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 border border-gray-300">TR No</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Exp (DR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Ref Rev (DR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Dep (DR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Com (DR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Adv (DR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">PF (DR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Sur (CR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Rev (CR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Dep (CR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Com (CR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Adv (CR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">PF (CR)</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Total Debit</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Total Credit</th>
                                    <th className="px-1 py-1.5 text-right font-semibold text-gray-700 border border-gray-300">Exp (DR-CR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!appliedFilters.year || !appliedFilters.month ? (
                                    <tr>
                                        <td colSpan="16" className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter size={40} className="text-gray-300" />
                                                <p>Please select Year and Month to view data</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="16" className="text-center py-12 text-gray-500">
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
                                            <td className="px-1 py-1.5 font-medium text-gray-900 border border-gray-300 sticky left-0 bg-white">{record.trno || '-'}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.expenditure)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.refund_revenue)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.deposit_dr)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.commercial_dr)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.advance_dr)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.prov_fund_dr)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.surcharge_cr)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.revenue_cr)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.deposit_cr)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.commercial_cr)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.advance_cr)}</td>
                                            <td className="px-1 py-1.5 text-right font-medium text-gray-600 border border-gray-300">{formatNumber(record.prov_fund_cr)}</td>
                                            <td className="px-1 py-1.5 text-right font-bold text-gray-600 border border-gray-300">{formatNumber(record.total_debit)}</td>
                                            <td className="px-1 py-1.5 text-right font-bold text-gray-600 border border-gray-300">{formatNumber(record.total_credit)}</td>
                                            <td className={`px-1 py-1.5 text-right font-bold border border-gray-300 ${parseFloat(record.expenditure_dr_cr) >= 0 ? 'text-gray-600' : 'text-gray-600'}`}>
                                                Rs{formatNumber(record.expenditure_dr_cr)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {paginatedRecords.length > 0 && (
                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                    <tr className="font-semibold">
                                        <td className="px-1 py-1.5 text-right border border-gray-300">Total:</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_expenditure)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_refund_revenue)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_deposit_dr)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_commercial_dr)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_advance_dr)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_prov_fund_dr)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_surcharge_cr)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_revenue_cr)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_deposit_cr)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_commercial_cr)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_advance_cr)}</td>
                                        <td className="px-1 py-1.5 text-right text-gray-600 border border-gray-300">{formatNumber(totals.total_prov_fund_cr)}</td>
                                        <td className="px-1 py-1.5 text-right font-bold text-gray-600 border border-gray-300">{formatNumber(totals.total_debit)}</td>
                                        <td className="px-1 py-1.5 text-right font-bold text-gray-600 border border-gray-300">{formatNumber(totals.total_credit)}</td>
                                        <td className={`px-1 py-1.5 text-right font-bold border border-gray-300 ${totals.total_expenditure_dr_cr >= 0 ? 'text-gray-600' : 'text-gray-600'}`}>
                                            Rs{formatNumber(totals.total_expenditure_dr_cr)}
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
                                <h3 className="text-lg font-semibold text-gray-800">Filter Report</h3>
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

                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs text-blue-700">
                                        <strong>Note:</strong> This report shows TR No wise summary:
                                    </p>
                                    <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                                        <li><strong>DR Codes:</strong> Exp(1000) | Ref Rev(5000) | Dep(6000) | Com(7000) | Adv(8493) | PF(8098)</li>
                                        <li><strong>CR Codes:</strong> Sur(2000) | Rev(4000) | Dep(6000) | Com(7000) | Adv(8493) | PF(8098)</li>
                                        <li><strong>Exp (DR-CR):</strong> Total Debit - Total Credit</li>
                                        <li>Data is shown for the selected month only</li>
                                    </ul>
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

export default JournalSummaryPanel;