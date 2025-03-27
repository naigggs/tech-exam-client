'use client'

import React, { useEffect, useState } from "react";

type Contract = {
  id: number;
  name: string;
  status?: string;
  created_at: string;
};

export default function ContractTable() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchContracts() {
      try {
        const response = await fetch(`${API_URL}/contracts`);
        if (!response.ok) {
          throw new Error("Failed to fetch contracts");
        }
        const data: Contract[] = await response.json();
        setContracts(data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    }

    fetchContracts();
  }, []);

  return (
    <tbody className="divide-y divide-slate-700">
      {contracts.map((contract) => (
        <tr
          key={contract.id}
          className="hover:bg-slate-700/50 transition-colors"
        >
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
            {contract.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {contract.status || "Pending"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {new Date(contract.created_at).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Edit
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
