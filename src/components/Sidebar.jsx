// // components/Sidebar.jsx
// import React, { useState } from 'react';
// import {
//   Home,
//   Building2,
//   Wallet,
//   FileText,
//   TrendingUp,
//   Settings,
//   LogOut,
//   ChevronDown,
//   ChevronRight,
//   Upload,
//   CheckCircle,
//   BarChart3
// } from 'lucide-react';
// import { Link } from 'react-router-dom';

// const Sidebar = () => {
//   const [openMenus, setOpenMenus] = useState({
//     finSystems: true,
//     openingBalance: false,
//     allocation: false,
//     impressIssue: false,
//     budget: false
//   });

//   const toggleMenu = (menu) => {
//     setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
//   };

//   const MenuItem = ({ icon: Icon, label, hasSubmenu, isOpen, onClick }) => (
//     <div>
//       <button
//         onClick={onClick}
//         className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//       >
//         <div className="flex items-center space-x-3">
//           <Icon size={18} />
//           <span className="text-sm">{label}</span>
//         </div>
//         {hasSubmenu && (
//           isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
//         )}
//       </button>
//     </div>
//   );

//   const SubMenuItem = ({ label, icon: Icon }) => (
//     <button className="w-full flex items-center space-x-3 px-4 py-2 pl-10 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
//       <Icon size={16} />
//       <span>{label}</span>
//     </button>
//   );

//   return (
//     <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
//       {/* Logo */}
//       <div className="p-4 border-b border-gray-200">
//         <h1 className="text-xl font-bold text-gray-800">FinSystem</h1>
//         <p className="text-xs text-gray-500 mt-1">Southern Province</p>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 overflow-y-auto p-3 space-y-1">
//         <Link to="/">
//           <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//             <Home size={18} />
//             <span className="text-sm">Dashboard</span>
//           </button>
//         </Link>

//         <div>
//           <Link to="/budget">
//             <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//               <FileText size={18} />
//               <span className="text-sm">Budget</span>
//             </button>
//           </Link>
//           {openMenus.openingBalance && (
//             <div className="mt-1 space-y-1">
//               <SubMenuItem label="Budget 2026" icon={FileText} />
//               <SubMenuItem label="Previous Years" icon={BarChart3} />
//             </div>
//           )}
//         </div>

//         <div>
//           <Link to="/monthly-finance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <FileText size={18} />
//             <span className="text-sm">Monthly Finance</span>
//           </Link>
//           {openMenus.allocation && (
//             <div className="mt-1 space-y-1">
//               <SubMenuItem label="Budget File Import" icon={Upload} />
//               <SubMenuItem label="Manual Entry" icon={FileText} />
//             </div>
//           )}
//         </div>

//         <div>
//           <Link to="/opening-balance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <Wallet size={18} />
//             <span className="text-sm">Opening Balance</span>
//           </Link>
//           {openMenus.allocation && (
//             <div className="mt-1 space-y-1">
//               <SubMenuItem label="Budget File Import" icon={Upload} />
//               <SubMenuItem label="Manual Entry" icon={FileText} />
//             </div>
//           )}
//         </div>

//         <div>
//           <Link to="/impress-issue" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <TrendingUp size={18} />
//             <span className="text-sm">Impress Issue</span>
//           </Link>
//           {openMenus.allocation && (
//             <div className="mt-1 space-y-1">
//               <SubMenuItem label="Budget File Import" icon={Upload} />
//               <SubMenuItem label="Manual Entry" icon={FileText} />
//             </div>
//           )}
//         </div>

//         <div>
//           <Link to="/impress-settlement" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <CheckCircle size={18} />
//             <span className="text-sm">Impress Settlement</span>
//           </Link>
//           {openMenus.impressIssue && (
//             <div className="mt-1 space-y-1">
//               <SubMenuItem label="New Issue" icon={FileText} />
//               <SubMenuItem label="Impress Settlement" icon={CheckCircle} />
//             </div>
//           )}
//         </div>

//         <div>
//           <Link to="/supplementary">
//             <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//               <FileText size={18} />
//               <span className="text-sm">Supplementary</span>
//             </button>
//           </Link>
//           {openMenus.supplementary && (
//             <div className="mt-1 space-y-1">
//               <SubMenuItem label="Reports" icon={BarChart3} />
//               <SubMenuItem label="Analytics" icon={TrendingUp} />
//             </div>
//           )}
//         </div>
//       </nav>

//       {/* Footer */}
//       <div className="border-t border-gray-200 p-3 space-y-2">
//         <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
//           <Settings size={18} />
//           <span className="text-sm">Settings</span>
//         </button>
//         <button className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
//           <LogOut size={18} />
//           <span className="text-sm">Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;


// components/Sidebar.jsx
import React, { useState } from 'react';
import {
  Home,
  Building2,
  Wallet,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Upload,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({
    finSystems: true,
    openingBalance: false,
    allocation: false,
    impressIssue: false,
    budget: false,
    supplementary: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Logout function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        // Call logout API
        await axios.post(`${API_BASE_URL}/logout`, {}, {
          headers: getAuthHeaders()
        });
      }

      // Remove token from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login page
      navigate('/login');

    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const MenuItem = ({ icon: Icon, label, hasSubmenu, isOpen, onClick }) => (
    <div>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon size={18} />
          <span className="text-sm">{label}</span>
        </div>
        {hasSubmenu && (
          isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        )}
      </button>
    </div>
  );

  const SubMenuItem = ({ label, icon: Icon, path }) => (
    <Link
      to={path}
      className="w-full flex items-center space-x-3 px-4 py-2 pl-10 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">FinSystem</h1>
        <p className="text-xs text-gray-500 mt-1">Southern Province</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <Link to="/">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Home size={18} />
            <span className="text-sm">Dashboard</span>
          </button>
        </Link>

        {/* Budget */}
        <div>
          <Link to="/budget">
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <FileText size={18} />
              <span className="text-sm">Budget</span>
            </button>
          </Link>
        </div>

        {/* Monthly Finance */}
        <div>
          <Link to="/monthly-finance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <FileText size={18} />
            <span className="text-sm">Monthly Finance</span>
          </Link>
        </div>

        {/* Opening Balance */}
        <div>
          <Link to="/opening-balance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Wallet size={18} />
            <span className="text-sm">Opening Balance</span>
          </Link>
        </div>

        {/* Impress Issue */}
        <div>
          <Link to="/impress-issue" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">Impress Issue</span>
          </Link>
        </div>

        {/* Impress Settlement */}
        <div>
          <Link to="/impress-settlement" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <CheckCircle size={18} />
            <span className="text-sm">Impress Settlement</span>
          </Link>
        </div>
        {/* net expenditure */}
        <div>

          <Link to="/net-expenditure" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">Net Expenditure</span>
          </Link>
        </div>

        {/* net allocation */}
        <div>

          <Link to="/net-allocation" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">Net Allocation</span>
          </Link>
        </div>

        {/* wop */}
        <div>

          <Link to="/wop" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">wop</span>
          </Link>
        </div>

        {/* coeow */}
        <div>

          <Link to="/coeow" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">COEOW</span>
          </Link>
        </div>


        {/* coehw */}
        <div>

          <Link to="/coehw" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">COEHW</span>
          </Link>
        </div>



        {/* RCExpenditure */}
        <div>

          <Link to="/rc" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">RCExpenditure</span>
          </Link>
        </div>


        {/* ODD */}
        <div>

          <Link to="/odd" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">ODD</span>
          </Link>
        </div>


        {/* ODS */}
        <div>

          <Link to="/ods" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">ODS</span>
          </Link>
        </div>


        {/* Journal Summary */}
        <div>

          <Link to="/journal" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">Journal Summary</span>
          </Link>
        </div>

        {/* main Journal Summary */}
        <div>

          <Link to="/main_journal" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">Main Journal (HW)</span>
          </Link>
        </div>


        {/* main imprest balace  */}
        <div>

          <Link to="/imprestBalance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">Imprest Balance</span>
          </Link>
        </div>


        {/* Allocation  balace  */}
        <div>

          <Link to="/allocation_balance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">Allocation Balance</span>
          </Link>
        </div>


        {/* CBG report  */}
        <div>

          <Link to="/cbg" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">CBG</span>
          </Link>
        </div>

        
        {/* PSD report  */}
        <div>

          <Link to="/psd" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <TrendingUp size={18} />
            <span className="text-sm">PSD</span>
          </Link>
        </div>






        {/* Supplementary */}
        <div>
          <Link to="/supplementary">
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <FileText size={18} />
              <span className="text-sm">Supplementary</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </button>

        {/* Logout Button with working functionality */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;