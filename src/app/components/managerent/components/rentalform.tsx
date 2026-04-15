'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

  // Fetch user's full name on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch current user info from API
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
        
        // Use full_name if available, otherwise use email
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
      // Create preview
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

      // Use FormData to handle file uploads
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('price', formData.price.toString())
      submitData.append('published_by', formData.published_by)
      
      // Add the file if selected, otherwise send preview as base64
      if (imageFile) {
        submitData.append('image', imageFile)
      } else if (imagePreview && !imageFile) {
        // Keep existing image for edit mode
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

      // Success - redirect to manage page
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('../dashboard') // Navigate back to the manage rentals page
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

  // Show loading state while fetching user profile
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-green-500 animate-spin"></div>
          </div>
          <p className="text-green-700 font-medium mt-4">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-white">RM</span>
          </div>
          <h1 className="text-4xl font-bold text-amber-900">{pageTitle}</h1>
        </div>
        <p className="text-amber-700 text-lg">Fill in the details below to {mode === 'add' ? 'create a new rental' : 'update this rental'}</p>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border-2 border-green-100 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-800 font-medium flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-amber-900 font-bold text-sm mb-2">
              Rental Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Summer Magazine Collection"
              required
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition-all"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-amber-900 font-bold text-sm mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the magazine rental details, condition, contents..."
              required
              rows={5}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition-all resize-none"
            />
          </div>

          {/* Price Field */}
          <div>
            <label htmlFor="price" className="block text-amber-900 font-bold text-sm mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition-all"
            />
          </div>

          {/* Published By / Location Field (Auto-filled from User Profile) */}
          <div>
            <label htmlFor="published_by" className="block text-amber-900 font-bold text-sm mb-2">
              Publisher / Your Name
            </label>
            <input
              type="text"
              id="published_by"
              name="published_by"
              value={formData.published_by}
              onChange={handleChange}
              placeholder="Loaded from your profile..."
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition-all bg-green-50 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-600 mt-1">Automatically filled from your profile</p>
          </div>

          {/* Image Upload Field */}
          <div>
            <label htmlFor="image" className="block text-amber-900 font-bold text-sm mb-2">
              Upload Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 transition-all cursor-pointer"
            />
            <p className="text-xs text-gray-600 mt-1">Supported formats: JPG, PNG, GIF, WebP. Max 5MB</p>
            {imagePreview && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-amber-900 font-medium mb-2">Image Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className={`flex-1 px-6 py-3 font-bold rounded-lg transition-colors shadow-md text-white ${
                submitting || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              }`}
            >
              {submitting ? 'Processing...' : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
