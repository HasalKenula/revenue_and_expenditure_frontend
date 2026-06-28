import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CBGPanel from "../components/CBGPanel";

function CBGPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <CBGPanel />
        </main>
      </div>
    </div>
  );
}

export default CBGPage;