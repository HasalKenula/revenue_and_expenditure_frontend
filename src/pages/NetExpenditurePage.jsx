// src/pages/NetExpenditurePage.jsx
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NetExpenditureReport from "../components/NetExpenditureReport";

function NetExpenditurePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <NetExpenditureReport />
        </main>
      </div>
    </div>
  );
}

export default NetExpenditurePage;