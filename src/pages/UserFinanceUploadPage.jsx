
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import UserFinanceUpload from "../components/UserFinanceUpload";


function UserFinanceUploadPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <UserFinanceUpload />
        </main>
      </div>
    </div>
  );
}

export default UserFinanceUploadPage;