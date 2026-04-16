'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'

interface RentalFormProps {
  mode: 'add' | 'edit'
  initialData?: {
    id?: string
    title?: string
    description?: string
    price?: string | number
    published_by?: string
    image_url?: string
  }
  onSuccess?: () => void
}

export default function RentalForm({ mode, initialData, onSuccess }: RentalFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    published_by: initialData?.published_by || '',
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/auth/user`)
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in to continue')
          } else {
            throw new Error('Failed to fetch user')
          }
          return
        }

        const result = await response.json()
        const fullName = result.user?.fullname || result.user?.email || 'Unknown User'
        
        setFormData(prev => ({
          ...prev,
          published_by: fullName
        }))
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Failed to load your profile information')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const url = mode === 'add' ? '/api/managerentals' : `/api/managerentals/${initialData?.id}`
      const method = mode === 'add' ? 'POST' : 'PUT'

      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('price', formData.price.toString())
      submitData.append('published_by', formData.published_by)
      
      if (imageFile) {
        submitData.append('image', imageFile)
      } else if (imagePreview && !imageFile) {
        submitData.append('image_url', imagePreview)
      }

      const response = await fetch(url, {
        method,
        body: submitData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${mode} rental`)
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('../dashboard')
      }
    } catch (err: any) {
      setError(err.message || `Error ${mode === 'add' ? 'adding' : 'updating'} rental`)
      console.error(`Error ${mode} rental:`, err)
    } finally {
      setSubmitting(false)
    }
  }

  const pageTitle = mode === 'add' ? 'Add New Rental' : 'Edit Rental'
  const buttonText = mode === 'add' ? 'Add Rental' : 'Update Rental'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-gray-600 mt-2">Fill in the details below to {mode === 'add' ? 'create a new rental' : 'update this rental'}</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="mb-2 block">
                  Rental Title *
                </Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Summer Magazine Collection"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2 block">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the magazine rental details, condition, contents..."
                  required
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="price" className="mb-2 block">
                  Price ($) *
                </Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="published_by" className="mb-2 block">
                  Publisher / Your Name
                </Label>
                <Input
                  type="text"
                  id="published_by"
                  name="published_by"
                  value={formData.published_by}
                  onChange={handleChange}
                  placeholder="Loaded from your profile..."
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Automatically filled from your profile</p>
              </div>

              <div>
                <Label htmlFor="image" className="mb-2 block">
                  Upload Image
                </Label>
                <Input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF, WebP. Max 5MB</p>
                {imagePreview && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 font-medium mb-2">Image Preview:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || loading}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {submitting ? 'Processing...' : buttonText}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
