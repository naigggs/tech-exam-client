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

type Template = {
  id: number;
  templateName: string;
  templateDescription: string;
  created_at: string;
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
          `${process.env.NEXT_PUBLIC_API_URL}/proposals/${id}`
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

  if (!template) return <p>Loading...</p>;

  return (
    <div className="bg-slate-800 text-white h-screen">
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{template.templateName}</CardTitle>
          <CardDescription>
            {new Date(template.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{template.templateDescription}</p>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
