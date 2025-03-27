"use client";
import React, { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import ProposalTable from "@/components/authenticated/ProposalTable";
import ContractTable from "@/components/authenticated/ContractTable";
import TemplateTable from "@/components/authenticated/TemplateTable";

type TabType = "proposals" | "contracts" | "templates";

export default function Authenticated() {
  const [activeTab, setActiveTab] = useState<TabType>("proposals");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderTable = () => {
    switch (activeTab) {
      case "proposals":
        return <ProposalTable />;
      case "contracts":
        return <ContractTable />;
      case "templates":
        return <TemplateTable />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-800">
      <main
        className={`flex-1 p-8 transition-all duration-300
      `}
      >
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-wide text-white">
            Greetings, Admin
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-12">
              <button
                onClick={() => setActiveTab("proposals")}
                className={`py-3 text-sm tracking-wider uppercase transition-colors ${
                  activeTab === "proposals"
                    ? "border-b-2 border-yellow-400 text-yellow-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Proposals
              </button>
              <button
                onClick={() => setActiveTab("contracts")}
                className={`py-3 text-sm tracking-wider uppercase transition-colors ${
                  activeTab === "contracts"
                    ? "border-b-2 border-yellow-400 text-yellow-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Contracts
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`py-3 text-sm tracking-wider uppercase transition-colors ${
                  activeTab === "templates"
                    ? "border-b-2 border-yellow-400 text-yellow-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Templates
              </button>
            </nav>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-8">
          <button
            className="px-8 py-2 text-sm uppercase tracking-wider text-slate-800 
                           bg-yellow-400 rounded-sm transition-colors
                           hover:bg-yellow-300"
          >
            Create New {activeTab.slice(0, -1)}
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-normal text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-normal text-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-normal text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-normal text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            {renderTable()}
          </table>
        </div>
      </main>
    </div>
  );
}
