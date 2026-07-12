// // // import React, { useState } from 'react';
// // // import { 
// // //   Lock, 
// // //   User, 
// // //   Eye, 
// // //   EyeOff, 
// // //   Shield, 
// // //   Wifi, 
// // //   Key,
// // //   LogIn 
// // // } from 'lucide-react';

// // // const LoginPage = () => {
// // //   const [username, setUsername] = useState('');
// // //   const [password, setPassword] = useState('');
// // //   const [showPassword, setShowPassword] = useState(false);
// // //   const [rememberMe, setRememberMe] = useState(false);
// // //   const [isLoading, setIsLoading] = useState(false);

// // //   const handleSubmit = (e) => {
// // //     e.preventDefault();
// // //     setIsLoading(true);
    
// // //     // Simulate login - this is frontend only
// // //     setTimeout(() => {
// // //       console.log('Login attempt:', { username, password, rememberMe });
// // //       alert(`Login attempt with username: ${username}`);
// // //       setIsLoading(false);
// // //     }, 1000);
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
// // //       {/* Main Container */}
// // //       <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        
// // //         {/* Left Side - Branding Section */}
// // //         <div className="lg:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-800 p-8 lg:p-12 text-white flex flex-col justify-between">
// // //           <div>
// // //             <div className="flex items-center space-x-3 mb-8">
// // //               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
// // //                 <Shield className="w-6 h-6 text-white" />
// // //               </div>
// // //               <div>
// // //                 <h1 className="text-2xl font-bold">FinSystems</h1>
// // //                 <p className="text-blue-200 text-sm">Southern Province</p>
// // //               </div>
// // //             </div>
            
// // //             <div className="mt-12">
// // //               <h2 className="text-3xl font-bold mb-4">Expenditure and Revenue Reporting System</h2>
// // //               <p className="text-blue-200 leading-relaxed">
// // //                 Access your  financial dashboard, manage budgets, 
// // //                 track expenses, and generate reports all in one place.
// // //               </p>
// // //             </div>

// // //             {/* Features List */}
// // //             <div className="mt-8 space-y-3">
// // //               <div className="flex items-center space-x-3 text-blue-100">
// // //                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
// // //                 <span className="text-sm">Real-time budget tracking</span>
// // //               </div>
// // //               <div className="flex items-center space-x-3 text-blue-100">
// // //                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
// // //                 <span className="text-sm">Secure financial data management</span>
// // //               </div>
// // //               <div className="flex items-center space-x-3 text-blue-100">
// // //                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
// // //                 <span className="text-sm">Automated report generation</span>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* System Status */}
// // //           <div className="mt-8 pt-6 border-t border-white/20">
// // //             <div className="flex items-center justify-between text-sm">
// // //               <div className="flex items-center space-x-2">
// // //                 <Wifi className="w-4 h-4 text-green-400" />
// // //                 <span className="text-blue-200">System Online</span>
// // //               </div>
// // //               <div className="flex items-center space-x-2">
// // //                 <Lock className="w-4 h-4 text-green-400" />
// // //                 <span className="text-blue-200">256-bit Encrypted</span>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Right Side - Login Form */}
// // //         <div className="lg:w-1/2 p-8 lg:p-12 bg-white">
// // //           <div className="max-w-md mx-auto w-full">
// // //             <div className="text-center mb-8">
// // //               <h3 className="text-2xl font-bold text-gray-800">Log in to your account</h3>
// // //               <p className="text-gray-500 mt-2">Enter your credentials to access your dashboard</p>
// // //             </div>

// // //             <form onSubmit={handleSubmit} className="space-y-6">
// // //               {/* Username Field */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Username
// // //                 </label>
// // //                 <div className="relative">
// // //                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// // //                     <User className="h-5 w-5 text-gray-400" />
// // //                   </div>
// // //                   <input
// // //                     type="text"
// // //                     value={username}
// // //                     onChange={(e) => setUsername(e.target.value)}
// // //                     placeholder="e.g., Kamal"
// // //                     className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// // //                     required
// // //                   />
// // //                 </div>
// // //               </div>

// // //               {/* Password Field */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                   Password
// // //                 </label>
// // //                 <div className="relative">
// // //                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// // //                     <Lock className="h-5 w-5 text-gray-400" />
// // //                   </div>
// // //                   <input
// // //                     type={showPassword ? "text" : "password"}
// // //                     value={password}
// // //                     onChange={(e) => setPassword(e.target.value)}
// // //                     placeholder="Enter your password"
// // //                     className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
// // //                     required
// // //                   />
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => setShowPassword(!showPassword)}
// // //                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
// // //                   >
// // //                     {showPassword ? (
// // //                       <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
// // //                     ) : (
// // //                       <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
// // //                     )}
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               {/* Remember Me & Forgot Password */}
// // //               <div className="flex items-center justify-between">
// // //                 <label className="flex items-center space-x-2 cursor-pointer">
// // //                   <input
// // //                     type="checkbox"
// // //                     checked={rememberMe}
// // //                     onChange={(e) => setRememberMe(e.target.checked)}
// // //                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
// // //                   />
// // //                   <span className="text-sm text-gray-600">Remember me</span>
// // //                 </label>
// // //                 <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
// // //                   Forgot Password?
// // //                 </a>
// // //               </div>

// // //               {/* Login Button */}
// // //               <button
// // //                 type="submit"
// // //                 disabled={isLoading}
// // //                 className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
// // //               >
// // //                 {isLoading ? (
// // //                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
// // //                 ) : (
// // //                   <LogIn className="w-5 h-5" />
// // //                 )}
// // //                 <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
// // //               </button>
// // //             </form>

// // //             {/* Register Link */}
// // //             <div className="mt-6 text-center">
// // //               <p className="text-sm text-gray-600">
// // //                 Don't have an institutional account?{' '}
// // //                 <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
// // //                   Register here
// // //                 </a>
// // //               </p>
// // //             </div>

// // //             {/* Divider */}
// // //             <div className="relative my-8">
// // //               <div className="absolute inset-0 flex items-center">
// // //                 <div className="w-full border-t border-gray-200"></div>
// // //               </div>
// // //               <div className="relative flex justify-center text-sm">
// // //                 <span className="px-4 bg-white text-gray-500">Secure Access</span>
// // //               </div>
// // //             </div>

// // //             {/* Security Badges */}
// // //             <div className="flex justify-center space-x-6">
// // //               <div className="flex items-center space-x-2 text-xs text-gray-500">
// // //                 <Shield className="w-4 h-4 text-green-500" />
// // //                 <span>SSL Secure</span>
// // //               </div>
// // //               <div className="flex items-center space-x-2 text-xs text-gray-500">
// // //                 <Key className="w-4 h-4 text-green-500" />
// // //                 <span>2FA Ready</span>
// // //               </div>
// // //               <div className="flex items-center space-x-2 text-xs text-gray-500">
// // //                 <Lock className="w-4 h-4 text-green-500" />
// // //                 <span>GDPR Compliant</span>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default LoginPage;


// // import { useState } from "react";
// // import { Link, useNavigate } from "react-router-dom";
// // import api from "../axios";

// // export default function Login() {
// //     const [email, setEmail] = useState("");
// //     const [password, setPassword] = useState("");
// //     const [message, setMessage] = useState("");
// //     const [loading, setLoading] = useState("");
// //     const navigate = useNavigate();

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setLoading(true);
// //         setMessage("");
       

// //         try {
// //             const response = await api.post('/login', {
// //                 email,
// //                 password
// //             });

// //             const token = response.data.token;
// //             localStorage.setItem("token", token);

// //             setMessage(response.data.message);
            
// //             navigate('/');
            
// //         } catch (error) {
// //             if (error.response && error.response.data.message) {
// //                 setMessage(error.response.data.message);
// //             } else {
// //                 setMessage("Somting went wrong");
// //             }
// //         }finally{
// //             setLoading(false);
// //         }
// //     }


// //     return (
// //         <div className="flex justify-center items-center h-screen">
// //             <form onSubmit={handleSubmit} className="bg-white text-gray-500 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-xl shadow-[0px_0px_10px_0px] shadow-black/10">
// //                 <h2 className="text-2xl font-bold mb-9 text-center text-gray-800">Revenue and Expenditure Management System</h2>
// //                 <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
// //                     <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
// //                         <path d="m2.5 4.375 3.875 2.906c.667.5 1.583.5 2.25 0L12.5 4.375" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
// //                         <path d="M11.875 3.125h-8.75c-.69 0-1.25.56-1.25 1.25v6.25c0 .69.56 1.25 1.25 1.25h8.75c.69 0 1.25-.56 1.25-1.25v-6.25c0-.69-.56-1.25-1.25-1.25Z" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" />
// //                     </svg>
// //                     <input className="w-full outline-none bg-transparent py-2.5" type="email" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Email" required />
// //                 </div>
// //                 <div className="flex items-center mt-2 mb-4 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
// //                     <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
// //                         <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
// //                     </svg>
// //                     <input className="w-full outline-none bg-transparent py-2.5" type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password" required />
// //                 </div>
// //                 <div className="flex items-center justify-between mb-6">
// //                     <div className="flex items-center gap-1">
// //                         <input id="checkbox" type="checkbox" />
// //                         <label htmlFor="checkbox">Remember me</label>
// //                     </div>
// //                     <a className="text-blue-600 underline" href="#">Forgot Password</a>
// //                 </div>
// //                 <button type="submit" className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600/90 transition py-2.5 rounded text-white font-medium">{loading ? "Submitting..." : "Log In"}</button>

// //                 {message && (
// //                     <p>{message}</p>
// //                 )}

// //                 <p className="text-center mt-4">Don't have an account? <Link to="/register" className="text-blue-500 underline">Signup</Link></p>
// //             </form>

// //         </div>
// //     );
// // }





// // pages/Login.jsx
// // import { useState } from "react";
// // import { Link, useNavigate } from "react-router-dom";
// // import api from "../axios";

// // export default function Login() {
// //     const [email, setEmail] = useState("");
// //     const [password, setPassword] = useState("");
// //     const [message, setMessage] = useState("");
// //     const [loading, setLoading] = useState(false);
// //     const navigate = useNavigate();

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setLoading(true);
// //         setMessage("");

// //         try {
// //             const response = await api.post('/login', {
// //                 email,
// //                 password
// //             });

// //             const { token, user } = response.data;
            
// //             // Store user data in localStorage
// //             localStorage.setItem("token", token);
// //             localStorage.setItem("userRole", user.role);
// //             localStorage.setItem("userName", user.name);
// //             localStorage.setItem("userEmail", user.email);
// //             localStorage.setItem("userId", user.id);

// //             setMessage(response.data.message);
            
// //             // Redirect to home
// //             navigate('/');
            
// //         } catch (error) {
// //             if (error.response && error.response.data.message) {
// //                 setMessage(error.response.data.message);
// //             } else {
// //                 setMessage("Something went wrong");
// //             }
// //         } finally {
// //             setLoading(false);
// //         }
// //     }

// //     return (
// //         <div className="flex justify-center items-center min-h-screen bg-gray-50">
// //             <form onSubmit={handleSubmit} className="bg-white text-gray-500 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-xl shadow-[0px_0px_10px_0px] shadow-black/10">
// //                 <h2 className="text-2xl font-bold mb-9 text-center text-gray-800">Revenue and Expenditure Management System</h2>
// //                 <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
// //                     <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
// //                         <path d="m2.5 4.375 3.875 2.906c.667.5 1.583.5 2.25 0L12.5 4.375" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
// //                         <path d="M11.875 3.125h-8.75c-.69 0-1.25.56-1.25 1.25v6.25c0 .69.56 1.25 1.25 1.25h8.75c.69 0 1.25-.56 1.25-1.25v-6.25c0-.69-.56-1.25-1.25-1.25Z" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" />
// //                     </svg>
// //                     <input className="w-full outline-none bg-transparent py-2.5" type="email" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Email" required />
// //                 </div>
// //                 <div className="flex items-center mt-2 mb-4 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
// //                     <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
// //                         <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
// //                     </svg>
// //                     <input className="w-full outline-none bg-transparent py-2.5" type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password" required />
// //                 </div>
// //                 <div className="flex items-center justify-between mb-6">
// //                     <div className="flex items-center gap-1">
// //                         <input id="checkbox" type="checkbox" />
// //                         <label htmlFor="checkbox">Remember me</label>
// //                     </div>
// //                     <a className="text-blue-600 underline" href="#">Forgot Password</a>
// //                 </div>
// //                 <button type="submit" disabled={loading} className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600/90 transition py-2.5 rounded text-white font-medium disabled:opacity-50">
// //                     {loading ? "Logging in..." : "Log In"}
// //                 </button>

// //                 {message && (
// //                     <p className="text-red-500 text-center">{message}</p>
// //                 )}

// //                 <p className="text-center mt-4">Don't have an account? <Link to="/register" className="text-blue-500 underline">Signup</Link></p>
// //             </form>
// //         </div>
// //     );
// // }



// //=====================================================================================
// // pages/Login.jsx
// // import { useState } from "react";
// // import { Link, useNavigate } from "react-router-dom";
// // import api from "../axios";

// // export default function Login() {
// //     const [email, setEmail] = useState("");
// //     const [password, setPassword] = useState("");
// //     const [message, setMessage] = useState("");
// //     const [loading, setLoading] = useState(false);
// //     const navigate = useNavigate();

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setLoading(true);
// //         setMessage("");

// //         try {
// //             const response = await api.post('/login', {
// //                 email,
// //                 password
// //             });

// //             const { token, user } = response.data;
            
// //             // Store user data in localStorage
// //             localStorage.setItem("token", token);
// //             localStorage.setItem("userRole", user.role);
// //             localStorage.setItem("userName", user.name);
// //             localStorage.setItem("userEmail", user.email);
// //             localStorage.setItem("userId", user.id);

// //             setMessage(response.data.message);
            
// //             // Redirect based on user role
// //             if (user.role === 'admin') {
// //                 navigate('/'); // Admin goes to home
// //             } else if (user.role === 'user') {
// //                 navigate('/head'); // User goes to head page
// //             } else {
// //                 navigate('/'); // Default fallback
// //             }
            
// //         } catch (error) {
// //             if (error.response && error.response.data.message) {
// //                 setMessage(error.response.data.message);
// //             } else {
// //                 setMessage("Something went wrong");
// //             }
// //         } finally {
// //             setLoading(false);
// //         }
// //     }

// //     return (
// //         <div className="flex justify-center items-center min-h-screen bg-gray-50">
// //             <form onSubmit={handleSubmit} className="bg-white text-gray-500 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-xl shadow-[0px_0px_10px_0px] shadow-black/10">
// //                 <h2 className="text-2xl font-bold mb-9 text-center text-gray-800">Revenue and Expenditure Management System</h2>
// //                 <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
// //                     <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
// //                         <path d="m2.5 4.375 3.875 2.906c.667.5 1.583.5 2.25 0L12.5 4.375" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
// //                         <path d="M11.875 3.125h-8.75c-.69 0-1.25.56-1.25 1.25v6.25c0 .69.56 1.25 1.25 1.25h8.75c.69 0 1.25-.56 1.25-1.25v-6.25c0-.69-.56-1.25-1.25-1.25Z" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" />
// //                     </svg>
// //                     <input className="w-full outline-none bg-transparent py-2.5" type="email" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Email" required />
// //                 </div>
// //                 <div className="flex items-center mt-2 mb-4 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
// //                     <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
// //                         <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
// //                     </svg>
// //                     <input className="w-full outline-none bg-transparent py-2.5" type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password" required />
// //                 </div>
// //                 <div className="flex items-center justify-between mb-6">
// //                     <div className="flex items-center gap-1">
// //                         <input id="checkbox" type="checkbox" />
// //                         <label htmlFor="checkbox">Remember me</label>
// //                     </div>
// //                     <a className="text-blue-600 underline" href="#">Forgot Password</a>
// //                 </div>
// //                 <button type="submit" disabled={loading} className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600/90 transition py-2.5 rounded text-white font-medium disabled:opacity-50">
// //                     {loading ? "Logging in..." : "Log In"}
// //                 </button>

// //                 {message && (
// //                     <p className="text-red-500 text-center">{message}</p>
// //                 )}

// //                 <p className="text-center mt-4">Don't have an account? <Link to="/register" className="text-blue-500 underline">Signup</Link></p>
// //             </form>
// //         </div>
// //     );
// // }

// //==========================================================


// // pages/Login.jsx
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../axios";

// export default function Login() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [message, setMessage] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [rememberMe, setRememberMe] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage("");

//         try {
//             const response = await api.post('/login', {
//                 email,
//                 password
//             });

//             const { token, user } = response.data;
            
//             localStorage.setItem("token", token);
//             localStorage.setItem("userRole", user.role);
//             localStorage.setItem("userName", user.name);
//             localStorage.setItem("userEmail", user.email);
//             localStorage.setItem("userId", user.id);

//             setMessage(response.data.message);
            
//             if (user.role === 'admin') {
//                 navigate('/');
//             } else if (user.role === 'user') {
//                 navigate('/head');
//             } else {
//                 navigate('/');
//             }
            
//         } catch (error) {
//             if (error.response && error.response.data.message) {
//                 setMessage(error.response.data.message);
//             } else {
//                 setMessage("Something went wrong");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
//             <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
                
//                 {/* Left Side - Branding Section */}
//                 <div className="lg:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-800 p-8 lg:p-12 text-white flex flex-col justify-between">
//                     <div>
//                         <div className="flex items-center space-x-3 mb-8">
//                             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
//                                 <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
//                                 </svg>
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-bold">REMS</h1>
//                                 <p className="text-blue-200 text-sm">Revenue & Expenditure Management</p>
//                             </div>
//                         </div>
                        
//                         <div className="mt-8">
//                             <h2 className="text-3xl font-bold mb-4 leading-tight">
//                                Revenue & Expenditure<br />
//                                 <span className="text-blue-200">Management System</span>
//                             </h2>
//                             <p className="text-blue-200 leading-relaxed">
//                                 Access your financial dashboard, manage budgets, 
//                                 track expenses, and generate reports all in one place.
//                             </p>
//                         </div>

//                         <div className="mt-8 space-y-3">
//                             <div className="flex items-center space-x-3 text-blue-100">
//                                 <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                                 <span className="text-sm">Real-time budget tracking</span>
//                             </div>
//                             <div className="flex items-center space-x-3 text-blue-100">
//                                 <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                                 <span className="text-sm">Secure financial data management</span>
//                             </div>
//                             <div className="flex items-center space-x-3 text-blue-100">
//                                 <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                                 <span className="text-sm">Automated report generation</span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="mt-8 pt-6 border-t border-white/20">
//                         <div className="flex items-center justify-between text-sm">
//                             <div className="flex items-center space-x-2">
//                                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                                 <span className="text-blue-200">System Online</span>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                                 </svg>
//                                 <span className="text-blue-200">256-bit Encrypted</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right Side - Login Form */}
//                 <div className="lg:w-1/2 p-8 lg:p-12 bg-white">
//                     <div className="max-w-md mx-auto w-full">
//                         <div className="text-center mb-8">
//                             <h3 className="text-2xl font-bold text-gray-800">Welcome Back</h3>
//                             <p className="text-gray-500 mt-2">Enter your credentials to access your account</p>
//                         </div>

//                         <form onSubmit={handleSubmit} className="space-y-6">
//                             {/* Email Field */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Email Address
//                                 </label>
//                                 <div className="relative">
//                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                         <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
//                                         </svg>
//                                     </div>
//                                     <input
//                                         type="email"
//                                         value={email}
//                                         onChange={(e) => setEmail(e.target.value)}
//                                         className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                                         placeholder="Enter your email"
//                                         required
//                                     />
//                                 </div>
//                             </div>

//                             {/* Password Field */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Password
//                                 </label>
//                                 <div className="relative">
//                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                         <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                                         </svg>
//                                     </div>
//                                     <input
//                                         type={showPassword ? "text" : "password"}
//                                         value={password}
//                                         onChange={(e) => setPassword(e.target.value)}
//                                         className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                                         placeholder="Enter your password"
//                                         required
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => setShowPassword(!showPassword)}
//                                         className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
//                                     >
//                                         {showPassword ? (
//                                             <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                                             </svg>
//                                         ) : (
//                                             <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                                             </svg>
//                                         )}
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Remember Me & Forgot Password */}
//                             <div className="flex items-center justify-between">
//                                 <label className="flex items-center space-x-2 cursor-pointer">
//                                     <input
//                                         type="checkbox"
//                                         checked={rememberMe}
//                                         onChange={(e) => setRememberMe(e.target.checked)}
//                                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                     />
//                                     <span className="text-sm text-gray-600">Remember me</span>
//                                 </label>
//                                 <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium">
//                                     Forgot Password?
//                                 </a>
//                             </div>

//                             {/* Login Button */}
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
//                             >
//                                 {loading ? (
//                                     <>
//                                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         <span>Logging in...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//                                         </svg>
//                                         <span>Log In</span>
//                                     </>
//                                 )}
//                             </button>

//                             {message && (
//                                 <div className={`text-center text-sm p-3 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
//                                     {message}
//                                 </div>
//                             )}
//                         </form>

//                         {/* Register Link */}
//                         <div className="mt-6 text-center">
//                             <p className="text-sm text-gray-600">
//                                 Don't have an account?{' '}
//                                 <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
//                                     Register here
//                                 </Link>
//                             </p>
//                         </div>

//                         {/* Divider */}
//                         <div className="relative my-8">
//                             <div className="absolute inset-0 flex items-center">
//                                 <div className="w-full border-t border-gray-200"></div>
//                             </div>
//                             <div className="relative flex justify-center text-sm">
//                                 <span className="px-4 bg-white text-gray-500">Secure Access</span>
//                             </div>
//                         </div>

//                         {/* Security Badges */}
//                         <div className="flex justify-center space-x-6">
//                             <div className="flex items-center space-x-2 text-xs text-gray-500">
//                                 <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
//                                     <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                                 </svg>
//                                 <span>SSL Secure</span>
//                             </div>
//                             <div className="flex items-center space-x-2 text-xs text-gray-500">
//                                 <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
//                                     <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
//                                 </svg>
//                                 <span>2FA Ready</span>
//                             </div>
//                             <div className="flex items-center space-x-2 text-xs text-gray-500">
//                                 <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
//                                     <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
//                                 </svg>
//                                 <span>GDPR Compliant</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }




// pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await api.post('/login', {
                email,
                password
            });

            const { token, user } = response.data;
            
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", user.role);
            localStorage.setItem("userName", user.name);
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("userId", user.id);

            setMessage(response.data.message);
            
            // Redirect based on user role
            switch(user.role) {
                case 'user':
                    navigate('/head');
                    break;
                case 'revenue_manager':
                    navigate('/');
                    break;
                case 'expenditure_manager':
                    navigate('/');
                    break;
                default:
                    navigate('/');
            }
            
        } catch (error) {
            if (error.response && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
                
                {/* Left Side - Branding Section */}
                <div className="lg:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-800 p-8 lg:p-12 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">REMS</h1>
                                <p className="text-blue-200 text-sm">Revenue & Expenditure Management</p>
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <h2 className="text-3xl font-bold mb-4 leading-tight">
                               Revenue & Expenditure<br />
                                <span className="text-blue-200">Management System</span>
                            </h2>
                            <p className="text-blue-200 leading-relaxed">
                                Access your financial dashboard, manage budgets, 
                                track expenses, and generate reports all in one place.
                            </p>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex items-center space-x-3 text-blue-100">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm">Real-time budget tracking</span>
                            </div>
                            <div className="flex items-center space-x-3 text-blue-100">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm">Secure financial data management</span>
                            </div>
                            <div className="flex items-center space-x-3 text-blue-100">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm">Automated report generation</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-blue-200">System Online</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-blue-200">256-bit Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="lg:w-1/2 p-8 lg:p-12 bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-800">Welcome Back</h3>
                            <p className="text-gray-500 mt-2">Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium">
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Log In</span>
                                    </>
                                )}
                            </button>

                            {message && (
                                <div className={`text-center text-sm p-3 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {message}
                                </div>
                            )}
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                    Register here
                                </Link>
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Secure Access</span>
                            </div>
                        </div>

                        {/* Security Badges */}
                        <div className="flex justify-center space-x-6">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>SSL Secure</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>2FA Ready</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                                <span>GDPR Compliant</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}