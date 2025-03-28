"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  X,
  Eye,
  FileText,
  Plus,
  Trash2,
  ChevronsUpDown,
  Check,
  PlusCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

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

interface CustomCategory {
  id?: number;
  name: string;
  elements: {
    id?: number;
    name: string;
    material_cost: number;
    labor_cost: number;
  }[];
}

interface Variable {
  id: number;
  name: string;
  description?: string;
  category: string;
  default_value?: string;
  required: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/proposal-categories`);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

const fetchVariables = async () => {
  try {
    const response = await fetch(`${API_URL}/variables`);
    if (!response.ok) {
      throw new Error("Failed to fetch variables");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching variables:", error);
    return [];
  }
};

const variableTypes = ["Linear Feet", "Square Feet", "Cubic Feet", "Count"];

export default function CreateTemplate() {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [existingVariables, setExistingVariables] = useState<Variable[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
    []
  );
  const [newCategory, setNewCategory] = useState("");
  const [newElement, setNewElement] = useState({
    name: "",
    material_cost: 0,
    labor_cost: 0,
  });
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [editedElements, setEditedElements] = useState<
    Record<number, Record<number, Element>>
  >({});

  // Variables state - updated to match old code structure
  const [selectedLinearFeetVariables, setSelectedLinearFeetVariables] =
    useState<Variable[]>([]);
  const [selectedSquareFeetVariables, setSelectedSquareFeetVariables] =
    useState<Variable[]>([]);
  const [selectedCubicFeetVariables, setSelectedCubicFeetVariables] = useState<
    Variable[]
  >([]);
  const [selectedCountVariables, setSelectedCountVariables] = useState<
    Variable[]
  >([]);
  const [customVariables, setCustomVariables] = useState<
    Omit<Variable, "id">[]
  >([]);
  const [newVariable, setNewVariable] = useState({
    name: "",
    type: "Linear Feet",
    description: "",
    default_value: "",
    required: true,
  });
  const [openLinearFeetCombobox, setOpenLinearFeetCombobox] = useState(false);
  const [openSquareFeetCombobox, setOpenSquareFeetCombobox] = useState(false);
  const [openCubicFeetCombobox, setOpenCubicFeetCombobox] = useState(false);
  const [openCountCombobox, setOpenCountCombobox] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const categoriesData = await fetchCategories();
      const variablesData = await fetchVariables();
      setExistingCategories(categoriesData);
      setExistingVariables(variablesData);
    };

    loadData();
  }, []);

  // Categories handlers (unchanged)
  const handleSelectCategory = (category: Category) => {
    if (!selectedCategories.some((c) => c.id === category.id)) {
      setSelectedCategories([...selectedCategories, category]);
      handleCategorySelect(category);
    }
    setOpenCategoryCombobox(false);
  };

  const handleRemoveSelectedCategory = (id: number) => {
    setSelectedCategories(selectedCategories.filter((c) => c.id !== id));
  };

  const handleCostChange = (
    categoryId: number,
    elementId: number,
    field: "material_cost" | "labor_cost",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setEditedElements((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [elementId]: {
          ...prev[categoryId]?.[elementId],
          [field]: numValue,
        },
      },
    }));
  };

  const handleCategorySelect = (category: Category) => {
    if (!editedElements[category.id]) {
      setEditedElements((prev) => ({
        ...prev,
        [category.id]: category.elements.reduce(
          (acc, element) => ({
            ...acc,
            [element.id]: element,
          }),
          {}
        ),
      }));
    }
  };

  const handleAddCustomCategory = () => {
    if (newCategory.trim()) {
      setCustomCategories([
        ...customCategories,
        { name: newCategory, elements: [] },
      ]);
      setNewCategory("");
    }
  };

  const handleAddElementToCustomCategory = (categoryIndex: number) => {
    if (newElement.name.trim()) {
      const updatedCategories = [...customCategories];
      updatedCategories[categoryIndex].elements.push({
        name: newElement.name,
        material_cost: newElement.material_cost,
        labor_cost: newElement.labor_cost,
      });
      setCustomCategories(updatedCategories);
      setNewElement({ name: "", material_cost: 0, labor_cost: 0 });
    }
  };

  const handleRemoveElementFromCustomCategory = (
    categoryIndex: number,
    elementIndex: number
  ) => {
    const updatedCategories = [...customCategories];
    updatedCategories[categoryIndex].elements.splice(elementIndex, 1);
    setCustomCategories(updatedCategories);
  };

  // Updated variables handlers to match old code
  const handleSelectVariable = (variable: Variable) => {
    switch (variable.category) {
      case "Linear Feet":
        if (!selectedLinearFeetVariables.some((v) => v.id === variable.id)) {
          setSelectedLinearFeetVariables([
            ...selectedLinearFeetVariables,
            variable,
          ]);
        }
        setOpenLinearFeetCombobox(false);
        break;
      case "Square Feet":
        if (!selectedSquareFeetVariables.some((v) => v.id === variable.id)) {
          setSelectedSquareFeetVariables([
            ...selectedSquareFeetVariables,
            variable,
          ]);
        }
        setOpenSquareFeetCombobox(false);
        break;
      case "Cubic Feet":
        if (!selectedCubicFeetVariables.some((v) => v.id === variable.id)) {
          setSelectedCubicFeetVariables([
            ...selectedCubicFeetVariables,
            variable,
          ]);
        }
        setOpenCubicFeetCombobox(false);
        break;
      case "Count":
        if (!selectedCountVariables.some((v) => v.id === variable.id)) {
          setSelectedCountVariables([...selectedCountVariables, variable]);
        }
        setOpenCountCombobox(false);
        break;
    }
  };

  const handleRemoveSelectedVariable = (id: number, type: string) => {
    switch (type) {
      case "Linear Feet":
        setSelectedLinearFeetVariables(
          selectedLinearFeetVariables.filter((v) => v.id !== id)
        );
        break;
      case "Square Feet":
        setSelectedSquareFeetVariables(
          selectedSquareFeetVariables.filter((v) => v.id !== id)
        );
        break;
      case "Cubic Feet":
        setSelectedCubicFeetVariables(
          selectedCubicFeetVariables.filter((v) => v.id !== id)
        );
        break;
      case "Count":
        setSelectedCountVariables(
          selectedCountVariables.filter((v) => v.id !== id)
        );
        break;
    }
  };

  const handleAddCustomVariable = () => {
    if (newVariable.name.trim()) {
      setCustomVariables([
        ...customVariables,
        {
          name: newVariable.name,
          category: newVariable.type,
          description: newVariable.description,
          default_value: newVariable.default_value,
          required: newVariable.required,
        },
      ]);
      // Only reset the name, keep other values
      setNewVariable((prev) => ({
        ...prev,
        name: "",
      }));
    }
  };

  const handleRemoveCustomVariable = (index: number) => {
    const newCustomVariables = [...customVariables];
    newCustomVariables.splice(index, 1);
    setCustomVariables(newCustomVariables);
  };

  const getAllSelectedVariables = () => {
    return [
      ...selectedLinearFeetVariables,
      ...selectedSquareFeetVariables,
      ...selectedCubicFeetVariables,
      ...selectedCountVariables,
      ...customVariables.map((v, i) => ({ ...v, id: -i - 1 })), // Temporary negative IDs for custom variables
    ];
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!templateName.trim()) {
      toast.error("Validation Error", {
        description: "Template name is required",
        duration: 4000,
      });
      return;
    }

    if (!templateDescription.trim()) {
      toast.error("Validation Error", {
        description: "Template description is required",
        duration: 4000,
      });
      return;
    }

    if (selectedCategories.length === 0 && customCategories.length === 0) {
      toast.error("Validation Error", {
        description: "At least one category is required",
        duration: 4000,
      });
      return;
    }

    // Validate that custom categories have at least one element
    const emptyCustomCategory = customCategories.find(cat => cat.elements.length === 0);
    if (emptyCustomCategory) {
      toast.error("Validation Error", {
        description: `Category "${emptyCustomCategory.name}" has no elements`,
        duration: 4000,
      });
      return;
    }

    // Validate that at least one variable is selected or custom variable is added
    const totalVariables = [
      ...selectedLinearFeetVariables,
      ...selectedSquareFeetVariables,
      ...selectedCubicFeetVariables,
      ...selectedCountVariables,
      ...customVariables
    ].length;

    if (totalVariables === 0) {
      toast.error("Validation Error", {
        description: "At least one variable is required",
        duration: 4000,
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateName: templateName,
          templateDescription: templateDescription,
          categories: selectedCategories.map((cat) => cat.id),
          new_categories: customCategories.map((cat) => ({
            name: cat.name,
            elements: cat.elements.map((element) => ({
              name: element.name,
              material_cost: element.material_cost,
              labor_cost: element.labor_cost,
            })),
          })),
          // Only include IDs of existing variables
          variables: [
            ...selectedLinearFeetVariables,
            ...selectedSquareFeetVariables,
            ...selectedCubicFeetVariables,
            ...selectedCountVariables,
          ].map((variable) => variable.id),
          // Only include custom variables
          new_variables: customVariables.map((varData) => ({
            name: varData.name,
            category: varData.category,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      const data = await response.json();
      console.log("Template saved successfully:", data);

      toast.success("Template created successfully!", {
        description: `Your template "${templateName}" has been saved.`,
        duration: 4000,
      });

      // Redirect to the templates list page
      window.location.href = "/authenticated/template";
    } catch (error) {
      console.error("Error saving template:", error);

      toast.error("Failed to create template", {
        description:
          "Please try again or contact support if the issue persists.",
        duration: 5000,
      });
    }
  };

  // Helper function to render variable combobox
  const renderVariableCombobox = (
    category: string,
    openState: boolean,
    setOpenState: React.Dispatch<React.SetStateAction<boolean>>,
    selectedVariables: Variable[]
  ) => {
    const filteredVariables = existingVariables.filter(
      (v) =>
        v.category === category &&
        !selectedLinearFeetVariables.some((sv) => sv.id === v.id) &&
        !selectedSquareFeetVariables.some((sv) => sv.id === v.id) &&
        !selectedCubicFeetVariables.some((sv) => sv.id === v.id) &&
        !selectedCountVariables.some((sv) => sv.id === v.id)
    );

    return (
      <div className="mb-4">
        <h4 className="font-medium mb-2">{category}</h4>
        <Popover open={openState} onOpenChange={setOpenState}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openState}
              className="w-full justify-between"
            >
              Select a {category.toLowerCase()} variable
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder={`Search ${category.toLowerCase()} variables...`}
              />
              <CommandList>
                <CommandEmpty>
                  No {category.toLowerCase()} variables found.
                </CommandEmpty>
                <CommandGroup>
                  {filteredVariables.map((variable) => (
                    <CommandItem
                      key={variable.id}
                      value={variable.name}
                      onSelect={() => handleSelectVariable(variable)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedVariables.some((v) => v.id === variable.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span>{variable.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Display selected variables as badges */}
        {selectedVariables.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedVariables.map((variable) => (
              <Badge
                key={variable.id}
                variant="secondary"
                className="py-1 px-3"
              >
                {variable.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2 hover:bg-muted rounded-full"
                  onClick={() =>
                    handleRemoveSelectedVariable(variable.id, variable.category)
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 p-6 lg:p-8 bg-muted/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Template</h1>
          <p className="text-muted-foreground mt-1">
            Design a reusable document template
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <X className="mr-0 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-0 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Last saved: 5 minutes ago
            </div>
          </div>
        </div>

        <TabsContent value="editor" className="space-y-6">
          {/* Editor content remains unchanged */}
          <div className="grid gap-6">
            <div className="md:col-span-3 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Template Details</CardTitle>
                  <CardDescription>
                    Basic information about your template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="template-name"
                      className="text-sm font-medium"
                    >
                      Template Name
                    </label>
                    <Input
                      id="template-name"
                      placeholder="Enter template name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="template-desc"
                      className="text-sm font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      id="template-desc"
                      placeholder="Enter a brief description"
                      rows={3}
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Categories content remains unchanged */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Template Categories</CardTitle>
              <CardDescription>
                Define categories used in this template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Popover
                    open={openCategoryCombobox}
                    onOpenChange={setOpenCategoryCombobox}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        Select a category
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search categories..." />
                        <CommandList>
                          <CommandEmpty>No categories found.</CommandEmpty>
                          <CommandGroup>
                            {existingCategories
                              .filter(
                                (cat) =>
                                  !selectedCategories.some(
                                    (sc) => sc.id === cat.id
                                  )
                              )
                              .map((category) => (
                                <CommandItem
                                  key={category.id}
                                  value={category.name}
                                  onSelect={() =>
                                    handleSelectCategory(category)
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedCategories.some(
                                        (c) => c.id === category.id
                                      )
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {category.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="New Category Name"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddCustomCategory}
                      disabled={!newCategory.trim()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Custom
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Selected Categories */}
              {selectedCategories.length > 0 && (
                <div className="space-y-4">
                  {selectedCategories.map((category) => (
                    <div
                      key={category.id}
                      className="border rounded-md p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">{category.name}</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRemoveSelectedCategory(category.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="rounded-md border">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="p-2 text-left">Element Name</th>
                              <th className="p-2 text-left">Material Cost</th>
                              <th className="p-2 text-left">Labor Cost</th>
                              <th className="p-2 text-left">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.elements.map((element) => {
                              const editedElement =
                                editedElements[category.id]?.[element.id] ||
                                element;
                              const total =
                                editedElement.material_cost +
                                editedElement.labor_cost;
                              return (
                                <tr key={element.id} className="border-b">
                                  <td className="p-2">{element.name}</td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={editedElement.material_cost}
                                      onChange={(e) =>
                                        handleCostChange(
                                          category.id,
                                          element.id,
                                          "material_cost",
                                          e.target.value
                                        )
                                      }
                                      className="w-32"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={editedElement.labor_cost}
                                      onChange={(e) =>
                                        handleCostChange(
                                          category.id,
                                          element.id,
                                          "labor_cost",
                                          e.target.value
                                        )
                                      }
                                      className="w-32"
                                    />
                                  </td>
                                  <td className="p-2">${total.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Categories */}
              <div className="space-y-4">
                {customCategories.length > 0 && (
                  <div className="space-y-6">
                    {customCategories.map((category, categoryIndex) => (
                      <div
                        key={categoryIndex}
                        className="border rounded-md p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">
                            {category.name}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newCustomCategories = [...customCategories];
                              newCustomCategories.splice(categoryIndex, 1);
                              setCustomCategories(newCustomCategories);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex gap-2 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1">Enter the name of the element</Label>
                            <Input
                              placeholder="Element Name"
                              value={newElement.name}
                              onChange={(e) =>
                                setNewElement({
                                  ...newElement,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1">Cost of materials</Label>
                            <Input
                              type="number"
                              placeholder="Material Cost"
                              value={newElement.material_cost}
                              onChange={(e) =>
                                setNewElement({
                                  ...newElement,
                                  material_cost: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1">Cost of labor</Label>
                            <Input
                              type="number"
                              placeholder="Labor Cost"
                              value={newElement.labor_cost}
                              onChange={(e) =>
                                setNewElement({
                                  ...newElement,
                                  labor_cost: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <Button
                            onClick={() =>
                              handleAddElementToCustomCategory(categoryIndex)
                            }
                            disabled={!newElement.name.trim()}
                            className="mt-5"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Element
                          </Button>
                        </div>

                        {category.elements.length > 0 && (
                          <div className="rounded-md border">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="p-2 text-left">
                                    Element Name
                                  </th>
                                  <th className="p-2 text-left">
                                    Material Cost
                                  </th>
                                  <th className="p-2 text-left">Labor Cost</th>
                                  <th className="p-2 text-left">Total</th>
                                  <th className="p-2 text-left">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {category.elements.map(
                                  (element, elementIndex) => {
                                    const total =
                                      element.material_cost +
                                      element.labor_cost;
                                    return (
                                      <tr
                                        key={elementIndex}
                                        className="border-b"
                                      >
                                        <td className="p-2">{element.name}</td>
                                        <td className="p-2">
                                          ${element.material_cost.toFixed(2)}
                                        </td>
                                        <td className="p-2">
                                          ${element.labor_cost.toFixed(2)}
                                        </td>
                                        <td className="p-2">
                                          ${total.toFixed(2)}
                                        </td>
                                        <td className="p-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleRemoveElementFromCustomCategory(
                                                categoryIndex,
                                                elementIndex
                                              )
                                            }
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </td>
                                      </tr>
                                    );
                                  }
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>
                Define variables used in this template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Linear Feet Variables */}
                {renderVariableCombobox(
                  "Linear Feet",
                  openLinearFeetCombobox,
                  setOpenLinearFeetCombobox,
                  selectedLinearFeetVariables
                )}

                {/* Square Feet Variables */}
                {renderVariableCombobox(
                  "Square Feet",
                  openSquareFeetCombobox,
                  setOpenSquareFeetCombobox,
                  selectedSquareFeetVariables
                )}

                {/* Cubic Feet Variables */}
                {renderVariableCombobox(
                  "Cubic Feet",
                  openCubicFeetCombobox,
                  setOpenCubicFeetCombobox,
                  selectedCubicFeetVariables
                )}

                {/* Count Variables */}
                {renderVariableCombobox(
                  "Count",
                  openCountCombobox,
                  setOpenCountCombobox,
                  selectedCountVariables
                )}
              </div>

              <Separator />

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">
                  Add Custom Variables
                </h3>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newVariable.name}
                    onChange={(e) =>
                      setNewVariable({
                        ...newVariable,
                        name: e.target.value,
                      })
                    }
                    placeholder="New Variable Name"
                    className="flex-1"
                  />
                  <Select
                    value={newVariable.type}
                    onValueChange={(value) =>
                      setNewVariable({ ...newVariable, type: value })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {variableTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddCustomVariable}
                    disabled={!newVariable.name.trim()}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {/* Display custom added variables */}
                {customVariables.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {customVariables.map((variable, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="py-1.5 px-3 flex items-center"
                      >
                        <span>{variable.name}</span>
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded ml-2">
                          {variable.category}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2 hover:bg-muted rounded-full"
                          onClick={() => handleRemoveCustomVariable(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-1">Template Preview</CardTitle>
                  <CardDescription>
                    Summary of your template with all details
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Full Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Template Details Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Template Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Template Name
                      </p>
                      <p className="font-medium">
                        {templateName || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>
                      <p className="font-medium">
                        {templateDescription || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Categories Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Categories</h3>

                  {selectedCategories.length === 0 &&
                  customCategories.length === 0 ? (
                    <p className="text-muted-foreground">No categories added</p>
                  ) : (
                    <div className="space-y-6">
                      {/* Existing Categories */}
                      {selectedCategories.map((category) => (
                        <div
                          key={category.id}
                          className="border rounded-md p-4"
                        >
                          <h4 className="font-medium mb-3">{category.name}</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="p-2 text-left">Element</th>
                                  <th className="p-2 text-right">
                                    Material Cost
                                  </th>
                                  <th className="p-2 text-right">Labor Cost</th>
                                  <th className="p-2 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {category.elements.map((element) => {
                                  const editedElement =
                                    editedElements[category.id]?.[element.id] ||
                                    element;
                                  const total =
                                    editedElement.material_cost +
                                    editedElement.labor_cost;
                                  return (
                                    <tr key={element.id} className="border-b">
                                      <td className="p-2">{element.name}</td>
                                      <td className="p-2 text-right">
                                        $
                                        {editedElement.material_cost.toFixed(2)}
                                      </td>
                                      <td className="p-2 text-right">
                                        ${editedElement.labor_cost.toFixed(2)}
                                      </td>
                                      <td className="p-2 text-right">
                                        ${total.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}

                      {/* Custom Categories */}
                      {customCategories.map((category, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <h4 className="font-medium mb-3">{category.name}</h4>
                          {category.elements.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b bg-muted/50">
                                    <th className="p-2 text-left">Element</th>
                                    <th className="p-2 text-right">
                                      Material Cost
                                    </th>
                                    <th className="p-2 text-right">
                                      Labor Cost
                                    </th>
                                    <th className="p-2 text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {category.elements.map(
                                    (element, elementIndex) => {
                                      const total =
                                        element.material_cost +
                                        element.labor_cost;
                                      return (
                                        <tr
                                          key={elementIndex}
                                          className="border-b"
                                        >
                                          <td className="p-2">{element.name}</td>
                                          <td className="p-2 text-right">
                                            ${element.material_cost.toFixed(2)}
                                          </td>
                                          <td className="p-2 text-right">
                                            ${element.labor_cost.toFixed(2)}
                                          </td>
                                          <td className="p-2 text-right">
                                            ${total.toFixed(2)}
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No elements added
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Variables Preview */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Variables</h3>

                  {selectedLinearFeetVariables.length === 0 &&
                  selectedSquareFeetVariables.length === 0 &&
                  selectedCubicFeetVariables.length === 0 &&
                  selectedCountVariables.length === 0 &&
                  customVariables.length === 0 ? (
                    <p className="text-muted-foreground">No variables added</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Linear Feet Variables */}
                      {selectedLinearFeetVariables.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Linear Feet</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedLinearFeetVariables.map((variable) => (
                              <Badge key={variable.id} variant="secondary">
                                {variable.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Square Feet Variables */}
                      {selectedSquareFeetVariables.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Square Feet</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedSquareFeetVariables.map((variable) => (
                              <Badge key={variable.id} variant="secondary">
                                {variable.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cubic Feet Variables */}
                      {selectedCubicFeetVariables.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Cubic Feet</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCubicFeetVariables.map((variable) => (
                              <Badge key={variable.id} variant="secondary">
                                {variable.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Count Variables */}
                      {selectedCountVariables.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Count</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCountVariables.map((variable) => (
                              <Badge key={variable.id} variant="secondary">
                                {variable.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Variables */}
                      {customVariables.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-medium mb-2">Custom Variables</h4>
                          <div className="flex flex-wrap gap-2">
                            {customVariables.map((variable, index) => (
                              <Badge key={index} variant="outline">
                                {variable.name}
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded ml-2">
                                  {variable.category}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
