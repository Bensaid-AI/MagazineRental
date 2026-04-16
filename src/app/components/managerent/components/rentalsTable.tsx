"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, X, Loader2 } from "lucide-react";

interface Rental {
  id: string;
  title: string;
  description: string;
  price: string | number;
  published_by: string;
  image_url: string;
}

interface RentalsTableProps {
  rentals: Rental[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onFormSubmit?: () => void;
  showAddForm?: boolean;
  onAddFormClose?: () => void;
}

export function RentalsTable({ rentals, onEdit, onDelete, onFormSubmit, showAddForm = false, onAddFormClose }: RentalsTableProps) {
  const [selectedImage, setSelectedImage] = useState<{url: string; title: string} | null>(null);
  const [formModal, setFormModal] = useState<{mode: 'add' | 'edit', id?: string} | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{fullname: string} | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    published_by: '',
  });

  // Load form data when modal opens for edit
  useEffect(() => {
    if (formModal?.mode === 'edit' && formModal?.id) {
      const rental = rentals.find(r => r.id === formModal.id);
      if (rental) {
        setFormData({
          title: rental.title,
          description: rental.description,
          price: rental.price.toString(),
          published_by: rental.published_by,
        });
        setImagePreview(rental.image_url);
      }
    } else if (formModal?.mode === 'add') {
      resetForm();
      loadUserProfile();
    }
  }, [formModal]);

  // Handle showAddForm prop from parent
  useEffect(() => {
    if (showAddForm) {
      setFormModal({mode: 'add'});
    }
  }, [showAddForm]);

  const loadUserProfile = async () => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const result = await response.json();
        const fullName = result.user?.fullname || result.user?.email || 'Unknown User';
        setUserProfile({fullname: fullName});
        setFormData(prev => ({
          ...prev,
          published_by: fullName
        }));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '', published_by: '' });
    setImageFile(null);
    setImagePreview(null);
    setFormError('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const url = formModal?.mode === 'add' ? '/api/managerentals' : `/api/managerentals/${formModal?.id}`;
      const method = formModal?.mode === 'add' ? 'POST' : 'PUT';

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('published_by', formData.published_by);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (imagePreview && !imageFile && formModal?.mode === 'add') {
        submitData.append('image_url', imagePreview);
      }

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${formModal?.mode} rental`);
      }

      setFormModal(null);
      resetForm();
      if (onFormSubmit) onFormSubmit();
      if (onAddFormClose) onAddFormClose();
    } catch (err: any) {
      setFormError(err.message || `Error ${formModal?.mode === 'add' ? 'adding' : 'updating'} rental`);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-20 text-gray-700 font-semibold">Image</TableHead>
              <TableHead className="w-24 text-gray-700 font-semibold">Rental ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">Title</TableHead>
              <TableHead className="w-24 text-gray-700 font-semibold">Price</TableHead>
              <TableHead className="w-32 text-gray-700 font-semibold">Publisher</TableHead>
              <TableHead className="w-20 text-center text-gray-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentals.map((rental) => (
              <TableRow key={rental.id} className="hover:bg-gray-50/50 border-gray-200">
                <TableCell className="py-4">
                  <img
                    src={rental.image_url}
                    alt={rental.title}
                    className="w-16 h-16 object-cover rounded transition-transform duration-300 hover:scale-125 cursor-pointer"
                    onClick={() => setSelectedImage({ url: rental.image_url, title: rental.title })}
                  />
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-700">
                  {rental.id}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-800">{rental.title}</span>
                    <span className="text-xs text-gray-500">{rental.description.substring(0, 40)}...</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-semibold text-gray-800">
                  ${rental.price}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {rental.published_by}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormModal({mode: 'edit', id: rental.id})}
                      className="text-gray-400 hover:text-blue-600 hover:bg-transparent"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this rental?')) {
                          onDelete(rental.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 hover:bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">{selectedImage.title}</h3>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="flex items-center justify-center py-6 px-6 bg-gray-50">
              <img 
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full h-auto max-h-96 object-cover rounded"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
              <Button 
                variant="ghost"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {formModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => !formSubmitting && setFormModal(null) && onAddFormClose?.()}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h3 className="text-lg font-semibold text-gray-800">
                {formModal.mode === 'add' ? 'Add New Rental' : 'Edit Rental'}
              </h3>
              <button 
                onClick={() => {
                  if (!formSubmitting) {
                    setFormModal(null);
                    onAddFormClose?.();
                  }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                disabled={formSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{formError}</p>
                </div>
              )}

              {formLoading && formModal.mode === 'add' ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="form-title" className="mb-2">
                      Rental Title *
                    </Label>
                    <Input
                      id="form-title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      placeholder="e.g., Summer Magazine Collection"
                      required
                      disabled={formSubmitting}
                      className="border-gray-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="form-description" className="mb-2">
                      Description *
                    </Label>
                    <Textarea
                      id="form-description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Describe the rental details..."
                      required
                      disabled={formSubmitting}
                      className="border-gray-200 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="form-price" className="mb-2">
                      Price ($) *
                    </Label>
                    <Input
                      id="form-price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      disabled={formSubmitting}
                      className="border-gray-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="form-publisher" className="mb-2">
                      Publisher
                    </Label>
                    <Input
                      id="form-publisher"
                      type="text"
                      name="published_by"
                      value={formData.published_by}
                      onChange={handleFormChange}
                      disabled
                      className="border-gray-200 bg-gray-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="form-image" className="mb-2">
                      Upload Image
                    </Label>
                    <Input
                      id="form-image"
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={formSubmitting}
                      className="border-gray-200 cursor-pointer"
                    />
                  </div>

                  {imagePreview && (
                    <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-700 font-medium mb-2">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  )}

                  {/* Footer Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormModal(null);
                        onAddFormClose?.();
                      }}
                      disabled={formSubmitting}
                      className="flex-1 text-gray-700 border-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={formSubmitting}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      {formSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {formSubmitting ? 'Processing...' : (formModal.mode === 'add' ? 'Add Rental' : 'Update Rental')}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}