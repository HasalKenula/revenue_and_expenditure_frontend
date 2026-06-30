import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ImprestPanel from "../components/ImprestPanel";
import MaintenancePanel from "../components/MaintenancePanel";

function MaintenancePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <MaintenancePanel />
        </main>
      </div>
    </div>
  );
}

export default MaintenancePage;