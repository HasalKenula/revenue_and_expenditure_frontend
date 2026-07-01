// pages/Unauthorized.jsx
import { Link } from "react-router-dom";

export default function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    You do not have permission to access this page.
                </p>
                <div className="space-y-3">
                    <Link 
                        to="/" 
                        className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Home
                    </Link>
                    <button 
                        onClick={() => window.history.back()}
                        className="block w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}