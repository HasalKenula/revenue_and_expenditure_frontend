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
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const [openMenus, setOpenMenus] = useState({
//     finSystems: true,
//     openingBalance: false,
//     allocation: false,
//     impressIssue: false,
//     budget: false,
//     supplementary: false
//   });

//   const toggleMenu = (menu) => {
//     setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
//   };

//   // Helper function to get auth headers
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem('token');
//     return {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//       'Authorization': `Bearer ${token}`
//     };
//   };

//   // Logout function
//   const handleLogout = async () => {
//     try {
//       const token = localStorage.getItem('token');

//       if (token) {
//         // Call logout API
//         await axios.post(`${API_BASE_URL}/logout`, {}, {
//           headers: getAuthHeaders()
//         });
//       }

//       // Remove token from localStorage
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');

//       // Redirect to login page
//       navigate('/login');

//     } catch (error) {
//       console.error('Logout error:', error);
//       // Even if API call fails, clear local storage and redirect
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       navigate('/login');
//     }
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

//   const SubMenuItem = ({ label, icon: Icon, path }) => (
//     <Link
//       to={path}
//       className="w-full flex items-center space-x-3 px-4 py-2 pl-10 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//     >
//       <Icon size={16} />
//       <span>{label}</span>
//     </Link>
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

//         {/* Budget */}
//         <div>
//           <Link to="/budget">
//             <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//               <FileText size={18} />
//               <span className="text-sm">Budget</span>
//             </button>
//           </Link>
//         </div>

//         {/* Monthly Finance */}
//         <div>
//           <Link to="/monthly-finance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <FileText size={18} />
//             <span className="text-sm">Monthly Finance</span>
//           </Link>
//         </div>

//         {/* Opening Balance */}
//         <div>
//           <Link to="/opening-balance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <Wallet size={18} />
//             <span className="text-sm">Opening Balance</span>
//           </Link>
//         </div>

//         {/* Impress Issue */}
//         <div>
//           <Link to="/impress-issue" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <TrendingUp size={18} />
//             <span className="text-sm">Impress Issue</span>
//           </Link>
//         </div>

//         {/* Impress Settlement */}
//         <div>
//           <Link to="/impress-settlement" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <CheckCircle size={18} />
//             <span className="text-sm">Impress Settlement</span>
//           </Link>
//         </div>

//         {/*  reports  */}
//         <div>

//           <Link to="/reports" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <TrendingUp size={18} />
//             <span className="text-sm">Reports</span>
//           </Link>
//         </div>
//         {/* Head  */}
//         <div>
//           <Link to="/headinfo" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <CheckCircle size={18} />
//             <span className="text-sm">Head</span>
//           </Link>
//         </div>

//         {/* Estimate code  */}
//         <div>
//           <Link to="/estimate" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <CheckCircle size={18} />
//             <span className="text-sm">Estimate</span>
//           </Link>
//         </div>

//          {/* Treasury code  */}
//         <div>
//           <Link to="/treasury" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <CheckCircle size={18} />
//             <span className="text-sm">Treasury Revenue</span>
//           </Link>
//         </div>

//          {/* Net Revenue code  */}
//         <div>
//           <Link to="/net_revenue" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <CheckCircle size={18} />
//             <span className="text-sm">Net Revenue </span>
//           </Link>
//         </div>

//         {/* Supplementary */}
//         <div>
//           <Link to="/supplementary">
//             <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//               <FileText size={18} />
//               <span className="text-sm">Supplementary</span>
//             </button>
//           </Link>
//         </div>
//       </nav>





//       {/* Footer */}
//       <div className="border-t border-gray-200 p-3 space-y-2">
//         <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
//           <Settings size={18} />
//           <span className="text-sm">Settings</span>
//         </button>

//         {/* Logout Button with working functionality */}
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//         >
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
  BarChart3,
  Users,
  BookOpen,
  DollarSign,
  PieChart,
  Calendar,
  ClipboardList,
  Layers,
  Grid,
  FolderOpen,
  User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

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

      // Remove all data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');

      // Redirect to login page
      navigate('/login');

    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
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
        {/* {userName && (
          <p className="text-xs text-blue-600 mt-1 font-medium">
            👤 {userName}
            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${userRole === 'user' ? 'bg-yellow-100 text-yellow-700' :
              userRole === 'revenue_manager' ? 'bg-green-100 text-green-700' :
                userRole === 'expenditure_manager' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
              }`}>
              {userRole?.replace('_', ' ')}
            </span>
          </p>
        )} */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">

        {/* ==================== BOTH REVENUE & EXPENDITURE MANAGERS ==================== */}
        {(userRole === 'revenue_manager' || userRole === 'expenditure_manager') && (
          <>
            {/* Dashboard - Visible to ALL authenticated users */}
            <Link to="/">
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Home size={18} />
                <span className="text-sm">Dashboard</span>
              </button>
            </Link>
          </>
        )}

        {/* ==================== USER ONLY MENU ITEMS ==================== */}
        {userRole === 'user' && (
          <>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="px-4 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wider">
              User Menu
            </div>
            <div>
              <Link to="/head" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Upload size={18} />
                <span className="text-sm">Head Upload</span>
              </Link>
            </div>
          </>
        )}

        {/* ==================== REVENUE MANAGER ONLY MENU ITEMS ==================== */}
        {userRole === 'revenue_manager' && (
          <>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="px-4 py-1 text-xs text-green-600 font-semibold uppercase tracking-wider">
              Revenue Management
            </div>


            {/* Treasury Revenue - Only Revenue Manager */}
            <div>
              <Link to="/treasury" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Building2 size={18} />
                <span className="text-sm">Treasury Revenue</span>
              </Link>
            </div>

            {/* Estimate - Only Revenue Manager */}
            <div>
              <Link to="/estimate" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <ClipboardList size={18} />
                <span className="text-sm">Estimate</span>
              </Link>
            </div>

            {/* Head Info - Both */}
            {/* <div>
              <Link to="/headinfo" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <BookOpen size={18} />
                <span className="text-sm">Head Info</span>
              </Link>
            </div> */}

            {/* Item Code - Both */}
            {/* <div>
              <Link to="/itemcode" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Grid size={18} />
                <span className="text-sm">Item Code</span>
              </Link>
            </div> */}



            {/*  revenue_reports */}
            <div>
              <Link to="/revenue_reports" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <PieChart size={18} />
                <span className="text-sm">Revenue Reports</span>
              </Link>
            </div>


          </>
        )}

        {/* ==================== EXPENDITURE MANAGER ONLY MENU ITEMS ==================== */}
        {userRole === 'expenditure_manager' && (
          <>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="px-4 py-1 text-xs text-purple-600 font-semibold uppercase tracking-wider">
              Expenditure Management
            </div>

            {/* Budget - Only Revenue Manager */}
            <div>
              <Link to="/budget" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <FileText size={18} />
                <span className="text-sm">Budget</span>
              </Link>
            </div>


            {/* Monthly Finance  */}
            <div>
              <Link to="/monthly-finance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Calendar size={18} />
                <span className="text-sm">Monthly Finance</span>
              </Link>
            </div>

            {/* Supplementary - Only Expenditure Manager */}
            <div>
              <Link to="/supplementary" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <FileText size={18} />
                <span className="text-sm">Supplementary</span>
              </Link>
            </div>

            {/* Impress Issue - Only Expenditure Manager */}
            <div>
              <Link to="/impress-issue" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <TrendingUp size={18} />
                <span className="text-sm">Impress Issue</span>
              </Link>
            </div>

            {/* Impress Settlement - Only Expenditure Manager */}
            <div>
              <Link to="/impress-settlement" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <CheckCircle size={18} />
                <span className="text-sm">Impress Settlement</span>
              </Link>
            </div>

            {/* Opening Balance - Only Expenditure Manager */}
            <div>
              <Link to="/opening-balance" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Wallet size={18} />
                <span className="text-sm">Opening Balance</span>
              </Link>
            </div>

            {/* Reports */}
            <div>
              <Link to="/reports" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <PieChart size={18} />
                <span className="text-sm">Reports</span>
              </Link>
            </div>

            {/* stamps mooth */}
            <div>
              <Link to="/stamp-month" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <PieChart size={18} />
                <span className="text-sm">stamps mooth</span>
              </Link>
            </div>


            {/* stamp-summary */}
            <div>
              <Link to="/stamp-summary" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <PieChart size={18} />
                <span className="text-sm">stamp summary</span>
              </Link>
            </div>

           
             {/* transfer-monthly */}
            <div>
              <Link to="/transfer-monthly" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <PieChart size={18} />
                <span className="text-sm">transfer monthly</span>
              </Link>
            </div>



          </>
        )}

      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </button>

        <Link to="/profile">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <User size={18} />
            <span className="text-sm">My Profile</span>
          </button>
        </Link>

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