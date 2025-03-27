"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Element {
  id: number;
  name: string;
  material_cost: number;
  labor_cost: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ElementsPage() {
  const [elements, setElements] = useState<Element[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newElement, setNewElement] = useState({
    name: "",
    material_cost: 0,
    labor_cost: 0,
  });

  useEffect(() => {
    fetchElements();
  }, []);

  const fetchElements = async () => {
    try {
      const response = await fetch(`${API_URL}/proposal-elements`);
      if (!response.ok) {
        throw new Error("Failed to fetch elements");
      }
      const data = await response.json();
      setElements(data);
    } catch (error) {
      console.error("Error fetching elements:", error);
    }
  };

  const handleCreateElement = async () => {
    try {
      const response = await fetch(`${API_URL}/proposal-elements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newElement),
      });

      if (!response.ok) {
        throw new Error("Failed to create element");
      }

      await fetchElements();
      setIsCreateModalOpen(false);
      setNewElement({
        name: "",
        material_cost: 0,
        labor_cost: 0,
      });
    } catch (error) {
      console.error("Error creating element:", error);
    }
  };

  const handleUpdateElement = async (element: Element) => {
    try {
      const response = await fetch(`${API_URL}/proposal-elements/${element.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(element),
      });

      if (!response.ok) {
        throw new Error("Failed to update element");
      }

      await fetchElements();
      setEditingElement(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating element:", error);
    }
  };

  const handleDeleteElement = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/proposal-elements/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete element");
      }

      await fetchElements();
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting element:", error);
    }
  };

  const filteredElements = elements.filter((element) =>
    element.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold tracking-tight">Elements</h1>
        
        </div>
        <div className="flex gap-4 w-[350px]">
          <Input
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
            <Button 
            variant="default" 
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9"
          >
            Add Element
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Material Cost</TableHead>
            <TableHead>Labor Cost</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredElements.map((element) => (
            <TableRow key={element.id}>
              <TableCell>{element.name}</TableCell>
              <TableCell>${element.material_cost.toFixed(2)}</TableCell>
              <TableCell>${element.labor_cost.toFixed(2)}</TableCell>
              <TableCell>
                ${(element.material_cost + element.labor_cost).toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => {
                          setEditingElement(element);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Element</DialogTitle>
                        <DialogDescription>
                          Make changes to the element below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label>Name</label>
                          <Input
                            value={editingElement?.name}
                            onChange={(e) =>
                              setEditingElement((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      name: e.target.value,
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <label>Material Cost</label>
                          <Input
                            type="number"
                            value={editingElement?.material_cost}
                            onChange={(e) =>
                              setEditingElement((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      material_cost: parseFloat(e.target.value),
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <label>Labor Cost</label>
                          <Input
                            type="number"
                            value={editingElement?.labor_cost}
                            onChange={(e) =>
                              setEditingElement((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      labor_cost: parseFloat(e.target.value),
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingElement(null);
                            setIsEditModalOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() =>
                            editingElement && handleUpdateElement(editingElement)
                          }
                        >
                          Save changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => setDeleteId(element.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Element Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Element</DialogTitle>
            <DialogDescription>Add a new element to the system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>Name</label>
              <Input
                value={newElement.name}
                onChange={(e) =>
                  setNewElement((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter element name"
              />
            </div>
            <div className="grid gap-2">
              <label>Material Cost</label>
              <Input
                type="number"
                value={newElement.material_cost}
                onChange={(e) =>
                  setNewElement((prev) => ({
                    ...prev,
                    material_cost: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter material cost"
              />
            </div>
            <div className="grid gap-2">
              <label>Labor Cost</label>
              <Input
                type="number"
                value={newElement.labor_cost}
                onChange={(e) =>
                  setNewElement((prev) => ({
                    ...prev,
                    labor_cost: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter labor cost"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateElement}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              element.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteElement(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}