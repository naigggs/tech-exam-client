'use client'

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { FileText, Calendar, ChevronLeft } from "lucide-react";
import Link from "next/link";

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
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    if (!id) return;

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
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateById();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading template details...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Template Not Found</h2>
          <p className="text-muted-foreground">This template may have been deleted or doesn't exist.</p>
          <Button asChild variant="outline">
            <Link href="/authenticated/template">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate totals for all elements across categories
  const totals = template.categories.reduce(
    (acc, category) => {
      const categoryTotals = category.elements.reduce(
        (elemAcc, element) => ({
          materials: elemAcc.materials + Number(element.material_cost),
          labor: elemAcc.labor + Number(element.labor_cost),
        }),
        { materials: 0, labor: 0 }
      );
      return {
        materials: acc.materials + categoryTotals.materials,
        labor: acc.labor + categoryTotals.labor,
      };
    },
    { materials: 0, labor: 0 }
  );

  const grandTotal = totals.materials + totals.labor;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto mb-6">
        {/* Back button */}
        <Button
          variant="ghost"
          asChild
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href="/authenticated/template">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>

        {/* Template Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{template.templateName}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Created {new Date(template.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Description Card */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle>Template Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-card-foreground whitespace-pre-wrap">{template.templateDescription}</p>
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Financial Overview</h3>
            <p className="text-3xl font-bold text-primary mb-2">
              ${grandTotal.toFixed(2)}
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Total Materials: ${totals.materials.toFixed(2)}</span>
              <span>Total Labor: ${totals.labor.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Categories Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Categories & Elements</h2>
          {template.categories.map((category) => (
            <Card key={category.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.elements.length} elements
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground">Element</th>
                        <th className="text-right py-3 px-4 text-muted-foreground">Material Cost</th>
                        <th className="text-right py-3 px-4 text-muted-foreground">Labor Cost</th>
                        <th className="text-right py-3 px-4 text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.elements.map((element) => {
                        const elementTotal = Number(element.material_cost) + Number(element.labor_cost);
                        return (
                          <tr
                            key={element.id}
                            className="border-b border-border/50 hover:bg-accent/20"
                          >
                            <td className="py-3 px-4">{element.name}</td>
                            <td className="py-3 px-4 text-right">
                              ${Number(element.material_cost).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              ${Number(element.labor_cost).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              ${elementTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-accent/10 font-medium">
                        <td className="py-3 px-4">Category Total</td>
                        <td className="py-3 px-4 text-right">
                          ${category.elements
                            .reduce((sum, el) => sum + Number(el.material_cost), 0)
                            .toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          ${category.elements
                            .reduce((sum, el) => sum + Number(el.labor_cost), 0)
                            .toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          ${category.elements
                            .reduce(
                              (sum, el) =>
                                sum + Number(el.material_cost) + Number(el.labor_cost),
                              0
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Variables Section */}
        {template.variables.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Variables</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {["Linear Feet", "Square Feet", "Cubic Feet", "Count"].map((category) => {
                    const variables = template.variables.filter(
                      (v) => v.category === category
                    );
                    if (variables.length === 0) return null;

                    return (
                      <div key={category}>
                        <h3 className="font-medium text-card-foreground mb-3">{category}</h3>
                        <div className="space-y-2">
                          {variables.map((variable) => (
                            <div
                              key={variable.id}
                              className="flex justify-between items-center p-3 rounded-md bg-accent/10"
                            >
                              <span className="text-card-foreground">{variable.name}</span>
                              <Badge
                                variant="secondary"
                                className="bg-primary/20 text-primary-foreground"
                              >
                                {variable.value || 0}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Template ID: {template.id}
          </div>
          <div className="flex gap-4">
            <Button variant="outline">Download PDF</Button>
            <Button variant="default">
              <Link href={`/authenticated/editTemplate/${template.id}`}>
                Edit Template
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
