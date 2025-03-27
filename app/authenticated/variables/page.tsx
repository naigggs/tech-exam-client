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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Variable {
  id: number;
  name: string;
  category: string;
  value: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VariablesPage() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVariable, setNewVariable] = useState({
    name: "",
    category: "Linear Feet",
    value: 0,
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchVariables();
  }, []);

  const fetchVariables = async () => {
    try {
      const response = await fetch(`${API_URL}/variables`);
      if (!response.ok) {
        throw new Error("Failed to fetch variables");
      }
      const data = await response.json();
      setVariables(data);
    } catch (error) {
      console.error("Error fetching variables:", error);
    }
  };

  const handleCreateVariable = async () => {
    try {
      const response = await fetch(`${API_URL}/variables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVariable),
      });

      if (!response.ok) {
        throw new Error("Failed to create variable");
      }

      await fetchVariables();
      setIsCreateModalOpen(false);
      setNewVariable({
        name: "",
        category: "Linear Feet",
        value: 0,
      });
    } catch (error) {
      console.error("Error creating variable:", error);
    }
  };

  const handleUpdateVariable = async (variable: Variable) => {
    try {
      const response = await fetch(`${API_URL}/variables/${variable.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variable),
      });

      if (!response.ok) {
        throw new Error("Failed to update variable");
      }

      await fetchVariables();
      setEditingVariable(null);
      setIsEditModalOpen(false); // Close the modal on success
    } catch (error) {
      console.error("Error updating variable:", error);
    }
  };

  const handleDeleteVariable = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/variables/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete variable');
      }

      await fetchVariables();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting variable:', error);
    }
  };

  const filteredVariables = variables.filter(
    (variable) =>
      variable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variable.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold tracking-tight">Variables</h1>
         
        </div>
        <div className="flex gap-4 w-[350px]">
          <Input
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
           <Button 
            variant="default" 
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9"
          >
            Add Variable
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVariables.map((variable) => (
            <TableRow key={variable.id}>
              <TableCell>{variable.name}</TableCell>
              <TableCell>{variable.category}</TableCell>
              <TableCell>{variable.value}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => {
                          setEditingVariable(variable);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Variable</DialogTitle>
                        <DialogDescription>
                          Make changes to the variable below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label>Name</label>
                          <Input
                            value={editingVariable?.name}
                            onChange={(e) =>
                              setEditingVariable((prev) =>
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
                          <label>Category</label>
                          <Select
                            value={editingVariable?.category}
                            onValueChange={(value) =>
                              setEditingVariable((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      category: value,
                                    }
                                  : null
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Linear Feet">
                                Linear Feet
                              </SelectItem>
                              <SelectItem value="Square Feet">
                                Square Feet
                              </SelectItem>
                              <SelectItem value="Cubic Feet">
                                Cubic Feet
                              </SelectItem>
                              <SelectItem value="Count">Count</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <label>Value</label>
                          <Input
                            type="number"
                            value={editingVariable?.value}
                            onChange={(e) =>
                              setEditingVariable((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      value: parseFloat(e.target.value),
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
                            setEditingVariable(null);
                            setIsEditModalOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() =>
                            editingVariable &&
                            handleUpdateVariable(editingVariable)
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
                    onClick={() => setDeleteId(variable.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Variable Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Variable</DialogTitle>
            <DialogDescription>
              Add a new variable to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>Name</label>
              <Input
                value={newVariable.name}
                onChange={(e) =>
                  setNewVariable((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter variable name"
              />
            </div>
            <div className="grid gap-2">
              <label>Category</label>
              <Select
                value={newVariable.category}
                onValueChange={(value) =>
                  setNewVariable((prev) => ({
                    ...prev,
                    category: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Linear Feet">Linear Feet</SelectItem>
                  <SelectItem value="Square Feet">Square Feet</SelectItem>
                  <SelectItem value="Cubic Feet">Cubic Feet</SelectItem>
                  <SelectItem value="Count">Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label>Value</label>
              <Input
                type="number"
                value={newVariable.value}
                onChange={(e) =>
                  setNewVariable((prev) => ({
                    ...prev,
                    value: parseFloat(e.target.value),
                  }))
                }
                placeholder="Enter value"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateVariable}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the variable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteVariable(deleteId)}
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
