'use client'

import React, { useEffect, useState } from "react";

type Proposal = {
  id: number;
  name: string;
  description: string;
  created_at: string;
};

export default function ProposalTable() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchProposals() {
      try {
        const response = await fetch(`${API_URL}/proposals`);
        if (!response.ok) {
          throw new Error("Failed to fetch proposals");
        }
        const data: Proposal[] = await response.json();
        setProposals(data);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      }
    }

    fetchProposals();
  }, []);

  return (
    <tbody className="divide-y divide-slate-700">
      {proposals.map((proposal) => (
        <tr
          key={proposal.id}
          className="hover:bg-slate-700/50 transition-colors"
        >
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
            {proposal.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {proposal.description}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {new Date(proposal.created_at).toLocaleDateString()}
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
