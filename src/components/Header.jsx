// components/Header.jsx
import React, { useState } from 'react';
import { Search, Bell, User, Menu, X } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <span className="text-white text-sm font-medium">K</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">Kamal</p>
              <p className="text-xs text-gray-500">Finance Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 p-4 space-y-3">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <User size={18} />
            <span>Profile</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell size={18} />
            <span>Notifications</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;