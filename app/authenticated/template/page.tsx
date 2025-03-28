'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, FileText, MoreHorizontal, Copy, Pencil, Trash2, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/templates/${id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) throw new Error('Failed to delete template');
      // Remove the deleted template from state
      setTemplates(templates.filter(template => template.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/templates`
        );
        if (!response.ok) throw new Error("Failed to fetch templates");
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <main className="flex-1 p-6 lg:p-8 bg-muted/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-1">Manage and create document templates</p>
        </div>
        <Button asChild>
          <Link href="/authenticated/createTemplate">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Template
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
            {templates.map((template) => (
              <Card key={template.id} className="shadow-sm overflow-hidden rounded-sm">
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
                        <Link href={`/authenticated/editTemplate/${template.id}`}>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(template.id)}
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
                      <CardTitle className="text-lg">{template.templateName}</CardTitle>
                      <CardDescription className="line-clamp-1">{template.templateDescription}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="">
                  <div className="flex items-center justify-between mb-3">
                    {/* <Badge>Active</Badge> */}
                    <div className="flex gap-1">
                      {template.categories.map((category, index) => (
                      <Badge key={category.id} variant="outline">
                        {category.name}
                      </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    {/* <Badge>Active</Badge> */}
                    <div className="flex gap-1">
                      {template.variables.map((variable, index) => (
                      <Badge key={variable.id} variant="outline">
                        {variable.name}
                      </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {/* <Calendar className="h-3.5 w-3.5" /> */}
                      {/* <span>{template.updatedAt}</span> */}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* <Clock className="h-3.5 w-3.5" /> */}
                      {/* <span>{template.variables} variables</span> */}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {/* <AvatarImage src={template.avatar} alt={template.author} /> */}
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Admin Account</span>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/authenticated/template/${template.id}`}>View</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/authenticated/createProposal">Use Template</Link>
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
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="grid grid-cols-8 items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{template.templateName}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{template.templateDescription}</div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Badge>Active</Badge>
                    </div>
                    <div className="col-span-1">
                      {/* <Badge variant="outline">{template.category}</Badge> */}
                    </div>
                    {/* <div className="col-span-1 text-sm">{template.variables}</div> */}
                    {/* <div className="col-span-1 text-sm text-muted-foreground">{template.updatedAt}</div> */}
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/create-proposal">
                              <FileText className="mr-2 h-4 w-4" />
                              Use Template
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(template.id)}
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
  )
}

