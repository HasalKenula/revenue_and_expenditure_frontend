// components/ImprestPanel.jsx
import React, { useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ImprestPanel = () => {
  const [financialYear, setFinancialYear] = useState('2023-2024');
  const [billingMonth, setBillingMonth] = useState('October');
  const [accountHead, setAccountHead] = useState('');
  const [amount, setAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Sample data for recent issues
  const [imprestData] = useState([
    {
      id: 1,
      date: '2023-11-20',
      accountHead: 'Logistics & Supply',
      period: 'Nov 2023',
      amount: 4500.00,
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 2,
      date: '2023-11-18',
      accountHead: 'Information Systems',
      period: 'Nov 2023',
      amount: 12200.00,
      status: 'Pending',
      statusColor: 'yellow'
    },
    {
      id: 3,
      date: '2023-11-15',
      accountHead: 'Human Resources',
      period: 'Oct 2023',
      amount: 2150.00,
      status: 'Flagged',
      statusColor: 'red'
    },
    {
      id: 4,
      date: '2023-11-12',
      accountHead: 'Facility Management',
      period: 'Oct 2023',
      amount: 8900.00,
      status: 'Active',
      statusColor: 'green'
    },
    {
      id: 5,
      date: '2023-11-10',
      accountHead: 'Procurement',
      period: 'Nov 2023',
      amount: 15750.00,
      status: 'Pending',
      statusColor: 'yellow'
    },
    {
      id: 6,
      date: '2023-11-08',
      accountHead: 'Training & Development',
      period: 'Oct 2023',
      amount: 3250.00,
      status: 'Active',
      statusColor: 'green'
    }
  ]);

  const totalRecords = imprestData.length;
  const totalPages = Math.ceil(totalRecords / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = imprestData.slice(startIndex, endIndex);

  const getStatusStyles = (status) => {
    switch(status) {
      case 'Active':
        return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
      case 'Pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
      case 'Flagged':
        return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Imprest Issue Created!\nAccount Head: ${accountHead}\nAmount: $${amount}\nPeriod: ${billingMonth} ${financialYear}`);
    setAccountHead('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Imprest Issue Management</h1>
        <p className="text-sm text-gray-500 mt-1">Record and manage institutional cash advances for departments.</p>
      </div>

      {/* Transaction Entry Form */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Transaction Entry</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Financial Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FINANCIAL YEAR
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>2023 - 2024</option>
                <option>2022 - 2023</option>
                <option>2021 - 2022</option>
              </select>
            </div>

            {/* Billing Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BILLING MONTH
              </label>
              <select
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>

            {/* Account Head */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ACCOUNT HEAD
              </label>
              <input
                type="text"
                value={accountHead}
                onChange={(e) => setAccountHead(e.target.value)}
                placeholder="e.g., General Admin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AMOUNT (Rs)
              </label>
              <div className="relative">
               
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Create Imprest Issue</span>
            </button>
          </div>
        </form>
      </div>

      {/* Recent Issues Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Recent Issues</h2>
            <span className="text-xs text-gray-500">LIVE DATA</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={18} />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DATE</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ACCOUNT HEAD</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">PERIOD</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">AMOUNT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">STATUS</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => {
                const statusStyle = getStatusStyles(item.status);
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.accountHead}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.period}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      Rs{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords} records
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex space-x-1">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Total Imprest Issues</p>
            <p className="text-2xl font-bold mt-1">{totalRecords}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Total Amount Disbursed</p>
            <p className="text-2xl font-bold mt-1">
              Rs{imprestData.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Active Issues</p>
            <p className="text-2xl font-bold mt-1">
              {imprestData.filter(item => item.status === 'Active').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprestPanel;