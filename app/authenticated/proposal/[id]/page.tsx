'use client'

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";

// Types based on the API schema
interface Element {
  id: number;
  name: string;
  material_cost: number;
  labor_cost: number;
}

interface Category {
  id: number;
  name: string;
  elements: Element[];
}

interface Variable {
  id: number;
  name: string;
  category: string;
  value: number;
}

interface Proposal {
  id: number;
  name: string;
  description: string;
  client_name: string;
  client_email: string;
  created_at: string;
  updated_at: string;
  proposal_categories: Category[];
  proposal_variables: Variable[];
}

export default function ProposalDetail() {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/proposals/${params.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch proposal");
        const data = await response.json();
        setProposal(data);
      } catch (error) {
        console.error("Error fetching proposal:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProposal();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Proposal Not Found</h2>
          <p className="text-muted-foreground">This proposal may have been deleted or doesn't exist.</p>
          <Button asChild variant="outline">
            <Link href="/authenticated/proposal">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Proposals
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totals = proposal.proposal_categories.reduce(
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
      {/* Header with back button */}
      <div className="max-w-5xl mx-auto mb-6">
        <Button
          variant="ghost"
          asChild
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href="/authenticated/proposal">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Link>
        </Button>

        {/* Proposal Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{proposal.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(proposal.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Updated {new Date(proposal.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Client Info & Totals Card */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="grid md:grid-cols-2 gap-8 p-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Client Information</h3>
              <p className="text-xl mb-1">{proposal.client_name}</p>
              <p className="text-muted-foreground">{proposal.client_email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Financial Summary</h3>
              <p className="text-3xl font-bold text-primary mb-2">
                ${grandTotal.toFixed(2)}
              </p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Materials: ${totals.materials.toFixed(2)}</span>
                <span>Labor: ${totals.labor.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description Card */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-card-foreground whitespace-pre-wrap">{proposal.description}</p>
          </CardContent>
        </Card>

        {/* Categories Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Categories & Elements</h2>
          {proposal.proposal_categories.map((category) => (
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
        {proposal.proposal_variables.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Variables</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {["Linear Feet", "Square Feet", "Cubic Feet", "Count"].map((category) => {
                    const variables = proposal.proposal_variables.filter(
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
                                {variable.value}
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
            Proposal ID: {proposal.id}
          </div>
          <div className="flex gap-4">
            <Button variant="outline">Download PDF</Button>
            <Button variant="default">
              <Link href={`/authenticated/editProposal/${proposal.id}`}>
                Edit Proposal
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
