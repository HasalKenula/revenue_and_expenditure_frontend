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
    DollarSign
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Add request interceptor
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

// Add response interceptor
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

const RevenueCrossEntryAccountPanel = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [totals, setTotals] = useState({
        months: {},
        total: 0
    });

    const [filters, setFilters] = useState({
        year: ''
    });

    const [appliedFilters, setAppliedFilters] = useState({
        year: ''
    });

    const [filterOptions, setFilterOptions] = useState({
        years: []
    });

    // Format number with commas
    const formatNumber = (value) => {
        if (value === undefined || value === null) return '0.00';
        return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const displayNumber = (value) => {
        if (value === null || value === undefined || value === '') return '-';
        if (value === 0 || value === '0') return '0';
        return value;
    };

    // Format number with leading zeros (pad to 2 digits)
    const padNumber = (value) => {
        if (value === null || value === undefined || value === '') {
            return '';
        }
        return String(value).padStart(2, '0');
    };

    // Format combined code: Head-Program-Project-SubProject-Object with padding
    const formatCombinedCode = (record) => {
        const head = displayNumber(record.head);
        const program = displayNumber(record.program);
        const project = padNumber(record.project);
        const subProject = padNumber(record.sub_project);
        const object = padNumber(record.object);

        return `${head}-${project}-${object}`;
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
        if (!appliedFilters.year) {
            setRecords([]);
            setTotals({ months: {}, total: 0 });
            return;
        }

        setLoading(true);
        try {
            const params = {
                year: appliedFilters.year
            };

            const response = await apiClient.get('/revenue-cross-entry-account/data', { params });

            if (response.data.success) {
                const data = response.data.data;
                setRecords(data.records || []);
                setTotals(data.totals || { months: {}, total: 0 });

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
            const response = await apiClient.get('/revenue-cross-entry-account/filter-options');

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

    // Auto-fetch when filters change
    useEffect(() => {
        if (appliedFilters.year) {
            fetchRecords();
        }
    }, [appliedFilters]);

    // Initial load - fetch filter options
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
        setAppliedFilters({ ...filters });
        setShowFilterModal(false);
    };

    const clearFilters = () => {
        setFilters({ year: '' });
        setAppliedFilters({ year: '' });
        setRecords([]);
        setTotals({ months: {}, total: 0 });
        setCurrentPage(1);
        setTotalRecords(0);
        setLastPage(1);
    };

    // Generate PDF Report - A4 Landscape with Two Tables
    //   const handleExportPDF = () => {
    //     if (records.length === 0) {
    //       alert('No data to export');
    //       return;
    //     }

    //     setLoading(true);

    //     try {
    //       // Create PDF in landscape orientation (A4)
    //       const doc = new jsPDF({
    //         orientation: 'landscape',
    //         unit: 'mm',
    //         format: 'a4'
    //       });

    //       const pageWidth = 297;
    //       const pageHeight = 210;

    //       // Get current date
    //       const currentDate = new Date().toLocaleString();

    //       // Add Header
    //       doc.setFontSize(16);
    //       doc.setFont('helvetica', 'bold');
    //       doc.text('Revenue Cross Entry Account Report', pageWidth / 2, 15, { align: 'center' });

    //       doc.setFontSize(10);
    //       doc.setFont('helvetica', 'normal');
    //       doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 22, { align: 'center' });

    //       // Add filter information
    //       let filterText = `Year: ${appliedFilters.year}`;

    //       doc.setFontSize(9);
    //       doc.text(filterText, pageWidth / 2, 29, { align: 'center' });

    //       // ============ TABLE 1: January to July ============
    //       // Prepare table headers for Table 1
    //       const table1Headers = [
    //         'Revenue Code Name',
    //         'Revenue Code',
    //         'Jan',
    //         'Feb',
    //         'Mar',
    //         'Apr',
    //         'May',
    //         'Jun',
    //         'Jul'
    //       ];

    //       // Prepare table data for Table 1
    //       const table1Body = records.map(record => {
    //         const row = [
    //           record.revenue_code_name || '',
    //           formatCombinedCode(record)
    //         ];

    //         // Months 1-7 (January to July)
    //         for (let i = 1; i <= 7; i++) {
    //           row.push(formatNumber(record.months?.[i] || 0));
    //         }

    //         return row;
    //       });

    //       // Add totals row for Table 1
    //       const table1TotalRow = ['TOTAL', ''];
    //       for (let i = 1; i <= 7; i++) {
    //         table1TotalRow.push(formatNumber(totals.months?.[i] || 0));
    //       }
    //       table1Body.push(table1TotalRow);

    //       // Column styles for Table 1
    //       const table1ColumnStyles = {
    //         0: { cellWidth: 60, halign: 'left' },
    //         1: { cellWidth: 25, halign: 'left' },
    //         2: { cellWidth: 25, halign: 'right' },
    //         3: { cellWidth: 25, halign: 'right' },
    //         4: { cellWidth: 25, halign: 'right' },
    //         5: { cellWidth: 25, halign: 'right' },
    //         6: { cellWidth: 25, halign: 'right' },
    //         7: { cellWidth: 25, halign: 'right' },
    //         8: { cellWidth: 25, halign: 'right' }
    //       };

    //       // Generate Table 1
    //       autoTable(doc, {
    //         head: [table1Headers],
    //         body: table1Body,
    //         startY: 35,
    //         theme: 'striped',
    //         headStyles: {
    //           fillColor: [41, 128, 185],
    //           textColor: [255, 255, 255],
    //           fontSize: 8,
    //           fontStyle: 'bold',
    //           halign: 'center',
    //           cellPadding: 2
    //         },
    //         bodyStyles: {
    //           fontSize: 7,
    //           cellPadding: 2
    //         },
    //         columnStyles: table1ColumnStyles,
    //         alternateRowStyles: { fillColor: [245, 245, 245] },
    //         margin: { top: 35, left: 15, right: 15 },
    //         tableWidth: 'auto',
    //         rowStyles: {
    //           [table1Body.length - 1]: {
    //             fontStyle: 'bold',
    //             fillColor: [220, 235, 245],
    //             textColor: [0, 0, 0],
    //             fontSize: 8
    //           }
    //         },
    //         didDrawPage: function(data) {
    //           // Footer is added after table generation
    //         }
    //       });

    //       // Get the Y position after Table 1
    //       const finalY = doc.lastAutoTable.finalY + 10;

    //       // ============ TABLE 2: August to December + Total ============
    //       // Prepare table headers for Table 2
    //       const table2Headers = [
    //         'Revenue Code Name',
    //         'Revenue Code',
    //         'Aug',
    //         'Sep',
    //         'Oct',
    //         'Nov',
    //         'Dec',
    //         'Total'
    //       ];

    //       // Prepare table data for Table 2
    //       const table2Body = records.map(record => {
    //         const row = [
    //           record.revenue_code_name || '',
    //           formatCombinedCode(record)
    //         ];

    //         // Months 8-12 (August to December)
    //         for (let i = 8; i <= 12; i++) {
    //           row.push(formatNumber(record.months?.[i] || 0));
    //         }

    //         // Add Total column
    //         row.push(formatNumber(record.total || 0));

    //         return row;
    //       });

    //       // Add totals row for Table 2
    //       const table2TotalRow = ['TOTAL', ''];
    //       for (let i = 8; i <= 12; i++) {
    //         table2TotalRow.push(formatNumber(totals.months?.[i] || 0));
    //       }
    //       table2TotalRow.push(formatNumber(totals.total || 0));
    //       table2Body.push(table2TotalRow);

    //       // Column styles for Table 2
    //       const table2ColumnStyles = {
    //         0: { cellWidth: 60, halign: 'left' },
    //         1: { cellWidth: 25, halign: 'left' },
    //         2: { cellWidth: 25, halign: 'right' },
    //         3: { cellWidth: 25, halign: 'right' },
    //         4: { cellWidth: 25, halign: 'right' },
    //         5: { cellWidth: 25, halign: 'right' },
    //         6: { cellWidth: 25, halign: 'right' },
    //         7: { cellWidth: 30, halign: 'right' }
    //       };

    //       // Generate Table 2
    //       autoTable(doc, {
    //         head: [table2Headers],
    //         body: table2Body,
    //         startY: finalY,
    //         theme: 'striped',
    //         headStyles: {
    //           fillColor: [41, 128, 185],
    //           textColor: [255, 255, 255],
    //           fontSize: 8,
    //           fontStyle: 'bold',
    //           halign: 'center',
    //           cellPadding: 2
    //         },
    //         bodyStyles: {
    //           fontSize: 7,
    //           cellPadding: 2
    //         },
    //         columnStyles: table2ColumnStyles,
    //         alternateRowStyles: { fillColor: [245, 245, 245] },
    //         margin: { top: 15, left: 15, right: 15 },
    //         tableWidth: 'auto',
    //         rowStyles: {
    //           [table2Body.length - 1]: {
    //             fontStyle: 'bold',
    //             fillColor: [220, 235, 245],
    //             textColor: [0, 0, 0],
    //             fontSize: 8
    //           }
    //         },
    //         didDrawPage: function(data) {
    //           // Footer is added after table generation
    //         }
    //       });

    //       // Add footer to all pages
    //       const pageCount = doc.internal.getNumberOfPages();
    //       for (let i = 1; i <= pageCount; i++) {
    //         doc.setPage(i);
    //         doc.setFontSize(8);
    //         doc.setTextColor(128, 128, 128);
    //         doc.text(
    //           `Page ${i} of ${pageCount}`,
    //           pageWidth / 2,
    //           pageHeight - 10,
    //           { align: 'center' }
    //         );
    //       }

    //       // Save PDF
    //       doc.save(`revenue_cross_entry_account_${appliedFilters.year}.pdf`);
    //       alert('PDF exported successfully!');

    //     } catch (error) {
    //       console.error('Error generating PDF:', error);
    //       alert('Failed to generate PDF: ' + error.message);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    // Generate PDF Report - A4 Landscape with 4 Tables (Each on Separate Page)
    const handleExportPDF = () => {
        if (records.length === 0) {
            alert('No data to export');
            return;
        }

        setLoading(true);

        try {
            // Create PDF in landscape orientation (A4)
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 297;
            const pageHeight = 210;

            // Get current date
            const currentDate = new Date().toLocaleString();

            // Filter records for head between 1000 and 2000 (Group 1)
            const group1Records = records.filter(record => record.head > 1000 && record.head < 2000);

            // Filter records for head between 2000 and 3000 (Group 2)
            const group2Records = records.filter(record => record.head > 2000 && record.head < 3000);

            // ============================================================
            // PAGE 1: TABLE 1 - Head 1000-2000 (Jan-Jul)
            // ============================================================

            // Calculate group1 subtotal for Jan-Jul
            const group1Subtotal = {
                months: {},
                total: 0
            };
            for (let i = 1; i <= 7; i++) {
                group1Subtotal.months[i] = 0;
            }
            group1Records.forEach(record => {
                for (let i = 1; i <= 7; i++) {
                    group1Subtotal.months[i] += record.months?.[i] || 0;
                }
            });
            for (let i = 1; i <= 7; i++) {
                group1Subtotal.months[i] = roundToTwo(group1Subtotal.months[i]);
            }

            // Add Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Revenue Cross Entry Account Report', pageWidth / 2, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 22, { align: 'center' });

            doc.setFontSize(9);
            doc.text(`Year: ${appliedFilters.year} | Head: 1001 - 1999 (Jan - Jul)`, pageWidth / 2, 29, { align: 'center' });

            // Table 1 Headers
            const table1Headers = [
                'Revenue Code Name',
                'Revenue Code',
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul'
            ];

            // Table 1 Body
            const table1Body = group1Records.map(record => {
                const row = [
                    record.revenue_code_name || '',
                    formatCombinedCode(record)
                ];
                for (let i = 1; i <= 7; i++) {
                    row.push(formatNumber(record.months?.[i] || 0));
                }
                return row;
            });

            // Add Subtotal row for Table 1
            const table1SubtotalRow = ['SUB TOTAL', ''];
            for (let i = 1; i <= 7; i++) {
                table1SubtotalRow.push(formatNumber(group1Subtotal.months[i] || 0));
            }
            table1Body.push(table1SubtotalRow);

            // Table 1 Column Styles
            const table1ColumnStyles = {
                0: { cellWidth: 65, halign: 'left' },
                1: { cellWidth: 20, halign: 'left' },
                2: { cellWidth: 25, halign: 'right' },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 25, halign: 'right' },
                6: { cellWidth: 25, halign: 'right' },
                7: { cellWidth: 25, halign: 'right' },
                8: { cellWidth: 25, halign: 'right' }
            };

            // Generate Table 1
            autoTable(doc, {
                head: [table1Headers],
                body: table1Body,
                startY: 35,
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
                    cellPadding: 2
                },
                columnStyles: table1ColumnStyles,
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 35, left: 18.5, right: 18.5 },
                tableWidth: 250,
                rowStyles: {
                    [table1Body.length - 1]: {
                        fontStyle: 'bold',
                        fillColor: [220, 235, 245],
                        textColor: [0, 0, 0],
                        fontSize: 8
                    }
                },
                didDrawPage: function (data) {
                    // Footer is added after table generation
                }
            });

            // Add footer to Page 1
            const pageCount = 4;
            doc.setPage(1);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Page 1 of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );

            // ============================================================
            // PAGE 2: TABLE 2 - Head 2000-3000 (Jan-Jul)
            // ============================================================
            doc.addPage();

            // Calculate group2 subtotal for Jan-Jul
            const group2Subtotal = {
                months: {},
                total: 0
            };
            for (let i = 1; i <= 7; i++) {
                group2Subtotal.months[i] = 0;
            }
            group2Records.forEach(record => {
                for (let i = 1; i <= 7; i++) {
                    group2Subtotal.months[i] += record.months?.[i] || 0;
                }
            });
            for (let i = 1; i <= 7; i++) {
                group2Subtotal.months[i] = roundToTwo(group2Subtotal.months[i]);
            }

            // Calculate Total (Group1 + Group2) for Jan-Jul
            const totalSubtotal = {
                months: {},
                total: 0
            };
            for (let i = 1; i <= 7; i++) {
                totalSubtotal.months[i] = roundToTwo((group1Subtotal.months[i] || 0) + (group2Subtotal.months[i] || 0));
            }

           

            // Table 2 Body
            const table2Body = group2Records.map(record => {
                const row = [
                    record.revenue_code_name || '',
                    formatCombinedCode(record)
                ];
                for (let i = 1; i <= 7; i++) {
                    row.push(formatNumber(record.months?.[i] || 0));
                }
                return row;
            });

            // Add Subtotal row for Table 2
            const table2SubtotalRow = ['SUB TOTAL', ''];
            for (let i = 1; i <= 7; i++) {
                table2SubtotalRow.push(formatNumber(group2Subtotal.months[i] || 0));
            }
            table2Body.push(table2SubtotalRow);

            // Add Total row (Group1 + Group2)
            const table2TotalRow = ['TOTAL', ''];
            for (let i = 1; i <= 7; i++) {
                table2TotalRow.push(formatNumber(totalSubtotal.months[i] || 0));
            }
            table2Body.push(table2TotalRow);

            // Table 2 Column Styles
            const table2ColumnStyles = {
                0: { cellWidth: 65, halign: 'left' },
                1: { cellWidth: 20, halign: 'left' },
                2: { cellWidth: 25, halign: 'right' },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 25, halign: 'right' },
                6: { cellWidth: 25, halign: 'right' },
                7: { cellWidth: 25, halign: 'right' },
                8: { cellWidth: 25, halign: 'right' }
            };

            // Generate Table 2
            autoTable(doc, {
                head: [table1Headers],
                body: table2Body,
                startY: 15,
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
                    cellPadding: 2
                },
                columnStyles: table2ColumnStyles,
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 35, left: 18.5, right: 18.5 },
                tableWidth: 250,
                rowStyles: {
                    [table2Body.length - 2]: {
                        fontStyle: 'bold',
                        fillColor: [220, 235, 245],
                        textColor: [0, 0, 0],
                        fontSize: 8
                    },
                    [table2Body.length - 1]: {
                        fontStyle: 'bold',
                        fillColor: [255, 215, 0],
                        textColor: [0, 0, 0],
                        fontSize: 8
                    }
                },
                didDrawPage: function (data) {
                    // Footer is added after table generation
                }
            });

            // Add footer to Page 2
            doc.setPage(2);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Page 2 of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );

            // ============================================================
            // PAGE 3: TABLE 3 - Head 1000-2000 (Aug-Dec with Total)
            // ============================================================
            doc.addPage();

            // Calculate group1 total for Aug-Dec
            const group1Total = {
                months: {},
                total: 0
            };
            for (let i = 8; i <= 12; i++) {
                group1Total.months[i] = 0;
            }
            group1Records.forEach(record => {
                for (let i = 8; i <= 12; i++) {
                    group1Total.months[i] += record.months?.[i] || 0;
                }
                group1Total.total += record.total || 0;
            });
            for (let i = 8; i <= 12; i++) {
                group1Total.months[i] = roundToTwo(group1Total.months[i]);
            }
            group1Total.total = roundToTwo(group1Total.total);

            // Add Header for Page 3
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Revenue Cross Entry Account Report', pageWidth / 2, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 22, { align: 'center' });

            doc.setFontSize(9);
            doc.text(`Year: ${appliedFilters.year} | Head: 1001 - 1999 (Aug - Dec)`, pageWidth / 2, 29, { align: 'center' });

            // Table 3 Headers
            const table3Headers = [
                'Revenue Code Name',
                'Revenue Code',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
                'Total'
            ];

            // Table 3 Body
            const table3Body = group1Records.map(record => {
                const row = [
                    record.revenue_code_name || '',
                    formatCombinedCode(record)
                ];
                for (let i = 8; i <= 12; i++) {
                    row.push(formatNumber(record.months?.[i] || 0));
                }
                row.push(formatNumber(record.total || 0));
                return row;
            });

            // Add Subtotal row for Table 3
            const table3SubtotalRow = ['SUB TOTAL', ''];
            for (let i = 8; i <= 12; i++) {
                table3SubtotalRow.push(formatNumber(group1Total.months[i] || 0));
            }
            table3SubtotalRow.push(formatNumber(group1Total.total || 0));
            table3Body.push(table3SubtotalRow);

            // Table 3 Column Styles
            const table3ColumnStyles = {
                0: { cellWidth: 60, halign: 'left' },
                1: { cellWidth: 20, halign: 'left' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right' },
                5: { cellWidth: 30, halign: 'right' },
                6: { cellWidth: 30, halign: 'right' },
                7: { cellWidth: 30, halign: 'right' }
            };

            // Generate Table 3
            autoTable(doc, {
                head: [table3Headers],
                body: table3Body,
                startY: 35,
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
                    cellPadding: 2
                },
                columnStyles: table3ColumnStyles,
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 35, left: 18.5, right: 18.5 },
                tableWidth: 250,
                rowStyles: {
                    [table3Body.length - 1]: {
                        fontStyle: 'bold',
                        fillColor: [220, 235, 245],
                        textColor: [0, 0, 0],
                        fontSize: 8
                    }
                },
                didDrawPage: function (data) {
                    // Footer is added after table generation
                }
            });

            // Add footer to Page 3
            doc.setPage(3);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Page 3 of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );

            // ============================================================
            // PAGE 4: TABLE 4 - Head 2000-3000 (Aug-Dec with Total)
            // ============================================================
            doc.addPage();

            // Calculate group2 total for Aug-Dec
            const group2Total = {
                months: {},
                total: 0
            };
            for (let i = 8; i <= 12; i++) {
                group2Total.months[i] = 0;
            }
            group2Records.forEach(record => {
                for (let i = 8; i <= 12; i++) {
                    group2Total.months[i] += record.months?.[i] || 0;
                }
                group2Total.total += record.total || 0;
            });
            for (let i = 8; i <= 12; i++) {
                group2Total.months[i] = roundToTwo(group2Total.months[i]);
            }
            group2Total.total = roundToTwo(group2Total.total);

            // Calculate Total (Group1 + Group2) for Aug-Dec
            const totalCombined = {
                months: {},
                total: 0
            };
            for (let i = 8; i <= 12; i++) {
                totalCombined.months[i] = roundToTwo((group1Total.months[i] || 0) + (group2Total.months[i] || 0));
            }
            totalCombined.total = roundToTwo((group1Total.total || 0) + (group2Total.total || 0));

           

            // Table 4 Body
            const table4Body = group2Records.map(record => {
                const row = [
                    record.revenue_code_name || '',
                    formatCombinedCode(record)
                ];
                for (let i = 8; i <= 12; i++) {
                    row.push(formatNumber(record.months?.[i] || 0));
                }
                row.push(formatNumber(record.total || 0));
                return row;
            });

            // Add Subtotal row for Table 4
            const table4SubtotalRow = ['SUB TOTAL', ''];
            for (let i = 8; i <= 12; i++) {
                table4SubtotalRow.push(formatNumber(group2Total.months[i] || 0));
            }
            table4SubtotalRow.push(formatNumber(group2Total.total || 0));
            table4Body.push(table4SubtotalRow);

            // Add Total row (Group1 + Group2)
            const table4TotalRow = ['TOTAL', ''];
            for (let i = 8; i <= 12; i++) {
                table4TotalRow.push(formatNumber(totalCombined.months[i] || 0));
            }
            table4TotalRow.push(formatNumber(totalCombined.total || 0));
            table4Body.push(table4TotalRow);

            // Table 4 Column Styles
            const table4ColumnStyles = {
                0: { cellWidth: 60, halign: 'left' },
                1: { cellWidth: 20, halign: 'left' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right' },
                5: { cellWidth: 30, halign: 'right' },
                6: { cellWidth: 30, halign: 'right' },
                7: { cellWidth: 30, halign: 'right' }
            };

            // Generate Table 4
            autoTable(doc, {
                head: [table3Headers],
                body: table4Body,
                startY: 15,
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
                    cellPadding: 2
                },
                columnStyles: table4ColumnStyles,
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 35, left: 18.5, right: 18.5 },
                tableWidth: 250,
                rowStyles: {
                    [table4Body.length - 2]: {
                        fontStyle: 'bold',
                        fillColor: [220, 235, 245],
                        textColor: [0, 0, 0],
                        fontSize: 8
                    },
                    [table4Body.length - 1]: {
                        fontStyle: 'bold',
                        fillColor: [255, 215, 0],
                        textColor: [0, 0, 0],
                        fontSize: 8
                    }
                },
                didDrawPage: function (data) {
                    // Footer is added after table generation
                }
            });

            // Add footer to Page 4
            doc.setPage(4);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Page 4 of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );

            // Save PDF
            doc.save(`revenue_cross_entry_account_${appliedFilters.year}.pdf`);
            alert('PDF exported successfully!');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to round to 2 decimal places
    const roundToTwo = (num) => {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    };

    // Export CSV
    const handleExportCSV = async () => {
        if (records.length === 0) {
            alert('No data to export');
            return;
        }

        setLoading(true);
        try {
            const params = {
                year: appliedFilters.year
            };

            const response = await apiClient.get('/revenue-cross-entry-account/export-csv', { params });

            if (response.status === 200) {
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `revenue_cross_entry_account_${appliedFilters.year}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                alert('CSV exported successfully!');
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export CSV: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const refreshData = () => {
        fetchFilterOptions();
        if (appliedFilters.year) {
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
                        <h1 className="text-2xl font-bold text-gray-800">Revenue Cross Entry Account Report</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View revenue cross entry by month with classification (Monthly Fincances)
                        </p>
                    </div>
                    {appliedFilters.year && (
                        <div className="bg-blue-50 rounded-lg px-3 py-2">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Selected:</span> {appliedFilters.year}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            {appliedFilters.year && records.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                        <p className="text-sm opacity-90">Total Records</p>
                        <p className="text-xl font-bold mt-1">{totalRecords}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                        <p className="text-sm opacity-90">Total Revenue</p>
                        <p className="text-xl font-bold mt-1">Rs{formatNumber(totals.total || 0)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                        <p className="text-sm opacity-90">Year</p>
                        <p className="text-xl font-bold mt-1">{appliedFilters.year}</p>
                    </div>
                </div>
            )}

            {/* Active Filters Display */}
            {appliedFilters.year && (
                <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
                        {appliedFilters.year && (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                                <Calendar size={12} className="mr-1" />
                                Year: {appliedFilters.year}
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
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-2 py-2 text-left font-semibold text-gray-700 min-w-[300px]">
                                    Revenue Code Name
                                </th>
                                <th className="px-2 py-2 text-left font-semibold text-gray-700 min-w-[100px]">
                                    Revenue Code
                                </th>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                                    <th key={month} className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[60px]">
                                        {monthNames[month].substring(0, 3)}
                                    </th>
                                ))}
                                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[70px] bg-blue-50">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {!appliedFilters.year ? (
                                <tr>
                                    <td colSpan="16" className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Filter size={40} className="text-gray-300" />
                                            <p>Please select a Year to view data</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="16" className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <p>No records found for the selected year.</p>
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
                                        <td className="px-2 py-2 font-medium text-gray-900">
                                            {record.revenue_code_name || '-'}
                                        </td>
                                        <td className="px-2 py-2 text-gray-700 font-medium">
                                            {formatCombinedCode(record)}
                                        </td>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                                            <td key={month} className="px-2 py-2 text-right text-gray-700">
                                                {formatNumber(record.months?.[month] || 0)}
                                            </td>
                                        ))}
                                        <td className="px-2 py-2 text-right text-blue-600 font-bold bg-blue-50">
                                            {formatNumber(record.total || 0)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {paginatedRecords.length > 0 && (
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr className="font-semibold">
                                    <td className="px-2 py-2 text-right text-gray-700" colSpan="2">
                                        TOTAL
                                    </td>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                                        <td key={month} className="px-2 py-2 text-right text-gray-700">
                                            {formatNumber(totals.months?.[month] || 0)}
                                        </td>
                                    ))}
                                    <td className="px-2 py-2 text-right text-blue-700 bg-blue-50">
                                        {formatNumber(totals.total || 0)}
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
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Filter Revenue Cross Entry Account</h3>
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Shows revenue cross entry data for all 12 months
                                </p>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-blue-700">
                                    <strong>Data Source:</strong> Monthly Fincances table (dr_cr_code=4000, dr_cr=CR)
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    <strong>Grouped by:</strong> Head, Program, Project, Sub Project, Object
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    <strong>Total:</strong> Sum of all 12 months
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
                                disabled={!filters.year}
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

export default RevenueCrossEntryAccountPanel;