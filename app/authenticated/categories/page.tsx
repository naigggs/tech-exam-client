'use client'

import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddCategoryModal } from '@/components/authenticated/AddCategoryModal'
import { EditCategoryModal } from '@/components/authenticated/EditCategoryModal'

interface Category {
  id: string
  name: string
  elements: {
    id: string
    name: string
    material_cost: number
    labor_cost: number
  }[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/proposal-categories`)
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/proposal-categories/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete category')
      }
      await fetchCategories()
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  if (loading) {
    return <div>Loading categories...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <AddCategoryModal onSuccess={fetchCategories} />
      </div>
      <AlertDialog>
        <Accordion type="single" collapsible className="w-full">
          {categories.map((category) => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center justify-between w-full">
                  <span>{category.name}</span>
                  <div className="flex items-center gap-2">
                    <EditCategoryModal 
                      category={category} 
                      onSuccess={fetchCategories}
                      trigger={
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => e.stopPropagation()}
                          className="ml-4"
                        >
                          Edit
                        </Button>
                      }
                    />
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(category.id)
                        }}
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Material Cost</TableHead>
                      <TableHead className="text-right">Labor Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.elements.map((element) => (
                      <TableRow key={element.id}>
                        <TableCell className="font-medium">{element.name}</TableCell>
                        <TableCell className="text-right text-green-600">
                          ${element.material_cost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          ${element.labor_cost.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category and all its elements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteCategory(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}