// src/components/CBGPanel.jsx
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
  BarChart3,
  Building2,
  LineChart,
  GraduationCap,
  Table as TableIcon,
  PawPrint,
  Sprout,
  Mountain,
  Users
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

const CBGPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mainMinistryData, setMainMinistryData] = useState([]);
  const [educationMinistryData, setEducationMinistryData] = useState([]);
  const [animalMinistryData, setAnimalMinistryData] = useState([]);
  const [agricultureMinistryData, setAgricultureMinistryData] = useState([]);
  const [landMinistryData, setLandMinistryData] = useState([]);
  const [mainSecretaryData, setMainSecretaryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [months, setMonths] = useState([]);
  const [monthNamesList, setMonthNamesList] = useState({});
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [viewType, setViewType] = useState('cumulative');
  const [totals, setTotals] = useState({
    main_total_debit: 0,
    main_total_other_debit: 0,
    main_total_expenditure: 0,
    edu_total_debit: 0,
    edu_total_other_debit: 0,
    edu_total_expenditure: 0,
    animal_total_debit: 0,
    animal_total_other_debit: 0,
    animal_total_expenditure: 0,
    agri_total_debit: 0,
    agri_total_other_debit: 0,
    agri_total_expenditure: 0,
    land_total_debit: 0,
    land_total_other_debit: 0,
    land_total_expenditure: 0,
    secretary_total_debit: 0,
    secretary_total_other_debit: 0,
    secretary_total_expenditure: 0
  });

  const [filters, setFilters] = useState({
    year: '',
    month: '',
    view_type: 'cumulative'
  });

  const [appliedFilters, setAppliedFilters] = useState({
    year: '',
    month: '',
    view_type: 'cumulative'
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
      setMainMinistryData([]);
      setEducationMinistryData([]);
      setAnimalMinistryData([]);
      setAgricultureMinistryData([]);
      setLandMinistryData([]);
      setMainSecretaryData([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        month: appliedFilters.month,
        view_type: appliedFilters.view_type || 'cumulative'
      };

      const response = await apiClient.get('/cbg/data', { params });

      if (response.data.success) {
        const mainData = response.data.data.main_ministry || [];
        const eduData = response.data.data.education_ministry || [];
        const animalData = response.data.data.animal_ministry || [];
        const agriData = response.data.data.agriculture_ministry || [];
        const landData = response.data.data.land_ministry || [];
        const secretaryData = response.data.data.main_secretary || [];

        setMainMinistryData(mainData);
        setEducationMinistryData(eduData);
        setAnimalMinistryData(animalData);
        setAgricultureMinistryData(agriData);
        setLandMinistryData(landData);
        setMainSecretaryData(secretaryData);
        setMonths(response.data.data.months || []);
        setMonthNamesList(response.data.data.month_names || {});
        setSelectedYear(response.data.data.filters?.year || '');
        setSelectedMonth(response.data.data.filters?.month || '');
        setViewType(response.data.data.filters?.view_type || 'cumulative');

        // Calculate totals for Main Ministry
        let mainTotalDebit = 0;
        let mainTotalOtherDebit = 0;
        let mainTotalExpenditure = 0;

        mainData.forEach(record => {
          if (record.subject_name !== 'Total') {
            mainTotalDebit += record.debit || 0;
            mainTotalOtherDebit += record.other_debit || 0;
            mainTotalExpenditure += record.total_expenditure || 0;
          }
        });

        // Calculate totals for Education Ministry
        let eduTotalDebit = 0;
        let eduTotalOtherDebit = 0;
        let eduTotalExpenditure = 0;

        eduData.forEach(record => {
          if (record.subject_name !== 'Total') {
            eduTotalDebit += record.debit || 0;
            eduTotalOtherDebit += record.other_debit || 0;
            eduTotalExpenditure += record.total_expenditure || 0;
          }
        });

        // Calculate totals for Animal Ministry
        let animalTotalDebit = 0;
        let animalTotalOtherDebit = 0;
        let animalTotalExpenditure = 0;

        animalData.forEach(record => {
          if (record.subject_name !== 'Total') {
            animalTotalDebit += record.debit || 0;
            animalTotalOtherDebit += record.other_debit || 0;
            animalTotalExpenditure += record.total_expenditure || 0;
          }
        });

        // Calculate totals for Agriculture Ministry
        let agriTotalDebit = 0;
        let agriTotalOtherDebit = 0;
        let agriTotalExpenditure = 0;

        agriData.forEach(record => {
          if (record.subject_name !== 'Total') {
            agriTotalDebit += record.debit || 0;
            agriTotalOtherDebit += record.other_debit || 0;
            agriTotalExpenditure += record.total_expenditure || 0;
          }
        });

        // Calculate totals for Land Ministry
        let landTotalDebit = 0;
        let landTotalOtherDebit = 0;
        let landTotalExpenditure = 0;

        landData.forEach(record => {
          if (record.subject_name !== 'Total') {
            landTotalDebit += record.debit || 0;
            landTotalOtherDebit += record.other_debit || 0;
            landTotalExpenditure += record.total_expenditure || 0;
          }
        });

        // Calculate totals for Main Secretary Ministry
        let secretaryTotalDebit = 0;
        let secretaryTotalOtherDebit = 0;
        let secretaryTotalExpenditure = 0;

        secretaryData.forEach(record => {
          if (record.subject_name !== 'Total') {
            secretaryTotalDebit += record.debit || 0;
            secretaryTotalOtherDebit += record.other_debit || 0;
            secretaryTotalExpenditure += record.total_expenditure || 0;
          }
        });

        setTotals({
          main_total_debit: mainTotalDebit,
          main_total_other_debit: mainTotalOtherDebit,
          main_total_expenditure: mainTotalExpenditure,
          edu_total_debit: eduTotalDebit,
          edu_total_other_debit: eduTotalOtherDebit,
          edu_total_expenditure: eduTotalExpenditure,
          animal_total_debit: animalTotalDebit,
          animal_total_other_debit: animalTotalOtherDebit,
          animal_total_expenditure: animalTotalExpenditure,
          agri_total_debit: agriTotalDebit,
          agri_total_other_debit: agriTotalOtherDebit,
          agri_total_expenditure: agriTotalExpenditure,
          land_total_debit: landTotalDebit,
          land_total_other_debit: landTotalOtherDebit,
          land_total_expenditure: landTotalExpenditure,
          secretary_total_debit: secretaryTotalDebit,
          secretary_total_other_debit: secretaryTotalOtherDebit,
          secretary_total_expenditure: secretaryTotalExpenditure
        });

        const total = mainData.length + eduData.length + animalData.length + agriData.length + landData.length + secretaryData.length;
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
      const response = await apiClient.get('/cbg/filter-options');

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
      alert('Please select a Year');
      return;
    }
    if (!filters.month) {
      alert('Please select a Month');
      return;
    }
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({ year: '', month: '', view_type: 'cumulative' });
    setAppliedFilters({ year: '', month: '', view_type: 'cumulative' });
    setMainMinistryData([]);
    setEducationMinistryData([]);
    setAnimalMinistryData([]);
    setAgricultureMinistryData([]);
    setLandMinistryData([]);
    setMainSecretaryData([]);
    setTotals({
      main_total_debit: 0,
      main_total_other_debit: 0,
      main_total_expenditure: 0,
      edu_total_debit: 0,
      edu_total_other_debit: 0,
      edu_total_expenditure: 0,
      animal_total_debit: 0,
      animal_total_other_debit: 0,
      animal_total_expenditure: 0,
      agri_total_debit: 0,
      agri_total_other_debit: 0,
      agri_total_expenditure: 0,
      land_total_debit: 0,
      land_total_other_debit: 0,
      land_total_expenditure: 0,
      secretary_total_debit: 0,
      secretary_total_other_debit: 0,
      secretary_total_expenditure: 0
    });
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
    setMonths([]);
    setMonthNamesList({});
  };



  // const handleExportPDF = () => {
  //   if (mainMinistryData.length === 0 && educationMinistryData.length === 0 &&
  //     animalMinistryData.length === 0 && agricultureMinistryData.length === 0 &&
  //     landMinistryData.length === 0 && mainSecretaryData.length === 0) {
  //     alert('No data to export');
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const doc = new jsPDF({
  //       orientation: 'portrait',
  //       unit: 'mm',
  //       format: 'a4'
  //     });

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const currentDate = new Date().toLocaleString();
  //     const monthText = monthNames[appliedFilters.month] || appliedFilters.month;

  //     // Header
  //     doc.setFontSize(16);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('CBG Report', pageWidth / 2, 15, { align: 'center' });

  //     doc.setFontSize(10);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 22, { align: 'center' });

  //     // Filter information
  //     let filterText = `Year: ${appliedFilters.year} | Month: ${monthText}`;
  //     if (appliedFilters.view_type === 'cumulative') {
  //       filterText += ` | View: Cumulative (Jan - ${monthText})`;
  //     } else {
  //       filterText += ` | View: Monthly (${monthText})`;
  //     }
  //     doc.setFontSize(9);
  //     doc.text(filterText, pageWidth / 2, 29, { align: 'center' });

  //     doc.setDrawColor(200, 200, 200);
  //     doc.line(15, 40, pageWidth - 15, 40);


  //     // Table headers
  //     const tableHeaders = ['TR No', 'Program', 'Project', 'Sub Project', 'Object', 'Subject Name', 'Debit', 'Other Debit', 'Total Expenditure'];

  //     // Prepare all tables data
  //     const tables = [
  //       { data: mainMinistryData, title: 'MAIN MINISTRY (TRNO: 304)', color: [41, 128, 185] },
  //       { data: educationMinistryData, title: 'EDUCATION MINISTRY (TRNO: 318)', color: [41, 128, 185] },
  //       { data: animalMinistryData, title: 'ANIMAL MINISTRY (TRNO: 311)', color: [41, 128, 185] },
  //       { data: agricultureMinistryData, title: 'AGRICULTURE MINISTRY (TRNO: 314)', color: [41, 128, 185] },
  //       { data: landMinistryData, title: 'LAND MINISTRY (TRNO: 308)', color: [41, 128, 185] },
  //       { data: mainSecretaryData, title: 'MAIN SECRETARY MINISTRY (TRNO: 320)', color: [41, 128, 185] }
  //     ];

  //     let startY = 35;

  //     // Process each table
  //     tables.forEach((table, index) => {
  //       if (table.data.length === 0) return;

  //       // Calculate table width to center it
  //       const columnWidths = [16, 16, 16, 18, 16, 24, 20, 22, 22];
  //       const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0);
  //       const leftMargin = (pageWidth - totalTableWidth) / 2;

  //       // Add new page if needed (except for first table)
  //       if (index > 0 && startY > 200) {
  //         doc.addPage();
  //         startY = 25;
  //       }

  //       // Add space between tables (10mm gap)
  //       if (index > 0) {
  //         startY += 10;
  //       }

  //       // Table title
  //       doc.setFontSize(10);
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(table.color[0], table.color[1], table.color[2]);
  //       doc.text(table.title, pageWidth / 2, startY, { align: 'center' });

  //       // Prepare table body
  //       const tableBody = table.data.map(record => [
  //         record.trno ,
  //         record.program ,
  //         record.project ,
  //         record.sub_project ,
  //         record.object ,
  //         record.subject_name ,
  //         formatNumber(record.debit),
  //         formatNumber(record.other_debit),
  //         formatNumber(record.total_expenditure)
  //       ]);

  //       // Generate table with centered position
  //       autoTable(doc, {
  //         head: [tableHeaders],
  //         body: tableBody,
  //         startY: startY + 5,
  //         theme: 'striped',
  //         headStyles: {
  //           fillColor: table.color,
  //           textColor: [255, 255, 255],
  //           fontSize: 7,
  //           fontStyle: 'bold',
  //           halign: 'center',
  //           cellPadding: 2
  //         },
  //         bodyStyles: {
  //           fontSize: 6,
  //           cellPadding: 2
  //         },
  //         columnStyles: {
  //           0: { cellWidth: 16, halign: 'center' },
  //           1: { cellWidth: 16, halign: 'center' },
  //           2: { cellWidth: 16, halign: 'center' },
  //           3: { cellWidth: 18, halign: 'center' },
  //           4: { cellWidth: 16, halign: 'center' },
  //           5: { cellWidth: 24, halign: 'left' },
  //           6: { cellWidth: 20, halign: 'right' },
  //           7: { cellWidth: 22, halign: 'right' },
  //           8: { cellWidth: 22, halign: 'right' }
  //         },
  //         alternateRowStyles: { fillColor: [245, 245, 245] },
  //         margin: { left: leftMargin, right: leftMargin },
  //         tableWidth: 'auto'
  //       });

  //       // Update start position for next table with more space
  //       startY = doc.lastAutoTable.finalY + 12;
  //     });

  //     // Add Summary Page
  //     doc.addPage();

  //     doc.setFontSize(16);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(41, 128, 185);
  //     doc.text('SUMMARY', pageWidth / 2, 20, { align: 'center' });

  //     doc.setFontSize(10);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text('Ministry-wise Total Expenditure Summary', pageWidth / 2, 28, { align: 'center' });

  //     const summaryData = [
  //       ['Main Ministry', '304', formatNumber(totals.main_total_expenditure)],
  //       ['Education Ministry', '318', formatNumber(totals.edu_total_expenditure)],
  //       ['Animal Ministry', '311', formatNumber(totals.animal_total_expenditure)],
  //       ['Agriculture Ministry', '314', formatNumber(totals.agri_total_expenditure)],
  //       ['Land Ministry', '308', formatNumber(totals.land_total_expenditure)],
  //       ['Main Secretary Ministry', '320', formatNumber(totals.secretary_total_expenditure)]
  //     ];

  //     const grandTotal = parseFloat(totals.main_total_expenditure) +
  //       parseFloat(totals.edu_total_expenditure) +
  //       parseFloat(totals.animal_total_expenditure) +
  //       parseFloat(totals.agri_total_expenditure) +
  //       parseFloat(totals.land_total_expenditure) +
  //       parseFloat(totals.secretary_total_expenditure);

  //     summaryData.push(['GRAND TOTAL', '', formatNumber(grandTotal)]);

  //     // Calculate summary table width to center it
  //     const summaryColumnWidths = [80, 40, 60];
  //     const summaryTotalWidth = summaryColumnWidths.reduce((a, b) => a + b, 0);
  //     const summaryLeftMargin = (pageWidth - summaryTotalWidth) / 2;

  //     autoTable(doc, {
  //       head: [['Ministry', 'TRNO', 'Total Expenditure (Rs)']],
  //       body: summaryData,
  //       startY: 35,
  //       theme: 'striped',
  //       headStyles: {
  //         fillColor: [41, 128, 185],
  //         textColor: [255, 255, 255],
  //         fontSize: 9,
  //         fontStyle: 'bold',
  //         halign: 'center',
  //         cellPadding: 3
  //       },
  //       bodyStyles: {
  //         fontSize: 8,
  //         cellPadding: 3
  //       },
  //       columnStyles: {
  //         0: { cellWidth: 80, halign: 'left' },
  //         1: { cellWidth: 40, halign: 'center' },
  //         2: { cellWidth: 60, halign: 'right' }
  //       },
  //       alternateRowStyles: { fillColor: [245, 245, 245] },
  //       margin: { left: summaryLeftMargin, right: summaryLeftMargin },
  //       tableWidth: 'auto'
  //     });

  //     // Add page numbers to all pages (after all content is generated)
  //     const totalPages = doc.internal.getNumberOfPages();
  //     for (let i = 1; i <= totalPages; i++) {
  //       doc.setPage(i);
  //       doc.setFontSize(8);
  //       doc.setFont('helvetica', 'normal');
  //       doc.setTextColor(128, 128, 128);

  //       // Draw a line above the page number
  //       doc.setDrawColor(200, 200, 200);
  //       doc.setLineWidth(0.2);
  //       doc.line(20, pageHeight - 12, pageWidth - 20, pageHeight - 12);

  //       // Add page number
  //       doc.text(
  //         `Page ${i} of ${totalPages}`,
  //         pageWidth / 2,
  //         pageHeight - 5,
  //         { align: 'center' }
  //       );
  //     }

  //     // Save PDF
  //     const viewText = appliedFilters.view_type === 'cumulative' ? 'cumulative' : 'monthly';
  //     const fileName = `cbg_report_${viewText}_${appliedFilters.year}_${monthText}.pdf`;
  //     doc.save(fileName);
  //     alert('PDF exported successfully!');

  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //     alert('Failed to generate PDF: ' + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleExportPDF = () => {
    if (mainMinistryData.length === 0 && educationMinistryData.length === 0 &&
      animalMinistryData.length === 0 && agricultureMinistryData.length === 0 &&
      landMinistryData.length === 0 && mainSecretaryData.length === 0) {
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

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const currentDate = new Date().toLocaleString();
      const monthText = monthNames[appliedFilters.month] || appliedFilters.month;

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('CBG Report', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 22, { align: 'center' });

      // Filter information
      let filterText = `Year: ${appliedFilters.year} | Month: ${monthText}`;
      if (appliedFilters.view_type === 'cumulative') {
        filterText += ` | View: Cumulative (Jan - ${monthText})`;
      } else {
        filterText += ` | View: Monthly (${monthText})`;
      }
      doc.setFontSize(9);
      doc.text(filterText, pageWidth / 2, 29, { align: 'center' });

      // Draw line
      doc.setDrawColor(200, 200, 200);
      //doc.setLineWidth(0.5);
      doc.line(15, 40, pageWidth - 15, 40);

      // Table headers
      const tableHeaders = ['TR No', 'Program', 'Project', 'Sub Project', 'Object', 'Subject Name', 'Debit', 'Other Debit', 'Total Expenditure'];

      // Prepare all tables data
      const tables = [
        { data: mainMinistryData, title: 'MAIN MINISTRY (TRNO: 304)', color: [41, 128, 185] },
        { data: educationMinistryData, title: 'EDUCATION MINISTRY (TRNO: 318)', color: [41, 128, 185] },
        { data: animalMinistryData, title: 'ANIMAL MINISTRY (TRNO: 311)', color: [41, 128, 185] },
        { data: agricultureMinistryData, title: 'AGRICULTURE MINISTRY (TRNO: 314)', color: [41, 128, 185] },
        { data: landMinistryData, title: 'LAND MINISTRY (TRNO: 308)', color: [41, 128, 185] },
        { data: mainSecretaryData, title: 'MAIN SECRETARY MINISTRY (TRNO: 320)', color: [41, 128, 185] }
      ];

      // Start Y position - 8mm gap after the line
      let startY = 48;

      // Process each table
      tables.forEach((table, index) => {
        if (table.data.length === 0) return;

        // Calculate table width to center it
        const columnWidths = [16, 16, 16, 18, 16, 24, 20, 22, 22];
        const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0);
        const leftMargin = (pageWidth - totalTableWidth) / 2;

        // Add new page if needed (except for first table)
        if (index > 0 && startY > 200) {
          doc.addPage();
          startY = 25;
        }

        // Add space between tables (10mm gap)
        if (index > 0) {
          startY += 10;
        }

        // Table title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(table.color[0], table.color[1], table.color[2]);
        doc.text(table.title, pageWidth / 2, startY, { align: 'center' });

        // Prepare table body
        const tableBody = table.data.map(record => [
          record.trno,
          record.program,
          record.project,
          record.sub_project,
          record.object,
          record.subject_name,
          formatNumber(record.debit),
          formatNumber(record.other_debit),
          formatNumber(record.total_expenditure)
        ]);

        // Generate table with centered position
        autoTable(doc, {
          head: [tableHeaders],
          body: tableBody,
          startY: startY + 5,
          theme: 'striped',
          headStyles: {
            fillColor: table.color,
            textColor: [255, 255, 255],
            fontSize: 7,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 2
          },
          bodyStyles: {
            fontSize: 6,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 16, halign: 'center' },
            1: { cellWidth: 16, halign: 'center' },
            2: { cellWidth: 16, halign: 'center' },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 16, halign: 'center' },
            5: { cellWidth: 24, halign: 'left' },
            6: { cellWidth: 20, halign: 'right' },
            7: { cellWidth: 22, halign: 'right' },
            8: { cellWidth: 22, halign: 'right' }
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: leftMargin, right: leftMargin },
          tableWidth: 'auto'
        });

        // Update start position for next table with more space
        startY = doc.lastAutoTable.finalY + 12;
      });

      // Add Summary Page
      doc.addPage();

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('SUMMARY', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('CBG Summary', pageWidth / 2, 28, { align: 'center' });

      // Calculate summary table width to center it
      const summaryColumnWidths = [55, 30, 40, 45, 40];
      const summaryTotalWidth = summaryColumnWidths.reduce((a, b) => a + b, 0);
      const summaryLeftMargin = (pageWidth - summaryTotalWidth) / 2;

      const summaryData = [
        ['Main Ministry', '304',
          formatNumber(totals.main_total_debit),
          formatNumber(totals.main_total_other_debit),
          formatNumber(totals.main_total_expenditure)
        ],
        ['Education Ministry', '318',
          formatNumber(totals.edu_total_debit),
          formatNumber(totals.edu_total_other_debit),
          formatNumber(totals.edu_total_expenditure)
        ],
        ['Animal Ministry', '311',
          formatNumber(totals.animal_total_debit),
          formatNumber(totals.animal_total_other_debit),
          formatNumber(totals.animal_total_expenditure)
        ],
        ['Agriculture Ministry', '314',
          formatNumber(totals.agri_total_debit),
          formatNumber(totals.agri_total_other_debit),
          formatNumber(totals.agri_total_expenditure)
        ],
        ['Land Ministry', '308',
          formatNumber(totals.land_total_debit),
          formatNumber(totals.land_total_other_debit),
          formatNumber(totals.land_total_expenditure)
        ],
        ['Main Secretary Ministry', '320',
          formatNumber(totals.secretary_total_debit),
          formatNumber(totals.secretary_total_other_debit),
          formatNumber(totals.secretary_total_expenditure)
        ]
      ];

      const grandTotalDebit = parseFloat(totals.main_total_debit) +
        parseFloat(totals.edu_total_debit) +
        parseFloat(totals.animal_total_debit) +
        parseFloat(totals.agri_total_debit) +
        parseFloat(totals.land_total_debit) +
        parseFloat(totals.secretary_total_debit);

      const grandTotalOtherDebit = parseFloat(totals.main_total_other_debit) +
        parseFloat(totals.edu_total_other_debit) +
        parseFloat(totals.animal_total_other_debit) +
        parseFloat(totals.agri_total_other_debit) +
        parseFloat(totals.land_total_other_debit) +
        parseFloat(totals.secretary_total_other_debit);

      const grandTotalExpenditure = parseFloat(totals.main_total_expenditure) +
        parseFloat(totals.edu_total_expenditure) +
        parseFloat(totals.animal_total_expenditure) +
        parseFloat(totals.agri_total_expenditure) +
        parseFloat(totals.land_total_expenditure) +
        parseFloat(totals.secretary_total_expenditure);

      summaryData.push([
        'GRAND TOTAL',
        '',
        formatNumber(grandTotalDebit),
        formatNumber(grandTotalOtherDebit),
        formatNumber(grandTotalExpenditure)
      ]);

      // Use tableWidth: 'auto' and the calculated margin
      autoTable(doc, {
        head: [['Ministry', 'TRNO', 'Total Debit (Rs)', 'Total Other Debit (Rs)', 'Total Expenditure (Rs)']],
        body: summaryData,
        startY: 35,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 2.5
        },
        bodyStyles: {
          fontSize: 7.5,
          cellPadding: 2.5
        },
        columnStyles: {
          0: { cellWidth: 40, halign: 'left' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' },
          4: { cellWidth: 40, halign: 'right' }
        },

        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: {
          left: 15,
          right: 15,
          top: 35,
          bottom: 20
        },
        tableWidth: 180,

        didParseCell: function (data) {
          // Make grand total row bold
          if (data.row.index === summaryData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [245, 245, 245];
            data.cell.styles.textColor = [0, 0, 0];
          }
        }
      });
      // Add page numbers to all pages (after all content is generated)
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);

        // Draw a line above the page number
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(20, pageHeight - 12, pageWidth - 20, pageHeight - 12);

        // Add page number
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      // Save PDF
      const viewText = appliedFilters.view_type === 'cumulative' ? 'cumulative' : 'monthly';
      const fileName = `cbg_report_${viewText}_${appliedFilters.year}_${monthText}.pdf`;
      doc.save(fileName);
      alert('PDF exported successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleExportCSV = async () => {
    if (mainMinistryData.length === 0 && educationMinistryData.length === 0 &&
      animalMinistryData.length === 0 && agricultureMinistryData.length === 0 &&
      landMinistryData.length === 0 && mainSecretaryData.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        month: appliedFilters.month,
        view_type: appliedFilters.view_type || 'cumulative'
      };

      const response = await apiClient.get('/cbg/export', { params });

      if (response.data.success) {
        const csvData = response.data.data;
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const csvRows = [
            headers.join(','),
            ...csvData.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
          ];
          const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(csvBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ministry_expenditure_report_${appliedFilters.view_type}_${appliedFilters.year}_${monthNames[appliedFilters.month]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          alert('Export completed successfully!');
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
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
    if (appliedFilters.view_type === 'cumulative') {
      return `January - ${monthNames[appliedFilters.month]} (Cumulative)`;
    }
    return monthNames[appliedFilters.month] + ' (Monthly)';
  };

  const renderTable = (data, title, icon, trno) => {
    if (data.length === 0) return null;

    const totalRow = data.find(record => record.subject_name === 'Total');
    const dataRows = data.filter(record => record.subject_name !== 'Total');

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <span className="text-sm text-gray-500">(TRNO: {trno})</span>
        </div>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">TR No</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Program</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Project</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Sub Project</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Object</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Subject Name</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Debit</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Other Debit</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 bg-gray-50">Total Expenditure</th>
              </tr>
            </thead>
            <tbody>
              {dataRows.map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700">{record.trno}</td>
                  <td className="px-3 py-2 text-gray-700">{record.program}</td>
                  <td className="px-3 py-2 text-gray-700">{record.project}</td>
                  <td className="px-3 py-2 text-gray-700">{record.sub_project}</td>
                  <td className="px-3 py-2 text-gray-700">{record.object}</td>
                  <td className="px-3 py-2 text-gray-700">{record.subject_name}</td>
                  <td className="px-3 py-2 text-right text-gray-600">Rs{formatNumber(record.debit)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">Rs{formatNumber(record.other_debit)}</td>
                  <td className="px-3 py-2 text-right font-bold text-gray-700">Rs{formatNumber(record.total_expenditure)}</td>
                </tr>
              ))}
              {totalRow && (
                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <td colSpan="6" className="px-3 py-2 text-right text-gray-700">TOTAL:</td>
                  <td className="px-3 py-2 text-right text-gray-700">Rs{formatNumber(totalRow.debit)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">Rs{formatNumber(totalRow.other_debit)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">Rs{formatNumber(totalRow.total_expenditure)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
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
            <h1 className="text-2xl font-bold text-gray-800">CBG Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              Expenditure details
            </p>
          </div>
          {appliedFilters.year && appliedFilters.month && (
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Year:</span> {appliedFilters.year} |
                <span className="font-medium ml-2">Month:</span> {monthNames[appliedFilters.month]}
                <span className="font-medium ml-2">| View:</span> {appliedFilters.view_type === 'cumulative' ? 'Cumulative' : 'Monthly'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Type Indicator */}
      {appliedFilters.month && (
        <div className={`rounded-lg p-3 border ${appliedFilters.view_type === 'cumulative' ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center gap-2">
            {appliedFilters.view_type === 'cumulative' ? (
              <LineChart size={18} className="text-purple-600" />
            ) : (
              <TableIcon size={18} className="text-orange-600" />
            )}
            <span className={`text-sm ${appliedFilters.view_type === 'cumulative' ? 'text-purple-700' : 'text-orange-700'}`}>
              <strong>View Type:</strong> {getMonthRangeDisplay()}
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards - 18 cards (3 per ministry) */}
      {/* <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-18 gap-1">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Main-D</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.main_total_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Main-O</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.main_total_other_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Main-E</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.main_total_expenditure)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Edu-D</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.edu_total_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Edu-O</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.edu_total_other_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Edu-E</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.edu_total_expenditure)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Animal-D</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.animal_total_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Animal-O</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.animal_total_other_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Animal-E</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.animal_total_expenditure)}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Agri-D</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.agri_total_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Agri-O</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.agri_total_other_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Agri-E</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.agri_total_expenditure)}</p>
        </div>
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Land-D</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.land_total_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Land-O</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.land_total_other_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Land-E</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.land_total_expenditure)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Sec-D</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.secretary_total_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Sec-O</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.secretary_total_other_debit)}</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded p-1 text-white shadow-lg">
          <p className="text-[5px] opacity-90">Sec-E</p>
          <p className="text-[7px] font-bold truncate">Rs{formatNumber(totals.secretary_total_expenditure)}</p>
        </div>
      </div> */}

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
          disabled={mainMinistryData.length === 0 && educationMinistryData.length === 0 &&
            animalMinistryData.length === 0 && agricultureMinistryData.length === 0 &&
            landMinistryData.length === 0 && mainSecretaryData.length === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${mainMinistryData.length > 0 || educationMinistryData.length > 0 ||
            animalMinistryData.length > 0 || agricultureMinistryData.length > 0 ||
            landMinistryData.length > 0 || mainSecretaryData.length > 0
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          <FileText size={16} />
          <span>Export PDF</span>
        </button>
        <button
          onClick={handleExportCSV}
          disabled={mainMinistryData.length === 0 && educationMinistryData.length === 0 &&
            animalMinistryData.length === 0 && agricultureMinistryData.length === 0 &&
            landMinistryData.length === 0 && mainSecretaryData.length === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm shadow-sm ${mainMinistryData.length > 0 || educationMinistryData.length > 0 ||
            animalMinistryData.length > 0 || agricultureMinistryData.length > 0 ||
            landMinistryData.length > 0 || mainSecretaryData.length > 0
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

      {/* Tables */}
      {!appliedFilters.year || !appliedFilters.month ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Filter size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Please select Year and Month to view data</p>
        </div>
      ) : (
        <>
          {renderTable(
            mainMinistryData,
            'Main Ministry',
            <Building2 size={20} className="text-blue-600" />,
            304
          )}
          {renderTable(
            educationMinistryData,
            'Education Ministry',
            <GraduationCap size={20} className="text-green-600" />,
            318
          )}
          {renderTable(
            animalMinistryData,
            'Animal Ministry',
            <PawPrint size={20} className="text-orange-600" />,
            311
          )}
          {renderTable(
            agricultureMinistryData,
            'Agriculture Ministry',
            <Sprout size={20} className="text-emerald-600" />,
            314
          )}
          {renderTable(
            landMinistryData,
            'Land Ministry',
            <Mountain size={20} className="text-violet-600" />,
            308
          )}
          {renderTable(
            mainSecretaryData,
            'Main Secretary Ministry',
            <Users size={20} className="text-red-600" />,
            320
          )}
        </>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter Ministry Report</h3>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View Type
                </label>
                <select
                  name="view_type"
                  value={filters.view_type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cumulative">Cumulative (Jan - Month)</option>
                  <option value="monthly">Monthly (Month only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {filters.view_type === 'cumulative'
                    ? 'Shows cumulative data from January to selected month'
                    : 'Shows data for the selected month only'}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> This report shows expenditure details for six ministries.
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>Main:</strong> TRNO 304 | <strong>Education:</strong> TRNO 318 |
                  <strong>Animal:</strong> TRNO 311 | <strong>Agriculture:</strong> TRNO 314 |
                  <strong>Land:</strong> TRNO 308 | <strong>Main Secretary:</strong> TRNO 320
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

export default CBGPanel;