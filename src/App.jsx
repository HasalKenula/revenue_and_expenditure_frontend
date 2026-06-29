import { useState } from 'react'
import { Link, BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import BudgetPage from "./pages/BudgetPage";
import Home from "./pages/Home";
import ImprestPage from './pages/ImprestPage';
import SupplementaryPage from './pages/SupplementaryPage';
import MonthlyFinancePage from './pages/MonthlyFinancePage';
import LoginPage from './pages/LoginPage';
import OpeningBalancePage from './pages/OpeningBalancePage';
import ImpressIssuePage from './pages/ImpressIssuePage';
import ImpressSettlementPage from './pages/ImpressSettlementPage';
import ProtectedRoute from "./components/ProtectedRoute"
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

// function App() {
//   const [count, setCount] = useState(0)
//   const [selectedDepartment, setSelectedDepartment] = useState(null);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/budget" element={<BudgetPage />} />
//         <Route path="/imprest" element={<ImprestPage />} />
//         <Route path="/supplementary" element={<SupplementaryPage />} />
//         <Route path="/monthly-finance" element={<MonthlyFinancePage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/opening-balance" element={<OpeningBalancePage />} />
//         <Route path="/impress-issue" element={<ImpressIssuePage />} />
//         <Route path="/impress-settlement" element={<ImpressSettlementPage />} />
//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App
// App.jsx

function Layout() {
  const location = useLocation();
  const showNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {showNavbar}



      <Routes>
        {/* public routes */}

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />

        {/* protected routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
        <Route path="/imprest" element={<ProtectedRoute><ImprestPage /></ProtectedRoute>} />
        <Route path="/supplementary" element={<ProtectedRoute><SupplementaryPage /></ProtectedRoute>} />
        <Route path="/monthly-finance" element={<ProtectedRoute><MonthlyFinancePage /></ProtectedRoute>} />
        <Route path="/opening-balance" element={<ProtectedRoute><OpeningBalancePage /></ProtectedRoute>} />
        <Route path="/impress-issue" element={<ProtectedRoute><ImpressIssuePage /></ProtectedRoute>} />
        <Route path="/impress-settlement" element={<ProtectedRoute><ImpressSettlementPage /></ProtectedRoute>} />
        <Route path="/net-expenditure" element={<ProtectedRoute><NetExpenditurePage /></ProtectedRoute>} />
        <Route path="/net-allocation" element={<ProtectedRoute><NetAllocationPage /></ProtectedRoute>} />
        <Route path="/wop" element={<ProtectedRoute><WOPPage /></ProtectedRoute>} />
        <Route path="/coeow" element={<ProtectedRoute><COEOWPage /></ProtectedRoute>} />
        <Route path="/coehw" element={<ProtectedRoute><COEHWPage /></ProtectedRoute>} />
        <Route path="/rc" element={<ProtectedRoute><RCExpenditurePage /></ProtectedRoute>} />
        <Route path="/odd" element={<ProtectedRoute><ODDPage /></ProtectedRoute>} />
        <Route path="/ods" element={<ProtectedRoute><ODSPage /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><JournalSummaryPage /></ProtectedRoute>} />
        <Route path="/main_journal" element={<ProtectedRoute><MainJournalPage /></ProtectedRoute>} />
        <Route path="/imprestBalance" element={<ProtectedRoute><ImprestBalancePage /></ProtectedRoute>} />
        <Route path="/allocation_balance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
        <Route path="/cbg" element={<ProtectedRoute><CBGPage /></ProtectedRoute>} />
        <Route path="/psd" element={<ProtectedRoute><PSDPage /></ProtectedRoute>} />


      </Routes>




    </>
  );

}

function App() {


  return (

    <Router>
      <Layout />
    </Router>



  )
}

export default App
