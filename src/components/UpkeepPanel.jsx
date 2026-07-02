// src/components/UpkeepPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  Filter,
  X,
  Calendar,
  FileText,
  LineChart,
  Table as TableIcon,
  BookOpen,
  Heart,
  Leaf,
  Road,
  Sprout,
  Users,
  HeartHandshake,
  Building,
  PawPrint,
  MoreHorizontal
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

const UpkeepPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [educationData, setEducationData] = useState([]);
  const [westernMedicineData, setWesternMedicineData] = useState([]);
  const [indigenousMedicineData, setIndigenousMedicineData] = useState([]);
  const [roadsIrrigationData, setRoadsIrrigationData] = useState([]);
  const [agricultureData, setAgricultureData] = useState([]);
  const [probationChildcareData, setProbationChildcareData] = useState([]);
  const [socialServicesData, setSocialServicesData] = useState([]);
  const [localGovernmentData, setLocalGovernmentData] = useState([]);
  const [livestockData, setLivestockData] = useState([]);
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
    edu_total_allocation: 0,
    edu_total_expenditure: 0,
    edu_total_balance: 0,
    wm_total_allocation: 0,
    wm_total_expenditure: 0,
    wm_total_balance: 0,
    im_total_allocation: 0,
    im_total_expenditure: 0,
    im_total_balance: 0,
    ri_total_allocation: 0,
    ri_total_expenditure: 0,
    ri_total_balance: 0,
    agri_total_allocation: 0,
    agri_total_expenditure: 0,
    agri_total_balance: 0,
    pc_total_allocation: 0,
    pc_total_expenditure: 0,
    pc_total_balance: 0,
    ss_total_allocation: 0,
    ss_total_expenditure: 0,
    ss_total_balance: 0,
    lg_total_allocation: 0,
    lg_total_expenditure: 0,
    lg_total_balance: 0,
    livestock_total_allocation: 0,
    livestock_total_expenditure: 0,
    livestock_total_balance: 0
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
      setEducationData([]);
      setWesternMedicineData([]);
      setIndigenousMedicineData([]);
      setRoadsIrrigationData([]);
      setAgricultureData([]);
      setProbationChildcareData([]);
      setSocialServicesData([]);
      setLocalGovernmentData([]);
      setLivestockData([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        year: appliedFilters.year,
        month: appliedFilters.month,
        view_type: appliedFilters.view_type || 'cumulative'
      };

      const response = await apiClient.get('/upkeep/data', { params });

      if (response.data.success) {
        const eduData = response.data.data.education || [];
        const wmData = response.data.data.western_medicine || [];
        const imData = response.data.data.indigenous_medicine || [];
        const riData = response.data.data.roads_irrigation || [];
        const agriData = response.data.data.agriculture || [];
        const pcData = response.data.data.probation_childcare || [];
        const ssData = response.data.data.social_services || [];
        const lgData = response.data.data.local_government || [];
        const livestockData = response.data.data.livestock || [];
        
        setEducationData(eduData);
        setWesternMedicineData(wmData);
        setIndigenousMedicineData(imData);
        setRoadsIrrigationData(riData);
        setAgricultureData(agriData);
        setProbationChildcareData(pcData);
        setSocialServicesData(ssData);
        setLocalGovernmentData(lgData);
        setLivestockData(livestockData);
        setMonths(response.data.data.months || []);
        setMonthNamesList(response.data.data.month_names || {});
        setSelectedYear(response.data.data.filters?.year || '');
        setSelectedMonth(response.data.data.filters?.month || '');
        setViewType(response.data.data.filters?.view_type || 'cumulative');

        // Calculate totals for all categories
        const calculateTotals = (data) => {
          let allocation = 0, expenditure = 0, balance = 0;
          data.forEach(record => {
            if (record.subject_name !== 'Total') {
              allocation += record.allocation || 0;
              expenditure += record.expenditure || 0;
              balance += record.balance || 0;
            }
          });
          return { allocation, expenditure, balance };
        };

        const eduTotals = calculateTotals(eduData);
        const wmTotals = calculateTotals(wmData);
        const imTotals = calculateTotals(imData);
        const riTotals = calculateTotals(riData);
        const agriTotals = calculateTotals(agriData);
        const pcTotals = calculateTotals(pcData);
        const ssTotals = calculateTotals(ssData);
        const lgTotals = calculateTotals(lgData);
        const livestockTotals = calculateTotals(livestockData);

        setTotals({
          edu_total_allocation: eduTotals.allocation,
          edu_total_expenditure: eduTotals.expenditure,
          edu_total_balance: eduTotals.balance,
          wm_total_allocation: wmTotals.allocation,
          wm_total_expenditure: wmTotals.expenditure,
          wm_total_balance: wmTotals.balance,
          im_total_allocation: imTotals.allocation,
          im_total_expenditure: imTotals.expenditure,
          im_total_balance: imTotals.balance,
          ri_total_allocation: riTotals.allocation,
          ri_total_expenditure: riTotals.expenditure,
          ri_total_balance: riTotals.balance,
          agri_total_allocation: agriTotals.allocation,
          agri_total_expenditure: agriTotals.expenditure,
          agri_total_balance: agriTotals.balance,
          pc_total_allocation: pcTotals.allocation,
          pc_total_expenditure: pcTotals.expenditure,
          pc_total_balance: pcTotals.balance,
          ss_total_allocation: ssTotals.allocation,
          ss_total_expenditure: ssTotals.expenditure,
          ss_total_balance: ssTotals.balance,
          lg_total_allocation: lgTotals.allocation,
          lg_total_expenditure: lgTotals.expenditure,
          lg_total_balance: lgTotals.balance,
          livestock_total_allocation: livestockTotals.allocation,
          livestock_total_expenditure: livestockTotals.expenditure,
          livestock_total_balance: livestockTotals.balance
        });

        const total = eduData.length + wmData.length + imData.length + riData.length + 
                     agriData.length + pcData.length + ssData.length + lgData.length + livestockData.length;
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
      const response = await apiClient.get('/upkeep/filter-options');

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
    setEducationData([]);
    setWesternMedicineData([]);
    setIndigenousMedicineData([]);
    setRoadsIrrigationData([]);
    setAgricultureData([]);
    setProbationChildcareData([]);
    setSocialServicesData([]);
    setLocalGovernmentData([]);
    setLivestockData([]);
    setTotals({
      edu_total_allocation: 0,
      edu_total_expenditure: 0,
      edu_total_balance: 0,
      wm_total_allocation: 0,
      wm_total_expenditure: 0,
      wm_total_balance: 0,
      im_total_allocation: 0,
      im_total_expenditure: 0,
      im_total_balance: 0,
      ri_total_allocation: 0,
      ri_total_expenditure: 0,
      ri_total_balance: 0,
      agri_total_allocation: 0,
      agri_total_expenditure: 0,
      agri_total_balance: 0,
      pc_total_allocation: 0,
      pc_total_expenditure: 0,
      pc_total_balance: 0,
      ss_total_allocation: 0,
      ss_total_expenditure: 0,
      ss_total_balance: 0,
      lg_total_allocation: 0,
      lg_total_expenditure: 0,
      lg_total_balance: 0,
      livestock_total_allocation: 0,
      livestock_total_expenditure: 0,
      livestock_total_balance: 0
    });
    setCurrentPage(1);
    setTotalRecords(0);
    setLastPage(1);
    setMonths([]);
    setMonthNamesList({});
  };

  const handleExportPDF = () => {
    const allData = [
      ...educationData,
      ...westernMedicineData,
      ...indigenousMedicineData,
      ...roadsIrrigationData,
      ...agricultureData,
      ...probationChildcareData,
      ...socialServicesData,
      ...localGovernmentData,
      ...livestockData
    ];

    if (allData.length === 0) {
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

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Upkeep Report', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 28, { align: 'center' });

      const monthText = monthNames[appliedFilters.month] || appliedFilters.month;
      let filterText = `Year: ${appliedFilters.year} | Month: ${monthText}`;
      if (appliedFilters.view_type === 'cumulative') {
        filterText += ` | View: Cumulative (Jan - ${monthText})`;
      } else {
        filterText += ` | View: Monthly (${monthText})`;
      }
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(filterText, pageWidth / 2, 36, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.line(15, 40, pageWidth - 15, 40);

      const tableHeaders = ['TR No', 'Program', 'Project', 'Sub Project', 'Object', 'Subject Name', 'Allocation', 'Expenditure', 'Balance'];

      const tableConfigs = [
        { data: educationData, title: 'EDUCATION (UPKEEP)', color: [41, 128, 185], trno: '310' },
        { data: westernMedicineData, title: 'WESTERN MEDICINE', color: [39, 174, 96], trno: '305' },
        { data: indigenousMedicineData, title: 'INDIGENOUS MEDICINE', color: [142, 68, 173], trno: '307' },
        { data: roadsIrrigationData, title: 'ROADS & IRRIGATION', color: [211, 84, 0], trno: '308, 316' },
        { data: agricultureData, title: 'AGRICULTURE', color: [46, 204, 113], trno: '315' },
        { data: probationChildcareData, title: 'PROBATION & CHILDCARE', color: [231, 76, 60], trno: '319' },
        { data: socialServicesData, title: 'SOCIAL SERVICES', color: [155, 89, 182], trno: '306' },
        { data: localGovernmentData, title: 'LOCAL GOVERNMENT', color: [52, 152, 219], trno: '312' },
        { data: livestockData, title: 'LIVESTOCK', color: [46, 204, 113], trno: '300-325' }
      ];

      let currentY = 48;

      tableConfigs.forEach((config, index) => {
        if (config.data.length === 0) return;

        const tableBody = config.data.map(record => [
          record.trno || '-',
          record.program || '-',
          record.project || '-',
          record.sub_project || '-',
          record.object || '-',
          record.subject_name || '-',
          formatNumber(record.allocation),
          formatNumber(record.expenditure),
          formatNumber(record.balance)
        ]);

        // Check if we need a new page
        if (currentY > 200) {
          doc.addPage();
          currentY = 20;
        }

        currentY += 5;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(config.color[0], config.color[1], config.color[2]);
        doc.text(config.title, pageWidth / 2, currentY, { align: 'center' });

        autoTable(doc, {
          head: [tableHeaders],
          body: tableBody,
          startY: currentY + 4,
          theme: 'striped',
          headStyles: {
            fillColor: config.color,
            textColor: [255, 255, 255],
            fontSize: 7,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 2
          },
          bodyStyles: {
            fontSize: 7,
            cellPadding: 2,
            textColor: [0, 0, 0]
          },
          columnStyles: {
            0: { cellWidth: 16, halign: 'center' },
            1: { cellWidth: 16, halign: 'center' },
            2: { cellWidth: 16, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 16, halign: 'center' },
            5: { cellWidth: 28, halign: 'left' },
            6: { cellWidth: 22, halign: 'right' },
            7: { cellWidth: 24, halign: 'right' },
            8: { cellWidth: 24, halign: 'right' }
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { top: currentY + 4, left: 10, right: 10, bottom: 8 },
          tableWidth: 'auto',
          didParseCell: function(data) {
            if (data.row.index === 0) return;
            if (data.row.index === config.data.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [220, 220, 220];
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.lineWidth = 0.5;
              data.cell.styles.lineColor = [100, 100, 100];
            }
            if (data.column.index === 8) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.textColor = data.row.index === config.data.length - 1 ? [0, 0, 0] : config.color;
            }
          }
        });

        currentY = doc.lastAutoTable?.finalY || 150;
        currentY += 8;

        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setDrawColor(200, 200, 200);
          doc.line(12, pageHeight - 12, pageWidth - 12, pageHeight - 12);
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 5,
            { align: 'center' }
          );
        }
      });

      const viewText = appliedFilters.view_type === 'cumulative' ? 'cumulative' : 'monthly';
      const fileName = `upkeep_report_${viewText}_${appliedFilters.year}_${monthText}.pdf`;
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
    const allData = [
      ...educationData,
      ...westernMedicineData,
      ...indigenousMedicineData,
      ...roadsIrrigationData,
      ...agricultureData,
      ...probationChildcareData,
      ...socialServicesData,
      ...localGovernmentData,
      ...livestockData
    ];

    if (allData.length === 0) {
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

      const response = await apiClient.get('/upkeep/export', { params });

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
          a.download = `upkeep_report_${appliedFilters.view_type}_${appliedFilters.year}_${monthNames[appliedFilters.month]}.csv`;
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

  const renderTable = (data, title, icon, trno, color) => {
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
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Allocation</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Expenditure</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 bg-purple-50">Balance</th>
              </tr>
            </thead>
            <tbody>
              {dataRows.map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700">{record.trno || '-'}</td>
                  <td className="px-3 py-2 text-gray-700">{record.program || '-'}</td>
                  <td className="px-3 py-2 text-gray-700">{record.project || '-'}</td>
                  <td className="px-3 py-2 text-gray-700">{record.sub_project || '-'}</td>
                  <td className="px-3 py-2 text-gray-700">{record.object || '-'}</td>
                  <td className="px-3 py-2 text-gray-700">{record.subject_name || '-'}</td>
                  <td className="px-3 py-2 text-right text-gray-900">Rs{formatNumber(record.allocation)}</td>
                  <td className="px-3 py-2 text-right text-green-600">Rs{formatNumber(record.expenditure)}</td>
                  <td className={`px-3 py-2 text-right font-medium ${parseFloat(record.balance) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    Rs{formatNumber(record.balance)}
                  </td>
                </tr>
              ))}
              {totalRow && (
                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <td colSpan="6" className="px-3 py-2 text-right text-blue-700">TOTAL:</td>
                  <td className="px-3 py-2 text-right text-gray-900">Rs{formatNumber(totalRow.allocation)}</td>
                  <td className="px-3 py-2 text-right text-green-700">Rs{formatNumber(totalRow.expenditure)}</td>
                  <td className="px-3 py-2 text-right text-purple-700">Rs{formatNumber(totalRow.balance)}</td>
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
            <h1 className="text-2xl font-bold text-gray-800">Upkeep Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              Allocation, expenditure and balance summary by program, project, sub project and object
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

      {/* Summary Cards - 9 categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9 gap-2">
        {/* Education */}
        <div className="space-y-1">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">Edu - Allocation</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.edu_total_allocation)}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">Edu - Expenditure</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.edu_total_expenditure)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">Edu - Balance</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.edu_total_balance)}</p>
          </div>
        </div>

        {/* Western Medicine */}
        <div className="space-y-1">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">WM - Allocation</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.wm_total_allocation)}</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">WM - Expenditure</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.wm_total_expenditure)}</p>
          </div>
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">WM - Balance</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.wm_total_balance)}</p>
          </div>
        </div>

        {/* Indigenous Medicine */}
        <div className="space-y-1">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">IM - Allocation</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.im_total_allocation)}</p>
          </div>
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">IM - Expenditure</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.im_total_expenditure)}</p>
          </div>
          <div className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">IM - Balance</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.im_total_balance)}</p>
          </div>
        </div>

        {/* Roads & Irrigation */}
        <div className="space-y-1">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">RI - Allocation</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.ri_total_allocation)}</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">RI - Expenditure</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.ri_total_expenditure)}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">RI - Balance</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.ri_total_balance)}</p>
          </div>
        </div>

        {/* Agriculture */}
        <div className="space-y-1">
          <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">Agri - Allocation</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.agri_total_allocation)}</p>
          </div>
          <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">Agri - Expenditure</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.agri_total_expenditure)}</p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">Agri - Balance</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.agri_total_balance)}</p>
          </div>
        </div>

        {/* Probation & Childcare */}
        <div className="space-y-1">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">PC - Allocation</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.pc_total_allocation)}</p>
          </div>
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">PC - Expenditure</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.pc_total_expenditure)}</p>
          </div>
          <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">PC - Balance</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.pc_total_balance)}</p>
          </div>
        </div>

        {/* Social Services */}
        <div className="space-y-1">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">SS - Allocation</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.ss_total_allocation)}</p>
          </div>
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">SS - Expenditure</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.ss_total_expenditure)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-700 to-purple-800 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">SS - Balance</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.ss_total_balance)}</p>
          </div>
        </div>

        {/* Local Government */}
        <div className="space-y-1">
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">LG - Allocation</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.lg_total_allocation)}</p>
          </div>
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">LG - Expenditure</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.lg_total_expenditure)}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">LG - Balance</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.lg_total_balance)}</p>
          </div>
        </div>

        {/* Livestock */}
        <div className="space-y-1">
          <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">LS - Allocation</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.livestock_total_allocation)}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">LS - Expenditure</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.livestock_total_expenditure)}</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-1.5 text-white shadow">
            <p className="text-[7px] opacity-90">LS - Balance</p>
            <p className="text-[10px] font-bold">Rs{formatNumber(totals.livestock_total_balance)}</p>
          </div>
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
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm shadow-sm"
        >
          <FileText size={16} />
          <span>Export PDF</span>
        </button>
        <button 
          onClick={handleExportCSV} 
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm shadow-sm"
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
            educationData, 
            'Education (Upkeep)', 
            <BookOpen size={20} className="text-blue-600" />, 
            '310'
          )}
          {renderTable(
            westernMedicineData, 
            'Western Medicine', 
            <Heart size={20} className="text-teal-600" />, 
            '305'
          )}
          {renderTable(
            indigenousMedicineData, 
            'Indigenous Medicine', 
            <Leaf size={20} className="text-indigo-600" />, 
            '307'
          )}
          {renderTable(
            roadsIrrigationData, 
            'Roads & Irrigation', 
            <Road size={20} className="text-orange-600" />, 
            '308, 316'
          )}
          {renderTable(
            agricultureData, 
            'Agriculture', 
            <Sprout size={20} className="text-green-600" />, 
            '315'
          )}
          {renderTable(
            probationChildcareData, 
            'Probation & Childcare', 
            <Users size={20} className="text-red-600" />, 
            '319'
          )}
          {renderTable(
            socialServicesData, 
            'Social Services', 
            <HeartHandshake size={20} className="text-purple-600" />, 
            '306'
          )}
          {renderTable(
            localGovernmentData, 
            'Local Government', 
            <Building size={20} className="text-blue-500" />, 
            '312'
          )}
          {renderTable(
            livestockData, 
            'Livestock', 
            <PawPrint size={20} className="text-emerald-600" />, 
            '300-325'
          )}
        </>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter Upkeep Report</h3>
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
                    ? 'Shows cumulative expenditure from January to selected month' 
                    : 'Shows expenditure for the selected month only'}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> This report shows allocation, expenditure and balance for all upkeep categories.
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <strong>Allocation:</strong> From Budget table | <strong>Expenditure:</strong> DR(1000) - CR(2000)
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

export default UpkeepPanel;