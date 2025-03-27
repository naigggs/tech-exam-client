'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown, PlusCircle, X, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface Element {
  id?: number;
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
  elements: Element[];
}

interface Variable {
  id: number;
  name: string;
  category: string;
}

interface Template {
  id: number;
  templateName: string;
  templateDescription: string;
  categories?: Category[];
  variables?: Variable[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/proposal-categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const fetchVariables = async () => {
  try {
    const response = await fetch(`${API_URL}/variables`);
    if (!response.ok) {
      throw new Error('Failed to fetch variables');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching variables:', error);
    return [];
  }
};

const fetchProposal = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/proposals/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch proposal');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return null;
  }
};

const variableTypes = ["Linear Feet", "Square Feet", "Cubic Feet", "Count"];

export default function EditProposal({ params }: { params: { id: string } }) {
  const [proposalName, setProposalName] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  
  // For new items
  const [newCategory, setNewCategory] = useState("");
  const [newVariable, setNewVariable] = useState({
    name: "",
    category: "Linear Feet",
  });

  // For existing items
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [existingVariables, setExistingVariables] = useState<Variable[]>([]);

  // For selected items
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // For selected variables by type
  const [selectedLinearFeetVariables, setSelectedLinearFeetVariables] = useState<Variable[]>([]);
  const [selectedSquareFeetVariables, setSelectedSquareFeetVariables] = useState<Variable[]>([]);
  const [selectedCubicFeetVariables, setSelectedCubicFeetVariables] = useState<Variable[]>([]);
  const [selectedCountVariables, setSelectedCountVariables] = useState<Variable[]>([]);

  // For custom added items
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [customVariables, setCustomVariables] = useState<Variable[]>([]);
  const [newElement, setNewElement] = useState({
    name: "",
    material_cost: 0,
    labor_cost: 0,
  });

  // For variable values
  const [variableValues, setVariableValues] = useState<Record<number, number>>({});

  // For combobox open state
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [openLinearFeetCombobox, setOpenLinearFeetCombobox] = useState(false);
  const [openSquareFeetCombobox, setOpenSquareFeetCombobox] = useState(false);
  const [openCubicFeetCombobox, setOpenCubicFeetCombobox] = useState(false);
  const [openCountCombobox, setOpenCountCombobox] = useState(false);

  // For templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // State for editing elements
  const [editedElements, setEditedElements] = useState<Record<string, Record<string, Element>>>({});

  useEffect(() => {
    // Fetch existing categories and variables
    const loadData = async () => {
      const categoriesData = await fetchCategories();
      const variablesData = await fetchVariables();
      setExistingCategories(categoriesData);
      setExistingVariables(variablesData);
    };

    loadData();
  }, []);

  // Load templates when component mounts
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(`${API_URL}/templates`);
        if (!response.ok) throw new Error("Failed to fetch templates");
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  // Handle template selection
  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) return;
    try {
      const response = await fetch(`${API_URL}/templates/${templateId}`);
      if (!response.ok) throw new Error("Failed to fetch template details");
      const template = await response.json();
      
      setSelectedCategories(template.categories || []);
      
      // Set up edited elements with template data
      const newEditedElements: Record<string, Record<string, Element>> = {};
      template.categories?.forEach((category: Category) => {
        newEditedElements[category.id.toString()] = category.elements.reduce((acc: Record<string, Element>, element: Element) => ({
          ...acc,
          ...(element.id !== undefined ? { [element.id.toString()]: element } : {})
        }), {});
      });
      setEditedElements(newEditedElements);

      // Handle variables
      const linearFeet = template.variables?.filter((v: Variable) => v.category === "Linear Feet") || [];
      const squareFeet = template.variables?.filter((v: Variable) => v.category === "Square Feet") || [];
      const cubicFeet = template.variables?.filter((v: Variable) => v.category === "Cubic Feet") || [];
      const count = template.variables?.filter((v: Variable) => v.category === "Count") || [];

      setSelectedLinearFeetVariables(linearFeet);
      setSelectedSquareFeetVariables(squareFeet);
      setSelectedCubicFeetVariables(cubicFeet);
      setSelectedCountVariables(count);

      // Initialize variable values
      const initialValues: Record<number, number> = {};
      template.variables?.forEach((variable: Variable) => {
        initialValues[variable.id] = 0;
      });
      setVariableValues(initialValues);

    } catch (error) {
      console.error("Error loading template:", error);
    }
  };

  const handleAddCustomCategory = () => {
    if (newCategory.trim()) {
      setCustomCategories([...customCategories, { name: newCategory, elements: [] }]);
      setNewCategory("");
    }
  };

  const handleRemoveCustomCategory = (index: number) => {
    const newCustomCategories = [...customCategories];
    newCustomCategories.splice(index, 1);
    setCustomCategories(newCustomCategories);
  };

  const handleAddCustomVariable = () => {
    if (newVariable.name.trim()) {
      const customId = -1 * (customVariables.length + 1);
      setCustomVariables([...customVariables, { ...newVariable, id: customId }]);
      setVariableValues(prev => ({ ...prev, [customId]: 0 }));
      setNewVariable({ name: "", category: "Linear Feet" });
    }
  };

  const handleRemoveCustomVariable = (index: number) => {
    const newCustomVariables = [...customVariables];
    const removedVariable = newCustomVariables.splice(index, 1)[0];
    setCustomVariables(newCustomVariables);
    
    // Remove the value from variableValues
    setVariableValues(prev => {
      const newValues = { ...prev };
      delete newValues[removedVariable.id];
      return newValues;
    });
  };

  const handleCategorySelect = (category: Category) => {
    if (!editedElements[category.id.toString()]) {
      setEditedElements(prev => ({
        ...prev,
        [category.id.toString()]: category.elements.reduce((acc, element) => ({
          ...acc,
          ...(element.id !== undefined ? { [element.id.toString()]: element } : {})
        }), {} as Record<string, Element>)
      }));
    }
  };

  const handleCostChange = (categoryId: number, elementId: number | undefined, field: 'material_cost' | 'labor_cost', value: string) => {
    if (elementId === undefined) return;
    const numValue = parseFloat(value) || 0;
    setEditedElements(prev => ({
      ...prev,
      [categoryId.toString()]: {
        ...prev[categoryId.toString()],
        [elementId.toString()]: {
          ...prev[categoryId.toString()]?.[elementId.toString()],
          [field]: numValue
        }
      }
    }));
  };

  const handleVariableValueChange = (variableId: number, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variableId]: parseFloat(value) || 0
    }));
  };

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

  const handleSelectVariable = (variable: Variable) => {
    switch (variable.category) {
      case "Linear Feet":
        if (!selectedLinearFeetVariables.some((v) => v.id === variable.id)) {
          setSelectedLinearFeetVariables([
            ...selectedLinearFeetVariables,
            variable,
          ]);
          setVariableValues(prev => ({ ...prev, [variable.id]: 0 }));
        }
        setOpenLinearFeetCombobox(false);
        break;
      case "Square Feet":
        if (!selectedSquareFeetVariables.some((v) => v.id === variable.id)) {
          setSelectedSquareFeetVariables([
            ...selectedSquareFeetVariables,
            variable,
          ]);
          setVariableValues(prev => ({ ...prev, [variable.id]: 0 }));
        }
        setOpenSquareFeetCombobox(false);
        break;
      case "Cubic Feet":
        if (!selectedCubicFeetVariables.some((v) => v.id === variable.id)) {
          setSelectedCubicFeetVariables([
            ...selectedCubicFeetVariables,
            variable,
          ]);
          setVariableValues(prev => ({ ...prev, [variable.id]: 0 }));
        }
        setOpenCubicFeetCombobox(false);
        break;
      case "Count":
        if (!selectedCountVariables.some((v) => v.id === variable.id)) {
          setSelectedCountVariables([...selectedCountVariables, variable]);
          setVariableValues(prev => ({ ...prev, [variable.id]: 0 }));
        }
        setOpenCountCombobox(false);
        break;
    }
  };

  const handleRemoveSelectedVariable = (id: number, category: string) => {
    switch (category) {
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
    
    // Remove the value from variableValues
    setVariableValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  const getAllSelectedVariables = () => {
    return [
      ...selectedLinearFeetVariables,
      ...selectedSquareFeetVariables,
      ...selectedCubicFeetVariables,
      ...selectedCountVariables,
      ...customVariables,
    ];
  };

  useEffect(() => {
    const loadProposal = async () => {
      const proposalData = await fetchProposal(params.id);
      if (proposalData) {
        // Update form fields with fetched data
        setProposalName(proposalData.name || "");
        setProposalDescription(proposalData.description || "");
        setClientName(proposalData.client_name || "");
        setClientEmail(proposalData.client_email || "");

        // Handle categories
        const proposalCategories = proposalData.proposal_categories || [];
        const existing = proposalCategories.filter((cat: any) => cat.id);
        const custom = proposalCategories.filter((cat: any) => !cat.id);

        setSelectedCategories(existing);
        setCustomCategories(custom);

        // Initialize edited elements with the fetched data
        const newEditedElements: Record<string, Record<string, Element>> = {};
        existing.forEach((category: Category) => {
          newEditedElements[category.id.toString()] = category.elements.reduce((acc, element) => ({
            ...acc,
            ...(element.id !== undefined ? { [element.id.toString()]: element } : {})
          }), {});
        });
        setEditedElements(newEditedElements);

        // Handle variables
        const proposalVariables = proposalData.proposal_variables || [];
        
        // Sort variables by category
        const linearFeet = proposalVariables.filter((v: any) => v.category === "Linear Feet");
        const squareFeet = proposalVariables.filter((v: any) => v.category === "Square Feet");
        const cubicFeet = proposalVariables.filter((v: any) => v.category === "Cubic Feet");
        const count = proposalVariables.filter((v: any) => v.category === "Count");
        
        setSelectedLinearFeetVariables(linearFeet);
        setSelectedSquareFeetVariables(squareFeet);
        setSelectedCubicFeetVariables(cubicFeet);
        setSelectedCountVariables(count);

        // Set variable values
        const values: Record<number, number> = {};
        proposalVariables.forEach((variable: any) => {
          values[variable.id] = variable.value || 0;
        });
        setVariableValues(values);
      }
    };

    loadProposal();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare proposal categories with elements
    const proposalCategories = [
      ...selectedCategories.map(category => ({
        name: category.name,
        elements: category.elements.map(element => {
          const elementId = element.id?.toString();
          const editedElement = elementId ? editedElements[category.id.toString()]?.[elementId] : element;
          return {
            name: element.name,
            material_cost: editedElement?.material_cost ?? element.material_cost,
            labor_cost: editedElement?.labor_cost ?? element.labor_cost
          };
        })
      })),
      ...customCategories.map(category => ({
        name: category.name,
        elements: category.elements.map(element => ({
          name: element.name,
          material_cost: element.material_cost,
          labor_cost: element.labor_cost
        }))
      }))
    ];

    // Prepare proposal variables with their values
    const proposalVariables = getAllSelectedVariables().map(variable => ({
      name: variable.name,
      category: variable.category,
      value: variableValues[variable.id] || 0
    }));

    const payload = {
      name: proposalName,
      description: proposalDescription,
      proposal_categories: proposalCategories,
      proposal_variables: proposalVariables,
      client_name: clientName,
      client_email: clientEmail,
    };

    try {
      const response = await fetch(`${API_URL}/proposals/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update proposal");
      }

      const data = await response.json();
      console.log("Success:", data);
      // You might want to redirect or show a success message here
    } catch (error) {
      console.error("Error updating proposal:", error);
      // Handle error (show error message, etc.)
    }
  };

  const handleAddElementToCustomCategory = (categoryIndex: number) => {
    if (newElement.name.trim()) {
      const updatedCategories = [...customCategories];
      if (!updatedCategories[categoryIndex].elements) {
        updatedCategories[categoryIndex].elements = [];
      }
      updatedCategories[categoryIndex].elements.push({
        name: newElement.name,
        material_cost: newElement.material_cost,
        labor_cost: newElement.labor_cost,
      });
      setCustomCategories(updatedCategories);
      setNewElement({ name: "", material_cost: 0, labor_cost: 0 });
    }
  };

  const handleRemoveElementFromCustomCategory = (categoryIndex: number, elementIndex: number) => {
    const updatedCategories = [...customCategories];
    updatedCategories[categoryIndex].elements.splice(elementIndex, 1);
    setCustomCategories(updatedCategories);
  };

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

        {/* Display selected variables with input fields */}
        {selectedVariables.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedVariables.map((variable) => (
              <div key={variable.id} className="flex items-center gap-2">
                <Badge variant="secondary" className="py-1 px-3 flex-1">
                  {variable.name}
                </Badge>
                <Input
                  type="number"
                  placeholder="Value"
                  value={variableValues[variable.id] || ""}
                  onChange={(e) => handleVariableValueChange(variable.id, e.target.value)}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted rounded-full"
                  onClick={() =>
                    handleRemoveSelectedVariable(variable.id, variable.category)
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Proposal</h1>
        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} variant="outline">Save Draft</Button>
          <Button>Send Proposal</Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Proposal Details</CardTitle>
                <CardDescription>
                  Basic information about your proposal
                </CardDescription>
              </div>
              <div className="space-y-2">
                <Select 
                  value={selectedTemplate} 
                  onValueChange={(value) => {
                    setSelectedTemplate(value);
                    handleTemplateSelect(value);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.templateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="proposal-name"
                  className="text-sm font-medium"
                >
                  Proposal Name
                </label>
                <Input 
                  id="proposal-name" 
                  placeholder="Enter proposal name" 
                  value={proposalName}
                  onChange={(e) => setProposalName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="proposal-description"
                  className="text-sm font-medium"
                >
                  Proposal Description
                </label>
                <Textarea 
                  id="proposal-description" 
                  placeholder="Enter proposal description" 
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                />
              </div>
            

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="client-name" className="text-sm font-medium">
                    Client Name
                  </label>
                  <Input 
                    id="client-name" 
                    placeholder="Enter client name" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="client-email" className="text-sm font-medium">
                    Client Email
                  </label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="Enter client email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Select and customize categories for your proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Select Categories</h3>

                {/* Combobox for selecting existing categories */}
                <Popover
                  open={openCategoryCombobox}
                  onOpenChange={setOpenCategoryCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategoryCombobox}
                      className="w-full justify-between mt-2"
                    >
                      Select a category
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
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

                {/* Display selected categories as badges */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedCategories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="py-1.5 px-3"
                      >
                        {category.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2 hover:bg-muted rounded-full"
                          onClick={() =>
                            handleRemoveSelectedCategory(category.id)
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {selectedCategories.length > 0 && (
                <div className="space-y-8 mt-6">
                  {selectedCategories.map((category) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">Elements for {category.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSelectedCategory(category.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
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
                              const elementId = element.id?.toString();
                              const categoryId = category.id.toString();
                              const editedElement = elementId ? editedElements[categoryId]?.[elementId] ?? element : element;
                              const total = editedElement.material_cost + editedElement.labor_cost;
                              return (
                                <tr key={element.id} className="border-b">
                                  <td className="p-2">{element.name}</td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={editedElement.material_cost}
                                      onChange={(e) => handleCostChange(category.id, element.id, 'material_cost', e.target.value)}
                                      className="w-32"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={editedElement.labor_cost}
                                      onChange={(e) => handleCostChange(category.id, element.id, 'labor_cost', e.target.value)}
                                      className="w-32"
                                    />
                                  </td>
                                  <td className="p-2">${total.toFixed(2)}</td>
                                </tr>
                              )})}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Add Custom Categories</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Category Name"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomCategory}
                    disabled={!newCategory.trim()}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Display custom categories with their elements */}
                {customCategories.length > 0 && (
                  <div className="space-y-6 mt-4">
                    {customCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-medium">{category.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomCategory(categoryIndex)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Add new element form */}
                        <div className="flex gap-2 mb-4">
                          <Input
                            placeholder="Element Name"
                            value={newElement.name}
                            onChange={(e) =>
                              setNewElement({ ...newElement, name: e.target.value })
                            }
                          />
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
                          <Button
                            type="button"
                            onClick={() => handleAddElementToCustomCategory(categoryIndex)}
                            disabled={!newElement.name.trim()}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Element
                          </Button>
                        </div>

                        {/* Elements table */}
                        {category.elements.length > 0 && (
                          <div className="rounded-md border">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="p-2 text-left">Element Name</th>
                                  <th className="p-2 text-left">Material Cost</th>
                                  <th className="p-2 text-left">Labor Cost</th>
                                  <th className="p-2 text-left">Total</th>
                                  <th className="p-2 text-left">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {category.elements.map((element, elementIndex) => {
                                  const total = element.material_cost + element.labor_cost;
                                  return (
                                    <tr key={elementIndex} className="border-b">
                                      <td className="p-2">{element.name}</td>
                                      <td className="p-2">${element.material_cost.toFixed(2)}</td>
                                      <td className="p-2">${element.labor_cost.toFixed(2)}</td>
                                      <td className="p-2">${total.toFixed(2)}</td>
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
                                          className="h-8 w-8 p-0"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
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

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variables</CardTitle>
              <CardDescription>
                Select and customize variables for your proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium mb-4">
                Select Variables by Type
              </h3>

              <div className="grid grid-cols-4 gap-4">
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
                  />
                  <Select
                    value={newVariable.category}
                    onValueChange={(value) =>
                      setNewVariable({ ...newVariable, category: value })
                    }
                  >
                    <SelectTrigger>
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
                    type="button"
                    onClick={handleAddCustomVariable}
                    disabled={!newVariable.name.trim()}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Display custom added variables with input fields */}
                {customVariables.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {customVariables.map((variable, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="py-1 px-3 flex-1 flex items-center">
                          <span>{variable.name}</span>
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded ml-2">
                            {variable.category}
                          </span>
                        </Badge>
                        <Input
                          type="number"
                          placeholder="Value"
                          value={variableValues[variable.id] || ""}
                          onChange={(e) => handleVariableValueChange(variable.id, e.target.value)}
                          className="w-32"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted rounded-full"
                          onClick={() => handleRemoveCustomVariable(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Preview</CardTitle>
              <CardDescription>
                Preview your proposal before sending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <h1>{proposalName || "Project Proposal"}</h1>
                <p>
                  Prepared for <strong>{clientName || "Client Name"}</strong> on{" "}
                  <strong>{new Date().toLocaleDateString()}</strong>.
                </p>
                
                <h2>Project Description</h2>
                <p>{proposalDescription || "This proposal outlines the services to be provided."}</p>
                
                {selectedCategories.length > 0 && (
                  <>
                    <h2>Categories</h2>
                    {selectedCategories.map(category => (
                      <div key={category.id} className="mb-6">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Element</th>
                              <th className="text-left py-2">Material Cost</th>
                              <th className="text-left py-2">Labor Cost</th>
                              <th className="text-left py-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.elements.map((element, idx) => {
                              const elementId = element.id?.toString();
                              const categoryId = category.id.toString();
                              const editedElement = elementId ? editedElements[categoryId]?.[elementId] ?? element : element;
                              const total = editedElement.material_cost + editedElement.labor_cost;
                              return (
                                <tr key={idx} className="border-b">
                                  <td className="py-2">{element.name}</td>
                                  <td className="py-2">${editedElement.material_cost.toFixed(2)}</td>
                                  <td className="py-2">${editedElement.labor_cost.toFixed(2)}</td>
                                  <td className="py-2">${total.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </>
                )}

                {customCategories.length > 0 && (
                  <>
                    <h2>Custom Categories</h2>
                    {customCategories.map((category, idx) => (
                      <div key={idx} className="mb-6">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        {category.elements.length > 0 && (
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Element</th>
                                <th className="text-left py-2">Material Cost</th>
                                <th className="text-left py-2">Labor Cost</th>
                                <th className="text-left py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {category.elements.map((element, elIdx) => {
                                const total = element.material_cost + element.labor_cost;
                                return (
                                  <tr key={elIdx} className="border-b">
                                    <td className="py-2">{element.name}</td>
                                    <td className="py-2">${element.material_cost.toFixed(2)}</td>
                                    <td className="py-2">${element.labor_cost.toFixed(2)}</td>
                                    <td className="py-2">${total.toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ))}
                  </>
                )}

                <h2>Variables</h2>
                <div className="grid grid-cols-2 gap-4">
                  {selectedLinearFeetVariables.length > 0 && (
                    <div>
                      <h3 className="font-medium">Linear Feet</h3>
                      <ul className="space-y-1">
                        {selectedLinearFeetVariables.map((variable) => (
                          <li key={variable.id}>
                            {variable.name}: {variableValues[variable.id] || 0}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedSquareFeetVariables.length > 0 && (
                    <div>
                      <h3 className="font-medium">Square Feet</h3>
                      <ul className="space-y-1">
                        {selectedSquareFeetVariables.map((variable) => (
                          <li key={variable.id}>
                            {variable.name}: {variableValues[variable.id] || 0}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedCubicFeetVariables.length > 0 && (
                    <div>
                      <h3 className="font-medium">Cubic Feet</h3>
                      <ul className="space-y-1">
                        {selectedCubicFeetVariables.map((variable) => (
                          <li key={variable.id}>
                            {variable.name}: {variableValues[variable.id] || 0}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedCountVariables.length > 0 && (
                    <div>
                      <h3 className="font-medium">Count</h3>
                      <ul className="space-y-1">
                        {selectedCountVariables.map((variable) => (
                          <li key={variable.id}>
                            {variable.name}: {variableValues[variable.id] || 0}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {customVariables.length > 0 && (
                    <div>
                      <h3 className="font-medium">Custom Variables</h3>
                      <ul className="space-y-1">
                        {customVariables.map((variable, idx) => (
                          <li key={idx}>
                            {variable.name} ({variable.category}): {variableValues[variable.id] || 0}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Download as PDF</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}