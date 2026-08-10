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
import LocalGovTransferSummaryPage from "./pages/LocalGovTransferSummaryPage";
import UserFinanceUploadPage from "./pages/UserFinanceUploadPage";
import ExpenditureManagerApprovalPage from "./pages/ExpenditureManagerApprovalPage";
import AccountNumbersPage from "./pages/AccountNumbersPage";
import RevenueAccountDataPage from "./pages/RevenueAccountDataPage";
import RevenueCollectionAccountNumberPage from "./pages/RevenueCollectionAccountNumberPage";
import RevenueReceiptsInCashPage from "./pages/RevenueReceiptsInCashPage";
import RevenueReceiptsInCashSummaryPage from "./pages/RevenueReceiptsInCashSummaryPage";
import RevenueReceiptsPage from "./pages/RevenueReceiptsPage";



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
                    path="/user_upload"
                    element={
                        <RoleProtectedRoute requiredRoles="user">
                            <UserFinanceUploadPage />
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

                <Route
                    path="/approve"
                    element={
                        <RoleProtectedRoute requiredRoles="expenditure_manager">
                            <ExpenditureManagerApprovalPage />
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
                    path="/transfer-summary"
                    element={
                        <RoleProtectedRoute requiredRoles={"expenditure_manager"}>
                            <LocalGovTransferSummaryPage />
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

                <Route
                    path="/account"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <AccountNumbersPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/acccount-data"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueAccountDataPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/revenue-collection-account-number"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueCollectionAccountNumberPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/revenue-receipts-in-cash"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueReceiptsInCashPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/revenue-receipts-in-cash-summary"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueReceiptsInCashSummaryPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/receipts-data"
                    element={
                        <RoleProtectedRoute requiredRoles="revenue_manager">
                            <RevenueReceiptsPage />
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