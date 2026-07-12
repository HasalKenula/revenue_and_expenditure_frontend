import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import RevenueCrossEntryAccountPanel from "../components/RevenueCrossEntryAccountPanel";


function RevenueCrossEntryAccountPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <RevenueCrossEntryAccountPanel />
        </main>
      </div>
    </div>
  );
}

export default RevenueCrossEntryAccountPage;