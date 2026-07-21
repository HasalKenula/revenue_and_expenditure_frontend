// src/components/ReportDashboard.jsx
import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Building2,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  ChevronRight,
  Download,
  Eye,
  Users,
  Landmark,
  GraduationCap,
  Building,
  Sprout,
  Mountain,
  PawPrint,
  Users as UsersIcon,
  FileSpreadsheet,
  Printer,
  Clock,
  CalendarDays,
  ListChecks,
  Grid3x3,
  LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportDashboard = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Report Categories
  const categories = [
    {
      id: 'monthly',
      name: 'Monthly Reports',
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      description: 'View reports by month and year',
      reports: [
        { id: 'wop-report', name: 'WOP Report', path: '/wop', icon: FileText },
        { id: 'coehw-report', name: 'Classification of Expenditure(Head Wise) Report', path: '/coehw', icon: FileSpreadsheet },
        { id: 'coeow-report', name: 'Classification of Expenditure(Object Wise) Report', path: '/coeow', icon: FileText },
        { id: 'r&cExpenditure-report', name: 'Recurrent & Capital Expenditure Report', path: '/rc', icon: FileSpreadsheet },
        { id: 'main-journal', name: 'Main Journal', path: '/main_journal', icon: FileText },
        { id: 'imprest-balance', name: 'Imprest Balance', path: '/imprestBalance', icon: FileSpreadsheet },
        // { id: 'journal-summary', name: 'Journal Summary', path: '/journal', icon: FileText },
        { id: 'net-expenditure', name: 'Net Expenditure', path: '/net-expenditure', icon: FileSpreadsheet },
        { id: 'net-allocation', name: 'Net Allocation', path: '/net-allocation', icon: FileText },
        { id: 'allocation-balance', name: 'Allocation Balance Report', path: '/allocation_balance', icon: FileSpreadsheet },
        { id: 'other-debit', name: 'Other Dept Debits', path: '/odd', icon: FileText },
        { id: 'other-surcharge', name: 'Other Dept Surcharge', path: '/ods', icon: FileSpreadsheet },
        { id: 'upkeep', name: 'Mainteneance', path: '/upkeep', icon: FileSpreadsheet },
        { id: 'stamp-month', name: 'Stamp Monthly', path: '/stamp-month', icon: FileSpreadsheet },
        { id: 'transfer-monthly', name: 'Transfer Monthly', path: '/transfer-monthly', icon: FileSpreadsheet },
      ]
    },
    {
      id: 'department',
      name: 'Department Wise Reports',
      icon: Building2,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      description: 'View reports by department/ministry',
      reports: [
        { id: 'psdg-report', name: 'PSDG Report', path: '/psd', icon: FileText },
        { id: 'cbg-report', name: 'CBG Report', path: '/cbg', icon: FileSpreadsheet },
       
      ]
    },
    {
      id: 'summary',
      name: 'Summary Reports',
      icon: BarChart3,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      description: 'View summary and consolidated reports',
      reports: [
       { id: 'journal-summary', name: 'Journal Summary', path: '/journal', icon: FileText },
       { id: 'transfer-summary', name: 'Transfer Summary', path: '/transfer-summary', icon: FileText },
       { id: 'stamp-summary', name: 'Stamp Summary', path: '/stamp-summary', icon: FileText },
      ]
    },
    {
      id: 'all',
      name: 'All Reports',
      icon: LayoutGrid,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600',
      description: 'View all available reports',
      reports: []
    }
  ];

  // Get all reports for "All Reports" category
  const getAllReports = () => {
    const allReports = [];
    categories.forEach(cat => {
      if (cat.id !== 'all') {
        cat.reports.forEach(report => {
          allReports.push({
            ...report,
            category: cat.name,
            categoryColor: cat.color
          });
        });
      }
    });
    return allReports;
  };

  // Get reports based on selected category
  const getReports = () => {
    if (selectedCategory === 'all') {
      return getAllReports();
    }
    const category = categories.find(c => c.id === selectedCategory);
    return category ? category.reports : [];
  };

  const reports = getReports();
  const currentCategory = categories.find(c => c.id === selectedCategory);

  const handleReportClick = (path) => {
    navigate(path);
  };

  // Statistics Cards
  const stats = [
    { 
      label: 'Total Reports', 
      value: getAllReports().length, 
      icon: FileText, 
      color: 'blue',
      change: '+2 this month'
    },
    { 
      label: 'Monthly Reports', 
      value: categories.find(c => c.id === 'monthly')?.reports.length || 0, 
      icon: Calendar, 
      color: 'green',
      change: '5 active'
    },
    { 
      label: 'Department Reports', 
      value: categories.find(c => c.id === 'department')?.reports.length || 0, 
      icon: Building2, 
      color: 'purple',
      change: '6 ministries'
    },
    { 
      label: 'Summary Reports', 
      value: categories.find(c => c.id === 'summary')?.reports.length || 0, 
      icon: BarChart3, 
      color: 'orange',
      change: '4 reports'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', hover: 'hover:bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      red: { bg: 'bg-red-50', hover: 'hover:bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      indigo: { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
      teal: { bg: 'bg-teal-50', hover: 'hover:bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText size={28} className="text-blue-600" />
              Report Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Access and manage all financial reports from one central location
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
              <Download size={16} />
              Export All
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClass = getColorClasses(stat.color);
          return (
            <div 
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClass.bg}`}>
                  <Icon size={20} className={colorClass.text} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          const colorClass = getColorClasses(category.color);
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition text-sm ${
                isActive
                  ? `${colorClass.bg} ${colorClass.border} ${colorClass.text} border-2`
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              <span>{category.name}</span>
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                isActive ? `${colorClass.bg} ${colorClass.text}` : 'bg-gray-100 text-gray-500'
              }`}>
                {category.id === 'all' ? getAllReports().length : category.reports.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Description */}
      {currentCategory && (
        <div className={`${currentCategory.bgColor} border ${currentCategory.borderColor} rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-3">
            <currentCategory.icon size={20} className={currentCategory.textColor} />
            <div>
              <h3 className={`font-semibold ${currentCategory.textColor}`}>{currentCategory.name}</h3>
              <p className="text-sm text-gray-600">{currentCategory.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Grid */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map((report, index) => {
            const Icon = report.icon;
            const categoryColor = report.categoryColor || 'blue';
            const colorClass = getColorClasses(categoryColor);
            const isHovered = hoveredCard === report.id;

            return (
              <div
                key={index}
                className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm transition-all cursor-pointer ${
                  isHovered ? 'shadow-md transform -translate-y-1' : ''
                }`}
                onMouseEnter={() => setHoveredCard(report.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleReportClick(report.path)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg ${colorClass.bg}`}>
                    <Icon size={20} className={colorClass.text} />
                  </div>
                  {report.category && (
                    <span className={`text-xs px-2 py-1 rounded-full ${colorClass.bg} ${colorClass.text}`}>
                      {report.category}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-800 text-sm">{report.name}</h4>
                <p className="text-xs text-gray-400 mt-1">Click to view report</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">ID: {report.id}</span>
                  <ChevronRight size={16} className={`${colorClass.text} transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reports available in this category</p>
          <p className="text-sm text-gray-400 mt-1">Select a different category to view reports</p>
        </div>
      )}

      {/* Quick Access Section */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-blue-600" />
          Quick Access - Recent Reports
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {getAllReports().slice(0, 4).map((report, index) => {
            const Icon = report.icon;
            const colorClass = getColorClasses(report.categoryColor || 'blue');
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => handleReportClick(report.path)}
              >
                <div className={`p-2 rounded-lg ${colorClass.bg}`}>
                  <Icon size={16} className={colorClass.text} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{report.name}</p>
                  <p className="text-xs text-gray-400">{report.category || 'Report'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;