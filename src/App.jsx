// import { useState } from 'react'
// import { Link, BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
// import BudgetPage from "./pages/BudgetPage";
// import Home from "./pages/Home";
// import ImprestPage from './pages/ImprestPage';
// import SupplementaryPage from './pages/SupplementaryPage';
// import MonthlyFinancePage from './pages/MonthlyFinancePage';
// import LoginPage from './pages/LoginPage';
// import OpeningBalancePage from './pages/OpeningBalancePage';
// import ImpressIssuePage from './pages/ImpressIssuePage';
// import ImpressSettlementPage from './pages/ImpressSettlementPage';
// import ProtectedRoute from "./components/ProtectedRoute"
// import NetExpenditurePage from './pages/NetExpenditurePage';
// import NetAllocationPage from './pages/NetAllocationPage';
// import WOPPage from './pages/WOPPage';
// import COEOWPage from './pages/COEOWPage';
// import COEHWPage from './pages/COEHWPage';
// import RCExpenditurePage from './pages/RCExpenditurePage';
// import ODDPage from './pages/ODDPage';
// import ODSPage from './pages/ODSPage';
// import JournalSummaryPage from './pages/JournalSummaryPage';
// import Register from './pages/Register';
// import MainJournalPage from './pages/MainJournalPage';
// import ImprestBalancePage from './pages/ImprestBalancePage';
// import MaintenancePage from './pages/MaintenancePage';
// import CBGPage from './pages/CBGPage';
// import PSDPage from './pages/PSDPage';
// import ReportDashboardPage from './pages/ReportDashboardPage';
// import HeadUploadPage from './pages/HeadUploadPage';

// // function App() {
// //   const [count, setCount] = useState(0)
// //   const [selectedDepartment, setSelectedDepartment] = useState(null);

// //   return (
// //     <BrowserRouter>
// //       <Routes>
// //         <Route path="/" element={<Home />} />
// //         <Route path="/budget" element={<BudgetPage />} />
// //         <Route path="/imprest" element={<ImprestPage />} />
// //         <Route path="/supplementary" element={<SupplementaryPage />} />
// //         <Route path="/monthly-finance" element={<MonthlyFinancePage />} />
// //         <Route path="/login" element={<LoginPage />} />
// //         <Route path="/opening-balance" element={<OpeningBalancePage />} />
// //         <Route path="/impress-issue" element={<ImpressIssuePage />} />
// //         <Route path="/impress-settlement" element={<ImpressSettlementPage />} />
// //       </Routes>
// //     </BrowserRouter>
// //   )
// // }

// // export default App
// // App.jsx

// function Layout() {
//   const location = useLocation();
//   const showNavbar = ["/login", "/register"].includes(location.pathname);

//   return (
//     <>
//       {showNavbar}



//       <Routes>
//         {/* public routes */}

//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<Register />} />

//         {/* protected routes */}
//         <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
//         <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
//         <Route path="/imprest" element={<ProtectedRoute><ImprestPage /></ProtectedRoute>} />
//         <Route path="/supplementary" element={<ProtectedRoute><SupplementaryPage /></ProtectedRoute>} />
//         <Route path="/monthly-finance" element={<ProtectedRoute><MonthlyFinancePage /></ProtectedRoute>} />
//         <Route path="/opening-balance" element={<ProtectedRoute><OpeningBalancePage /></ProtectedRoute>} />
//         <Route path="/impress-issue" element={<ProtectedRoute><ImpressIssuePage /></ProtectedRoute>} />
//         <Route path="/impress-settlement" element={<ProtectedRoute><ImpressSettlementPage /></ProtectedRoute>} />
//         <Route path="/net-expenditure" element={<ProtectedRoute><NetExpenditurePage /></ProtectedRoute>} />
//         <Route path="/net-allocation" element={<ProtectedRoute><NetAllocationPage /></ProtectedRoute>} />
//         <Route path="/wop" element={<ProtectedRoute><WOPPage /></ProtectedRoute>} />
//         <Route path="/coeow" element={<ProtectedRoute><COEOWPage /></ProtectedRoute>} />
//         <Route path="/coehw" element={<ProtectedRoute><COEHWPage /></ProtectedRoute>} />
//         <Route path="/rc" element={<ProtectedRoute><RCExpenditurePage /></ProtectedRoute>} />
//         <Route path="/odd" element={<ProtectedRoute><ODDPage /></ProtectedRoute>} />
//         <Route path="/ods" element={<ProtectedRoute><ODSPage /></ProtectedRoute>} />
//         <Route path="/journal" element={<ProtectedRoute><JournalSummaryPage /></ProtectedRoute>} />
//         <Route path="/main_journal" element={<ProtectedRoute><MainJournalPage /></ProtectedRoute>} />
//         <Route path="/imprestBalance" element={<ProtectedRoute><ImprestBalancePage /></ProtectedRoute>} />
//         <Route path="/allocation_balance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
//         <Route path="/cbg" element={<ProtectedRoute><CBGPage /></ProtectedRoute>} />
//         <Route path="/psd" element={<ProtectedRoute><PSDPage /></ProtectedRoute>} />
//         <Route path="/reports" element={<ProtectedRoute><ReportDashboardPage /></ProtectedRoute>} />
//          <Route path="/head" element={<ProtectedRoute><HeadUploadPage /></ProtectedRoute>} />


//       </Routes>




//     </>
//   );

// }

// function App() {


//   return (

//     <Router>
//       <Layout />
//     </Router>



//   )
// }

// export default App





// App.jsx - Cleaner Version
// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
// import BudgetPage from "./pages/BudgetPage";
// import Home from "./pages/Home";
// import ImprestPage from './pages/ImprestPage';
// import SupplementaryPage from './pages/SupplementaryPage';
// import MonthlyFinancePage from './pages/MonthlyFinancePage';
// import LoginPage from './pages/LoginPage';
// import OpeningBalancePage from './pages/OpeningBalancePage';
// import ImpressIssuePage from './pages/ImpressIssuePage';
// import ImpressSettlementPage from './pages/ImpressSettlementPage';
// import ProtectedRoute from "./components/ProtectedRoute";
// import RoleProtectedRoute from "./components/RoleProtectedRoute";
// import Unauthorized from "./pages/Unauthorized";
// import NetExpenditurePage from './pages/NetExpenditurePage';
// import NetAllocationPage from './pages/NetAllocationPage';
// import WOPPage from './pages/WOPPage';
// import COEOWPage from './pages/COEOWPage';
// import COEHWPage from './pages/COEHWPage';
// import RCExpenditurePage from './pages/RCExpenditurePage';
// import ODDPage from './pages/ODDPage';
// import ODSPage from './pages/ODSPage';
// import JournalSummaryPage from './pages/JournalSummaryPage';
// import Register from './pages/Register';
// import MainJournalPage from './pages/MainJournalPage';
// import ImprestBalancePage from './pages/ImprestBalancePage';
// import MaintenancePage from './pages/MaintenancePage';
// import CBGPage from './pages/CBGPage';
// import PSDPage from './pages/PSDPage';
// import ReportDashboardPage from './pages/ReportDashboardPage';
// import HeadUploadPage from './pages/HeadUploadPage';


// // Admin only routes
// const adminRoutes = [
//   { path: "/", element: <Home /> },
//   { path: "/budget", element: <BudgetPage /> },
//   { path: "/imprest", element: <ImprestPage /> },
//   { path: "/supplementary", element: <SupplementaryPage /> },
//   { path: "/monthly-finance", element: <MonthlyFinancePage /> },
//   { path: "/opening-balance", element: <OpeningBalancePage /> },
//   { path: "/impress-issue", element: <ImpressIssuePage /> },
//   { path: "/impress-settlement", element: <ImpressSettlementPage /> },
//   { path: "/net-expenditure", element: <NetExpenditurePage /> },
//   { path: "/net-allocation", element: <NetAllocationPage /> },
//   { path: "/wop", element: <WOPPage /> },
//   { path: "/coeow", element: <COEOWPage /> },
//   { path: "/coehw", element: <COEHWPage /> },
//   { path: "/rc", element: <RCExpenditurePage /> },
//   { path: "/odd", element: <ODDPage /> },
//   { path: "/ods", element: <ODSPage /> },
//   { path: "/journal", element: <JournalSummaryPage /> },
//   { path: "/main_journal", element: <MainJournalPage /> },
//   { path: "/imprestBalance", element: <ImprestBalancePage /> },
//   { path: "/allocation_balance", element: <MaintenancePage /> },
//   { path: "/cbg", element: <CBGPage /> },
//   { path: "/psd", element: <PSDPage /> },
//   { path: "/reports", element: <ReportDashboardPage /> },
// ];

// // User only routes
// const userRoutes = [
//   { path: "/head", element: <HeadUploadPage /> },
// ];

// function Layout() {
//   const location = useLocation();
//   const showNavbar = ["/login", "/register", "/unauthorized"].includes(location.pathname);

//   return (
//     <>
//       {!showNavbar}

//       <Routes>
//         {/* Public routes */}
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/unauthorized" element={<Unauthorized />} />

//         {/* Admin only routes */}
//         {adminRoutes.map((route) => (
//           <Route 
//             key={route.path} 
//             path={route.path} 
//             element={
//               <RoleProtectedRoute requiredRoles="admin">
//                 {route.element}
//               </RoleProtectedRoute>
//             } 
//           />
//         ))}

//         {/* User only routes */}
//         {userRoutes.map((route) => (
//           <Route 
//             key={route.path} 
//             path={route.path} 
//             element={
//               <RoleProtectedRoute requiredRoles="user">
//                 {route.element}
//               </RoleProtectedRoute>
//             } 
//           />
//         ))}
//       </Routes>
//     </>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <Layout />
//     </Router>
//   );
// }

// export default App;





// // App.jsx
// import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
// import BudgetPage from "./pages/BudgetPage";
// import Home from "./pages/Home";
// import ImprestPage from './pages/ImprestPage';
// import SupplementaryPage from './pages/SupplementaryPage';
// import MonthlyFinancePage from './pages/MonthlyFinancePage';
// import LoginPage from './pages/LoginPage';
// import OpeningBalancePage from './pages/OpeningBalancePage';
// import ImpressIssuePage from './pages/ImpressIssuePage';
// import ImpressSettlementPage from './pages/ImpressSettlementPage';
// import ProtectedRoute from "./components/ProtectedRoute";
// import RoleProtectedRoute from "./components/RoleProtectedRoute";
// import Unauthorized from "./pages/Unauthorized";
// import NetExpenditurePage from './pages/NetExpenditurePage';
// import NetAllocationPage from './pages/NetAllocationPage';
// import WOPPage from './pages/WOPPage';
// import COEOWPage from './pages/COEOWPage';
// import COEHWPage from './pages/COEHWPage';
// import RCExpenditurePage from './pages/RCExpenditurePage';
// import ODDPage from './pages/ODDPage';
// import ODSPage from './pages/ODSPage';
// import JournalSummaryPage from './pages/JournalSummaryPage';
// import Register from './pages/Register';
// import MainJournalPage from './pages/MainJournalPage';
// import ImprestBalancePage from './pages/ImprestBalancePage';
// import MaintenancePage from './pages/MaintenancePage';
// import CBGPage from './pages/CBGPage';
// import PSDPage from './pages/PSDPage';
// import ReportDashboardPage from './pages/ReportDashboardPage';
// import HeadUploadPage from './pages/HeadUploadPage';
// import UpkeepPage from "./pages/UpkeepPage";
// import HeadInfoPage from "./pages/HeadInfoPage";
// import ItemCodePage from "./pages/ItemCodePage";
// import EstimatePage from "./pages/EstimatePage";
// import TreasuryPage from "./pages/TreasuryPage";
// import NetRevenuePage from "./pages/NetRevenuePage";


// // Component to handle role-based redirect for home page
// function HomeRedirect() {
//     const userRole = localStorage.getItem('userRole');

//     if (userRole === 'user') {
//         return <Navigate to="/head" replace />;
//     }

//     // For admin or any other role, show home page
//     return <Home />;
// }

// function Layout() {
//     const location = useLocation();
//     const showNavbar = ["/login", "/register", "/unauthorized"].includes(location.pathname);

//     return (
//         <>
//             {!showNavbar }

//             <Routes>
//                 {/* Public routes */}
//                 <Route path="/login" element={<LoginPage />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/unauthorized" element={<Unauthorized />} />

//                 {/* Admin only routes */}
//                 <Route 
//                     path="/" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <Home />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/budget" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <BudgetPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/imprest" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <ImprestPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/supplementary" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <SupplementaryPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/monthly-finance" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <MonthlyFinancePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/opening-balance" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <OpeningBalancePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/impress-issue" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <ImpressIssuePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/impress-settlement" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <ImpressSettlementPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/net-expenditure" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <NetExpenditurePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/net-allocation" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <NetAllocationPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/wop" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <WOPPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/coeow" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <COEOWPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/coehw" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <COEHWPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/rc" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <RCExpenditurePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/odd" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <ODDPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/ods" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <ODSPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/journal" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <JournalSummaryPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/main_journal" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <MainJournalPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/imprestBalance" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <ImprestBalancePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/allocation_balance" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <MaintenancePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/cbg" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <CBGPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/psd" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <PSDPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/reports" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <ReportDashboardPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                  <Route 
//                     path="/upkeep" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <UpkeepPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />

//                 <Route 
//                     path="/headinfo" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <HeadInfoPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />

//                 <Route 
//                     path="/itemcode" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <ItemCodePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/estimate" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <EstimatePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//                 <Route 
//                     path="/treasury" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <TreasuryPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />

//                   <Route 
//                     path="/net_revenue" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="admin">
//                             <NetRevenuePage />
//                         </RoleProtectedRoute>
//                     } 
//                 />

//                 {/* User only route - Only users with 'user' role can access */}
//                 <Route 
//                     path="/head" 
//                     element={
//                         <RoleProtectedRoute requiredRoles="user">
//                             <HeadUploadPage />
//                         </RoleProtectedRoute>
//                     } 
//                 />
//             </Routes>
//         </>
//     );
// }

// function App() {
//     return (
//         <Router>
//             <Layout />
//         </Router>
//     );
// }

// export default App;




// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import BudgetPage from "./pages/BudgetPage";
import Home from "./pages/Home";
import ImprestPage from './pages/ImprestPage';
import SupplementaryPage from './pages/SupplementaryPage';
import MonthlyFinancePage from './pages/MonthlyFinancePage';
import LoginPage from './pages/LoginPage';
import OpeningBalancePage from './pages/OpeningBalancePage';
import ImpressIssuePage from './pages/ImpressIssuePage';
import ImpressSettlementPage from './pages/ImpressSettlementPage';
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import NetExpenditurePage from './pages/NetExpenditurePage';
import NetAllocationPage from './pages/NetAllocationPage';
import WOPPage from './pages/WOPPage';
import COEOWPage from './pages/COEOWPage';
import COEHWPage from './pages/COEHWPage';
import RCExpenditurePage from './pages/RCExpenditurePage';
import ODDPage from './pages/ODDPage';
import ODSPage from './pages/ODSPage';
import JournalSummaryPage from './pages/JournalSummaryPage';
import Register from './pages/Register';
import MainJournalPage from './pages/MainJournalPage';
import ImprestBalancePage from './pages/ImprestBalancePage';
import MaintenancePage from './pages/MaintenancePage';
import CBGPage from './pages/CBGPage';
import PSDPage from './pages/PSDPage';
import ReportDashboardPage from './pages/ReportDashboardPage';
import HeadUploadPage from './pages/HeadUploadPage';
import UpkeepPage from "./pages/UpkeepPage";
import HeadInfoPage from "./pages/HeadInfoPage";
import ItemCodePage from "./pages/ItemCodePage";
import EstimatePage from "./pages/EstimatePage";
import TreasuryPage from "./pages/TreasuryPage";
import NetRevenuePage from "./pages/NetRevenuePage";
import UserProfile from "./pages/UserProfile";
import QuarterRevenuePage from "./pages/QuarterRevenuePage";
import RevenueMonthlyPage from "./pages/RevenueMonthlyPage";
import MonthlySummaryPage from "./pages/MonthlySummaryPage";
import TaxRevenuePage from "./pages/TaxRevenuePage";
import NonTaxRevenuePage from "./pages/NonTaxRevenuePage";
import RevenueCollectionAccountPage from "./pages/RevenueCollectionAccountPage";
import RevenueCrossEntryAccountPage from "./pages/RevenueCrossEntryAccountPage";
import RevenueRefundAccountPage from "./pages/RevenueRefundAccountPage";
import RevenueCrossEntryByTrnoPage from "./pages/RevenueCrossEntryByTrnoPage";
import RevenueRefundByTrnoPage from "./pages/RevenueRefundByTrnoPage";
import RevenueReportsPage from "./pages/RevenueReportsPage";
import { Toaster } from "react-hot-toast";
import StampDutyMonthlyPage from "./pages/StampDutyMonthlyPage";
import StampDutySummaryPage from "./pages/StampDutySummaryPage";
import LocalGovTransferMonthlyPage from "./pages/LocalGovTransferMonthlyPage";


// Component to handle role-based redirect for home page
function HomeRedirect() {
    const userRole = localStorage.getItem('userRole');

    if (userRole === 'user') {
        return <Navigate to="/head" replace />;
    } else if (userRole === 'revenue_manager') {
        return <Navigate to="/" replace />;
    } else if (userRole === 'expenditure_manager') {
        return <Navigate to="/" replace />;
    }

    // Default fallback
    return <Navigate to="/" replace />;
}

function Layout() {
    const location = useLocation();
    const showNavbar = ["/login", "/register", "/unauthorized"].includes(location.pathname);

    return (
        <>
            {!showNavbar}

            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/redirect" element={<HomeRedirect />} />

                {/* ==================== USER ONLY ROUTES ==================== */}
                <Route
                    path="/head"
                    element={
                        <RoleProtectedRoute requiredRoles="user">
                            <HeadUploadPage />
                        </RoleProtectedRoute>
                    }
                />


                <Route
                    path="/budget"
                    element={
                        <RoleProtectedRoute requiredRoles="expenditure_manager">
                            <BudgetPage />
                        </RoleProtectedRoute>
                    }
                />


                {/* ==================== EXPENDITURE MANAGER ONLY ROUTES ==================== */}
                <Route
                    path="/imprest"
                    element={
                        <RoleProtectedRoute requiredRoles="expenditure_manager">
                            <ImprestPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/impress-issue"
                    element={
                        <RoleProtectedRoute requiredRoles="expenditure_manager">
                            <ImpressIssuePage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/impress-settlement"
                    element={
                        <RoleProtectedRoute requiredRoles="expenditure_manager">
                            <ImpressSettlementPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/imprestBalance"
                    element={
                        <RoleProtectedRoute requiredRoles="expenditure_manager">
                            <ImprestBalancePage />
                        </RoleProtectedRoute>
                    }
                />


                <Route
                    path="/"
                    element={
                        <RoleProtectedRoute requiredRoles={['revenue_manager', 'expenditure_manager']}>
                            <Home />
                        </RoleProtectedRoute>
                    }
                />

               // Add this route
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <UserProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/supplementary"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <SupplementaryPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/monthly-finance"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <MonthlyFinancePage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/opening-balance"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <OpeningBalancePage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/net-expenditure"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <NetExpenditurePage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/net-allocation"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <NetAllocationPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/wop"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <WOPPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/coeow"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <COEOWPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/coehw"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <COEHWPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/rc"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <RCExpenditurePage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/odd"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <ODDPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/ods"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <ODSPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/journal"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <JournalSummaryPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/main_journal"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <MainJournalPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/allocation_balance"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <MaintenancePage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/cbg"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <CBGPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/psd"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <PSDPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <ReportDashboardPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/upkeep"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <UpkeepPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/stamp-month"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <StampDutyMonthlyPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/stamp-summary"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <StampDutySummaryPage />
                        </RoleProtectedRoute>
                    }
                />

                
                <Route
                    path="/transfer-monthly"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <LocalGovTransferMonthlyPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/headinfo"
                    element={
                        <RoleProtectedRoute requiredRoles={"revenue_manager"}>
                            <HeadInfoPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/itemcode"
                    element={
                        <RoleProtectedRoute requiredRoles={"revenue_manager"}>
                            <ItemCodePage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/estimate"
                    element={
                        <RoleProtectedRoute requiredRoles={"revenue_manager"}>
                            <EstimatePage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/treasury"
                    element={
                        <RoleProtectedRoute requiredRoles={"revenue_manager"}>
                            <TreasuryPage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/net_revenue"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <NetRevenuePage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/quarter_revenue"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <QuarterRevenuePage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/monthly_revenue"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueMonthlyPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/monthly_summery_revenue"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <MonthlySummaryPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/tax_revenue"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <TaxRevenuePage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/non_tax_revenue"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <NonTaxRevenuePage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/revenue_collection"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueCollectionAccountPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/revenue_crossEntry"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueCrossEntryAccountPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/revenue_refundAccount"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueRefundAccountPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/revenue_crossByHead"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueCrossEntryByTrnoPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/revenue_refundByHead"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueRefundByTrnoPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/revenue_reports"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueReportsPage />
                        </RoleProtectedRoute>
                    }
                />

            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <Layout />
        </Router>
    );
}

export default App;