'use client'

import React, { useEffect, useState } from "react";

type Template = {
  id: number;
  templateName: string;
  templateDescription: string;
  created_at: string;
};

export default function TemplateTable() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch(`${API_URL}/templates`);
        if (!response.ok) {
          throw new Error("Failed to fetch Templates");
        }
        const data: Template[] = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching Templates:", error);
      }
    }

    fetchTemplates();
  }, []);

  return (
    <tbody className="divide-y divide-slate-700">
      {templates.map((template) => (
        <tr
          key={template.id}
          className="hover:bg-slate-700/50 transition-colors"
        >
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
            {template.templateName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {template.templateDescription}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
            {new Date(template.created_at).toLocaleDateString()}
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
