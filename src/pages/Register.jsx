// pages/Register.jsx
import { Link, useNavigate } from "react-router-dom";
import api from "../axios";
import { useState } from "react";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("user");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        // Check if passwords match
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            setLoading(false);
            return;
        }

        // Check password length
        if (password.length < 8) {
            setMessage("Password must be at least 8 characters long");
            setLoading(false);
            return;
        }

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
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Re-enter your password"
                                required
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">
                                    Passwords do not match
                                </p>
                            )}
                            {confirmPassword && password === confirmPassword && password.length >= 8 && (
                                <p className="text-xs text-green-500 mt-1">
                                    ✓ Passwords match
                                </p>
                            )}
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
                            <div className={`text-center text-sm p-3 rounded-lg ${message.includes('success') || message.includes('match') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
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