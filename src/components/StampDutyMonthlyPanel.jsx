// src/components/StampDutyMonthlyPanel.jsx
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
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    LineChart,
    Table as TableIcon,
    Building2,
    FileSpreadsheet
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

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

const StampDutyMonthlyPanel = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [stampDutyData, setStampDutyData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [months, setMonths] = useState([]);
    const [monthNamesList, setMonthNamesList] = useState({});
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [totals, setTotals] = useState({
        total_allocation: 0,
        total_expenditure: 0,
        total_balance: 0
    });

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
            setStampDutyData([]);
            return;
        }

        setLoading(true);
        try {
            const params = {
                year: appliedFilters.year,
                month: appliedFilters.month
            };

            const response = await apiClient.get('/stamp-duty-monthly/data', { params });

            if (response.data.success) {
                const data = response.data.data.stamp_duty_report || [];

                setStampDutyData(data);
                setMonths(response.data.data.months || []);
                setMonthNamesList(response.data.data.month_names || {});
                setSelectedYear(response.data.data.filters?.year || '');
                setSelectedMonth(response.data.data.filters?.month || '');

                // Calculate totals
                let totalAllocation = 0;
                let totalExpenditure = 0;
                let totalBalance = 0;

                data.forEach(record => {
                    if (record.subject_name !== 'Total') {
                        totalAllocation += record.allocation || 0;
                        totalExpenditure += record.total_expenditure || 0;
                        totalBalance += record.balance || 0;
                    }
                });

                setTotals({
                    total_allocation: totalAllocation,
                    total_expenditure: totalExpenditure,
                    total_balance: totalBalance
                });

                const total = data.length || 0;
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
            const response = await apiClient.get('/stamp-duty-monthly/filter-options');

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
        setStampDutyData([]);
        setTotals({ total_allocation: 0, total_expenditure: 0, total_balance: 0 });
        setCurrentPage(1);
        setTotalRecords(0);
        setLastPage(1);
        setMonths([]);
        setMonthNamesList({});
    };

    const handleExportPDF = () => {
        if (stampDutyData.length === 0) {
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

            // Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('Stamp Duty Monthly Report', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 28, { align: 'center' });

            const monthText = monthNames[appliedFilters.month] || appliedFilters.month;
            let filterText = `Year: ${appliedFilters.year} | Month: ${monthText} (Cumulative: Jan - ${monthText})`;
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.text(filterText, pageWidth / 2, 36, { align: 'center' });

            doc.setDrawColor(200, 200, 200);
            doc.line(15, 40, pageWidth - 15, 40);

            // Define month groups as per your requirement
            const monthGroups = [
                { months: [1, 2, 3, 4, 5], label: 'January - May' },
                { months: [6, 7, 8, 9, 10], label: 'June - October' },
                { months: [11, 12], label: 'November - December' }
            ];

            let startY = 45;

            monthGroups.forEach((group, groupIndex) => {
                // Filter months that exist in the data
                const availableMonths = group.months.filter(month => months.includes(month));

                // Skip if no months available in this group
                if (availableMonths.length === 0) return;

                // Add spacing between tables
                if (groupIndex > 0) {
                    startY += 4;
                }

                // Build table headers for this group
                const tableHeaders = ['Head', 'Program', 'Project', 'Sub Project', 'Object', 'Subject Name', 'Allocation'];

                // Add month columns for this group
                availableMonths.forEach(month => {
                    tableHeaders.push(monthNamesList[month] || `Month ${month}`);
                });

                // Only add Total Exp. and Balance for the last table
                if (groupIndex === monthGroups.length - 1) {
                    tableHeaders.push('Total Exp.', 'Balance');
                }

                // Build table body
                const tableBody = stampDutyData.map(record => {
                    const row = [
                        record.trno || '-',
                        record.program || '-',
                        record.project || '-',
                        record.sub_project || '-',
                        record.object || '-',
                        record.subject_name || '-',
                        formatNumber(record.allocation)
                    ];

                    availableMonths.forEach(month => {
                        const key = `month_${month}`;
                        row.push(formatNumber(record[key] || 0));
                    });

                    // Only add Total Exp. and Balance for the last table
                    if (groupIndex === monthGroups.length - 1) {
                        row.push(formatNumber(record.total_expenditure || 0));
                        row.push(formatNumber(record.balance || 0));
                    }

                    return row;
                });

                // Calculate equal column widths
                const totalCols = tableHeaders.length;
                const availableWidth = pageWidth - 20; // 10mm margin on each side
                const equalWidth = availableWidth / totalCols;

                // Create column styles with equal width
                const columnStyles = {};
                for (let i = 0; i < totalCols; i++) {
                    let halign = 'center';
                    // Left align for text columns
                    if (i === 5) { // Subject Name
                        halign = 'left';
                    } else if (i > 0 && i !== 5) { // Number columns
                        halign = 'right';
                    }

                    columnStyles[i] = {
                        cellWidth: equalWidth,
                        halign: halign,
                        fontSize: 5.5
                    };
                }

                // Check if we need a new page
                const estimatedTableHeight = (tableBody.length + 1) * 5.5;
                if (startY + estimatedTableHeight > pageHeight - 20) {
                    doc.addPage();
                    startY = 20;

                    // Add header on new page
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 0, 0);
                    doc.text('Stamp Duty Monthly Report', pageWidth / 2, 20, { align: 'center' });
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(60, 60, 60);
                    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 28, { align: 'center' });
                    doc.text(filterText, pageWidth / 2, 36, { align: 'center' });
                    doc.setDrawColor(200, 200, 200);
                    doc.line(15, 40, pageWidth - 15, 40);
                    startY = 45;
                }

                // Add table title
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(41, 128, 185);
                const titleText = `Table ${groupIndex + 1}: ${group.label}`;
                doc.text(titleText, 15, startY - 2);
                startY += 2;

                // Generate the table
                autoTable(doc, {
                    head: [tableHeaders],
                    body: tableBody,
                    startY: startY,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: [255, 255, 255],
                        fontSize: 5.5,
                        fontStyle: 'bold',
                        halign: 'center',
                        cellPadding: 1.5
                    },
                    bodyStyles: {
                        fontSize: 5.5,
                        cellPadding: 1.5,
                        textColor: [0, 0, 0]
                    },
                    columnStyles: columnStyles,
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    margin: { top: 45, left: 10, right: 10, bottom: 20 },
                    tableWidth: 'auto',
                    didParseCell: function (data) {
                        if (data.row.index === 0) return;
                        if (data.row.index === stampDutyData.length - 1) {
                            data.cell.styles.fontStyle = 'bold';

                            data.cell.styles.textColor = [0, 0, 0];

                        }
                        // Highlight Total Exp. and Balance for last table
                        if (groupIndex === monthGroups.length - 1) {
                            if (data.column.index === tableHeaders.length - 2) {
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.textColor = [0, 0, 0];
                            }
                            if (data.column.index === tableHeaders.length - 1) {
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.textColor = [0, 0, 0];
                            }
                        }
                    },
                    didDrawPage: function (data) {
                        const pageCount = doc.internal.getNumberOfPages();
                        for (let i = 1; i <= pageCount; i++) {
                            doc.setPage(i);
                            doc.setDrawColor(200, 200, 200);
                            doc.line(12, pageHeight - 12, pageWidth - 12, pageHeight - 12);
                            doc.setFontSize(6);
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

                // Update startY for next table
                const lastTable = doc.lastAutoTable;
                if (lastTable) {
                    startY = lastTable.finalY + 3;
                }
            });

            const fileName = `stamp_duty_monthly_${appliedFilters.year}_${monthText}.pdf`;
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
        if (stampDutyData.length === 0) {
            alert('No data to export');
            return;
        }

        setLoading(true);
        try {
            const params = {
                year: appliedFilters.year,
                month: appliedFilters.month
            };

            const response = await apiClient.get('/stamp-duty-monthly/export', { params });

            if (response.data.success) {
                const csvData = response.data.data;
                if (csvData.length > 0) {
                    const headers = Object.keys(csvData[0]);
                    const csvRows = [
                        headers.join(','),
                        ...csvData.map(row => headers.map(h => {
                            const value = row[h];

                            // Handle null, undefined, or empty values
                            if (value === null || value === undefined) {
                                return '""';
                            }

                            // If value is 0 (number), keep it as "0"
                            if (value === 0) {
                                return '0';
                            }

                            // For numeric values, format properly
                            if (typeof value === 'number') {
                                // Format with 2 decimal places if it's a decimal/currency value
                                if (Number.isInteger(value)) {
                                    return value.toString();
                                }
                                return value.toFixed(2);
                            }

                            // For strings, wrap in quotes and escape
                            return `"${value.toString().replace(/"/g, '""')}"`;
                        }).join(','))
                    ];

                    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(csvBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `stamp_duty_monthly_${appliedFilters.year}_${monthNames[appliedFilters.month]}.csv`;
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

    const getMonthRangeDisplay = () => {
        if (!appliedFilters.month) return 'All Months';
        return `January - ${monthNames[appliedFilters.month]} (Cumulative)`;
    };

    const paginatedData = stampDutyData.slice(
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
                            <h1 className="text-2xl font-bold text-gray-800">Stamp Duty Monthly Report</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Monthly breakdown of stamp duty expenditures with cumulative totals
                            </p>
                        </div>
                        {appliedFilters.year && appliedFilters.month && (
                            <div className="bg-blue-50 rounded-lg px-3 py-2">
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">Year:</span> {appliedFilters.year} |
                                    <span className="font-medium ml-2">Month:</span> {monthNames[appliedFilters.month]}
                                    <span className="font-medium ml-2">| View:</span> Cumulative
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Month Range Indicator */}
                {appliedFilters.month && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center gap-2">
                            <LineChart size={18} className="text-purple-600" />
                            <span className="text-sm text-purple-700">
                                <strong>Showing:</strong> {getMonthRangeDisplay()}
                            </span>
                        </div>
                    </div>
                )}

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
                        disabled={stampDutyData.length === 0}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${stampDutyData.length > 0
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <FileText size={16} />
                        <span>Export PDF</span>
                    </button>
                    <button
                        onClick={handleExportCSV}
                        disabled={stampDutyData.length === 0}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${stampDutyData.length > 0
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
                        <table className="w-full text-xs border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 border border-gray-300">Head</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border border-gray-300">Program</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border border-gray-300">Project</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border border-gray-300">Sub Project</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border border-gray-300">Object</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border border-gray-300">Subject Name</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">Allocation</th>
                                    {months.map(month => (
                                        <th key={month} className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[70px] border border-gray-300">
                                            {monthNamesList[month] || `M${month}`}
                                        </th>
                                    ))}
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">Total Exp.</th>
                                    <th className="px-2 py-2 text-right font-semibold text-gray-700 border border-gray-300">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!appliedFilters.year || !appliedFilters.month ? (
                                    <tr>
                                        <td colSpan={months.length + 9} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter size={40} className="text-gray-300" />
                                                <p>Please select Year and Month to view data</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={months.length + 9} className="text-center py-12 text-gray-500">
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
                                    paginatedData.map((record, index) => {
                                        const isTotal = record.subject_name === 'Total';
                                        return (
                                            <tr
                                                key={index}
                                                className={`border-b border-gray-100 hover:bg-gray-50 transition ${isTotal ? 'bg-gray-100 font-bold' : ''
                                                    }`}
                                            >
                                                <td className={`px-2 py-2 sticky left-0 bg-white border border-gray-300 ${isTotal ? 'bg-gray-100' : ''}`}>
                                                    {record.trno || '-'}
                                                </td>
                                                <td className="px-2 py-2 border border-gray-300">{record.program || '-'}</td>
                                                <td className="px-2 py-2 border border-gray-300">{record.project || '-'}</td>
                                                <td className="px-2 py-2 border border-gray-300">{record.sub_project || '-'}</td>
                                                <td className="px-2 py-2 border border-gray-300">{record.object || '-'}</td>
                                                <td className="px-2 py-2 max-w-[100px] truncate border border-gray-300" title={record.subject_name}>
                                                    {record.subject_name || '-'}
                                                </td>
                                                <td className="px-2 py-2 text-right text-gray-600 border border-gray-300">Rs{formatNumber(record.allocation)}</td>
                                                {months.map(month => {
                                                    const key = `month_${month}`;
                                                    const value = record[key] || 0;
                                                    return (
                                                        <td key={month} className="px-2 py-2 text-right border border-gray-300">
                                                            Rs{formatNumber(value)}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-2 py-2 text-right font-bold text-gray-700 border border-gray-300">
                                                    Rs{formatNumber(record.total_expenditure || 0)}
                                                </td>
                                                <td className={`px-2 py-2 text-right font-bold text-gray-700 border border-gray-300 ${parseFloat(record.balance) < 0 ? 'text-red-600' : ''
                                                    }`}>
                                                    Rs{formatNumber(record.balance || 0)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {stampDutyData.length > 0 && (
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
                                <h3 className="text-lg font-semibold text-gray-800">Filter Stamp Duty Report</h3>
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
                                        Month (Cumulative) <span className="text-red-500">*</span>
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
                                        Shows cumulative expenditure from January to selected month
                                    </p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs text-blue-700">
                                        <strong>Note:</strong> This report shows monthly breakdown of stamp duty expenditures.
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        <strong>Expenditure = (Debit + Other Dept Debit) - (Surcharge + Other Dept Surcharge)</strong>
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
        </>
    );
};

export default StampDutyMonthlyPanel;