// import React, { useState } from 'react';
// import { 
//   Lock, 
//   User, 
//   Eye, 
//   EyeOff, 
//   Shield, 
//   Wifi, 
//   Key,
//   LogIn 
// } from 'lucide-react';

// const LoginPage = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     // Simulate login - this is frontend only
//     setTimeout(() => {
//       console.log('Login attempt:', { username, password, rememberMe });
//       alert(`Login attempt with username: ${username}`);
//       setIsLoading(false);
//     }, 1000);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
//       {/* Main Container */}
//       <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        
//         {/* Left Side - Branding Section */}
//         <div className="lg:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-800 p-8 lg:p-12 text-white flex flex-col justify-between">
//           <div>
//             <div className="flex items-center space-x-3 mb-8">
//               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
//                 <Shield className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold">FinSystems</h1>
//                 <p className="text-blue-200 text-sm">Southern Province</p>
//               </div>
//             </div>
            
//             <div className="mt-12">
//               <h2 className="text-3xl font-bold mb-4">Expenditure and Revenue Reporting System</h2>
//               <p className="text-blue-200 leading-relaxed">
//                 Access your  financial dashboard, manage budgets, 
//                 track expenses, and generate reports all in one place.
//               </p>
//             </div>

//             {/* Features List */}
//             <div className="mt-8 space-y-3">
//               <div className="flex items-center space-x-3 text-blue-100">
//                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
//                 <span className="text-sm">Real-time budget tracking</span>
//               </div>
//               <div className="flex items-center space-x-3 text-blue-100">
//                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
//                 <span className="text-sm">Secure financial data management</span>
//               </div>
//               <div className="flex items-center space-x-3 text-blue-100">
//                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
//                 <span className="text-sm">Automated report generation</span>
//               </div>
//             </div>
//           </div>

//           {/* System Status */}
//           <div className="mt-8 pt-6 border-t border-white/20">
//             <div className="flex items-center justify-between text-sm">
//               <div className="flex items-center space-x-2">
//                 <Wifi className="w-4 h-4 text-green-400" />
//                 <span className="text-blue-200">System Online</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Lock className="w-4 h-4 text-green-400" />
//                 <span className="text-blue-200">256-bit Encrypted</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Login Form */}
//         <div className="lg:w-1/2 p-8 lg:p-12 bg-white">
//           <div className="max-w-md mx-auto w-full">
//             <div className="text-center mb-8">
//               <h3 className="text-2xl font-bold text-gray-800">Log in to your account</h3>
//               <p className="text-gray-500 mt-2">Enter your credentials to access your dashboard</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Username Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Username
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <User className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     placeholder="e.g., Kamal"
//                     className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Password Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                     ) : (
//                       <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Remember Me & Forgot Password */}
//               <div className="flex items-center justify-between">
//                 <label className="flex items-center space-x-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={rememberMe}
//                     onChange={(e) => setRememberMe(e.target.checked)}
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-600">Remember me</span>
//                 </label>
//                 <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
//                   Forgot Password?
//                 </a>
//               </div>

//               {/* Login Button */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? (
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 ) : (
//                   <LogIn className="w-5 h-5" />
//                 )}
//                 <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
//               </button>
//             </form>

//             {/* Register Link */}
//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-600">
//                 Don't have an institutional account?{' '}
//                 <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
//                   Register here
//                 </a>
//               </p>
//             </div>

//             {/* Divider */}
//             <div className="relative my-8">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-4 bg-white text-gray-500">Secure Access</span>
//               </div>
//             </div>

//             {/* Security Badges */}
//             <div className="flex justify-center space-x-6">
//               <div className="flex items-center space-x-2 text-xs text-gray-500">
//                 <Shield className="w-4 h-4 text-green-500" />
//                 <span>SSL Secure</span>
//               </div>
//               <div className="flex items-center space-x-2 text-xs text-gray-500">
//                 <Key className="w-4 h-4 text-green-500" />
//                 <span>2FA Ready</span>
//               </div>
//               <div className="flex items-center space-x-2 text-xs text-gray-500">
//                 <Lock className="w-4 h-4 text-green-500" />
//                 <span>GDPR Compliant</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState("");
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

            const token = response.data.token;
            localStorage.setItem("token", token);

            setMessage(response.data.message);
            
            navigate('/');
            
        } catch (error) {
            if (error.response && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Somting went wrong");
            }
        }finally{
            setLoading(false);
        }
    }


    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleSubmit} className="bg-white text-gray-500 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-xl shadow-[0px_0px_10px_0px] shadow-black/10">
                <h2 className="text-2xl font-bold mb-9 text-center text-gray-800">Welcome Back</h2>
                <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
                    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m2.5 4.375 3.875 2.906c.667.5 1.583.5 2.25 0L12.5 4.375" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11.875 3.125h-8.75c-.69 0-1.25.56-1.25 1.25v6.25c0 .69.56 1.25 1.25 1.25h8.75c.69 0 1.25-.56 1.25-1.25v-6.25c0-.69-.56-1.25-1.25-1.25Z" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <input className="w-full outline-none bg-transparent py-2.5" type="email" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Email" required />
                </div>
                <div className="flex items-center mt-2 mb-4 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
                    <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
                    </svg>
                    <input className="w-full outline-none bg-transparent py-2.5" type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password" required />
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1">
                        <input id="checkbox" type="checkbox" />
                        <label htmlFor="checkbox">Remember me</label>
                    </div>
                    <a className="text-blue-600 underline" href="#">Forgot Password</a>
                </div>
                <button type="submit" className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600/90 transition py-2.5 rounded text-white font-medium">{loading ? "Submitting..." : "Log In"}</button>

                {message && (
                    <p>{message}</p>
                )}

                <p className="text-center mt-4">Don't have an account? <Link to="/register" className="text-blue-500 underline">Signup</Link></p>
            </form>

        </div>
    );
}

