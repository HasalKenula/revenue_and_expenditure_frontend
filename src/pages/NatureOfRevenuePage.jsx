import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NatureOfRevenuePanel from "../components/NatureOfRevenuePanel";

function NatureOfRevenuePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <NatureOfRevenuePanel />
        </main>
      </div>
    </div>
  );
}

export default NatureOfRevenuePage;