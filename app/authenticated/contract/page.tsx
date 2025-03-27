"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  FileText,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProposalVariable {
  id: number;
  name: string;
  category: string;
  value: number;
}

interface ProposalElement {
  id: number;
  name: string;
  material_cost: number;
  labor_cost: number;
}

interface ProposalCategory {
  id: number;
  name: string;
  elements: ProposalElement[];
}

interface Proposal {
  id: number;
  template: string | null;
  name: string;
  description: string;
  proposal_categories: ProposalCategory[];
  proposal_variables: ProposalVariable[];
  client_name: string;
  client_email: string;
  created_at: string;
  updated_at: string;
}

interface Contract {
  id: number;
  proposal: Proposal;
  contractor_name: string;
  terms_and_conditions: string;
  client_signature: string;
  client_initials: string;
  contractor_signature: string;
  contractor_initials: string;
  created_at: string;
  client_signed_at: string;
  contractor_signed_at: string;
}

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contracts/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete proposal");
      // Remove the deleted proposal from state
      setContracts(contracts.filter((contract) => contract.id !== id));
    } catch (error) {
      console.error("Error deleting contract:", error);
    }
  };

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/contracts`
        );
        if (!response.ok) throw new Error("Failed to fetch contracts");
        const data = await response.json();
        console.log(data);
        setContracts(data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };

    fetchContracts();
  }, []);

  return (
    <main className="flex-1 p-6 lg:p-8 bg-muted/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track client contracts
          </p>
        </div>
        <Button asChild>
          <Link href="/authenticated/createContract">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Contract
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date
          </Button>
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" />
            Author
          </Button>
          <Button variant="outline" size="sm">
            Status
          </Button>
        </div>
      </div>

      <Tabs defaultValue="grid" className="mb-6">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {contracts.map((contract) => (
              <Card
                key={contract.id}
                className="shadow-sm overflow-hidden rounded-sm"
              >
                <CardHeader className="relative">
                  <div className="absolute right-4 top-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link
                          href={`/authenticated/editContract/${contract.id}`}
                        >
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(contract.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {contract.proposal.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {contract.proposal.client_name} |{" "}
                        {contract.proposal.client_email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="">
                  <div className="flex items-center justify-between mb-3">
                    {/* <Badge>Draft</Badge> */}
                    <div className="flex gap-1">
                      {contract.proposal.description}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    {/* <Badge>Active</Badge> */}
                    <div className="flex gap-1">
                      {/* {contract.contract_variables.map((variable, index) => (
                        <Badge key={variable.id} variant="outline">
                          {variable.name}
                        </Badge>
                      ))} */}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {/* <Calendar className="h-3.5 w-3.5" /> */}
                      {/* <span>{contract.updatedAt}</span> */}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* <Clock className="h-3.5 w-3.5" />
                      <span>{contract.created_at}</span> */}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {/* <AvatarImage src={proposal.avatar} alt={proposal.author} /> */}
                      <AvatarFallback>
                        {contract.contractor_initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {contract.contractor_name}
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/authenticated/contract/${contract.id}`}>
                      View
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="grid grid-cols-8 items-center gap-4 p-4 font-medium border-b">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Category</div>
                  <div className="col-span-1">Variables</div>
                  <div className="col-span-1">Updated</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="grid grid-cols-8 items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        {/* <div className="font-medium">{contract.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{contract.description}</div> */}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Badge>Active</Badge>
                    </div>
                    <div className="col-span-1">
                      {/* <Badge variant="outline">{contract.category}</Badge> */}
                    </div>
                    {/* <div className="col-span-1 text-sm">{contract.variables}</div> */}
                    {/* <div className="col-span-1 text-sm text-muted-foreground">{contract.updatedAt}</div> */}
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link
                              href={`/authenticated/editcontract/${contract.id}`}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/create-contract">
                              <FileText className="mr-2 h-4 w-4" />
                              Use proposal
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(contract.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
