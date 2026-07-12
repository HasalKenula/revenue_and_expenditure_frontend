// // components/RoleProtectedRoute.jsx
// import { Navigate } from "react-router-dom";

// export default function RoleProtectedRoute({ children, requiredRoles }) {
//     const token = localStorage.getItem("token");
//     const userRole = localStorage.getItem("userRole");

//     // Check if user is authenticated
//     if (!token) {
//         return <Navigate to='/login' replace />;
//     }

//     // If requiredRoles is not provided, allow access (just check authentication)
//     if (!requiredRoles) {
//         return children;
//     }

//     // Convert requiredRoles to array if it's a string
//     const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

//     // Check if user has any of the required roles
//     if (!roles.includes(userRole)) {
//         return <Navigate to='/unauthorized' replace />;
//     }

//     return children;
// }


// components/RoleProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, requiredRoles }) {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    // Check if user is authenticated
    if (!token) {
        return <Navigate to='/login' replace />;
    }

    // If requiredRoles is not provided, allow access (just check authentication)
    if (!requiredRoles) {
        return children;
    }

    // Convert requiredRoles to array if it's a string
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Check if user has any of the required roles
    if (!roles.includes(userRole)) {
        return <Navigate to='/unauthorized' replace />;
    }

    return children;
}