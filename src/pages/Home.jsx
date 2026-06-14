import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Home Page
          </h1>

          <p className="mt-4 text-gray-600">
            Welcome to the Finance Management System Dashboard.
          </p>
        </main>
      </div>
    </div>
  );
}

export default Home;