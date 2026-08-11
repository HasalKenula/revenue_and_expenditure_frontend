
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

const ActualRevenueReportPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedMonthName, setSelectedMonthName] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [province, setProvince] = useState('Southern');

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
    if (value === undefined || value === null) return '0';
    return parseFloat(value).toLocaleString('en-US');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchRecords = async () => {
    if (!appliedFilters.year || !appliedFilters.month) {
      setReportData({});
      setSelectedMonthName('');
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        month: appliedFilters.month
      };

      const response = await apiClient.get('/actual-revenue-report/data', { params });

      if (response.data.success) {
        const data = response.data.data;
        setReportData(data.report_data || {});
        setSelectedMonthName(data.month_name || '');
        setSelectedYear(data.year || '');
        setProvince(data.province || 'Southern');

        const total = Object.keys(data.report_data || {}).length;
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

  const fetchFilterOptions = async () => {
    try {
      const response = await apiClient.get('/actual-revenue-report/filter-options');

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
    if (!filters.year || !filters.month) {
      alert('Please select both Year and Month');
      return;
    }
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({ year: '', month: '' });
    setAppliedFilters({ year: '', month: '' });
    setReportData({});
    setSelectedMonthName('');
    setSelectedYear('');
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
  };

  const handleExportPDF = () => {
    if (Object.keys(reportData).length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ===== HEADER with Decoration =====
      
      // Top color bar
      doc.setFillColor(26, 86, 219);
      doc.rect(10, 8, pageWidth - 20, 3, 'F');
      
      doc.setFillColor(59, 130, 246);
      doc.rect(10, 11, pageWidth - 20, 2, 'F');
      
      doc.setFillColor(147, 197, 253);
      doc.rect(10, 13, pageWidth - 20, 1, 'F');

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 86, 219);
      doc.text('MONTHLY REVENUE REPORT', pageWidth / 2, 28, { align: 'center' });

      // Subtitle
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      const monthText = selectedMonthName || monthNames[appliedFilters.month] || '';
      const yearText = selectedYear || appliedFilters.year || '';
      doc.text(`Year: ${yearText}  |  Month: ${monthText}  |  Province: ${province}  |  (Rs.'000)`, pageWidth / 2, 36, { align: 'center' });

      // Generation date
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 20, 43, { align: 'right' });

      // Bottom border line
      doc.setDrawColor(26, 86, 219);
      doc.setLineWidth(0.5);
      doc.line(10, 47, pageWidth - 10, 47);

      // ===== TABLE =====
      
      const tableHeaders = [
        '#',
        'Head & Sub Head of Revenue',
        'Code',
        `Provincial Estimate`,
        '(1) Upto end of Previous Month',
        '(2) For Current Month',
        '(3) Upto end of Current Month(1+2)',
        '(4) Upto end of Previous Month',
        '(5) For Current Month',
        '(6) Upto end of Current Month(4+5)'
      ];

      const tableBody = [];
      let grandTotalData = null;

      // Define section colors
      const sectionColors = {
        'A': [219, 234, 254],
        'B': [209, 250, 229],
        'C': [254, 243, 199],
        'D': [252, 228, 236],
        'E': [224, 231, 255],
        'F': [243, 244, 246]
      };

      Object.keys(reportData).forEach(sectionKey => {
        if (sectionKey === 'GRAND_TOTAL') {
          grandTotalData = reportData[sectionKey];
          return;
        }

        const section = reportData[sectionKey];
        if (!section.items || section.items.length === 0) return;

        const bgColor = sectionColors[sectionKey] || [243, 244, 246];

        // Section header
        tableBody.push([
          { content: sectionKey, styles: { fontStyle: 'bold', fillColor: bgColor, textColor: [30, 64, 175] } },
          { content: section.title, colSpan: 2, styles: { fontStyle: 'bold', fillColor: bgColor, textColor: [30, 64, 175] } },
          { content: '', styles: { fillColor: bgColor } },
          { content: '', styles: { fillColor: bgColor } },
          { content: '', styles: { fillColor: bgColor } },
          { content: '', styles: { fillColor: bgColor } },
          { content: '', styles: { fillColor: bgColor } },
          { content: '', styles: { fillColor: bgColor } },
          { content: '', styles: { fillColor: bgColor } }
        ]);

        // Items
        let itemCounter = 0;
        section.items.forEach(item => {
          if (item.is_subtotal) {
            tableBody.push([
              { content: '', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
              { content: item.name, colSpan: 1, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
              { content: '', styles: { fillColor: [240, 240, 240] } },
              { content: formatNumber(item.scheduled_target || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } },
              { content: formatNumber(item.previous_month || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } },
              { content: formatNumber(item.revenue_value || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } },
              { content: formatNumber(item.cumulative_revenue || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } },
              { content: formatNumber(item.scheduled_previous || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } },
              { content: formatNumber(item.scheduled_current || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } },
              { content: formatNumber(item.cumulative_scheduled || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } }
            ]);
          } else {
            itemCounter++;
            const code = item.code || '';
            const name = item.name || '';
            
            tableBody.push([
              itemCounter,
              name,
              { content: code, styles: { font: 'courier', fontSize: 7, textColor: [75, 85, 99] } },
              { content: formatNumber(item.scheduled_target || 0), styles: { halign: 'right' } },
              { content: formatNumber(item.previous_month || 0), styles: { halign: 'right' } },
              { content: formatNumber(item.revenue_value || 0), styles: { halign: 'right' } },
              { content: formatNumber(item.cumulative_revenue || 0), styles: { halign: 'right', fontStyle: 'bold' } },
              { content: formatNumber(item.scheduled_previous || 0), styles: { halign: 'right' } },
              { content: formatNumber(item.scheduled_current || 0), styles: { halign: 'right' } },
              { content: formatNumber(item.cumulative_scheduled || 0), styles: { halign: 'right', fontStyle: 'bold' } }
            ]);
          }
        });
      });

      // Grand Total
      if (grandTotalData) {
        tableBody.push([
          { content: '', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [26, 86, 219], textColor: [255, 255, 255] } },
          { content: 'Grand Total (E+F)', colSpan: 1, styles: { fontStyle: 'bold', fillColor: [26, 86, 219], textColor: [255, 255, 255] } },
          { content: formatNumber(grandTotalData.total_revenue || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [26, 86, 219], textColor: [255, 255, 255] } },
          { content: formatNumber(grandTotalData.total_revenue || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [26, 86, 219], textColor: [255, 255, 255] } },
          { content: formatNumber(grandTotalData.total_cumulative || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [26, 86, 219], textColor: [255, 255, 255] } },
          { content: formatNumber(grandTotalData.total_scheduled || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [26, 86, 219], textColor: [255, 255, 255] } },
          { content: formatNumber(grandTotalData.total_scheduled || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [26, 86, 219], textColor: [255, 255, 255] } },
          { content: formatNumber(grandTotalData.total_cumulative_scheduled || 0), styles: { halign: 'right', fontStyle: 'bold', fillColor: [26, 86, 219], textColor: [255, 255, 255] } }
        ]);
      }

      autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: 53,
        theme: 'grid',
        headStyles: {
          fillColor: [26, 86, 219],
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 2
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 65 },
          2: { cellWidth: 28, halign: 'center' },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 32, halign: 'right' },
          5: { cellWidth: 28, halign: 'right' },
          6: { cellWidth: 32, halign: 'right' },
          7: { cellWidth: 32, halign: 'right' },
          8: { cellWidth: 28, halign: 'right' },
          9: { cellWidth: 32, halign: 'right' }
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { top: 53, left: 10, right: 10, bottom: 15 },
        didDrawPage: function(data) {
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Footer line
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.3);
            doc.line(15, pageHeight - 10, pageWidth - 15, pageHeight - 10);
            
            // Footer text
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(107, 114, 128);
            doc.text(
              'Monthly Revenue Report',
              15,
              pageHeight - 4,
              { align: 'left' }
            );
            doc.text(
              `Page ${i} of ${pageCount}`,
              pageWidth - 15,
              pageHeight - 4,
              { align: 'right' }
            );
          }
        }
      });

      doc.save(`Monthly_Revenue_Report_${yearText}_${monthText}.pdf`);
      alert('PDF exported successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

//   const handleExportCSV = () => {
//     if (Object.keys(reportData).length === 0) {
//       alert('No data to export');
//       return;
//     }

//     let csvContent = 'Monthly Revenue Report\n';
//     csvContent += `Year - ${selectedYear}, Month - ${selectedMonthName}, Province - ${province}\n\n`;
    
//     const headers = ['#', 'Head & Sub Head of Revenue', 'Code', `Provincial Estimate`, 
//                      '(1) Upto end of Previous Month', '(2) For Current Month', '(3) Upto end of Current Month',
//                      '(4) Upto end of Previous Month', '(5) For Current Month', '(6) Upto end of Current Month'];
//     csvContent += headers.join(',') + '\n';

//     Object.keys(reportData).forEach(sectionKey => {
//       if (sectionKey === 'GRAND_TOTAL') return;
      
//       const section = reportData[sectionKey];
//       if (!section.items || section.items.length === 0) return;
      
//       csvContent += `"${sectionKey}","${section.title}",,,,,,,,\n`;
      
//       let itemCounter = 0;
//       section.items.forEach(item => {
//         if (item.is_subtotal) {
//           csvContent += `,"${item.name}",,${formatNumber(item.scheduled_target || 0)},${formatNumber(item.previous_month || 0)},${formatNumber(item.revenue_value || 0)},${formatNumber(item.cumulative_revenue || 0)},${formatNumber(item.scheduled_previous || 0)},${formatNumber(item.scheduled_current || 0)},${formatNumber(item.cumulative_scheduled || 0)}\n`;
//         } else {
//           itemCounter++;
//           const code = item.code || '';
//           const name = item.name || '';
//           csvContent += `${itemCounter},"${name}","${code}",${formatNumber(item.scheduled_target || 0)},${formatNumber(item.previous_month || 0)},${formatNumber(item.revenue_value || 0)},${formatNumber(item.cumulative_revenue || 0)},${formatNumber(item.scheduled_previous || 0)},${formatNumber(item.scheduled_current || 0)},${formatNumber(item.cumulative_scheduled || 0)}\n`;
//         }
//       });
//     });

//     const grandTotal = reportData['GRAND_TOTAL'];
//     if (grandTotal) {
//       csvContent += `,,,Grand Total (E+F),${formatNumber(grandTotal.total_revenue || 0)},${formatNumber(grandTotal.total_revenue || 0)},${formatNumber(grandTotal.total_cumulative || 0)},${formatNumber(grandTotal.total_scheduled || 0)},${formatNumber(grandTotal.total_scheduled || 0)},${formatNumber(grandTotal.total_cumulative_scheduled || 0)}\n`;
//     }

//     const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `Monthly_Revenue_Report_${selectedYear}_${selectedMonthName}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//     alert('CSV exported successfully!');
//   };

const handleExportCSV = () => {
  if (Object.keys(reportData).length === 0) {
    alert('No data to export');
    return;
  }

  let csvContent = 'Monthly Revenue Report\n';
  csvContent += `Year - ${selectedYear}, Month - ${selectedMonthName}, Province - ${province}\n\n`;
  
  const headers = ['#', 'Head & Sub Head of Revenue', 'Code', `Provincial Estimate`, 
                   '(1) Upto end of Previous Month', '(2) For Current Month', '(3) Upto end of Current Month',
                   '(4) Upto end of Previous Month', '(5) For Current Month', '(6) Upto end of Current Month'];
  csvContent += headers.join(',') + '\n';

  // Format number WITHOUT commas - for CSV compatibility
  const formatNumberForCSV = (value) => {
    if (value === undefined || value === null || value === '') return '0';
    // Remove commas and keep only raw number
    return parseFloat(value).toFixed(2);
  };

  // Format number with commas for display
  const formatNumberDisplay = (value) => {
    if (value === undefined || value === null || value === '') return '0';
    return parseFloat(value).toLocaleString('en-US');
  };

  Object.keys(reportData).forEach(sectionKey => {
    if (sectionKey === 'GRAND_TOTAL') return;
    
    const section = reportData[sectionKey];
    if (!section.items || section.items.length === 0) return;
    
    csvContent += `"${sectionKey}","${section.title}",,,,,,,,\n`;
    
    let itemCounter = 0;
    section.items.forEach(item => {
      if (item.is_subtotal) {
        csvContent += `,"${item.name}",,${formatNumberForCSV(item.scheduled_target || 0)},${formatNumberForCSV(item.previous_month || 0)},${formatNumberForCSV(item.revenue_value || 0)},${formatNumberForCSV(item.cumulative_revenue || 0)},${formatNumberForCSV(item.scheduled_previous || 0)},${formatNumberForCSV(item.scheduled_current || 0)},${formatNumberForCSV(item.cumulative_scheduled || 0)}\n`;
      } else {
        itemCounter++;
        const code = item.code || '';
        const name = item.name || '';
        csvContent += `${itemCounter},"${name}","${code}",${formatNumberForCSV(item.scheduled_target || 0)},${formatNumberForCSV(item.previous_month || 0)},${formatNumberForCSV(item.revenue_value || 0)},${formatNumberForCSV(item.cumulative_revenue || 0)},${formatNumberForCSV(item.scheduled_previous || 0)},${formatNumberForCSV(item.scheduled_current || 0)},${formatNumberForCSV(item.cumulative_scheduled || 0)}\n`;
      }
    });
  });

  const grandTotal = reportData['GRAND_TOTAL'];
  if (grandTotal) {
    csvContent += `,,,Grand Total (E+F),${formatNumberForCSV(grandTotal.total_revenue || 0)},${formatNumberForCSV(grandTotal.total_revenue || 0)},${formatNumberForCSV(grandTotal.total_cumulative || 0)},${formatNumberForCSV(grandTotal.total_scheduled || 0)},${formatNumberForCSV(grandTotal.total_scheduled || 0)},${formatNumberForCSV(grandTotal.total_cumulative_scheduled || 0)}\n`;
  }

  // Add BOM for UTF-8 Excel compatibility and use semicolon as delimiter to avoid conflicts
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Monthly_Revenue_Report_${selectedYear}_${selectedMonthName}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  alert('CSV exported successfully!');
};

  const refreshData = () => {
    fetchFilterOptions();
    if (appliedFilters.year && appliedFilters.month) {
      fetchRecords();
    }
  };

  const getMonthDisplay = (month) => {
    if (!month) return '';
    return monthNames[month] || `Month ${month}`;
  };

  const renderRevenueTable = () => {
    if (Object.keys(reportData).length === 0) {
      return (
        <tr>
          <td colSpan="10" className="text-center py-12 text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <Filter size={40} className="text-gray-300" />
              <p>Please select Year and Month to view data</p>
            </div>
          </td>
        </tr>
      );
    }

    const rows = [];

    Object.keys(reportData).forEach(sectionKey => {
      if (sectionKey === 'GRAND_TOTAL') return;

      const section = reportData[sectionKey];
      if (!section.items || section.items.length === 0) return;

      // Section header with color
      const sectionColors = {
        'A': 'bg-blue-100',
        'B': 'bg-green-100',
        'C': 'bg-yellow-100',
        'D': 'bg-red-100',
        'E': 'bg-indigo-100',
        'F': 'bg-gray-100'
      };
      const colorClass = sectionColors[sectionKey] || 'bg-gray-200';

      rows.push(
        <tr key={`section-${sectionKey}`} className={`${colorClass} border-t-2 border-blue-200`}>
          <td className="px-2 py-2 font-bold text-blue-800 text-center">{sectionKey}</td>
          <td colSpan="9" className="px-2 py-2 font-bold text-blue-800">{section.title}</td>
        </tr>
      );

      let itemCounter = 0;
      section.items.forEach((item, index) => {
        if (item.is_subtotal) {
          rows.push(
            <tr key={`subtotal-${sectionKey}-${index}`} className="bg-gray-100 font-bold">
              <td className="px-2 py-2"></td>
              <td className="px-2 py-2">{item.name}</td>
              <td className="px-2 py-2"></td>
              <td className="px-2 py-2 text-right">{formatNumber(item.scheduled_target || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.previous_month || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.revenue_value || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.cumulative_revenue || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.scheduled_previous || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.scheduled_current || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.cumulative_scheduled || 0)}</td>
            </tr>
          );
        } else {
          itemCounter++;
          const code = item.code || '';
          const name = item.name || '';
          
          rows.push(
            <tr key={`item-${sectionKey}-${index}`} className="hover:bg-gray-50 border-b border-gray-100">
              <td className="px-2 py-2 text-center">{itemCounter}</td>
              <td className="px-2 py-2">{name}</td>
              <td className="px-2 py-2 text-center text-xs text-gray-500">{code}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.scheduled_target || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.previous_month || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.revenue_value || 0)}</td>
              <td className="px-2 py-2 text-right font-semibold">{formatNumber(item.cumulative_revenue || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.scheduled_previous || 0)}</td>
              <td className="px-2 py-2 text-right">{formatNumber(item.scheduled_current || 0)}</td>
              <td className="px-2 py-2 text-right font-semibold">{formatNumber(item.cumulative_scheduled || 0)}</td>
            </tr>
          );
        }
      });
    });

    const grandTotal = reportData['GRAND_TOTAL'];
    if (grandTotal) {
      rows.push(
        <tr key="grand-total" className="bg-blue-600 text-white font-bold">
          <td colSpan="3" className="px-2 py-2">Grand Total (E+F)</td>
          <td className="px-2 py-2 text-right">{formatNumber(grandTotal.total_scheduled || 0)}</td>
          <td className="px-2 py-2 text-right">{formatNumber(grandTotal.total_revenue || 0)}</td>
          <td className="px-2 py-2 text-right">{formatNumber(grandTotal.total_revenue || 0)}</td>
          <td className="px-2 py-2 text-right">{formatNumber(grandTotal.total_cumulative || 0)}</td>
          <td className="px-2 py-2 text-right">{formatNumber(grandTotal.total_scheduled || 0)}</td>
          <td className="px-2 py-2 text-right">{formatNumber(grandTotal.total_scheduled || 0)}</td>
          <td className="px-2 py-2 text-right">{formatNumber(grandTotal.total_cumulative_scheduled || 0)}</td>
        </tr>
      );
    }

    return rows;
  };

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
            <h1 className="text-2xl font-bold text-gray-800">Monthly Revenue Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              Actual revenue collection with scheduled targets
            </p>
          </div>
          {appliedFilters.year && appliedFilters.month && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Selected:</span> {getMonthDisplay(appliedFilters.month)} {appliedFilters.year}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {appliedFilters.year && appliedFilters.month && Object.keys(reportData).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Categories</p>
            <p className="text-xl font-bold mt-1">{Object.keys(reportData).filter(k => k !== 'GRAND_TOTAL').length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Revenue Items</p>
            <p className="text-xl font-bold mt-1">
              {Object.keys(reportData).reduce((count, key) => {
                if (key === 'GRAND_TOTAL') return count;
                return count + (reportData[key].items?.filter(i => !i.is_subtotal).length || 0);
              }, 0)}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Revenue</p>
            <p className="text-xl font-bold mt-1">Rs {formatNumber(reportData['GRAND_TOTAL']?.total_cumulative || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Total Scheduled</p>
            <p className="text-xl font-bold mt-1">Rs {formatNumber(reportData['GRAND_TOTAL']?.total_cumulative_scheduled || 0)}</p>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(appliedFilters.year || appliedFilters.month) && (
        <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-700">Applied Filters:</span>
            {appliedFilters.year && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                Year: {appliedFilters.year}
              </span>
            )}
            {appliedFilters.month && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                <Calendar size={12} className="mr-1" />
                Month: {getMonthDisplay(appliedFilters.month)}
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
          disabled={Object.keys(reportData).length === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${
            Object.keys(reportData).length > 0
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FileText size={16} />
          <span>Export PDF</span>
        </button>
        <button
          onClick={handleExportCSV}
          disabled={Object.keys(reportData).length === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${
            Object.keys(reportData).length > 0
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
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-center font-semibold text-gray-700 min-w-[30px]">#</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 min-w-[200px]">Head & Sub Head of Revenue</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-700 min-w-[80px]">Code</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[100px]">Provincial Estimate</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[100px]">(1) Upto end of Previous Month</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[100px]">(2) For Current Month</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[100px]">(3) Upto end of Current Month</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[100px]">(4) Upto end of Previous Month</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[100px]">(5) For Current Month</th>
                <th className="px-2 py-2 text-right font-semibold text-gray-700 min-w-[100px]">(6) Upto end of Current Month</th>
              </tr>
            </thead>
            <tbody>
              {renderRevenueTable()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter Revenue Report</h3>
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
                <p className="text-xs text-gray-500 mt-1">
                  Shows revenue data for the selected month
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

export default ActualRevenueReportPanel;