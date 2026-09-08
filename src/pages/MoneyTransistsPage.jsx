import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MoneyTransists from "../components/MoneyTransistsPanel";

function MoneyTransistsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <MoneyTransists />
        </main>
      </div>
    </div>
  );
}

export default MoneyTransistsPage;