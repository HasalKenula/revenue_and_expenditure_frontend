
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NetRevenuePanel from "../components/NetRevenuePanel";

function NetRevenuePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <NetRevenuePanel />
        </main>
      </div>
    </div>
  );
}

export default NetRevenuePage;