'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, X } from "lucide-react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Element {
  id?: string;
  name: string;
  material_cost: number;
  labor_cost: number;
}

interface AddCategoryModalProps {
  onSuccess?: () => void;
}

export function AddCategoryModal({ onSuccess }: AddCategoryModalProps) {
  const [open, setOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [elements, setElements] = useState<Element[]>([])
  const [existingElements, setExistingElements] = useState<Element[]>([])
  const [comboboxOpen, setComboboxOpen] = useState(false)

  useEffect(() => {
    const fetchElements = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposal-elements`)
        if (response.ok) {
          const data = await response.json()
          setExistingElements(data)
        }
      } catch (error) {
        console.error('Error fetching elements:', error)
      }
    }
    fetchElements()
  }, [])

  const handleAddElement = () => {
    setElements([...elements, { name: '', material_cost: 0, labor_cost: 0 }])
  }

  const handleAddExistingElement = (element: Element) => {
    // Check if element is already added
    if (!elements.some(e => e.id === element.id)) {
      setElements([...elements, { ...element }])
    }
    setComboboxOpen(false)
  }

  const handleElementChange = (index: number, field: keyof Element, value: string | number) => {
    const newElements = [...elements]
    if (field === 'material_cost' || field === 'labor_cost') {
      newElements[index][field] = Number(value) || 0
    } else {
      newElements[index][field] = value as string
    }
    setElements(newElements)
  }

  const handleRemoveElement = (index: number) => {
    setElements(elements.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposal-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName,
          elements: elements.map(({ id, ...element }) => element) // Remove id from existing elements
        }),
      })

      if (response.ok) {
        setOpen(false)
        setCategoryName('')
        setElements([])
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Category</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Elements</Label>
              <div className="flex gap-2">
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add Existing Element
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Search elements..." />
                      <CommandEmpty>No element found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {existingElements.map((element) => (
                          <CommandItem
                            key={element.id}
                            value={element.name}
                            onSelect={() => handleAddExistingElement(element)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                elements.some(e => e.id === element.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {element.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button type="button" variant="outline" size="sm" onClick={handleAddElement}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Element
                </Button>
              </div>
            </div>

            {elements.map((element, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => handleRemoveElement(index)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="grid gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={element.name}
                      onChange={(e) => handleElementChange(index, 'name', e.target.value)}
                      placeholder="Element name"
                      disabled={!!element.id} // Keep name field disabled for existing elements
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Material Cost ($)</Label>
                      <Input
                        type="number"
                        value={element.material_cost}
                        onChange={(e) => handleElementChange(index, 'material_cost', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Labor Cost ($)</Label>
                      <Input
                        type="number"
                        value={element.labor_cost}
                        onChange={(e) => handleElementChange(index, 'labor_cost', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!categoryName || elements.length === 0}>
            Add Category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}