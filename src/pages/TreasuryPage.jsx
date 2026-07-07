import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TreasuryPanel from "../components/TreasuryPanel";

function TreasuryPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <TreasuryPanel />
        </main>
      </div>
    </div>
  );
}

export default TreasuryPage;