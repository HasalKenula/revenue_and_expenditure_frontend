import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  Users,
  Mail,
  Lock,
  User,
  Shield,
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Building2,
  Table,
  Info,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import toast from 'react-hot-toast';

// Add a request interceptor to attach the token to every request
api.interceptors.request.use(
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

// Add a response interceptor to handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we get a 401 Unauthorized response
    if (error.response && error.response.status === 401) {
      // Clear all user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');

      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const AdminRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data || []);
      setTotalRecords(response.data.data?.length || 0);
      setLastPage(Math.ceil((response.data.data?.length || 0) / entriesPerPage));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Pagination
  const paginatedUsers = users.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Filter users by search
  const filteredUsers = paginatedUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage('');
    setMessageType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/admin/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setMessage('User created successfully!');
      setMessageType('success');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
      });

      toast.success('User created successfully!');
      fetchUsers();

    } catch (error) {
      if (error.response && error.response.data.message) {
        setMessage(error.response.data.message);
        setMessageType('error');
        toast.error(error.response.data.message);
      } else {
        setMessage('Something went wrong');
        setMessageType('error');
        toast.error('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    //if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      revenue_manager: 'bg-blue-100 text-blue-700',
      expenditure_manager: 'bg-green-100 text-green-700',
      user: 'bg-gray-100 text-gray-700'
    };
    return colors[role] || colors.user;
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      revenue_manager: 'Revenue Manager',
      expenditure_manager: 'Expenditure Manager',
      user: 'User'
    };
    return labels[role] || role;
  };

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      <div className="space-y-6">


        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-7 h-7 text-blue-600" />
                User Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create and manage user accounts with different roles
              </p>
            </div>

          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-blue-600" />
            <span className="text-sm text-blue-700">
              <strong>Note:</strong> Create new users with appropriate roles. Only admins can manage user accounts.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              document.getElementById('name').focus();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm shadow-sm"
          >
            <UserPlus size={16} />
            <span>Add New User</span>
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm bg-white shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create User Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Create New User
              </h2>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Password must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Re-enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> Passwords do not match
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="user">User</option>
                      <option value="revenue_manager">Revenue Manager</option>
                      <option value="expenditure_manager">Expenditure Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create User
                    </>
                  )}
                </button>

                {message && (
                  <div className={`text-center text-sm p-3 rounded-lg flex items-center gap-2 ${messageType === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {messageType === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* User List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  User List
                  <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {totalRecords}
                  </span>
                </h2>
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {showUserList ? 'Hide' : 'Show'} Users
                </button>
              </div>
            </div>

            {showUserList && (
              <div className="p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 text-xs">Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 text-xs">Email</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 text-xs">Role</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-600 text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-3 py-2 font-medium text-gray-800">{user.name}</td>
                            <td className="px-3 py-2 text-gray-600">{user.email}</td>
                            <td className="px-3 py-2">
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className={`text-xs border rounded-full px-3 py-1 font-medium ${getRoleColor(user.role)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              >
                                <option value="user" className="text-gray-700 bg-white">User</option>
                                <option value="revenue_manager" className="text-blue-700 bg-white">Revenue Manager</option>
                                <option value="expenditure_manager" className="text-green-700 bg-white">Expenditure Manager</option>
                                <option value="admin" className="text-red-700 bg-white">Admin</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                                  title="Delete User"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                              {user.role === 'admin' && (
                                <span className="text-xs text-gray-400">Protected</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalRecords > entriesPerPage && (
                  <div className="mt-4 px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
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
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
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
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminRegister;