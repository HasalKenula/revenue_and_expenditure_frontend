// import { Link, useNavigate } from "react-router-dom";
// import api from "../axios";
// import { useState } from "react";

// export default function Register() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [name, setName] = useState("");
//     const [message, setMessage] = useState("");
//     const [loading, setLoading] = useState("");
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage("");
        


//         try {
//             const response = await api.post('/register', {
//                 name,
//                 email,
//                 password
//             });

//             setMessage(response.data.message);
//             navigate('/login');

//         } catch (error) {
//             if (error.response && error.response.data.message) {
//                 setMessage(error.response.data.message);
//             } else {
//                 setMessage("Somting went wrong");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }



//     return (
//         <div className="flex justify-center items-center h-screen">
//             <form onSubmit={handleSubmit} className="bg-white text-gray-500 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-lg shadow-[0px_0px_10px_0px] shadow-black/10">
//                 <h2 className="text-2xl font-bold mb-9 text-center text-gray-800">Sign Up</h2>
//                 <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
//                     <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M3.125 13.125a4.375 4.375 0 0 1 8.75 0M10 4.375a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                     <input className="w-full outline-none bg-transparent py-2.5" type="text"
//                         onChange={(e) => setName(e.target.value)}
//                         value={name}
//                         placeholder="Username" required />
//                 </div>
//                 <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
//                     <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="m2.5 4.375 3.875 2.906c.667.5 1.583.5 2.25 0L12.5 4.375" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
//                         <path d="M11.875 3.125h-8.75c-.69 0-1.25.56-1.25 1.25v6.25c0 .69.56 1.25 1.25 1.25h8.75c.69 0 1.25-.56 1.25-1.25v-6.25c0-.69-.56-1.25-1.25-1.25Z" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" />
//                     </svg>
//                     <input className="w-full outline-none bg-transparent py-2.5" type="email"
//                         onChange={(e) => setEmail(e.target.value)}
//                         value={email}
//                         placeholder="Email" required />
//                 </div>
//                 <div className="flex items-center mt-2 mb-8 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
//                     <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="m2.5 4.375 3.875 2.906c.667.5 1.583.5 2.25 0L12.5 4.375" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
//                         <path d="M11.875 3.125h-8.75c-.69 0-1.25.56-1.25 1.25v6.25c0 .69.56 1.25 1.25 1.25h8.75c.69 0 1.25-.56 1.25-1.25v-6.25c0-.69-.56-1.25-1.25-1.25Z" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" />
//                     </svg>
//                     <input className="w-full outline-none bg-transparent py-2.5" type="password"
//                         onChange={(e) => setPassword(e.target.value)}
//                         value={password}
//                         placeholder="Password" required />
//                 </div>
//                 <button className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600 transition-all active:scale-95 py-2.5 rounded text-white font-medium">{loading ? "Submitting..." : "Create Account"}</button>

//                 {message && (
//                     <p>{message}</p>
//                 )}

//                 <p className="text-center mt-4">Already have an account? <Link to="/login" className="text-blue-500 underline">Log In</Link></p>
//             </form>
//         </div>
//     );
// }











// // pages/Register.jsx
// import { Link, useNavigate } from "react-router-dom";
// import api from "../axios";
// import { useState } from "react";

// export default function Register() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [name, setName] = useState("");
//     const [role, setRole] = useState("user");
//     const [message, setMessage] = useState("");
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage("");

//         try {
//             const response = await api.post('/register', {
//                 name,
//                 email,
//                 password,
//                 role
//             });

//             setMessage(response.data.message);
//             navigate('/login');

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
//         <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
//             <form onSubmit={handleSubmit} className="bg-white text-gray-500 max-w-[400px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-lg shadow-[0px_0px_10px_0px] shadow-black/10">
//                 <h2 className="text-2xl font-bold mb-9 text-center text-gray-800">Sign Up</h2>
                
//                 <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
//                     <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M3.125 13.125a4.375 4.375 0 0 1 8.75 0M10 4.375a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                     <input className="w-full outline-none bg-transparent py-2.5" type="text"
//                         onChange={(e) => setName(e.target.value)}
//                         value={name}
//                         placeholder="Username" required />
//                 </div>
                
//                 <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
//                     <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="m2.5 4.375 3.875 2.906c.667.5 1.583.5 2.25 0L12.5 4.375" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
//                         <path d="M11.875 3.125h-8.75c-.69 0-1.25.56-1.25 1.25v6.25c0 .69.56 1.25 1.25 1.25h8.75c.69 0 1.25-.56 1.25-1.25v-6.25c0-.69-.56-1.25-1.25-1.25Z" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" />
//                     </svg>
//                     <input className="w-full outline-none bg-transparent py-2.5" type="email"
//                         onChange={(e) => setEmail(e.target.value)}
//                         value={email}
//                         placeholder="Email" required />
//                 </div>
                
//                 <div className="flex items-center mt-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
//                     <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M12.5 6.875h-10c-.69 0-1.25.56-1.25 1.25v3.75c0 .69.56 1.25 1.25 1.25h10c.69 0 1.25-.56 1.25-1.25V8.125c0-.69-.56-1.25-1.25-1.25zM5 3.125a2.5 2.5 0 0 1 5 0v3.75H5v-3.75z" stroke="#6B7280" strokeOpacity=".6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                     <input className="w-full outline-none bg-transparent py-2.5" type="password"
//                         onChange={(e) => setPassword(e.target.value)}
//                         value={password}
//                         placeholder="Password (min 8 characters)" required minLength={8} />
//                 </div>

//                 {/* Role Selection */}
//                 <div className="mt-4 mb-6">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Role (Optional)
//                     </label>
//                     <select
//                         value={role}
//                         onChange={(e) => setRole(e.target.value)}
//                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-700"
//                     >
//                         <option value="user">User</option>
//                         <option value="admin">Admin</option>
//                     </select>
//                     <p className="text-xs text-gray-500 mt-1">
//                         Note: Only administrators can create admin accounts
//                     </p>
//                 </div>
                
//                 <button type="submit" disabled={loading} className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600 transition-all active:scale-95 py-2.5 rounded text-white font-medium disabled:opacity-50">
//                     {loading ? "Submitting..." : "Create Account"}
//                 </button>

//                 {message && (
//                     <p className="text-red-500 text-center">{message}</p>
//                 )}

//                 <p className="text-center mt-4">Already have an account? <Link to="/login" className="text-blue-500 underline">Log In</Link></p>
//             </form>
//         </div>
//     );
// }

// pages/Register.jsx
import { Link, useNavigate } from "react-router-dom";
import api from "../axios";
import { useState } from "react";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("user");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await api.post('/register', {
                name,
                email,
                password,
                role
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
                    navigate('/login');
                    break;
                case 'revenue_manager':
                    navigate('/login');
                    break;
                case 'expenditure_manager':
                    navigate('/login');
                    break;
                default:
                    navigate('/login');
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                        <p className="text-gray-500 mt-2">Join the Revenue & Expenditure Management System</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Minimum 8 characters"
                                required
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                            >
                                <option value="user">User</option>
                                <option value="revenue_manager">Revenue Manager</option>
                                <option value="expenditure_manager">Expenditure Manager</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Select your role carefully. This determines your access permissions.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        {message && (
                            <div className={`text-center text-sm p-3 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {message}
                            </div>
                        )}

                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                Log In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}