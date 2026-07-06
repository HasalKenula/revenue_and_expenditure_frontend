// // pages/UserProfile.jsx
// import React, { useState, useEffect } from 'react';
// import { User, Mail, Lock, Save, Eye, EyeOff, Shield, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
// import api from '../axios';

// export default function UserProfile() {
//     const navigate = useNavigate();
//     const [userData, setUserData] = useState({
//         name: '',
//         email: '',
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: '',
//     });
//     const [showPassword, setShowPassword] = useState({
//         current: false,
//         new: false,
//         confirm: false,
//     });
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState('');
//     const [messageType, setMessageType] = useState(''); // 'success' or 'error'
//     const [errors, setErrors] = useState({});

//     // Fetch user profile data on component mount
//     useEffect(() => {
//         fetchUserProfile();
//     }, []);

//     const fetchUserProfile = async () => {
//         try {
//             const response = await api.get('/user/profile');
//             if (response.data.success) {
//                 setUserData(prev => ({
//                     ...prev,
//                     name: response.data.data.name,
//                     email: response.data.data.email,
//                 }));
//             }
//         } catch (error) {
//             console.error('Error fetching profile:', error);
//             setMessage('Failed to load profile data');
//             setMessageType('error');
            
//             // If unauthorized, redirect to login
//             if (error.response?.status === 401) {
//                 navigate('/login');
//             }
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setUserData(prev => ({ ...prev, [name]: value }));
//         // Clear error for this field
//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: '' }));
//         }
//     };

//     const togglePasswordVisibility = (field) => {
//         setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
//     };

//     const validateForm = () => {
//         const newErrors = {};
        
//         // Validate name
//         if (!userData.name.trim()) {
//             newErrors.name = 'Name is required';
//         } else if (userData.name.length < 2) {
//             newErrors.name = 'Name must be at least 2 characters';
//         }

//         // Validate email
//         if (!userData.email.trim()) {
//             newErrors.email = 'Email is required';
//         } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
//             newErrors.email = 'Please enter a valid email address';
//         }

//         // Validate password fields if any password field is filled
//         const hasPasswordFields = userData.currentPassword || userData.newPassword || userData.confirmPassword;
        
//         if (hasPasswordFields) {
//             if (!userData.currentPassword) {
//                 newErrors.currentPassword = 'Current password is required to change password';
//             }
//             if (!userData.newPassword) {
//                 newErrors.newPassword = 'New password is required';
//             } else if (userData.newPassword.length < 8) {
//                 newErrors.newPassword = 'Password must be at least 8 characters';
//             }
//             if (!userData.confirmPassword) {
//                 newErrors.confirmPassword = 'Please confirm your password';
//             } else if (userData.newPassword !== userData.confirmPassword) {
//                 newErrors.confirmPassword = 'Passwords do not match';
//             }
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!validateForm()) {
//             return;
//         }

//         setLoading(true);
//         setMessage('');
//         setErrors({});

//         try {
//             // Prepare data for API
//             const updateData = {
//                 name: userData.name,
//                 email: userData.email,
//             };

//             // Only include password fields if they are filled
//             const hasPasswordFields = userData.currentPassword && userData.newPassword && userData.confirmPassword;
            
//             if (hasPasswordFields) {
//                 updateData.current_password = userData.currentPassword;
//                 updateData.password = userData.newPassword;
//                 updateData.password_confirmation = userData.confirmPassword;
//             }

//             const response = await api.put('/user/profile', updateData);

//             if (response.data.success) {
//                 // Update local storage with new user data
//                 localStorage.setItem('userName', userData.name);
//                 localStorage.setItem('userEmail', userData.email);

//                 setMessage(response.data.message || 'Profile updated successfully!');
//                 setMessageType('success');

//                 // Clear password fields
//                 setUserData(prev => ({
//                     ...prev,
//                     currentPassword: '',
//                     newPassword: '',
//                     confirmPassword: '',
//                 }));

//                 // Refresh profile data
//                 fetchUserProfile();
//             }
//         } catch (error) {
//             console.error('Error updating profile:', error);
            
//             if (error.response) {
//                 // Handle validation errors
//                 if (error.response.data.errors) {
//                     setErrors(error.response.data.errors);
//                 } else if (error.response.data.message) {
//                     setMessage(error.response.data.message);
//                     setMessageType('error');
//                 } else {
//                     setMessage('Failed to update profile');
//                     setMessageType('error');
//                 }
//             } else {
//                 setMessage('Network error. Please try again.');
//                 setMessageType('error');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="flex h-screen bg-gray-50">
//             <Sidebar />
//             <div className="flex-1 flex flex-col overflow-hidden">
//                 <Header />
//                 <main className="flex-1 overflow-y-auto p-6">
//                     <div className="max-w-4xl mx-auto">
//                         {/* Page Header */}
//                         <div className="flex items-center justify-between mb-6">
//                             <div className="flex items-center space-x-4">
//                                 <button
//                                     onClick={() => navigate(-1)}
//                                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                                 >
//                                     <ArrowLeft size={20} className="text-gray-600" />
//                                 </button>
//                                 <div>
//                                     <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
//                                     <p className="text-sm text-gray-500 mt-1">Manage your account information and security</p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
//                                 <Shield size={16} className="text-blue-600" />
//                                 <span className="text-sm text-blue-600">Secure Connection</span>
//                             </div>
//                         </div>

//                         {/* Message Display */}
//                         {message && (
//                             <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
//                                 messageType === 'success' 
//                                     ? 'bg-green-50 border border-green-200 text-green-700' 
//                                     : 'bg-red-50 border border-red-200 text-red-700'
//                             }`}>
//                                 {messageType === 'success' ? (
//                                     <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
//                                 ) : (
//                                     <XCircle size={20} className="flex-shrink-0 mt-0.5" />
//                                 )}
//                                 <span className="text-sm">{message}</span>
//                             </div>
//                         )}

//                         {/* Profile Form */}
//                         <form onSubmit={handleSubmit} className="space-y-6">
//                             {/* Personal Information Card */}
//                             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                                 <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                     <User size={20} className="text-blue-600" />
//                                     Personal Information
//                                 </h2>
                                
//                                 <div className="space-y-4">
//                                     {/* Name Field */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Full Name <span className="text-red-500">*</span>
//                                         </label>
//                                         <div className="relative">
//                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                                 <User size={18} className="text-gray-400" />
//                                             </div>
//                                             <input
//                                                 type="text"
//                                                 name="name"
//                                                 value={userData.name}
//                                                 onChange={handleChange}
//                                                 className={`w-full pl-10 pr-3 py-2.5 border ${
//                                                     errors.name ? 'border-red-500' : 'border-gray-300'
//                                                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
//                                                 placeholder="Enter your full name"
//                                             />
//                                         </div>
//                                         {errors.name && (
//                                             <p className="mt-1 text-sm text-red-600">{errors.name}</p>
//                                         )}
//                                     </div>

//                                     {/* Email Field */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Email Address <span className="text-red-500">*</span>
//                                         </label>
//                                         <div className="relative">
//                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                                 <Mail size={18} className="text-gray-400" />
//                                             </div>
//                                             <input
//                                                 type="email"
//                                                 name="email"
//                                                 value={userData.email}
//                                                 onChange={handleChange}
//                                                 className={`w-full pl-10 pr-3 py-2.5 border ${
//                                                     errors.email ? 'border-red-500' : 'border-gray-300'
//                                                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
//                                                 placeholder="Enter your email address"
//                                             />
//                                         </div>
//                                         {errors.email && (
//                                             <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Change Password Card */}
//                             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                                 <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                     <Lock size={20} className="text-blue-600" />
//                                     Change Password
//                                 </h2>
//                                 <p className="text-sm text-gray-500 mb-4">Leave password fields empty to keep current password</p>

//                                 <div className="space-y-4">
//                                     {/* Current Password */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Current Password
//                                         </label>
//                                         <div className="relative">
//                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                                 <Lock size={18} className="text-gray-400" />
//                                             </div>
//                                             <input
//                                                 type={showPassword.current ? "text" : "password"}
//                                                 name="currentPassword"
//                                                 value={userData.currentPassword}
//                                                 onChange={handleChange}
//                                                 className={`w-full pl-10 pr-10 py-2.5 border ${
//                                                     errors.currentPassword ? 'border-red-500' : 'border-gray-300'
//                                                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
//                                                 placeholder="Enter your current password"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => togglePasswordVisibility('current')}
//                                                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                                             >
//                                                 {showPassword.current ? (
//                                                     <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
//                                                 ) : (
//                                                     <Eye size={18} className="text-gray-400 hover:text-gray-600" />
//                                                 )}
//                                             </button>
//                                         </div>
//                                         {errors.currentPassword && (
//                                             <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
//                                         )}
//                                     </div>

//                                     {/* New Password */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             New Password
//                                         </label>
//                                         <div className="relative">
//                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                                 <Lock size={18} className="text-gray-400" />
//                                             </div>
//                                             <input
//                                                 type={showPassword.new ? "text" : "password"}
//                                                 name="newPassword"
//                                                 value={userData.newPassword}
//                                                 onChange={handleChange}
//                                                 className={`w-full pl-10 pr-10 py-2.5 border ${
//                                                     errors.newPassword ? 'border-red-500' : 'border-gray-300'
//                                                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
//                                                 placeholder="Enter new password (min 8 characters)"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => togglePasswordVisibility('new')}
//                                                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                                             >
//                                                 {showPassword.new ? (
//                                                     <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
//                                                 ) : (
//                                                     <Eye size={18} className="text-gray-400 hover:text-gray-600" />
//                                                 )}
//                                             </button>
//                                         </div>
//                                         {errors.newPassword && (
//                                             <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
//                                         )}
//                                         {!errors.newPassword && userData.newPassword && (
//                                             <p className="mt-1 text-xs text-gray-500">
//                                                 Password must be at least 8 characters
//                                             </p>
//                                         )}
//                                     </div>

//                                     {/* Confirm Password */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             Confirm New Password
//                                         </label>
//                                         <div className="relative">
//                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                                 <Lock size={18} className="text-gray-400" />
//                                             </div>
//                                             <input
//                                                 type={showPassword.confirm ? "text" : "password"}
//                                                 name="confirmPassword"
//                                                 value={userData.confirmPassword}
//                                                 onChange={handleChange}
//                                                 className={`w-full pl-10 pr-10 py-2.5 border ${
//                                                     errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
//                                                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
//                                                 placeholder="Confirm your new password"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => togglePasswordVisibility('confirm')}
//                                                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                                             >
//                                                 {showPassword.confirm ? (
//                                                     <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
//                                                 ) : (
//                                                     <Eye size={18} className="text-gray-400 hover:text-gray-600" />
//                                                 )}
//                                             </button>
//                                         </div>
//                                         {errors.confirmPassword && (
//                                             <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Submit Button */}
//                             <div className="flex justify-end space-x-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setUserData(prev => ({
//                                             ...prev,
//                                             currentPassword: '',
//                                             newPassword: '',
//                                             confirmPassword: '',
//                                         }));
//                                         setErrors({});
//                                         setMessage('');
//                                     }}
//                                     className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                             <span>Saving...</span>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Save size={18} />
//                                             <span>Save Changes</span>
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// }


// pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff, Shield, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import axios from 'axios';

const API_BASE_URL =  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Request interceptor to add token
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

// Response interceptor to handle 401
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default function UserProfile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [errors, setErrors] = useState({});

    // Check authentication and fetch profile on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await api.get('/user/profile');
            console.log('Profile response:', response.data);
            
            if (response.data.success) {
                setUserData(prev => ({
                    ...prev,
                    name: response.data.data.name || '',
                    email: response.data.data.email || '',
                }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate('/login');
            } else {
                setMessage('Failed to load profile data');
                setMessageType('error');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!userData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (userData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!userData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        const hasPasswordFields = userData.currentPassword || userData.newPassword || userData.confirmPassword;
        
        if (hasPasswordFields) {
            if (!userData.currentPassword) {
                newErrors.currentPassword = 'Current password is required to change password';
            }
            if (!userData.newPassword) {
                newErrors.newPassword = 'New password is required';
            } else if (userData.newPassword.length < 8) {
                newErrors.newPassword = 'Password must be at least 8 characters';
            }
            if (!userData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (userData.newPassword !== userData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const updateData = {
                name: userData.name,
                email: userData.email,
            };

            const hasPasswordFields = userData.currentPassword && userData.newPassword && userData.confirmPassword;
            
            if (hasPasswordFields) {
                updateData.current_password = userData.currentPassword;
                updateData.password = userData.newPassword;
                updateData.password_confirmation = userData.confirmPassword;
            }

            const response = await api.put('/user/profile', updateData);
            console.log('Update response:', response.data);

            if (response.data.success) {
                localStorage.setItem('userName', userData.name);
                localStorage.setItem('userEmail', userData.email);

                setMessage(response.data.message || 'Profile updated successfully!');
                setMessageType('success');

                setUserData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));

                await fetchUserProfile();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate('/login');
            } else if (error.response) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response.data.message) {
                    setMessage(error.response.data.message);
                    setMessageType('error');
                } else {
                    setMessage('Failed to update profile');
                    setMessageType('error');
                }
            } else {
                setMessage('Network error. Please try again.');
                setMessageType('error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
                                    <p className="text-sm text-gray-500 mt-1">Manage your account information and security</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                                <Shield size={16} className="text-blue-600" />
                                <span className="text-sm text-blue-600">Secure Connection</span>
                            </div>
                        </div>

                        {/* Message Display */}
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                                messageType === 'success' 
                                    ? 'bg-green-50 border border-green-200 text-green-700' 
                                    : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                                {messageType === 'success' ? (
                                    <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle size={20} className="flex-shrink-0 mt-0.5" />
                                )}
                                <span className="text-sm">{message}</span>
                            </div>
                        )}

                        {/* Profile Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <User size={20} className="text-blue-600" />
                                    Personal Information
                                </h2>
                                
                                <div className="space-y-4">
                                    {/* Name Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={userData.name}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-3 py-2.5 border ${
                                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={userData.email}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-3 py-2.5 border ${
                                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Lock size={20} className="text-blue-600" />
                                    Change Password
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">Leave password fields empty to keep current password</p>

                                <div className="space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword.current ? "text" : "password"}
                                                name="currentPassword"
                                                value={userData.currentPassword}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-10 py-2.5 border ${
                                                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                placeholder="Enter your current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPassword.current ? (
                                                    <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.currentPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword.new ? "text" : "password"}
                                                name="newPassword"
                                                value={userData.newPassword}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-10 py-2.5 border ${
                                                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                placeholder="Enter new password (min 8 characters)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPassword.new ? (
                                                    <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.newPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                                        )}
                                        {!errors.newPassword && userData.newPassword && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                Password must be at least 8 characters
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword.confirm ? "text" : "password"}
                                                name="confirmPassword"
                                                value={userData.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-10 py-2.5 border ${
                                                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                                placeholder="Confirm your new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPassword.confirm ? (
                                                    <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUserData(prev => ({
                                            ...prev,
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: '',
                                        }));
                                        setErrors({});
                                        setMessage('');
                                    }}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}