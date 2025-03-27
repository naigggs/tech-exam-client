'use client'

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useParams } from "next/navigation";

type Element = {
  id: number;
  name: string;
  material_cost: number;
  labor_cost: number;
};

type Category = {
  id: number;
  name: string;
  elements: Element[];
};

type Variable = {
  id: number;
  name: string;
  category: string;
  value: number;
};

type Template = {
  id: number;
  templateName: string;
  templateDescription: string;
  created_at: string;
  categories: Category[];
  variables: Variable[];
};

export default function TemplateDetailedPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const params = useParams(); // Use useParams to get the dynamic id
  const id = params.id; // Extract id from params

  useEffect(() => {
    if (!id) return; // Ensure id is available before fetching

    const fetchTemplateById = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/templates/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch template");
        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        console.error("Error fetching template:", error);
      }
    };

    fetchTemplateById();
  }, [id]);

  if (!template) return <p className="bg-slate-800">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-800 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{template.templateName}</CardTitle>
            <CardDescription className="text-slate-300">
              Created on {new Date(template.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-slate-300">{template.templateDescription}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Variables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.variables.map((variable) => (
                  <div key={variable.id} className="bg-slate-600 rounded-lg p-4">
                    <h4 className="font-medium text-white">{variable.name}</h4>
                    <p className="text-sm text-slate-300">Category: {variable.category}</p>
                    <p className="text-sm text-slate-300">Value: {variable.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-6">
                {template.categories.map((category) => (
                  <div key={category.id} className="bg-slate-600 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-3">{category.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.elements.map((element) => (
                        <div key={element.id} className="bg-slate-700 rounded-lg p-4">
                          <h5 className="font-medium text-white">{element.name}</h5>
                          <div className="text-sm text-slate-300 mt-2">
                            <p>Material Cost: ${element.material_cost.toFixed(2)}</p>
                            <p>Labor Cost: ${element.labor_cost.toFixed(2)}</p>
                            <p className="text-white font-medium mt-1">
                              Total: ${(element.material_cost + element.labor_cost).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
