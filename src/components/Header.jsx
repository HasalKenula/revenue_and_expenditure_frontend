// // components/Header.jsx
// import React, { useState } from 'react';
// import { Search, Bell, User, Menu, X } from 'lucide-react';

// const Header = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
//       <div className="px-6 py-3 flex items-center justify-between">
//         {/* Mobile menu button */}
//         <button 
//           className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
//           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//         >
//           {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
//         </button>

//         {/* Search Bar */}
//         <div className="flex-1 max-w-md mx-4 lg:mx-0">
//           <div className="relative">
//             {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//             <input
//               type="text"
//               placeholder="Filter by department, code..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//             /> */}
//           </div>
//         </div>

//         {/* Right side actions */}
//         <div className="flex items-center space-x-4">
//           <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
//             <Bell size={20} />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//           </button>
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
//               <span className="text-white text-sm font-medium">K</span>
//             </div>
//             <div className="hidden md:block">
//               <p className="text-sm font-medium text-gray-700">Kamal</p>
//               <p className="text-xs text-gray-500">Finance Manager</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile menu panel */}
//       {mobileMenuOpen && (
//         <div className="lg:hidden border-t border-gray-200 p-4 space-y-3">
//           <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
//             <User size={18} />
//             <span>Profile</span>
//           </button>
//           <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
//             <Bell size={18} />
//             <span>Notifications</span>
//           </button>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Header;

// components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get user display name
  const getUserName = () => {
    if (!user) return 'User';
    return user.name || user.email || 'User';
  };

  // Get user role
  const getUserRole = () => {
    if (!user) return '';
    return user.role || user.user_type || 'User';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Mobile menu button */}
        <button 
          className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          {/* <div className="bg-blue-600 text-white font-bold text-xl px-3 py-1 rounded-lg">
            FM
          </div>
          <span className="font-semibold text-gray-700 hidden sm:inline">Finance Manager</span> */}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 lg:mx-0">
          <div className="relative">
            {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Filter by department, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            /> */}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {!loading && getUserInitials()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">
                {!loading ? getUserName() : 'Loading...'}
              </p>
              <p className="text-xs text-gray-500">
                {!loading ? getUserRole() : '...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 p-4 space-y-3">
          <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-100 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {!loading && getUserInitials()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {!loading ? getUserName() : 'Loading...'}
              </p>
              <p className="text-xs text-gray-500">
                {!loading ? getUserRole() : '...'}
              </p>
            </div>
          </div>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <User size={18} />
            <span>Profile</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;